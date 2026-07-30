-- Sunny MVP 1.1 — group reservations and companions
--
-- ⚠️  THIS MIGRATION REWRITES HOW CAPACITY IS ENFORCED.
--
-- It is the dangerous half of the MVP 1.1 schema work and is deliberately
-- separate from 20260201000000 (which is purely additive). Read
-- SUNNY_COMPANIONS_MIGRATION_PLAN.md before applying it, and apply it to an
-- isolated environment first — a Supabase branch or a throwaway project —
-- never straight to the shared project.
--
-- THE BUG THIS FIXES
--
-- Today `claim_reservation()` and `reserved_counts_for_experiences()` count
-- ROWS. A reservation is one row, so one row = one spot. The moment a
-- reservation can cover two or three people, counting rows silently
-- understates occupancy and an experience with capacity 10 can be sold to
-- 30 people. Adding a party-size selector to the UI *without* this
-- migration would create exactly that overbooking bug, which is why the two
-- were never split.
--
-- After this migration every count is `sum(party_size)`, and the capacity
-- check is made inside the same transaction that holds the row lock, so two
-- concurrent claims for the last spots cannot both win.
--
-- BACKWARD COMPATIBILITY
--
-- `party_size` defaults to 1 and is NOT NULL, so every reservation that
-- already exists keeps meaning exactly what it has always meant: one
-- person. No backfill is required and no historical row changes.

begin;

-- Schema --------------------------------------------------------------------

-- How many people ONE reservation may cover, chosen per experience by Emmy.
-- Defaults to 1: group size is always opt-in, never the default
-- (decision 8 in SUNNY_MVP_1_1_DECISIONS.md). Hard ceiling of 3 for the MVP
-- (decision 4 / 15) enforced here, not only in the app.
alter table public.experiences
  add column if not exists max_party_size integer not null default 1
  constraint experiences_max_party_size_check check (max_party_size between 1 and 3);

-- How many people THIS reservation covers, holder included.
alter table public.reservations
  add column if not exists party_size integer not null default 1
  constraint reservations_party_size_check check (party_size between 1 and 3);

-- Companions are relational (decision 1), captured at reservation time
-- (decision 3), with no post-hoc editing in the MVP. Full name required,
-- email optional (decision 2 / 5 / 6). They need no account and consume no
-- pass of their own (decision 6 / 12).
create table if not exists public.reservation_companions (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  email text,
  -- Mirrors the holder's reservation status. Per-companion attendance
  -- (decision 7) is recorded here; group cancellation is all-or-nothing
  -- (decision 5), enforced by the trigger below.
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at timestamptz not null default now()
);

create index if not exists reservation_companions_reservation_id_idx
  on public.reservation_companions (reservation_id);

alter table public.reservation_companions enable row level security;

-- A holder may read their own group; admins read everything. Nobody writes
-- directly: rows are created inside claim_reservation(), which is
-- security definer. There is deliberately no INSERT/UPDATE/DELETE policy
-- for regular users — that is what makes "no editing after the fact" real
-- rather than a UI convention.
create policy "reservation_companions_select_own" on public.reservation_companions
  for select using (
    exists (
      select 1 from public.reservations r
      where r.id = reservation_companions.reservation_id and r.user_id = auth.uid()
    )
  );

create policy "reservation_companions_select_admin" on public.reservation_companions
  for select using (public.is_admin());

create policy "reservation_companions_update_admin" on public.reservation_companions
  for update using (public.is_admin());

-- Cancellation is all-or-nothing (decision 5): cancelling the holder's
-- reservation cancels every companion in the same statement, so the two can
-- never drift apart regardless of which code path did the cancelling.
create or replace function public.sync_companion_cancellation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.reservation_companions
    set status = 'cancelled'
    where reservation_id = new.id and status <> 'cancelled';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_companions_on_cancel on public.reservations;
create trigger sync_companions_on_cancel
  after update of status on public.reservations
  for each row execute function public.sync_companion_cancellation();

-- Counting people, not rows -------------------------------------------------

