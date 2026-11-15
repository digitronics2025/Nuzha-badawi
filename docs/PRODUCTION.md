# NUSYA Production — Deployed Inventory & Runbook

**Status (2026-11-15): LIVE.** Deployed on the user's explicit full-autopilot instruction. This file records what *actually exists*; planning documents remain in `CLOUDFLARE_DEPLOYMENT.md`.

> **Release status (2026-11-15):** the user explicitly approved publication of the CV-based biography in this deployment chat. This clears the D-022 content gate; it does not mean the latest code is deployed. Remote inspection found production still running the earlier release, and Actions run `43740271576` skipped staging and production because the repository Cloudflare secret was unavailable. See the verification update below.

## URLs

| URL | Serves | Protection |
| --- | --- | --- |
| https://nozha-badavi.com | Public site EN/AR(RTL)/RU, `/api/v1/config`, `/api/v1/enquiries`, `/media/:id` | Turnstile + origin check + HMAC-IP rate limit on enquiries |
| https://www.nozha-badavi.com | 301 → apex (path + query preserved) | Zone Single Redirect rule |
| https://admin.nozha-badavi.com | Admin UI + private API + draft previews | Cloudflare Access app **NUSYA Admin** (owners only) + in-Worker RS256 JWT verification + owner/editor allowlist |
| https://nusya-public-staging.digitronics-electro.workers.dev | Staging public (Turnstile **test** keys) | Isolated staging D1/R2 |
| https://nusya-admin-staging.digitronics-electro.workers.dev | Staging admin | Access app **NUSYA Admin STAGING** (owners + verification service token) |

The corrected Worker redirects `/` (302, `Vary: Accept-Language`, `Cache-Control: private, no-store`) to a supported preference (`uk`, `en`, `ar`, `ru`), defaulting to `/uk/` for absent or unsupported preferences. This correction still requires deployment. workers.dev and preview URLs are **disabled** for production Workers.

## Cloudflare resources (account `5e8dba9f…`, zone `nozha-badavi.com`, Free zone plan, Workers Paid)

| Resource | Name / ID | Notes |
| --- | --- | --- |
| Worker | `nusya-public` | Custom domain `nozha-badavi.com`; hourly cron `17 * * * *` (rate-bucket cleanup + notification retry) |
| Worker | `nusya-admin` | Custom domain `admin.nozha-badavi.com` |
| Workers | `nusya-public-staging`, `nusya-admin-staging` | workers.dev only |
| D1 | `nusya-platform` `7d32814d-323d-45ed-8ed4-fb8c6cf56779` (WEUR) | Migration `0001_initial.sql` applied |
| D1 | `nusya-platform-staging` `e6e00b4e-fd9e-4b95-b1be-94e642dcc36b` | Staging only |
| R2 | `nusya-media`, `nusya-media-staging` | Private; images served only after owner consent publish |
| Access app | NUSYA Admin (`admin.nozha-badavi.com`), AUD `3b937dc1…` | Policy "NUSYA owners only": contact@tenten.ma, digitronics.electro@gmail.com; 12 h session |
| Access app | NUSYA Admin STAGING | Same owners + service token "NUSYA verification" (staging only) |
| Turnstile | "NUSYA enquiry form", site key `0x4AAAAAAGB5vc9gB1fljwRp`, managed, domain `nozha-badavi.com` | Secret only in Worker secret `TURNSTILE_SECRET` |
| Email Sending | Domain `nozha-badavi.com` onboarded (DKIM selector `cf-bounce`, return path `cf-bounce.nozha-badavi.com`) | Binding restricted to destination contact@tenten.ma and sender notifications@nozha-badavi.com |
| DNS | Worker custom-domain records (apex, admin), `www` AAAA 100:: proxied, Email Sending MX/SPF/DKIM, `_dmarc` `p=reject` | No apex MX: domain does not receive mail |
| Zone settings | SSL Full, Always Use HTTPS on, min TLS 1.2, Browser Cache TTL = respect origin | Browser TTL change needed so CMS publishes reach returning visitors |

Worker secrets (names only): `nusya-public`: `TURNSTILE_SECRET`, `RATE_LIMIT_SALT`. Staging public has the Cloudflare always-pass test secret. The values live in the owner's password vault, never in Git.

