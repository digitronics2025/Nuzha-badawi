# NUSYA Linguistic Studio

**Documentation-first website project for Nozha Badavi.**

This repository is the controlled source for the future NUSYA personal website, three-language content system, and secure owner-operated admin.

> **Current status:** initial repository documentation only. UI designs are not yet approved and no application, Cloudflare resources, database, or production deployment is claimed to exist. Do not treat architectural proposals as existing implementations.

## Required website features

- **Exactly three public UI languages:** English (`en`), Arabic (`ar`, RTL), and Russian (`ru`).
- Language lesson information for English, Russian and Arabic, with actual availability confirmed before public booking.
- Professional communication coaching, translation, and interpretation, restricted to approved capabilities and language directions.
- A prominent click-to-play Vimeo introduction video: `https://player.vimeo.com/video/1171310337?h=3416a6f4f5`.
- Authentic premium brand design, mobile-first accessibility and performance.
- Private admin dashboard for content, translations, services, media, video, customer enquiries, SEO, draft/preview/publish and rollback.
- Practical, secure, efficient hosting and minimal operational cost. **No Korean.**

## Documentation start points

| Read this | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Canonical agent instructions, approval and safety constraints |
| [CLAUDE.md](CLAUDE.md) | Claude Code instructions |
| [design.md](design.md) | Proposed design language and mandatory mockup gate |
| [Documentation index](docs/INDEX.md) | Full map of product, UX, content, architecture, data, security, admin, tests, operations and roadmap |
| [Decision register](docs/DECISIONS.md) | Approved vs proposed technical/product decisions |
| [Roadmap](docs/ROADMAP.md) | Ordered discovery, design approval and implementation phases |

## Non-negotiable design approval

Before coding **any** public or admin UI, the execution agent must inspect the current repository/UI, produce high-fidelity desktop and mobile mockups including Arabic RTL, present those mockups and **STOP** until the user explicitly approves. Approval of this README, architecture or strategy does **not** approve a design.

## Agent workflow

Read `AGENTS.md` and `docs/AI_WORKFLOW.md` → verify actual repository state → map requirements to files → propose mockups → obtain approval → implement and test → update docs/decisions → seek separate authorization for production or high-risk/costly actions.

## Ground truth

The updated professional CV and user-provided visuals support the content strategy, but public credentials, precise dates, translation pairs, booking rules, contact details, rights and current availability must be approved. Do not publish unverified private CV data. See [docs/SOURCES.md](docs/SOURCES.md).

## Development setup

Not documented yet because the repository did not contain a verified application at bootstrap. When an implementation is approved, add the actual package manager, scripts, environment variables **names only**, local test instructions, build/deploy instructions and operational runbook updates. Never invent commands or credentials.

## Production domain and Cloudflare plan (not deployed)
- **Registered domain (user's Cloudflare dashboard screenshot):** `nozha-badavi.com`. Registration is confirmed visually; active DNS zone, SSL and Workers deployment are **not** confirmed.
- Planned canonical site: `https://nozha-badavi.com`; planned protected admin: `https://admin.nozha-badavi.com`; `www` redirects to apex when authorised.
- Proposed Cloudflare implementation: a public Worker + separately Access-protected admin Worker, D1 for content/enquiries, R2 **only if** admin media uploads require it, Turnstile and a cost-reviewed email transport. Actual resources do not exist as far as this documentation can verify.
- Read [Cloudflare deployment and domain blueprint](docs/CLOUDFLARE_DEPLOYMENT.md) and [full execution plan](docs/PLAN-nusya-multilingual-studio.md) before provisioning anything. The high-fidelity desktop/mobile design approval gate remains mandatory.
