# Contract: Admin Console (US4)

Admin role only. RLS + middleware enforce `role = 'admin'`.

## Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Overview + approval queue |
| `/admin/listings` | CRUD all opportunity types |
| `/admin/listings/[id]` | Edit listing; publish/approve/reject |
| `/admin/blog` | CRUD blog articles |
| `/admin/users` | Manage user accounts (view, role change, suspend) |
| `/admin/analytics` | Aggregate metrics |
| `/admin/email` | Send/queue newsletter broadcast |

## Actions

- **Create/edit/delete** listings & articles → `status=draft` until
  published (FR-008).
- **Approve**: from `pending`; approval gate validates every required
  field + official `source_url`; blocked with a gap list if incomplete
  (FR-009, G1). Sets `verified_by`, `verified_at`.
- **Reject**: returns submission to `draft` with optional reason.
- **Manage users**: list/search users, promote/demote role, suspend.
- **Analytics**: aggregate counts — published listings by type, views,
  searches, saves, signups, newsletter subscribers (no PII, G4).
- **Email**: compose + send newsletter to active subscribers/digest
  lists; respects opt-out; respects free-tier daily quota (~100/day).

## Rules

- Every action that publishes content sets traceability
  (`verified_by`/`verified_at`) (G2).
- Duplicate warning: creating a listing matching (title, type,
  source_url) shows a soft-warning before publish (G1).
- All lists paginated (max 50/page).
