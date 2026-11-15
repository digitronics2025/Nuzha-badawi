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
