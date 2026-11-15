# NUSYA Linguistic Studio — Frontend

Python-generated UK/EN/AR/RU public pages and a separate Access-protected admin. Ukrainian is the default public interface. Admin controls are English; content editing supports all four locales. Actual deployment evidence belongs in `../docs/PRODUCTION.md`.

## Build and verify

Public generation uses Python's standard library and no runtime framework. Workers require Node 22+ and the pinned Wrangler package. Browser/a11y/PDF tooling is development-only.

```sh
npm ci --prefix ../workers
python3 ../workers/tools/export_default_content.py
python3 scripts/build.py
python3 -m unittest discover -s tests -v
pip install -r tests/requirements-browser.txt
python3 -m playwright install chromium
python3 tests/browser_review.py
python3 tests/experience_review.py
python3 tests/design_capture.py --output /tmp/nusya-design
```

`dist-public/` and `dist-admin/` are ignored generated outputs. `npm run preview:public` / `preview:admin` serve static previews without storage or authentication; never publish the admin through an unprotected host. Browser fixtures are synthetic, not proof of production login or email.

## Shared content and presentation

The generator composes semantic page helpers from `src/content/site_copy.py`, explanatory interface copy and the SEO catalogue. Existing allowlisted plain-text CMS revisions override generated fields. New infographic fields fill missing values in old revisions; no owner content is overwritten. Shared tokens and licensed local fonts live in `src/assets/tokens.css` and `fonts/`; public and admin styles/modules remain separate. CSS/JS URLs include a content version.

The homepage service guide, approved experience timeline and enquiry process use accessible text and ordered lists. Services follow owner-controlled visibility/availability; form success requires durable storage. Vimeo remains on demand with the privacy hash and visible fallback. Retain both disclosed illustration assets, CMS media overrides and the localized footer developer attribution.

The protected editor groups page fields, compares translations against English, and separates drafts, review, preview, publishing and eligible rollback. All writes remain authorized by the Worker API. Review also checks the source revision actually shown to the reviewer.

The earlier frontend-only handoff is historical. Current API and release contracts are in `../workers/docs/WORKER_API.md` and `../docs/OPERATIONS.md`. Design/state evidence and authorization are documented in `../docs/reports/editorial-experience/README.md`.

## Icons and search/share metadata

The approved SVG N/globe mark is the source for ICO (16/32/48), PNG favicon and device exports. `python3 scripts/export_icons.py` uses optional dependencies from `tests/requirements-browser.txt`; production builds only copy committed exports. The script also losslessly optimizes existing localized sharing PNGs, preserving pixels. The 180px Apple and 192/512px device exports are opaque; favicon PNG corners retain transparency. Root icon aliases are generated for public and admin output; admin assets remain authenticated and no-store. The public-only manifest uses `display: browser` and `/uk/`, with no service worker.

`src/content/seo.py` separates localized SEO titles from visible headings. Builds emit complete OG/Twitter metadata and identity/site/page JSON-LD; `workers/tools/export_default_content.py` exports matching CMS defaults. Preserve published overrides, four-language cards and AI disclosures. Run static SEO tests with `python3 -m unittest discover -s tests -v`; see `../docs/LOCALIZATION.md` for routing and indexing rules.
