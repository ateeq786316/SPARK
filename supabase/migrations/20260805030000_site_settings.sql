-- US4+: admin-managed site assets (hero image, logo, etc.)
-- One row per key. Admins write; the public can read the published asset settings.

create table if not exists public.site_settings (
  key text primary key,
  value text,
  type text not null default 'string',
  updated_at timestamp with time zone not null default now()
);

insert into public.site_settings (key, value, type)
values
  ('hero_image_url', null, 'image_url'),
  ('logo_image_url', null, 'image_url')
on conflict (key) do nothing;

create policy "site_settings_admin_all" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "site_settings_public_read" on public.site_settings
  for select using (true);
