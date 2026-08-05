# Feature Specification: SPARK Opportunity Platform

**Feature Branch**: `001-opportunity-platform`
**Created**: 2026-08-05
**Status**: Draft
**Input**: User description: SPARK full platform requirements (Home, Scholarships, Jobs, Internships, Fellowships/Conferences, Blog, Dashboard, Admin, Footer).

## User Scenarios & Testing *(mandatory)*

> Each user story is an independently testable slice of the platform. A
> story is complete when a visitor or user can accomplish the described
> journey end-to-end without depending on unfinished stories.

## Clarifications

### Session 2026-08-05

- Q: Should exchange programs, competitions, grants, and professional development be separate opportunity types in v1? → A: C - yes, all mentioned opportunity types are in scope and must be visible on the platform.
- Q: Should personalized recommendations be part of v1 and how advanced? → A: B - basic rule-based recommendations matching a user's saved/filtered type and country; no external AI/paid services (free-tier compatible).
- Q: Expected scale in the first year? → A: A - small scale (under 5,000 active listings and under 10,000 users), sized for free-tier limits.
- Q: What triggers email notifications? → A: C - transactional (account + approval status + deadline reminders) plus broadcast newsletters to subscribers; all sent via free-tier email and strictly honoring opt-out.
- Q: Can visitors explore without registering? → A: yes - all listings and blog content are publicly viewable; an account is required only for saving, applied tracking, profile, and notifications.
- Q: Who can submit content for admin approval? → A: A - registered users only (visitors cannot submit).

### User Story 1 - Discover & Explore Opportunities (Priority: P1)

A visitor lands on the SPARK home page, which features the headline
"Find Scholarships, Jobs & Opportunities", a search bar, featured
opportunities, and latest updates. They search or browse across all
opportunity types — scholarships, jobs, internships, fellowships,
conferences, exchange programs, competitions, grants, and professional
development — filter by type, country, or deadline, open a listing, and
see the complete, verified detail (eligibility, required documents,
benefits, deadline, and an official apply link). From a listing they can
open the official application site or share/contact. They can also read
success stories and subscribe to the newsletter via a CTA on the home
page.

**Why this priority**: Discovery of accurate opportunities is the core
value of the platform and the primary reason a user visits. Everything
else supports this journey.

**Independent Test**: A first-time visitor can find a specific
opportunity by keyword search or category and open its fully populated
detail page, confirming every required field is present.

**Acceptance Scenarios**:

1. **Given** a visitor on the home page, **when** they type a keyword and
   press Enter, **then** they see a list of matching opportunities with
   title, type, country, and deadline.
2. **Given** a listing is open and its deadline has passed, **when** the
   user views it, **then** the system marks it as closed and hides the
   apply action.
3. **Given** a visitor views an opportunity detail page, **when** they
   check it, **then** all required fields (eligibility, documents,
   benefits, deadline, official apply link) are shown.

---

### User Story 2 - Personal Dashboard (Saved, Applied, Profile) (Priority: P2)

A registered user signs in and accesses a dashboard containing saved
items, their applied list, profile, and notification settings. From any
opportunity listing they can save it (or unsave it) and mark it as
applied once they apply. Saved and applied items persist across visits.
They can edit profile details and choose which notifications they
receive (e.g., new opportunities matching saved interests, deadline
reminders) and opt out of email.

**Why this priority**: Personalization and persistence deepen retention
for returning users but depend on authentication, so it is secondary to
discovery.

**Independent Test**: A registered user can save two opportunities, mark
one as applied, log out, log back in, and still see both saved items and
the applied record, and can update profile and notification settings.

**Acceptance Scenarios**:

1. **Given** a signed-in user on a listing, **when** they click Save,
   **then** the listing appears in Saved items and the button reflects
   the saved state.
2. **Given** a user has saved items, **when** they log out and back in,
   **then** their saved and applied lists are restored.
3. **Given** a user, **when** they update notification settings, **then**
   changes are saved and honored thereafter.
4. **Given** a signed-in user with saved items or active filters, **when**
   they view their dashboard or home feed, **then** they see a
   "Similar opportunities" section matching their saved/filtered type
   and country.

