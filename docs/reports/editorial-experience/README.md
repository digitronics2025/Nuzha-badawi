# Editorial website and protected admin experience

This change implements the current chat's complete redesign plan under D-035/D-036. The user explicitly requested full autopilot after being told about the visual approval gate. Reference designs were generated before transfer into application source; **individual mockup approval is not claimed**.

## Problems and resulting behavior

- Mobile lesson descriptions were 11px, interface glyphs depended on system fonts, several labels were untranslated, and Arabic missing routes rendered Ukrainian. Shared local typography, readable cards, SVG action icons and localized errors address these issues.
- The homepage repeated decorative sections. Its service guide now explains the four service categories and enquiry inputs, followed by three offered lesson languages, an approved experience timeline and the next-step process.
- Connected admin screens retained prototype claims, ungrouped fields and a fabricated “Live” publication count. The workspace now shows actual revision/review state, grouped editing, English-source comparison, persistent errors, scoped unsaved changes, readable enquiries and audit-backed publication information.
- Private media upload and consent publication are separate. Existing page settings, availability, media overrides, signed identity checks, conflicts and production/staging boundaries are preserved.

## Inspectable designs and state coverage

Generate the complete offline gallery:

```sh
python3 frontend/tests/design_capture.py --output /tmp/nusya-design
```

The initial reference package contains 90 full-page boards: all seven public page types plus 404 in four locales at 1440/390px; all seven admin views; English/Arabic/Russian editor adaptations; publication history, conflict and connection-error states. Admin data is synthetic and proves no production login. CI retains the gallery and accessibility JSON as `nusya-experience-evidence`; open `index.html` or individual PNG boards. Selected before/after screenshots:

| Surface | Before | After |
| --- | --- | --- |
| Ukrainian desktop home | [Before](images/before-home-desktop.png) | [After](images/after-home-desktop.png) |
| Ukrainian mobile home | [Before](images/before-home-mobile.png) | [After](images/after-home-mobile.png) |
| Admin overview (synthetic data) | [Before](images/before-admin-desktop.png) | [After](images/after-admin-desktop.png) |

[The initial reference manifest](reference-manifest.json) records 90 boards. The final gallery also includes form loading/validation/retry/success, empty/sign-in/video states, seven timed motion frames, reduced motion and visible focus, plus a full-size PDF package.

The gallery is a review artifact, not a deployment or an assertion of visual sign-off. Final implementation refines contrast, poster fallback visibility, grouped-field labels and source-safe metadata while retaining the selected composition.

## Motion and responsive contract

| IDs | Behavior | Reduced-motion / unavailable-feature fallback |
| --- | --- | --- |
| M01–M05 | Stable header; fine-pointer desktop gets 640ms hero/portrait and one 900ms route reveal; clickable actions from first paint | Complete static text, illustration, actions and route; touch devices skip decorative entrances |
| M06–M10 | Evidence stays visible; fine-pointer desktop gets one-shot 420ms visible section entrances; bounded card/underline feedback | Static content, focus indication and links |
| M11 | Native page navigation; no animation framework or custom transition dependency | Ordinary navigation |
| M12–M14 | 220ms menu/FAQ feedback, 160ms conditional-field fade, durable-reference confirmation | Instant controls and persistent text |
| M15–M16 | Immediate admin state feedback; 180ms mobile sidebar; no animated counters | Instant states and sidebar |

Arabic reading flow uses logical properties and bidi-safe fields, without mirroring people or artwork. Infographics are semantic HTML lists/descriptions, with visible text independent of JavaScript. Critical errors persist; success notices do not stand in for server acknowledgement. Desktop/mobile, 320/768px stress layouts and zoom-equivalent checks are included in browser verification.

## Validation and release

Local verification: 19 frontend/SEO tests, 33 Worker tests and migration checks passed. The responsive regression runner passed 112 routes, and the expanded runner passed 78 WCAG audits with zero reported violations plus its synthetic owner workflows. Native Worker rendering and both dry-run bundles passed; final current-head CI and controlled staging/release evidence are tracked in the pull request. Performance measurements are reported separately when completed. Required checks include frontend/SEO tests, Worker/migration tests, native HTMLRewriter/D1, 112 responsive route regressions, 78 responsive axe audits and protected-workflow browser checks. Axe is a development dependency only. Automated accessibility checks and semantic/keyboard inspection do not constitute a full manual screen-reader certification.

The existing deployment pipeline remains the sole rollout mechanism, as required by the user's plan: isolated staging writes precede promotion, production receives a recovery bookmark, and current-head review must be complete. No new resources, credentials, DNS or service directions are introduced. A protected, paginated media library fixes the review finding about uploads stranded between sessions; its additive index migration preserves existing media and consent. Existing published CMS fields take precedence; new missing fields use source defaults. Code rollback uses the prior public/admin Worker versions; content rollback remains restricted to eligible published revisions.

Review also tightened translation provenance: non-English approval requires the displayed English source revision (or explicit null before any English draft exists). Older request shapes fail validation instead of implicitly approving a newer, unseen source. Staging verifies this required contract; older open admin tabs must reload before approving.
