# Conceptual Data Model — Not an Existing Database

The repository contained no DB schema when docs were initialized. The entities below are a suggested minimal conceptual model; verify requirements, then create migrations and tests only after approvals.

| Entity | Essential attributes | Constraints |
| --- | --- | --- |
| `content_entries` | id, kind, stable key/slug, status, timestamps | Stable identity; prevent duplicate slugs |
| `content_locales` | entry_id, locale, published_revision, draft_revision, source_revision_seen, review_status | Unique (entry_id, locale); only en/ar/ru |
| `content_revisions` | immutable revision id, entry, locale, validated section payload, author, timestamp, hash | Append-only; bound retention |
| `media_assets` | id, storage key, type, dimensions, source/license/consent, reference state | No unapproved/missing media publication |
| `services` (or typed content entry) | name/key, enabled, kind, eligibility, booking link, supported pairs | No disabled service CTA, no unsupported pair |
| `enquiries` | public ref, type, locale, minimal contact, validated service fields, status, created/updated/retention dates | Pagination; contact remains private |
| `enquiry_events` | enquiry id, actor, status/note/notification outcome, timestamp | Privileged access, avoid PII logs |
| `admin_audit` | actor, entity, action, revision, outcome, time | Protected and minimally retained |
| `notification_outbox` (optional) | event id, target, attempt count, next retry, status | Deduped and bounded retries |

## Publish data guarantees
- Draft and published revision pointers are distinct.
- Publish is atomic per entry/locale; never expose partial published fields.
- On source update, other translations flagged for review but published translations remain stable.
- Media reference and link validation run before publication.
- Concurrent edits use optimistic locks; rollback restores an existing approved revision.
- Never cache draft, admin, contact details or private enquiry records publicly.

## Enquiry safety
- Enforce server-side form schema, required/optional fields by service, approved directed translation pairs, valid calendar dates/timezone, and disallow source=target.
- Idempotency token and unique opaque reference. Store enquiry before claiming success.
- Status transitions controlled by authenticated staff; notification failure must not drop request.
- Retention and deletion policy defined based on actual legal/business needs, not assumed.
- No arbitrary file uploads initially.

## Query/index guidance
Indexes only based on actual query patterns. Candidates: (entry_id,locale), (entry_id,created_at DESC), (status,created_at DESC) for enquiries, (type,created_at DESC), retention expiry and dedup token. Avoid N+1 public reads, unlimited scans, unindexed large sorts, per-keystroke writes and over-indexing.

## Migration discipline
Versioned migrations, reviewable data change, staging rehearsal, backup/export and restore test before production. No table/schema creation or Cloudflare D1 interaction is authorized by this document itself.
