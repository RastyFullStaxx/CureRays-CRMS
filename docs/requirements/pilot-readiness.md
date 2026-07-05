# Pilot Readiness Requirements

- **Status:** Mandatory gate for the staff pilot
- **Current disposition:** Not satisfied
- **Relationship:** This document defines the staff-pilot gate only. Any real PHI/ePHI or clinical production use remains governed by [production readiness](production-readiness.md), which this document never relaxes.

## Pilot Definition

The staff pilot is a time-boxed evaluation (~3 months from adoption of this plan) in which CureRays staff perform daily course work inside CRMS using synthetic or de-identified data only. The pilot succeeds when staff complete a full Dupuytren's treatment course — intake through closeout — inside the application faster and more accurately than with the worksheet/Drive process it replaces.

## Boundaries

- Synthetic or de-identified data only. Real PHI/ePHI is prohibited.
- Named local users with role enforcement; no external identity provider.
- Single-instance deployment; no multi-clinic tenancy.
- Prototype calculations remain blocked from clinical guidance per [clinical workflow](clinical-workflow.md) section 7.
- The pilot core loop is: **fill structured form → durable save → generate real document → download**. Work that does not ship this loop is out of pilot scope.

## Pilot Gates

Each gate is testable and must be satisfied with observable evidence before the pilot starts.

### G1. Durable persistence

Every mutation available in the pilot UI (workflow steps, tasks, patient/course records, fraction entries, document lifecycle actions) survives an application restart. Evidence: perform each mutation, restart the process, confirm state.

### G2. Structured preparation forms

All Dupuytren's document requirements plus the universal intake render their complete `TemplateFieldMap` sections as validated forms that save, resume as drafts, and enforce required fields — including the repeated per-region ultrasound observations. Evidence: complete each form end to end in the Prepare workbench.

### G3. Real document generation

Every in-scope Dupuytren's and universal requirement produces a downloadable DOCX (or XLSX for fraction logs) generated from saved structured data, recorded as a `GeneratedDocumentOutput` version per the [pilot generation profile](../architecture/document-lifecycle.md). Text previews alone do not pass this gate.

### G4. Fraction loop

A fraction can be recorded, corrected, DOT/MD approved, and exported to XLSX, with correction lineage preserved and cumulative values recalculated. Evidence: full record → correct → approve → export cycle on a synthetic course.

### G5. Preauthorization-lite

The preauthorization state machine exists for protocols that require it and gates the Planning → On-Treatment advance per [workflow and automation](../architecture/workflow-and-automation.md). No payer integration is required.

### G6. Named local users and roles

Each pilot user signs in as a named local identity with a role, and mutation routes enforce role permissions through the existing authorization checks. No IdP, MFA, or federation is required for the pilot.

### G7. Seed and reset procedure

Operators can seed a clean pilot dataset and reset it between sessions using documented commands. Evidence: documented procedure executed successfully.

### G8. Feedback capture

A defined channel exists for staff to report friction during the pilot (a document plus a form is acceptable; software is not required).

## Explicit Non-Goals for the Pilot

Each deferred item maps to its production workstream in the [implementation roadmap](../roadmap/implementation-roadmap.md).

| Deferred item | Deferred to |
|---|---|
| eCW and Drive adapters, external reconciliation | Deferred workstream: external integrations |
| Identity provider, MFA, session federation | Deferred workstream: authentication and audit |
| Immutable audit infrastructure (append-only application tables suffice for the pilot) | Deferred workstream: authentication and audit |
| Full Prisma repository refactor (write-through persistence suffices for the pilot) | Deferred workstream: durable data completion |
| PDF and PPTX generation (isodose references attach as static files) | Deferred workstream: document lifecycle |
| Deep analytics investment | Deferred workstream: closeout and operations |
| Imaging beyond evidence attachment | Deferred workstream: document lifecycle |
| Mobile/responsive layouts | Per AGENTS.md development policy |
| Live/WYSIWYG document editing | Permanently out of scope; documents are generated from structured forms |

## Pilot Exit Criteria

The pilot concludes with a written assessment recording:

- which gates held up under real staff use, with observed evidence;
- staff-reported friction and time-on-task compared to the worksheet/Drive process;
- data-model or workflow assumptions invalidated by observation (for example, per-site course handling, next-action ordering);
- the validated subset of decisions to promote into [production readiness](production-readiness.md) scope and the production workstream ordering.

Authoritative implementation status for every gate belongs in [`../status/current-state.md`](../status/current-state.md), not in this requirements document.
