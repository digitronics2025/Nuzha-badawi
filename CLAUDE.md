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
