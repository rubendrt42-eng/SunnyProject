insert into storage.buckets (id, name, public)
values ('experience-images', 'experience-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

create policy "public_read_experience_images" on storage.objects
  for select using (bucket_id = 'experience-images');

create policy "admin_write_experience_images" on storage.objects
  for insert with check (bucket_id = 'experience-images' and public.is_admin());

create policy "admin_update_experience_images" on storage.objects
  for update using (bucket_id = 'experience-images' and public.is_admin());

create policy "admin_delete_experience_images" on storage.objects
  for delete using (bucket_id = 'experience-images' and public.is_admin());

create policy "public_read_business_logos" on storage.objects
  for select using (bucket_id = 'business-logos');

create policy "admin_write_business_logos" on storage.objects
  for insert with check (bucket_id = 'business-logos' and public.is_admin());

create policy "admin_update_business_logos" on storage.objects
  for update using (bucket_id = 'business-logos' and public.is_admin());

create policy "admin_delete_business_logos" on storage.objects
  for delete using (bucket_id = 'business-logos' and public.is_admin());
