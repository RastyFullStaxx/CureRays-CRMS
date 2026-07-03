# CureRays CRMS

## Product Register

- **Product:** CureRays Clinical Workflow System (CureRays CRMS/CWS)
- **Organization:** CureRays Radiation Medicine
- **Primary domain:** Radiation oncology clinical operations

## Users

- Radiation Oncologists
- Medical Physicists
- Therapists/RTTs
- Nurse Practitioners and Physician Assistants
- Medical Assistants
- Virtual Assistants
- Billing and authorization staff
- Clinic administrators and compliance/security reviewers

Many users work under time pressure and need to maintain a patient course without learning which overlapping module or file contains the current truth.

## Product Purpose

CureRays CRMS is a patient-course-centered clinical operations workspace. It brings workflow steps, treatment readiness, fraction records, documents, billing evidence, and audit history into one dependable record so staff can identify the next required action and complete it safely.

The product is not a generic dashboard and does not replace clinical judgment. Its role is to make operational state visible, consistent, traceable, and auditable.

## Manual Workflow Being Replaced

- Chart-rounds tracking in spreadsheets.
- Patient movement between worksheet tabs or Drive folders to indicate phase.
- Carepath/preauthorization/audit Word documents.
- Intake, mapping, simulation, prescription, and AVS templates.
- Isodose/treatment-planning PowerPoint references.
- Fractionation-log spreadsheets.
- Manual assignment, routing, renaming, signing, uploading, and reconciliation.
- Separate billing, audit, and closeout checks without one authoritative course gate.

## Stable Product Decisions

1. A patient exists once and may have multiple treatment courses.
2. Course phase and workflow state live in the application database.
3. Documents are controlled inputs, generated outputs, or evidence—not workflow state.
4. Primary work happens in the patient registry and patient workspace.
5. Global pages exist only for cross-patient questions: today’s work, schedule, oversight, analytics, and administration.
6. The patient workspace uses four stable tabs: Overview, Prepare, Treatment, and Record & Closeout.
7. One derived course gate supplies readiness across the workspace.
8. Required work may never be hidden behind optimistic status labels.
9. Production clinical calculations require formal CureRays validation.
10. Real PHI/ePHI use requires the production gates in `docs/requirements/production-readiness.md`.

## Brand Personality

Calm, precise, and clinically dependable. The interface should feel familiar enough to use immediately, dense enough for operational work, and restrained enough that warnings and next actions remain obvious.

## Design Principles

1. Keep the patient and active course visible while the work changes.
2. Lead with the next action, owner, and blocker.
3. Show each operational fact once in the place where it is most useful.
4. Prefer guided work surfaces over decorative dashboards.
5. Use exact action verbs: complete, generate, review, sign, upload, approve, correct, void, or resolve.
6. Keep status derived from evidence and approvals rather than manually asserted.
7. Preserve accessibility, PHI boundaries, and safe error recovery when simplifying.

## Anti-Patterns

- Separate modules maintaining competing patient status.
- A file or folder name used as the source of workflow truth.
- Generic `Review` buttons that do not identify the required action.
- “Complete,” “approved,” or “ready” states without required evidence.
- Simulated local actions presented as durable saves, signatures, uploads, or exports.
- Repeated metrics and status summaries that increase reconciliation work.
- Decorative cards, gradients, or motion that compete with clinical decisions.
- Raw entity codes, PHI-bearing logs, or browser-stored patient data.

## Accessibility and Inclusion

Target WCAG 2.1 AA. Use clear labels, visible focus states, keyboard-operable controls, sufficient contrast, comfortable target sizes, reduced-motion support, and layouts that remain understandable at narrow widths and browser zoom. Do not rely on color alone for clinical status.

## Product Boundaries

The canonical workflow requirements are in `docs/requirements/clinical-workflow.md`. Current implementation truth is in `docs/status/current-state.md`. Requirements and target designs must not be interpreted as implemented behavior.
