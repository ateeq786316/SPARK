# Contract: Email

Free-tier email delivery (FR-011). See `research.md` §2.

## Channels

| Channel | Provider | Trigger | Free quota |
|---------|----------|---------|------------|
| Account emails | Supabase Auth | confirmation, password reset | unlimited within free auth |
| Deadline reminders | Resend (free) | scheduled (pg_cron → Edge Function) | ~100/day, 3,000/mo |
| Digest / new matches | Resend (free) | scheduled, per user settings | same quota |
| Newsletter broadcast | Resend (free) | admin action | same quota, batched |

## Send Contract

- Sender: a single verified "from" address.
- Recipients: only `notification_settings.* = true` (users) or
  `status='active'` (newsletter subscribers). Full opt-out honored.
- Quota guard: daily counter stops the send loop at 100/day; remaining
  recipients queued for next cycle.
- Key (`RESEND_API_KEY`) lives only in server env vars — never client.
- Template: plain HTML with unsubscribe link; no tracking pixels.

## Endpoints / Scheduling

- `POST /api/email/send` — server-only, invoked by scheduled Edge
  Function (pg_cron daily job) for reminders/digests; admin-triggered for
  newsletters.
- Unsubscribe link → sets `status='unsubscribed'` or toggles the
  channel setting.
