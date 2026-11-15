# NUSYA Worker API — Implementation Contracts

## Editorial interface additions

- `GET /api/v1/admin/summary` adds `lastPublication: null | {pageKey, locale, revision, action: 'publish'|'rollback', occurredAt}` from successful audit records; no actor identity is returned in this summary.
- Page `fieldSchema` adds English `label`, `group` and `editable` metadata alongside existing length/multiline bounds. Historical heading aliases remain accepted, but the editor hides duplicate aliases.
- Non-English translation review requires `sourceRevision` (positive integer, or explicit null when no English draft exists). The editor supplies the English draft revision it displayed; an atomic comparison rejects approval if that source changed. Omitting this value returns 400, including from older tabs/scripts, which must reload or adopt the current contract. English review does not require this property.
- UK/EN/AR/RU infographic fields use the existing bounded plain-text payload; absent historical fields retain static defaults. Existing owner revisions are never rewritten.
- Localized missing-page documents return 404 and noindex. Server-rendered service status removes closed enquiry actions, while the API continues to validate availability and directed pairs independently.
- `GET /api/v1/admin/media?status=private|published|all&limit=20&cursor=...` returns up to 50 protected metadata records in insertion order: `id`, `contentType`, `byteSize`, `altText`, `source`, `published`, `createdAt`, with `nextCursor`. Default status is `private`; opaque pagination cursors come from the previous response. Saved provenance and pending uploads survive browser sessions; approval remains owner-only. An additive publication index bounds filtered reads without rewriting media records.

**Status:** This contract describes the implemented platform. Existing Worker/resource inventory and deployment evidence are recorded in [PRODUCTION](../../docs/PRODUCTION.md) and the associated release PR; this API document is not a deployment receipt.

## Public Worker

| Endpoint | Method | Behaviour |
| --- | --- | --- |
| `/uk/...`, `/en/...`, `/ar/...`, `/ru/...` | GET | Prerendered pages with published D1 plain-text/SEO/media overrides, 90-second edge cache, no draft content |
| `/api/v1/config` | GET | Only safe public site key, accepting-status and approved language directions; no secrets |
| `/api/v1/enquiries` | POST | Strict schema, approved service/directed pair, valid Turnstile, HMAC IP rate limit, idempotent D1 + outbox transaction; HTTP 201 only after stored |
| `/media/:id` | GET | Only explicitly approved media records from bound R2; unapproved files return 404 |

Example public request:

```json
{
  "idempotencyKey": "147c6758-628f-41cf-bc71-a600ad47eae9",
  "locale": "en",
  "type": "lesson",
  "name": "Example Visitor",
  "email": "visitor@example.com",
  "message": "I would like to practise English conversation.",
  "details": {"language":"english", "goal":"Conversation"},
  "privacyAcknowledged": true,
  "turnstileToken": "<short-lived site-specific token>"
}
```

On acceptance:

```json
{"ok":true,"reference":"NS-1234567890ABCDEF","acceptedAt":"<ISO timestamp>","notificationStatus":"pending"}
```

The reference and timestamp shown above are examples, not live records. HTTP 201 indicates saved, **not** necessarily emailed. Retries with the same idempotency key and identical canonical data return the original reference; same key with changed content returns 409. Errors use `{"ok":false,"code":"...","message":"..."}` and never reveal personal records.

## Admin Worker

**Every admin path requires a cryptographically verified Access JWT AND a listed owner/editor identity.** It is intended only for `admin.nozha-badavi.com`, with Access protecting the entire hostname before the Worker. Admin responses are `Cache-Control: no-store`.

