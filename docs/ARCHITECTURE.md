# Conditional Architecture & Integration Design

**Current implementation clarification:** Python generation and dependency-free browser modules remain the production architecture. The editorial redesign adds shared self-hosted font/design tokens and content-versioned CSS/JS links; it does not adopt the historical candidate framework below. WOFF2 is bundled as binary alongside existing image/icon formats. Structured infographic fields extend the existing allowlist and JSON revision payloads, requiring no database migration. Public availability is rendered from validated settings and needs no additional configuration request when already projected by the Worker.

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

## Domain and concrete Cloudflare Workers target (not deployed)
The user supplied a Cloudflare Registrar screenshot showing **nozha-badavi.com** registered/ready. It does **not** prove zone activation, DNS, TLS, Worker deployment, email or cloud-resource configuration. The intended canonical public origin is `https://nozha-badavi.com`, with `https://admin.nozha-badavi.com` for a protected admin Worker and a `www` redirect to the apex.

The recommended design—subject to authorized codebase and vendor inspection—is **two purpose-separated Workers** in one repository: a public Worker (Astro/TypeScript/Tailwind, three locale routes, published-only content and service-aware form endpoint) and a separately protected admin Worker (structured CMS, reviews, translation status, revisions, enquiry inbox and private APIs). Cloudflare Access on admin **plus server-side JWT/role authorization**; no generic admin APIs on public host. Validate whether current plans support all chosen features. Worker names `nusya-public` and `nusya-admin` are suggested, not existing.

D1 supports immutable content revisions and persisted enquiries; R2 only if admin-uploaded photos need object storage. Use approved Cloudflare Custom Domains (not unreviewed Workers routes), static assets on edge, explicit published HTML cache strategy/invalidation or an intentional rebuild-on-publish flow. Isolated staging bindings, secrets, noindex preview, controlled form anti-spam, privacy-safe logs and verified rollback. Avoid unnecessary KV, cron, DO, Queues, AI, Stream and extra Workers. Cloudflare email sending and confirmed mailbox availability require vendor/pricing/ownership verification: Email Routing is not automatically an outbound transactional provider.

Full configuration, approval gates, resource matrix, DNS, SSL, GitHub Builds, staging, migration, cost controls and recovery procedures are in [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) and [updated execution plan](PLAN-nusya-multilingual-studio.md). No cloud resources are known to have been created; user must approve actual infrastructure changes separately from UI design.


## Review hardening — 2026-11-15

The implemented stack is Python static generation plus dependency-free browser JavaScript, with separate public/admin Cloudflare Workers. Dynamic public HTML strips static conditional validators and uses a host-scoped versioned 90-second edge cache (editorial templates use cms-v4). Canonical redirects normalize encoded and index.html paths before CMS routing. Every public response receives security headers; staging remains noindex. No framework migration is planned.
