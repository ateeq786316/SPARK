-- Anonymous aggregate view counter (no PII, G4).
-- Runs as definer so RLS never blocks the counter; only increments view_count.
create or replace function public.increment_view_count(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.opportunities
     set view_count = view_count + 1
   where slug = p_slug
     and status in ('published', 'closed');
end;
$$;
