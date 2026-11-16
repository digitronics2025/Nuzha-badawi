# Previous project instructions

Historical architecture and operating evidence, preserved at 0cb9c52e0d2097d56165199bfc9b33c72e58df3e.
Current process and authorization are exclusively in [the authored contract](../agent-contract.md).
Past approvals are not permission. Verify dated facts against current code.
Read relevant sections only; paths below have been rebased for this reference.

## Previous AGENTS.md project material

# AI Agent Instructions — NUSYA

These rules apply to the entire repository and to **all** coding agents. Read this file, `CLAUDE.md`, `design.md`, and `docs/INDEX.md` before planning changes. Other documents specify product requirements; this file specifies safe execution.

## Project identity and hard requirements
- Brand: **NUSYA Linguistic Studio**, professional: **Nozha Badavi**.
- Four website UI locales: `uk` (default), `en`, `ar` (true RTL), `ru`. Ukrainian is a website interface language; offered lesson languages remain English, Russian and Arabic unless separately approved.
- Public services: English, Russian and Arabic lessons (verify current availability); professional communication coaching; translation; interpretation (specific pairs/scope require approval).
- Never add Korean lessons, content, SEO targeting or UI language options.
- Homepage introduction video: `https://player.vimeo.com/video/1171310337?h=3416a6f4f5` with privacy hash preserved, on-demand playback and a fallback.
- A secure, usable admin must manage approved content, four-language translation states, media/video, services, enquiries, preview, publish and rollback.
- Premium editorial visual identity; authentic, consented photographs; fast and accessible on mobile.

## Non-negotiable approval and authorization gates
1. **Read-only discovery first.** Confirm repository contents, branch/worktree, existing instructions, app stack, tests, hosting, databases, routes, and actual UI. Do not infer their existence from these design documents.
2. **HIGH-FIDELITY UI APPROVAL GATE:** Before changing or implementing any public/admin UI, create inspectable, high-fidelity desktop and mobile mockups (including Arabic RTL), present them to the user, and **STOP until explicit approval**. Approval of this file or the general project plan is NOT mockup approval. Repeat if revisions are requested.
3. After approval, the agent may make routine implementation decisions and execute approved work autonomously while respecting scope, tests and recovery.
4. Stop for major cost commitments, production launch/configuration, personal-data publication, account ownership/permissions changes, irreversible operations, legal/credential claims needing confirmation, and unresolvable blockers. Never fake authorization.
5. Do not alter another repository or account merely because it is owned by the same user. Preserve unrelated work. Never force-push, reset, destroy data, or silently change a production environment.

## Engineering conduct
- Keep code and docs synchronized. If architecture, workflows, schema, design tokens, locales or service scope change, update the corresponding documentation in the same PR.
- Prefer existing proven stack and repository conventions. If repository remains empty at implementation start, consult `docs/ARCHITECTURE.md` for **conditional** candidate stack.
- Introduce the minimum dependencies, durable data structures and external integrations necessary. Validate with current vendor docs when implementing.
- Public copy must come from verified, approved facts (see `docs/SOURCES.md`); no invented biographies, degrees, reviews, experience, statistics, prices, video subtitles or promised turnaround.
- Do not publish private CV contact data, residential addresses, unlicensed imagery or sensitive client documents. Enforce privacy, data minimization, accessibility and platform rules.
- Keep Preply users in authorised platform workflows; an outbound link click is not a confirmed booking.
- Use locale-safe types/guards, parameterized queries, bounded payloads/results, safe admin authentication and authorization, server-side validation, idempotency and durable enquiry storage.
- No public draft content, no private data in caches/logs/analytics, no secrets in source or browser bundles.
- Cost-first architecture: cache public pages; minimize Worker/D1/R2 reads and writes; avoid unnecessary cron, KV, LLMs, polling and full-table queries.
- Implement error, empty, offline/service-failure and retry states instead of only happy paths.

## Completion standard
- Explain actual files changed, risks and why, and report commands/tests **actually run** (never invented).
- Verify desktop/mobile, RTL, language completeness, video fallback, public forms, admin authorization, publish/rollback, security, cost and production-readiness.
- Link a PR with evidence and updated docs; do not merge or deploy without the appropriate authorization.
- Follow the checklists in `docs/QUALITY_TESTING.md`, `docs/OPERATIONS.md` and `.github/PULL_REQUEST_TEMPLATE.md`.

## Document precedence and conflicts
Direct user instructions and safety requirements take precedence. For repository guidance, this file governs agent conduct; `design.md` governs approved UI; `docs/PRODUCT.md` governs scope; `docs/SOURCES.md` governs factual claims; `docs/DECISIONS.md` records approved architecture decisions. On conflict, stop and record the discrepancy rather than making a silent guess.

