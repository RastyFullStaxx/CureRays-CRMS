# CureRays Typography Style Guide

This guide is the source of truth for typography across CureRays CRMS. It applies to authenticated pages, login, shared components, tables, forms, charts, canvas labels, modals, loading states, and errors.

## Typeface

Use Inter everywhere through `next/font/google` and the global `--font-ui` token. Components must inherit the global family. Do not import another typeface or declare `font-family` in page or component code.

## Type Scale

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
- Login follows the same product scale and has no display-size exception.

## Charts and Numeric Data

Use `lib/ui-typography.ts` when a visualization library requires numeric font values. Axis, legend, node, and compact chart labels use 12px; tooltip content uses 13px. Resolve the family from the computed global font token.

Use tabular figures where changing digit widths would make comparison harder. Reduce tick density, add chart margins, wrap labels, or allow contained horizontal scrolling instead of shrinking text.

The `.dashboard-phi-link-label` and `.dashboard-phi-node text` SVG rules may retain 2.7 and 3.2 viewBox-coordinate units. These are drawing coordinates, not CSS screen-pixel sizes, and are the only numeric exception.

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
