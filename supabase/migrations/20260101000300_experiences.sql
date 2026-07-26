-- Note: "sold_out" and "completed" are derived at read time from
-- capacity/reservation counts and ends_at (see PRODUCT_SPEC.md §11), so
-- they are intentionally not part of the status check constraint below.
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  category text not null check (category in ('movimiento', 'recovery', 'food_coffee', 'outdoor', 'comunidad')),
  image_url text,
  location_name text,
  address text,
  maps_url text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  claim_opens_at timestamptz not null default now(),
  claim_closes_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  featured boolean not null default false,
  what_is_included text[] not null default '{}',
  requirements text[] not null default '{}',
  restrictions text[] not null default '{}',
  instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experiences_claim_window_check check (claim_closes_at <= starts_at),
  constraint experiences_dates_check check (ends_at >= starts_at)
);

create index experiences_business_id_idx on public.experiences (business_id);
create index experiences_status_idx on public.experiences (status);
create index experiences_starts_at_idx on public.experiences (starts_at);
create index experiences_category_idx on public.experiences (category);
create index experiences_featured_idx on public.experiences (featured);

create trigger set_experiences_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();
