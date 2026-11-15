# Evidence, Public-Content Approval & Asset Provenance

## Editorial redesign provenance — 2026-11-15

The service guide explains existing services and enquiry inputs; it adds no prices, availability promises, proficiency claims, testimonials or translation directions. Timeline and process fields reuse the existing D-029 biography and workflow copy. The two optimized illustration files remain byte-identical; the fallback portrait's accessible name includes its localized AI disclosure. Approved CMS portraits/posters retain precedence and full poster framing. Localized poster labels are interface descriptions, not invented video captions or transcripts.

Cormorant Garamond, Manrope and IBM Plex Sans Arabic are served locally as unmodified Google Fonts WOFF2 subsets. OFL notices accompany the files; source URLs, byte sizes and hashes are in [font-sources.json](reports/editorial-experience/font-sources.json). There are no runtime font-provider requests. The concurrent D-034 icon/sharing-card update is preserved.

This register separates **source-documented**, **approved**, and **unverified** claims. It does not itself authorize publication.

## Supplied source inventory
- Original logo (script wordmark, globe and aircraft), warm-gold promotional collage, previous CV screenshot and Instagram/Preply QR images.
- Updated PDF: `Nozha_Badavi_CV_изменён.pdf` (one page, supplied by the user); source of newer biography, education and career descriptions.
- Two LinkedIn screenshots of the Cyrillic-named profile: management headline, university, Ukraine location, About paragraph referencing language teaching and early-childhood education in Sweden.
- Instagram: `https://www.instagram.com/nusyabadavi` (supplied by user; do not assume its current content was audited).
- Preply tutor identifier `522376` (verify current canonical booking link, rules, availability and permissions).
- Vimeo player URL: `https://player.vimeo.com/video/1171310337?h=3416a6f4f5` (verify domain embed, owner consent, playback and subtitles).
- User-approved discussion and `PLAN-nusya-multilingual-studio.md` planning artifact (separate from repository; may not be present here).
- LinkedIn screenshot URL in Cyrillic script; confirm actual link before publishing.

## Claim ledger (never silently resolve conflicts)
| Claim | Evidence | Website disposition |
| --- | --- | --- |
| NUSYA Linguistic Studio / Nozha Badavi | Logo, newer CV | Use as provisional public identity; owner approves localized spellings |
| Teaches English, Russian and Arabic | New CV + LinkedIn About | Source-documented; confirm services open for new students |
| Personalized lessons; presentations, meetings, speeches, conferences | New CV | Supported experience; confirm current offers before activating CTAs |
| Language knowledge: English, Russian, Arabic, Ukrainian; Swedish beginner | New CV | Ukrainian is **not** a taught language by default; no Swedish service |
| GoSchool English teacher; Mozhlyvist Arabic teacher | New CV | Verify role, spelling and dates before publication |
| ABC All About Children English Preschool 2023–2026 | New CV | Earlier CV had different end date; reconcile; work with ages 1–6 does not imply online lessons for toddlers |
| Migration-service interpreter 2021–2022 | New CV | Historical work only; confirm present professional service scope |
| Alsafir Group manager/translator 2019–2022 | New CV | LinkedIn headline says manager; reconcile current-vs-former status |
| Translation among Ukrainian, English, Russian, Arabic | New CV historical role | Confirm **each allowed directed pair**, categories and availability; no certified/sworn claim |
| Luhansk Taras Shevchenko National University English programme 2019–2021; communication/language studies 2013–2018 | New CV | Validate precise degree/awards and education chronology |
| Swedish early-childhood work | LinkedIn About screenshot and new CV context | Confirm country, role and current location |
| Student reviews/Preply statistics | External platform, time-dependent | Do not hardcode volatile stats; use attributable approved reviews only |
| Prices, availability, credentials, legal translation, client success rates, office location | Not established | Omit until approved/verified |
| Korean lessons or language | Explicit user rejection | **Never publish or propose** |

## Private data policy
Original CVs may include personal phone/email/address. Do **not** commit those originals to a public repo or copy personal contact details into site content without explicit consent. Public contact channels, location, portrait/photo permissions and video rights require approval. Never save customer data in documentation.

