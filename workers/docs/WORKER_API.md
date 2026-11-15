# NUSYA Worker API — Implementation Contracts

**Status:** Code implemented locally, integration tested. Cloudflare bindings, production domain, live authentication and email remain unconfigured.

## Public Worker

| Endpoint | Method | Behaviour |
| --- | --- | --- |
| `/en/...`, `/ar/...`, `/ru/...` | GET | Prerendered pages with published D1 plain-text/SEO/media overrides, 90-second edge cache, no draft content |
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
| `/api/v1/admin/pages` | GET | Editor/owner | All seven page keys, three locales and statuses |
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
| `/api/v1/admin/media/:id/publish` | POST | Owner | Consent-confirmed publication of image |
| `/api/v1/admin/media/:id` | GET | Editor/owner | Protected draft media preview |

The content payload is a schema-bounded structure `{fields:{...},seo:{title,description},media:{heroPortrait,aboutPortrait}}`, not arbitrary HTML. Text is inserted safely with HTMLRewriter; external video links are allowlisted and approved. `baseRevision` must match the latest draft; unexpected edits return 409. Arabic/Russian published copy remains stable if the English source changes and review state becomes `needs_review`.

## Source-of-truth settings

All new services default to `acceptingRequests=false` until Nozha approves current availability. The `approvedTranslationPairs` list is **directed**, e.g. `en:ru` does not imply `ru:en`. There is no Korean service or fourth public locale. The video is the supplied Vimeo ID/hash and can be updated to another allowlisted privacy-hashed Vimeo URL.

## Failure and cost contract

- Public API fails closed if Turnstile secret, D1, HMAC salt or necessary service settings are absent.
- Worker scripts are invoked for public HTML, `/api/` and approved media; static assets are served as free static asset routes when configured.
- Public published HTML cache freshness: up to 90 seconds per Cloudflare cache location. Private previews, admin and enquiry responses cannot be cached.
- Email via Cloudflare Email Service is optional and destination-restricted. The outbox remains durable even if sending is not configured or fails. No false `sent` status.
- A cron retry is optional and disabled by default; avoid unnecessary polling/Queues/KV/AI.
- Actual Cloudflare usage, accessibility, Vimeo ownership and live domain must be tested **after separate authorization and deployment**.
