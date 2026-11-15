# PLAN — NUSYA Multilingual Linguistic Studio Website & Admin

**Filename:** `PLAN-nusya-multilingual-studio.md`  
**Plan version:** 3.0 - Final Cinematic Editorial Luxury design and motion specification  
**Prepared:** 2026-11-15  
**Status:** Final execution-ready design specification; **high-fidelity mockups still require explicit approval before UI coding; cloud provisioning and production remain unapproved**  
**Intended repository:** `https://github.com/digitronics2025/Nuzha-badawi.git`  
**Project:** NUSYA Linguistic Studio — professional profile, language education, translation and interpretation enquiries, multilingual content-management dashboard.  
**User-supplied production domain:** `nozha-badavi.com` (Cloudflare screenshot shows registration ready, **not** live website/zone/SSL).  
**Proposed canonical URLs:** `https://nozha-badavi.com` (public), `https://admin.nozha-badavi.com` (private admin), and `https://www.nozha-badavi.com` (301 redirect to apex).

> **Revision provenance and execution boundary:** The original v1 plan was prepared without repository/cloud inspection. A later documentation-only GitHub review verified that `digitronics2025/Nuzha-badawi` has a documentation foundation on the draft pull-request branch `docs/nusya-project-foundation`; no working application has been verified. The user subsequently supplied a Cloudflare Registrar screenshot showing `nozha-badavi.com` as **registered/ready**. No Cloudflare account, DNS zone, Worker, D1 database, R2 bucket, Access policy, email service, billing tier, SSL or running deployment has been inspected or provisioned during this revision. This is a **plan and documentation update only**; every Cloudflare creation, account change, expense, DNS change, secret and deployment is a future step requiring appropriate authorisation. The mandatory high-fidelity UI approval gate still applies before UI coding.

---

## 0A. Registered domain, Worker deployment & Cloudflare implementation contract (2026-11-15 update)

**New fact from user-supplied Cloudflare dashboard screenshot:** Cloudflare Registrar lists **`nozha-badavi.com`** as registered and 'ready'. This is an account screenshot, not a verification of DNS records, active zone, TLS, Worker creation, email delivery, or website reachability. Use that exact spelling in all public links and deployment documents. Do not use or create a different domain.

### 0A.1 Final public routing and security boundary

| Hostname/URL | Purpose | Target behavior at approved production launch | Status now |
| --- | --- | --- | --- |
| `https://nozha-badavi.com` | Canonical public site | Cloudflare Worker serving EN/AR/RU routes and public enquiry endpoint | Intended; not deployed |
| `https://www.nozha-badavi.com` | Alternate public host | Permanent redirect to canonical apex, preserving path and query where safe | Proposed; DNS/redirect not configured |
| `https://admin.nozha-badavi.com` | Private content/admin console | **Separate** admin Worker behind Cloudflare Access plus app-side authorization | Proposed; no admin host created |
| Cloudflare Worker preview URL | Preview testing only | Isolated preview resources, Access if needed, noindex and no production data | Proposed; must validate Workers Builds plan |
| `hello@nozha-badavi.com` | Optional public contact address | Only publish after owner approves and routing/receiving are verified | Proposed; not a confirmed mailbox |

Recommendation: one repository, **two purpose-bounded Worker applications**: `nusya-public` (Astro-based public content site, static assets, localized SSR/read-only published content, public enquiry endpoint) and `nusya-admin` (structured editor, authenticated administrative API and publication controls). This is a **design target, not an existing deployment**. A single Worker is allowed as an alternative only after documented risk/cost analysis demonstrating equivalent isolation; never expose admin routes through the public hostname merely because Cloudflare Access is enabled only for the admin subdomain. Both apps may share versioned types, validation logic and **approved** D1/R2 bindings with clearly separate API capabilities. No independently addressable public database endpoint.

Cloudflare's Workers Custom Domains require an **active zone** and appropriate hostname availability. Future agent must first verify the domain is attached to the correct account/zone and inspect DNS/CAA/SSL status before planning any route. The custom domain binding creates related DNS/certificates where supported; it is not proof that those resources already exist. Use Cloudflare custom domain rather than `workers.dev` for production. Configure `www` via the most economical supported redirect method, rather than a redundant Worker. Do not change MX/SPF/DKIM/DMARC without inspecting existing mail records and owner approval.

### 0A.2 Cloudflare product inventory — use only when useful

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

### 0A.3 Future repository structure (proposal; adapt after inspection)

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

### 0A.4 Worker & D1 content publishing design

Use a coherent publishing model. Preferred: public Worker uses cached server-rendered **published-only** projection, with a bounded D1 read on cache misses, explicit page cache invalidation/short TTL, and last-known-good fallback. Alternative: content publish triggers a static rebuild, only if objectively simpler. Never deploy all-static pages while expecting updates to D1 to magically change the published HTML. Admin Worker enforces draft/save/preview/publish/revisions/rollback and calls safe public-cache update/invalidation methods. Private/admin/enquiry responses are always `no-store`, never included in public CDN caches.

Transaction/order: (1) validate source claims, locale completeness, CTA destinations, video URI/hash and media ownership; (2) create immutable draft revision; (3) atomically mark authorized locale revision as published; (4) update/expire published projection and verify visible content; (5) retain prior good revision for rollback; (6) record actor and event without sensitive enquiry body in logs. If cache update fails, report degraded propagation; previous version remains recoverable. No accidental cross-locale publication.

Database future migrations must be idempotent and tested locally/staging, using `wrangler d1 migrations apply ... --local` for development **only after validating actual configuration**. Remote/production migration requires review, backup/export, cost and explicit authorization; no production D1 binding during preview or local tests. Apply principle of least privilege at API boundary.

### 0A.5 Secure forms, media and operations

- Public POST `/api/enquiries` (only on public Worker) validates minimal contact+service fields, allowed translation pairs, Turnstile token, quotas/rate limits and idempotency; persists to D1 before acknowledging and returns an opaque reference ID.
- Admin Worker (admin hostname only) reads/replies/exports records behind Access + app authorization, with audit logs and retention policies. Public Worker must not expose admin or query-all endpoints.
- Initial customer form has no mandatory document upload. R2 uses controlled private upload only when approved, with MIME/signature/size limits, license metadata and expiring access.
- For email, guarantee enquiry storage independently from provider availability. Email Service to verified owner is an option; provider transport/outbox retries are separately testable. Customer acknowledgements require an explicitly approved provider and budget if not included.
- Add sitewide CSP, HTTPS, secret store, `robots.txt`, XML sitemap, per-locale `hreflang`, and canonical to `https://nozha-badavi.com` (with language-specific canonical paths). Noindex previews/admin; strict permissions on admin hostname.
- Cloudflare Web Analytics/Observability must track only privacy-safe metrics, not PII; establish alerts on real failures and cost thresholds. No user data in source-control or logs.

### 0A.6 Required Cloudflare work plan — **future execution only**

**Preflight (read-only, once access authorized):** Confirm registration and zone for `nozha-badavi.com`, account ID ownership, nameservers/active zone, DNS/CAA/MX, current Workers inventory, Free/Paid/Zero Trust plans and limits, R2/D1 billing, existing projects and available GitHub integration. Do not assume screenshot proved these. Never touch unrelated applications/resources.

**Design gate:** Prepare high-fidelity desktop/mobile public + admin mockups, including Arabic RTL and video hero. Obtain explicit user approval; STOP before UI code.

**Build after approval:** Scaffold verified app stack, two Workers with separate public/admin capabilities and isolated local bindings, schema/migrations, lightweight CMS with revisions, domain-independent routing, EN/AR/RU, video/lead flows, media, accessibility, tests. Keep real production DNS untouched.

**Stage after authorization:** Create only the necessary development/preview Workers, staging D1/R2 if required, Access application and appropriate secrets; connect GitHub Workers Builds only after checking integration cost/permissions; prove previews isolated from production.

**Production approval gate:** Present exact changes to zone DNS/Custom Domains, production Workers, certificate/redirect behavior, D1/R2 bindings, admin access policy, email sending and GitHub automated deployments, estimated costs, backup and rollback. STOP for user's explicit production/infrastructure approval. A design approval is **not** domain/production approval.

**Deploy after approval:** Verify active zone, attach `nozha-badavi.com` to public Worker, `admin.nozha-badavi.com` to protected admin Worker, safe redirect for `www`, TLS, CSP, localized sitemap and proper canonical. Onboard email only if approved. Verify staging -> production migrations and backups; production smoke tests (EN/AR/RU, Vimeo, contact, auth, public no-admin leak, preview isolation, cache/publish/rollback, cost). If failure, revert Worker version and/or DNS using documented procedure without losing lead data.

**Operational handover:** Provide Nozha with admin instructions, ownership/access inventory, media/video editing guide, client enquiry response guide, backups, monitoring, spend controls, support/update SOP, link tests and verified release SHA. Record what was deployed, not just what was planned.

### 0A.7 Acceptance criteria for this extension

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

## 0. Executive directive and non-negotiable gates

Build a polished, personal, multilingual website that makes **Nozha Badavi / NUSYA Linguistic Studio** immediately credible and easy to contact; gives visitors reliable booking/enquiry paths; and allows Nozha to manage the site independently through a secure, lightweight admin interface.

**Non-negotiable requirements:**

