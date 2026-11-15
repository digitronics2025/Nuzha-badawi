# AI-Assisted Engineering Workflow

## Operating contract
Read `AGENTS.md` first; `CLAUDE.md` is a pointer, not an alternative policy. Inspect actual repo before touching code. Reuse current application patterns; never infer implementation from architectural proposals. Keep changes small, independent and reviewable.

## Investigate → propose → approve → implement → verify
1. **Inspect read-only:** existing UI/routes, README, all agent instruction files, dependencies, architecture, schema, environment bindings, tests and actual release path. Report unknowns.
2. **Design gate:** for any UI redesign/build, generate high-fidelity desktop/mobile public+admin mockups, Arabic RTL and representative Russian content; **STOP until explicit user approval**.
3. **Plan changes:** choose minimal maintainable architecture, map to actual file paths, list risks, cost, tests and rollback. Flag anything that would publish personal details.
4. **Implement approved scope:** preserve working features, avoid unsanctioned scope creep; write focused tests and update docs as code changes.
5. **Validate:** run actual type/lint/tests/E2E/a11y/security/perf; record evidence and failures. Inspect UI before declaring visual fidelity.
6. **Recover:** back out broken changes without erasing user work; prove last published version and enquiry data remain safe.
7. **Release:** pause for production/infrastructure/cost/irreversible approval; use authenticated controlled pipeline only after approval.
8. **Report:** exact changed files, completed verification, remaining gaps, risk and next steps; no invented implementation or success statements.

## AI task brief template
- Objective and user-visible outcome:
- Source/approval status:
- Exact repo/ref and current state:
- Constraints (EN/AR/RU; no Korean; privacy; Preply; Vimeo):
- Approved designs and location:
- Files/flows to inspect:
- Planned modifications:
- Data/API and cost effects:
- Failure modes and recovery:
- Tests and measurable acceptance:
- Required approval checkpoints:

## Drift prevention
Update `docs/DECISIONS.md` for material architecture/scope/UI changes. Update `docs/SOURCES.md` for new qualifications and permissions; `design.md` after approved mockups; `docs/ARCHITECTURE.md` for real stack and caching; `docs/DATA_MODEL.md` for migrations; `docs/OPERATIONS.md` for deployment; `docs/QUALITY_TESTING.md` for test procedures.

Do not silently reconcile contradictory instructions. When unavailable source or missing repository/code is material, report it. Never access unrelated businesses, repositories or credentials by association.

## Cloudflare documentation and rollout gate
Read `CLOUDFLARE_DEPLOYMENT.md` and the full updated `PLAN-nusya-multilingual-studio.md` when working on routing, Cloudflare, database, email or deployment. The user-registered domain is `nozha-badavi.com`. Distinguish screenshots showing domain registration from verified active DNS/custom domains/TLS/Workers. Identify exact proposed two-Worker public/admin topology and alternatives, with impact on D1/R2 budgets and private data. Obtain design mockup approval **before UI edits**, separate approval for actual resource creation, DNS changes, paid services or first production deployment. Never reuse other DigiTronics Cloudflare resources by association. Keep docs, binding inventory, costs, test evidence and rollback updated in the same PR.
