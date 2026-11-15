# Quality Assurance, Testing and Acceptance Criteria

## Test layers
1. **Static checks:** formatting, lint, typecheck, dependency lock consistency, secret scanning.
2. **Unit:** locales, schema validation, service availability, directed translation pairs, Vimeo id/hash parser, publish versioning/rollback, safe URLs.
3. **Integration:** admin identity/authorization, content draft/publish, concurrency, source-locale review flags, enquiry persistence, notification failure and retry, migration integrity.
4. **E2E browser:** navigation and forms at 1440px desktop, 768px tablet, 390px and 320px mobile, keyboard-only, 200% zoom, Arabic RTL and Russian long strings.
5. **Accessibility:** WCAG 2.2 AA target including focus, semantic controls, contrast, labels, errors, dialog behavior, screen reader language and reduced motion.
6. **Performance:** Core Web Vitals good thresholds (LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75 where field data is available); fast mobile without loading Vimeo before interaction.
7. **Security/cost:** auth denial, spam and rate limits, SQL parameterization, caching boundaries, no PII logs and bounded D1/R2 calls.

## Critical E2E journeys
- Navigate all public sections, three language routes, equivalent-page language switch and full Arabic RTL.
- See real approved hero imagery, video poster and click-to-play Vimeo; confirm broken/embed-blocked fallback.
- English, Russian and Arabic lessons display accurate scope and live status. Preply outbound link remains a link, not a booked conversion event.
- Translation form only accepts approved directed language pairs; interpretation requires correct dates/timezones; coaching request captures goal.
- Parent/guardian path avoids unnecessary child data.
- Valid form persists before confirmation; duplicate submission returns safe outcome; email outage does not drop enquiry.
- Admin unauthenticated/unauthorized users are blocked.
- Admin edits page and locale text, saves draft, previews privately, publishes, verifies live update, safely rolls back and handles simultaneous edit conflict.
- Translation source modification flags other locales for review without silently replacing their live versions.
- Admin changes video, image, service status and links safely.
- Verify privacy/legal links, sitemap/canonical/hreflang, social metadata and noindex of admin/draft.

## Required design gate evidence
Before public/admin UI implementation, supply **high-fidelity** desktop and mobile mockups including Arabic RTL, admin and responsive form states. Record explicit user approval; no UI code before that.

## Test evidence convention
Report exact commands, environment, date, pass/fail, screenshots, known gaps and rollback procedure. **Never claim tests ran if they did not.** Use synthetic customer data in test environments.

## Release blockers
Missing approved mockups; incomplete EN/AR/RU; broken contact journey; exposed admin; unverified video fallback; misrepresented claims, inaccessible core controls, data-loss failures or significant unresolved performance/cost regression.

## Domain/Cloudflare release matrix
After explicit design and later production authorization, test Cloudflare Custom Domain for `https://nozha-badavi.com` and admin at `https://admin.nozha-badavi.com`: TLS, DNS zone/CAA, apex/www redirect loop and path preservation; public /en /ar /ru routes, localized canonical/hreflang; `workers.dev`/preview isolation and noindex; admin rejection without Access and per-action API roles; no public admin CRUD; live D1 publish cache propagation and rollback; staging/prod separation; form idempotence/Turnstile/notification failures; Vimeo privacy hash and real playback; D1/R2 cost limits and log PII avoidance. Test actual hostname after deployment, not only an internal preview. Do not claim domain live because Registrar shows ready. See `CLOUDFLARE_DEPLOYMENT.md`.

## Final visual and motion acceptance matrix (V01–V12 / M01–M16)
Before UI code, require high-fidelity full-page mockups for EN desktop/mobile, Arabic RTL desktop/mobile, Russian desktop/mobile, Lessons/About, coaching/translation/contact form states, admin overview and editor desktop/mobile, video play/failure, reduced-motion/focus/200% zoom, and a 6–10-frame motion storyboard. **Stop for explicit mockup approval.**

After approval and implementation, validate **all motion IDs M01–M16** in [design.md](../design.md): hero <=640ms, route line once <=900ms (not continuous), card reveal <=420ms, hover <=280ms, navigation 180–240ms only when supported, accessible admin feedback <=220ms, instant static fallbacks. Test `prefers-reduced-motion`, keyboard navigation and dynamic preference changes. No JS-dependent invisible essential text, layout-shift entrances, autoplay Vimeo, scroll-jacking or perpetual animation.

Measure actual 1440/768/390/320px screenshots, Arabic mirroring without flipping portraits/logo, Russian text overflow, 200% zoom and supported browsers. Targets: LCP <=2.5s p75, INP <=200ms p75, CLS <=0.1 p75; aim <=90KB gzipped homepage client JS (excluding Vimeo), <=45KB gzipped CSS pending framework audit; **zero Vimeo iframe player requests until Play where feasible**. Remove decorative animations first if device speed, accessibility or Cloudflare cost degrades. No performance result is claimed until measured on the implemented site.


## Review hardening — 2026-11-15

Review regressions: npm run check --prefix workers (26 Worker tests plus SQL checks); python3 -m unittest discover -s frontend/tests -v (13 tests); python3 frontend/tests/browser_review.py (84 responsive page checks plus inbox/retry/unsaved-edit flows). Optional browser dependencies are pinned in frontend/tests/requirements-browser.txt. Both CI validation and deployment tests run a dry-run public bundle through tools/review-runtime.mjs using native HTMLRewriter and disposable D1. These local/mocked checks do not substitute for authenticated staging writes, production Turnstile, email delivery or field performance measurements.
