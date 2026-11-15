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