| Endpoint | Method | Role | Result |
| --- | --- | --- | --- |
| `/api/v1/admin/me` | GET | Editor/owner | Verified identity and role |
| `/api/v1/admin/summary` | GET | Editor/owner | Live open-enquiry and translation-review counts |
| `/api/v1/admin/pages` | GET | Editor/owner | All seven page keys, four locales and statuses |
| `/api/v1/admin/pages/:key?locale=..` | GET | Editor/owner | Default, draft and published structured data, revision pointers |
| `/api/v1/admin/pages/:key?locale=..` | PUT | Editor/owner | Save validated draft with `baseRevision` optimistic lock |
| `/api/v1/admin/pages/:key/revisions` | GET | Editor/owner | Latest 20 revisions |
| `/api/v1/admin/pages/:key/review` | POST | Editor/owner | Approve translated draft |
| `/api/v1/admin/pages/:key/publish` | POST | Owner | Atomic published pointer, media approval enforcement |
| `/api/v1/admin/pages/:key/rollback` | POST | Owner | Restore prior known revision |
| `/preview/:locale/:page/` | GET | Editor/owner | Private HTML preview of saved draft; noindex/no-store/CSP script disabled |
| `/api/v1/admin/settings` | GET/PUT | Editor/owner for read; owner for write | Video, service visibility, approved directed language pairs, public links |
| `/api/v1/admin/enquiries` | GET | Editor/owner | Status-filterable cursor-paginated enquiry list |
| `/api/v1/admin/enquiries/:reference` | GET/PATCH | Editor/owner | Read detail, audit status changes |
| `/api/v1/admin/notifications/retry` | POST | Owner | Bounded retry of failed/pending notification outbox |
| `/api/v1/admin/media` | POST | Editor/owner | Private validated photo upload to R2 (optional binding) |
| `/api/v1/admin/media` | GET | Editor/owner | Private/published library, saved provenance and bounded cursor pagination |
| `/api/v1/admin/media/:id/publish` | POST | Owner | Consent-confirmed publication of image |
| `/api/v1/admin/media/:id` | GET | Editor/owner | Protected draft media preview |

The content payload is a schema-bounded structure `{fields:{...},seo:{title,description},media:{heroPortrait,aboutPortrait}}`, not arbitrary HTML. Text is inserted safely with HTMLRewriter; external video links are allowlisted and approved. `baseRevision` must match the latest draft; unexpected edits return 409. Arabic/Russian published copy remains stable if the English source changes and review state becomes `needs_review`.

### Teaching experience and testimonials

The homepage payload also accepts optional `testimonialsEnabled: boolean` (missing means false). Existing revisions therefore keep the new section hidden, including after rollback. Home fields reuse `proof_0`, `proof_1`, `proof_2` and add `testimonials_title`, `testimonials_intro`, `testimonials_rating`, `testimonials_snapshot`, and `review_{yura,m,serg}_{quote,author,date}`. Earlier draft keys `proof_age`, `proof_levels`, `proof_formats` remain accepted but are hidden from the editor; current rendering uses the existing numbered proof fields. About and Lessons expose `teaching_experience`; Lessons also exposes `english_experience` and `russian_experience`. The combined catalogue has 73 allowlisted homepage fields, so the payload cap is 128 fields; every key and per-field length remain strictly validated. The normal escaping and translation review apply; there is no new table or route.

Home-only optional media keys `reviewYuraScreenshot`, `reviewMScreenshot` and `reviewSergScreenshot` accept existing media IDs (10–80 ASCII letters, digits, hyphen or underscore). No external image URLs are accepted. Publish/rollback require each referenced asset to be published with consent. The public media endpoint requires both publication and consent. Private previews use the authenticated media route. Review images use dedicated links and accessible labels, not the managed-portrait renderer; no source image is loaded before its link is opened. Empty quotations/authors remove their cards; absent image IDs leave text-only cards. Rating snapshots remain attributed plain text, never `AggregateRating` structured data or an automatic platform feed.

## Source-of-truth settings

All new services default to `acceptingRequests=false` until Nozha approves current availability. The `approvedTranslationPairs` list is **directed**, e.g. `en:ru` does not imply `ru:en`. Public locales are exactly UK/EN/AR/RU, with no Korean service or locale. The video is the supplied Vimeo ID/hash and can be updated to another allowlisted privacy-hashed Vimeo URL.

## Failure and cost contract

- Public API fails closed if Turnstile secret, D1, HMAC salt or necessary service settings are absent.
- Worker scripts are invoked for public HTML, `/api/` and approved media; static assets are served as free static asset routes when configured.
- Public published HTML cache freshness: up to 90 seconds per Cloudflare cache location. Private previews, admin and enquiry responses cannot be cached.
- Email via Cloudflare Email Service is optional and destination-restricted. The outbox remains durable even if sending is not configured or fails. No false `sent` status.
- A cron retry is optional and disabled by default; avoid unnecessary polling/Queues/KV/AI.
- Actual Cloudflare usage, accessibility, Vimeo ownership and live domain must be tested **after separate authorization and deployment**.


## Review hardening — 2026-11-15

Review changes: page GET includes fieldSchema (maxLength/multiline); revision list includes published eligibility; /preview/:locale/:page/?revision=:id renders an authenticated page-owned historical revision. Preview media uses /api/v1/admin/media/:id. Translated drafts require POST review before publish; publishing also validates the reviewed English source revision. Rollback returns PUBLICATION_REQUIRED for never-published revisions and rechecks media approval. Public page aliases redirect 308 to canonical routes with queries preserved. Dynamic HTML does not issue template ETags.
