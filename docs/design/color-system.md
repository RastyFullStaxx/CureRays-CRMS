# CureRays Color System Style Guide

This guide is the source of truth for color across CureRays CRMS. Every component, badge, chart, canvas, SVG, progress indicator, and interaction must use global CSS tokens.

## Color Roles

| Role | Meaning | Allowed use |
|---|---|---|
| Primary | CureRays blue | Actions, links, focus, active navigation, current selection, and non-valenced single-series charts |
| Accent | CureRays orange | Brand artwork and logo treatment only |
| Positive | Successful or satisfied | Completed, approved, signed, uploaded, exported, or explicitly clear |
| Intermediate | Pending or caution | Pending, review required, due, paused, or on hold |
| Negative | Blocked or failed | Blocked, overdue, missing, invalid, failed, destructive, or cancelled |
| Neutral | Categorical or non-valenced | Phases, diagnoses, roles, disciplines, modalities, categories, unknown, inactive, and informational metadata |

Semantic colors expose solid, surface, border, and text tokens in both themes. Components must not introduce additional semantic hues or page-local palettes.

## Status Mapping

Use only `positive`, `intermediate`, `negative`, and `neutral` in status APIs. Active, in-progress, scheduled, not-started, not-applicable, and unknown statuses are neutral unless the domain explicitly establishes completion, caution, or failure.

Phases, diagnoses, responsible parties, roles, modalities, document categories, record types, and protected-record classifications are categorical. Render them with the neutral treatment. Use primary blue only on the selected container or current progress marker, never as a category or status color.

## Charts and Visualizations

Status and risk data uses the same four semantic tones as badges. Non-valenced categorical data uses primary blue and neutral tints with direct labels, line styles, marker shapes, patterns, or opacity to distinguish series. Sequential heatmaps use primary-blue intensity.

Do not use the accent token, rainbow palettes, or category-specific hues for chart data. Color must never be the sole carrier of meaning.

## Contrast and Surfaces

Use the paired semantic surface, border, and text tokens rather than placing neutral gray text on a colored surface. Body-sized text must maintain a 4.5:1 contrast ratio and essential non-text marks must maintain 3:1 against adjacent colors.

Prefer soft semantic surfaces with strong text and borders. Solid tokens are reserved for compact marks, chart strokes, progress fills, and destructive controls where contrast remains sufficient.

## Prohibited Patterns

- Hardcoded color values in component, page, chart, service, canvas, or SVG code.
- `primary`, `info`, `success`, `warning`, `error`, or `default` as status-tone values.
- Accent orange used for status, risk, chart, or category meaning.
- Phase, diagnosis, role, discipline, modality, category, or record-type palettes.
- Duplicate page-local tone unions, tone maps, or chart color resolvers.
- Status communicated only by color.
