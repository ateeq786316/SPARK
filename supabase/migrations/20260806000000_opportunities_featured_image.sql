-- Ensure opportunities.featured_image exists (idempotent). Safe no-op if already present.
alter table public.opportunities
  add column if not exists featured_image text;

-- Reload PostgREST schema cache so the column is immediately visible to the API.
notify pgrst, 'reload schema';