# Tasks: SPARK Opportunity Platform

**Input**: Design documents from `/specs/001-opportunity-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are OPTIONAL — only included where they materially protect constitution gates (G1 data integrity, G4 security/privacy).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Design Directives (frontend quality — applies to all UI tasks)

- **Motion**: use `motion/react` (import `{ motion, useReducedMotion, useScroll }` from `"motion/react"`). Never use `window.addEventListener("scroll")` or `useState` for scroll/mouse values — use Motion hooks. Gate every animation behind `useReducedMotion()`.
- **Images**: use `next/image` everywhere; hero image `priority`. Dev placeholders via `https://picsum.photos/seed/<descriptive>/<w>/<h>`; production images from Supabase Storage. Every marketing section needs at least one real visual — no text-only slop.
- **Typography**: `next/font` (Geist or Satoshi + a mono pairing). Do not use Inter by default. Headlines `text-4xl md:text-6xl tracking-tighter leading-none`.
- **Color**: one accent color, neutral base (zinc/stone), both light + dark modes, WCAG AA contrast. No AI-purple gradients, no pure `#000`.
- **Icons**: one family only — `@phosphor-icons/react` or `@tabler/icons-react`. Never hand-roll SVG icons.
- **Animation discipline**: hero fits initial viewport (`min-h-[100dvh]`, headline ≤2 lines, CTA visible, top padding ≤ `pt-24`); scroll-reveal via `whileInView`; at most one marquee per page; at most one pinned GSAP ScrollTrigger section; tactile `:active` feedback on CTAs; loading/empty/error states for every interactive area.
- **Layout**: CSS Grid over flex percentage math; mobile collapse explicit per section; one corner-radius scale.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create Next.js 15 + TypeScript project (App Router, ESLint, `src/` dir) at repository root
- [ ] T002 Configure Tailwind CSS v4 (`@tailwindcss/postcss`) with project tokens in `src/app/globals.css`
- [ ] T003 Install core deps: `motion`, `@phosphor-icons/react`, `zod`, `react-hook-form`, `@supabase/supabase-js`, `@supabase/ssr`
- [ ] T004 Init shadcn/ui (`npx shadcn@latest init`) with neutral base + one accent color; enable dark mode
- [ ] T005 [P] Add `next/font` setup (Geist or Satoshi display + mono pairing) in `src/app/layout.tsx`
- [ ] T006 [P] Configure Vitest + React Testing Library in `vitest.config.ts`
- [ ] T007 [P] Create `.env.local` template and `src/lib/env.ts` for typed env access (secrets server-only)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Create Supabase migration: tables (`profiles`, `opportunities`, `blog_articles`, `category`, `saved_items`, `application_records`, `submissions`, `events`, `newsletter_subscribers`) + RLS policies (see `contracts/rls.md`) + `is_admin()` helper + GIN/trigram indexes + seed in `supabase/migrations/`
- [ ] T009 Implement Supabase browser client in `src/lib/supabase/client.ts` and server client in `src/lib/supabase/server.ts` (cookie session via `@supabase/ssr`)
- [ ] T010 Implement `src/middleware.ts` route guards: refresh session, protect `(dashboard)/**` (auth) and `admin/**` (role = admin)
- [ ] T011 Create design system foundation in `src/components/ui/`: button, card, input, badge, select, dialog, skeleton, empty-state, toast (shadcn primitives customized, no default state)
- [ ] T012 Create motion primitives in `src/components/ui/motion/`: `Reveal` (whileInView), `Stagger`, `SpringPress`, all honoring `useReducedMotion()`
- [ ] T013 Create zod schemas for all 9 opportunity types in `src/lib/validators/opportunity.ts` (field sets from `data-model.md` / spec FR-002)
- [ ] T014 Create shared types in `src/types/index.ts` (User, Opportunity, BlogArticle, SavedItem, ApplicationRecord, Submission, ActivityMetric, NewsletterSubscriber)
- [ ] T015 Implement Postgres full-text search helpers in `src/lib/search.ts` (keyword + type + country + open-deadline filters, 2s target)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discover & Explore Opportunities (Priority: P1) 🎯 MVP

**Goal**: Any visitor can search/browse all 9 opportunity types and open fully populated detail pages with verified info and official apply links.

**Independent Test**: A first-time visitor searches a keyword, filters by type/country, opens a listing, and sees every required field plus the official apply link; closed listings show no apply action.

