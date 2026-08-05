# Quickstart: SPARK Opportunity Platform

Local development setup. Everything runs on free tiers only.

## Prerequisites

- Node.js 20+ (LTS)
- Supabase project (free plan) — create at supabase.com
- Vercel account (free plan) — for deploy
- Google account with an SMTP App Password (Gmail or Workspace, ~500 emails/day) — for email
  (create: Google Account → Security → 2-Step Verification ON → App passwords → name `spark`)

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
SMTP_HOST=smtp.gmail.com          # server-only, never expose to client
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS="abcd efgh ijkl mnop"
SMTP_FROM_EMAIL="SPARK <you@gmail.com>"
```

`NEXT_PUBLIC_*` vars are exposed to the browser; secrets like
`SMTP_PASS` and `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with
`NEXT_PUBLIC_` (G4).

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
or Vercel Cron) that calls `POST /api/email/send` with the header
`x-cron-secret: <CRON_SECRET>`. The send loop stops at the SMTP daily
quota.

## Quality Gates (per constitution)

```bash
npm run lint
npm run typecheck
npm run build       # production build must pass before merge
npm test            # where the spec requires tests
```
