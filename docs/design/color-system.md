# CureRays Color System Style Guide

This guide is the source of truth for color across CureRays CRMS. Every component, badge, chart, canvas, SVG, progress indicator, and interaction must use global CSS tokens.

## Three Brand Families

The brand is three non-true colors. No pure black and no pure white appear anywhere in the system, and `scripts/contrast-check.mjs` fails the build if either is reintroduced.

| Family | Token | Light | Dark |
|---|---|---|---|
| Ink | `--color-text` | `#1A1D21` | `#EDE9E3` |
| Bone | `--color-bg` | `#F5F2ED` | `#0E1113` |
| Brand | `--color-primary` | `#1F5F5B` | `#8FC6C0` |

Token names are roles, not hues. `--color-primary` means "interaction", which is why the palette could change without touching a single component.

**There is no accent token.** It was retired with the three-color system, along with every `--landing-color-*` token. Do not reintroduce a fourth brand hue; if a surface genuinely needs separation, reach for a tint of an existing family via `color-mix()`.

## Color Roles

| Role | Meaning | Allowed use |
|---|---|---|
| Primary | Muted brand hue | Actions, links, focus, active navigation, current selection, and non-valenced single-series charts |
| Positive | Successful or satisfied | Completed, approved, signed, uploaded, exported, or explicitly clear |
| Intermediate | Pending or caution | Pending, review required, due, paused, or on hold |
| Negative | Blocked or failed | Blocked, overdue, missing, invalid, failed, destructive, or cancelled |
| Neutral | Categorical or non-valenced | Phases, diagnoses, roles, disciplines, modalities, categories, unknown, inactive, and informational metadata |

The four status tones keep their own hues because they are functional, not decorative — losing them would lose clinical meaning. They are retuned off-true so they sit inside the brand system rather than shouting against it.

Semantic colors expose solid, surface, border, and text tokens in both themes. Components must not introduce additional semantic hues or page-local palettes.

## Status Mapping

Use only `positive`, `intermediate`, `negative`, and `neutral` in status APIs. Active, in-progress, scheduled, not-started, not-applicable, and unknown statuses are neutral unless the domain explicitly establishes completion, caution, or failure.

Phases, diagnoses, responsible parties, roles, modalities, document categories, record types, and protected-record classifications are categorical. Render them with the neutral treatment. Use primary blue only on the selected container or current progress marker, never as a category or status color.

## Charts and Visualizations

Status and risk data uses the same four semantic tones as badges. Non-valenced categorical data uses primary blue and neutral tints with direct labels, line styles, marker shapes, patterns, or opacity to distinguish series. Sequential heatmaps use primary-blue intensity.

Do not use rainbow palettes or category-specific hues for chart data. Color must never be the sole carrier of meaning.

## Contrast and Surfaces

Use the paired semantic surface, border, and text tokens rather than placing neutral gray text on a colored surface. Body-sized text must maintain a 4.5:1 contrast ratio and essential non-text marks must maintain 3:1 against adjacent colors.

Prefer soft semantic surfaces with strong text and borders. Solid tokens are reserved for compact marks, chart strokes, progress fills, and destructive controls where contrast remains sufficient.

`npm run verify` runs `scripts/contrast-check.mjs`, which parses the hex tokens straight out of `globals.css` and asserts 68 pairs across both themes: text on page and card, muted and soft text, brand as link text and as a focus ring, and for every tone its text on its own surface and on the page, its border against both, and its solid mark against both.

This is the check the palette work left behind. Retune a token badly and the build fails with the measured ratio. It caught four dark-mode status borders during the palette migration that would otherwise have shipped below 3:1.

Two contrast defects were fixed rather than carried forward:

- Status borders were pastels measuring around 1.6:1 against their own surfaces, failing WCAG 1.4.11. They are now materially darker.
- `.clinical-focus:focus-visible` was a 16%-alpha ring measuring roughly 1.2:1. It is now a two-ring indicator — a page-colored spacer, then the brand ring — which holds on any surface.

## Prohibited Patterns

- Hardcoded color values in component, page, chart, service, canvas, or SVG code.
- `primary`, `info`, `success`, `warning`, `error`, or `default` as status-tone values.
- Any reference to `--color-accent`, `--landing-color-*`, or a fourth brand hue.
- Pure black or pure white as a token value.
- Phase, diagnosis, role, discipline, modality, category, or record-type palettes.
- Duplicate page-local tone unions, tone maps, or chart color resolvers.
- Status communicated only by color.
