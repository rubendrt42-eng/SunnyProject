-- Reserved-seat counts must be publicly visible (so catalog/detail pages can
-- show "3 lugares restantes") even though the underlying reservation rows
-- are private. anon/authenticated have no SELECT policy on reservations,
-- so a plain view would always aggregate to zero for them — this
-- SECURITY DEFINER function intentionally bypasses RLS to return counts only.
create or replace function public.reserved_counts_for_experiences(p_experience_ids uuid[])
returns table(experience_id uuid, reserved_count integer)
language sql
security definer
stable
set search_path = public
as $$
  select experience_id, count(*)::int as reserved_count
  from public.reservations
  where experience_id = any(p_experience_ids)
    and status in ('confirmed', 'attended', 'no_show')
  group by experience_id;
$$;

grant execute on function public.reserved_counts_for_experiences(uuid[]) to anon, authenticated;

grant execute on function public.claim_reservation(uuid, text) to authenticated;
grant execute on function public.cancel_reservation(uuid) to authenticated;
grant execute on function public.admin_cancel_reservation(uuid) to authenticated;
grant execute on function public.admin_cancel_experience(uuid) to authenticated;
grant execute on function public.admin_set_attendance(uuid, text) to authenticated;
