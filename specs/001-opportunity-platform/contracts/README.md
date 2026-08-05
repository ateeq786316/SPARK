# Contracts Overview: SPARK Opportunity Platform

Interface contracts for the web application. This is a UI + serverless
app, so contracts describe the server-rendered routes, form/server
actions, and the RLS-enforced data access surface that the UI relies on.

## Contract Files

- [`opportunities.md`](./opportunities.md) — public discovery, search,
  filtering, listing detail
- [`auth.md`](./auth.md) — register, login, logout, session
- [`dashboard.md`](./dashboard.md) — saved, applied, profile,
  notifications, recommendations (authenticated)
- [`admin.md`](./admin.md) — content CRUD, approvals, users, analytics,
  email (admin only)
- [`email.md`](./email.md) — free-tier email sending contract
- [`rls.md`](./rls.md) — Row Level Security access matrix

## Conventions

- All data access goes through Supabase; RLS is the enforcement layer.
  Route handlers/actions only expose what the UI needs.
- Response shape: `{ data }` on success, `{ error }` on failure with a
  user-safe message (no internal details).
- Dates: ISO 8601 UTC. Money: integer minor units or text range.
- Pagination: `limit` (max 50) + `offset` for admin lists; public lists
  use `cursor` (created_at/id).
