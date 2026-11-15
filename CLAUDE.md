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

## Reply contract — every task-closing reply

End every task-closing reply with these three, in order, nothing after:

1. **Plain recap**, 3 sentences, no paths/hashes/jargon ("saved" not "commit",
   "sent live" not "deploy"); shipped work may use the five-part form
   (changed / was wrong / before→after / gain / next), ~180 words.
2. **Grandma summary**, 2-4 plain sentences, no tool, file or product names —
   what it means for the shop. Unverified stays unverified.
3. **What you need to do** — numbered steps naming the exact button and what
   they should see, or exactly `Nothing — you're all set.` Never empty, never
   "just". Anything the user must do goes ONLY here.

"skip recap" silences 1 and 2; 3 stays. Not for technical answers, code, plans or
commit messages.

Prefer **maintainable > scalable > secure > production-ready > sustainable**.
Never report unverified work as done: checked, not verified, or could not check.
Update the doc owning a behaviour in the same commit. Never commit a secret.
Only this repo's tracked files and account-level skills reach a session off the
operator's PC — never point at `~/.claude/...` or `C:\Users\...` unmarked.

**Secrets an agent creates go into MyVault first** — every agent, every tool.
A password, key or token you create for an app is saved in MyVault before it is
written anywhere, and its value never appears in output, a file, a chat or a
commit. With `MYVAULT_DEPOSIT` set in the environment, use MyVault's own tool:

```bash
V=https://myvault.digitronics-electro.workers.dev/downloads
curl -fsSL "$V/vault-deposit.mjs" -o vault-deposit.mjs
curl -fsSL "$V/vault-deposit.json" | grep -q "$(sha256sum vault-deposit.mjs | cut -d' ' -f1)" || { echo "checksum mismatch: stop"; exit 1; }
node vault-deposit.mjs check
node vault-deposit.mjs create --name "<App> — <what it is>" --target "<where it goes>" --then "<this repo's write command, reading stdin>"
```

Tell the operator to unlock MyVault; the value is handed on only after the
vault confirms the save. Exit 0 = saved and written; 5 = saved, but writing it
failed (the operator copies it from MyVault); anything else = not written
anywhere (`node vault-deposit.mjs --help` explains each code). Report it; never
make the value some other way. Without `MYVAULT_DEPOSIT`, stop and ask the
operator to save it in MyVault by hand. Never decode or print `MYVAULT_DEPOSIT`.
Where the AI Development Control Center is available, it comes first (Claude: the
`secret-custody` skill).

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
<!-- END operator-conventions sha256:1852c84b9118 -->