### Tests for User Story 1 (OPTIONAL — only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Unit test for opportunity validators in `tests/unit/validators.test.ts`
- [ ] T017 [P] [US1] Integration test for public listing query (anon can only see `published`/`closed`) in `tests/integration/public-listings.test.ts`

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create public route group layout in `src/app/(public)/layout.tsx` with sticky nav (≤80px, single line) + footer (About, Privacy, Terms, Contact, social links, copyright)
- [ ] T019 [P] [US1] Create home page in `src/app/(public)/page.tsx`: hero (headline "Find Scholarships, Jobs & Opportunities", search bar, animated entrance), featured opportunities (6), latest updates, success stories, newsletter CTA — hero image via `next/image` priority, hero fits viewport
- [ ] T020 [P] [US1] Create `ListingCard` in `src/components/features/listing-card.tsx` (image, type badge, title, country, deadline, hover state, `next/image`)
- [ ] T021 [P] [US1] Create `SearchBar` in `src/components/features/search-bar.tsx` (debounced, accessible label, icon button, enter-to-search)
- [ ] T022 [US1] Create opportunities list page in `src/app/(public)/opportunities/page.tsx` with search/filter (type pills, country, open-deadline) + empty state + skeleton loading
- [ ] T023 [US1] Create listing detail page in `src/app/(public)/opportunities/[slug]/page.tsx` showing all required fields per type, verified date, and official apply link; closed listings hide apply action
- [ ] T024 [US1] Implement newsletter subscribe action in `src/app/api/newsletter/route.ts` (explicit consent, `newsletter_subscribers` insert, unsubscribe link support)
- [ ] T025 [US1] Add scroll-reveal animations (`Reveal`/`Stagger`) to home + listing grid; hero entrance sequence; tactile CTA feedback — all reduced-motion safe
- [ ] T026 [US1] Add SEO metadata, `sitemap.ts`, `robots.ts`, per-listing structured data
- [ ] T027 [US1] Create static footer pages: about, privacy, terms, contact in `src/app/(public)/about`, `/privacy`, `/terms`, `/contact`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Personal Dashboard (Saved, Applied, Profile) (Priority: P2)

**Goal**: Registered users get a dashboard with saved items, applied list, profile, notification settings, and rule-based "Similar opportunities" recommendations.

**Independent Test**: A registered user saves 2 listings, marks 1 applied, logs out/in, sees all restored; updates profile + notification settings; sees recommendations matching saved/filtered interests.

### Tests for User Story 2 (OPTIONAL — only if tests requested) ⚠️

