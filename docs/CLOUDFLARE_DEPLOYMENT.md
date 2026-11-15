# Cloudflare Deployment & Domain Blueprint

**Status:** planned; not implemented. **Domain evidence:** user's 2026-11-15 Cloudflare Registrar screenshot displaying `nozha-badavi.com` as ready. No live website, zone activation, TLS, Workers, bindings, email or access is verified. **Do not provision, pay, modify DNS, or deploy from this documentation.**

Refer to [the complete execution plan](PLAN-nusya-multilingual-studio.md) for approval gates, tests and delivery phases; [OPERATIONS](OPERATIONS.md) for recovery/costs, and [ARCHITECTURE](ARCHITECTURE.md) for app design.


**New fact from user-supplied Cloudflare dashboard screenshot:** Cloudflare Registrar lists **`nozha-badavi.com`** as registered and 'ready'. This is an account screenshot, not a verification of DNS records, active zone, TLS, Worker creation, email delivery, or website reachability. Use that exact spelling in all public links and deployment documents. Do not use or create a different domain.

## Final public routing and security boundary

| Hostname/URL | Purpose | Target behavior at approved production launch | Status now |
| --- | --- | --- | --- |
| `https://nozha-badavi.com` | Canonical public site | Cloudflare Worker serving EN/AR/RU routes and public enquiry endpoint | Intended; not deployed |
| `https://www.nozha-badavi.com` | Alternate public host | Permanent redirect to canonical apex, preserving path and query where safe | Proposed; DNS/redirect not configured |
| `https://admin.nozha-badavi.com` | Private content/admin console | **Separate** admin Worker behind Cloudflare Access plus app-side authorization | Proposed; no admin host created |
| Cloudflare Worker preview URL | Preview testing only | Isolated preview resources, Access if needed, noindex and no production data | Proposed; must validate Workers Builds plan |
| `hello@nozha-badavi.com` | Optional public contact address | Only publish after owner approves and routing/receiving are verified | Proposed; not a confirmed mailbox |

Recommendation: one repository, **two purpose-bounded Worker applications**: `nusya-public` (Astro-based public content site, static assets, localized SSR/read-only published content, public enquiry endpoint) and `nusya-admin` (structured editor, authenticated administrative API and publication controls). This is a **design target, not an existing deployment**. A single Worker is allowed as an alternative only after documented risk/cost analysis demonstrating equivalent isolation; never expose admin routes through the public hostname merely because Cloudflare Access is enabled only for the admin subdomain. Both apps may share versioned types, validation logic and **approved** D1/R2 bindings with clearly separate API capabilities. No independently addressable public database endpoint.

Cloudflare's Workers Custom Domains require an **active zone** and appropriate hostname availability. Future agent must first verify the domain is attached to the correct account/zone and inspect DNS/CAA/SSL status before planning any route. The custom domain binding creates related DNS/certificates where supported; it is not proof that those resources already exist. Use Cloudflare custom domain rather than `workers.dev` for production. Configure `www` via the most economical supported redirect method, rather than a redundant Worker. Do not change MX/SPF/DKIM/DMARC without inspecting existing mail records and owner approval.

## Cloudflare product inventory — use only when useful

| Capability | Priority | Planned role and guardrails |
| --- | --- | --- |
| Workers + Static Assets | **Required** | Host public site and separately protected admin; serve immutable JS/CSS/images as static assets without unnecessary script invocations. |
| Wrangler / Cloudflare local simulator | **Required for future agent** | Generate config from actual framework, develop with local bindings, validate and deploy only after authorisation. |
| Custom Domains, DNS, TLS/SSL, redirects | **Required to launch** | Canonical apex + admin host + www redirect; verify zone activation; protect certificates and DNS rollback. |
| D1 | **Required if CMS/enquiry DB adopted** | Content entries/revisions, EN/AR/RU locales, enquiries, audit/events; parameterized indexed bounded SQL and versioned migrations. |
| R2 | **Conditional** | Only if admin-managed uploads are needed; private upload path, optimized public derivative images and cost limits. Static bundled assets need no R2. |
| Cloudflare Access / Zero Trust | **Strongly recommended for admin** | Protect admin hostname with MFA/allowlist; admin Worker verifies identity/claims and per-action permissions. Never assume Access is configured or paid-free for all cases. |
| Turnstile | **Recommended** | Server-validated anti-bot tokens on enquiry forms with proper fallback and accessibility. |
| Email Routing / Cloudflare Email Service | **Conditional** | Optional inbound contact forwarding; verified-destination notification sending may be available free; arbitrary-recipient transactional sending requires Workers Paid and/or separate provider. Do not confuse routing with a full mailbox. |
| Workers Builds + GitHub integration | **Recommended** | One production deployment pipeline and isolated branch previews; avoid duplicate GitHub Actions and Builds deploying same project. PR previews must never bind production D1/R2/secrets. |
| Web Analytics / Workers Observability | **Optional with safeguards** | Aggregate traffic, page CTA clicks and actionable failures; redact PII, cap log retention/sampling and costs. |
| WAF, security rules, rate limiting | **Conditional** | Use when on current plan and appropriate; always enforce app-side validation and abuse limits. Avoid paid rulesets without consent. |
| KV / Queues / Durable Objects / Cron Triggers | **Not required initially** | Add only for a measured hard requirement; avoid speculative caches, polling and infrastructure. A durable retry mechanism can use simple DB outbox, with Queue only if proven necessary. |
| Cloudflare Images, Stream, AI / Vectorize | **Not required** | Use optimized static/R2 images, existing Vimeo and no AI runtime until a measured need and approved budget. |

