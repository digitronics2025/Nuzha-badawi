# NUSYA Linguistic Studio

Website and protected owner CMS for Nozha Badavi. The application implements **Ukrainian (default), English, Arabic (RTL), and Russian**. Offered lesson languages remain English, Russian, and Arabic.

The public frontend is generated with Python and progressively enhanced with dependency-free JavaScript. Separate Cloudflare Workers serve public pages and the Access-protected admin; D1 stores content revisions, enquiries and audit records. R2 serves approved media. Turnstile protects enquiries, and notifications use a durable outbox.

## Local development and verification

```sh
npm ci --prefix workers
npm run build:frontend --prefix workers
npm run check --prefix workers
python3 -m unittest discover -s frontend/tests -v
pip install -r frontend/tests/requirements-browser.txt
python3 -m playwright install chromium
python3 frontend/tests/browser_review.py
```

Native runtime verification, using a local disposable database:

```sh
cd workers
npx wrangler deploy --dry-run --config public/wrangler.jsonc --outdir /tmp/nusya-runtime-bundle
node tools/review-runtime.mjs /tmp/nusya-runtime-bundle/index.js
```

No secret values belong in source. See [workers/README.md](workers/README.md) for configuration names. Builds produce ignored `frontend/dist-public`, `frontend/dist-admin`, and Worker asset modules.

## Release status and ownership

An older release exists at https://nozha-badavi.com; the protected admin is https://admin.nozha-badavi.com. Repository code is not proof of deployment. [PRODUCTION.md](docs/PRODUCTION.md) records release evidence and known credential blockers. The single deployment pipeline requires tests, isolated staging write verification, and production recovery safeguards. Do not bypass staging or assume migrations are applied.

Current source uses neutral studio artwork until consented genuine photographs are supplied through the CMS. Privacy copy describes actual processors and a manual six-month retention review; it does not claim automatic enquiry deletion or an unverified legal jurisdiction.

Read [AGENTS.md](AGENTS.md), [documentation index](docs/INDEX.md), [design contract](design.md), and [source provenance](docs/SOURCES.md). UI fixes in the review-hardening change were approved from desktop/mobile/RTL mockups in the implementation chat. No Korean content or services.