- [ ] T028 [P] [US2] Contract test for save/unsave + applied upsert (owner-only via RLS) in `tests/integration/dashboard-actions.test.ts`

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create auth pages in `src/app/(auth)/login` and `/register` (email/password, confirmation + reset via Supabase Auth, error/loading states, post-login redirect back to originating listing)
- [ ] T030 [P] [US2] Create profile row on signup (trigger on `auth.users`) and profile type in `src/lib/db/profiles.ts`
- [ ] T031 [US2] Implement save/unsave server action in `src/lib/db/saved.ts` (upsert, unique per user+opportunity)
- [ ] T032 [US2] Implement mark-applied server action in `src/lib/db/applied.ts` (idempotent upsert)
- [ ] T033 [US2] Create dashboard layout in `src/app/(dashboard)/layout.tsx` with sidebar nav (saved, applied, settings) + auth guard
- [ ] T034 [US2] Create saved page in `src/app/(dashboard)/saved/page.tsx` (list, unsave, closed/deleted states, empty state)
- [ ] T035 [US2] Create applied page in `src/app/(dashboard)/applied/page.tsx` (list, status, empty state)
- [ ] T036 [US2] Create settings page in `src/app/(dashboard)/settings/page.tsx` (profile edit + notification settings incl. full email opt-out)
- [ ] T037 [US2] Implement recommendations query in `src/lib/db/recommendations.ts` (rule-based: interests/saved type + country, published only, exclude saved/applied, ≤6, 2s)
- [ ] T038 [US2] Render "Similar opportunities" with `Reveal` stagger on listing detail + dashboard in `src/components/features/similar-opportunities.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Educational Blog & Career Resources (Priority: P2)

**Goal**: Users read blog/career articles with category filter, SEO metadata, and related posts; success stories surface on home.

**Independent Test**: A visitor opens the blog, filters by category, reads an article (title, image, author shown), follows a related-post link; published article appears in home "Latest updates".

### Implementation for User Story 3

- [ ] T039 [P] [US3] Create blog list page in `src/app/(public)/blog/page.tsx` (category filter, `ArticleCard` grid, skeleton, empty state)
- [ ] T040 [P] [US3] Create `ArticleCard` in `src/components/features/article-card.tsx` (`next/image` featured image, category badge, author, date)
- [ ] T041 [US3] Create article detail page in `src/app/(public)/blog/[slug]/page.tsx` (content, author, category, related posts from `related_posts`)
- [ ] T042 [US3] Create `RelatedPosts` in `src/components/features/related-posts.tsx` + add scroll-reveal to blog pages
- [ ] T043 [US3] Add SEO metadata per article (title, description, `seo_keywords`, featured image, OpenGraph)
- [ ] T044 [US3] Wire "Success stories" (blog category) into home page section with images and `Reveal` stagger

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Admin Content Management & Analytics (Priority: P3)

**Goal**: Admins manage listings/articles (CRUD), approve user submissions, manage users, view analytics, and send email notifications.

**Independent Test**: An admin creates + publishes a listing, approves a pending submission, edits and deletes a listing, manages a user, views aggregate analytics, and sends a newsletter — without affecting public journeys.

### Implementation for User Story 4

- [ ] T045 [P] [US4] Create admin layout in `src/app/admin/layout.tsx` with admin guard + sidebar (listings, blog, users, analytics, email)
- [ ] T046 [P] [US4] Create admin listings CRUD in `src/app/admin/listings/` (create/edit form per type, draft→publish, delete, duplicate warning on title+type+source)
- [ ] T047 [US4] Create approval queue in `src/app/admin/approvals/` for pending `submissions` (approve blocked with gap list if required fields/source_url missing; sets `verified_by`/`verified_at`; reject → draft)
- [ ] T048 [US4] Create admin blog CRUD in `src/app/admin/blog/` (create/edit/delete articles, publish/archive)
- [ ] T049 [US4] Create user management page in `src/app/admin/users/` (list, search, role change, suspend)
- [ ] T050 [US4] Create analytics page in `src/app/admin/analytics/` (aggregate: listings by type, views, searches, saves, signups — no PII)
- [ ] T051 [US4] Implement user submission flow: registered users submit listings → `pending` (invisible publicly) in `src/lib/db/submissions.ts`
- [ ] T052 [US4] Implement email sending in `src/lib/email/` (Resend free tier, quota guard ~100/day, opt-out honored) + `POST /api/email/send` for scheduled reminders/digests
- [ ] T053 [US4] Create email broadcast page in `src/app/admin/email/` (newsletter to active subscribers, batched within free quota)
- [ ] T054 [US4] Add Supabase Storage upload for featured/blog images in `src/lib/storage.ts` (public bucket, image validation)

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T055 Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` — all MUST pass (constitution quality gate)
- [ ] T056 Accessibility audit: WCAG AA contrast (buttons, forms, links), reduced-motion collapse, keyboard nav, form labels above inputs, focus rings in `src/app`
- [ ] T057 Performance pass: LCP < 2.5s (hero `next/image` priority), CLS < 0.1 (reserved image space), lazy-load below-fold motion/images, Lighthouse run
- [ ] T058 Verify light + dark mode across every page; confirm single accent color + one corner-radius scale; no pure `#000`/`#fff`
- [ ] T059 Validate `quickstart.md` end-to-end: fresh clone → env setup → migration → seed → `npm run dev` → public browse → register → dashboard
- [ ] T060 Confirm all listings pass the G1 field-completeness checklist at publish; analytics contain no PII (G4)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for listing detail save/apply entry points
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - US2 submission flow feeds its approval queue; otherwise independent

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/validators before services
- Services before pages/components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1, US2, and US3 can start in parallel (team permitting)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```text
Task: "Unit test for opportunity validators in tests/unit/validators.test.ts"
Task: "Integration test for public listing query in tests/integration/public-listings.test.ts"

Task: "Create public route group layout in src/app/(public)/layout.tsx"
Task: "Create home page in src/app/(public)/page.tsx"
Task: "Create ListingCard in src/components/features/listing-card.tsx"
Task: "Create SearchBar in src/components/features/search-bar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (public discovery + premium frontend)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Frontend tasks MUST follow the Design Directives block (motion/react, next/image, one icon family, reduced-motion support, dark mode, WCAG AA)
