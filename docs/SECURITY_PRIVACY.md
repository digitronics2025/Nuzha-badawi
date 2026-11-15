# Security, Privacy and Content Safety Requirements

## Information classification
- Public only: approved site content, consented image/video, verified facts and booking links.
- Private: customer enquiries, admin drafts/revisions (until published), reviewer information, provider credentials, access logs.
- Highly sensitive: client documents and CV personal contacts. Do not publish, commit or expose; MVP excludes uploads of customer documents.
- Public GitHub repository must contain **no real secrets or private CV/contact data**.

## Risks to prevent
Auth bypass/privilege escalation, XSS from rich text/media, CSRF, SSRF from URL fetching, broken link redirects, SQL injection, oversized/spam submissions, brute force, resource abuse, accidental draft publication, CDN caching private responses, leaked PII in logs, unsafe public file uploads, and fake qualifications/testimonials.

## Mandatory controls
- Managed authentication + MFA where feasible, allowlisted owner, server-verifiable identity and per-action authorization; no default passwords.
- HTTPS, secure headers, strict but functional CSP (including required Vimeo iframe domain), safe cookies/session lifecycle and CSRF/origin checks for writes.
- Schema allowlists for editor content, HTML escaping/sanitized rich-text subset, strict validated URLs and approved media providers. No arbitrary script/iframe snippets.
- Server-side form validation, Cloudflare Turnstile token validation where chosen, rate limits, payload bounds, idempotency and duplicate protection; fail securely.
- Parameterized DB access; scoped query permissions, indexes and pagination; never expose D1 bindings to browser bundles.
- Media license/consent recorded, file MIME/magic-byte and size limits; avoid unsanitized SVG; private buckets for private material.
- Admin, drafts, previews, private enquiries and auth callbacks use no-store and noindex where applicable; no PII in analytics, URLs, or error logs.
- Build-time and runtime secrets kept in authorized secret stores; never logged, committed, inserted into browser artifacts or copied into docs.

## Legal/content constraints
Verify current operating jurisdiction and data processors. Publish accurate privacy disclosures, retention, user access/deletion request routes and cookie/third-party disclosures; do not invent GDPR applicability or legal language. Never promote certified/sworn translation without authorization. Protect children: parent/guardian contact flow, minimum necessary information, no unsupervised minor account.

## Data lifecycle
Define retention, export/deletion, backup and encryption practices with owner/legal review. Log enough audit metadata for accountability but not enquiry content. Test restore using synthetic data. All destructive actions need safe confirmation and recovery where feasible.

## Release blockers
Admin/API unauthenticated access, personal information leaking publicly, unapproved public credentials/photo, public drafts, untested deletion/migration, secrets in source, failed form protection, high/critical security finding or missing recovery procedure.

## Cloudflare custom-domain threat model
Intended canonical website: `https://nozha-badavi.com`; administrative interface: `https://admin.nozha-badavi.com`. Registrar screenshot verifies registration only, not certificates, zone status, Access or security controls. Before launch check correct Cloudflare account, zone, DNS/CAA/MX, SSL certificate, www redirect, CORS, CSP and expected hostname routing. Do not leave admin accessible via `workers.dev` or previews that bypass Access. Protect entire admin hostname via Access and **independently validate signed identity and roles on every admin API**. Cache public published HTML only; private previews, responses and enquiries use no-store/noindex. Scope Worker service permissions and D1/R2 bindings minimally. Never put tokens, live account IDs, screenshots with private account information, email details or customer PII in public repo. Distinguish Email Routing from outbound email. No real infrastructure action without separate approval. See `CLOUDFLARE_DEPLOYMENT.md`.
