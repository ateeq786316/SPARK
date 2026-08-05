-- Public can read; only admins can write/edit/delete.
drop policy if exists "site_settings_public_all" on public.site_settings;

create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

notify pgrst, 'reload schema';