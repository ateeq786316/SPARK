# Implementation Checklist: SPARK Opportunity Platform

**Purpose**: Verify the SPARK platform is complete and compliant before marking each user story done and before merge
**Created**: 2026-08-05
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [tasks.md](../tasks.md)

## Foundation & Quality Gates

- [x] CHK001 `npm run typecheck` passes
- [x] CHK002 `npm run lint` passes
- [x] CHK003 `npm run build` (production) passes
- [x] CHK004 `npm test` passes where tests were requested (T016, T017, T028)
- [x] CHK005 RLS is enabled on every table (`contracts/rls.md`) and verified — anon cannot read drafts/pending
- [x] CHK006 No secrets (e.g., `RESEND_API_KEY`) appear in client code or committed files

## User Story 1 — Discover & Explore (P1/MVP)

- [x] CHK007 Home page shows hero ("Find Scholarships, Jobs & Opportunities"), search bar, featured (6), latest updates, success stories, newsletter CTA
- [x] CHK008 Hero fits the initial viewport: headline ≤2 lines, CTA visible without scroll, top padding ≤ `pt-24`, uses `min-h-[100dvh]`
- [x] CHK009 Search/filter works across all 9 opportunity types by keyword, type, country, open deadline (FR-001)
- [ ] CHK010 Searches return results within 2 seconds (SC-003)
- [x] CHK011 Listing detail shows every required field per type + official apply link (FR-002, G1)
- [x] CHK012 Closed listings (deadline passed) show closed state and suppress the apply action (FR-003)
- [x] CHK013 Empty search state with suggestions; skeleton loaders on list pages; error states present
- [x] CHK014 Newsletter CTA subscribes with explicit consent and writes to `newsletter_subscribers` (FR-012)
- [x] CHK015 Every listing has a real image (dev: picsum seed; prod: Storage) — no text-only marketing sections
- [x] CHK016 Scroll-reveal animations present (Reveal/Stagger) and collapse under `prefers-reduced-motion`
- [x] CHK017 SEO present: metadata, `sitemap.ts`, `robots.ts`, structured data (T026)
- [x] CHK018 Footer pages exist: About, Privacy, Terms, Contact, social links, copyright (T018)

## User Story 2 — Personal Dashboard (P2)

- [x] CHK019 Register/login work with Supabase Auth confirmation + password reset; login redirects back to originating listing
- [x] CHK020 Save/unsave persists across sessions; unique per user+opportunity (FR-005)
- [x] CHK021 Mark-applied is idempotent and persists (FR-005)
- [x] CHK022 Saved/applied restore after sign-out/sign-in (SC-004)
- [x] CHK023 Deleted listing in saved/applied shows "no longer available" state
- [x] CHK024 Profile + notification settings editable, including full email opt-out (FR-006)
- [x] CHK025 Notification opt-out is enforced by email sends (FR-011)
- [x] CHK026 "Similar opportunities" section returns ≤6 rule-based matches within 2s (FR-013, SC-007), excludes saved/applied
- [x] CHK027 Users can only access their own data (RLS owner-only, G4)

## User Story 3 — Blog & Career Resources (P2)

- [x] CHK028 Blog list with category filter; `ArticleCard` shows image, badge, author, date
- [x] CHK029 Article page shows title, featured image, author, category, content, related posts (FR-007)
- [x] CHK030 Per-article SEO metadata incl. `seo_keywords` + OpenGraph (FR-007)
- [x] CHK031 Published articles appear in home "Latest updates" (US3 scenario 3)
- [x] CHK032 "Success stories" category renders on home with images + reveal animation

## User Story 4 — Admin (P3)

- [x] CHK033 Admin routes protected by role (`role='admin'`) at middleware AND RLS
- [x] CHK034 Admin can create/edit/publish/delete listings and blog articles (FR-008)
- [x] CHK035 User-submitted content stays invisible until admin approval (FR-009, SC-006)
- [x] CHK036 Approval blocked with gap list when required fields/source_url missing; approval sets `verified_by`/`verified_at` (G1/G2)
- [x] CHK037 Duplicate warning shown on (title, type, source_url) match
- [x] CHK038 Admin can manage users (list, search, role change, suspend)
- [x] CHK039 Analytics page shows aggregates (listings by type, views, searches, saves, signups) with no PII (FR-010, G4)
- [x] CHK040 Newsletter broadcast sends to active subscribers only, batched within ~100/day free quota
- [x] CHK041 Scheduled deadline reminders/digests run on free tier (pg_cron/Edge Function or Vercel Cron) and honor settings

## Cross-Cutting / Polish

- [ ] CHK042 Light + dark mode verified on every page; single accent color; one corner-radius scale; no pure `#000`/`#fff`
- [ ] CHK043 WCAG AA contrast on all CTAs, forms, links; labels above inputs; focus rings visible (G3)
- [ ] CHK044 Performance: LCP <2.5s, CLS <0.1, lazy-loaded below-fold motion/images (G3)
- [ ] CHK045 At most one marquee and at most one pinned GSAP section across the site
- [ ] CHK046 `quickstart.md` validated end-to-end on a fresh clone (T059)
- [x] CHK047 All published listings pass the G1 field-completeness checklist at publish

## Notes

- Check items off as completed: `[x]`
- Items map to spec FRs/SCs, constitution gates (G1–G6), and task IDs in `tasks.md`
- A user story is "done" when its CHK items in this checklist are complete, its independent test from `spec.md` passes, and CHK001–CHK006 pass
- Frontend quality items (CHK015, CHK016, CHK042–CHK045) enforce the Design Directives block in `tasks.md`
