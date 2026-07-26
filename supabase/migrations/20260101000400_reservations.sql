create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  folio text not null unique,
  week_start date not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended', 'no_show')),
  source text,
  reserved_at timestamptz not null default now(),
  cancelled_at timestamptz,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_experience_id_idx on public.reservations (experience_id);
create index reservations_user_id_idx on public.reservations (user_id);
create index reservations_status_idx on public.reservations (status);
create index reservations_week_start_idx on public.reservations (week_start);

-- "confirmed", "attended" and "no_show" all consume the weekly pass — only
-- these statuses count toward the one-active-reservation-per-week rule.
create unique index reservations_one_active_pass_per_week
  on public.reservations (user_id, week_start)
  where status in ('confirmed', 'attended', 'no_show');

-- A user cannot hold more than one non-cancelled reservation for the same
-- experience (defense in depth — also checked inside claim_reservation()).
create unique index reservations_one_active_per_experience
  on public.reservations (user_id, experience_id)
  where status in ('confirmed', 'attended', 'no_show');

create trigger set_reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();
