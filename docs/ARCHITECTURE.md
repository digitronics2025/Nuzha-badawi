# Conditional Architecture & Integration Design

**No implemented stack was present when docs were first created.** All technology references are recommendations subject to future codebase and vendor verification, not deployed resources.

## Design principles
Simple, secure, low-cost, SEO-friendly, accessible, mobile-first, maintainable, reversible changes. Protect Cloudflare quotas and prevent unnecessary data operations.

## Candidate stack if starting from zero
- Astro + TypeScript + Tailwind for content-focused public frontend.
- Cloudflare Workers for pages/validated APIs, D1 for CMS revisions and enquiry data.
- R2 **only** if the admin needs uploaded images/media; bundle stable assets where feasible.
- Cloudflare Access or equivalent managed identity for owner/admin + app-level authorization.
- Server-validated Turnstile for public forms; a minimal transactional email integration; privacy-aware web analytics.
- GitHub CI only when actual build stack and environments are established; no deployment by default.

Prefer existing proven technology if future code inspection reveals something else. **Do not create infrastructure without authorization.**

## Runtime boundaries
Public cacheable pages and assets ↔ published content projection; private admin APIs ↔ authenticated drafts and revisions; public enquiry POST ↔ minimal validated form handler; external Preply/Vimeo ↔ approved outbound/embed links. No secrets in browser. No public generic CMS API or client-side privileged D1 access.

## Critical publishing architecture decision
Static generated pages cannot change just because D1 is updated. Choose one model deliberately:
- **Cached server-rendered publishing**: Worker renders published revision, indexed bounded D1 reads only on cache miss; explicit edge HTML caching, publication invalidation/TTL and last-known-good fallback. Admin and enquiries are never cached.
- **Static rebuild on publication**: approved content triggers authenticated build/deploy and verification, with retained last good release. Choose only if proven simpler in real repo.
Document and test cache invalidation; `Cache-Control` alone is not proof of HTML cache behavior at Cloudflare. Neither design is already implemented.

## Candidate route layout
Public `/en/`, `/ar/`, `/ru/` and localized about/lessons/coaching/translation-interpretation/contact/legal URLs. Separate protected `/admin` or admin hostname with `/api/admin/*`, public `POST /api/enquiries`. Actual paths and contracts established only once code exists.

## Database and media
See `DATA_MODEL.md`. Transactions/atomic publication where possible; typed parameterized queries, correct indexes, bounded pagination. Keep PII and draft content out of CDN/cache. Validate uploaded MIME/size/dimensions/license; sanitize or reject untrusted SVG. Use private R2 only when required.

## External dependencies and failure behavior
- Vimeo: preserve supplied hash; validate playback and embedding permissions, show poster/CTA on failure.
- Preply: link and policy compliance; never claim external click equals booking.
- Email: durable enquiry storage even on provider outage; retryable notifications.
- Identity: fail closed on invalid auth; stable admin recovery procedure.
- Analytics: no customer message or raw PII.
- No AI runtime requirement, KV, expensive recurring cron, third-party trackers or uncontrolled API calls.

## Cost profile and limits
Measure expected page requests, cache hit ratio, D1 operations, media bytes, email sends and logs. Add limits, rate protection and budgets; do not guarantee a zero bill. Vendor pricing and Cloudflare plan need current verification at implementation time.

## Architecture decision record
Before implementation, log selected stack/rendering method, data schema, auth provider, privacy/retention policy, backup and cache strategy in `DECISIONS.md`; link tests and rollback.
