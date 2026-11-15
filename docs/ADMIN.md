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

## Protected admin hostname and publishing boundary
Plan `https://admin.nozha-badavi.com` on an independently protected admin Worker, with Cloudflare Access/MFA as a perimeter and **verified identity plus roles enforced in application APIs**. Keep private content/enquiry APIs off the public hostname; avoid `workers.dev` bypass, disable unnecessary preview access, noindex/no-store everywhere private. The admin publishes versioned records to a public content projection for `https://nozha-badavi.com` and triggers **verified** cache freshness, not an untested static/D1 hybrid. No Cloudflare resources are yet verified. See `CLOUDFLARE_DEPLOYMENT.md`.

## Visual interaction contract (final proposed direction)
The admin shares the NUSYA ivory/espresso identity but operates as a calm, functional utility rather than a cinematic marketing page. Responsive desktop sidebar ~240–260px; mobile stacked attention queue; real-only New Enquiries, Translation Review, Last Published, Site Status. Structured page editor shows EN/AR/RU review state and explicit Saved Draft, Preview, Published, conflict and rollback controls. Never animate counters/tables, fake metrics or destructive confirmations. Functional feedback <=220ms, no heavy transition dependencies. Include admin desktop/mobile overview, editor, error/empty/success in V08–V09 high-fidelity mockups, with approval before implementation. See `design.md` and the updated v3 plan.


## Review hardening — 2026-11-15

The inbox exposes customer messages, service details, reply links and event history through authenticated detail requests. UK is included in translation status. Page changes, navigation and unload protect unsaved edits; overlapping loads discard stale responses and disable heading fields while loading. History lists author/date/publication eligibility with protected revision previews and restore confirmation. Drafts cannot be restored as published revisions.

The editor also exposes SEO title/description, internal enquiry notes, owner contact/social settings and approved video poster IDs; these controls use existing validated APIs and plain-text DOM rendering.
