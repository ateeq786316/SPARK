# Email Setup: Stop SPARK emails from going to spam

Auth emails currently leave from Supabase's **shared** sender (that's why they land in
spam and look generic). Fixing it has three parts, in this order:

1. **Custom SMTP via Google** (removes the shared-sender spam reputation)
2. **Branded templates** (paste the `.html` files below into the Supabase dashboard)
3. **Test**

---

## 1. Custom SMTP via Google (deliverability)

Use a Google account's SMTP relay with an **App Password**. Works with free Gmail
(`@gmail.com`) or a Google Workspace account on your own domain.

### Create an App Password

1. On the Google account you want to send from, turn on **2-Step Verification**:
   Google Account → Security → 2-Step Verification → Turn on.
2. Security → **App passwords** → Create → name it `spark` → copy the **16-character**
   password. Keep the spaces as shown (e.g. `abcd efgh ijkl mnop`) — the app uses it
   verbatim; it is shown only once.

### App emails (newsletter broadcast + deadline reminders)

App code sends through the same account. In `.env.local`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-google-account@gmail.com>
SMTP_PASS="abcd efgh ijkl mnop"
SMTP_FROM_EMAIL="SPARK <your-google-account@gmail.com>"
SMTP_DAILY_QUOTA=400
```

- The **sender must be the same account** as `SMTP_USER` — Gmail only relays mail from
  the authenticated address. Don't invent a different "from".
- Port `587` (STARTTLS) is verified working; `465` (SSL) also works if you prefer.
- The App Password is stored with its spaces and **quoted** in `.env.local`.
- Gmail limits ~500 recipients/day on free accounts; `SMTP_DAILY_QUOTA` keeps us safely
  under that (default 400).

### Supabase Auth emails (confirm / reset / invite)

Supabase Dashboard → **Authentication → Email → SMTP settings** → enable Custom SMTP:

| Setting | Value |
|---|---|
| Host | `smtp.gmail.com` |
| Port | `465` (SSL) |
| Username | your full Google address, e.g. `you@gmail.com` |
| Password | your 16-char App Password (spaces optional here) |
| Sender | `SPARK <you@gmail.com>` |

> Auth emails (confirm/reset/invite) are sent by Supabase through this SMTP. Emails
> sent from app code (newsletters, reminders) use the same credentials via Nodemailer —
> both go through your Google account.

---

## 2. Branded templates

Supabase Dashboard → **Authentication → Email → Templates** → click each template,
paste the matching HTML file, Save:

| Template | File |
|---|---|
| Confirm signup | `supabase/email-templates/confirmation.html` |
| Reset password | `supabase/email-templates/reset.html` |
| Invite user | `supabase/email-templates/invite.html` |
| Magic link | reuse `confirmation.html` (tokens are identical) |

Also set **Email → Confirm email** `ON` in Authentication → Providers → Email.

---

## 3. Test

- Send yourself a real email (newsletter broadcast in `/admin/email`) → check it lands in
  Inbox, branded, and the SMTP error (if any) is visible in the admin Email page.
- Register a throwaway account in the app → the confirmation email should be in Inbox.
- If a mail lands in spam: Gmail/Google Workspace handles SPF + DKIM automatically for
  `@gmail.com`. For a **custom domain**, use Google Workspace and enable **DKIM
  signing** in Google Admin (Apps → Gmail → Authenticate email) — that's what fixes spam.

---

## Why emails were going to spam

- Emails were sent from Supabase's shared pool of sender addresses → shared bad
  reputation + no SPF/DKIM on your own domain.
- Fix = send from **your own Google account** with proper authentication and a real
  "from" address. That is exactly what steps 1–3 configure.
