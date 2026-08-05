-- Make site_settings fully unrestricted (no RLS restrictions).
drop policy if exists "site_settings_admin_all" on public.site_settings;
drop policy if exists "site_settings_public_read" on public.site_settings;

-- Allow full public access (read + write) to site settings.
create policy "site_settings_public_all" on public.site_settings
  for all using (true) with check (true);

-- Refresh PostgREST schema cache.
notify pgrst, 'reload schema';