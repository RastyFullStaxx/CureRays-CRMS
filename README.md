# CureRays Clinical Workflow System

CureRays Clinical Workflow System (CWS) is a patient-course centered clinical operations system for CureRays Radiation Medicine. It is being built to replace the current manual workflow that depends on fragmented Google Drive files, Google Sheets, Word/Google Docs templates, PowerPoint planning decks, manual reminders, and role-by-role follow-up.

The system is not a generic healthcare dashboard. Its purpose is to become the operational command center for CureRays treatment workflows: intake, consultation, chart prep, simulation, treatment planning, treatment delivery, documentation, billing readiness, audit, and closeout.

Current project status as of 2026-06-08: active prototype development. The first prototype direction is focused on reliable workflow visibility, template/document mapping, phase-based patient tracking, task ownership, and audit readiness before deeper automation is added.

## Current Standing

### What exists now

- Next.js App Router frontend using React, TypeScript, and Tailwind CSS.
- A branded CureRays landing/login entry point and dashboard-oriented UI direction.
- Mock/in-memory workflow data used for frontend prototyping.
- Patient-course centered product documentation under `docs/`.
- Dashboard and module planning for patient queues, patient workspace, workflow, tasks, documents, treatment planning, treatment delivery, billing, audit, analytics, settings, and security logs.
- Repository documentation for product context, workflow model, page plan, data model, file storage, Drive template registry, and automation rules.
- Prisma schema planning for separated OPS and PHI databases.
- HIPAA-aware development guardrails and a `npm run test:hipaa` script.
- A Drive template registry that maps the client’s manual Google Drive templates into the app’s future template/document model.

### What does not exist yet

- Production authentication and role-based access control.
- Production database persistence for real patient/course workflow records.
- Google Drive metadata sync, folder creation, file movement, or live template ingestion.
- Full document generation from mapped templates.
- Real eCW integration.
- Electronic signature integration.
- Production-grade PHI storage, deployment, logging, monitoring, and HIPAA security hardening.
- A validated clinical dose calculation engine. Current dose-related files are treated as templates/references until clinical rules are formally mapped and approved.

### Current development rule

Do not use this repository with real patient PHI/ePHI yet. Until authentication, database boundaries, deployment controls, audit logging, and HIPAA infrastructure are completed, the app should use mock, sample, or de-identified data only.

## Objective

CWS should convert CureRays’ manual clinical operations process into structured workflow state.

The app should answer these operational questions clearly:

- Which patients/courses are Upcoming, On Treatment, or Post?
- What is the current phase of each course?
- What document, form, signature, file, task, treatment fraction, or audit item is missing?
- Who owns the next action?
- Which templates apply to this diagnosis, protocol, site, laterality, and course?
- Which items are ready for review, signed, uploaded, completed, not applicable, blocked, or overdue?
- Is the course ready for treatment, billing, audit, or closeout?

The goal is not to replace clinical judgment. The goal is to make operational state visible, consistent, traceable, and auditable.

## Core Operating Model

The system is centered on one patient record and one or more treatment courses.

```text
Patients -> Courses -> Workflow Steps -> Tasks -> Forms/Documents -> Signatures -> Treatment Delivery -> Summary -> Audit -> Closeout
```

A patient should exist once. Upcoming, On Treatment, and Post are filtered views of the same patient/course records, not copied rows across spreadsheets.

The app database is the source of truth. Google Drive files, Google Sheets, Word/Google Docs, PDFs, and PowerPoint decks are template sources, generated outputs, or synced artifacts. Staff should update structured app fields first; those fields drive workflow state, document requirements, task ownership, signatures, billing readiness, and audit closeout.

## Workflow Phases

The dashboard preserves the client-facing chart-rounds phases:

- Upcoming
- On Treatment
- Post

The internal workflow engine uses more detailed phases:

- Consultation
- Chart Prep
- Simulation
- Planning
- On-Treatment
- Post-Tx
- Audit
- Closed

Patients should not be manually moved between tabs or folders to represent status. Course phase and workflow status must be stored as structured app state.

## Canonical Carepath Steps

The current working Carepath model is:

0. Carepath Preauth
1. Image Guidance Order
2. Simulation Order
3. Simulation Note - removed from active workflow
4. Construct Treatment Device Note - removed from active workflow
5. Clinical Treatment Planning Note
6. Special Physics Consult Note - optional
7. Radiation Prescription
8. Fractionation Log
9. Special Treatment Procedure - optional
10. OTV / Treatment Management Notes - removed from active workflow
11. Weekly Physics Chart Check Note - removed from active workflow
12. In-Vivo Dosimetry Note - removed because it exists in ACW
13. Treatment Summary
14. Carepath Audit Note Sign

