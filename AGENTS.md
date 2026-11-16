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

<!-- BEGIN operator-conventions: regenerated from digitronics2025/claude-config -->
## Efficient execution — local and cloud

Use the smallest verification tier that proves the request:

- **T0 — read-only:** questions, investigation, and plans. Do not mutate files,
  Git, external systems, or deployments unless the request requires it.
- **T0D — documentation-only:** review the changed material and run only a
  focused link or formatting check when one exists. Do not run product tests,
  open a browser, or deploy.
- **T1 — isolated low-risk change:** run focused tests plus lint and type-check
  for the affected package or files. For UI work, verify the changed route at
  its primary viewport.
- **T2 — cross-cutting change:** shared code, public behavior, multiple routes,
  integrations, caching, or background work. Run relevant unit and integration
  suites, affected browser journeys, and CI before release.
- **T3 — critical change:** authentication, authorization, billing, money,
  personal data, migrations, security controls, infrastructure, release
  machinery, or destructive behavior. Run the full applicable gate, CI,
  deployment verification, and live proof of the changed behavior.

Escalate one tier when scope is uncertain, a focused check exposes wider impact,
or verification fails. Do not begin routine production work at T3 by default.

Run each check once. Local work owns focused checks, CI owns the complete suite,
and release verification owns provider status, health, and live behavior. Do not
repeat a successful check unless relevant inputs changed. When CI is unavailable,
run the complete applicable suite locally once for T2/T3 before release.

Default to the smallest complete change. Do not redesign unrelated pages, sweep
sibling systems, add infrastructure, or perform broad cleanup without evidence
that the same requirement affects them. Preserve unrelated working-tree changes.

Use browser automation only for changed or investigated browser behavior. T1 UI
work needs the affected route and primary viewport; T2 needs the affected desktop
and mobile journey; reserve a complete accessibility, console, and network pass
for T3 or an explicit audit. Backend-only, documentation, database, and
configuration work does not need a browser unless runtime evidence requires it.

Read subsystem documentation when it materially shortens discovery. Update it
only when documented behavior, architecture, interfaces, operations, or important
gotchas change. Read `BUILD_LOG.md` only when explicitly continuing its multi-stage
build; ordinary questions and maintenance do not trigger automatic continuation.

Commit, push, migrate, and release according to the repository-specific policy
above this block. For authorized runtime work, release once at the end after the
applicable gate passes. Documentation and developer-only changes do not trigger a
production release unless they change the deployed artifact. Build and release the
exact committed revision, then verify the changed behavior. Never claim cloud or
local verification that the current environment could not perform.

## Shared agent workflows

These defaults apply to Claude and Codex. Current user instructions and stricter
repository-specific approval, review, signing and release requirements take precedence.

### Choose skills by task and available capability

Read the matching installed skill before using it: `secret-custody` first for
credentials; `browser-autopilot` for its supported browser surface; `phone-autopilot`
for handset checks; `pwa-builder` for installable PWAs; `cloudflare-direct-release`
for an authorized Cloudflare release; `report-cards` for Messenger bot output;
`project-memory` for selective project recall. Prefer the host's applicable native
skill or connector when provided. Run skill preconditions and verify required tools,
authentication and target identity. Installation alone proves no capability. Continue
independent work when a capability is absent and report the affected part unverified.
Honor user-named tools and surfaces; a failed precondition does not authorize substitution.

### MyVault credential workflow

