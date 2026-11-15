# NUSYA Design System & UX Contract

**Status:** proposed direction, **not yet approved as final mockups**. This file defines the design brief and acceptance rules; the future coding agent must render high-fidelity mockups and obtain explicit user approval **before UI implementation**.

## Brand strategy
- Name: **NUSYA Linguistic Studio**; person: **Nozha Badavi**.
- Character: cultured, calm, approachable, international, confident and professional.
- Inspiration: original warm brown/gold NUSYA globe-and-flight-line identity, not literal recreation of the crowded promotional collage.
- Brand line from supplied artwork: “Languages open doors. I help you cross them.”
- Suggested primary message (subject to copy approval): “Learn a language. Find your voice. Connect with the world.”
- Authentic portraits of Nozha are central. Never fabricate or replace her identity with AI faces.

## Visual tokens (provisional; measure actual contrast)
| Token | Value | Use |
| --- | --- | --- |
| `color.ivory` | `#F8F4EE` | Main canvas |
| `color.espresso` | `#37231D` | Primary text, buttons |
| `color.gold` | `#B48A57` | Fine borders, accents; not small text on ivory |
| `color.rose` | `#C9A39A` | Restrained warm highlight |
| `color.sand` | `#E9DCCF` | Cards and video framing |
| `type.heading` | Candidate Cormorant Garamond | Latin headings, subject to performance/legibility approval |
| `type.body` | Candidate Manrope | Navigation, paragraphs, forms |
| `type.arabic` | Candidate IBM Plex Sans Arabic | Arabic RTL readability |

Implementation must measure WCAG 2.2 AA contrast for all real text states, not assume palette values pass.

## Layout and imagery
- Max reading width roughly 60–75 characters; content container candidate 1160–1240px; spacing uses a consistent scale.
- Desktop hero: concise value proposition + clear lesson and professional-service actions, balanced with an authentic professional portrait.
- Mobile hero: text and primary action first, then approved portrait or video poster; do not make users scroll past decoration to understand what is offered.
- Homepage video: prominent just after hero/credibility, responsive 16:9, custom poster, on-demand Vimeo iframe (preserve `h=3416a6f4f5`), transcript/fallback and no audio autoplay.
- Image ratios: portrait ~4:5, service media ~4:3, video 16:9. Source/rights approval and per-locale alt text required.
- Logo variants: approved full script wordmark, simplified mark/favicon and optional globe; no unreadable tiny details.
- Motion: subtle purposeful transitions only; support `prefers-reduced-motion`. No continuous parallax, heavy WebGL, intrusive modals, blocking popups or background video autoplay.

## Public interface components
Navigation with language switcher; hero; credibility evidence; video/poster; English/Russian/Arabic lesson cards; communication-coaching spotlight; translation/interpretation cards; compact biography and timeline; verified testimonials (if available); FAQs; service-aware enquiry form; footer/legal links.
- Calls to action must distinguish learning/booking from quote requests.
- Never hardcode rates, student counts or unsupported credentials.
- No decorative flags as substitutes for locale labels; use **EN / العربية / RU** or translated native names.
- Interactive elements >=44px practical touch target; visible focus, skip navigation, valid heading structure, keyboard controls.

## Admin interface principles
- Attention-first dashboard: new requests, translation-review queue, last publication status, quick actions.
- Tasks reachable in 1–2 steps: edit homepage, change Vimeo, update service availability, answer enquiry.
- **Structured section editor**, not unrestricted arbitrary HTML/drag-and-drop. Draft, preview, per-locale review, publish, rollback.
- Real saved/published status, validation, loading/empty/error/conflict states; no fake KPI cards.
- Accessible mobile editing and clear RTL layout in public site. Admin UI locale policy must be explicitly defined; don't imply all admin chrome is translated until implemented.

## Responsive / RTL / accessibility
- Produce and test at approx. 1440px desktop, 768px tablet, 390px mobile, and 320px fallback; verify 200% zoom.
- Use CSS logical properties, document `lang` and `dir` and proper bidi isolation for URLs/emails/numerals in Arabic.
- Complete localization of public messages including forms, errors, validation, transcripts, SEO and no-content fallbacks.
- WCAG 2.2 AA target: accessible forms, contrast, focus, controls, motion, media caption/transcript alternatives.

## Mandatory high-fidelity approval package — HARD STOP
Before UI coding, the execution agent MUST inspect the existing UI (if any) and deliver inspectable visual mockups of:
1. Homepage desktop (1440px) and mobile (390px).
2. Lessons and translation enquiry journeys at desktop and mobile sizes.
3. Arabic RTL homepage desktop and mobile, plus real Russian sample text.
4. Admin overview desktop and mobile.
5. Admin page editor/translation review desktop and mobile.
6. Video playback/fallback, empty, loading, validation and success states.
7. A concise rationale for typography, photographs, content hierarchy, contrast, accessibility, motion and responsive behavior.

**Present mockups and STOP until the user explicitly approves.** No UI files, components, CSS or deploys before approval. Requested revisions require another approval review. Record approved mockups in `docs/DECISIONS.md` and update this file to distinguish final approved tokens from proposals.

## Review checklist
Does a first-time visitor understand who Nozha is, three documented teaching subjects, services and next action? Is the video prominent but not blocking? Can a user change locale without losing the page? Can the admin safely edit and reverse changes? Does every visual element earn its space?

## Production hostname and public-link design
The intended canonical public URL is `https://nozha-badavi.com`; owner-facing admin will be protected at `https://admin.nozha-badavi.com` after explicit deployment approval. Include fully branded OG/social previews, favicon and locale-specific canonical references under the apex, not arbitrary Worker preview URLs. On mockups, show a visually coherent authenticated admin experience without suggesting the domain is already live. No website UI is authorized merely because the domain was registered.
