# GitHub Copilot Instructions — NUSYA

Read [AGENTS.md](../AGENTS.md) before editing. This file is only a short bridge to the canonical agent rules, not a competing specification.

- Project: personal website and admin for Nozha Badavi / NUSYA Linguistic Studio.
- Public locales **exactly** English, Arabic (RTL), Russian. Do **not** add Korean.
- Documented language lessons: English, Russian, Arabic; confirm present availability.
- Services: professional communication coaching, translation/interpretation enquiries; do not assume unsupported pairs or credentials.
- Homepage video uses the user-supplied Vimeo ID `1171310337` and privacy hash `3416a6f4f5`.
- Admin must support secure structured content editing, locale review, draft/preview/publish/rollback, media/video and enquiries.
- **Mandatory:** inspect real code/UI then generate inspectable high-fidelity desktop and mobile UI mockups, including Arabic RTL; **STOP until explicit user approval before ANY UI implementation**.
- Protect private CV details, approved media rights, customer enquiries, secrets, production data and Preply rules.
- Verify real architecture before selecting stack; minimize Cloudflare/D1/R2/API cost, and never assume anything is deployed.
- Keep canonical docs and `docs/DECISIONS.md` current; test and report actual evidence.

## Domain and Cloudflare guidance
The user provided a Cloudflare Registrar screenshot showing `nozha-badavi.com` registered, **not live**. Proposed canonical site `https://nozha-badavi.com`; private admin `https://admin.nozha-badavi.com`. Before generating Wrangler/workflows, read `docs/CLOUDFLARE_DEPLOYMENT.md` and `docs/PLAN-nusya-multilingual-studio.md`; proposed public/admin Workers, D1, optional R2 and Access are **not already provisioned**. Enforce separate high-fidelity design approval before UI code, and separate authorization for Cloudflare resource/DNS/production actions. Never leak credentials or preview production data; optimize Workers/D1/R2/notification cost.