---

### User Story 3 - Educational Blog & Career Resources (Priority: P2)

Users can read educational blogs and career guidance articles covering
application tips, CV and statement-of-purpose resources, and success
stories. Each article has a title, featured image, author, category, and
SEO-relevant metadata, and each article page shows related posts. Users
can browse by category and find "Latest updates" surfaced on the home
page.

**Why this priority**: Content builds trust and supports users' decisions,
but it is additive to the core discovery journey.

**Independent Test**: A visitor can open an article from a category list,
read it with author and image shown, and follow a related-post link to
another article.

**Acceptance Scenarios**:

1. **Given** the blog section, **when** a user filters by a category,
   **then** only articles in that category are listed.
2. **Given** an open article, **when** the user reads it, **then** title,
   author, category, and featured image are displayed and related posts
   are shown.
3. **Given** an article, **when** it is published, **then** it appears in
   Latest updates on the home page.

---

### User Story 4 - Admin Content Management & Analytics (Priority: P3)

Administrators access an admin console to add, edit, and delete posts,
manage user accounts, and approve user-submitted content before it is
published. They can review platform analytics (listing views, searches,
saved/signup rates) and send email notifications to users. All listing
content passes review to ensure every required field and an official
apply link are present.

**Why this priority**: Moderation and governance protect data quality but
are operational and can be introduced after the user-facing journeys.

**Independent Test**: An admin can create a listing, have a submitted
listing pending review, approve it, delete a listing, and view aggregate
analytics without any end-user journey being affected.

**Acceptance Scenarios**:

1. **Given** an admin console, **when** an admin submits a new listing,
   **then** it is saved as draft until explicitly published/approved.
2. **Given** a user-submitted listing, **when** it is pending approval,
   **then** it is not visible publicly until an admin approves it.
3. **Given** an admin, **when** they open analytics, **then** they see
   aggregate metrics on listings, views, and user actions.

---

### Edge Cases

- A listing's deadline passes while a user has it saved — the saved item
  remains but is shown as closed.
- A saved item or applied record references a listing that an admin
  later deletes — the record shows a "no longer available" state.
- A visitor tries to Save or mark Applied without being signed in — they
  are prompted to sign in and returned to the same listing afterward.
- A user unsubscribes from all notifications — no further emails are
  sent until they re-enable.
- Admin tries to approve a listing missing required fields or an
  official apply link — approval is blocked with a list of gaps.
- Search returns no matches — a friendly empty state with suggestions is
  shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow visitors to search and filter
  opportunities (scholarships, jobs, internships, fellowships,
  conferences, exchange programs, competitions, grants, and professional
  development) by keyword, type, country, and open deadline.
- **FR-002**: Each opportunity listing MUST display all required fields
  for its type and an official application link. Scholarships include
  title, country, university, degree, funding type, eligibility, CGPA,
  IELTS/TOEFL, required documents, benefits, deadline. Jobs include job
  title, organization, location, eligibility, experience, salary (when
  available), deadline, apply link. Internships include company,
  duration, paid/unpaid, eligibility, skills, deadline, apply link.
  Fellowships/conferences include host, country, benefits, eligibility,
  dates, deadline, apply link. Exchange programs include host, country,
  benefits, eligibility, dates, deadline, apply link. Competitions
  include title, organizer, country, prizes/rewards, eligibility,
  deadline, apply link. Grants include title, grantor, country,
  amount/funding, eligibility, deadline, apply link. Professional
  development includes title, provider, country, format/duration,
  fees, eligibility, deadline, apply link.
- **FR-003**: System MUST mark listings as closed once their deadline has
  passed and suppress the apply action on closed listings.
- **FR-004**: Users MUST be able to register, sign in, and sign out.
- **FR-005**: Signed-in users MUST be able to save and unsave listings
  and mark listings as applied; this data MUST persist across sessions.
- **FR-006**: Signed-in users MUST be able to view and edit their profile
  and configure notification settings, including full opt-out of email.
