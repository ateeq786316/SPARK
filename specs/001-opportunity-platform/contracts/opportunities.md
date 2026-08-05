# Contract: Public Opportunities

Public discovery surface (US1). Anonymous access, RLS-gated to
`status IN ('published','closed')`.

## Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/` | GET | Home: hero, search, featured (6), latest (8), success stories, newsletter CTA |
| `/opportunities` | GET | List all types with search/filter |
| `/opportunities?type=scholarship&country=us&q=chevening` | GET | Filtered list |
| `/opportunities/[slug]` | GET | Listing detail (all required fields) |

## Search & Filter Query Contract

- `q` — keyword, matched with Postgres FTS on title+summary (tsvector).
- `type` — one of the 9 opportunity types.
- `country` — ISO-ish text filter.
- `status` — implied: open only by default; `closed` hidden unless
  explicitly requested.
- `page` / `cursor` — pagination.
- Sort: featured first, then deadline ascending, then created_at desc.

**Response (list)**:

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "chevening-scholarships-2027",
      "type": "scholarship",
      "title": "...",
      "country": "UK",
      "deadline": "2027-03-15",
      "status": "published",
      "featured": false
    }
  ],
  "next_cursor": null
}
```

**Response (detail)**: adds `source_url`, `eligibility`, `fields`
(type-specific), `benefits`, `required_documents` (where applicable),
`verified_at`. Closed listings omit actionable `source_url` emphasis and
show a "Closed" state (FR-003).

## Rules

- 95% of searches return within 2s (SC-003).
- Every view increments an anonymous `view` event (analytics, no PII).
- Save/apply actions on detail page require auth (handled by
  dashboard contract).
