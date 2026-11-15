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

## Developer credit decision (2026-11-15)

| ID | Date | Decision | Status | Rationale |
| --- | --- | --- | --- | --- |
| D-021 | 2026-11-15 | Add Dr. Badawi Abdalsalam as credited website designer and developer via `https://dr-badawi-abdalsalam.com/` in the discreet, localized public footer | User-requested and approved | Attribution remains visible without competing with NUSYA brand, with safe external links and RTL/mobile support |

This applies to all 21 public pages (EN, AR, RU), underneath copyright. It does not give the developer account access or grant any GitHub/Cloudflare role.

## Updated CV profile copy — content change under review

| ID | Date | Decision | Status | Explanation |
| --- | --- | --- | --- | --- |
| D-022 | 2026-11-15 | Prepare a richer EN/AR/RU biography, named career milestones, education summary and accurate coaching/translation descriptions from the newer CV | **Proposed source-content update, pending public sign-off** | This is a reviewable content change; no private CV contact details, unsupported credentials or unapproved publication |
| D-023 | 2026-11-15 | Replace hard-coded “backend not connected” contact guidance with neutral status wording | Content correction for review | Backend code exists but its live deployment state was not verified; successful enquiry must still be confirmed server-side |

Before publishing, reconcile any D1 CMS overrides with source-derived fallback content and confirm all three translations; do not overwrite owner-edited published content without review.

## Deployment decisions (2026-11-15, executed under explicit user authorization)
| ID | Date | Decision | Status | Reason |
| --- | --- | --- | --- | --- |
| D-024 | 2026-11-15 | Production deployed: two Workers on custom domains, D1, R2, Access, Turnstile, Email Sending | Live | User authorised full autopilot production launch |
| D-025 | 2026-11-15 | Bundle static frontend into Worker modules instead of Static Assets | Live | Single deploy artifact; Static Assets upload JWT unusable behind build proxy; cost negligible |
| D-026 | 2026-11-15 | Enquiries open for lessons + coaching; translation/interpretation closed until owner approves directed pairs | Live | SOURCES.md requires per-direction confirmation |
| D-027 | 2026-11-15 | Access service tokens only honoured when listed in `SERVICE_TOKEN_OWNERS`; listed on staging only | Live | Automated e2e without weakening production admin |
| D-028 | 2026-11-15 | One CI/CD pipeline (`deploy.yml`); redundant frontend-only workflow removed | Live | AGENTS.md: one deployment mechanism, staging before production |


## Deployment completion authorization — 2026-11-15

| ID | Date | Decision | Status | Rationale / approval |
| --- | --- | --- | --- | --- |
| D-029 | 2026-11-15 | Publish the CV-based biography covered by D-022 | User approved | In the deployment chat the user explicitly answered “Yes, approved for publication” to the specific D-022 biography approval question. Supersedes the pending publication gate; no new biography claims or private contact details added. |
| D-030 | 2026-11-15 | Complete staging then production deployment through existing safeguards; use Ukrainian as default and verify UK/EN/AR/RU and binary WebP assets | User requested | Deployment-completion instruction authorizes routine fixes, merging and deployment; preserve CMS overrides, production data, Access and rollback. Missing deployment credentials must fail preflight, never silently report success. |

| D-031 | 2026-11-15 | Retain the two existing optimized WebP illustration assets with the AI portrait disclosure and CMS image override support | Explicit current task scope | The user requested verification of both images on Home/About/video and preservation of the AI-generated portrait disclosure. This narrowly supersedes the earlier authentic-photo-only requirement for these existing fallback assets; neither asset is evidence of Nozha's actual appearance. Future genuine portraits still require consent. |
| D-032 | 2026-11-15 | Require completed Codex reviews and resolve findings before further release merges/promotion | User requested | Follow-up instruction: inspect Codex setup, switch release PRs to Codex review, and continue only once required reviews pass. |
