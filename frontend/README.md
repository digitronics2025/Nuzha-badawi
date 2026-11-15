# NUSYA Linguistic Studio — Frontend

Frontend-only implementation for the multilingual NUSYA website and separate administration UI. **Backend is intentionally reserved for a second AI agent.**

## What works

- 21 static, semantic, SEO-ready public pages (7 pages × 3 languages: `en`, `ar` RTL, `ru`).
- Cinematic Editorial Luxury visual design, restrained globe/flight-line graphics, responsive desktop/mobile layouts and reduced-motion support.
- On-demand Vimeo intro player (`1171310337`, hash `3416a6f4f5`) with no player requests before interaction.
- Language lessons, coaching, translation/interpreting, About, FAQs, contact forms and official external profiles.
- Service-aware form frontend targeting a documented API; error states remain truthful when the backend does not exist.
- Separate admin UI preview for overview, content, translations, services, media/video, and enquiries. Editing previews are in memory only.
- Metadata, canonical/hreflang, sitemap, favicon, OG imagery, accessibility-focused navigation.

## Build & preview

Requirements: Python 3.10+; Node.js 20+ only for the convenient npm scripts. **No npm dependencies.**

```bash
npm run build
npm test
npm run preview:public  # localhost:4173/en/
npm run preview:admin   # another terminal: localhost:4174/
```

The repository's earlier plan preferred Astro/Tailwind if the repo started empty. Because network package installation was unavailable during this frontend execution and the site has very limited dynamic needs, I chose a **zero-dependency static-site generator** using Python's standard library, semantic HTML, CSS and small ES modules. This avoids runtime framework overhead and is directly compatible with Cloudflare Workers Static Assets. A future backend agent may adopt Astro only after a documented evidence-based cost/maintainability decision; the existing URL structure and API handoff are designed to remain stable.

## Structure

| Path | Role |
| --- | --- |
| `scripts/build.py` | Pre-renders public HTML, sitemap, metadata and separate admin UI preview |
| `src/content/site_copy.py` | Editable EN/AR/RU content catalogue |
| `src/assets/site.css`, `site.js` | Public design and progressive interaction |
| `src/assets/admin.css`, `admin.js` | Admin demonstration frontend |
| `src/admin.html` | Backend-disconnected admin UI prototype |
| `types/api.d.ts` | Backend API request/response contracts |
| `docs/BACKEND_HANDOFF.md` | Backend agent's scope, security, workflows and acceptance |
| `tests/test_build.py` | Static generation, metadata, safety and completeness checks |
| `tests/browser_qa.py` | Chromium visual and interaction QA (isolated page rendering) |
| `dist-public/`, `dist-admin/` | Generated outputs, deliberately not committed |

## Scope boundaries and release gates

- **No real auth, D1, email, media storage, API, content persistence, Cloudflare Worker or deployment** is implemented.
- The admin UI **must never be published openly**; create a separate protected Worker and verify Cloudflare Access and API authorization first.
- Frontend contacts do not falsely confirm delivery. The API must persist an enquiry before returning `201`.
- All professional claims, approved service availability, legal/privacy copy, translations, real photographs and the Vimeo embedding rights require owner approval before public launch.
- No fabricated person images, prices, reviews or certified-translation claims. No Korean content.
- Existing Preply students must continue using authorized platform bookings and payments.

## Next agent

Read `docs/BACKEND_HANDOFF.md` and `types/api.d.ts`, then implement backend services without redesigning the public frontend. Use the user's separately approved Cloudflare plan and mandatory production/security authorization gates.