1. **Exactly three website UI locales:** English (`en`), Arabic (`ar`, true RTL) and Russian (`ru`). Ukrainian may be mentioned accurately as a language in her professional background and eligible translation directions; it is **not** a fourth website interface. **No Korean** content, lessons, SEO pages, menu entries, metadata or AI-generated suggestions.
2. **Homepage video:** a prominent responsive, user-initiated Vimeo introduction using the supplied player URL: `https://player.vimeo.com/video/1171310337?h=3416a6f4f5`. Do not omit the `h` privacy hash, autoplay sound, or rely on Vimeo availability without a fallback.
3. **Full operational content control:** a private admin for approved edits to pages, hero, navigation, services, biography, translated copy, Vimeo details, image assets, SEO, contact destinations, reviews and incoming service enquiries. Use design-safe structured editing, not a free-form site builder.
4. **Premium authentic identity:** preserve NUSYA's warm ivory/espresso/antique-gold identity and globe motif while eliminating collage clutter; use approved, authentic Nozha imagery, not an AI-invented person. Accessibility, mobile-first clarity and performance are mandatory.
5. **Services:** English, Russian and Arabic tutoring (documented in updated CV); professional communication coaching; translation; interpretation. Customer-facing claims of current availability, language pairs, credentials, prices, lesson ages, professional certifications and locations must be explicitly approved and correct.
6. **Source provenance:** only publish claims traceable to approved CV/profile evidence or Nozha's written confirmation. Never publish private CV addresses/phone numbers by default.
7. **Explicit visual approval gate:** the execution agent must inspect the existing UI, create **high-fidelity desktop and mobile mockups before making any UI implementation changes**, present them, and **STOP until the user explicitly approves them**. Silence, inferred approval, or prior approval of this written plan is not design approval. Make no changes to public/admin UI before this gate clears. Subsequent substantive redesigns require renewed approval.
8. **Independent execution after approval:** the future coding agent should carry out routine design-to-code translation, development, migrations, integration, tests, debugging and verification autonomously, pausing only for mandatory design checkpoints, unavoidable access/content blockers, meaningful spending commitments or high-risk irreversible operations (including first production launch where warranted).
9. **Preserve actual repository conventions.** Never assume the stack, branches, database bindings, file structure or deployment environment. This plan is conditional on a future read-only preflight; adapt with the smallest maintainable changes.
10. **Respect platform rules.** Existing Preply students must not be diverted to prohibited off-platform bookings/payments. An outbound Preply click is not a confirmed booking.

---

## 1. Evidence, decisions, assumptions, and things to verify

### 1.1 Sources the user supplied (reference list, not a claim of live verification)

- Original NUSYA logo, warm-color promotional collage, professional photos/branding compositions, Instagram QR image, Preply QR image.
- Older CV image and **newer one-page CV PDF** (`Nozha_Badavi_CV_изменён.pdf`). Prefer the newer CV as a **draft factual source**, still subject to personal verification.
- LinkedIn screenshots (Russian-script name, multilingual language-educator About text, Ukraine location in screenshot, manager headline at Alsafir, mention of early-childhood work in Sweden).
- Instagram: `https://www.instagram.com/nusyabadavi` (link provided by user; profile content not independently validated in the scope of this plan).
- Preply profile link supplied by user: tutor identifier `522376`; future agent should verify current canonical public URL, content and applicable terms before using.
- LinkedIn screenshot shows a URL of the form `linkedin.com/in/нуся-бадави-253b8316a/`; verify the canonical profile link and permissions.
- Vimeo embed as specified above; its ownership, allowed embed domains, playback and subtitle options require later verification.
- Conversation-approved strategic design: premium *warm editorial* design, personal-first identity, user-friendly multilingual site and admin, independent project, Cloudflare-cost awareness.

### 1.2 Fact matrix — publish only after verification or explicit approval

| Potential public statement | Present evidence | Status / action |
| --- | --- | --- |
| Nozha Badavi / NUSYA Linguistic Studio | Branding, CV, profiles | Confirm preferred Latin, Arabic and Cyrillic name renderings and legal/business identity if needed. |
| Teaches English, Russian and Arabic | Updated CV and LinkedIn About screenshot | Documented, but verify these three lesson offerings currently accept enquiries. |
| English tutoring for adults/children | Preply context and CV | Confirm current booking links, learner age ranges, formats, duration and teaching methods. |
| Personalised and goal-oriented lessons | Updated CV | Appropriate positioning; avoid guarantees of results. |
| Coaching for meetings, conferences, presentations, speeches | Updated CV | Documented; confirm present availability/format. |
| Translation among English/Russian/Arabic/Ukrainian | Updated CV describes historical work | Confirm exact accepted **source→target pairs**, categories, pricing and legal limitations; do not auto-enable all 12 pairs. |
| Interpreting experience at migration service 2021–2022 | Updated CV | Appropriate history; confirm current offer, location and formats. |
| Preschool teaching at ABC All About Children | Updated CV says 2023–2026; older CV differs | Reconcile dates and confirm any employer/location claim. Do **not** treat work with ages 1–6 as proof that online lessons accept one-year-olds. |
| GoSchool English teaching, Mozhlyvist Arabic teaching, Alsafir 2019–2022 | Updated CV | Verify spelling, titles, dates before publishing. |
| Luhansk Taras Shevchenko National University (2019–2021), earlier Communication and Language studies (2013–2018) | Updated CV | Reconcile exact degree/award title and supporting evidence; no invented accreditation. |
| Russian/Arabic/English/Ukrainian language knowledge; beginner Swedish | Updated CV | Language knowledge ≠ lessons offered; no Swedish lessons or translation claims. |
| Certified/sworn/notarised/legal translation | **Not established** | Never claim unless independently documented/authorised. |
| Prices, availability, student testimonials, success rates | Not sufficiently established by provided sources | Admin-controlled and disabled/unpublished until real, approved data exists. |
| Public location, email/phone, professional photographs | CV/screenshots include potentially personal details | Publish only approved business contact methods and licensed/consented assets. |

**Never silently resolve conflicts.** Create a content sign-off checklist listing discrepancies, claimant/source and resolution; until resolved, omit or phrase cautiously. Live platform stats (reviews, lessons, rankings) are volatile; prefer linking to the source rather than copying fixed values. No invented credentials, awards, testimonials or statistics.

### 1.3 Decisions already fixed by the user

- Three UI languages, not four: **EN / AR / RU**.
- Homepage must visibly feature supplied Vimeo introduction.
- Private admin must control the website and service enquiries.
- Design must look genuinely premium and personal; real-world utility matters more than animations or feature count.
- **No Korean.**
- Plan only for this request. No repository/cloud access, code changes, commits, branches or deployments at plan-authoring time.
- Implementation-agent design approval is mandatory before UI coding.

### 1.4 Unverified technical assumptions (future agent must resolve)

- Repository exists at supplied URL and is accessible to authorised future agent; **not inspected** while authoring this plan.
- No knowledge of current default branch, existing product, package manager, frontend framework, styling system, design files, UI, admin, database, hosting config, Cloudflare bindings, CI workflows, authentication, APIs or DNS.
- Astro + TypeScript + Tailwind + Cloudflare Workers/D1/R2 are **candidate choices**, not asserted repository facts. Keep proven existing stack if it meets requirements and saves complexity. Re-platform only on written technical grounds and after identifying migration risks.
- Domain and ownership are unknown; plan with placeholders, not invented DNS records or service credentials.
- Number of administrators likely small; one owner with optional editor role is sufficient until proven otherwise.

---

## 2. Goals, user journeys, and scope

### 2.1 Product objectives

- **Trust:** visitors can immediately recognise Nozha, see authentic media, read verified experience and understand her teaching philosophy.
- **Clarity:** within one screen, visitors know the three taught languages, other language services, and what to do next.
- **Conversion:** lesson visitors use the authorised booking/request path; business customers submit structured translation, interpretation or coaching enquiries.
- **Self-service management:** Nozha edits content and publishes approved versions without changing source code.
- **Quality:** three complete, accessible language versions; usable admin; fast mobile experience; privacy/security.
- **Maintainability/cost:** small architecture, safe deployment, bounded resource use, simple backups and easy recovery.

### 2.2 Primary personas and flows

1. **English learner:** lands on `/en/` (or localised equivalent) → lessons card → suitability/method/reviews/FAQs → authorised Preply booking or separate eligible enquiry channel. Prominent CTA; don't describe an outbound click as a booking.
2. **Russian learner:** discovers Russian lesson details → understands current format and availability → submits enquiry or approved booking link.
3. **Arabic learner:** reads Arabic lesson page in appropriate language, understands Modern Standard Arabic vs dialect where confirmed, submits enquiry.
4. **Parent/guardian:** sees clear teaching approach/age eligibility → parent sends enquiry; don't collect children's unnecessary personal details or default children to direct chat.
5. **Professional:** selects communication coaching → states situation (meeting/presentation/conference/speech), target language, deadline/goal → receives acknowledgement.
6. **Translation customer:** selects translation → supported source and target language (guard invalid/self-pairs), purpose/type, approximate length, urgency/deadline → submits quote request without mandatory document upload.
7. **Interpretation client:** selects interpretation → languages, mode, subject, timezone/date, anticipated duration → submits scoping request.
8. **Nozha/admin:** authenticates → sees unanswered enquiries and translation-review tasks → replies/updates status → edits site copy, previews, publishes and can roll back safely.
9. **Mobile/social visitor:** arrives from Instagram/LinkedIn/Preply, understands offer, sees video and CTA immediately; no obstructive popups.

### 2.3 Initial release (MVP, complete—not an unfinished prototype)

- Public website: Home, About, Language Lessons (with English/Russian/Arabic service subviews), Professional Communication, Translation & Interpretation, Contact, privacy/legal pages; Resources navigation only if substantive verified content exists.
- English, Arabic RTL and Russian content coverage for all visible UI and real public pages; per-language SEO/URL strategy.
- Authentic branded layout, correct logo use, approved photography and social links.
- Prominent on-demand Vimeo video with accessible fallback/transcript support, controlled by admin.
- Service-aware contact forms, server-side validation, anti-spam, durable enquiry storage, acknowledgement and notifications; no client logins.
- Protected admin with content/service/media/video/translation/SEO/contact/navigation/review editing, drafts, preview, publish/rollback, enquiries and basic operational status.
- Safe CI/CD path, configuration documentation, tests, backups/export and live verification subject to approval/access.

### 2.4 Explicitly out of scope for MVP

- A complete LMS, quizzes, student accounts, in-app paid lessons, custom video conferencing, direct Preply account synchronization, automatic payment capture or promises of Preply-booking data.
- AI chatbot, expensive LLM translation at runtime, automated content scraping or unreviewed machine-translated publication.
- Public file upload of sensitive documents, certified translation guarantees, elaborate CRM, multi-tenant SaaS, unrestricted page builder, elaborate role matrix, complex animations.
- Native Ukrainian UI locale, Swedish lessons, Korean (entirely excluded), unsupported translation pairs.
- Any action affecting other repositories, unrelated projects or shared business systems.

### 2.5 Future additions only when justified by observed use

Secure private quotation-document uploads, a simple pre-lesson goals questionnaire, appointment availability for non-Preply clients, original language resources, automated follow-up reminders, human-approved AI translation drafts, expanded CRM. Require a measured need before building.

---

## 3. Repository and infrastructure discovery — **mandatory first step for future agent**

