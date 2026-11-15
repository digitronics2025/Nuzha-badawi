# Architecture & Product Decision Register

Log decisions here so successive AI agents do not silently reverse choices.

| ID | Date | Decision | Status | Rationale / approval |
| --- | --- | --- | --- | --- |
| D-001 | 2026-11-15 | Brand NUSYA Linguistic Studio / Nozha Badavi | User direction | Source branding and CV |
| D-002 | 2026-11-15 | Exactly EN / AR / RU public website UI | User direction | Arabic RTL; no fourth Ukrainian UI |
| D-003 | 2026-11-15 | No Korean content or services | User explicit | Never include |
| D-004 | 2026-11-15 | Prominent supplied Vimeo introduction on homepage | User direction | Playback/captions/domain rights to verify |
| D-005 | 2026-11-15 | Secure admin controlling website and customer enquiries | User direction | Structured content editing and safety |
| D-006 | 2026-11-15 | High-fidelity desktop/mobile UI mockup approval before coding | User explicit | Mandatory hard STOP |
| D-007 | 2026-11-15 | Premium warm editorial direction | Proposed; mockups not approved | Authentic professional imagery |
| D-008 | 2026-11-15 | Astro/TS/Tailwind/Cloudflare Workers/D1/R2 as candidate stack | Proposed; not implemented | Verify actual code and need |
| D-009 | 2026-11-15 | Cacheable public pages + versioned structured CMS | Proposed; not implemented | Ensure edits reach public content |
| D-010 | 2026-11-15 | Separate lesson booking vs professional quote flows | User intent / recommended | Preserve Preply restrictions |

## ADR template
### D-NNN — Title
- **Date / owner / status:** Proposed / approved / superseded
- **Context / decision needed:**
- **Options considered:** including cost, security and maintenance
- **Chosen approach and why:**
- **Affected files/schema/UX:**
- **Risk and rollback:**
- **Validation/tests:**
- **Explicit approval reference (when required):**

Never write 'approved' on behalf of user without proof. When superseding, keep prior decision and link the replacement. Design mockup approval must record actual approved screens and date.

## Domain/Cloudflare decisions recorded 2026-11-15
| ID | Date | Decision | Status | Rationale / approval |
| --- | --- | --- | --- | --- |
| D-011 | 2026-11-15 | Domain is `nozha-badavi.com` | Confirmed user evidence | Cloudflare Registrar screenshot shows registered/ready; not evidence of deployment |
| D-012 | 2026-11-15 | Public canonical host `https://nozha-badavi.com` with `www` redirect | Proposed | Avoid SEO duplication; requires DNS/SSL/Worker verification and production approval |
| D-013 | 2026-11-15 | Private admin at `https://admin.nozha-badavi.com` with Access and app-level authorization | Proposed | Separate least-privilege public and private surfaces |
| D-014 | 2026-11-15 | Two Workers (`nusya-public`, `nusya-admin`), D1 if needed, R2 optional, Turnstile, approved email transport | Proposed, not deployed | Reliability and low Cloudflare operating costs |
| D-015 | 2026-11-15 | Cloudflare provisioning/DNS/production approval is distinct from design approval | User direction + safety gate | No implicit resource creation or spending |

This supplement records **proposed** architecture, not confirmation that Workers, cloud bindings or an application exist. Detailed specifications: `CLOUDFLARE_DEPLOYMENT.md`.

## Visual and motion design decisions (2026-11-15)
| ID | Date | Decision | Status | Reason |
| --- | --- | --- | --- | --- |
| D-016 | 2026-11-15 | Adopt *Cinematic Editorial Luxury / The Art of Connection* design direction | Chosen for mockups, visual approval pending | Preserve warm original NUSYA identity while improving editorial readability and authenticity |
| D-017 | 2026-11-15 | Signature globe/flight line reveals once, then remains static; no perpetual animation | Chosen for mockups | Distinctive but unobtrusive brand motion |
| D-018 | 2026-11-15 | Motion tokens M01–M16, progressive CSS and reduced-motion fallbacks | Chosen for mockups | Performance, accessibility and repeatable implementation |
| D-019 | 2026-11-15 | Real Nozha photography and a click-to-play early homepage Vimeo section | Chosen for mockups; imagery rights/captions require verification | Authenticity and trust |
| D-020 | 2026-11-15 | Required full-page designs V01–V12 before UI code | Mandatory user approval pending | High-fidelity desktop/mobile/Arabic RTL/Russian/admin/interaction and failure-state review |

These are *documented design decisions*, **not** an assertion that the user approved final mockup artboards or implementation. See [design.md](../design.md) for exact durations, typography and animation fallbacks.
