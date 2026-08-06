# CureRays UI Engineering Rules

This is a must-read before designing UI or writing UI code in CureRays CRMS.

## Working Intent

CureRays CRMS is a clinical workflow tool for older clinic staff and radiation oncology operations. UI work must reduce cognitive load, keep the next action obvious, and preserve the patient-course mental model. Prefer calm, utilitarian clinical surfaces over decorative layouts.

The repository now has two surfaces. Know which one you are in:

| Surface | Audience | Fonts | Layout |
|---|---|---|---|
| `app/(app)/**` + `app/login` | Clinic staff | Inter, `--type-*` | Desktop and laptop only |
| `app/(site)/**` | Patients and referrers | Site pairing, `--site-*` | Responsive 390 to 1920 |

Rules below apply to both unless a row says otherwise. See [`../architecture/public-site.md`](../architecture/public-site.md) for the public site's decision record.

## Laws We Design By

Apply these six every time. Each is bound to a rule you can check, not a slogan.

**Jakob — people spend most of their time on other sites.** The public site behaves like a clinic site: logo top-left routing home, phone top-right, navigation ordered Treatments / Conditions / Services / About / Contact, address and phone in the footer. The authenticated app behaves like the app staff already know. Do not invent an interaction pattern where a conventional one exists.

**Fitts — target size and distance decide effort.** Public calls to action are at least 48px tall and span the full column on a phone; the telephone link is the largest target on every page. Interactive rows and disclosure summaries are at least 44px. Destructive admin actions stay small and physically separated from the controls beside them, so proximity never causes a mis-click.

**Miller — working memory is small.** Five primary destinations, no more; a guardrail asserts the count. Group related items in threes to fives. Long inventories — twelve conditions, nine modalities — are chunked and labelled rather than presented as one flat wall.

**Hick — more choices cost more time.** One primary action per section, with at most one secondary beside it. No navigation dropdowns. The conditions list opens as titles only and reveals detail on demand, so scanning stays cheap.

**Proximity — spacing is grouping.** Let the `--space-*` scale carry the relationship. A label sits nearer its field than the next group; a caption binds to its figure; a section heading sits nearer its own content than the section above. Never use a border to say something spacing already says.

**Tesler — complexity is conserved.** Irreducible complexity belongs with the system, not the reader. Nine modalities get a full page instead of a mega-menu. Fraction and prescription arithmetic is computed, never asked of the user. The authenticated app keeps its dense tables because the clinical work is genuinely dense — simplifying that would move the load onto staff.

## Token-First Styling

- Read `app/globals.css` before creating visual styles.
- Read `docs/design/typography.md` before changing text, controls, tables, charts, or headings.
- Read `docs/design/color-system.md` before changing colors, statuses, badges, charts, progress, or selection treatments.
- Use CSS custom properties and shared classes for colors, spacing, radii, modal sizing, action widths, file pickers, section navs, and badge/pill treatments.
- Use only the shared typography roles — `type-*` in the app, `site-*` on the public site. Do not add page-local font sizes, families, weights, leading, tracking, or arbitrary Tailwind text utilities.
- Do not hardcode hex values, ad hoc Tailwind palette colors, translucent status pills, or one-off rounded badge styles in components.
- Add or extend tokens/classes when a visual pattern will recur.
- Stay inside the CureRays palette: three brand families (ink, bone, and the muted brand hue) plus the positive/intermediate/negative/neutral status tokens. There is no accent token; it was retired with the three-color brand system.
- Anything pasted from the shadcn registry must be retokenized onto CSS custom properties before it will pass `npm run verify`. See [`../architecture/public-site.md`](../architecture/public-site.md) for the rewrite table.
- Status text must use `Badge`, `StatusBadge`, or `clinical-pill` tone classes. Do not create translucent rounded status pills in page code.
- Phases, diagnoses, roles, disciplines, modalities, categories, and record types are neutral. Do not assign categorical colors.
- Charts use semantic tones only for valenced data. Non-valenced series use primary and neutral treatments.

## Component Rules

- Use primitives from `components/ui/` and composites from `components/shared/` before creating new UI. Public-site pieces live in `components/site/`.
- `Modal` serves the authenticated clinical surfaces; `Sheet` serves the public site. Do not cross that boundary.
- Keep modals stable: fixed header/footer zones, scrollable body, consistent action widths, and no layout jump between steps.
- For large clinical edit/review modals, use the largest appropriate shared modal token and rebalance fields into grouped sections before accepting unnecessary scrolling.
- Any scrollable modal body, tab panel, table wrapper, list, or workspace region must use the shared styled scrollbar behavior (`scrollbar-soft` or the shared modal body scrollbar rules).
- Use full-width patient workspace content and do not reintroduce right review rails. A compact left patient-context and workspace-navigation sidebar is allowed at 1280px and wider when the page remains the sole vertical scroll owner and dense content retains horizontal overflow.
- Use the Mac-style app shell for primary navigation: one glass top command bar with patient/MRN/course/action search, account controls, and the few global destinations. Do not reintroduce the legacy sidebar or bottom Dock.
- Keep command-bar-safe top spacing and internal scroll containment for long pages so fixed chrome never covers clinical controls or table rows.
- Prefer history/review first, then action. Creation forms should be intentional, not the first visual object users see.
- For older staff, group fields by task meaning, use plain labels, avoid hidden required information, and keep controls large enough to scan.

## Code Quality

- Keep components small enough to understand and avoid duplicate field groups or divergent style maps.
- Put reusable business logic in services/store helpers, not page components.
- Preserve PHI-safe behavior: no raw PHI logs, no patient-identifying query strings, and no uploaded file retention unless a production storage policy exists.
- Update `docs/status/current-state.md` when verified user-facing capability or readiness changes. Update `docs/roadmap/implementation-roadmap.md` when remaining scope or ordering changes.

## Pre-Mortem Checks

Before finishing UI work, ask:

- Could an older staff user tell what to review first?
- Are required fields visibly grouped and validation-gated?
- Does any label confuse system IDs with official clinic MRNs?
- Did I reuse tokens/components instead of creating a local visual fork?
- Did I update docs/tracker if workflow behavior changed?
- Did I check the change against all six laws above, not just the one that prompted it?
- On the public site: does it hold at 390px with no horizontal overflow, and is every claim one the clinic actually publishes?
