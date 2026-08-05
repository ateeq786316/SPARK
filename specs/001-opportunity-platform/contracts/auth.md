# Contract: Auth

US2 prerequisite. Supabase Auth email/password.

## Routes / Actions

| Action | Method | Purpose |
|--------|--------|---------|
| `/register` | POST | Create account, send confirmation email (Supabase Auth, free) |
| `/login` | POST | Email + password sign-in |
| `/logout` | POST | End session |
| `/forgot-password` | POST | Password reset email |

## Session Handling

- Cookie-based session via `@supabase/ssr`; `middleware.ts` refreshes the
  session and enforces route groups:
  - `(dashboard)/**` → requires authenticated user; else redirect to
    `/login?next=<path>` and return to same page after login (edge case:
    visitor tries to save).
  - `admin/**` → requires `role = 'admin'`; else 404/redirect.
- Session never stored in client state; server components resolve the
  user via `createServerClient`.

## Rules

- Confirmation + password-reset emails come from Supabase Auth (free,
  no API key in client).
- Password policy: min 8 chars (Supabase default).
- Errors surface user-safe messages only (no stack traces).
