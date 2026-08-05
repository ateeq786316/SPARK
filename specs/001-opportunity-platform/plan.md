# Implementation Plan: SPARK Opportunity Platform

**Branch**: `001-opportunity-platform` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-opportunity-platform/spec.md`

## Summary

SPARK is a public web platform that connects students and young
professionals with verified global educational and career opportunities.
A single Next.js application on Vercel backed by Supabase (PostgreSQL,
Auth, Storage) serves four incrementally shippable user stories: (US1,
P1) public discovery and search across nine opportunity types with full
verified detail pages; (US2, P2) a personal dashboard (saved items,
applied tracking, profile, notification settings) with rule-based
"Similar opportunities" recommendations; (US3, P2) an educational blog
with categories, SEO metadata, and related posts; (US4, P3) an admin
console for content CRUD, moderated approvals, user management,
analytics, and email notifications. All functionality runs exclusively
on free-tier infrastructure (Supabase free + Vercel free) with no paid
add-ons or external AI services.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 (App Router)
**Primary Dependencies**: Next.js, `@supabase/supabase-js`,
`@supabase/ssr`, Tailwind CSS, shadcn/ui (Radix primitives), `zod`,
`react-hook-form`
**Storage**: Supabase — PostgreSQL, Auth, Storage (blog/featured images)
**Testing**: Vitest + React Testing Library; Playwright for key public
journeys (free, optional)
**Target Platform**: Web, deployed on Vercel (free tier)
**Project Type**: Web application (single Next.js app + Supabase BaaS)
**Performance Goals**: search and recommendation results returned within
2 seconds (SC-003, SC-007); healthy Core Web Vitals on listing and home
pages
**Constraints**: free tier only — Supabase free (~500 MB DB, limited
emails) and Vercel free; no paid add-ons or external AI/ML; email quota
~100/day via a free provider; WCAG AA; RLS on every table; no secrets in
client code
**Scale/Scope**: <5,000 active listings, <10,000 registered users, 4
user stories, ~30 screens (home, listing lists/detail, blog, dashboard,
admin, auth, legal/footer)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement (from constitution) | Status |
|------|--------------------------------|--------|
| G1 Data Integrity | Every listing type has a complete required-field set; official apply link only; deadlines tracked and closed listings hidden | PASS |
| G2 Content Governance | Draft/pending/published flow; user submissions invisible until admin approval; source + last-verified traceability | PASS |
| G3 UX & Accessibility | WCAG AA, responsive, no dark patterns, opt-in/opt-out notifications, searchable/filterable discovery | PASS |
| G4 Security & Privacy | Supabase Auth + RLS; users access only their own saved/applied/profile data; no secrets committed or exposed client-side; email consent | PASS |
| G5 Simplicity | Single frontend + Supabase model; no additional services; YAGNI | PASS |
| G6 Tech Constraints | Next.js + TypeScript + Tailwind on Vercel; Supabase SDK; role enforcement at API and DB layers; schema changes via migration; shared design system | PASS |

No unjustified violations. All six gates pass; the design below conforms
to the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-opportunity-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/                 # US1 + US3 public routes
│   │   ├── page.tsx              # home: hero, search, featured, latest, stories, newsletter
│   │   ├── opportunities/
│   │   │   ├── page.tsx          # search + filter all types
│   │   │   └── [slug]/page.tsx   # listing detail
│   │   ├── blog/
│   │   │   ├── page.tsx          # blog list by category
│   │   │   └── [slug]/page.tsx   # article + related posts
│   │   └── about/ privacy/ terms/ contact/   # footer pages
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # US2 (protected)
│   │   ├── dashboard/
│   │   │   ├── saved/page.tsx
│   │   │   ├── applied/page.tsx
│   │   │   └── settings/page.tsx # profile + notification settings
│   ├── admin/                    # US4 (admin role only)
│   │   ├── listings/page.tsx     # CRUD + approval queue
│   │   ├── blog/page.tsx
│   │   ├── users/page.tsx
│   │   └── analytics/page.tsx
│   ├── api/
│   │   ├── email/route.ts        # scheduled send (cron/pg_cron)
│   │   └── newsletter/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # design system primitives (shadcn/ui)
│   └── features/                 # domain components (ListingCard, SearchBar, ...)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # browser client
│   │   └── server.ts             # server client (cookie-based session)
│   ├── db/                       # typed queries + validators
│   ├── email/                    # free-tier email sender
│   ├── search.ts                 # Postgres FTS helpers
│   └── validators/               # zod schemas per opportunity type
├── hooks/
├── middleware.ts                 # auth/role route protection
├── types/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Structure Decision**: A single Next.js application (App Router) with
Supabase as the managed backend. There is no separate `backend/`
directory because the constitution mandates the "single frontend +
Supabase backend" model (G5/G6); server logic lives in Next.js server
components and route handlers, and database access is governed by
Supabase RLS policies. Public, dashboard, and admin routes are split via
route groups and protected in `middleware.ts` plus RLS (defense in
depth). Domain logic is co-located under `lib/` and
`components/features/`, with a shared `components/ui/` design system.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. No unjustified complexity to document.