## Domain, Workers and infrastructure controls (2026-11-15)
- The user supplied evidence of **registered** `nozha-badavi.com` on Cloudflare, NOT proof that a DNS zone/Worker/app/admin/SSL is configured. Intended public apex: `https://nozha-badavi.com`; intended protected owner admin: `https://admin.nozha-badavi.com`.
- Before building or deploying, consult `docs/CLOUDFLARE_DEPLOYMENT.md` and `docs/PLAN-nusya-multilingual-studio.md`; inspect the actual Cloudflare account/resources **only after appropriate permission**. Do not touch other sites or accounts.
- Candidate architecture: separate public and admin Workers for least privilege, domain routing via Custom Domains, app-level authz plus Access, D1 only where needed, optional R2, Turnstile, and cost-reviewed email. Names, bindings and IDs are proposals, never deployed facts.
- DO NOT create resources, edit DNS, secrets, Cloudflare plans or production infrastructure without explicit approval; do not confuse domain registration with deploy authorization.
- Maintain **one** safe CI/CD mechanism with isolated preview resources; never let preview access production D1/R2/secrets. Verify SSL, redirects, privacy/caching, and custom-domain reachability before claiming success.

## Final visual/motion contract — must read before any UI work
`design.md` and `docs/PLAN-nusya-multilingual-studio.md` now define the *Cinematic Editorial Luxury / Art of Connection* aesthetic, real human-centered imagery, precise animation token system M01–M16, page artboards V01–V12, Arabic RTL/Russian mobile typography, reduced-motion/low-end fallback and performance targets. This is a **chosen design brief, not visual implementation approval**. Generate high-fidelity full-page mockups plus inspectable motion storyboard, show the user and **STOP until explicit design approval**. Do not introduce heavyweight animation frameworks or continuous scroll animations; accessibility and cost take priority over decoration.


## Current deployment task scope — 2026-11-15

The user's deployment-completion instruction explicitly requests preserving and verifying the existing `nozha-portrait-optimized.webp` and `nusya-introduction-cover-optimized.webp`, retaining the AI-generated portrait disclosure and CMS image overrides. For these two existing fallback illustration assets only, this supersedes the earlier authentic-photographs-only restriction (D-031). Do not describe the illustrated person as an authentic photograph or proof of Nozha's appearance. Retain the localized disclosure; consent requirements for future genuine photos remain in force.

The user also explicitly requires completed Codex reviews before further release merges/promotion (D-032). Resolve actual findings, confirm the reviewed head, and retain mandatory staging writes, deployment credentials, production backup and rollback gates. Technical regression repairs are authorized by the current task; this does not authorize a new visual redesign.

## Previous CLAUDE.md project material

# Claude Code — NUSYA Project Guidance

**First read `AGENTS.md`, then `docs/INDEX.md`, `design.md`, `docs/PRODUCT.md`, `docs/SOURCES.md`, and the relevant architecture/quality documents.** `AGENTS.md` is canonical for all agents; do not maintain a competing rule set here.

## Required initial workflow
1. Confirm the exact repository is `digitronics2025/Nuzha-badawi`; inspect actual contents and existing instructions **read-only**.
2. Summarize current code/UI, file map, real stack, API/database, deployment and tests. Call out unknowns honestly.
3. Before any UI edits, create high-fidelity desktop + mobile mockups of public and admin experiences, plus Arabic RTL, and STOP for explicit user approval.
4. Once approved, implement in small coherent increments, testing and updating documentation continuously.
5. Stop separately for production deployment, paid services, irreversible actions or unapproved personal/credential content.

## Helpful project references
- `design.md`: premium visuals, components, responsive/RTL and mockup requirements.
- `docs/UX_FLOWS.md`: customer and admin journeys.
- `docs/LOCALIZATION.md`: UK (default), EN, AR, RU.
- `docs/ARCHITECTURE.md` and `docs/DATA_MODEL.md`: conditional target architecture and data.
- `docs/ADMIN.md`: admin editor, revisions, and service enquiries.
- `docs/SECURITY_PRIVACY.md`, `docs/QUALITY_TESTING.md`, `docs/OPERATIONS.md`: operational guardrails.
- `docs/ROADMAP.md`: phases and approval boundaries.

Do not treat a documentation-only repository as an implemented application; do not deploy unverified code. No Korean features or content.

## Registered domain and approved execution boundary
The intended domain is `nozha-badavi.com`, visibly registered in the user's Cloudflare screenshot; **not deployed**. Read `docs/CLOUDFLARE_DEPLOYMENT.md` and `docs/PLAN-nusya-multilingual-studio.md` before designing Workers or touching cloud resources. Public and protected admin hostnames are proposed in those files. Require explicit UI mockup approval before coding, plus separate permission for domain, Workers, D1/R2, email, DNS and production actions.

## Final design implementation prerequisite
Read `design.md` and plan v3 (not generic earlier motion suggestions). Follow the exact Cinematic Editorial Luxury storyboard, 16 motion IDs, V01–V12 artboard checklist and WCAG/reduced-motion budgets. **STOP for explicit approval of high-fidelity desktop/mobile/RTL designs before any UI code.** Do not begin animation implementation from this written documentation alone.