When a course is created, the app should eventually select the correct workflow definition by diagnosis, protocol, site/body region, laterality, modality, and template availability. It should then create applicable workflow steps, document requirements, default tasks, responsible roles, due dates, and file placeholders.

## Current Template and Drive Structure

The client’s manual workflow files currently live under the configured Drive folder:

```text
2026 TEMPLATES/
```

The repo-side template registry is documented in:

```text
docs/curerays-drive-template-registry.md
```

Recommended target structure:

```text
2026_TEMPLATES/
  00_UNIVERSAL/
  01_SKIN_CANCER_IGSRT/
    00_CAREPATH_PREAUTH_AUDIT/
    02_SIMULATION_AND_CTP_ORDER/
    07_PRESCRIPTION/
    09_ISODOSE_CURVES/
    12_FRACTIONATION_LOG/
    90_API_IN_PROCESS/
  02_ARTHRITIS/
    HAND/
    FOOT/
    KNEE/
  03_DUPUYTRENS/
    02_SIMULATION_AND_CTP_ORDER/
    07_PRESCRIPTION/
    09_ISODOSE_CURVES/
    12_FRACTIONATION_LOG/
    US_MAPPING/
  90_ON_GOING_REVISION/
```

Confirmed template families currently identified:

- Universal: Intake Form, AVS PCP Template.
- Skin Cancer / IGSRT: Carepath PreAuth Audit, SIM/CTP/IGSRT Order, Prescription, Isodose Curves, Fractionation Log.
- Arthritis: Hand, Foot, and Knee mapping, SIM/CTP/IGRT, Prescription, and Fractionation Logs.
- Dupuytren's: US Mapping, SIM/CTP/IGRT, Prescription, Isodose Curves, and Fractionation Log.
- On-going Revision: draft and duplicate FX logs plus possible future protocol files.

Dose and treatment-delivery related artifacts are currently represented as:

- Fractionation Log / FX Log spreadsheets for treatment delivery and fraction tracking.
- Prescription templates for treatment plan parameters.
- Isodose Curves decks for depth-dose and coverage references.
- Carepath PreAuth Audit documents for billing, planning, calculation, and audit support.

These are not yet automated calculation engines. They should first be modeled as template references, structured fields, treatment-plan records, treatment-fraction records, and audit evidence. Any calculation logic must be formally validated before production clinical use.

## App Structure

Planned module responsibilities:

- Dashboard: command center for workload, urgent queue, pending signatures, overdue tasks, blocked courses, schedule, missing documents, treatment progress, and recent activity.
- Patients: chart-rounds-style master registry showing phase, diagnosis, location, MD, staff, next action, flags, notes, follow-up, and billing readiness.
- Patient Workspace: single patient/course hub with tabs for workflow, tasks, forms, planning, imaging, documents, delivery, billing/audit, and activity.
- Workflow: structured Carepath steps and phase progression.
- Tasks: role-based queues for assigned, team, unassigned, signatures, overdue, and completed work.
- Schedule: appointments and treatment timing linked to workflow steps.
- Clinical Forms: structured form templates that can later generate documents.
- Treatment Planning: planning parameters, prescription state, dose/depth reference mapping, physics review, and Rad Onc review.
- Imaging: image categories, upload metadata, phase/fraction links, and audit evidence.
- Treatment Delivery: active treatment queue and fractionation table.
- Documents: template registry, generated document instances, lifecycle state, versions, signatures, exports, and eCW upload placeholders.
- Billing / Coding: planned, completed, and billed quantities plus documentation readiness.
- Audit & QA: course closeout validation, missing evidence, N/A reasons, signatures, and final readiness.
- Analytics / Reports: bottlenecks, audit blockers, diagnosis mix, role workload, and automation opportunities.
- Settings: workflow definitions, templates, storage, dropdowns, notifications, billing, users, roles, and security configuration.
- Security Logs: sensitive action trail for patient, course, document, signature, file, billing, and audit events.

## Data and Security Architecture

The target data model separates operational workflow state from PHI.

Operational data should use tokenized references such as `patientRef` and `courseRef`. Dashboards, queues, reports, and workflow APIs should avoid exposing patient names, MRNs, raw notes, generated document previews, or raw audit before/after values.

PHI should be resolved only through server-side code and stored only in the PHI boundary once production infrastructure is ready.

Planned persistence model:

- OPS database: workflow state, tasks, document lifecycle, template metadata, audit references, billing readiness, and tokenized patient/course references.
- PHI database: patient identifiers, demographics, clinical PHI, and document-generation data that requires patient identity.
- File storage: Drive or future HIPAA-grade storage for templates and generated outputs, with links and lifecycle state tracked in the app database.

