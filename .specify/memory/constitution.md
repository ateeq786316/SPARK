<!--
  SYNC IMPACT REPORT — v1.0.0 (initial ratification)
  Version change: N/A (placeholder template) → 1.0.0
  Modified principles: none (first content)
  Added sections: Core Principles (5), Technology & Architecture
    Constraints, Development Workflow & Quality Gates, Governance
  Removed sections: none
  Templates requiring updates:
    ✅ .specify/templates/constitution-template.md — source; content
      derived from it (template itself unchanged)
    ✅ .specify/templates/plan-template.md — Constitution Check gate
      verified against new principles; no change required
    ✅ .specify/templates/spec-template.md — requirements/scenarios
      aligned; no change required
    ✅ .specify/templates/tasks-template.md — task phases aligned;
      no change required
    ✅ .specify/templates/checklist-template.md — generic; no change
      required
  Deferred TODOs: none
-->

# SPARK Constitution

## Core Principles

### I. Opportunity Data Integrity (NON-NEGOTIABLE)

Every published listing (scholarships, jobs, internships,
fellowships/conferences) MUST include all required fields for its type
as defined in the SPARK content requirements, including an official
application link, eligibility criteria, and deadline. Deadlines MUST be
tracked and listings MUST be automatically flagged or removed once the
deadline has passed. Application links MUST point to the official
source; no affiliate or unverified links. Rationale: trust in the
accuracy and currency of listings is the platform's core value
proposition.

### II. Content Governance & Moderation

Content is admin-curated plus moderated user submissions. Any
user-submitted listing MUST be approved by an administrator before it
becomes publicly visible. Administrators MUST be able to add, edit, and
delete listings, manage users, approve content, and review analytics.
Every listing MUST be traceable to its source and last-verified date.
Rationale: a single trusted hub requires that nothing reaches the public
feed without an accountable review step.

### III. User-First Experience & Accessibility

The platform MUST deliver best-in-class UI/UX: accessible (WCAG AA),
responsive, fast, and free of dark patterns. Search, filtering,
personalized recommendations, saved items, applied lists, profiles, and
notification settings MUST be discoverable and usable. Users MUST be
able to opt in to and out of notifications. Rationale: the product is a
consumer discovery platform; experience quality is a product
requirement, not a nicety.

### IV. Security & Privacy

All authentication and data access MUST go through Supabase Auth with
Row Level Security (RLS) policies that restrict access to the minimum
required. A user MUST only be able to read and modify their own saved
items, applied list, profile, and notification settings. Secrets MUST
never be committed to the repository or exposed to the client.
Notifications and email MUST respect user consent. Rationale: users
entrust personal data and career ambitions to the platform.

### V. Simplicity & Maintainability

The system MUST use the single frontend + Supabase backend model
adopted by the constitution; no additional services unless justified.
Logic MUST live in typed, well-structured Next.js modules. Features
MUST follow YAGNI: start simple, add complexity only when a concrete
requirement demands it. Rationale: a small platform benefits most from
few moving parts and low maintenance overhead.

## Technology & Architecture Constraints

- **Frontend**: Next.js (React) with TypeScript, styled with Tailwind
  CSS, deployed on Vercel.
- **Backend-as-a-Service**: Supabase providing PostgreSQL, Auth,
  Storage, and Realtime; integrated via the official Supabase SDK.
- **Roles**: three access tiers — public visitor, authenticated user,
  administrator. Role-based access MUST be enforced at the API and
  database layers, never only in the UI.
- **Data model**: schema-driven; schema changes MUST go through a
  migration reviewed against the Content Governance principle.
- **Design system**: shared UI primitives, consistent tokens, and
  responsive layouts to satisfy the User-First Experience principle.

## Development Workflow & Quality Gates

- Feature work follows the speckit flow: specification → plan (with
  Constitution Check gate) → tasks → implementation → checklist.
- Before any merge, the change MUST pass typecheck, lint, and a
  production build (`next build`); tests MUST run where the feature
  spec requires them.
- Code review MUST verify compliance with every principle in this
  constitution, especially Data Integrity and Security & Privacy.
- Content-related changes MUST be reviewed against the Opportunity Data
  Integrity checklist (all required fields present, official links,
  valid deadline).
- Analytics used by the admin dashboard MUST be privacy-respecting and
  MUST NOT require personal data for core reporting.

## Governance

This constitution supersedes all other project practices. Amendments
require: (1) a documented change with rationale, (2) approval, and (3) a
migration plan where the change affects templates, schema, or deployed
behavior. Versioning is semantic: MAJOR for backward-incompatible
principle changes or removals, MINOR for added principles or materially
expanded guidance, PATCH for clarifications and typo fixes. Compliance
is reviewed at every speckit gate and during code review; violations
MUST be justified in writing before they can ship. Use the current plan
in `specs/` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-08-05 | **Last Amended**: 2026-08-05
