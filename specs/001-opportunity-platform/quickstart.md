# Quickstart: SPARK Opportunity Platform

Local development setup. Everything runs on free tiers only.

## Prerequisites

- Node.js 20+ (LTS)
- Supabase project (free plan) — create at supabase.com
- Vercel account (free plan) — for deploy
- Resend account (free plan, ~100 emails/day) — for email

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Copy the template and fill in values from your Supabase project:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
RESEND_API_KEY=re_...            # server-only, never expose to client
```

`NEXT_PUBLIC_*` vars are exposed to the browser; secrets like
`RESEND_API_KEY` must never be prefixed with `NEXT_PUBLIC_` (G4).

## 3. Database

Apply the schema (tables, RLS policies, indexes, triggers) via a
migration:

```bash
npx supabase db push          # after `supabase link`
```

The migration includes: `profiles`, `opportunities`, `blog_articles`,
`category`, `saved_items`, `application_records`, `submissions`,
`events`, `newsletter_subscribers`, all RLS policies, the `is_admin()`
helper, and the GIN/trigram search indexes.

Seed sample published listings for local testing:

```bash
npx supabase db seed
```

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000. Browse `/opportunities` (public), register
an account for `/dashboard`, and set your profile `role='admin'` in the
DB to access `/admin`.

## 5. Scheduled Email (reminders/digests)

Configure a daily scheduled job (Supabase Edge Function via `pg_cron`,
or Vercel Cron) that calls `POST /api/email/send`. The send loop stops
at the free daily quota.

## Quality Gates (per constitution)

```bash
npm run lint
npm run typecheck
npm run build       # production build must pass before merge
npm test            # where the spec requires tests
```
