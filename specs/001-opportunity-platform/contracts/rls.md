# Contract: Row Level Security (RLS)

Enforcement matrix — the constitution (G4/G6) requires authorisation at
the database layer, never only in the UI. Every table has RLS enabled.

| Table | anon (public) | authenticated user | admin |
|-------|--------------|---------------------|-------|
| profiles | read public profile (name, country, interests) | read/update own | read/update all |
| opportunities | SELECT `published`/`closed` | + insert own submissions (`pending`), update own `pending` | full CRUD |
| blog_articles | SELECT `published` | read | full CRUD |
| category | SELECT | SELECT | full CRUD |
| saved_items | — | SELECT/INSERT/DELETE own (`user_id = auth.uid()`) | read all |
| application_records | — | SELECT/INSERT/UPDATE own | read all |
| submissions | — | SELECT/INSERT own | full manage |
| events (analytics) | INSERT anonymous events | INSERT anonymous events | SELECT all |
| newsletter_subscribers | INSERT (subscribe) | INSERT | SELECT/manage, update own subscribe/unsubscribe |

## Notes

- Auth is via `auth.uid()`; `role` comes from `profiles.role`.
- Admin enforcement uses a `is_admin()` SQL helper comparing
  `profiles.role = 'admin'` with a security definer to avoid recursion.
- Public SELECT is always limited to `status IN ('published','closed')`
  for opportunities and `status='published'` for blog articles (FR-009).
- Anonymous analytics inserts carry no user identifier (privacy, G4).
- All mutations go through the SDK with RLS as the backstop; the UI
  layer cannot bypass policies.
