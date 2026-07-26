create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text check (category in ('movimiento', 'recovery', 'food_coffee', 'outdoor', 'comunidad')),
  logo_url text,
  instagram_url text,
  maps_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_active_idx on public.businesses (active);
create index businesses_category_idx on public.businesses (category);

create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();
