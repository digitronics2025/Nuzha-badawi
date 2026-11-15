# Private Admin & Publishing System

## Goal
Nozha should control day-to-day operation without coding: respond to leads, change availability, update biography, homepage/video, pages, media, SEO and EN/AR/RU translations.

## Admin modules
1. **Overview:** open enquiries, outstanding translation reviews, last published revision and focused quick actions.
2. **Pages & homepage:** structured sections, controlled ordering, image/media references, CTA, headings, visibility and preview.
3. **Services:** English/Russian/Arabic lessons, coaching, translation, interpretation; availability, approved pairs, pricing if established and appropriate booking links.
4. **Profile:** approved history, credentials, teaching approach and photo source.
5. **Translations:** side-by-side EN/AR/RU, source revision, needs-review, reviewer and per-locale publish.
6. **Media & video:** asset uploads/replacements, license/consent, alt text; Vimeo ID/hash, custom poster, captions/transcripts, section visibility and position.
7. **Enquiries:** inbox, filters/search, detail, status, notes, export and retention/deletion workflows.
8. **SEO/navigation/settings:** per-language titles/descriptions, approved links and menu entries, contact destination.
9. **Publishing & history:** drafts, preview, validation, publish, versions, rollback and audit.

## Roles
Owner: settings, publishing, exports, account management and recovery. Optional editor: draft, media and response functions as explicitly configured. Prefer managed identity/MFA (e.g. Cloudflare Access when adopted); verify signed identity at API and enforce app-specific permissions. No default credentials.

## Draft-to-public state machine
`draft → preview → localized review → publish → verify → (rollback if necessary)`.
- Draft never changes public content.
- Use immutable revisions, optimistic concurrency to prevent overwriting between tabs, validated schema and media refs.
- Publishing failure keeps last-known-good version active. If cached HTML, define exact propagation/refresh and fallback.
- Preview protected with auth, noindex, no-store, expiring access.
- Hide/unpublish unavailable services while maintaining historical revisions and truthful UI.
- Audit actor, time, target, revision and action without customer PII in logs.

## Enquiry lifecycle
Suggested `new`, `reviewing`, `awaiting_customer`, `quoted`, `booked`, `completed`, `closed`, `spam`. Final states reflect actual business semantics and are not fabricated. Durable persistence must precede success. Email notification is a separate retryable step; never display 'email sent' if it failed. Contact forms validated and protected server-side.

## Practical admin UX
One or two clicks to open unanswered requests, edit hero, change video and toggle service. Clearly show Saved vs Published and draft/review status, not invented KPIs. Mobile-friendly and keyboard accessible. No unrestricted drag-and-drop or arbitrary scripts/HTML. Design requires explicit high-fidelity mockup approval before coding.

## Support and export
Maintain simple operator guide, ability to export records safely, backup + tested restore, and no public exposure of drafts or client messages. Nozha should retain access/control through approved account ownership.
