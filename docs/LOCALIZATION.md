# Three-Language Strategy — English, Arabic, Russian

## Locked locales
Exactly `en`, `ar`, `ru` for public site. Arabic is RTL. **No fourth Ukrainian UI**, **no Korean**. Ukrainian can be accurately mentioned in documented language history and approved translation pairs.

## Routing
Preferred localized URLs: `/en/...`, `/ar/...`, `/ru/...`. Keep locale switcher on equivalent page when available. Root may redirect to English; do not silently geo-redirect. Unknown locale: explicit safe redirect or 404. Use localized metadata, canonical and reciprocal `hreflang`, correct HTML `lang` and `dir`, sitemap and noindex for admin/draft/preview.

## Content model
- English is the editorial source unless Nozha approves different canonical copy.
- Store localized values with source revision, reviewer, review status, publication revision and updated date.
- On English source change, mark AR/RU **needs review**, preserve currently published translations and prevent misleading silent auto-sync.
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
