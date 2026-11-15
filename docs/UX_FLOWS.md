# UX, Page Structure and Customer Journeys

## Navigation and pages
Recommended public pages: Home, About, Language Lessons (English/Russian/Arabic), Professional Communication, Translation & Interpretation, Contact, Privacy/Legal; Resources only with useful approved content. Reviews appear contextually on Home/Lessons rather than an empty standalone page.

Homepage order: concise identity and real-portrait hero → credibility evidence → prominent Vimeo introduction → three language lessons → coaching spotlight → translation/interpretation → short biography → process → approved feedback → FAQs → final contact CTA and footer.

## Conversion flows
### Student
Land in preferred locale → understand teacher/lesson and suitable audience → choose language and goals → authorized Preply booking or eligible independent request. Do not divert existing Preply students off platform; don't claim an outbound click is a completed booking.

### Parent/guardian
Read actual minimum-age/child suitability policy → parent/guardian contacts teacher → collect minimum information about the child; avoid direct data collection from minors.

### Professional communication
Identify meeting/speech/presentation/conference goal, preferred language, date and context → send scoped enquiry → get localized acknowledgement and reference ID.

### Translation
Choose written translation → source/target from **approved pairs only**, text category, approximate length, needed date and purpose → submit quote request. No mandatory document upload in MVP; do not promise certified/legal translation.

### Interpretation
Choose interpretation → languages/direction, date and timezone, expected duration, remote/in-person preference, subject → submit; do not promise availability.

## Public form UX contract
- Service-first choices; show only relevant fields.
- Clear label, examples, validation and inline error, no traps or deceptive urgency.
- Contact info, privacy notice and consent only as legally necessary.
- On success, return durable reference ID from stored record; notification delivery is separate.
- Prevent repeated submissions with idempotency key; handle spam and provider outages.
- Fallback business contact, approved for public display.
- Track qualified enquiries separately from outbound Preply clicks.

## State inventory
At minimum design/test: idle, loading, invalid, Turnstile expired, network retry, duplicate, success, email-notification delayed, disabled service, translation unavailable, video unavailable, media missing, empty reviews, 404 and external booking unavailable.

## Admin journeys
Login → attention queue → enquiry detail/status/note → customer response recorded (no fictitious sent status).
Edit content → locale editor → draft save → preview → translation review → publish → verify → rollback.
Change Vimeo URL → validate allowed provider/id/hash → preview play → publish.
Disable service → immediately prevent invalid booking CTA while preserving content history.
Replace media → validate MIME/size, license and alt → preview → publish; prevent deletion of referenced media.
See `docs/ADMIN.md` for permissions, implementation and publishing transitions.

## Live-host and preview behavior
When deployed, visitor routes should use `https://nozha-badavi.com/{en|ar|ru}/...`; `www.nozha-badavi.com` should redirect consistently to apex without losing permitted paths/queries. Admin UX should be isolated on `https://admin.nozha-badavi.com` and require Access plus server-side roles. Preview/draft links must be authenticated/noindex/no-store, not exposed through the public site. A changed published URL needs correct redirects and localized canonical references. These are requirements, not claims of live implementation; see `CLOUDFLARE_DEPLOYMENT.md`.

## Chosen visual choreography and transitions
The homepage is now arranged as H01 portrait-led hero, H02 evidence strip, H03 prominent user-controlled Vimeo intro, H04 English/Russian/Arabic lessons, H05 professional coaching, H06 translation and interpretation, H07 human biography, H08 consented reviews/FAQs, H09 closing conversion section. Mobile starts with headline and primary CTA before portrait/video; screen reader focus and logical URL semantics are preserved.

Motion uses one-off, unobtrusive reveals and minimal hover feedback; the gold plane/path never loops, video never starts without user action, navigation transitions progressively enhance native links and conditional forms preserve focus. See `design.md` M01–M16 and `docs/PLAN-nusya-multilingual-studio.md` V01–V12 for the implementation acceptance contract. Nothing in this document approves a UI build before the mandatory mockup STOP.


## Review hardening — 2026-11-15

Approved review fixes: enquiry details are readable in admin; publication history includes revision previews; all four translation states are visible. An ambiguous submission freezes the original payload/identity for retry and offers an explicit new-request action. Field errors are associated with affected inputs. Vimeo fallback remains reachable after loading. Lesson links preselect their requested language. Existing optimized illustration assets retain their AI disclosure and CMS overrides under D-031.
