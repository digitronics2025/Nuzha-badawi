# NUSYA Linguistic Studio — Frontend

Frontend-only implementation for the multilingual NUSYA website and separate administration UI. **Backend is intentionally reserved for a second AI agent.**

## What works

- 21 static, semantic, SEO-ready public pages (7 pages × 3 languages: `en`, `ar` RTL, `ru`).
- Cinematic Editorial Luxury visual design, restrained globe/flight-line graphics, responsive desktop/mobile layouts and reduced-motion support.
- On-demand Vimeo intro player (`1171310337`, hash `3416a6f4f5`) with no player requests before interaction.
- Language lessons, coaching, translation/interpreting, About, FAQs, contact forms and official external profiles.
- Service-aware form frontend now targets the implemented public Worker API in `../workers/public/src/index.js`; submission remains disabled and shows an honest error until domain, D1, Turnstile and service settings are configured.
- Separate admin UI for overview, content, translations, services, media/video, and enquiries; its secure D1/Access backend is implemented in `../workers/` but requires deployment and configuration.
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

## Source-implemented backend and deployment boundaries

See `../workers/README.md`, `../workers/docs/WORKER_API.md` and `../workers/docs/RELEASE_READINESS.md`. Cloudflare Workers, D1 migration, Access identity verification, Turnstile enforcement, durable enquiry storage/outbox, structured CMS and admin routes have now been **implemented and tested locally**. They are not yet configured or verified in Cloudflare.

## Scope boundaries and release gates

- Real Worker API, D1 schema, access verification and publishing source exist in `../workers/`; **no cloud resources are provisioned, no live email has been sent, and production deployment is unapproved.**
- The admin UI **must never be published openly**; create a separate protected Worker and verify Cloudflare Access and API authorization first.
- Frontend contacts do not falsely confirm delivery. The API is designed and locally tested to persist an enquiry before returning `201`; test again in Cloudflare staging.
- All professional claims, approved service availability, legal/privacy copy, translations, real photographs and the Vimeo embedding rights require owner approval before public launch.
- No fabricated person images, prices, reviews or certified-translation claims. No Korean content.
- Existing Preply students must continue using authorized platform bookings and payments.

## Next agent

Review `../workers/` and `docs/BACKEND_HANDOFF.md` before configuring any resources. The outstanding responsibility is authorized Cloudflare staging/production integration, security and billing approval, owner content approvals, and live end-to-end verification—not a second parallel backend implementation.