## Publishing checklist for every claim or asset
1. Record the source, date inspected and precise claim.
2. Identify discrepancies; ask Nozha/owner to resolve before publishing.
3. Confirm current availability, price, location, permitted language pairs and any legal qualifications.
4. Record user approval and approved wording/locale variants.
5. Confirm portrait/media ownership or license, testimonial consent and attribution.
6. Approve publication; mark revisits for time-sensitive details.

Maintain an internal approval record outside public documentation if it contains private information. Never invent proofs or claim these approvals already exist.

## Cloudflare domain evidence (user-supplied, 2026-11-15)
The user provided a screenshot of Cloudflare Dashboard > Domains > Registrations showing **`nozha-badavi.com`** with a green check and “Your domain is ready.” This supports **domain registration** and the chosen spelling only; it does **not** verify zone activation, nameservers, DNS records, SSL certificate, ownership permissions, email routing, Workers or a live application. Public canonical choice is `https://nozha-badavi.com` (planned). The agent must separately inspect Cloudflare after authorisation and record evidence before deployment. Never expose Cloudflare account IDs, API keys or private records in this public repository.

## Updated CV re-review and content synchronization — 2026-11-15

The user supplied a revised, one-page CV named `Nozha_Badavi_CV_изменён(1).pdf` for review. The document was **read as a source only and was not added to the public repository**. Its updated details are reflected in the content-review branch across EN/AR/RU copy and the generated Worker fallback manifest, **not automatically approved or deployed**.

### Source-documented profile details
- English, Russian and Arabic tutoring: Preply and private practice; Russian teaching for international students in Ukraine and online.
- English language teacher at GoSchool (Ukraine); Arabic language teacher at Mozhlyvist (Ukraine). The CV does **not** specify dates for these positions.
- Preschool teacher at ABC All About Children English Preschool, **2023–2026**, supporting children aged **1–6**. This historical experience does not itself mean lessons for children aged 1–6 are currently bookable.
- Interpreter at the Migration Service, **2021–2022**, assisting conversations and interviews with foreign applicants.
- Manager and translator at Alsafir Group (Educational Services), **2019–2022**, supporting university registration, enquiries and translation involving Ukrainian, English, Russian and Arabic.
- Education: Language and Literature (English), Pedagogue *educational programme* at Luhansk Taras Shevchenko National University **2019–2021**, plus Faculty of Communication Science and Language studies **2013–2018**. The CV does not give enough detail to assert a specific awarded degree for each period.
- Professional coaching: preparation for business meetings, conferences, presentations, public speaking and subject-specific communication.
- Languages in the CV: English, Russian, Arabic, Ukrainian; Swedish at beginner level. Not all of these languages are currently offered as lessons.

### Outstanding contradictions and explicit publication checks
1. The earlier CV image described preschool employment ending in 2024; the updated CV says **2026**. Confirm the correct period with Nozha.
2. LinkedIn headline describes Alsafir Group as a manager role while the CV indicates **2019–2022**; confirm whether this remains current.
3. Confirm university awards/precise school affiliation for 2013–2018, and the public naming/spelling of Nozha.
4. Confirm current bookable languages/ages/formats, approved directed translation pairs, interpretation location/modes and whether any special certification exists. No unsupported certification or current service claim is published automatically.
5. Confirm public-use rights for CV facts, photos/video/testimonials, and an approved business contact address and privacy policy. **CV personal email and phone numbers remain excluded.**
6. When connecting an existing D1-backed admin CMS, compare its published overrides and review status against the newly prepared static fallback copy; old published D1 revisions may supersede new source content. Never silently replace owner-edited content.

**Release rule:** Treat the new profile copy as a proposed, source-documented update until Nozha explicitly approves the public wording, chronological discrepancies and each locale's translation. Preserve the previous published revision and provide an admin preview or staging link before going live.


**Publication approval update (2026-11-15):** the user explicitly approved the specific CV-based biography for publication in the deployment-completion chat (“Yes, approved for publication”; decision D-029). This clears the release rule for the existing copy. Preserve CMS overrides and the exclusions of private contact data and unsupported claims.

## Review hardening — 2026-11-15

Review-hardening implementation: the owner authorized autonomous decisions and approved desktop/mobile/RTL fix mockups in chat. The latest main instruction D-031 requires preserving the two optimized illustration assets, localized AI disclosure and CMS media overrides. This candidate retains those illustrations without describing them as authentic photographs. Privacy wording uses implemented processor facts and the existing notification inbox; no new biography, credentials or jurisdiction claims were added.
