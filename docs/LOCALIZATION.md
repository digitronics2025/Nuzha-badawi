# Four-Language Strategy — Ukrainian, English, Arabic, Russian

## Locked locales
Exactly `uk`, `en`, `ar`, `ru` for the public site. Ukrainian is the default website language; Arabic is RTL. Offered lesson languages remain English, Russian and Arabic. No Korean content or services.

## Routing
Canonical localized URLs: `/uk/...`, `/en/...`, `/ar/...`, `/ru/...`. The root and `/index.html` always redirect to `/uk/` regardless of browser language (D-033). Keep the locale switcher on the equivalent page. Unknown locales return 404. Use localized metadata, canonical and reciprocal `hreflang`, correct HTML `lang` and `dir`, sitemap and noindex for admin/draft/preview.

## Content model
- English is the editorial source unless Nozha approves different canonical copy.
- Store localized values with source revision, reviewer, review status, publication revision and updated date.
- On English source change, mark UK/AR/RU **needs review**, preserve currently published translations and prevent misleading silent auto-sync.
- Locale-specific drafts can be previewed separately, validated, published and rolled back.
- Validate completeness of visible text, SEO and error/confirmation messages. Do not deploy mixed-language placeholders without a clear, accessible fallback.
- Translation assistance may draft text but **never auto-publish**. Human review is required for services, prices, credentials and legal copy.

## Arabic and internationalization checks
Use CSS logical properties, bidi isolation for emails/URLs/numbers, true RTL navigation where appropriate, accessible mirrored directional icons, natural Arabic phrasing and a tested Arabic font. Screen reader language tags and keyboard/focus order must be correct. Russian needs comfortable widths for longer strings.

## Localized system strings
Navigation, buttons, headings, footer, forms, field labels, validation, success/error, alerts, aria labels, loading/empty states, video captions/transcripts where approved, per-locale images/alt, social metadata and policy text.

## Service vs language
The UI locale does not imply a service is taught. Lessons in English, Russian and Arabic are source-documented; Ukrainian can be a translation language only in approved pairs. Never infer all directed translation pairs from a language list.

## Acceptance
No untranslated key, accidental Korean content, broken RTL layout, incorrect canonical/hreflang or inaccessible language switcher; admin shows review statuses and source-linked versions. Test 320px, 390px, desktop and 200% zoom.

## Canonical domain and multilingual SEO
Use the production apex `https://nozha-badavi.com` with the four locale prefixes. The sitemap contains only the 28 canonical pages; reciprocal `hreflang` includes all four locales and equivalent Ukrainian `x-default`. HTTP/www and page aliases redirect to canonical URLs. Error pages return 404/noindex without homepage canonical or language alternates; staging, private admin and APIs remain excluded from indexing.

`frontend/src/content/seo.py` supplies descriptive per-page search titles separately from editorial headings and exports the same defaults to the CMS. Published CMS SEO overrides stay authoritative across HTML titles, descriptions, Open Graph, Twitter and page JSON-LD. OG locale tags are `uk_UA`, `en_GB`, `ar_SA`, `ru_RU`; these describe metadata formatting, not geographic service coverage. Cards retain the approved four-language artwork and use content-derived URL versions, localized image descriptions and 1200×630 PNG dimensions. JSON-LD describes only verified identity, website and pages; it makes no availability, certification, rating or location claims.
