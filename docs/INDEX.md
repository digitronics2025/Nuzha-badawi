# NUSYA Documentation Index

**Purpose:** keep product intent, approved design, factual content, technical decisions, AI guidance and operations synchronized. **As of initial documentation bootstrap, the repository is empty of application code**; technical files are specifications, not claims of implemented components.

## Start here
| Document | Authority / subject |
| --- | --- |
| [README](../README.md) | Repository entrypoint and status |
| [AGENTS](../AGENTS.md) | Canonical instructions for all AI agents |
| [CLAUDE](../CLAUDE.md) | Claude Code pointer to canonical rules |
| [design.md](../design.md) | Proposed visual system and mandatory high-fidelity UI approval |
| [PRODUCT](PRODUCT.md) | Scope, users, services and non-goals |
| [SOURCES](SOURCES.md) | Source facts, contradictions, content approval and media rights |
| [UX_FLOWS](UX_FLOWS.md) | Public and admin page journeys, forms and edge cases |
| [LOCALIZATION](LOCALIZATION.md) | EN, AR RTL and RU, SEO, review process |
| [ADMIN](ADMIN.md) | Admin functions, roles, publishing and enquiries |
| [ARCHITECTURE](ARCHITECTURE.md) | Conditional stack, integrations and caching |
| [DATA_MODEL](DATA_MODEL.md) | Conceptual data entities and constraints |
| [SECURITY_PRIVACY](SECURITY_PRIVACY.md) | Threat model, legal/privacy checks, secrets and content |
| [QUALITY_TESTING](QUALITY_TESTING.md) | Automated/manual testing and release gates |
| [OPERATIONS](OPERATIONS.md) | Environments, cost, deployment, rollback and recovery |
| [ROADMAP](ROADMAP.md) | Execution phases, gates, and final success criteria |
| [DECISIONS](DECISIONS.md) | Immutable decision log template and initial decisions |
| [AI_WORKFLOW](AI_WORKFLOW.md) | Practical multi-agent delivery protocol |

## Canonical principles
- The **user** approves scope/visuals/identity/public facts and high-risk external actions.
- `AGENTS.md` governs agent behavior; this index routes to single-domain canonical documents.
- Existing actual code, once added, is evidence of implementation, NOT automatic approval of unreviewed behavior or content.
- Proposed architecture does not imply any Cloudflare Worker, D1, R2, KV, domain or environment already exists.
- Source data must be approved before publication; see `SOURCES.md`. Never invent external metrics or credentials.
- Exactly three public locales: English, Arabic, Russian; no Korean.
- Any material change to scope, design, schema, security, deployment or workflows updates its canonical doc and records an ADR-style entry in `DECISIONS.md`.
- No new separate 'source of truth' files that conflict with established docs; link instead.
- Preserve user assets securely; do not put unapproved CV/contact data or images in public GitHub.

## Document maintenance protocol
1. Inspect the latest documents + actual code/branch before proposing work.
2. Map intended changes to the relevant canonical page and affected code/tests.
3. Add/update acceptance criteria; resolve or flag conflicts.
4. Obtain visual approval for UI work and separate approval for expensive/irreversible actions.
5. Implement and test only within approved scope.
6. Update documentation and changelog/decision notes in the same PR.
7. Review PR against `.github/PULL_REQUEST_TEMPLATE.md`; do not claim work was verified unless tested.

## Status terminology
- **Confirmed decision**: explicitly established by the user.
- **Source-documented**: appears in a supplied CV/profile, still needing public sign-off.
- **Proposed**: a recommendation awaiting final validation.
- **Implemented**: present in inspected code with reproducible evidence.
- **Verified**: tested in the intended environment with results.
- **Approved to publish**: the owner approved this specific public claim/asset.
