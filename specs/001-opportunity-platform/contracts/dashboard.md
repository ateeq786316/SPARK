# Contract: Dashboard (Authenticated User)

US2 personal area. All data owner-scoped via RLS (`auth.uid()`).

## Routes / Actions

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview: recent saved, recent applied, quick stats |
| `/dashboard/saved` | Saved items list; unsave |
| `/dashboard/applied` | Applied list; mark applied |
| `/dashboard/settings` | Profile edit + notification settings |

## Actions

- **Save / unsave** a listing: `POST /api/saved {opportunity_id}` /
  `DELETE /api/saved/:id`. Unique per (user, opportunity).
- **Mark applied**: `POST /api/applied {opportunity_id}`; idempotent
  (upsert).
- **Update profile**: `PATCH /api/profile` — full_name, headline,
  country, interests.
- **Update notifications**: `PATCH /api/settings` — per-channel booleans
  (deadline_reminders, new_matches, digest, newsletter). Full opt-out
  honored (FR-011).
- **Similar opportunities**: `GET /api/recommendations` — rule-based:
  `type IN (user.interests ∪ saved types) AND country = user.country AND
  status='published' AND NOT already saved/applied`, limit 6, within 2s
  (SC-007, FR-013).

## Rules

- A user MUST only read/modify their own saved, applied, profile, and
  settings (FR-005, FR-006, G4).
- Deleted listing referenced by a saved/applied row shows "no longer
  available" state.
- Signed-out save/apply → redirect to login then back to the same
  listing.
