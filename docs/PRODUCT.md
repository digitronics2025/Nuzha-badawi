# Product Requirements — NUSYA Linguistic Studio

**Status:** agreed product direction; implementation pending. See [SOURCES](SOURCES.md) before asserting public facts.

## Mission
Create a beautiful and useful professional home for Nozha Badavi: students understand and book suitable lessons; professional clients request translation, interpretation or communication coaching; Nozha manages it all independently.

## Locked product choices
- Brand NUSYA Linguistic Studio; personal-professional site, **not** a large academy or SaaS.
- Exactly three public UI languages: **English / Arabic (RTL) / Russian**.
- Source-documented lesson subjects: **English, Russian, Arabic**; verify current lesson availability.
- Professional communication coaching; translation/interpretation requests, within approved scope.
- Supplied Vimeo intro prominently on homepage, controlled via admin.
- Secure owner-facing admin for content, media, service availability, multilingual copy, previews and leads.
- Elegant authentic imagery and fast mobile performance. **No Korean** anywhere in public site.

## Primary audiences and jobs
1. Adult learners: choose language and learning goal, understand approach, book via authorised route.
2. Parents: review suitability for child; **guardian** submits enquiries; confirm minimum age.
3. Professionals: request language preparation for business meeting, presentation, speech, conference.
4. Translation clients: request quotation with actual language pair, type, length and deadline.
5. Interpretation clients: request service with language pair, date/timezone, topic, duration, format.
6. Nozha: see urgent enquiries, update copy and services, approve translations, change video, publish/rollback.

## Public site scope
Home; About Nozha; Language Lessons with English/Russian/Arabic offer details; Professional Communication; Translation & Interpretation with separate sections; Contact; legal/privacy; Resources only when approved substantive content exists. Genuine reviews appear embedded in relevant pages, not a placeholder page.

Homepage order recommendation: navigation/hero → verified credibility → Vimeo introduction → three lessons → coaching → translation/interpreting → mini biography → learning process → approved reviews → FAQs → contact CTA/footer.

## Service/offer data required
- Language lesson: language, audiences, level, format, method, age suitability, availability, booking route, FAQ, approved pricing if provided.
- Coaching: supported language, purpose, format, prep expectations, enquiry link.
- Translation: **approved source→target directions** (do not infer all pairs), eligible document/text categories, non-certified limitations and quote workflow.
- Interpretation: language directions, location/remote limits, date, duration, topic and enquiry channel.
- Ineligible or unconfirmed services hidden from menus, not falsely advertised.

## Conversion and operations
Two distinct flows: authorised lesson booking (Preply where appropriate) vs qualified direct professional-service enquiry. Each form sends minimal data, validates on server, receives a reference and is recoverable in admin even when email fails. Preply outbound click ≠ completed booking.

## MVP definition of done
1. All agreed public pages responsive and accessible with reviewed EN/AR/RU strings and safe page-level SEO.
2. Prominent user-initiated Vimeo player and robust fallback.
3. Secure admin can edit, preview, publish, track translations, change video/service availability, roll back, handle enquiries.
4. Backend safely stores enquiries before acknowledgement; authentication/authorization, spam control and error handling verified.
5. Privacy, media rights, no unsupported claims, Cloudflare-cost safeguards and documented recovery.
6. High-fidelity desktop/mobile public/admin visuals explicitly approved **before any UI code**.

## Exclusions
No LMS, user accounts for students, custom video calls, automatic Preply synchronisation, direct payment, fake metrics, AI chatbot, unreviewed translation auto-publish, broad CRM, public sensitive-document upload, huge page builder, uncontrolled paid integrations, Ukrainian fourth UI locale, Swedish lesson offer, Korean.

## Success metrics (define baseline after launch)
User can understand offer and act in first viewport; reliable qualified requests; admin can safely publish a reviewed change without coding; no lost leads; good Core Web Vitals; WCAG 2.2 AA target; indexed translated pages; sustainable low platform cost. Track quote requests and outbound Preply clicks separately.