-- Public read of occupancy. Returns PEOPLE.
--
-- The return type stays `integer`, matching 20260101000800. Postgres cannot
-- change a function's return type with CREATE OR REPLACE, so widening this
-- to bigint would fail the migration outright ("cannot change return type of
-- existing function") — the sum is cast back to int instead. Capacity is
-- bounded at 1000 per experience, so there is no overflow risk.
--
-- `coalesce(sum(...), 0)` matters: sum() over zero rows is NULL, not 0.
create or replace function public.reserved_counts_for_experiences(p_experience_ids uuid[])
returns table (experience_id uuid, reserved_count integer)
language sql
stable
security definer
set search_path = public
as $$
  select e.id as experience_id,
         coalesce(sum(r.party_size), 0)::int as reserved_count
  from unnest(p_experience_ids) as e(id)
  left join public.reservations r
    on r.experience_id = e.id
   and r.status in ('confirmed', 'attended', 'no_show')
  group by e.id;
$$;

-- The single source of truth for claiming a pass, rewritten for groups.
--
-- Unchanged guarantees: runs as the migration owner so it bypasses RLS and
-- is the only sanctioned way to insert a reservation; locks the experience
-- row for the transaction so concurrent claims serialize; re-validates every
-- rule server-side.
--
-- New: validates party_size against the experience's max_party_size, checks
-- capacity in PEOPLE, and writes the companions atomically with the
-- reservation — so a failure leaves no half-built group.
--
-- ⚠️  The old two-argument claim_reservation(uuid, text) MUST be dropped, not
-- merely replaced. Adding parameters creates an OVERLOAD: the original
-- function would survive, keep its `execute` grant to `authenticated`, and
-- keep counting rows. Any caller still invoking the 2-arg form — a stale
-- client bundle, a hand-rolled request — would bypass every group check and
-- reintroduce exactly the overbooking this migration exists to prevent.
drop function if exists public.claim_reservation(uuid, text);

create or replace function public.claim_reservation(
  p_experience_id uuid,
  p_source text default null,
  p_party_size integer default 1,
  p_companions jsonb default '[]'::jsonb
)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_experience public.experiences;
  v_profile public.profiles;
  v_week_start date;
  v_reserved_people integer;
  v_folio text;
  v_reservation public.reservations;
  v_companion jsonb;
  v_companion_count integer;
  v_name text;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '28000';
  end if;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_profile.adult_confirmed_at is null or v_profile.full_name is null or length(trim(v_profile.full_name)) = 0 then
    raise exception 'PROFILE_INCOMPLETE' using errcode = 'P0001';
  end if;

  -- Row lock: serializes concurrent claims against the same experience.
  select * into v_experience from public.experiences where id = p_experience_id for update;
  if not found then
    raise exception 'EXPERIENCE_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_experience.status <> 'published' then
    raise exception 'EXPERIENCE_NOT_PUBLISHED' using errcode = 'P0001';
  end if;
  if v_experience.archived_at is not null then
    raise exception 'EXPERIENCE_NOT_PUBLISHED' using errcode = 'P0001';
  end if;
  if now() < v_experience.claim_opens_at or now() > v_experience.claim_closes_at then
    raise exception 'CLAIM_WINDOW_CLOSED' using errcode = 'P0001';
  end if;
  if v_experience.starts_at <= now() then
    raise exception 'EXPERIENCE_PAST' using errcode = 'P0001';
  end if;

  -- Party size ---------------------------------------------------------------
  if p_party_size is null or p_party_size < 1 then
    raise exception 'INVALID_PARTY_SIZE' using errcode = 'P0001';
  end if;
  if p_party_size > v_experience.max_party_size then
    raise exception 'PARTY_SIZE_TOO_LARGE' using errcode = 'P0001';
  end if;

  -- Companion names are mandatory (decision 2) and must account for exactly
  -- the party beyond the holder: party_size 3 means the holder plus two
  -- named people. Anything else is rejected rather than silently padded,
  -- because the count is what gets subtracted from capacity.
  v_companion_count := coalesce(jsonb_array_length(p_companions), 0);
  if v_companion_count <> p_party_size - 1 then
    raise exception 'COMPANION_COUNT_MISMATCH' using errcode = 'P0001';
  end if;

  for v_companion in select * from jsonb_array_elements(p_companions) loop
    v_name := trim(coalesce(v_companion->>'full_name', ''));
    if length(v_name) = 0 then
      raise exception 'COMPANION_NAME_REQUIRED' using errcode = 'P0001';
    end if;
  end loop;

  -- Capacity, in PEOPLE ------------------------------------------------------
  select coalesce(sum(party_size), 0) into v_reserved_people
  from public.reservations
  where experience_id = p_experience_id
    and status in ('confirmed', 'attended', 'no_show');

  if v_reserved_people + p_party_size > v_experience.capacity then
    raise exception 'EXPERIENCE_SOLD_OUT' using errcode = 'P0001';
  end if;

  -- Weekly pass --------------------------------------------------------------
  v_week_start := (date_trunc('week', (now() at time zone 'America/Monterrey')))::date;

  if exists (
    select 1 from public.reservations
    where user_id = v_user_id
      and week_start = v_week_start
      and status in ('confirmed', 'attended', 'no_show')
  ) then
    raise exception 'WEEKLY_PASS_ALREADY_USED' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.reservations
    where user_id = v_user_id
      and experience_id = p_experience_id
      and status in ('confirmed', 'attended', 'no_show')
  ) then
    raise exception 'ALREADY_RESERVED_EXPERIENCE' using errcode = 'P0001';
  end if;

  v_folio := public.generate_folio();

  insert into public.reservations (experience_id, user_id, folio, week_start, status, source, reserved_at, party_size)
  values (p_experience_id, v_user_id, v_folio, v_week_start, 'confirmed', p_source, now(), p_party_size)
  returning * into v_reservation;

  -- Same transaction: a failure here rolls the reservation back too, so a
  -- group is never half-created.
  for v_companion in select * from jsonb_array_elements(p_companions) loop
    insert into public.reservation_companions (reservation_id, full_name, email)
    values (
      v_reservation.id,
      trim(v_companion->>'full_name'),
      nullif(trim(coalesce(v_companion->>'email', '')), '')
    );
  end loop;

  return v_reservation;