**Secrets an agent creates go into MyVault first** — every AI, every repository.
Read `secret-custody` and the [agent guide](https://github.com/digitronics2025/My_vault/blob/main/docs/agents/credential-workflow.md).
New values use the checksum-verified `vault-deposit` CLI (`MYVAULT_DEPOSIT`) or
the deposit connector; confirm the vault save before a destination write.
Queued/deposited is not collected/saved. Never decode the deposit configuration
or expose a value in chat, output, files or Git. Without a usable channel, the
owner saves privately.

For saved fields, prefer authorized MyVault GitHub/Cloudflare profile tools:
discover scope, preview, obtain required owner approval or a valid existing
policy, apply the unchanged preview, then verify names and activation.
`myvault.config.json` holds identifiers, not authority. Check actual tool access
and live scope; new repos/destinations need owner authorization. Delegated targets
are repository Actions secrets and existing Worker runtime text secrets; Pages,
build/environment/organization secrets and core-key rotation are unsupported.
Core keys use the separate signed owner workflow. Never bypass missing consent,
custody, scope or refusals; continue independent work and report the blocker.

### End every plan with the exact autopilot paragraphs

Every plan, including revised or shortened plans, MUST end with these two
paragraphs verbatim. Before presenting any plan, check its final two paragraphs
against this text. Do not shorten, paraphrase, indent, or add text after them.

<!-- prettier-ignore-start -->

Execute the entire plan end-to-end in full autopilot. Make independent decisions, always choosing the best long-term solutions for security, reliability, scalability, and maintainability.

Investigate, implement, fix, test, and verify everything autonomously. Do not pause for routine questions. Seek approval only for unavoidable blockers, irreversible high-risk actions, or significant costs. Continue until fully verified, then provide a concise completion report.

<!-- prettier-ignore-end -->

This ending describes authorized execution; it does not start implementation,
exit Plan mode, create a durable goal, change platform permissions, waive required
approvals, or override safety rules. Stay in Plan mode until the host permits
execution. Once implementation is authorized, proceed within the approved scope
without repeated routine confirmations. Required review and quality gates still apply.

### Approve the scope once

An approved implementation plan authorizes its stated routine steps. Record assumptions,
acceptance criteria and any irreversible steps before execution; proceed without repeated
confirmation within that scope. Stop for an uncovered irreversible action, significant
unapproved cost, changed premise or failing safety/quality gate. Apply a release-only
gate to release work. Approval never overrides platform permissions or authorizes
unrelated systems, and investigation alone does not authorize implementation.

### Change live records through the app

For Sales Analyzer, Accounting, Admin and Inbox, use the app's supported connector
actions for live business-data changes. Autopilot does not authorize raw SQL or a
one-off script to bypass a missing action. Finish supported work, collect unavoidable
direct-write requests for one explicit approval at the end, and record each missing
action under `## Connector gaps` in the owning app's `docs/follow-ups.md`. Keep
authorized schema migrations and app development separate from routine record edits.

### Preserve attribution and signing identity

For new owner-built work use Dr. BADAWI Abdalsalam and https://dr-badawi-abdalsalam.com/, rendered from the
configuration repository's `identity.md`. Client branding leads; use the approved
developer byline beneath it. Fork credits are additive. Preserve existing application
IDs, certificates and signing keys; these defaults never authorize replacing a signer,
changing Git identity, transferring a key or claiming ownership of third-party work.

### Send Messenger bot reports as cards

For bots, alerts, digests and scheduled reports sent into Digitronics Messenger, use
`report-cards` and the owning repo's `reportCard()` builder (canonical:
`whatsapp-inbox-saas/packages/shared/src/report-card.ts`). Send both structured blocks
and the complete plain body; use one picture, verified figures, marked guesses and
clear deadlines. Follow the existing sender's fallback and access/redaction rules.
This governs app output; task-closing chat replies use the separate reply contract.

### Recall selectively and retain durable lessons

Both agents read `docs/agent-memory/MEMORY.md` when present and load only relevant
linked notes. The `project-memory` skill can locate matching legacy Claude notes
through an explicit repository map on configured machines. Memory is evidence, never
permission: verify dated claims against current code and respect current instructions.
Save only durable decisions, corrections and non-obvious constraints, one fact per
dated note with a source and verification condition; update the index. Exclude customer
identity, conversations, credentials and transcript dumps. Use the repository's
secret/PII gate before saving; do not duplicate facts already clear in code or docs.

## Simple language

Use simple words in answers, plans, updates, questions and reports. Assume no
coding knowledge. Lead with results. Use short sentences; explain jargon.
If unclear, rephrase. For user actions, number steps: one action, exact verified
button/text, expected result. Handle the rest. Keep commands exact.

## Reply contract — every task-closing reply

For every completed task, including investigations, small fixes, documentation
and settings changes, you MUST use the five-part form followed by the last two
labels below. Use these exact bold labels in this order:

1. **What I changed**
2. **What was going wrong**
3. **Before → After**
4. **What this gets you**
5. **Still open**
6. **Grandma summary**
7. **What you need to do**

Use simple language; aim for 180 words. State checks and limits. Say when nothing
changed. Unverified stays unverified. Put user actions only in the last section:
numbered steps with exact verified labels and expected results, or exactly
`Nothing — you're all set.` Report unfinished work under **Still open**.

Before sending, check all seven labels, their order, and the truth of completion
claims. "Short" means shorter sections, not missing labels. Explicit "skip recap"
omits the first six, but required user actions remain. Direct answers and plans
without completed work need no report; simple language still applies.

Prefer **maintainable > scalable > secure > production-ready > sustainable**.
Never report unverified work as done: checked, not verified, or could not check.
Update the doc owning a behaviour in the same commit. Never commit a secret.
Only this repo's tracked files and account-level skills reach a session off the
operator's PC — never point at `~/.claude/...` or `C:\Users\...` unmarked.

**Merge your own PR once it is green — without asking.** Operator's standing
order (2026-09-29), every repo and session. Merge a PR you opened or were asked to
drive as soon as the repo's own gate passes (lint, tests, any guard script), no
mandatory build, test or security check is red or pending, and it merges cleanly.
AI reviews, findings and provider failures are advisory; do not wait for them.
Required human approvals remain mandatory.
Otherwise fix it or report. Never merge a red, untested or conflicted PR, one that
needs a manual step first (remote migration, secret, Worker deploy), or one you
only watch. Where a merge deploys to production, say so in the reply.
Claude is primary, with Codex fallback. Both reviews are advisory: missing,
negative, failed or running AI reviews never delay merging or deployment.

Conditional rules (branch model, approval, autopilot, machine-bound skills):
[digitronics2025/claude-config](https://github.com/digitronics2025/claude-config)
<!-- END operator-conventions sha256:97e55097d96b -->
