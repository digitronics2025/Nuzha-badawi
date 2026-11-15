# NUSYA Release Readiness — 2026-11-15

> **Released 2026-11-15.** Gates below were executed or recorded as owner actions in [../../docs/PRODUCTION.md](../../docs/PRODUCTION.md).

## Local implementation results

**Implemented:** 21 localized public pages, responsive cinematic frontend, RTL, Vimeo click-to-load, contact form integration, protected admin UI, service settings, D1 CMS revision/publish/rollback, translation review, consented media upload, secure Access token verification, Turnstile-enforced enquiry persistence, idempotency, bounded rate limits, notification outbox and Cloudflare example configurations.

**Locally verified:** 9 frontend static/HTML tests, 14 backend/SQLite/WebCrypto/HTTP tests, SQL schema constraint tests, JS syntax checks, and Chromium page rendering at 1440 and 390 widths in English, Arabic and Russian with no observed horizontal overflow or browser JS errors. The isolated browser harness uses `page.set_content`, not a live deployed origin.

## Remaining production approval gates

| Gate | Required owner/external decision |
| --- | --- |
| Domain/Cloudflare | Approve new Workers, actual zone/DNS/SSL/Custom Domains, D1 and optional R2, Access app setup and ownership |
| Admin access | Confirm allowed owner/editor emails, team Access configuration, MFA and tested token audience |
| Anti-spam | Create Turnstile widget and secret for registered domain, test production hostname |
| Notifications | Approve verified sender/destination, optional email plan charges and actual delivery tests |
| Factual content | Approve biography/dates, service availability, prices if any, directed translation pairs, in-person scope, contact details and three-language translations |
| Media | Approve genuine portrait licensing/consent, Vimeo embedding/caption rights and social account URLs |
| Privacy | Review the privacy copy and retention/legal policy for actual operating jurisdiction |
| Production | Review stage backups/rollback, real-host smoke tests, budgets, and explicit permission to deploy |

## Execution sequence when authorized

1. Review and merge the full-platform GitHub PR after CI passes and no other changes have appeared.
2. Verify correct Cloudflare account/zone, current plan and available bindings. **Do not reuse other businesses' D1/R2 by assumption.**
3. Onboard new resources with least privileges; create production and isolated staging D1 and apply migrations; test backup restore on staging.
4. Configure and test Access before serving any admin assets; disable workers.dev bypass routes.
5. Generate static frontend and verify locale routes. Set protected secrets with `wrangler secret put` and never commit their values.
6. Configure Turnstile and optional Cloudflare Email Service; require verified destination and sender for outbound sending.
7. Configure public/admin Worker Custom Domains, SSL and www redirect after explicit DNS approval.
8. Run end-to-end browser checks over real HTTPS, submit one consented synthetic enquiry, verify database/inbox/outbox, update and roll back a CMS page, test access denial and live video.
9. Measure Worker/D1/R2/email usage; set cost alerts and privacy-safe logging.
10. Record production release SHA, worker IDs and backup methods in a private operations record; do not put secrets in the public repository.

## Known limitations and risk

Wrangler and real Cloudflare Workers **were not executable locally** because the test environment could not access the npm registry, and no authenticated Cloudflare infrastructure tool was connected. Native Worker runtime behavior (including HTMLRewriter, Asset Binding and Cache API) and production security remain subject to staging tests. No live site is claimed. Actual legal copy, media rights, service availability and customer notifications require approval before public launch.

## Execution status and no-deployment policy

This build is delivered in a review branch with automated CI; branch and CI checks alone do not authorize DNS changes or production. First external deployment requires explicit approval for Cloudflare resources and hostname routing. Nozha must also approve the genuine portrait, privacy content and offered translation directions.
