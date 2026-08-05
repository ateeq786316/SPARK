-- SPARK Opportunity Platform — initial schema
-- Conforms to data-model.md and contracts/rls.md

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text,
  headline text,
  country text,
  interests text[] default '{}',
  newsletter_opt_in boolean not null default false,
  notification_settings jsonb not null default '{
    "deadline_reminders": true,
    "new_matches": true,
    "digest": false,
    "newsletter": false
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper: admin check (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- category
-- ---------------------------------------------------------------------------
create table public.category (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  kind text not null check (kind in ('opportunity', 'blog')),
  created_at timestamptz not null default now()
);

alter table public.category enable row level security;

create policy "category_select_public" on public.category for select using (true);
create policy "category_admin_all" on public.category for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- opportunities (9 types)
-- ---------------------------------------------------------------------------
create type public.opportunity_status as enum ('draft', 'pending', 'published', 'closed');

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'scholarship', 'job', 'internship', 'fellowship', 'conference',
    'exchange_program', 'competition', 'grant', 'professional_development'
  )),
  slug text not null unique,
  status public.opportunity_status not null default 'draft',
  title text not null,
  summary text,
  country text,
  deadline date,
  source_url text,
  fields jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  view_count integer not null default 0,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  submitter_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_required_fields check (
    status <> 'published' or (source_url is not null and length(trim(source_url)) > 0)
  )
);

alter table public.opportunities enable row level security;

create policy "opportunities_select_public" on public.opportunities
  for select using (status in ('published', 'closed'));

create policy "opportunities_select_admin" on public.opportunities
  for select using (public.is_admin());

create policy "opportunities_insert_user" on public.opportunities
  for insert with check (auth.uid() = submitter_id);

create policy "opportunities_update_submitter_pending" on public.opportunities
  for update using (auth.uid() = submitter_id and status = 'pending');

create policy "opportunities_admin_all" on public.opportunities
  for all using (public.is_admin());

-- Auto-close published listings whose deadline passed (FR-003)
create or replace function public.auto_close_expired()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and new.deadline is not null
     and new.deadline < current_date then
    new.status := 'closed';
  end if;
  return new;
end;
$$;

create trigger opportunities_auto_close
  before insert or update on public.opportunities
  for each row execute function public.auto_close_expired();

-- Backfill + maintenance job entry point
create or replace function public.mark_closed_opportunities()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  update public.opportunities
     set status = 'closed', updated_at = now()
   where status = 'published'
     and deadline is not null
     and deadline < current_date;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- ---------------------------------------------------------------------------
-- blog_articles
-- ---------------------------------------------------------------------------
create type public.article_status as enum ('draft', 'pending', 'published', 'archived');

create table public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status public.article_status not null default 'draft',
  title text not null,
  featured_image text,
  author_id uuid references public.profiles(id),
  category_id uuid references public.category(id),
  seo_keywords text[] default '{}',
  content text not null default '',
  related_posts uuid[] default '{}',
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_articles enable row level security;

create policy "articles_select_public" on public.blog_articles
  for select using (status = 'published');

create policy "articles_select_admin" on public.blog_articles
  for select using (public.is_admin());

create policy "articles_insert_user" on public.blog_articles
  for insert with check (auth.uid() = author_id);

create policy "articles_update_submitter_pending" on public.blog_articles
  for update using (auth.uid() = author_id and status = 'pending');

create policy "articles_admin_all" on public.blog_articles
  for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- saved_items
-- ---------------------------------------------------------------------------
create table public.saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

alter table public.saved_items enable row level security;

create policy "saved_own_all" on public.saved_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "saved_admin_select" on public.saved_items
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- application_records
-- ---------------------------------------------------------------------------
create table public.application_records (
  user_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applied_at timestamptz not null default now(),
  notes text,
  primary key (user_id, opportunity_id)
);

alter table public.application_records enable row level security;

