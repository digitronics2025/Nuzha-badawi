# AI Agent Instructions — NUSYA

These rules apply to the entire repository and to **all** coding agents. Read this file, `CLAUDE.md`, `design.md`, and `docs/INDEX.md` before planning changes. Other documents specify product requirements; this file specifies safe execution.

## Project identity and hard requirements
- Brand: **NUSYA Linguistic Studio**, professional: **Nozha Badavi**.
- Exactly three website UI locales: `en`, `ar` (true RTL), `ru`. Ukrainian may be described in documented translation/language experience, but not added as a fourth interface language.
- Public services: English, Russian and Arabic lessons (verify current availability); professional communication coaching; translation; interpretation (specific pairs/scope require approval).
- Never add Korean lessons, content, SEO targeting or UI language options.
- Homepage introduction video: `https://player.vimeo.com/video/1171310337?h=3416a6f4f5` with privacy hash preserved, on-demand playback and a fallback.
- A secure, usable admin must manage approved content, three-language translation states, media/video, services, enquiries, preview, publish and rollback.
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
