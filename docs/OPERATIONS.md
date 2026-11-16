# Operations, Cost, Release, Rollback and Incident Response

**This document is a runbook proposal, not proof of any deployed Cloudflare resources.** Inspect actual repository workflows and account settings before creating environments.

## Environments
Local/development and isolated preview/staging before production. Separate credentials and databases; never use production PII for routine tests. Verify account/domain ownership with Nozha or authorized owner.

## Release workflow
1. Confirm approved design screens and content sign-off; inspect active branch, existing user changes and CI.
2. Run lint/type/build/tests, test localized routes and admin; review migration and data impacts.
3. Back up/export relevant data, validate migration against staging/synthetic sample and document rollback.
4. Require explicit approval for production launch, paid commitments, DNS changes, sensitive migration or irreversible action.
5. Deploy via controlled CI only when authorized; run public/EN-AR-RU and private admin smoke tests.
6. Verify video, forms, notification, live publish/rollback and SEO; record release SHA, cost/usage baseline and known gaps.
7. Roll back to prior known-good release if critical criteria fail; preserve enquiries and media integrity.

## Recovery
- App failure: switch traffic/release back without destructive resets.
- Content mistake: restore prior published immutable revision.
- Failed migration: stop writes if necessary, restore from tested safe backup or forward-fix with verification; don't rerun destructive scripts blindly.
- Email outage: keep stored enquiries; retry idempotently; show notification state honestly.
- Vimeo outage: show static poster, transcript where approved, link and service CTA.
- D1/R2 budget/limits: fall back to cached published content; never expose drafts; throttle non-critical work and alert operator.
- Account/credential compromise: revoke affected access/secrets, audit, rotate and report.

## Cloudflare resource safety
Static assets should be CDN cached using versioned URLs. Published HTML uses **verified** edge cache strategy with bounded TTL/invalidation; never assume `Cache-Control` always suffices. Private admin/enquiry routes are no-store. Avoid per-view D1 reads, N+1 queries, full-table scans, gratuitous writes and excess indexes. R2 only for needed assets; bound upload sizes. Avoid KV/Queues/cron/LLM integrations unless measured needs justify them. Rate-limit public forms, dedupe notifications, limit logs, avoid unnecessary CI runs.

## Spend approvals and observability
Before enabling paid features, inspect current pricing/allowances; estimate baseline/expected traffic, email, storage and API costs. Define thresholds, alerting and safeguards. Never promise permanently zero charges. Use privacy-respecting metrics: performance, availability, lead delivery failures, cache hit, D1 read/write usage and cost; don't log sensitive customer text.

## Handover
Document access ownership, renewals (domain/email), how to update three locales, replace video, manage services/enquiries, export data and restore a release. Nozha should be able to complete daily tasks without a developer.

## Registered domain and future production Worker runbook
The user-supplied Cloudflare screenshot lists `nozha-badavi.com` as ready at the Registrar. This **does not** confirm active DNS, SSL, deployed Workers, D1, R2, Access, billing or mail. Planned production public host is `https://nozha-badavi.com`; `www` permanently redirects to apex; owner admin is `https://admin.nozha-badavi.com`.

Before any cloud action, explicitly verify account/zone, DNS and existing resources; inventory plan limits; map custom-domain registration and admin isolation; calculate variable/fixed costs. Require **separate approval** for first Worker provisioning/deployment, DNS/redirect/TLS changes, D1/R2 migrations, Access policies, email setup, paid features and automated GitHub deploys. Use one CI/CD mechanism only; stage in isolated environments with synthetic content, never production credentials/data. At authorized launch verify TLS, redirects, three locales, video, contact submissions/email outages, protected admin, content publish/cache refresh, rollback, backups, spend/usage alarms and noindex previews. Retain last good Worker deployment and content revision; do not rollback DB destructively. Treat Email Routing as inbound forwarding, not proof of arbitrary outbound transactional sending. Detailed Worker configuration, optional service matrix and acceptance gates: [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md).


## Review hardening — 2026-11-15

Retention workflow: at least every six months the owner reviews closed/spam enquiries and privacy requests in protected admin. Remove records no longer required, including related enquiry_events and notification_outbox rows, through a scoped, backed-up database operation; preserve records needed for ongoing services or legal obligations. No bulk deletion job or retention purge ran in this change. Honor corrections/deletion requests after proportionate identity verification. Check notification delivery and the privacy contact inbox. Do not send sensitive documents through the public form.


## Editorial rollout and recovery

The redesign uses the existing staging-first pipeline and changes no resource bindings or database schema. Record the existing public/admin versions and production Time Travel bookmark before promotion. Preserve D1 owner revisions and settings rather than replacing them with source defaults; new infographic fields fill only missing slots. The new edge-template cache namespace avoids serving pre-redesign HTML with new scripts. CSS/JS links include content versions.

Content rollback remains the normal way to restore an eligible publication. For a visual regression, public Worker rollback preserves enquiry and CMS data. If owners have saved new infographic fields, keep the compatible admin API while recovering the public UI: older admin versions' strict field allowlists may reject those newer fields. Do not strip fields or rewrite immutable revisions to make a code downgrade work; prefer a verified forward fix for admin regressions.

## Agent tool permissions

`.claude/settings.json` pre-approves all four Cloudflare MCP tools (`search`,
`docs`, `whoami` and `execute`) so Claude sessions stop asking for them. This was
the owner's explicit choice (2026-11-16). `execute` can change live Workers, DNS,
D1 and R2 **without a prompt**, so the approval rules in `AGENTS.md` and
`CLAUDE.md` (separate permission for domain, Workers, D1/R2, DNS and production
actions) still apply; the agent must ask in chat before any such change. To bring
the prompt back, remove `mcp__cloudflare_mcp__execute` from the file. Cloud
sessions read this file only when the session has this one repository attached.
Copy the same file into other repositories to get the same behaviour there.
