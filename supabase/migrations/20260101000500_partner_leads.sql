create table public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  category text,
  instagram_url text,
  city text default 'Monterrey',
  message text,
  offered_spots integer,
  status text not null default 'new' check (status in ('new', 'contacted', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partner_leads_status_idx on public.partner_leads (status);
create index partner_leads_created_at_idx on public.partner_leads (created_at);

create trigger set_partner_leads_updated_at
  before update on public.partner_leads
  for each row execute function public.set_updated_at();
