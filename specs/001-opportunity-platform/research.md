# Research: SPARK Opportunity Platform

**Phase 0 output** — resolves all technical unknowns from the plan's
Technical Context against the free-tier-only constraint.

## 1. Search & Filter on Supabase Free Tier

- **Decision**: PostgreSQL full-text search (tsvector/GIN index) with
  `pg_trgm` for prefix/fuzzy matching, exposed through Supabase SDK
  filters. No external search service.
- **Rationale**: At <5,000 listings, Postgres FTS returns in well under
  2s (SC-003), costs nothing, requires no extra service, and supports
  keyword + type + country + open-deadline filtering in a single query.
- **Alternatives considered**:
  - Meilisearch/Typesense: excellent but needs self-hosting or paid
    hosting — violates the free-tier constraint (G5).
  - Client-side filter of a single fetched list: fine for <5k rows but
    bloats page payload; used only as fallback for small category views.

## 2. Email Delivery at Zero Cost

- **Decision**: Supabase built-in Auth emails (confirmation, password
  reset) are free and used for account emails. Transactional and
  newsletter emails use a free email API (Resend free tier, ~100
  emails/day / 3,000/month) called from a Supabase Edge Function
  scheduled via `pg_cron` (free) or a Vercel Cron route.
- **Rationale**: Meets FR-011 (transactional + newsletters) within free
  quotas; `pg_cron` + Edge Functions live entirely inside Supabase free;
  the send path is server-side so the API key never reaches the client
  (G4).
- **Alternatives considered**:
  - Brevo free (300/day): higher quota but stronger sending limits per
    domain; Resend chosen for simpler API + generous free tier.
  - Vercel Cron only: fewer scheduling options on free tier than
    `pg_cron`; kept as an option but not primary.
- **Quota guard**: digests/broadcasts batch sends and hard-stop at the
  daily free quota; all sends honor user opt-out (FR-011).

## 3. UI Component & Design System Approach

- **Decision**: Tailwind CSS + shadcn/ui (Radix-based primitives).
- **Rationale**: Radix primitives are WCAG AA-compliant out of the box
  (G3), the system is fully customizable (best-in-class UI/UX goal), and
  it is free/open-source. Shared tokens in `globals.css` plus
  `components/ui/` enforce a consistent design system (G6).
- **Alternatives considered**:
  - MUI/Ant Design: heavier, less brandable, theme fights common.
  - Headless-only: more accessibility plumbing, slower to ship.

## 4. Authentication & Session Pattern

- **Decision**: Supabase Auth (email/password) with
  `@supabase/ssr` cookie-based session; `middleware.ts` refreshes
  sessions and enforces route groups (`(auth)`, `(dashboard)`, `admin`).
  Authorisation is also enforced by RLS so it never relies on the UI
  (G4/G6).
- **Rationale**: Official, free, minimal code, and gives us RLS auth via
  `auth.uid()` for per-user row security (FR-005, FR-006).
- **Alternatives considered**: NextAuth — extra dependency and does not
  natively tie to RLS `auth.uid()`; rejected.

## 5. Content Moderation Workflow

- **Decision**: Single `status` field on listings/blog articles with
  states `draft → pending → published → closed` (listings) and
  `draft → pending → published → archived` (articles). User submissions
  always land in `pending`; admin approval publishes; closed is derived
  automatically when deadline passes (FR-003, FR-009).
- **Rationale**: Simple state machine satisfies G2 and keeps the data
  model flat; no approval workflow engine needed at this scale (G5).
- **Alternatives considered**: Dedicated approval tables/audit log per
  row — rejected as over-engineering for v1; a lightweight `verified_by`
  + `verified_at` column covers traceability (G2).

## 6. Privacy-Respecting Analytics

- **Decision**: Aggregated counters only — a per-listing `view_count`,
  an `events` table for anonymous search/save/signup events keyed by
  action + date, and derived dashboard metrics. No personal data in the
  core analytics set (G4; constitution analytics rule).
- **Rationale**: Satisfies admin analytics (FR-010) without a third-party
  tracker or PII; aggregates are computed on-demand from the free DB.
- **Alternatives considered**: GA4/Plausible — GA4 adds consent/legal
  burden; Plausible is paid beyond small free usage. Rejected.

## Consolidated Decisions

| # | Area | Decision |
|---|------|----------|
| D1 | Search | Postgres FTS + pg_trgm via Supabase SDK |
| D2 | Email | Supabase Auth email + Resend free (pg_cron/Edge Function) |
| D3 | UI | Tailwind + shadcn/ui (Radix) |
| D4 | Auth | Supabase Auth + `@supabase/ssr` + middleware route guards |
| D5 | Moderation | status state machine + `verified_by/verified_at` |
| D6 | Analytics | anonymous aggregated counters only |

All NEEDS CLARIFICATION items resolved. No paid services required.
