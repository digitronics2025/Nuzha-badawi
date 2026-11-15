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

## Final Visual & Motion Design Freeze — 15 November 2026

**Status:** definitive direction for the required high-fidelity mockups, **not approval to implement the UI**. This section supersedes generic/optional design directions above wherever they conflict. The future coding agent must produce inspectable full-page desktop/mobile designs, Arabic RTL variants, realistic Russian text, an admin dashboard/editor, video/form states and motion storyboards; **STOP for explicit user approval before public or admin UI implementation**. No Cloudflare DNS/provisioning/deployment is authorized by design sign-off.

### Brand and art direction
**Creative direction:** *Cinematic Editorial Luxury* — an authentic personal portrait of Nozha Badavi, warm ivory paper-like backgrounds, deep espresso editorial typography and subtle antique-gold accents. Design metaphor: **The Art of Connection**, expressed as a single elegant globe/flight-route line inspired by the existing NUSYA logo. It reveals once near the hero, remains static thereafter, and has optional still echoes in the About timeline and closing CTA. No constant flying airplane, spinning 3D globe, parallax, neon, stock impersonation, looping background video, particle canvas, giant counter animations or custom cursor.

Visual sources: retain the supplied script/globe brand, warm atmosphere and verified human credentials; replace the overloaded promotional collage with carefully spaced sections, approved authentic photographs and clear navigation. Do not fabricate a face, credentials, student stories, success statistics, prices or in-person service availability. QR cards become direct Instagram/Preply links. Only EN, AR RTL and RU are website locales; **never add Korean**.

**Final palette:** ivory #F8F4EE, espresso #37231D, muted ink #624C42, antique gold #B48A57, dusty rose #C9A39A, sand #E9DCCF, white #FFFFFF, dividing line #DFD0C2. Use approximately 75% warm neutrals, 20% espresso/photo areas and 5% gold/rose accents. Gold is decorative, **not** small body text on ivory. Accessibility contrast must be measured.

**Typography:** Latin/Cyrillic editorial headings in Cormorant Garamond, once actual Russian glyphs and licensing pass review; UI/body in Manrope; Arabic in IBM Plex Sans Arabic or a demonstrably better verified alternative. Logo is the only script signature. H1 clamp(3.1rem,5.2vw,5.6rem), line-height .99–1.06; H2 clamp(2.35rem,4vw,3.8rem); H3 25–32px; body 17–18px desktop, 16px mobile with readable line-height. Never animate individual Arabic glyphs or fake Arabic letter-spacing. Nozha's portrait remains unmirrored and authentic.

**Grid:** 12 columns desktop, 6 tablet, 4 mobile; max content 1240px, paragraphs 64–72 characters; page gutters 40–64px desktop, 28–36px tablet, 20px mobile (16px at 320px). Section spacing 112–144px desktop / 64–80px mobile. Desktop hero approximately 55% text / 45% portrait; 4:5 portrait frame, 16:9 video frame, 4:3 service art; stable aspect ratios to prevent layout shifts. Header 72–84px desktop/64–72px mobile, quiet near-solid sticky surface, accessible 44px touch targets and visible keyboard focus. The design has **one elegant light theme**: do not add dark-mode complexity for its own sake.

