# NUSYA Backend Integration and Ownership Handoff

**Status 2026-11-15:** Public and private Worker backend source is now implemented in `../../workers/`, with local SQLite/D1-compatible integration tests. **Nothing is deployed.** This document supersedes the original frontend-only handoff.

## Components and authoritative APIs

- `../../workers/public/src/index.js`: localized HTML publishing, public site configuration, protected enquiry submission and approved media retrieval.
- `../../workers/admin/src/index.js`: Cloudflare Access identity verification, owner/editor authorisation, CMS drafts/review/publish/rollback, service/video/settings, enquiry inbox and media approvals.
- `../../workers/migrations/0001_initial.sql`: versioned D1 schema for content, enquiries, outbox, audit, media and rate-limit buckets.
- `../../workers/shared/*`: validation, identity, rendering, persistence and notifications.
- `../../workers/docs/WORKER_API.md`: exact implemented endpoints and response semantics; this replaces the aspirational endpoints below the original frontend plan.
- `../types/api.d.ts`: frontend request/response types. Match this schema; no uncontrolled backend changes to page URLs or design.

## Operational boundaries

Public `nozha-badavi.com` and private `admin.nozha-badavi.com` must be separate Workers, with the admin domain protected by Access **and** independent signed-JWT role checks. Never expose `dist-admin` via the public Worker or unprotected preview URLs.

Enquiry submission requires a valid Turnstile token, same-origin request, approved visible service, enabled request acceptance, approved directed language pair where relevant, and bounded rate limits. HTTP 201 is returned only after durable D1 persistence. Email is a separate outbox operation; no false 'sent' confirmations.

All services initially have `acceptingRequests=false` and translation pairs are empty. No new customer should be allowed to send an unsupported service request until Nozha approves the actual services and site settings. Existing Preply students must remain within allowed booking rules.

Admin changes are versioned, with optimistic concurrency and locale review. The published version is reflected in public HTML through a tested 90-second cache contract. Actual Cloudflare HTMLRewriter, Access gateway and Cache API behavior **still require authorized staging tests**.

## Verification

Locally executed: frontend static build, 9 frontend tests, 14 Node/WebCrypto/SQLite Worker tests, D1 schema constraints, Chromium isolated EN/AR/RU responsive UI checks. Cloudflare account provisioning, real domain, paid email, TLS, real Vimeo playback and live customer delivery have **not** been tested or deployed.

## Steps requiring production authorisation

1. Merge a reviewed full-platform PR and inspect the latest upstream state.
2. Approve Cloudflare resource creation, verify account/zone and billing, and configure staging D1 (production isolation, rollback and backup).
3. Configure the Cloudflare Access application and approved owner/editor addresses **before admin deployment**; disable workers.dev bypass.
4. Configure Turnstile domain keys, and optionally sender/recipient-verified Email Service and consented R2 media.
5. Owner approves the exact languages offered, directed translation pairs, authentic photographs/rights, biography, privacy terms and contact details.
6. Verify both Workers over HTTPS in staging with test records, then obtain separate explicit production/DNS approval and conduct a live end-to-end smoke test.

See `../../workers/docs/RELEASE_READINESS.md` for the complete gate checklist.
