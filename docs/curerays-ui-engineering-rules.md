# CureRays UI Engineering Rules

This is a must-read before designing UI or writing UI code in CureRays CRMS.

## Working Intent

CureRays CRMS is a clinical workflow tool for older clinic staff and radiation oncology operations. UI work must reduce cognitive load, keep the next action obvious, and preserve the patient-course mental model. Prefer calm, utilitarian clinical surfaces over decorative layouts.

## Token-First Styling

- Read `app/globals.css` before creating visual styles.
- Use CSS custom properties and shared classes for colors, spacing, radii, modal sizing, action widths, file pickers, section navs, and badge/pill treatments.
- Do not hardcode hex values, ad hoc Tailwind palette colors, translucent status pills, or one-off rounded badge styles in components.
- Add or extend tokens/classes when a visual pattern will recur.
- Stay inside the CureRays palette: brand primary, accent, clinical neutrals, and status tokens.

## Component Rules

- Use primitives from `components/ui/` and composites from `components/shared/` before creating new UI.
- Keep modals stable: fixed header/footer zones, scrollable body, consistent action widths, and no layout jump between steps.
- Use full-width patient workspace content; do not reintroduce right rails.
- Prefer history/review first, then action. Creation forms should be intentional, not the first visual object users see.
- For older staff, group fields by task meaning, use plain labels, avoid hidden required information, and keep controls large enough to scan.

## Code Quality

- Keep components small enough to understand and avoid duplicate field groups or divergent style maps.
- Put reusable business logic in services/store helpers, not page components.
- Preserve PHI-safe behavior: no raw PHI logs, no patient-identifying query strings, and no uploaded file retention unless a production storage policy exists.
- Update `docs/curerays-system-progress-tracker.md` whenever Codex changes user-facing workflow, readiness, guardrails, or major implementation status.

## Pre-Mortem Checks

Before finishing UI work, ask:

- Could an older staff user tell what to review first?
- Are required fields visibly grouped and validation-gated?
- Does any label confuse system IDs with official clinic MRNs?
- Did I reuse tokens/components instead of creating a local visual fork?
- Did I update docs/tracker if workflow behavior changed?
