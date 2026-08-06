# CureRays Typography Style Guide

This guide is the source of truth for typography across CureRays CRMS. It applies to authenticated pages, login, shared components, tables, forms, charts, canvas labels, modals, loading states, and errors.

## Two Scoped Systems

There are exactly two type systems, and they never mix.

| Surface | Faces | Scale | Loaded by |
|---|---|---|---|
| `app/(app)/**`, `app/login`, all shared components | Inter | `--type-*`, fixed 12/13/14/18 | `next/font/google` in `app/layout.tsx` |
| `app/(site)/**` | Roboto | `--site-*`, fluid `clamp()` | `next/font/google` in `app/(site)/layout.tsx` |

The site face is exposed as a CSS variable on the site root element only. Custom properties descend, so the authenticated app cannot inherit it.

On the public site, hierarchy is carried by **weight**, not by a contrast of form: 700 at display and heading sizes, 500 for emphasis, 400 for reading. `--font-site-display` and `--font-site-text` remain separate tokens even though both resolve to Roboto today, so a distinct display face can be introduced later without editing every rule that consumes them.

Pick a face whose licence permits redistribution in a public repository — anything on Google Fonts qualifies. See [`../architecture/public-site.md`](../architecture/public-site.md) for the two faces rejected on licence grounds.

Components must inherit their surface's family. Do not import another typeface or declare `font-family` in page or component code.

`globals.css` holds exactly three `font-family` declarations, in this order, and `scripts/typography-guardrails.mjs` asserts it:

1. `html` — `var(--font-ui)`
2. `.site-page` — `var(--font-site-text), var(--font-ui)`
3. `.site-display, .site-headline, .site-wordmark strong, .site-panel-name, .site-figure-value, .site-section[data-tone="brand"] .site-contact-primary` — `var(--font-site-display), var(--font-site-text)`

Adding a fourth is a deliberate act that must update that assertion.

The `--font-site-*` tokens carry inline `var()` fallbacks, and that is load-bearing: `var(--undefined)` with no fallback makes the whole declaration invalid at computed-value time, and the element silently inherits Inter instead.

## Product Type Scale

| Role | Token and class | Size / line height | Weight | Use |
|---|---|---:|---:|---|
| Title | `--type-title-*`, `type-title` | 18px / 24px | 700 | Page title, patient identity, critical KPI |
| Heading | `--type-heading-*`, `type-heading` | 14px / 20px | 600 | Section, modal, and card titles |
| Body | `--type-body-*`, `type-body` | 13px / 19px | 400 | Prose, table cells, and form values |
| Supporting | `--type-label-*`, `type-supporting` | 12px / 16px | 400 | Navigation, controls, metadata, helper copy, status, and chart labels |

Use `type-body-strong` for 13px/500 functional emphasis. Use `type-button` and `type-label` for 12px/600 controls, structured labels, table headers, and status pills. Use `type-meta` for muted 12px/500 metadata.

## Weight Discipline

- Use 400 for ordinary records, explanations, descriptions, and supporting copy.
- Use 500 for metadata and values that need modest scan emphasis.
- Use 600 for section headings, field labels, table headers, controls, buttons, and status pills.
- Use 700 only for page titles, patient identity, and critical KPI values.
- Do not use 800 or compensate for weak hierarchy with blanket bold text.

## Component Mapping

- Buttons are always 12px/600. Small buttons change height and padding, not typography.
- Inputs, selects, and textareas are 13px/400.
- Table headers are 12px/600; table cells are 13px/400.
- Badges and status pills are 12px/600.
- Modal and card titles are 14px/600.
- Empty-state titles are 14px/600; descriptions are 12px/400.
- Login follows the same product scale and has no display-size exception. It is an authenticated surface, not a marketing one.

## Public Site Type Scale

Fluid roles for `app/(site)/**` only. Every size is a `clamp()`, so the site has no breakpoint-driven type steps.

| Role | Class | Size | Line | Use |
|---|---|---|---|---|
| Display | `site-display` | `clamp(2.5rem, 6vw, 4.5rem)` | 1.05 | One per page, the hero heading |
| Headline | `site-headline` | `clamp(1.75rem, 3.4vw, 2.75rem)` | 1.15 | Section headings |
| Subhead | `site-subhead` | `clamp(1.25rem, 1.8vw, 1.5rem)` | 1.3 | Card and item titles |
| Lead | `site-lead` | `clamp(1.0625rem, 1.3vw, 1.25rem)` | 1.6 | Section introductions |
| Body | `site-body` | 1rem | 1.65 | Prose |
| Label | `site-label` | 0.875rem | 1.3 | Navigation, tags, metadata |
| Eyebrow | `site-eyebrow` | 0.875rem | 1.3 | Section kicker above a heading |

Public body text starts at 16px because it is read by patients on their own devices, not by staff scanning dense operational tables.

Tracking is permitted **only** through `--site-display-tracking` and `--site-headline-tracking`, and only on those two roles. A geometric sans set at 4.5rem opens up and needs tightening that the product scale never does. The guardrail rejects every other `letter-spacing`.

Prose is capped at `--site-measure` (68ch). Do not set a wider measure.

## Charts and Numeric Data

Use `lib/ui-typography.ts` when a visualization library requires numeric font values. Axis, legend, node, and compact chart labels use 12px; tooltip content uses 13px. Resolve the family from the computed global font token.

Use tabular figures where changing digit widths would make comparison harder. Reduce tick density, add chart margins, wrap labels, or allow contained horizontal scrolling instead of shrinking text.

There are no numeric font-size exceptions in `globals.css`. (The former `.dashboard-phi-link-label` / `.dashboard-phi-node text` SVG viewBox-coordinate exception was retired along with the PHI boundary graph.)

## Accessibility

- Functional UI text must render at 12px or larger.
- Preserve browser zoom and verify the interface at 200%.
- Prefer wrapping or contained overflow over smaller text.
- Do not use color or font weight as the only status signal.
- Keep long prose near 65–75 characters per line.
- Structural UI copy uses source-level Title Case. Do not use CSS text transforms.

## Title Case

Use Title Case for developer-owned headings, navigation, tabs, buttons, action links, field labels, table headers, filter labels, KPI labels, and enum-derived status labels. Keep short articles, conjunctions, and prepositions lowercase unless they begin or end the label.

Preserve sentence case for descriptions, instructions, placeholders, alerts, validation messages, loading copy, and activity sentences. Never transform patient names, diagnoses, clinician notes, protocol names, document titles, identifiers, or other dynamic clinical content. Preserve canonical acronyms and product names such as CureRays, CRMS, PHI, MRN, IGSRT, eCW, CPT, OTV, and cGy.

## Prohibited Patterns

- Tailwind `text-xs` through `text-9xl` utilities in application code.
- Arbitrary text sizes such as `text-[11px]`.
- Local `fontSize`, `fontFamily`, `fontWeight`, `lineHeight`, or `letterSpacing` styles.
- `font-heading`, `font-body`, or local `font-bold`/`font-semibold` utilities.
- Tailwind `uppercase`, `lowercase`, or `capitalize` utilities and CSS `text-transform`.
- Remote font stylesheets or additional typefaces.
- Typography below 12px outside the documented SVG viewBox exception.
