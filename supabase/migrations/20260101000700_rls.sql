alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.experiences enable row level security;
alter table public.reservations enable row level security;
alter table public.partner_leads enable row level security;

-- profiles ------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- Role changes are additionally blocked at the trigger level
-- (trg_prevent_role_self_update) regardless of these policies.

-- businesses ------------------------------------------------------------
create policy "businesses_select_public" on public.businesses
  for select using (active = true or public.is_admin());

create policy "businesses_admin_all" on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

-- experiences ------------------------------------------------------------
-- Non-draft experiences (published/cancelled/completed) are publicly
-- readable so cancelled/finished events still show their status instead
-- of disappearing (see PRODUCT_SPEC.md §10).
create policy "experiences_select_public" on public.experiences
  for select using (status <> 'draft' or public.is_admin());

create policy "experiences_admin_all" on public.experiences
  for all using (public.is_admin()) with check (public.is_admin());

-- reservations ------------------------------------------------------------
-- No INSERT policy for anon/authenticated on purpose: claim_reservation()
-- is the only sanctioned way to create a reservation (see functions.sql).
create policy "reservations_select_own" on public.reservations
  for select using (auth.uid() = user_id);

create policy "reservations_select_admin" on public.reservations
  for select using (public.is_admin());

create policy "reservations_admin_update" on public.reservations
  for update using (public.is_admin()) with check (public.is_admin());
-- User-initiated cancellation goes through cancel_reservation(), which
-- runs as the table owner and bypasses RLS, so no user UPDATE policy exists.

-- partner_leads ------------------------------------------------------------
-- Open to anonymous submissions: businesses have no accounts in the MVP.
create policy "partner_leads_insert_public" on public.partner_leads
  for insert with check (true);

create policy "partner_leads_select_admin" on public.partner_leads
  for select using (public.is_admin());

create policy "partner_leads_update_admin" on public.partner_leads
  for update using (public.is_admin()) with check (public.is_admin());