create policy "applied_own_all" on public.application_records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applied_admin_select" on public.application_records
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- submissions (user content awaiting approval)
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null references public.profiles(id),
  target_type text not null check (target_type in ('opportunity', 'blog_article')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "submissions_insert_own" on public.submissions
  for insert with check (auth.uid() = submitter_id);

create policy "submissions_select_own" on public.submissions
  for select using (auth.uid() = submitter_id);

create policy "submissions_admin_all" on public.submissions
  for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- events (anonymous aggregate analytics — no PII)
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in ('view', 'search', 'save', 'signup', 'subscribe')),
  day date not null default current_date,
  target_id uuid,
  count integer not null default 1,
  unique (action, day, target_id)
);

alter table public.events enable row level security;

create policy "events_insert_anon" on public.events
  for insert with check (true);

create policy "events_admin_select" on public.events
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

create policy "subscribers_insert_anon" on public.newsletter_subscribers
  for insert with check (true);

create policy "subscribers_admin_all" on public.newsletter_subscribers
  for all using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Indexes (search + query paths)
-- ---------------------------------------------------------------------------
create index opportunities_status_idx on public.opportunities (status);
create index opportunities_type_idx on public.opportunities (type);
create index opportunities_country_idx on public.opportunities (country);
create index opportunities_deadline_idx on public.opportunities (deadline);
create index opportunities_featured_idx on public.opportunities (featured) where featured;
create index articles_status_idx on public.blog_articles (status);
create index articles_category_idx on public.blog_articles (category_id);
create index events_day_idx on public.events (day);

-- Full-text search (research.md D1)
alter table public.opportunities
  add column search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  ) stored;

create index opportunities_search_idx on public.opportunities using gin (search_vector);

create index opportunities_title_trgm_idx on public.opportunities
  using gin (title gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.category (name, kind) values
  ('Scholarships', 'opportunity'),
  ('Jobs', 'opportunity'),
  ('Internships', 'opportunity'),
  ('Fellowships', 'opportunity'),
  ('Application Tips', 'blog'),
  ('CV & SOP', 'blog'),
  ('Success Stories', 'blog')
on conflict (name) do nothing;

insert into public.opportunities (
  type, slug, status, title, summary, country, deadline, source_url,
  fields, featured
) values
  (
    'scholarship', 'chevening-scholarships-2027', 'published',
    'Chevening Scholarships 2027',
    'Fully funded UK government scholarship for master''s study.',
    'United Kingdom', '2026-11-04',
    'https://www.chevening.org/scholarships/',
    '{"university": "UK universities", "degree": "Master''s", "funding_type": "Fully funded", "eligibility": "Apply to 3 eligible courses, meet English requirement", "cgpa": "N/A", "ielts_toefl": "IELTS 6.5 minimum", "required_documents": ["Academic transcripts", "References", "Offer letters"], "benefits": "Tuition, living costs, flights"}'::jsonb,
    true
  ),
  (
    'internship', 'google-summer-intern', 'published',
    'Google Summer Internship',
    'Paid 12-week summer internship for students.',
    'Remote', '2026-09-30',
    'https://careers.google.com/jobs/results/?category=INTERNS',
    '{"company": "Google", "duration": "12 weeks", "paid_unpaid": "Paid", "eligibility": "Currently enrolled in BS/MS", "skills": ["Coding", "Problem solving"]}'::jsonb,
    false
  ),
  (
    'job', 'junior-frontend-engineer', 'published',
    'Junior Frontend Engineer',
    'Entry-level frontend role for recent graduates.',
    'Remote', '2026-08-20',
    'https://example.com/careers/junior-frontend',
    '{"organization": "Acme Digital", "location": "Remote", "experience": "0-2 years", "salary": "$40k-$55k", "eligibility": "Degree in CS or related"}'::jsonb,
    false
  ),
  (
    'fellowship', 'knight-hennessy-fellows', 'published',
    'Knight-Hennessy Scholars',
    'Fully funded graduate fellowship at Stanford.',
    'United States', '2026-10-09',
    'https://knight-hennessy.stanford.edu/',
    '{"host": "Stanford University", "benefits": "Tuition, stipend, mentorship", "eligibility": "Graduate degree applicants", "dates": "Aug 2027 intake"}'::jsonb,
    true
  )
on conflict (slug) do nothing;