### Homepage visual storyboard
1. **Hero:** real consented portrait, brief professional overline, concise H1 “Learn a language. Find your voice. Connect with the world.” (draft copy requiring factual approval), supporting copy, dark **Explore Lessons** CTA and outline **Request Language Services** CTA. Initial content already visible and actionable; subtle 640ms line/portrait reveal and a one-time gold route flourish (<=900ms) only if motion is supported.
2. **Credibility:** a slim band of up to three factual statements; no fake counters, reviews or awards.
3. **Video:** immediately below hero/credibility, a luxurious on-demand 16:9 Vimeo poster with real approved still, prominent Play, contextual “Meet Nozha” introduction, optional reviewed EN/AR/RU transcripts and failure fallback. Exact embed ID 1171310337, privacy hash 3416a6f4f5. No Vimeo player requests before clicking when feasible; no autoplay sound.
4. **Languages:** English, Russian and Arabic editorial cards, single clear CTA each, no decorative flags, gentle one-shot card reveal.
5. **Coaching:** half-photo/half-type section for meetings, speeches, conferences, presentations; enquiry route and only verified claims.
6. **Translation / Interpretation:** two calm, separate service panels with exact approved language pairs, no fake price calculator, no implied certified translation.
7. **About:** real photo, brief story and 3–5 approved career highlights on a mostly static fine-line timeline. Full chronology belongs to About page.
8. **Feedback / FAQs:** show reviews only if real and consented; otherwise omit. Accessible FAQ controls, no large animated carousels.
9. **Closing CTA:** one rich espresso panel with ivory type and two distinct actions, tiny static globe stroke, honest contact/footer links.

**Mobile order:** heading + principal CTA + secondary CTA before portrait; evidence and video directly afterward; lesson cards stacked; no sticky full-screen animation or CTA covering fields. Test 320px and 200% zoom. Arabic mirrors navigation/logical flow, **not** faces, official logos, real globe/airplane shape or Latin URLs. Russian widths must accommodate longer words without squeezing type.

### Motion implementation contract (exact)
Motion must be **quiet cinema**: editorial pacing, no constant activity. Use native CSS opacity/transform transitions with progressive enhancement; avoid GSAP, Framer Motion, Lottie, Lenis, Three.js, WebGL, custom per-frame JavaScript and smooth-scroll dependencies unless future evidence proves a need. Essential text must be visible without JS or IntersectionObserver.

| Token | Timing / easing | Use |
| --- | --- | --- |
| fast | 140ms | press/hover icon |
| ui | 220ms | menu/dialog/accordion |
| card | 280ms | image-scale and card entrance |
| section | 420ms | one-time section reveal |
| hero | 640ms | heading/portrait |
| route | <=900ms | a single stroke-draw only |
| ease-enter | cubic-bezier(.22,1,.36,1) | smooth non-bouncy entrances |
| ease-exit | cubic-bezier(.4,0,1,1) | dismiss/exit |
| stagger | 65ms per item, maximum 3 items | lesson-card sequence |
| translate distance | 18px desktop, 10px mobile | bounded reveal; no reflow |

| ID | Interaction | Target | Fallback |
| --- | --- | --- | --- |
| M01 | header first paint | <=220ms optional opacity, no displacement | fully visible |
| M02 | hero H1 | 640ms fade + 12px by **line**, not glyph | complete readable H1 |
| M03 | hero portrait | 640ms opacity + scale 1.025→1 in clipped stable crop | full still photo |
| M04 | gold route | once, <=900ms, 1–1.5px path reveal, plane stays at endpoint | fully drawn static emblem |
| M05 | first-view CTA | <=420ms very light opacity, clickable immediately | static clickable |
| M06 | credibility | first viewport entry once, 320ms fade | full copy |
| M07 | Vimeo poster | entry once, 220–350ms; Play hover <=1.03 scale | static poster |
| M08 | service cards | entry once, 420ms and 65ms stagger | full static cards |
| M09 | pointer card hover | 280ms image scale <=1.02, border tint | no zoom |
| M10 | link focus/hover | 180ms logical inline-start underline | visible underline |
| M11 | supported page navigation | 180–240ms subtle crossfade / <=6px reveal | instant native navigation |
| M12 | mobile menu/dialog | 220ms opacity/8px shift, correct focus return | instant menu |
| M13 | conditional form fields | 120–180ms subtle opacity; no focus loss | instant fields |
| M14 | saved enquiry success | 200ms one-time check, confirmed reference | static reference |
| M15 | admin feedback | <=160ms small toast, persist critical errors | static honest state |
| M16 | admin sidebar | <=180ms small shift, no bounce | instant sidebar |

