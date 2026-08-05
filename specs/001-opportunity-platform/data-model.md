# Data Model: SPARK Opportunity Platform

**Phase 1 output** — entities, fields, relationships, validation, and
state transitions derived from `spec.md` and `research.md`.

## Conventions

- All tables live in Supabase PostgreSQL and are protected by Row Level
  Security (RLS). Public tables grant `SELECT` to everyone (anon);
  user-owned tables restrict to `auth.uid()`; admin tables restrict to
  the `admin` role.
- Soft deletion where admins need auditability; hard delete allowed for
  user-owned rows.
- Timestamps: `created_at`, `updated_at` (timestamptz, default now).

## Entities

### User

Backed by Supabase Auth (`auth.users`); profile data in `profiles`.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | = `auth.uid()` |
| email | text | from auth.users |
| role | text | `user` (default) or `admin` |
| full_name | text | profile display name |
| headline | text | optional, e.g., "Engineering student" |
| country | text | for recommendations |
| interests | text[] | opportunity type preferences |
| newsletter_opt_in | boolean | separate from account email |
| notification_settings | jsonb | deadline_reminders, new_matches, digest, newsletter |
| created_at / updated_at | timestamptz | |

**RLS**: owner only (`auth.uid() = id`); admin can read all.

**Uniqueness**: id; email (from auth).

### Opportunity

Typed listing; one row per listing.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| type | text | scholarship \| job \| internship \| fellowship \| conference \| exchange_program \| competition \| grant \| professional_development |
| slug | text UNIQUE | URL identifier |
| status | text | draft \| pending \| published \| closed |
| source_url | text | official apply link (required to publish) |
| verified_by | uuid FK → profiles | admin who last verified |
| verified_at | timestamptz | last-verification date |
| submitter_id | uuid FK → profiles | user who submitted (null = staff) |
| deadline | date | nullable for rolling roles |
| country | text | |
| title | text | |
| summary | text | short teaser |
| fields (type-specific) | jsonb | per-type field set (below) |
| featured | boolean | shown on home "Featured" |
| view_count | integer | anonymous aggregate |
| created_at / updated_at | timestamptz | |

**Type-specific fields (`fields` jsonb)**, validated by zod per type:

- **scholarship**: university, degree, funding_type, eligibility,
  cgpa, ielts_toefl, required_documents, benefits
- **job**: organization, location, experience, salary (optional)
- **internship**: company, duration, paid_unpaid, skills
- **fellowship** / **conference**: host, benefits, eligibility, dates
- **exchange_program**: host, benefits, eligibility, dates
- **competition**: organizer, prizes
- **grant**: grantor, amount
- **professional_development**: provider, format_duration, fees

**RLS**: `published` or `closed` rows readable by anon; all rows readable
by admin; submitter can edit own `pending` rows.

**Uniqueness**: slug; (title, type, source_url) as a soft-duplicate
warning key for the admin approval gate (G1).

### BlogArticle

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | |
| status | text | draft \| pending \| published \| archived |
| title | text | |
| featured_image | text | Supabase Storage URL |
| author_id | uuid FK → profiles | |
| category_id | uuid FK → category | |
| seo_keywords | text[] | |
| content | text | article body |
| related_posts | uuid[] | FK → blog_articles |
| verified_by / verified_at | uuid, timestamptz | traceability |
| created_at / updated_at | timestamptz | |

**RLS**: published readable by anon; admin CRUD.

### Category

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | text UNIQUE | e.g., "Application Tips", "CV & SOP" |
| kind | text | `opportunity` \| `blog` |

### SavedItem

| Field | Type | Notes |
|-------|------|-------|
| user_id | uuid FK → profiles | |
| opportunity_id | uuid FK → opportunities | |
| created_at | timestamptz | |

**RLS**: owner only. **PK**: (user_id, opportunity_id) — no duplicates.

### ApplicationRecord

| Field | Type | Notes |
|-------|------|-------|
| user_id | uuid FK → profiles | |
| opportunity_id | uuid FK → opportunities | |
| applied_at | timestamptz | |
| notes | text | optional |

**RLS**: owner only. **PK**: (user_id, opportunity_id).

### Submission

User-submitted content awaiting approval. Links to the target entity.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| submitter_id | uuid FK → profiles | |
| target_type | text | `opportunity` \| `blog_article` |
| payload | jsonb | the submitted content |
| status | text | pending \| approved \| rejected |
| reviewer_id | uuid FK → profiles | |
| reviewed_at | timestamptz | |
| created_at | timestamptz | |

**RLS**: submitter can read own; admin read/manage all. On approval, the
payload materializes into the target table with `status=pending`.

### ActivityMetric / Event

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| action | text | view \| search \| save \| signup \| subscribe |
| day | date | |
| target_id | uuid | nullable (opportunity id) |
| count | integer | aggregated daily counter |

**RLS**: admin only. No PII — anonymous aggregates (G4).

### NewsletterSubscriber

| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| email | text UNIQUE | |
| subscribed_at | timestamptz | |
| status | text | active \| unsubscribed |

**RLS**: public insert (anon); read/manage admin only. Consent explicit
(FR-011).

## State Transitions

### Opportunity / BlogArticle status

```text
draft ──(submit/auto)──► pending ──(admin approve)──► published
   ▲                        │                             │
   └────────────┘(edit)     └─(reject)──► draft           ├─(deadline passed, listing only)
                                                            ▼
                                                          closed
```
- BlogArticle: `published → archived` (manual).
- Opportunity: `published → closed` automatic when `deadline < today`
  (FR-003); admin can reopen.
- User submissions: always enter `pending`; invisible to anon until
  approved (FR-009).

## Validation Rules (from spec)

- Required fields + official apply link enforced by the approval gate —
  admin cannot publish a listing/article with missing fields (G1,
  FR-002, FR-009).
- `source_url` MUST be the official source; no affiliate links (G1).
- Save/apply unique per (user, opportunity) (FR-005).
- Email sends respect `notification_settings` and `status=active` on
  subscriptions (FR-011).