Before production use with real ePHI, CureRays must confirm BAA-covered infrastructure, secure database deployment, secret management, access controls, audit trails, encryption, least-privilege permissions, backup/recovery, and breach-response procedures.

## Persistent Product Documentation

The project context is stored in repo docs so future development sessions do not need the domain brief repeated:

- [Product Context](docs/curerays-product-context.md)
- [Workflow Model](docs/curerays-workflow-model.md)
- [Page Plan](docs/curerays-page-plan.md)
- [Data Model](docs/curerays-data-model.md)
- [File Storage And Documents](docs/curerays-file-storage-and-documents.md)
- [Drive Template Registry](docs/curerays-drive-template-registry.md)
- [Automation Rules](docs/curerays-automation-rules.md)

## Specific Action Plan

### Phase 1: Stabilize prototype foundation

- Keep the current CureRays visual system consistent across pages.
- Make the dashboard, patients, patient workspace, workflow, documents, tasks, treatment planning, treatment delivery, billing, and audit pages read from shared mock workflow definitions instead of one-off page data.
- Ensure Upcoming, On Treatment, and Post are filters over patient/course state.
- Represent missing or unmapped workflow details visibly instead of hiding gaps.
- Strengthen mock data around Skin Cancer / IGSRT, Arthritis, and Dupuytren's.

### Phase 2: Template registry and document model

- Convert the Drive template registry into app-readable metadata.
- Add template statuses: active, mapped_partial, mapped_full, draft, retired, missing, duplicate_review.
- Map each template to diagnosis, protocol, body region/site, laterality, workflow phase, responsible role, reviewer role, lifecycle status, and required fields.
- Model Intake and AVS as universal templates.
- Model Carepath, SIM/CTP/IGRT, Prescription, Isodose Curves, FX Logs, US Mapping, and Joint Mapping as diagnosis/protocol-specific templates.

### Phase 3: Treatment planning and dose/fraction tracking model

- Model prescription parameters as structured TreatmentPlan fields.
- Model FX Logs as TreatmentFraction records.
- Model Isodose Curves as planning references and generated planning artifacts.
- Track dose per fraction, total planned dose, total fractions, cumulative delivered dose, energy, applicator, phase, review state, and lock state.
- Keep calculation logic configurable and clinically reviewed before any production use.

### Phase 4: Persistence and API boundary

- Connect the frontend to persistent data instead of mock/in-memory state.
- Implement OPS and PHI database separation.
- Create API DTOs that minimize PHI exposure.
- Add server-only PHI access patterns.
- Create audit events for sensitive reads, writes, signatures, generated documents, file links, and state transitions.

### Phase 5: Authentication, roles, and permissions

- Replace temporary role headers/placeholders with real authentication.
- Implement role-based access for Admin, Virtual Assistant, Medical Assistant, Therapist / RTT, Nurse Practitioner / PA, Doctor / PCP, Doctor / Rad Onc, Medical Physicist / PhD, and Billing Staff.
- Enforce least-privilege access by module, action, and data sensitivity.
- Add security logs for access and mutation events.

### Phase 6: Document generation and Drive/file integration

- Generate patient/course document instances from approved templates.
- Store generated outputs outside the template folder.
- Track document version, lifecycle status, reviewer, signature state, export state, eCW upload placeholder, lock state, and audit evidence.
- Add Drive sync only after template metadata and document lifecycle states are stable.

### Phase 7: Audit, QA, and closeout

- Build final course closeout checks across workflow steps, documents, signatures, treatment fractions, billing readiness, N/A reasons, and generated files.
- Surface blockers before chart closeout.
- Provide audit-ready evidence links without exposing unnecessary PHI in operational views.

### Phase 8: Production hardening

- Complete HIPAA security review before real patient data is used.
- Confirm BAA-covered infrastructure and service configuration.
- Add monitoring, backups, recovery, deployment controls, secrets management, and formal access review.
- Validate clinical calculation workflows with CureRays stakeholders before enabling production automation.

## Development Commands

```bash
npm install
npm run dev
npm run typecheck
npm run test:hipaa
npm run build
```

## Development Principles

- Build workflow state first, automation second.
- Keep patient/course records centralized.
- Do not duplicate patients across tabs, folders, or spreadsheets to represent phase.
- Keep templates configurable and visible even when partially mapped.
- Treat missing templates, draft templates, and unknown clinical variations as explicit states.
- Avoid hardcoding final clinical assumptions while the manual template set is still being reviewed.
- Keep operational pages PHI-minimized by default.
- Use structured fields to drive documents, signatures, billing readiness, treatment delivery, and audit closeout.
