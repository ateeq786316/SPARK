-- US4: admin user management + image storage bucket

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- Public image bucket for listing/blog uploads
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'images');

create policy "images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_update" on storage.objects
  for update using (bucket_id = 'images' and public.is_admin());

create policy "images_admin_delete" on storage.objects
  for delete using (bucket_id = 'images' and public.is_admin());
