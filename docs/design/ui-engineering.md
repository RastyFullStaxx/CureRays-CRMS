# CureRays UI Engineering Rules

This is a must-read before designing UI or writing UI code in CureRays CRMS.

## Working Intent

CureRays CRMS is a clinical workflow tool for older clinic staff and radiation oncology operations. UI work must reduce cognitive load, keep the next action obvious, and preserve the patient-course mental model. Prefer calm, utilitarian clinical surfaces over decorative layouts.

## Token-First Styling

- Read `app/globals.css` before creating visual styles.
- Read `docs/design/typography.md` before changing text, controls, tables, charts, or headings.
- Read `docs/design/color-system.md` before changing colors, statuses, badges, charts, progress, or selection treatments.
- Use CSS custom properties and shared classes for colors, spacing, radii, modal sizing, action widths, file pickers, section navs, and badge/pill treatments.
- Use only the shared Inter typography roles. Do not add page-local font sizes, families, weights, leading, tracking, or arbitrary Tailwind text utilities.
- Do not hardcode hex values, ad hoc Tailwind palette colors, translucent status pills, or one-off rounded badge styles in components.
- Add or extend tokens/classes when a visual pattern will recur.
- Stay inside the CureRays palette: primary for interaction, accent for brand artwork, clinical neutrals, and the positive/intermediate/negative/neutral status tokens.
- Status text must use `Badge`, `StatusBadge`, or `clinical-pill` tone classes. Do not create translucent rounded status pills in page code.
- Phases, diagnoses, roles, disciplines, modalities, categories, and record types are neutral. Do not assign categorical colors.
- Charts use semantic tones only for valenced data. Non-valenced series use primary and neutral treatments.

## Component Rules

- Use primitives from `components/ui/` and composites from `components/shared/` before creating new UI.
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