## Live configuration decisions
- **Static files are bundled into the Worker** (`tools/bundle_assets.mjs` → `src/static-assets.generated.js`, served by `shared/assets.js`) instead of Workers Static Assets. Reason: one artifact deployable identically from CI or a workstation (the build environment's egress proxy breaks the Static Assets upload JWT). The site is ~280 KB of text; Worker requests for CSS/JS are within the included 10M/month. An `ASSETS` binding still takes precedence if one is configured later.
- **Enquiries open:** English, Russian and Arabic lessons and communication coaching. **Translation and interpretation are visible but not accepting** until Nozha enters approved *directed* pairs (e.g. `en:ru`) in Admin → Services (docs/SOURCES.md requires per-direction confirmation).
- Owner notification emails go to contact@tenten.ma. The enquiry is stored before any email attempt; failures retry hourly (max 5) and can be retried from admin.
- Cloudflare Web Analytics (cookieless, aggregate) is allowed by the public CSP and blocked on admin.

## Verification evidence (2026-11-15)
- Unit/integration: 18 Worker tests, 9 frontend tests, migration checks: all pass.
- `tools/e2e-smoke.mjs` **production** mode: 31/31. Covers all 21 locale pages, language redirect, no Korean, admin API absent on the public host, CSP/HSTS, the Vimeo ID and hash, config ready, forged Turnstile rejected, cross-origin rejected, Access login enforced, and a forged JWT header that does not bypass Access.
- `tools/e2e-smoke.mjs` **staging** mode: every write-flow check passed. Covers the enquiry → D1 → idempotent retry → 409 on a changed payload, unapproved direction rejected, admin list, **owner email `sent`**, status change + audit, draft → private preview → publish → live within 140 s → rollback, no cross-locale leak, EN edits flag AR/RU for review, and media upload private → consent publish → public, with spoofed images rejected.
- Chromium on production: EN/AR/RU × 1440 px desktop and iPhone 13. No horizontal overflow, zero console/CSP errors, `dir="rtl"` on Arabic. The Vimeo player loads only on click, with the privacy hash preserved.

**Not verifiable from the build environment:** a production enquiry with a *real* Turnstile token (the sandbox cannot reach `*.challenges.cloudflare.com`), and an interactive owner login to the production admin. See the owner checklist below.

## Owner checklist (first login)
1. Open https://admin.nozha-badavi.com and sign in with an allowed email (Access sends a one-time code). Confirm the banner shows `OWNER`.
2. On https://nozha-badavi.com/en/contact/ submit one real enquiry. Confirm the reference appears, the email arrives at contact@tenten.ma, and the enquiry is listed in Admin → Enquiries.
3. Admin → Services: enter the approved translation/interpretation directions and enable those services if you're offering them.
4. Admin → Media & video: upload consented portraits, then put the media ID in the Home/About page editor and publish.
5. To give Nozha access, add her email to the Access policy **and** to `OWNER_EMAILS` (or `EDITOR_EMAILS`) in `workers/admin/wrangler.jsonc`, then redeploy.

## Deploy / rollback
- CI: `.github/workflows/deploy.yml` runs on push to `main`: tests → staging deploy + e2e → production (GitHub environment `production`, schema backup, migrations, deploy, read-only smoke). It needs repository secrets `CLOUDFLARE_API_TOKEN`, `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`; the credential preflight now fails explicitly if any are unavailable, preventing a misleading green deployment run.
- Manual: `cd workers && npm ci && npm run build:frontend && npm run check && npm run deploy:admin && npm run deploy:public`.
- Code rollback: `npx wrangler rollback --config public/wrangler.jsonc` (or `admin/…`). D1 data is unaffected.
- Content rollback: Admin → Pages → History / rollback.
- Data recovery: every CI production deploy records a D1 Time Travel bookmark in the job summary before migrating; restore with `npx wrangler d1 time-travel restore nusya-platform --bookmark=<bookmark>` (full data, 30-day window). Ad-hoc offline backup (contains customer PII — store only in the owner's private storage, never in GitHub): `npx wrangler d1 export nusya-platform --remote --output=backup.sql --config workers/public/wrangler.jsonc`.
- CI staging e2e is mandatory: `MODE=staging` fails if the Access service-token secrets are missing.

## Estimated cost
Incremental cost ≈ **US$0/month** at expected traffic. It uses the existing Workers Paid plan ($5/month, already active and shared with other projects): requests, D1 rows and storage fit the included allowances. R2 stays under 10 GB free. Access is free for ≤50 users, Turnstile is free, and Email Sending at a few owner notifications a day stays within the included allowance. The domain registration was paid separately (renewal 2028-11-15).


## Deployment verification update — 2026-11-15

- Inspected `main` at `64c492192951bdf09a9cf06dc86339e375ff7f84`. Existing full-platform CI passed, but deployment run [43740271576](https://github.com/digitronics2025/Nuzha-badawi/actions/runs/43740271576) skipped both environments.
- Fixed Worker locale negotiation: static pages supported Ukrainian already, but the Worker still defaulted to English and ignored Ukrainian preferences.
- Expanded deployed smoke checks to all 28 locale pages, Ukrainian redirects, binary WebP signatures and all four admin content locales. Kept mandatory staging enquiry/CMS/media/publish/rollback checks.
- Local build, 13 frontend tests, 19 Worker tests, SQL migration constraints and npm dependency audit pass (zero reported vulnerabilities). The earlier production smoke suite passed 31/31; that suite omitted Ukrainian and the new images, so it was insufficient release evidence.
- Available GitHub integration returns HTTP 403 for Actions secrets. `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` are absent from this execution environment. No credentials were written to source, logs or documentation.
- Required credential setup: repository Settings → Secrets and variables → Actions. The staging Access service token must match both its Access policy and `SERVICE_TOKEN_OWNERS`; its secret cannot be recovered from Cloudflare after creation. Do not authorize it against production admin.
- Production promotion remains contingent on the full staging write suite and a successful controlled deployment. Existing rollback commands and D1 Time Travel recovery above remain in effect.