Cloudflare Email Service as of current 2026 documentation: **Email Routing** is available on Workers Free/Paid, and sending to verified destination addresses can be free; **outbound arbitrary-recipient Email Sending Beta requires Workers Paid**. Do not promise free confirmations to arbitrary visitors. Select a verified-owner notification first, then optional external transactional provider or paid Cloudflare Email Sending after cost approval. Onboard sending domain and DNS/SPF/DKIM/DMARC only with explicit owner approval.

## Future repository structure (proposal; adapt after inspection)

```
/
  AGENTS.md, CLAUDE.md, design.md, README.md
  docs/...
  apps/
    public/                  # Astro site / Worker entry, public-only endpoints
    admin/                   # Protected admin UI / separate Worker and private APIs
  packages/
    shared/                  # Types, Zod or equivalent validation, locale keys
  migrations/                # Versioned D1 migrations, no raw production snapshots
  .github/                   # PR template, one CI pipeline when approved
```

Use actual working directory conventions; do not scaffold incompatible frameworks merely to match this diagram. Propose Worker names `nusya-public` and `nusya-admin`, D1 binding `DB`, R2 binding `MEDIA` **only if needed**. These are suggestions, **not verified resources or IDs**. For Wrangler configuration, future agent must derive valid `compatibility_date`, assets entry, `@astrojs/cloudflare` version if SSR, Workers routes/custom domains, bindings and secrets from current official docs. Use environment-specific variables and secrets, not hardcoded IDs. No `.dev.vars`, `.env`, API tokens or personal data in public GitHub.

**IMPORTANT**: The user's previous request explicitly required design approval before UI changes. A developer may inspect source and prepare documentation/technical mockups while that gate is pending, but may not scaffold or code the public/admin UI until high-fidelity design approval.

## Worker & D1 content publishing design

Use a coherent publishing model. Preferred: public Worker uses cached server-rendered **published-only** projection, with a bounded D1 read on cache misses, explicit page cache invalidation/short TTL, and last-known-good fallback. Alternative: content publish triggers a static rebuild, only if objectively simpler. Never deploy all-static pages while expecting updates to D1 to magically change the published HTML. Admin Worker enforces draft/save/preview/publish/revisions/rollback and calls safe public-cache update/invalidation methods. Private/admin/enquiry responses are always `no-store`, never included in public CDN caches.

Transaction/order: (1) validate source claims, locale completeness, CTA destinations, video URI/hash and media ownership; (2) create immutable draft revision; (3) atomically mark authorized locale revision as published; (4) update/expire published projection and verify visible content; (5) retain prior good revision for rollback; (6) record actor and event without sensitive enquiry body in logs. If cache update fails, report degraded propagation; previous version remains recoverable. No accidental cross-locale publication.

Database future migrations must be idempotent and tested locally/staging, using `wrangler d1 migrations apply ... --local` for development **only after validating actual configuration**. Remote/production migration requires review, backup/export, cost and explicit authorization; no production D1 binding during preview or local tests. Apply principle of least privilege at API boundary.

## Secure forms, media and operations