- **FR-007**: System MUST support publishing blog articles with title,
  featured image, author, category, and SEO metadata, and MUST show
  related posts on each article.
- **FR-008**: Admin users MUST be able to add, edit, publish, and delete
  listings and blog articles.
- **FR-009**: Content submitted by registered users MUST remain
  unpublished until an administrator approves it; approval MUST be
  blocked if required fields or an official apply link are missing.
  Visitors cannot submit content.
- **FR-010**: Admin users MUST be able to manage user accounts and view
  aggregate analytics on listings, views, saves, and signups.
- **FR-011**: System MUST send email notifications in accordance with each
  user's notification settings and subscription consent; transactional
  emails (account, approval status, deadline reminders) and broadcast
  newsletters MUST respect opt-out.
- **FR-011a**: All opportunity listings and blog articles MUST be
  publicly viewable without an account; registration is required only
  for saving, applied tracking, profile, and notifications.
- **FR-012**: Home page MUST feature a hero (headline "Find Scholarships,
  Jobs & Opportunities"), search bar, featured opportunities, latest
  updates, success stories, and a newsletter CTA.
- **FR-013**: System MUST provide signed-in users a "Similar
  opportunities" recommendation section based on their saved items and
  active filter preferences, computed from platform data without
  external paid or AI services.

### Key Entities

- **User**: A registered account with profile, role (visitor, user,
  admin), saved items, applied records, and notification preferences.
- **Opportunity**: A typed listing (scholarship, job, internship,
  fellowship, conference, exchange program, competition, grant, or
  professional development) with type-specific fields, deadline, status
  (draft/pending/published/closed), source, and official apply link.
- **BlogArticle**: An article with title, featured image, author,
  category, SEO metadata, content, and related-post links.
- **Category**: A grouping applied to listings and/or blog articles.
- **SavedItem**: The linkage between a user and a saved opportunity.
- **ApplicationRecord**: A user's record that they applied to an
  opportunity.
- **Submission**: Public content submitted by a user awaiting admin
  approval.
- **ActivityMetric**: Aggregate analytics about views, searches,
  publications, saves, and signups.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open a fully populated listing (all required
  fields + official apply link) in under 3 minutes from the home page.
- **SC-002**: At publish time, 100% of listings contain every required
  field and an official apply link (verified by the approval gate).
- **SC-003**: 95% of searches return relevant results within 2 seconds.
- **SC-004**: Saved items and applied records survive a sign-out/sign-in
  cycle for 100% of users.
- **SC-005**: 90% of users who begin the newsletter or sign-up flow
  complete it on the first attempt.
- **SC-006**: 100% of user-submitted listings remain invisible to the
  public until an admin approves them.
- **SC-007**: 100% of signed-in users with saved items or filters see a
  "Similar opportunities" section that returns relevant matches within
  2 seconds, computed without external paid services.

## Assumptions

- The platform is provided primarily in English for v1.
- Opportunity discovery (US1) is the v1 MVP; dashboard, blog, and admin
  are delivered incrementally after it.
- Authentication uses standard email-based sign-in with password
  recovery; social sign-in is out of scope unless requested.
- Data retention follows industry-standard privacy practice; users can
  opt out of all email and notifications.
- Newsletter consent is explicit and separate from account
  notifications.
- A single administrator role is sufficient for v1; sub-role
  granularity is out of scope.
- Success stories are a type of blog article and reuse blog fields.
- Listings are initially sourced by platform staff; registered users may
  submit listings for approval (visitors cannot submit).
- All functionality MUST run on free-tier infrastructure only (no paid
  add-ons or external AI/ML services); personalized recommendations are
  rule-based and computed from platform data.
- V1 scale is small: under 5,000 active listings and under 10,000
  registered users, well within free-tier capacity.
- Email is sent via free-tier services only: Supabase built-in Auth
  emails plus a free email API (e.g., ~100 emails/day) for deadline
  reminders, digests, and newsletters. Broadcasts and digests MUST fit
  within free quotas and always honor opt-out.
- All content is publicly accessible without registration; accounts are
  for personal features only.