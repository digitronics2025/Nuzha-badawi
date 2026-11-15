# Release readiness

Current source verification and release blockers are recorded in [PRODUCTION.md](../../docs/PRODUCTION.md#review-hardening-release-candidate--2026-11-15).

- 28 public pages in UK (default), EN, AR RTL and RU.
- 26 Worker tests and 13 frontend tests; migration preservation checks.
- Native workerd HTMLRewriter and disposable D1 integration checks.
- Browser coverage: 84 responsive routes plus inbox, retry, language preselection, Ukrainian review and unsaved-edit protection.
- Public and admin dry-run bundles build successfully.
- Mandatory staging write checks remain blocked by unavailable Access service credentials.
- Production promotion, real Turnstile/email delivery and authenticated production owner login have not been verified for this candidate.
- Existing illustration assets retain AI disclosure under D-031; genuine media may be added through consented owner publishing.
- Privacy updates in source require a deliberate CMS publication where existing revisions override them.

Do not mark this candidate deployed based on local checks or a successful PR workflow.