**This section has NOT been executed.** Once separately authorised to begin work, the coding agent must perform a **read-only preflight** on `digitronics2025/Nuzha-badawi` and report factual findings. Never guess paths or names. Do not create/switch branches as a side effect of inspection; preserve the existing checked-out worktree and user changes. Do not connect to, inspect or modify a different `digitronics2025` repository by association.

### 3.1 Inventory to inspect, if present

- Root `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, any nested instruction docs and product/design notes; resolve precedence and record constraints.
- Exact repository identity, current working tree, checked-out ref (without changing it), uncommitted changes, history relevant to current website; no destructive checkout/reset.
- `package.json`, lockfile(s), `tsconfig*`, lint/format/test configs, build scripts, existing framework/plugins/dependency graph.
- `src/`, `app/`, `pages/`, `routes/`, `components/`, `layouts/`, `public/`, `assets/`, `styles/`, `content/`, `locales/`, `i18n/`, `admin/` or their actual equivalents.
- Existing homepage, mobile header, navigation, hero, cards, video, About/Services/Contact, current translations and all user-visible states.
- API endpoints, auth middleware, data access layer, schema/migrations/seeds, file/media pipeline, email/notification pipeline, form flows and existing error handling.
- `wrangler.toml`, `wrangler.jsonc`, `astro.config.*`, `vite.config.*`, Cloudflare configuration, bindings for Workers/D1/R2/KV/Queues, environment variables/names (never display secret values), production/staging topology.
- `.github/workflows/*`, CI/CD, scripts, lint/typecheck/unit/E2E/test coverage, performance budgets, build/deploy commands, release/rollback convention.
- Current application errors, usability gaps, privacy concerns, accessibility patterns, responsiveness and active asset licenses.

### 3.2 Required preflight output

Produce a concise `Existing-State Assessment` in the future agent's working report: verified stack, meaningful file map, page inventory, UI screenshots at desktop/mobile, current data flow, risks, existing tests, deployment environment, cost-sensitive operations and **proposed changes mapped to real file paths**. Identify any unresolved secrets/domain/migration/asset permissions as blockers. Treat absence of a component as unknown until verified.

### 3.3 Decision tree for architecture

- **If existing stack is functional and maintainable:** extend it, preserve dependencies and convention; avoid a rewrite.
- **If repository is empty/minimal:** default to Astro + TypeScript + Tailwind with Cloudflare-compatible deployment, validated against currently installed versions and docs during future execution.
- **If an existing CMS/database works:** reuse rather than duplicating it, after validating editability, i18n, revision history and safety.
- **If no CMS exists:** implement the smallest structured content backend needed for all requested admin functions.
- **If Cloudflare is not configured:** prepare local/staging-compatible interfaces; do not provision paid infrastructure without explicit approval.
- **If the existing site is already live:** preserve all working routes, SEO redirects and any non-recoverable content; plan a reversible migration.

---

## 4. Final visual art direction — Cinematic Editorial Luxury

**Design decision:** NUSYA will look like a warm, sophisticated editorial portrait of Nozha, not a generic language school or motion-heavy landing page. The central theme is **The Art of Connection**: authentic portraiture, quiet paper-like ivory surfaces, strong espresso typography, and a restrained golden flight-path motif adapted from the supplied logo. These are selected design requirements for future mockups—not permission to implement UI before explicit mockup approval.

### 4.1 Source-based visual audit

| Existing source | Retain | Improve in the final website |
| --- | --- | --- |
| NUSYA script logo, globe and airplane | International identity, warm brown/gold | Clean consented/vector master, simplified small-size mark, one-time signature route animation |
| Warm promotional collage | Color warmth, aspirational studio atmosphere | Remove duplicated portraits, tiny copy, busy decoration and excessive visual effects |
| Nozha photos | Recognisable real individual | Lead with approved authentic photographs, consistent lighting, deliberate 4:5 crops; **no AI-generated/face-swapped portraits** |
| Updated CV / LinkedIn | Credibility and service scope | Translate into clear biography and verified timeline rather than publishing a dense CV image |
| QR images | Correct external destinations | Replace QR friction with accessible direct links |
| Vimeo introduction | Strong personal trust asset | Premium click-to-play poster immediately following hero, exact Vimeo ID/hash, captions/transcript where approved |

**Information restrictions remain unchanged:** UI locales EN/AR/RU only; English/Russian/Arabic lessons subject to current availability; Ukrainian may be accurately documented as translation/language background, not a fourth website locale; **no Korean**. Do not invent prices, qualifications, testimonials, translation certifications, office location or private CV contact information.

### 4.2 Locked palette, typography and layout targets

| Token | Value | Purpose |
| --- | --- | --- |
| Ivory `--color-ivory` | `#F8F4EE` | Public page background |
| Espresso `--color-espresso` | `#37231D` | Headlines, body/high-contrast buttons |
| Muted ink `--color-ink-soft` | `#624C42` | Secondary paragraph text; verify AA contrast |
| Antique gold `--color-gold` | `#B48A57` | Hairlines, emblem and micro accents—**not** small body text |
| Dusty rose `--color-rose` | `#C9A39A` | Secondary soft accents |
| Sand `--color-sand` | `#E9DCCF` | Cards and poster borders |
| White `--color-white` | `#FFFFFF` | Forms and admin surfaces |
| Divider `--color-line` | `#DFD0C2` | Thin separators |

- **Heading font:** Cormorant Garamond for English and Russian, after verifying Cyrillic coverage, proper weight and licensing; **body and UI:** Manrope for Latin/Cyrillic; **Arabic:** IBM Plex Sans Arabic (or a tested accessible alternative) with proper shaping. Script appears in the actual logo only, never in paragraphs or forms.
- **Headline scale:** H1 `clamp(3.1rem, 5.2vw, 5.6rem)`, line-height 0.99–1.06; H2 `clamp(2.35rem, 4vw, 3.8rem)`; H3 25–32px; body 17–18px desktop, 16px mobile, 1.55–1.7 line-height; mobile form inputs >=16px.
- **Grid:** 12 columns desktop / 6 tablet / 4 mobile; content max-width 1240px, readable line length 64–72 characters; gutters 40–64px desktop, 28–36px tablet, 20px mobile (16px minimum at 320px). Use an 8px-based spacing scale.
- **Rhythm:** section padding 112–144px desktop, 64–80px mobile; content, buttons and portrait tightly coupled in first viewport. Public card radius 18–24px, image frames 20–28px, buttons 12px; admin cards 10–14px. One light theme only; no theme toggle.
- **Portrait art direction:** real Nozha photograph, genuine expression, neutral daylight, restrained warm tone (not an orange filter), clear face, unaltered identity. Separate desktop/mobile approved crops and intrinsically sized AVIF/WebP derivatives; approved image licenses and consent.
- **Graphic system:** a **single** fine gold route-line/airplane emblem appears at hero and in restrained static variants elsewhere. No looping flying aircraft, 3D globes, neon, particle fields, heavy shadows, preloader or invented social proof. Decorative motifs never carry essential information.
- **Navigation:** desktop header 72–84px, mobile 64–72px, logo + meaningful primary links + native-language switcher + contact CTA; sticky with nearly solid ivory after scroll and subtle divider. All touch targets >=44px, visible focus.

### 4.3 Page-by-page final art direction and storyboards

**H01 — Hero / first 900ms:** Real portrait on right desktop (approximately 55% text / 45% portrait), editorial left text, tasteful overline, concise H1 "Learn a language. Find your voice. Connect with the world." (draft pending copy approval), one-line supporting expertise, primary espresso **Explore Lessons**, secondary outline **Request Language Services**. A thin gold arc near the portrait reveals **once**, then remains static. Text and CTA already exist/are clickable before JavaScript. No intro splash screen.

**H02 — Proof strip:** Three *verified* evidence labels (e.g., personalised teaching, multilingual experience, education and interpreting). Thin dividers, small abstract icons, no invented counts, badges or award figures.

**H03 — Meet Nozha video:** Immediately following hero and proof. Premium 16:9 real still poster, framed in sand, big high-contrast Play button, introduction text, localized verified transcript link. **On click only**, instantiate Vimeo iframe `https://player.vimeo.com/video/1171310337?h=3416a6f4f5`; no autoplay audio before click, no player requests before interaction where feasible. If blocked/unavailable, show poster, fallback link, transcript if approved and lesson CTA.

**H04 — Three lesson cards:** English, Russian and Arabic in one row desktop and a vertical stack mobile. Each card has a carefully cropped contextual photo *if licensed*, strong serif heading, one-sentence learner outcome, and single appropriate booking/enquiry action; no flag icons, no generic school graphics. Enter viewport with one-time stagger, hover image scale max 1.02.

**H05 — Professional communication:** Editorial half-photo/half-text for coaching around meetings, speeches, conferences and presentations, with a three-step explanation and clear enquiry CTA. No fabricated corporate testimonials or certifications.

**H06 — Language services:** Two calm side-by-side panels for written translation vs interpretation, clearly separated and tied to verified service scope and approved language pairs. Quote enquiry route, not fake pricing calculator.

**H07 — About:** Second authentic Nozha image or approved still, first-person text, concise 3–5 proven milestones in a subtle mostly-static vertical timeline. CV chronology fully appears on About page, not the homepage.

**H08 — Reviews & FAQs:** Only consented, source-attributed reviews; omit entirely if none approved. Accessible accordions with short calm expansion, without layout-rattling effects.

**H09 — Final invitation:** One deep espresso full-width panel with ivory headline, two CTAs, a small static globe emblem and thin finishing gold route. Footer contains legal links, verified contact and accessible Instagram, LinkedIn, Preply links.

**Mobile hero (390×844):** header → heading, short description and two actions → portrait → evidence band → video poster → stacked lesson cards. The primary CTA must be visible early; do not push it below fold behind image decoration. Avoid sticky CTAs over form fields. Page is still usable at 320px.

**Other pages:** About has cinematic portrait plus a restrained career timeline; Lessons has three detailed editorial service experiences and teaching method; Coaching offers example preparation contexts; Translation & Interpretation uses two distinct quiet sections and a conditional quote form; Contact presents choice-first minimal fields and honest success reference; 404/unavailable services have still readable content and direct recovery actions. A Resources page is hidden until original approved content exists.

### 4.4 Motion art direction: "Quiet Cinema"

The production experience must **feel** cinematic because of photography, typographic hierarchy and pace, not because every element moves. Motion should direct attention, signal a state change and then stop. Static content is the baseline. No continuous parallax, 3D tilt, scroll-jacking, custom cursor, noisy page transitions, heavy Lottie/WebGL/canvas animation or video backgrounds.

#### Fixed timing and easing tokens

| Token | Value | Intended use |
| --- | --- | --- |
| `--motion-fast` | 140ms | Hover, press, icon feedback |
| `--motion-ui` | 220ms | Menus, accordion, modal |
| `--motion-card` | 280ms | Service card hover/reveal |
| `--motion-section` | 420ms | One-time section entrances |
| `--motion-hero` | 640ms | Hero text/portrait reveal |
| `--motion-route` | 900ms maximum | Single gold-route line draw |
| `--ease-enter` | `cubic-bezier(.22,1,.36,1)` | Non-bouncy entrances |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Exits |
| `--stagger` | 65ms, at most 3 items | Controlled storytelling rhythm |
| `--enter-distance` | 18px desktop / 10px mobile | Maximum section reveal travel |
| `--hover-shift` | 4px maximum | Arrow/link feedback |

#### Animation choreography matrix

| ID | Trigger | Visual behavior | Time | Accessible / reduced-motion equivalent |
| --- | --- | --- | --- | --- |
| M01 | First paint | Header already visible; optional faint opacity reveal, no slide | 220ms | Static visible header |
| M02 | First paint | H1 reveals by **line**, opacity + 12px translate; no letter splitting | 640ms, stagger <=65ms | Full visible headline |
| M03 | First paint | Portrait inside stable crop: opacity 0.9→1 and scale 1.025→1 | 640ms | Full still portrait |
| M04 | Once, hero | 1–1.5px gold flight path progressively reveals; airplane stays stationary at endpoint | <=900ms | Static full emblem or omit decoration |
| M05 | First paint | CTAs gently appear but stay interactable immediately | 420ms | Immediate CTA |
| M06 | Evidence enters viewport | Small opacity + up to 10px reveal; never counting animation | 320ms | Static text |
| M07 | Vimeo poster enters viewport | Border/opacity settles, Play button hover scale <=1.03 | 220–350ms | Static poster and Play |
| M08 | Lesson cards enter viewport once | Opacity and 18px lift, stagger max 3×65ms | 420ms | Static cards |
| M09 | Pointer-hover | Card image scale ≤1.02 inside stable clipping; border tint only | 280ms | No scale |
| M10 | Link hover/focus | Underline grows from **inline-start** (correct for RTL) | 180ms | Constant clear underline |
| M11 | Supported same-origin navigation | Gentle crossfade / <=6px reveal; never full-screen wipe | 180–240ms | Immediate native navigation |
| M12 | Menu/dialog user action | Opacity + 8px translate, correct focus and Escape handling | 220ms | Immediate state change |
| M13 | Form conditional selection | Field content gently replaces; preserve focused control and stable layout | 120–180ms | Immediate field state |
| M14 | Server-confirmed enquiry success | Small one-time icon/check fade + readable reference | 200ms | Static success reference |
| M15 | Admin save/publish result | Small real-status toast opacity/6px reveal; errors persist until read | 160ms | Static status |
| M16 | Admin sidebar toggle | 6–8px translation/opacity, no bounce or table stagger | 180ms | Instant sidebar |

**Gold-route contract:** Use a simple approved, efficient SVG path; animate one stroke-draw on first reveal only if performance tests permit. The airplane icon stays still at the endpoint; don't depict fabricated country routes. Never attach a route line to every scroll position, or run an animation frame loop. For slow devices, data saver or reduced motion, use the still route or omit it.

**Motion implementation hierarchy:** Native CSS for opacity/transform first; IntersectionObserver may trigger **one-time** decorative section entries with a single shared observer and safe defaults. Native same-origin View Transitions API may add the quiet page crossfade when supported, but cannot be essential and must not apply to public↔admin origin changes. CSS scroll-driven animations are progressive enhancement **only** for optional decoration, with static fallback; older browsers must see full content. Do not adopt GSAP, Framer Motion, Lottie, Lenis, Three.js, a smooth-scroll library, a large animation runtime or custom `requestAnimationFrame` loop for MVP.

**No motion trapping:** Content remains visible and usable if JS, animation CSS or intersection triggers fail. Under `prefers-reduced-motion: reduce`, disable reveal, route, page crossfade, smooth scroll and hover scaling; keep instantaneous, accessible focus/state feedback. Respect motion changes during session. Never animate body text letter by letter, flash or auto-play video. Keyboard, screen readers and touch users receive the same content and service outcomes.

### 4.5 Microinteractions and component behavior

- **Logo/header:** logo stays sharp and still; header can acquire subtle ivory surface/border after scroll. Never animate logo continuously. The language switcher shows `English / العربية / Русский` without flags and preserves current equivalent page.
- **Buttons:** primary espresso; secondary outlined; text link with purposeful gold hairline. Focus ring obvious, pressed state fast, hover arrow moves <=4px on hover-capable devices only. No 3D bounce or long color cycles.
- **Menu mobile:** light panel from nav edge, readable targets, Escape/outside close, focus trapped only if implemented as a true modal, focus restored; correct AR logical direction. No overscroll/focus escape.
- **Lesson cards:** image scale 1.02 on pointer hover; text never moves or changes position; entire card clickable only when controls do not conflict. Unavailable service card shows honest state.
- **FAQs:** accessible button and aria-expanded; content expansion avoids large layout jank; opening state immediately readable with reduced motion.
- **Video card:** custom poster, semantic Play, optional transcript, helpful error fallback. Validate exact Vimeo ID and privacy hash; no injected arbitrary iframe source.
- **Enquiry forms:** selecting lesson vs coaching vs translation vs interpretation reveals only relevant fields. Use labels and inline validation; preserve input focus; no unnecessary multi-step flow. Success shown **only** after durable server save; no fake spinner progress or false email-sent claim.
- **Content editing/admin:** stable Saved Draft / Published / Needs Review states, publish confirmation and error recovery, never auto-hide a critical error; toast is screen-reader accessible.
- **Anchor navigation:** native href, correct sticky header offset, proper focus and history semantics; avoid forced smooth scrolling for reduced motion.

### 4.6 Responsive, language and motion variations

**Desktop ≥1200px:** 12-col layout, 55/45 hero, unaltered portrait crop, side-by-side coaching and language services, three lesson cards in one row. No gigantic whitespace or overly long line widths.

**Tablet 768–1199px:** use 6-col grid, 50/50 hero if copy fits; otherwise stacked. Two-card service layout, faithful readable typography. Do not shrink Arabic or Russian to force Latin compositions.

**Mobile ≤767px:** true one-column visual narrative; heading and main CTA visible early, portrait next, video high on page, lessons vertically stacked; 20px gutter, min 44px controls, no fixed giant CTA covering content, no full-screen decorative motion. Reduce reveal translations and image weight. Respect device safe areas and virtual keyboard.

**320px and 200% zoom:** titles wrap without clipping, no horizontal overflow, all forms can be completed, language names and email addresses use bidi-safe/wrap-safe display, large touch controls remain usable.

**Arabic RTL:** real semantic `lang=ar` and `dir=rtl`, logical padding/margin, mirrored directional arrows, navigation and form alignment, appropriate heading type size, correct bidi isolation of URLs/emails/phone numbers. **Never mirror Nozha's face, actual logo, social logos or Latin text.** An optional gold arc may start from RTL inline-start but the plane shape stays unchanged. Do not use Latin tracking or split Arabic letters for animation.

**Russian:** check Cyrillic weight/glyph quality in chosen display font, naturally longer strings, buttons that expand without overflow, correct reviewed translation—not transliterated English placeholders.

The admin can initially use English interface chrome if Nozha approves, but all **public** pages, notifications/form strings and editable site content must support EN/AR/RU. Do not mislabel admin localization as implemented before it exists.

### 4.7 Admin visual system: sister product, not a marketing clone

At proposed `https://admin.nozha-badavi.com`, retain espresso/ivory/logo consistency while optimizing dense everyday tasks. Prefer 14–16px UI text, clear statuses and responsive controls rather than oversized serif decorations. Admin motion durations should be 140–220ms maximum.

**Desktop overview:** 240–260px left navigation, top search/account/help, short attention row for New Enquiries, Needs Translation Review, Last Published and Actual Site Status; actionable inbox and Quick Edit shortcuts for Homepage, Services, Video. Never show fake KPI numbers.

**Mobile overview:** compact header, focused alerts and task list; no tiny full-width table. Enquiry states are text + icon + distinguishable color, not color alone.

**Content editor:** structured block controls (heading/copy/image/CTA/order within approved templates), EN/AR/RU tabs with review badges; clearly distinct Saved Draft, Preview and Publish. Desktop may have side-by-side preview; mobile uses tabs and preserves unsaved changes. Permission checks and edit conflicts visible.

**Enquiry inbox:** filter/search and service/type chips, date with timezone, real message status and safe history; no bouncing drawer or status animations. Response templates are optional after real need.

**Media and video:** replace approved poster/photo, edit Vimeo ID/hash, visibility and localized caption/transcript; show file source/rights and explicit preview before publishing. Do not expose arbitrary executable HTML editing.

**Accessibility:** keyboard-operable nav/dialog/editor, focus management, labelled statuses, non-flashing saving feedback, mobile editing with keyboard-safe controls and reliable recovery from errors.

### 4.8 Graphic assets and production deliverables

- **Identity:** SVG/approved master wordmark, simplified responsive mark, favicons/icons (16px, 32px, 180px where applicable), correct clear space, a 1–1.5px gold route icon; no illegible microscopic globe details. Inspect rights and logo source; do not unilaterally redesign NUSYA identity without mockup approval.
- **Hero photos:** one real, licensed/consented professional portrait, a 4:5 source, subject-safe 16:9/portrait crops for desktop/mobile, neutral daylight tone. Do not generate a fictional portrait of Nozha, replace her facial features or infer private details.
- **Social previews:** 1200×630 OG compositions localized EN/AR/RU as appropriate with actual brand/photo and accurate copy; one restrained design language across Instagram, Preply and LinkedIn outbound links (do not modify their accounts without approval).
- **Video:** approved 16:9 poster still; large accessible Play glyph; localized intro and reviewed transcript page/accordion; fallback link if Vimeo fails. Preserve video ID `1171310337` and hash `3416a6f4f5`.
- **Service art:** three high-quality authorized images, or typographic/line illustration alternatives when real photography is not available; never use AI-generated images to impersonate Nozha or fictitious student results.
- **Motion handoff:** editable source path/SVG, fully static SVG fallback, M01–M16 timing sheet, motion storyboard frames, visual component states and responsive crops. No purchased animated theme dependency.
- **Licensing/privacy:** document rights/source for images/video and testimonials; strip sensitive EXIF/geolocation from photo exports; never commit private CV material or unapproved personal contact data to public GitHub. Do not distribute font binaries.

### 4.9 Measurable performance, motion and accessibility budgets

These are **targets for the future implementation**, not measured current site results.

| Area | Required target / decision |
| --- | --- |
| LCP | <= 2.5s at p75 where real field data exists |
| INP | <= 200ms p75 |
| CLS | <= 0.1 p75; aspirational <=0.05 for hero/form |
| Motion latency | Decorative route <=900ms, reveals <=640ms, hover 140–280ms; no input delay caused by animation |
| Main-thread cost | No long task >50ms introduced by motion code; smooth on representative mid-range mobile hardware |
| JS footprint | Homepage interactive JS excluding Vimeo target <=90KB gzip, stretch <=50KB, after actual framework audit |
| CSS footprint | Homepage initial CSS target <=45KB gzip; avoid animation framework CSS |
| Media behavior | Explicit dimensions/aspect ratio, responsive compressed portraits/posters, lazy-load below fold |
| Vimeo | Zero third-party player scripts/iframe requests until Play where feasible; robust blocked/unavailable fallback |
| Fonts | Minimize variants, subset/host legally and avoid visible font-induced layout shift |
| Accessibility | WCAG 2.2 AA, keyboard/focus order, contrast, 200% zoom, AR RTL, RU wrap and reduced motion |
| Cost | No added Worker/D1/R2/API reads, paid animation service, cron or LLM solely to animate UI |

If performance or accessibility conflicts with decoration, **remove decoration first**. Never hide text before JavaScript loads or run heavy on-scroll computation. Static composition must remain excellent; real user benefit outranks motion fidelity.

### 4.10 High-fidelity mockup and prototype package — exact deliverables

Before **any** public or admin UI coding, the future design/execution agent must inspect the real repository state and create inspectable high-fidelity artboards (not text-only wireframes):

| Board | Size and state | Required composition |
| --- | --- | --- |
| V01 | Home EN desktop ~1440px | Complete page, hero, portrait, evidence, Vimeo, services, footer |
| V02 | Home EN mobile ~390px plus 320px stress | Full mobile page, CTA first, portrait, video, menu and cards |
| V03 | Home Arabic desktop + mobile | Real RTL layout, Arabic font, directional navigation and mixed-data cases |
| V04 | Home Russian desktop + mobile | Cyrillic font, realistic long-label and wrapping behavior |
| V05 | Lessons desktop + mobile | All 3 lesson cards, individual service details and disabled state |
| V06 | About desktop + mobile | Human story, verified timeline, portrait treatment |
| V07 | Translation/coaching and contact mobile | Conditional form, error, loading, server success and accessible reference |
| V08 | Admin overview desktop + mobile | Inbox, review queue, real statuses, quick actions |
| V09 | Admin editor desktop + mobile | EN/AR/RU tabs, Saved Draft vs Published, preview, conflict and rollback |
| V10 | Vimeo poster/play/failure | Poster and real iframe treatment, transcript and fallback |
| V11 | Motion storyboard | 6–10 sequential frames for hero route, card reveals and page transition; timings keyed M01–M16 |
| V12 | Accessibility alternate | Static reduced-motion, keyboard focus, 200% zoom and no-animation fallbacks |

Include exact typography/color/style references, approved asset manifest, interactive prototype or motion clip representing the intended behavior, responsive breakpoints, microinteraction table, and a concise rationale. **Full-page** compositions must be inspectable, not only one cropped hero image. Show the differences between proposed style and source collage without claiming the visuals already exist.

**HARD STOP:** Present mockups, motion storyboard and alternatives only where necessary; then **STOP until the user explicitly approves them**. This finished plan chooses the design direction and no longer needs routine stylistic questions, but it **does not waive the previously required mockup approval**. If the owner requests changes, update mockups and record approval in `docs/DECISIONS.md`. No public/admin UI code, styling, routes, preview deployment or production deployment before that gate. Changes to real personal claims, assets, domain/account operations, paid services and high-risk actions require their own approvals.

## 5. Visual implementation & design verification after approval

### 5.1 Preparatory inspection and sign-off (read-only)

1. Review exact GitHub repository, current instructions, actual stack/pages if any, current design assets/fonts and real performance/test baselines. Documents and a registered domain do **not** prove an app or Cloudflare resources exist.
2. Validate which Nozha photos/logo/video stills may be publicly used, reconcile professional facts, and confirm source/target translation pairs and service availability; omit unapproved elements rather than inventing them.
3. Create V01–V12 high-fidelity boards including Arabic RTL, mobile, admin and motion storyboard. Present them and **STOP for explicit owner design approval**.
4. Once approved, lock the approved tokens, assets, component variants and motion changes in `design.md`, `docs/DECISIONS.md` and the relevant source/content register.

### 5.2 Ordered visual implementation (only after mockup approval)

1. Implement approved tokens, fonts, logo variants, responsive grid and accessible public shells in the **verified actual** stack. Keep static content accessible without JS.
2. Implement hero/portrait, evidence, Vimeo poster, lesson cards, coaching, translation/interpreting, About, FAQs, Contact and footer, matched against V01–V07.
3. Add M01–M16 **progressive enhancements** using native CSS/appropriate browser APIs only. Keep reduced-motion variants from V12 and instant safe navigation fallback. Do not block/slow interactions for cinematics.
4. Implement protected structured admin UI with its practical motion rules and measured saved/published/locale-review states; compare to V08–V09.
5. Test every page at 1440px, 768px, 390px and 320px in EN/AR/RU where relevant, 200% zoom, keyboard-only and reduced-motion, phone-like network/CPU throttling; inspect real rendered screenshots and interaction recordings, not text-only assertions.
6. Audit Vimeo play/failure, form conditional/failure/success, service unavailable, menu focus/Escape, layout shifts, page transition fallbacks, SSR/caching and API usage. Remove expensive or problematic effects, don't hide failures.
7. Record measured JS/CSS/media sizes, web vitals, known deviations, approvals, visual regression results and Cloudflare usage impact in documentation and test report.
8. Request separate production/cloud account/DNS/paid/irreversible authorization; this plan and approved mockups do **not** authorize infrastructure changes.

### 5.3 Final visual definition of done

- First viewport clearly identifies Nozha, English/Russian/Arabic lesson offerings and the primary action on desktop and mobile; video remains prominent immediately after opening hero.
- Full public and admin compositions are demonstrably faithful to **approved** V01–V12 visual designs and usable under EN/AR/RU, including true RTL and long Cyrillic copy.
- Motion M01–M16 is implemented only where supported and performant; reduced-motion is equally complete and functional. No animation scroll hijacking, unapproved 3D/GSAP/Lottie or looping decorative scripts.
- Real unmodified identity photos and legal assets only. No artificial credential, testimonial, price or customer statistic; no Korean anywhere.
- Forms and admin show accurate live status; no edit/publish confusion, focus loss, visual jank or customer-data leakage.
- Tests actually run and pass or have explicit documented waivers; budget targets checked. Release and cloud action remain subject to independent approval.

---
## 6. Video strategy and media handling

**Required Vimeo reference:**

```text
https://player.vimeo.com/video/1171310337?h=3416a6f4f5
```

- The embed is user-supplied; **do not assume content rights, playback, captions or domain permissions** are verified. Pre-launch check actual video playback on intended domain and devices, ownership/embed policy, full spoken content, thumbnail rights and audio language.
- Show an attractive custom poster with accessible Play button. Lazy-load iframe only upon user interaction or near-viewport with user consent as appropriate; avoid autoplay; respect aspect ratio, fullscreen, picture-in-picture where allowed.
- Validate Vimeo URLs in admin using strict allowlist; store normalized ID and hash, do not store arbitrary raw HTML/iframe code. Sanitize text associated with video.
- Provide admin fields: Vimeo URL, poster asset, section visibility, heading/intro per locale, display order within approved layout constraints, optional reviewed transcript/subtitle references, fallback CTA.
- Do not promise multiple caption tracks can be attached unless owner access allows it. Provide local translated transcripts separately if rights/accuracy allow; identify transcript translation as reviewed rather than automatically generated.
- A video error, blocked iframe or deletion must display helpful static poster/message and the lesson/contact CTA; never leave broken black box or block page rendering.
- Content security policy: permit precisely required Vimeo player frame domains and thumbnail origins; limit scripts to necessary trusted origins. Confirm privacy/cookie disclosures.
- Use first-party optimised images with approved descriptions; lazy-load below fold; generate responsive sizes/AVIF/WebP when practical; protect real people's image rights.

---

## 7. Admin CMS & operations specification

### 7.1 Design principles

- Nozha should reach the important task in **1–2 clicks**: new enquiry, edit homepage, change video, update availability, review translation.
- Start admin homepage with live attention items; do not display fabricated business metrics.
- Prefer a structured section editor + visual preview over unrestricted drag-and-drop HTML.
- Show last-saved state, last-published state, which locales need review, what is live and what is only draft.
- No hidden auto-publishing, silent AI rewriting or accidental modification across translations.
- Responsive admin must work on phone, including keyboard-safe edit forms and accessible status/actions.

### 7.2 Admin modules

| Module | Must support |
| --- | --- |
| Overview | New/unanswered enquiries, translation review queue, latest publish status, quick actions; no fake stats. |
| Homepage & Pages | Edit supported structured sections: heading, rich text subset, image reference, CTA, visibility, limited approved ordering and layout variations. |
| Profile & Experience | Biography, approved education/roles/timeline, teaching philosophy, language inventory, evidence/review status. |
| Services | English/Russian/Arabic lessons; professional coaching; translation; interpretation; availability toggles, eligibility, supported pairs, policy, pricing display (optional), booking actions. |
| Translations | EN/AR/RU parallel editing, fallback warnings, `needs_review` when source changed, locale-level publish checks; human approval. |
| Media | List/upload/replace/remove with MIME/size/dimension validation, accessible alt per locale, reference tracking; don't delete in-use assets without confirmation. |
| Video | Vimeo URL/id/hash, poster, visibility, per-language headings/transcripts, preview, playback validation. |
| Reviews | Source, text, permission, public attribution, moderation, display toggle, review date. No scraping/auto-fabricating. |
| Enquiries | Inbox with states, filter/search, detail, internal notes, acknowledgements, response tracking, export, retention actions; no false claims of sent emails. |
| Navigation & Footer | Approved link list, ordering, visibility, translated labels, social links and legal links. Prevent broken links. |
| SEO | Locale-specific metadata, OG image, canonical, slug with safe redirect workflow, sitemap/indexing controls and preview exclusion. |
| Publishing | Draft/preview, publish per locale or atomic group, change summary, revision history, rollback, cache refresh. |
| Settings & Access | Approved public contacts, legal links, roles, notification preferences, basic site health. |

### 7.3 Admin roles and authentication

- **Owner:** full content and user management, publish/rollback, export and deletion.
- **Editor** (optional): content/media drafts, translation editing and approved enquiry handling; restricted access to settings, credentials, destructive actions and publishing if owner-only desired.
- First prefer existing authentication. If using Cloudflare Access, enforce identity verification server-side (issuer/audience/signature), allowlisted identities and application permissions; Access alone is not sufficient authorisation logic. Require MFA for privileged accounts where provider allows.
- Session expiration, logout, CSRF/origin protection for mutations, content security policy, trusted proxy/header handling, no credentials in client bundles. Never invent a default/admin password or expose the CMS anonymously.
- No custom passwords unless absolutely needed; avoid unnecessary user tables. Audit privileged content changes with actor ID, timestamp, record, version and action, without logging private enquiry contents.

### 7.4 Publish/review workflow

`Draft -> Preview -> Locale review -> Publish -> Verify public version -> [Rollback if necessary]`

- Draft saves must not change public content. Locales have independent approved versions and a recorded source-language revision. Changes to source text automatically flag translated drafts for review, **not** silently overwrite published translations.
- Show diffs between versions, author and date, dependency warnings for missing CTA destination, missing translated alt text, unsupported service or broken asset.
- Publish is atomic for each content item/locale, with optimistic concurrency/version checks (no silent overwrite from two open admin tabs). A failed publish leaves last working public version active.
- Draft preview links use short-lived auth/unguessable tokens, `noindex`, no public caching and no PII leakage.
- If a service becomes unavailable, immediately hide or replace booking CTAs with a clear contact/availability message; remove from any active service menu where appropriate without destroying historical data.
- Provide explicit rollback to last good published version; audit and explain the result.

### 7.5 Enquiry lifecycle

Suggested statuses: `new`, `reviewing`, `awaiting_customer`, `quoted`, `booked`, `completed`, `closed`, `spam` (only use states supported by actual workflow). UI uses friendly translated labels.

- One form type per service using common customer contact fields + conditional service-specific fields.
- Client collects **minimum necessary** information: contact, service, language, goal/description, optional deadline; parent/guardian contact for minors. Add privacy acknowledgement.
- Translation: source + target must differ and be within a **configured approved** language pair, not a naive cartesian product. Customer may describe approximate word count/type/deadline; no compulsory document attachment in MVP.
- Interpretation: direction, date/timezone, duration, subject and online/in-person preference; no implied in-person availability.
- Booking: direct link to Preply where appropriate, other booking paths only if contractually and operationally allowed.
- Submit: client-side convenience + independent server validation, Turnstile token verified server-side, bounded payload, simple rate limit, idempotency token, enqueue or save **before** confirmation, immutable reference ID.
- Notifications: transient provider failure should not lose enquiry. Use durable outbox/retry where justified; don't claim email sent if provider failed. Follow-up reminders optional and opt-in.
- Acknowledgement in user's locale with neutral expectation and reference number, not a fabricated response SLA.
- Admin status transitions and notes must be auditable; handle concurrency, duplicates, spam, hard-delete/retention requests, failed exports and notification outages.
- Avoid tracking whether third-party Preply click became a booking without authorised actual booking data; label as “outbound booking click.”

---

## 8. Candidate technical architecture (conditional after real repository audit)

### 8.1 Recommended minimalist design

**Public:** content-led SSR/edge-rendered pages or equivalent existing-stack solution, cacheable HTML, optimized static assets; robust SEO + three locales.  
**Admin:** authenticated, mobile-friendly web UI on a protected subdomain or existing safe `/admin` route.  
**API:** narrow Worker/API endpoints for content editing, publish, media and enquiries, not a generic public CRUD API.  
**Data:** D1 only where justified (content versions, settings, enquiries, audit), R2 only for customer-approved uploaded public media and later private assets; no KV unless measured benefit warrants it.  
**Security:** Access or equivalent authentication, server authorisation, secret binding, validation/rate limits, CSP and proper backup/recovery.  
**Monitoring:** minimal, privacy-aware health/errors and high-level non-PII analytics.

### 8.2 Static vs dynamic content — resolve explicitly

The earlier “all-static pages + editable D1 CMS” idea is incomplete unless publishing triggers regeneration. Future agent must choose and document one **consistent** model:

- **Option A (recommended for low-volume site unless existing stack suggests otherwise):** serve published content through SSR/Worker with bounded D1 reads and **explicit public HTML edge caching**, TTL/freshness strategy and publish invalidation; keep drafts/auth/enquiries completely private and uncacheable. Use last-known-good published snapshot/short TTL to remain resilient to database trouble.
- **Option B:** static build on publication with a safe, authenticated build/deployment workflow and content snapshot. This offers very low request cost but adds build delays and credentials. Choose only if existing CI makes it materially simpler.
- Avoid combining static HTML and D1 edits with no publication mechanism, and avoid excessive D1 reads on each anonymous request. Document target publication propagation time and exact verification method.
- For Option A, confirm Cloudflare's actual cache behavior/config; do not assume `Cache-Control` alone causes HTML caching in all configurations. Use precise Cache Rules/Worker Cache API if needed; TTL fallback must protect from failed purge. Never cache `Set-Cookie` or personally identifying responses.

### 8.3 Suggested conceptual content/data entities (NOT verified existing tables)

Prefer reuse of actual database if suitable. Minimal logical model:

- `content_entries`: stable ID/key, kind (`page`, `service`, `settings`, `menu`, etc.), canonical slug, status/timestamps; optional section ordering.
- `content_locales`: per-entry `locale` (`en`,`ar`,`ru`), published revision, draft revision, translation reviewed against source revision, SEO title/description, lifecycle flag.
- `content_revisions`: immutable, versioned, schema-validated JSON section payload, actor, timestamps, content hash and change note; bounded retention/pruning policy.
- `media_assets`: asset ID, R2 object key (if applicable), MIME/size/dimensions, licence/consent flag, source, created/updated, orphan/reference state; locale alt text via structured fields.
- `enquiries`: opaque reference ID, type, minimal contact data, selected locale, validated fields, status, `created_at`,`updated_at`,`retention_at`, optional safely hashed dedupe token. Avoid raw document contents in logs.
- `enquiry_events`: status changes/internal notes/notification results where needed; protect PII.
- `admin_audit`: actor, action, entity, revision, timestamp, minimal details and outcome.
- `notification_outbox` only if durable retry mechanism needed; no costly recurring polling without volume.

Indexes to consider **after inspecting query patterns**: unique `(entry_id, locale)`, revisions by `(entry_id, created_at DESC)`, enquiries by `(status, created_at DESC)`, enquiries by `(type, created_at DESC)`, retention expiry and dedup unique key if used. Always use pagination and bounded `LIMIT`; never full-table scans per page view. Bind parameters, validate allowed sort/filter keys. Avoid automatic index proliferation.

### 8.4 Routes/API contracts (adapt to actual framework)

**Public:** `/en/`, `/ar/`, `/ru/`; `/[locale]/about`, `/[locale]/lessons`, `/[locale]/coaching`, `/[locale]/translation-interpretation`, `/[locale]/contact`, legal pages; individual lesson path only if warranted. Maintain redirect map for changing slugs.

**Private:** `/admin` or `admin.<approved-domain>` with protected navigation and server API. Candidate endpoints under `/api/admin/*` for draft/publish/revisions/preview/settings/enquiries/media; `/api/enquiries` public POST only, rate limited. APIs must have versioned request/response validation, predictable errors and non-leaking audit logs.

**External:** approved Preply link, Instagram, LinkedIn, Vimeo, transactional email provider. Do not add third-party APIs without practical need/approval. Explicitly handle external service failure.

### 8.5 Repo file touch map — **examples to locate, not claims of existence**

| Area | Paths/patterns future agent must discover and potentially modify |
| --- | --- |
| Project rules | `README.md`, `AGENTS.md`, `CLAUDE.md`, nested equivalents; edit documentation only as needed. |
| App infrastructure | `package.json`, lockfile, `astro.config.*` / `vite.config.*`, `tsconfig*`, lint/test setup, current router. |
| Public layout | `src/layouts/*`, `src/pages/*`, `src/components/*`, `src/styles/*` or actual paths. |
| Internationalisation | `src/i18n/*`, `src/locales/*`, locale routing and translation dictionaries or actual paths. |
| Content/CMS | `src/content/*`, `src/lib/content/*`, `src/pages/admin/*`, admin API routes or actual equivalents. |
| Forms/business | `src/components/forms/*`, `src/pages/api/*`, `src/lib/enquiries/*`, email clients or actual. |
| Data | `migrations/*`, `schema/*`, `db/*`, D1 bindings and typed access layer. |
| Assets | `public/*`, `src/assets/*`, approved logo/photos and associated rights/metadata. |
| Deploy/CI | `wrangler.*`, `.github/workflows/*`, environment validation and release docs. |
| Quality | unit/integration/e2e/a11y tests, snapshot tests, perf scripts and their actual directories. |

**Never invent files to overwrite.** Use preflight map, document every actual edit and minimise change scope. Keep unrelated application behavior and external infrastructure untouched.

---

## 9. Security, privacy and legal controls

- Owner-approved business contact info only; **do not republish the CV's personal phone/address** automatically. Protect media rights, image releases and testimonials. Record permissions.
- Decide site privacy notices from actual location/data processors; assess GDPR applicability or other relevant law rather than copying an unrelated policy. Clear lawful basis, minimal fields, retention window, user contact/deletion/export and vendor/subprocessor disclosure.
- No public document upload MVP. Future sensitive uploads need private storage, temporary signed URLs, malware validation, scoped access, short retention and protected deletion.
- Server-side validation of all public/API inputs, output encoding/sanitised rich text, content schema allowlist, URL and redirect validation, same-site CSRF protections, rate limits, non-leaking errors, MFA and audit trails.
- Prevent SSRF through arbitrary admin-controlled URL fetches; allow only known media/video hosts or store validated asset identifiers. Sanitize SVG uploads or disallow untrusted SVG.
- Secure HTTP headers and CSP that allow only required Vimeo/player, font, asset and service endpoints. Do not break necessary embeds; test real browser.
- Protect `/admin`, preview endpoints, D1 records and private API responses with `noindex`, `Cache-Control: no-store`, strict auth and authorization. Never expose credentials in browser or build artifacts.
- Contact spam strategy must not store raw IP addresses longer than required. Use short-lived dedupe hashes or Cloudflare-native mechanisms when justified; document data retention.
- Provide backup/recovery of database and media settings with permission-aware storage. Test restore using staging/synthetic data, not production PII copied without safeguards.
- Prevent publishing misleading claims in translated text; retain evidence references and approval flag for public qualification data.
- Apply Preply contract restrictions to existing marketplace students; use authorised booking links and keep service descriptions accurate.

---

## 10. Cloudflare, API, database and build cost safeguards

**Do not claim a permanently zero bill.** Future execution must inspect actual plan/billing, runtime limits, Workers/D1/R2 usage, DNS and email provider costs before enabling paid features. Never create resources, upgrade plans, purchase domains, trigger paid APIs or enable expensive services without the user's explicit approval.

1. **Static assets by default:** CDN-friendly long-lived immutable URLs for CSS/JS/images; responsive compressed images, font subsetting, no unnecessary client libraries.
2. **Public HTML cache:** explicitly supported edge cache for published pages; bounded TTL/invalidation; stale-while-revalidate only when safe. No caching private/admin/enquiry data.
3. **D1:** indexed parameterized queries, selected columns, bounded pages, avoid `SELECT *` on large tables and per-request N+1 queries, use transaction-safe publication and low-overhead batched writes when practical.
4. **R2:** store optimized approved originals/derivatives, content-addressed keys and cache; block oversized files; no public writable buckets; avoid generating unlimited variants.
5. **KV:** don't introduce unless required; not needed for ordinary small content storage. If used, protect against hot-key and write amplification.
6. **Email/notifications:** dedupe and throttled retries; no duplicate confirmations; don't schedule constant polling when event-driven outbox/queue is available.
7. **Analytics:** privacy-respecting page and CTA event counts; no PII in analytics, no heavy third-party trackers, no unjustified dashboards.
8. **CI/build:** build/test intelligently; deploy only relevant changes; avoid redundant workflows and enormous browser matrix on every content edit.
9. **API guardrails:** Turnstile verification, bounded payload, rate limits, timeout ceilings, idempotency, quick failure response and deterministic error budgets.
10. **Observability:** log event IDs and technical errors, not customer messages; retention limits, alert only actionable failures, never high-frequency cron loops.

**Cost checks:** before implementation, capture baseline plan usage if authorised; identify estimated fixed costs (domain/email), variable per-visit and per-enquiry costs, free-tier boundaries, expected initial low traffic and growth breakpoints; propose monitoring thresholds and stop conditions rather than inventing exact pricing. First release should avoid new monthly commitments wherever possible.

---

## 11. Implementation phases for future coding agent

> **IMPORTANT:** Execution starts only under later authorisation. **Phase 1 design approval is a hard STOP** before any UI implementation. Any migrations, infrastructure provisioning and production publication follow their own safety gates. These are sequenced tasks, not actions performed while this plan was written.

### Phase 0 — Read-only forensic preflight and baseline

- Verify target repository, project instructions, current worktree/ref, real UI pages, dependencies, deployed architecture and current business logic as described in §3.
- Photograph/render existing desktop and mobile UI for comparison; inventory source assets and licenses. Produce actual file map, risk register, first set of grounded architecture choices and an implementation impact map.
- Record current tests/build status **without altering user data**; if test scripts write output, run only after appropriate execution permission and in safe environment.
- If repo inaccessible or user worktree dirty, report blocker; do not substitute another repository or overwrite existing changes.

**Exit criteria:** verified current-state report, no invented implementation facts, dependencies and risks accounted for.

### Phase 1 — High-fidelity design system and mandatory approval

- Produce screen set defined in §5 in desktop/mobile + Arabic RTL, covering public site and admin. Use actual current UI as baseline.
- Specify colors/type scales/layouts/components/interactions and accessibility decisions; show side-by-side Before/Proposed comparisons where applicable.
- Present to user, explicitly ask for approval and **STOP**. No UI code before approval. Iterate mockups on request.

**Exit criteria:** explicit user approval of mockups, with recorded change requests and approved scope.

### Phase 2 — Content verification and technical design freeze (after UI approval)

- Confirm service availability, language pairs, teaching formats, age suitability, contact channels, policy, testimonials, current credentials, public biography and asset/video rights with Nozha/user as needed.
- Define locale dictionaries, page/section schema, lead fields, status machine, admin role map, migration model and publication cache strategy based on preflight.
- Distinguish *confirmed source facts* from *editorial copy*; don't fill gaps with fictional testimonials, statistics, prices or degrees. Use placeholders/hide unpublished facts when necessary.
- Prepare safe migrations and rollback approach; identify any paid/irreversible steps needing explicit approval.

**Exit criteria:** approved source-of-truth content/permissions, schema and functional UX mappings.

### Phase 3 — Foundational app + design implementation

- Implement approved global design tokens, logos, components, navigation, responsive public shell and core routes in **existing framework if adequate**.
- Implement accessible typography and RTL from first component, not as later patch.
- Build Home/About/Lessons/Coaching/Translation+Interpretation/Contact/legal content with realistic verified text, previews and fallback for incomplete content.
- Ensure no regression of existing routes; add redirects if replacing old paths.

**Exit criteria:** complete visual parity with approved mockups on desktop/mobile, all public routes render with local content in all approved locales.

### Phase 4 — Vimeo and media

- Add editable Vimeo player component, custom poster, validated URL and privacy hash handling, no autoplay, responsive size and accessible captions/transcript/fallback.
- Add optimised, approved images; media upload only through protected admin once backend is ready; preserve file origins/rights.
- Validate playback on staging domain with genuine user interaction; if embed blocked, keep fallback and report dependency.

**Exit criteria:** working video behavior/fallback, visually consistent media and performance budget maintained.

### Phase 5 — Content backend, admin and publishing

- Extend/reuse existing CMS or build minimal structured content model, revision history, locale review flags and schema-based editor.
- Implement authenticated responsive admin overview + pages/services/profile/translations/media/video/reviews/SEO/settings/publish/revisions.
- Enforce authz on API, durable draft saves, optimistic concurrency, protected previews, validated publish, error handling and rollback.
- Implement tested caching consistency as per chosen Option A/B; monitor visible publication latency.

**Exit criteria:** owner can edit English/Arabic/Russian text and site sections, preview safely, publish without developer, verify live result, and restore prior published content.

### Phase 6 — Enquiries and notifications

- Implement form variants for lessons/coaching/translation/interpretation; client + server validation, allowed language pairs, dedupe, anti-spam, privacy handling.
- Persist requests before success, generate reference ID, notify via chosen secure email provider (or durable fallback) and display complete admin queue with filters/statuses/notes.
- Ensure third-party Preply bookings remain outside prohibited flows; track outbound booking links clearly.

**Exit criteria:** all form types survive email-provider failures and duplicate submissions, admin can process requests, no sensitive details leak.

### Phase 7 — i18n, SEO, accessibility and performance hardening

- Complete human-reviewed EN/AR/RU translations and RTL; route switcher, canonical URLs, `hreflang`, sitemap, structured Person data (approved profile links only), OG metadata and search index rules.
- Test keyboard/screen readers, 200% zoom, mobile safe areas, no layout shift, proper image alts, conditional forms and video controls.
- Optimize Core Web Vitals, Worker/D1 calls, image bytes, initial JS and cache hit ratio.

**Exit criteria:** zero critical localization/a11y issues; measured quality goals met in representative environments.

### Phase 8 — Security, integration, regression and recovery rehearsal

- Run unit, integration, E2E, visual regression, security and publishing rollback tests in staging. Validate auth bypass attempts, spam/rate limits, profile-link failures, bad assets, hidden service states and deletion/retention.
- Migrate/seed only approved content; test D1 migration on non-production database and backups; verify restore procedure with synthetic data.
- Fix defects, re-run affected suite and perform independent review of no unintended repository changes.

**Exit criteria:** test suite passes; no high/critical vulnerabilities; reliable recovery and auditability.

### Phase 9 — Production readiness and explicit high-risk approval

- Produce production checklist: DNS/domain/SSL, secrets, admin account owner, R2 private/public keys, D1 binding, email verification, Access policy, backup, monitoring, SEO and cost ceilings.
- If first live launch, irreversible DNS/config changes, paid subscription, sensitive data migration or external account change is required, **STOP for explicit approval**. Do not confuse mockup approval with production authorization.
- Deploy using verified existing mechanisms only after permissions; health checks and smoke tests across three locales and admin; record release identifier/rollback route.

**Exit criteria:** production verified, user access and functional enquiry delivery confirmed; rollback ready.

### Phase 10 — Handover and measured post-release follow-up

- Document admin guide with screenshots, translations workflow, site edit/publish process, changing Vimeo, adding lesson/service, replying to leads, media replacement and recovery.
- Capture baseline latency/quality and approximate usage costs; provide concise completion report listing changed files, verified behavior, known limits, evidence and owner action items.
- Do not silently enable phase-2 features or recurring AI services.

**Exit criteria:** Nozha can independently perform core website admin tasks; maintenance/upgrades documented.

---

## 12. Test plan (minimum evidence-based matrix)

### 12.1 Unit / component

- Locales restricted to `en`, `ar`, `ru`; unknown locale redirects/404s correctly; translated required keys detected.
- Supported service/language pairing validation; translation `source != target`; disabled services cannot emit invalid CTAs.
- Content schema rejects script/unsafe HTML, hostile URLs and invalid image/video values. Extract Vimeo `id` and `h` consistently.
- Publication version comparison, translation-review flags, concurrent update conflict, permission gates, cache key generation.
- Input and error message localization, Arabic number/email bidirectionality and logical layout alignment.

### 12.2 Integration/API

- Authenticated owner/optional editor happy paths; unauthenticated requests get 401/403; preview and admin responses no-store/noindex.
- Draft save != live publish; publish updates only target locale; source-language change marks other locales for review; publish failure preserves prior version.
- Revision history, rollback, media reference validation, blocked cross-origin URL, expired session and invalid CSRF token.
- Enquiry valid/invalid/spam/deduplicate/rate-limit flows; transactional or equivalent durable persistence; notification failure retry without losing lead.
- DB migration up/down or safe forward fix, unique/index constraints, pagination/sort, no N+1 hot path.

### 12.3 End-to-end UI

At minimum test: desktop Chrome-like browser, narrow 390px mobile viewport, 320px fallback, tablet, 200% zoom, keyboard-only paths, Arabic RTL and Russian long strings.

- Home: real brand assets; CTA route; Vimeo lazy player; fallback if blocked; no autoplay.
- All pages accessible via navigation and locale switching; exact equivalent URL preserved where possible.
- Enquiry each service: dynamic fields, focus, errors, loading, confirmation/reference, success if email provider unavailable, parent contact restrictions.
- Admin: login, dashboard, edit text in three locales, preview/publish/rollback, service toggle, change Vimeo, image replacement, review approval, enquiries and mobile admin responsiveness.
- Public noindex admin/draft, canonical/hreflang, footer legal links, no personal address leaking.

### 12.4 Visual regression/acceptance

Compare implemented site to **approved** high-fidelity mockups (not unapproved earlier concept). Inspect desktop/mobile, light/dark OS preference interaction if relevant, Arabic RTL and Russian, animation-reduced mode, long words, disabled/enquiry empty states and video error.

### 12.5 Performance budgets

- Core Web Vitals: **LCP <= 2.5s**, **INP <= 200ms**, **CLS <= 0.1** at p75 on representative field data when available; synthetic Lighthouse mobile performance target >=90 in documented consistent conditions.
- Target good Lighthouse accessibility/SEO scores and WCAG 2.2 AA; record exceptions with practical mitigation.
- No unbounded DB queries; measure D1 rows read/write and Worker executions per 1,000 anonymous visits and per valid enquiry on staging/load-test estimates.
- No Vimeo iframe request until required by chosen consent/lazy-load strategy, especially when poster not activated; test actual network waterfall.
- Set initial payload budget based on repo/current assets; avoid uncompressed megabyte-scale hero imagery and unnecessary JS libraries.

### 12.6 Security & resilience

- XSS (rich text, SVG, fields), IDOR/admin permission, CSRF, rate-limit evasion, replay, forged Access headers/JWT, secret leakage, SQL injection, insecure asset object access.
- Broken Vimeo/Preply/Instagram links, blocked embed domain, email provider outage, D1 service issue, duplicate click, mid-publish failure, expired admin session, large or unsupported upload, lost connectivity during admin save.
- Backup/restore in non-production and published revision rollback are verified, not assumed.

---

## 13. Measurable acceptance and Definition of Done

| Dimension | Acceptance test |
| --- | --- |
| User-approved design | High-fidelity desktop/mobile public + admin + Arabic RTL mocks reviewed and explicitly approved **before any UI code**. |
| Identity/content | Authentic approved imagery, verified qualifications, current offers, no fictitious reviews/stats/private address; no Korean anywhere. |
| Languages | EN/AR/RU complete in public UI, forms, notifications where applicable, metadata and nav; correct Arabic RTL. |
| Homepage video | Exact Vimeo ID+hash; prominent section, click-to-play, accessible fallback, no audible autoplay; admin-editable. |
| Services | English/Russian/Arabic lessons, coaching, translation, interpretation clearly scoped; invalid language pairs hidden. |
| Conversion | Visitor can contact Nozha via every eligible service and obtain reference/acknowledgement; external booking destination verified. |
| Admin independence | Owner can update homepage copy, service status, media/video, profile, translations, SEO and process leads with no code edits. |
| Publishing | Draft isolated, revision recorded, preview protected, approved publish reflected within documented cache TTL; tested rollback. |
| Security | Admin inaccessible without auth, no public PII, server-side Turnstile, injection/rate limits, CSP and backups verified. |
| Performance | Mobile-first layout, no major a11y defects, Core Web Vitals targets or documented variance, bounded Cloudflare usage. |
| Reliability | Notification outage doesn't discard requests; content change failures preserve last good version; restore runbook tested. |
| Handover | Admin guide, release notes, exact repo changes, environment requirements, limits, cost/risk report, smoke-test evidence. |

**Critical launch blockers:** absent design approval; contradictory/unapproved professional claims; insecure admin; broken forms; inaccessible or nonfunctional primary CTAs; incomplete Arabic/Russian UX; video with no fallback; loss of existing production data; unapproved substantial cost; unreviewed irreversible DNS/data migration.

---

## 14. Risk register and mitigation

| Risk | Likelihood / impact | Prevention / recovery |
| --- | --- | --- |
| Repository differs from presumed Astro/Cloudflare stack | Unknown / high | Mandatory preflight; reuse proven stack; architecture decision record. |
| Prior work overwritten, wrong repo/branch | Medium / high | Exact `digitronics2025/Nuzha-badawi` scope; preserve worktree/ref; never destructive checkout; inspect diffs before writes. |
| Missing UI approval | Medium / critical | Hard STOP before any UI modifications; mockup checklist and recorded explicit approval. |
| Disputed qualifications/experience | Medium / high | Evidence matrix, owner sign-off, hide uncertain claims. |
| Video embed blocked/removed or rights unclear | Medium / medium | Test playback/rights, use poster/transcript/fallback CTA; admin replaceable. |
| Overengineering CMS or new stack | Medium / high | Structured sections, minimum role model, reuse existing patterns, prohibit unrestricted builder/AI. |
| Arabic RTL regressions | Medium / high | RTL-first design and locale-specific visual/e2e tests. |
| Incomplete translated edits go live | Medium / high | Review flags, locale draft isolation, publish validation. |
| HTML remains stale after admin publication | Medium / high | One coherent SSR/cache or build-on-publish strategy; measured TTL and rollback tests. |
| Spam or duplicate enquiries | Medium / high | Turnstile server verify, idempotency, throttling, audit, durable save. |
| Notification provider fails | Medium / medium | Save lead before success; delivery state, retry/fallback, admin queue. |
| Private contact data accidentally exposed | Low–medium / critical | Strict data ownership, auth, PII minimization, noindex/no-store, log scrubbing. |
| Preply compliance issue | Medium / high | Approved booking flow; no diversion of platform students to prohibited payments. |
| Cost spike from D1, Workers, AI or cron | Low–medium / medium | Caching, caps, minimal dependencies, budgets and alerting, no AI runtime by default. |
| First production release causes outage | Medium / high | Staging, backups, smoke test, rollout checks, rollback approval. |

---

## 15. Future coding agent operating contract

### 15.1 Autonomy boundaries

- Work independently on routine tradeoffs, coding, tests, bug fixes, performance optimization and documentation **after the required design sign-off** and environment authorisation.
- Inspect before change. Avoid invented repository details and unrelated refactors. Follow `AGENTS.md`/`CLAUDE.md` and existing project constraints.
- Do not create/switch branches or force-push merely to start work; respect the user's existing branch/worktree and any later explicit branching directions. Coordinate code review, commits and release practices with actual repository policy. **This planning deliverable itself must never be committed/uploaded unless later explicitly requested.**
- Prefer the simplest robust implementation. If a feature can be achieved with a small existing component, don't introduce a new service/dependency.
- Stop for explicit high-fidelity mockup approval **before touching UI**, meaningful cost commitments, sensitive/irreversible external actions, or access/content uncertainty that prevents honest implementation.
- Do not invent working integrations, video permissions, booking success, credentials, certification or business rates.
- Keep minimal, useful verification notes, assumptions, failure/recovery decisions and release evidence; handle routine errors without unnecessary questions.

### 15.2 Sequence of explicit decisions

1. **Before execution:** separate user authorisation to inspect the repository/infrastructure as relevant. This plan authoring did none.
2. **After read-only inspection:** show high-fidelity desktop/mobile design mockups, including RTL and admin; STOP until explicit approval.
3. **After approval:** implement through staging and tests, correcting technical decisions to actual codebase. Continue without pausing for routine questions.
4. **Before paid resources, irreversible operations or first production launch:** seek the applicable express approval; no automatic domain purchase, subscription upgrade or production-data deletion.
5. **At completion:** independently verify and report actual evidence; do not claim done for unverified deployment or booking integrations.

### 15.3 Required final report from future agent

- Verified repository identity, working environment/ref, stack and key changes (no sensitive data).
- Mockup approval evidence and deviations from baseline, if any.
- Feature checklist across three locales, public pages, Vimeo, admin and enquiries.
- Tests and visual accessibility/performance results; remaining limitations.
- Security/backups and Cloudflare/API cost considerations, production status and rollback reference.
- Exact unresolved content approvals or external account permissions, without claiming they are completed.

---

## 16. FINAL EXECUTION INSTRUCTION — FOR FUTURE APPROVED CODING AGENT ONLY

> **After the user separately authorises execution, start by inspecting `https://github.com/digitronics2025/Nuzha-badawi.git` and its actual instructions, code, UI, architecture, database and workflows in read-only mode. Do not assume any file structure, technology or branch. Produce high-fidelity desktop and mobile mockups of the public website and admin (including Arabic RTL and the homepage Vimeo video), present them to the user, and STOP until the user explicitly approves the design. Only after approval, autonomously execute this plan end-to-end: implement the three-language NUSYA website and secured admin, integrate the Vimeo video, complete safe content and enquiry workflows, test and debug, optimize Cloudflare cost/performance, rehearse recovery, verify every acceptance criterion, and prepare/perform authorised deployment. Respect existing project patterns and preserve user data. Ask for additional approval only for unavoidable blockers, significant costs, further mandatory design checkpoints or irreversible high-risk actions. Finish with a concise, evidence-based completion report. Do not treat this planning-only file creation as implementation authorisation.**

---

**End of plan. The file is a planning artifact only; no GitHub, branch, Cloudflare, repository or production changes are authorised or performed by its creation.**