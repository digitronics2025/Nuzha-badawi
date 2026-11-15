# NUSYA Cloudflare Workers backend

Status: **deployed to production 2026-11-15** — see `../docs/PRODUCTION.md`. Configs: `public/wrangler.jsonc`, `admin/wrangler.jsonc` (production) and `*.staging.jsonc`. Static files are bundled into each Worker by `npm run build:frontend` (no Static Assets upload). End-to-end: `tools/e2e-smoke.mjs`. Intended domain: `nozha-badavi.com` and protected administration: `admin.nozha-badavi.com`. The domain registration screenshot alone does not prove any DNS, resource, email or Access configuration.

This repository contains two separate Worker entry points (`public/src/index.js` and `admin/src/index.js`), one D1 migration set, shared validated services, unit/integration tests and example Wrangler templates. The existing frontend continues to be built separately with `python3 frontend/scripts/build.py`, producing `frontend/dist-public` and `frontend/dist-admin`. Do not serve `dist-admin` on an unprotected public origin.

## Safe local checks

From `workers/`:

```sh
npm run build:frontend
npm run test:sql
npm test
npm run check
```

Local Node 22 uses experimental `node:sqlite` in the test harness; production runtime does not depend on it. All Worker runtime imports are standard Web APIs. Wrangler is a development dependency and must be installed by the future deployment agent (the present development environment did not have npm registry connectivity).

## Deploy preparation — not automatic

1. Obtain separate explicit approval to create Cloudflare resources or edit production DNS; verify account ownership, billing plan, DNS zone and Access identity requirements.
2. Create isolated staging/prod D1 databases and apply `migrations/0001_initial.sql` through Wrangler migration tooling. Never run a destructive DB reset on production.
3. Copy each `wrangler.example.jsonc` to `wrangler.jsonc` locally and replace placeholders with verified IDs. `wrangler.jsonc` is ignored by Git. Use unique staging variables and separate Cloudflare permissions/secret bindings.
4. Set sensitive Worker secrets via Wrangler secrets, not source or GitHub: public `TURNSTILE_SECRET` and `RATE_LIMIT_SALT`. Admin uses Cloudflare Access JWT (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `OWNER_EMAILS`); do not create default passwords.
5. Create a Turnstile widget restricted to the approved public hostname, configure its site key and server secret; contact API fails closed until both exist.
6. Set approved service availability and **explicit directed** translation pairs through the protected admin settings. Until approved, new enquiries are disabled by default.
7. Optional R2 media: private bucket and `MEDIA` binding to both Workers; upload only JPEG/PNG/WebP after recording rights and consent. Public media require explicit publication.
8. Optional notification: configure verified sender and destination through Cloudflare Email Service. Sending to arbitrary recipients may require Workers Paid. Notifications are best-effort; the enquiry + outbox persists even without email configuration. Admin may manually retry pending delivery.
9. Configure `nozha-badavi.com` Custom Domain for the public Worker and `admin.nozha-badavi.com` for the admin Worker **after Access is active and verified**. Disable workers.dev and unsafe previews; add www→apex redirect and verify SSL/canonical URLs.
10. Deploy from an approved controlled pipeline, run smoke tests, verify correct page edits after ≤90-second cache TTL, confirm backend requests and auth failures, retain backups/rollback instructions.

## Routing

Public Worker serves localized published HTML, static assets (asset-first outside dynamic paths), `GET /api/v1/config`, `POST /api/v1/enquiries` and approved `GET /media/:id`. Admin Worker **authenticates every path** and serves the admin UI, private editor/lead APIs and authenticated visual previews. Admin API validates cryptographically signed Cloudflare Access assertions and application-role allowlists.

## Publishing

Public pages are prerendered HTML with `data-nusya-field` markers. A published revision in D1 overrides **plain text only**, its SEO metadata and approved image references in an `HTMLRewriter`. Public HTML cache TTL is 90s; private admin responses are always no-store. Drafts never appear publicly. Source EN changes flag Arabic/Russian review status, retaining their last published content. Owner may publish or restore an older approved revision.

## Anti-abuse and durability

Enquiries require Turnstile siteverify, matching first-party origin, bounded JSON, validated service, approved pairs, HMAC IP bucketing and idempotency. D1 batch persists enquiry + outbox before sending HTTP 201. Email failures do not destroy enquiries. Contact API never claims a sent email unless actually confirmed.

## API and handoff

See `../frontend/types/api.d.ts`, `../frontend/docs/BACKEND_HANDOFF.md`, and `docs/WORKER_API.md`. All public biographies, rights, translations, privacy policy and offers require Nozha's final review prior to live publication.