Route motif: one inexpensive approved SVG stroke; do not attach line drawing to every scroll frame. CSS View Transitions can improve same-origin public navigation **only if verified browser support and performance**; fallback is ordinary navigation, and public↔admin transitions are never shared. One IntersectionObserver can fire nonessential section reveals exactly once, but page content must not depend on it. For \`prefers-reduced-motion: reduce\`, cancel entrances/route drawing/page transitions/smooth scroll and hover scale, while retaining instant useful state feedback; also honor preference changes and low-end device performance.

Buttons use espresso/outline and hover arrow shift <=4px only on pointer devices; service images zoom max 1.02 inside static geometry, not tilt. Forms must preserve input focus and reveal only relevant fields. Success is shown only after **durable server persistence**, never fabricated email confirmation. Admin uses rapid 140–220ms utility transitions, no stagger/visual noise in real enquiry tables. Keyboard, screen readers and reduced-motion users receive the identical services.

### Admin art direction
At planned \`https://admin.nozha-badavi.com\`, share colors/branding but use functional, denser UI: 240–260px desktop left navigation, honest New Enquiries / Translation Review / Last Published / Site Status information, obvious quick actions, mobile stacked task layout rather than squeezed tables. The page editor has visible EN/AR/RU review states, saved-draft vs published distinction, structured sections, preview, conflict handling and rollback. No unrestricted raw-HTML builder, fake business metrics or needless motion. Important errors remain visible; keyboard and mobile keyboard-safe editing work reliably. Admin auth and public-data boundaries are specified in the architecture/security documentation.

### Graphics and production assets
Deliver approved full wordmark SVG and simplified small mark, favicon/export sizes, consented real Nozha portraits with responsive 4:5 and mobile crops, 16:9 authentic Vimeo poster, optional contextual lesson photos or elegant typographic alternatives, per-locale OG images (1200×630), one lightweight SVG motion file plus its static fallback, a rights/provenance inventory and full-page design artboards. Strip sensitive EXIF and never upload private CV/contact data into the public repo. No fabricated portraits or invented subtitles.

### Performance guardrails
LCP <=2.5s p75 where measurable; INP <=200ms p75; CLS <=0.1 p75, aspirational <=0.05 for hero/forms. Aim for <=90KB gzip homepage client JS excluding Vimeo (stretch <=50KB) and <=45KB gzip CSS pending actual framework measurement; no animation-only runtime library, no decorative APIs/Worker/D1/R2 operations. Reserve image/video dimensions, compress portraits, limit fonts and variants, preload only LCP asset. Avoid loading Vimeo iframe/script until Play where feasible. Animations should be smooth on a representative midrange phone without >50ms attributable main-thread tasks. If accessibility, page weight or interaction conflicts with motion, **remove motion first**.

### Mandatory high-fidelity mockup delivery — HARD STOP
Before **any UI implementation**, provide inspectable **full-page** boards and short motion prototype/storyboard:
V01 EN desktop home 1440px; V02 EN mobile 390px plus 320px stress; V03 Arabic RTL desktop/mobile; V04 Russian desktop/mobile; V05 Lessons desktop/mobile; V06 About desktop/mobile; V07 Coaching/Translation + adaptive forms with loading/error/success states; V08 Admin overview desktop/mobile; V09 Admin content editor EN/AR/RU draft/preview/publish/conflict mobile/desktop; V10 Vimeo poster, play and failure; V11 6–10 frame motion sequence keyed M01–M16; V12 reduced-motion, visible focus and 200% zoom alternatives. Include exact tokens, media rights/placeholder labels, relative timing, page-level hierarchy and reasons for every decorative element.

**After presenting this package, STOP until explicit user approval.** The final design direction above is already chosen; routine creative decisions may be made autonomously, but mockup sign-off remains mandatory and distinct from DNS, Cloudflare, cost and production approvals. If changes are requested, update mockups and seek approval again. After approval, implement, visually compare live browser screenshots with approved artboards, test EN/AR/RU and reduced motion, measure budgets, and document real results.