end;
$$;

-- Attendance for a whole group. Marking the holder marks the companions,
-- so the two views cannot disagree.
create or replace function public.admin_set_attendance(p_reservation_id uuid, p_status text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation public.reservations;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_status not in ('attended', 'no_show') then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;

  update public.reservations
  set status = p_status,
      checked_in_at = case when p_status = 'attended' then now() else checked_in_at end
  where id = p_reservation_id
  returning * into v_reservation;

  if not found then
    raise exception 'RESERVATION_NOT_FOUND' using errcode = 'P0002';
  end if;

  update public.reservation_companions
  set status = p_status
  where reservation_id = p_reservation_id and status not in ('cancelled');

  return v_reservation;
end;
$$;

-- Grants --------------------------------------------------------------------
-- The new claim_reservation signature needs its own grant: the grant from
-- 20260101000800 belonged to the 2-arg function that was just dropped.
grant execute on function public.claim_reservation(uuid, text, integer, jsonb) to authenticated;

-- reserved_counts_for_experiences and admin_set_attendance kept their
-- signatures, so their existing grants still apply. Re-asserted here so this
-- file is self-contained if replayed on a fresh database.
grant execute on function public.reserved_counts_for_experiences(uuid[]) to anon, authenticated;
grant execute on function public.admin_set_attendance(uuid, text) to authenticated;

commit;

-- Rollback ------------------------------------------------------------------
-- Restores row-counting behaviour. Only safe while no reservation has
-- party_size > 1: dropping the column would silently turn a group of three
-- into a single spot and the experience would look under-booked. Check
-- first with:
--
--   select count(*) from public.reservations where party_size > 1;
--
-- If that returns 0:
--
-- begin;
-- drop trigger if exists sync_companions_on_cancel on public.reservations;
-- drop function if exists public.sync_companion_cancellation();
-- drop table if exists public.reservation_companions;
-- alter table public.reservations drop column if exists party_size;
-- alter table public.experiences drop column if exists max_party_size;
-- -- then re-apply the original definitions of claim_reservation(),
-- -- reserved_counts_for_experiences() and admin_set_attendance() from
-- -- supabase/migrations/20260101000600_functions.sql.
-- commit;
