-- Folio generator: SUN-<year>-<6 alphanumeric>, e.g. SUN-2026-AB12CD.
create or replace function public.generate_folio()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_folio text;
  v_year text := to_char(now() at time zone 'America/Monterrey', 'YYYY');
  v_exists boolean;
begin
  loop
    v_folio := 'SUN-' || v_year || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    select exists(select 1 from public.reservations where folio = v_folio) into v_exists;
    exit when not v_exists;
  end loop;
  return v_folio;
end;
$$;

-- The single source of truth for claiming a weekly pass. Runs as the
-- (superuser-owned) migration role, so it bypasses RLS on reservations —
-- this is the ONLY sanctioned way to insert a reservation. Locks the
-- experience row for the duration of the transaction so two concurrent
-- claims for the last spot cannot both succeed (no overbooking), and
-- re-validates every business rule server-side (never trust the client).
create or replace function public.claim_reservation(
  p_experience_id uuid,
  p_source text default null
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
  v_reserved_count integer;
  v_folio text;
  v_reservation public.reservations;
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
  if now() < v_experience.claim_opens_at or now() > v_experience.claim_closes_at then
    raise exception 'CLAIM_WINDOW_CLOSED' using errcode = 'P0001';
  end if;
  if v_experience.starts_at <= now() then
    raise exception 'EXPERIENCE_PAST' using errcode = 'P0001';
  end if;

  select count(*) into v_reserved_count
  from public.reservations
  where experience_id = p_experience_id
    and status in ('confirmed', 'attended', 'no_show');

  if v_reserved_count >= v_experience.capacity then
    raise exception 'EXPERIENCE_SOLD_OUT' using errcode = 'P0001';
  end if;

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

  insert into public.reservations (experience_id, user_id, folio, week_start, status, source, reserved_at)
  values (p_experience_id, v_user_id, v_folio, v_week_start, 'confirmed', p_source, now())
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- User-initiated cancellation. Only allowed >= 12h before starts_at.
create or replace function public.cancel_reservation(p_reservation_id uuid)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation public.reservations;
  v_experience public.experiences;
begin
  if v_user_id is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '28000';
  end if;

  select * into v_reservation from public.reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'RESERVATION_NOT_FOUND' using errcode = 'P0002';
  end if;
  if v_reservation.user_id <> v_user_id then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if v_reservation.status <> 'confirmed' then
    raise exception 'RESERVATION_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  select * into v_experience from public.experiences where id = v_reservation.experience_id;

  if v_experience.starts_at - interval '12 hours' <= now() then
    raise exception 'CANCELLATION_WINDOW_CLOSED' using errcode = 'P0001';
  end if;

  update public.reservations
  set status = 'cancelled', cancelled_at = now()
  where id = p_reservation_id
  returning * into v_reservation;

  return v_reservation;
end;
$$;

-- Admin-only, no 12h restriction.
create or replace function public.admin_cancel_reservation(p_reservation_id uuid)
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

  update public.reservations
  set status = 'cancelled', cancelled_at = now()
  where id = p_reservation_id and status = 'confirmed'
  returning * into v_reservation;

  if not found then
    raise exception 'RESERVATION_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  return v_reservation;
end;
$$;

-- Cascading cancellation: cancels the experience and every confirmed
-- reservation on it atomically, so every affected user recovers their pass.
create or replace function public.admin_cancel_experience(p_experience_id uuid)
returns setof public.reservations
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.experiences
  set status = 'cancelled'
  where id = p_experience_id;

  return query
    update public.reservations
    set status = 'cancelled', cancelled_at = now()
    where experience_id = p_experience_id and status = 'confirmed'
    returning *;
end;
$$;

-- Admin marks post-event attendance.
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

  return v_reservation;
end;
$$;
