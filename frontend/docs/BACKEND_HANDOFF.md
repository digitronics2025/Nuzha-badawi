# Backend agent: complete the operational NUSYA platform

## Objective

Connect the already-designed and tested frontend to secure, durable Cloudflare services **without redesigning its layout or replacing its locale content model**. Review repo instructions (`AGENTS.md`, `CLAUDE.md`, `design.md`, `docs/PLAN-nusya-multilingual-studio.md`), then inspect `frontend/README.md`, `frontend/types/api.d.ts`, and generated frontend routes. Do not assume Cloudflare resources already exist; registered domain `nozha-badavi.com` is not proof of deployment.

## Hard boundaries

- Public: `https://nozha-badavi.com`, localized paths `/en/`, `/ar/`, `/ru/`.
- Admin: **separate** `https://admin.nozha-badavi.com` Worker behind Access + verified application roles; never ship the current static admin preview on an unprotected public host.
- Backend owns Worker APIs, D1 migrations and query/index design, auth, role enforcement, revisioned CMS, durable enquiries, email/notification delivery, optional R2 for approved media, cache coherency, backup and rollback.
- Frontend owns visual composition, responsive breakpoints, content presentation and form UI. Keep the existing frontend stable and typed API contracts backwards-compatible.
- Production/domain/DNS/billing changes require specific authorization. The frontend implementation alone is not a deployment approval.

## Public API

`POST /api/v1/enquiries` accepts JSON `EnquiryRequest` and returns **HTTP 201** with `EnquiryAccepted` only *after* persistence succeeds. Accept a stable UUID idempotency key, prevent duplicates, validate same-origin content type, enforce bounded size and schema, service availability and permitted directed translation language pairs. Validate Turnstile on server if configured. Apply per-IP/account limits, ensure proper privacy notices and store minimum personal data. Return `ApiError` with meaningful status 400/403/429/500/503; avoid HTML error bodies. If email delivery fails, retain the enquiry and retry idempotently via an outbox. Do not falsely claim notification sent.

## Private admin API

- `GET /api/v1/admin/me`: active authenticated identity and role.
- `GET /api/v1/admin/pages`: content list, filters, draft/published and EN/AR/RU review states.
- `GET /api/v1/admin/pages/:key`, `PUT /api/v1/admin/pages/:key`: structured content, optimistic revision control and validation.
- `POST /api/v1/admin/pages/:key/preview`: private noindex/no-store preview.
- `POST /api/v1/admin/pages/:key/publish`: atomic publish, cache refresh, verification, immutable revision.
- `POST /api/v1/admin/pages/:key/rollback`: restore known-good published revision.
- `GET /api/v1/admin/enquiries?limit=20&cursor=...`, `PATCH /api/v1/admin/enquiries/:reference`: authenticated, paginated inbox and audited statuses.
- `GET/PUT /api/v1/admin/settings`: approved business contacts, service availability, video and external profile links.
- `POST /api/v1/admin/media`: only if approved; size/MIME/license validation, private R2 storage and controlled public derivatives.

## Publishing mechanism

Current public content is prerendered. Decide deliberately between **authenticated build-on-publish** (simple static approach) and **published-only server rendering with verified edge caching**. D1 edits cannot modify static HTML without a rebuild or runtime render. Implement draft, EN/AR/RU review flags, publish, preview, rollback and conflict handling. Do not cache private admin data. Protect production with real backup/recovery tests.

## Operational validation

Test auth bypass, Access bypass via workers.dev, permission boundary, safe secrets, parameterized SQL, D1 index/quotas and pagination, data deletion, translated publish propagation, form retries, duplicate submissions, notification outage, Vimeo domain playback, Preply policy, GDPR/jurisdiction review, DNS/TLS/redirect, service-unavailable experience, keyboard/RTL/mobile and measured spending. Log actual evidence; no invented tests.

## Unimplemented by design

No auth, Cloudflare Worker, D1, R2, notification service, CRM, real content publishing or production deployment exists in the frontend delivery. These responsibilities belong entirely to the backend agent.
