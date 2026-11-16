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

<!-- BEGIN operator-conventions: regenerated from digitronics2025/claude-config -->
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
Read `secret-custody` and the [agent guide](https://myvault.digitronics-electro.workers.dev/downloads/myvault-agent-guide.txt).
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
<!-- END operator-conventions sha256:eca25aa55952 -->