- Public POST `/api/enquiries` (only on public Worker) validates minimal contact+service fields, allowed translation pairs, Turnstile token, quotas/rate limits and idempotency; persists to D1 before acknowledging and returns an opaque reference ID.
- Admin Worker (admin hostname only) reads/replies/exports records behind Access + app authorization, with audit logs and retention policies. Public Worker must not expose admin or query-all endpoints.
- Initial customer form has no mandatory document upload. R2 uses controlled private upload only when approved, with MIME/signature/size limits, license metadata and expiring access.
- For email, guarantee enquiry storage independently from provider availability. Email Service to verified owner is an option; provider transport/outbox retries are separately testable. Customer acknowledgements require an explicitly approved provider and budget if not included.
- Add sitewide CSP, HTTPS, secret store, `robots.txt`, XML sitemap, per-locale `hreflang`, and canonical to `https://nozha-badavi.com` (with language-specific canonical paths). Noindex previews/admin; strict permissions on admin hostname.
- Cloudflare Web Analytics/Observability must track only privacy-safe metrics, not PII; establish alerts on real failures and cost thresholds. No user data in source-control or logs.

## Required Cloudflare work plan — **future execution only**

**Preflight (read-only, once access authorized):** Confirm registration and zone for `nozha-badavi.com`, account ID ownership, nameservers/active zone, DNS/CAA/MX, current Workers inventory, Free/Paid/Zero Trust plans and limits, R2/D1 billing, existing projects and available GitHub integration. Do not assume screenshot proved these. Never touch unrelated applications/resources.

**Design gate:** Prepare high-fidelity desktop/mobile public + admin mockups, including Arabic RTL and video hero. Obtain explicit user approval; STOP before UI code.

**Build after approval:** Scaffold verified app stack, two Workers with separate public/admin capabilities and isolated local bindings, schema/migrations, lightweight CMS with revisions, domain-independent routing, EN/AR/RU, video/lead flows, media, accessibility, tests. Keep real production DNS untouched.

**Stage after authorization:** Create only the necessary development/preview Workers, staging D1/R2 if required, Access application and appropriate secrets; connect GitHub Workers Builds only after checking integration cost/permissions; prove previews isolated from production.

**Production approval gate:** Present exact changes to zone DNS/Custom Domains, production Workers, certificate/redirect behavior, D1/R2 bindings, admin access policy, email sending and GitHub automated deployments, estimated costs, backup and rollback. STOP for user's explicit production/infrastructure approval. A design approval is **not** domain/production approval.

**Deploy after approval:** Verify active zone, attach `nozha-badavi.com` to public Worker, `admin.nozha-badavi.com` to protected admin Worker, safe redirect for `www`, TLS, CSP, localized sitemap and proper canonical. Onboard email only if approved. Verify staging -> production migrations and backups; production smoke tests (EN/AR/RU, Vimeo, contact, auth, public no-admin leak, preview isolation, cache/publish/rollback, cost). If failure, revert Worker version and/or DNS using documented procedure without losing lead data.

**Operational handover:** Provide Nozha with admin instructions, ownership/access inventory, media/video editing guide, client enquiry response guide, backups, monitoring, spend controls, support/update SOP, link tests and verified release SHA. Record what was deployed, not just what was planned.

## Acceptance criteria for this extension

- At eventual production launch, `https://nozha-badavi.com` serves all three reviewed website locales with per-page canonical to the apex, working media, video and forms, and privacy/legal pages.
- `https://www.nozha-badavi.com` safely redirects to canonical without loops; production HTTPS and certificates validated.
- `https://admin.nozha-badavi.com` is **not accessible without authorization**, private APIs do not resolve on public host, draft/content/enquiry PII never leaks via pages or caches, and owner can edit/publish/rollback.
- Vimeo ID/hash preserved; real playback and graceful unavailable state verified on final domain.
- Preview uses isolated test data/resources and noindex; production credentials never appear in repo, client bundles or preview.
- D1/R2/Workers usage under approved cost thresholds with logging and query limits; critical features recover from provider/D1/cache failures.
- Content updates propagate within documented measurable target, with release rollback and no loss of customer enquiries.
- All required Cloudflare account/DNS/resource actions are **future authorized actions**; none are implied accomplished by this plan.

**Official implementation references (verified as of 2026-11-15; future agent must re-check current):**
- Workers Custom Domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Astro on Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- Workers Builds/GitHub: https://developers.cloudflare.com/workers/ci-cd/builds/
- Worker Previews: https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Static assets billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
- Access for Workers: https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Email Service: https://developers.cloudflare.com/email-service/
- Workers Email Sending API: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/

---
