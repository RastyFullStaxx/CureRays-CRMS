# CureRays CRMS System Progress Tracker

Last updated: 2026-06-11

Owner: CureRays CRMS implementation team

Purpose: this is the living control document for system readiness. Update it whenever a phase item is completed, a blocker is found, a release is pushed, or a planning assumption changes.

## How To Update This Tracker

Status keys:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked or at-risk
- `[?]` Needs product or clinical decision

Update rules:

- Add a dated line to the Update Log for every meaningful change.
- Keep percentages conservative. A feature is not production-ready until it is persistent, authorized, audited, tested, and safe for the relevant data class.
- Separate "prototype works with mock data" from "safe for real PHI/ePHI."
- Do not mark any clinical calculation complete until clinical validation, reference versioning, and reviewer sign-off are documented.
- Do not mark any PHI-bearing workflow production-ready while client bundles can receive raw patient names, MRNs, notes, generated document previews, or unrestricted mock PHI.

## Executive Summary

Current overall assessment:

- Local prototype/app shell readiness: 82%
- End-to-end demo workflow readiness using mock/de-identified data: 66%
- Real clinic pilot readiness with strictly de-identified or synthetic data: 45%
- Production readiness for real PHI/ePHI: 30%

Plain answer to the question "pwede na ba from patient registration to record maintenance and updating?":

The system can run locally and can demonstrate the patient-course operating model with mock data. It can list tokenized patient records, open patient workspaces, show course/workflow/document/fraction/billing/audit state, create and edit prototype patient records in runtime memory through guarded PHI actions, render simulated document previews, sign simulated documents, and update/approve/void fraction worksheet rows.

It is not yet ready for real patient registration through normal clinic operations. Patient creation and update are wired for the prototype and create an in-memory course/task/document bundle, but records are not durable after process restart, workflow/task/folder creation is not a real database transaction, authentication is still a header placeholder, and production PHI boundaries are not fully enforced. So: pwede na for internal demo and workflow alignment using mock or de-identified data; hindi pa pwede for live PHI clinical use.

## Evidence Consulted

Repository and docs reviewed:

- `README.md`
- `docs/curerays-product-context.md`
- `docs/curerays-workflow-model.md`
- `docs/curerays-page-plan.md`
- `docs/curerays-data-model.md`
- `docs/curerays-file-storage-and-documents.md`
- `docs/curerays-drive-template-registry.md`
- `docs/curerays-template-normalization-manifest.md`
- `docs/curerays-automation-rules.md`
- `package.json`
- `app/**/page.tsx`
- `app/api/**/route.ts`
- `lib/types.ts`
- `lib/mock-data.ts`
- `lib/clinical-store.ts`
- `lib/template-registry.ts`
- `lib/module-data.ts`
- `lib/services/**`
- `lib/hipaa.ts`
- `lib/server/phi-store.ts`
- `prisma/schema.prisma`
- `prisma/ops-schema.prisma`
- `prisma/phi-schema.prisma`
- `scripts/hipaa-guardrails.mjs`
- `scripts/fraction-worksheet-fixtures.mjs`
- `scripts/route-smoke.mjs`
- `.github/workflows/verify.yml`

Verification run on 2026-06-11:

- `[x]` `npm run typecheck` passed.
- `[x]` `npm run lint` passed with no ESLint warnings or errors.
- `[x]` `npm run test:hipaa` passed.
- `[x]` `TMPDIR=/tmp npm run test:fraction-worksheet` passed. The plain script initially tried to write to the Windows temp folder, which is read-only in this sandbox, so the stable local command should set `TMPDIR=/tmp` when needed.
- `[x]` `npm run test:routes` passed.
- `[x]` `npm run build` passed.
- `[x]` `npm run verify` passed.

Current inventory:

- 34 App Router page files.
- 5 API route files.
- 65 component TSX files.
- 16 service files under `lib/services`.
- 1 shared RBAC helper in `lib/rbac.ts`.
- 30 normalized local template files under `docs/2026_TEMPLATES`.
- 31 `TemplateSource` records in `lib/template-registry.ts`: 16 active, 9 mapping-in-progress, 5 draft, 1 missing placeholder.
- 25 `DocumentRequirement` records.
- 4 workflow definitions: Universal active; Skin Cancer IGSRT, Arthritis, and Dupuytren's mapping-in-progress.
- Mock data baseline: 6 patients, 6 treatment courses, 7 mock tasks, 8 mock generated documents, 3 mock fraction rows, plus additional clinical-store/task/template-derived state.

## Current Functional Map

### Functioning Now For Demo

- `[x]` Local Next.js app builds and runs.
- `[x]` Branded login/landing screen exists.
- `[x]` Dashboard exists with telemetry-heavy operational views.
- `[x]` Patient registry, master records, upcoming, on-treatment, and post-treatment views display mock patient/course state.
- `[x]` Patient workspace route exists and can show workflow, tasks, clinical, planning, imaging, documents, fractions, billing/audit, and activity tabs for mock patients.
- `[x]` Workflow pages show canonical Carepath steps and blockers from mock/generated state.
- `[x]` Task, schedule, clinical forms, treatment planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` IGSRT fraction worksheet can add, update, approve, request revision, and void rows against in-memory state.
- `[x]` Fraction worksheet calculations have a fixture script and preserve a "clinical validation required" warning.
- `[x]` Generated document render/sign flows exist as simulated outputs from structured state.
- `[x]` Operational workflow API returns tokenized operational data.
- `[x]` PHI access helper exists with role header gating for PHI routes.
- `[x]` HIPAA guardrail script checks selected PHI boundaries.

### Partially Functioning

- `[~]` Patient registration: `POST /api/patients` and `createPatient()` exist, but the UI Add Patient button is not wired and no persistent database transaction creates the patient/course/workflow/task/folder bundle.
- `[~]` Patient record maintenance: `PATCH /api/patients/[id]` and `updatePatient()` exist, but updates are in-memory only and there is no full UI edit workflow, validation, duplicate detection, consent/history handling, or persistent audit trail.
- `[~]` Course/workflow automation: canonical steps and automation rules are documented; generated task/document helpers exist; full "create course -> create steps/tasks/docs/folders" automation is not implemented as durable backend logic.
- `[~]` Template registry: local files are normalized and registry metadata exists; field-level mapping and live Drive sync are incomplete.
- `[~]` Document lifecycle: pages and simulated render/sign/export state exist; no real DOCX/PPTX/XLSX/PDF generation, no eCW upload, no electronic signature integration, no immutable version store.
- `[~]` Billing/audit: status pages and mock readiness checks exist; no payer/preauth workflow engine, real billing rules, or closeout enforcement.
- `[~]` Security logs/audit logs: mock/tokenized event pages exist; immutable authenticated logging is not yet implemented.

### Not Functioning Yet For Production

- `[ ]` Real authentication and session management.
- `[ ]` Role-based access control enforced on every route/action/data class.
- `[ ]` Durable OPS and PHI database persistence.
- `[ ]` Production PHI storage boundary and server-only PHI access.
- `[ ]` Real Google Drive metadata sync, file creation, folder creation, version tracking, and generated output storage.
- `[ ]` Real eCW integration.
- `[ ]` Electronic signature integration.
- `[ ]` Production deployment, secrets, logging, monitoring, backup/recovery, incident response, and BAA-covered hosting confirmation.
- `[ ]` Clinically validated dose/fraction calculation engine.
- `[ ]` Formal test suite beyond scripts.

## End-To-End Readiness: Patient Registration To Maintenance

| Stage | Current readiness | What works now | What blocks production |
|---|---:|---|---|
| Login/session | 15% | Branded login UI routes to dashboard. | No real auth, no session validation, no MFA, no timeout, no role claims. |
| Patient registration | 30% | API helper can create an in-memory patient with redacted audit event if a PHI role header is present. | Add Patient UI not wired; no persistence; no validation; no duplicate MRN prevention beyond future DB schema; no course/workflow auto-bundle. |
| Patient registry | 65% | `/patients`, `/records`, phase pages, search/filter tables, patient workspace links. | Some client pages import PHI-bearing mock data; operational DTO standard not enforced everywhere; no backend pagination/query permissions. |
| Patient profile/workspace | 68% | Patient workspace displays course, workflow, tasks, documents, fractions, planning, imaging, billing/audit, activity. | Mostly read-only except fraction/IGSRT-specific routes; PHI handling is prototype-only; no durable writes. |
| Record update/maintenance | 38% | PATCH helper updates in-memory patient data; IGSRT simulation/prescription/fractions/doc statuses update in memory. | No production UI for general record edits; no DB transaction; no field validation policy; no immutable audit trail; no user attribution beyond `SYSTEM`/header stub. |
| Course creation | 20% | Course concepts and mock courses exist. | No production create-course API/UI; no diagnosis/protocol workflow selection transaction. |
| Workflow progression | 45% | Carepath steps, task/document requirements, blockers, and audit readiness are modeled and rendered. | No persistent workflow state machine; no guarded transitions; no due-date/escalation engine. |
| Document generation | 35% | Simulated render/sign/export outputs exist. | No real template merge, output file write, Drive/eCW upload, signature provider, or lock/version enforcement. |
| Treatment delivery/fractions | 58% | Strongest interactive slice: native fraction worksheet, calculations, approvals, revisions, voiding, registry table. | Clinical validation required; no persistence; no authenticated role enforcement; no machine/device integration. |
| Billing/audit closeout | 35% | Mock billing rows, audit checks, readiness score, logs. | No real billing engine, payer/preauth validation, claim evidence lock, closeout gate, or immutable audit log. |

Minimum "demo-ready" path today:

1. Open landing page and route to dashboard.
2. Review dashboard/registry using mock data.
3. Open a patient workspace.
4. Review workflow/tasks/documents/fractions/audit state.
5. Use IGSRT/fraction worksheet to record or approve a mock fraction.
6. Render/sign a simulated generated document.

Minimum "pilot-ready with de-identified data" path still needed:

1. Replace prototype Add/Edit Patient with durable, authenticated database-backed workflows.
2. Add durable storage for patient/course/workflow state in a non-PHI or de-identified environment.
3. Complete course creation flow that initializes workflow steps, tasks, document requirements, audit checks, and folder placeholders.
4. Enforce app-level roles with real auth.
5. Add test coverage for create/update flows and fraction workflows.
6. Prevent raw PHI in client bundles.

Minimum "production-ready with real PHI" path still needed:

1. Real auth, RBAC, MFA/session controls, audit logs, and deployment security.
2. OPS/PHI database separation implemented and queried by server-side code.
3. PHI-only data never shipped to unauthorized client bundles or logs.
4. Durable workflow/document/fraction/billing/audit transactions.
5. Drive/file/eCW/signature integrations under appropriate agreements and access controls.
6. Clinical validation of all calculation logic and generated clinical documents.

## Phase Plan

### Phase 0: Baseline, Product Alignment, And Repo Health

Current completion: 90%

Goal: keep the prototype coherent, buildable, and aligned with CureRays' patient-course operating model.

What is already done:

- `[x]` Product context documented.
- `[x]` Workflow model documented.
- `[x]` Page plan documented.
- `[x]` Data model documented.
- `[x]` File/document storage model documented.
- `[x]` Automation rules documented.
- `[x]` Template registry and normalization manifest documented.
- `[x]` Next.js 14, React 18, TypeScript, Tailwind, lucide-react, echarts, recharts, and d3-force dependencies installed.
- `[x]` `npm run typecheck` passes.
- `[x]` `npm run lint` passes.
- `[x]` `npm run build` passes on latest rerun.
- `[x]` `npm run test:hipaa` passes.
- `[x]` `TMPDIR=/tmp npm run test:fraction-worksheet` passes.
- `[x]` `npm run test:routes` passes.
- `[x]` `npm run verify` runs typecheck, lint, HIPAA guardrails, fraction fixtures, route smoke, and build.
- `[x]` CI workflow exists for `npm run verify`.
- `[x]` Global scrollbar styling uses top-level design tokens.
- `[x]` Next.js build no longer ignores lint/type errors, and baseline security headers are configured.

Remaining checklist:

- `[!]` Refactor hardcoded hex colors in app/component/lib UI files to CSS tokens. Current scan found 366 hardcoded color references.
- `[~]` Normalize current page/component architecture around `components/ui`, `components/shared`, and token-based styling rules.
- `[~]` Convert old page-specific imports of mock/clinical data to service or server component access where appropriate.
- `[x]` Add a repeatable `npm run verify` script that runs typecheck, lint, HIPAA guardrails, fraction fixtures, route smoke, and build.
- `[x]` Add CI for `npm run verify`.
- `[x]` Decide whether `TMPDIR=/tmp` should be embedded in the fraction fixture script or documented as a local Windows/WSL command requirement. `npm run verify` sets `TMPDIR=/tmp`.
- `[?]` Decide whether the first intermittent build failure at `/api/patients` needs a specific regression test if it appears again.

Pre-mortem:

- Failure mode: the team keeps adding screens faster than shared patterns stabilize.
- Early warning: duplicate UI primitives, hardcoded colors, mock data imports in many pages, and inconsistent client/server boundaries.
- Prevention: complete the shared layout/UI consolidation before adding major workflow features.

### Phase 1: Prototype Navigation And Operational Visibility

Current completion: 83%

Goal: make the app usable as an internal demo command center using mock or de-identified data.

What is already done:

- `[x]` Landing/login page exists.
- `[x]` Dashboard exists and builds.
- `[x]` Sidebar/navigation covers the main modules.
- `[x]` Patient registry and phase views exist.
- `[x]` Patient workspace exists.
- `[x]` Workflow, tasks, schedule, clinical forms, planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` DataTable and shared stat/page components are used in many pages.
- `[x]` Route smoke script verifies sidebar routes and representative dynamic patient routes.
- `[x]` App shell shows a global prototype/de-identified-data banner.
- `[x]` Several visible placeholder actions are disabled for demo clarity.

Remaining checklist:

- `[x]` Confirm every nav item points to a meaningful route and no dead routes remain.
- `[~]` Replace non-wired action buttons with either real handlers or disabled/coming-soon states for pilot clarity.
- `[x]` Align patient registry implementation around shared `DataTable` and operational DTOs. The richer `components/patients/patients-registry.tsx` remains unsuitable for production because it is PHI-heavy.
- `[x]` Add route smoke tests for sidebar routes and representative dynamic patient routes.
- `[ ]` Add empty/error/loading states for every table-driven page.
- `[x]` Add consistent app-level "mock/de-identified data only" environment banner until production controls exist.

Pre-mortem:

- Failure mode: stakeholders believe visible pages mean backend workflows are complete.
- Early warning: buttons named Add, Upload, Create, Edit, or Sync do nothing or only update runtime memory.
- Prevention: label the prototype status clearly and prioritize wiring the end-to-end patient/course path.

### Phase 2: Patient Registration, Registry, And Record Maintenance

Current completion: 48%

Goal: support safe patient/course intake and ongoing record maintenance as structured app state.

What is already done:

- `[x]` Patient and course types exist.
- `[x]` Mock patients and treatment courses exist.
- `[x]` `createPatient(input)` can create an in-memory patient.
- `[x]` `updatePatient(id, input)` can update an in-memory patient.
- `[x]` `GET /api/patients` returns operational patients.
- `[x]` `POST /api/patients` calls `createPatient()` behind a PHI role header check.
- `[x]` `GET /api/patients/[id]` resolves PHI behind a PHI role header check.
- `[x]` `PATCH /api/patients/[id]` calls `updatePatient()` behind a PHI role header check.
- `[x]` `patientRef`, `courseRef`, and `phiRecordId` helpers exist.
- `[x]` Redacted audit events are created for in-memory create/update operations.
- `[x]` `/patients` renders tokenized operational DTOs by default and no longer imports raw `patients`.
- `[x]` Add Patient UI posts to a validated create-patient API path.
- `[x]` Edit Patient UI fetches PHI only after explicit user action and patches through the guarded API.
- `[x]` Required-field validation and duplicate MRN checks exist in the prototype API/store path.
- `[x]` Patient creation creates an in-memory course and runs existing document/task requirement generation helpers.

Remaining checklist:

- `[!]` Remove PHI-bearing patient data from all client bundles before production. `/patients` is hardened, but patient workspaces and other prototype paths still intentionally render PHI after server-side lookup.
- `[x]` Wire Add Patient UI to a validated create-patient form.
- `[x]` Wire Edit Patient UI to `PATCH /api/patients/[id]`.
- `[x]` Add patient search, duplicate checking, MRN uniqueness checks, and required-field validation.
- `[~]` Create course creation flow as part of registration or as a follow-up step. Prototype creation now creates an in-memory default course, not a durable transactional bundle.
- `[ ]` On course creation, select the workflow definition by diagnosis/protocol/body region/laterality/modality.
- `[~]` On course creation, create workflow steps, tasks, document requirements, initial audit checks, and folder placeholders in one transaction. Prototype creates course-linked tasks/documents in memory; audit checks/folders/DB transaction remain incomplete.
- `[ ]` Add patient status update workflow: active, on hold, paused, closed/completed course.
- `[ ]` Add phase update workflow: Upcoming, On Treatment, Post, and detailed internal phases.
- `[ ]` Persist patients/courses in OPS/PHI databases.
- `[ ]` Add audit trail with authenticated actor, IP/device/session, before/after redaction, and reason for sensitive changes.
- `[ ]` Add optimistic/pessimistic concurrency rules for simultaneous edits.
- `[ ]` Add record history view and rollback/correction policy.
- `[ ]` Add React/UI tests for registration and update flows.
- `[ ]` Add API integration tests for create/update/list/read behavior.

Pre-mortem:

- Failure mode: a patient is created without a linked course, workflow, tasks, documents, or folder placeholders, causing downstream pages to show inconsistent state.
- Early warning: a new patient appears in `/patients` but not in `/records`, `/workflow`, `/tasks`, documents, or phase views.
- Prevention: implement patient/course creation as one backend transaction with rollback and required post-conditions.

### Phase 3: Course Workflow Engine And Task Queues

Current completion: 45%

Goal: make workflows and task queues the operational source of truth instead of static page data.

What is already done:

- `[x]` Dashboard phases are modeled: Upcoming, On Treatment, Post.
- `[x]` Detailed internal phases are modeled: Consultation, Chart Prep, Simulation, Planning, On-Treatment, Post-Tx, Audit, Closed.
- `[x]` Canonical Carepath steps 0-14 are represented.
- `[x]` Removed/optional steps are documented.
- `[x]` Task and workflow types exist.
- `[x]` `workflowService.listSteps()` and `workflowService.canAdvanceCourse()` exist as basic helpers.
- `[x]` `workflowService.markNotApplicable()` enforces a non-empty N/A reason at helper level.
- `[x]` Task queues exist visually and through `taskService.listByQueue()`.
- `[x]` Workflow definitions exist in `lib/template-registry.ts`.

Remaining checklist:

- `[ ]` Persist workflow steps and tasks.
- `[ ]` Implement create-course workflow-definition selection.
- `[ ]` Generate applicable workflow steps from `WorkflowDefinition.documentRequirementIds`.
- `[ ]` Enforce optional/removed step logic with explicit N/A reason where relevant.
- `[ ]` Implement guarded workflow transitions.
- `[ ]` Add due date calculation rules by phase/role/template.
- `[ ]` Add task assignment and reassignment UI.
- `[ ]` Add task completion, review, signature, blocked, overdue, N/A, and reopen flows.
- `[ ]` Add role-specific queue views backed by authenticated user context.
- `[ ]` Add notification/escalation rules.
- `[ ]` Add audit events for workflow transitions and task mutations.
- `[ ]` Add tests for workflow creation, transition guards, N/A reason enforcement, blockers, overdue logic, and role queues.

Pre-mortem:

- Failure mode: workflow state becomes another spreadsheet-like status label instead of a controlled state machine.
- Early warning: users can mark a course On Treatment even while required planning/signature/fraction prerequisites are incomplete.
- Prevention: make phase advancement a backend command with blockers returned to the UI.

### Phase 4: Template Registry And Document Requirements

Current completion: 60%

Goal: turn the Drive template inventory into app-readable, versioned, clinically approved document requirements.

What is already done:

- `[x]` 30 local source files normalized under `docs/2026_TEMPLATES`.
- `[x]` Normalization manifest includes original path, normalized path, diagnosis, workflow step, app category, status, SHA-256, and notes.
- `[x]` `templateSources` includes 31 records, including active, draft, mapping-in-progress, and missing placeholder states.
- `[x]` `documentRequirements` includes 25 records.
- `[x]` Universal, Skin Cancer IGSRT, Arthritis, and Dupuytren's workflow definitions exist.
- `[x]` App pages can list templates and document rows.
- `[x]` `applicableDocumentRequirements()` and related helpers exist.

Remaining checklist:

- `[ ]` Complete field-level mapping for each active template.
- `[ ]` Create a structured template metadata source that can be loaded without editing TypeScript for every registry change.
- `[ ]` Add admin UI for template status, clinical approval, retirement, duplicate review, and missing template tracking.
- `[ ]` Map every requirement to diagnosis, protocol, body region/site, laterality, modality, phase, responsible role, reviewer role, required fields, output formats, CPT relevance, and audit evidence.
- `[ ]` Resolve all `MAPPING_IN_PROGRESS` statuses that are needed for pilot.
- `[ ]` Resolve the `MISSING` billing pre-authorization mapping placeholder or explicitly defer it.
- `[ ]` Decide whether draft Gynecomastia fraction log remains out-of-scope.
- `[ ]` Add template versioning and source hash verification in the app.
- `[ ]` Add tests for requirement applicability by diagnosis/protocol/body site/laterality.

Pre-mortem:

- Failure mode: documents generate from the wrong template variant or omit required fields.
- Early warning: active templates have missing field maps, ambiguous laterality/site placeholders, or duplicated source candidates.
- Prevention: require template approval status and field-map completeness before production generation.

### Phase 5: Document Generation, Signatures, File Storage, Drive, And eCW

Current completion: 25%

Goal: generate, store, sign, export, upload, version, and audit patient/course documents.

What is already done:

- `[x]` Generated document types and mock/generated document rows exist.
- `[x]` Simulated `renderGeneratedDocument()` creates versioned `GeneratedDocumentOutput` records in memory.
- `[x]` Simulated `signGeneratedDocument()` updates document and related IGSRT order/prescription status.
- `[x]` Documents page shows signature and eCW upload status.
- `[x]` File storage and Drive service names are documented.
- `[x]` `fileStorageService.createCourseFolders()` returns a planned folder list.
- `[x]` `driveSyncService` exists as a stub.
- `[x]` `documentGenerationService.generateFromTemplate()` exists as a stub.

Remaining checklist:

- `[ ]` Pick production file storage provider and confirm HIPAA/BAA coverage.
- `[ ]` Implement template merge for DOCX.
- `[ ]` Implement spreadsheet output for fraction logs.
- `[ ]` Implement PPTX/isodose output strategy or keep as managed source artifact.
- `[ ]` Implement PDF rendering/export.
- `[ ]` Implement Drive template metadata sync.
- `[ ]` Implement patient/course folder creation.
- `[ ]` Store generated outputs outside the template library.
- `[ ]` Track document versions, lock state, reviewer, signer, export state, eCW upload state, and storage URL.
- `[ ]` Replace simulated `drive://` URLs with real storage references.
- `[ ]` Add electronic signature provider or documented manual signature workflow.
- `[ ]` Add eCW upload integration or manual upload confirmation workflow.
- `[ ]` Add audit events for open, render, sign, export, upload, void, and manual edit.
- `[ ]` Add tests for document generation, versioning, signing, lock rules, and eCW upload state.

Pre-mortem:

- Failure mode: Google Drive remains the real source of truth while the app only reflects stale metadata.
- Early warning: staff edit generated files manually and the app does not know which version is current.
- Prevention: app database owns lifecycle state; file edits become auditable outputs or exceptions.

### Phase 6: Treatment Planning And Fractionation Worksheet

Current completion: 63%

Goal: support treatment planning and daily treatment delivery records without prematurely claiming clinical calculation authority.

What is already done:

- `[x]` Treatment plan, prescription, prescription phase, and fraction log types exist.
- `[x]` IGSRT simulation order and prescription in-memory update flows exist.
- `[x]` Native fraction worksheet UI exists.
- `[x]` `fraction-worksheet-service.ts` includes reference curves for 50/70/100 kV, lookup logic, manual override handling, cumulative dose calculations, approval state, correction handling, revision handling, void handling, billing row generation, and isodose note generation.
- `[x]` Fraction worksheet fixture script passes with `TMPDIR=/tmp`.
- `[x]` Fraction log registry page exists.
- `[x]` Treatment delivery pages exist.
- `[x]` Clinical validation warning is present in calculation metadata.
- `[x]` Fraction worksheet reference data has a prototype reference version stored in calculation metadata.
- `[x]` Fixture script asserts reference version and "clinical validation required" metadata.
- `[x]` Prototype role gates enforce Rad Onc/Admin for MD approval and RTT/Admin for DOT approval.
- `[x]` Fully approved fraction rows are locked against normal edits; revision and void remain controlled paths.

Remaining checklist:

- `[!]` Obtain formal clinical validation for reference curves, calculations, rounding, override rules, cumulative dose handling, and generated notes.
- `[x]` Version all clinical reference data and tie calculations to reference version for the prototype reference table.
- `[ ]` Persist fraction entries and recalculated dependent totals.
- `[x]` Add role-specific MD and DOT approval enforcement at the prototype API boundary.
- `[x]` Add lock rules after final approval and clear correction workflows after lock.
- `[ ]` Add treatment schedule/fraction creation from prescription.
- `[ ]` Connect imaging guidance completion to required image assets.
- `[ ]` Connect weekly physics checks and OTV/treatment management rules where clinically required.
- `[ ]` Add audit logs for every fraction create/update/approve/revise/void.
- `[ ]` Add unit tests for all calculation edge cases and historical correction scenarios.
- `[ ]` Add integration tests for `/api/igsrt`.
- `[ ]` Add clinician sign-off checklist before any production use.

Pre-mortem:

- Failure mode: staff trust unvalidated calculation output because it looks polished.
- Early warning: calculation warnings are hidden, ignored, or not tied to clinical sign-off.
- Prevention: keep "Clinical Validation Required" visible until documented validation is complete and versioned.

### Phase 7: Billing, Coding, Audit, And Closeout

Current completion: 35%

Goal: make billing readiness and audit closeout enforceable, traceable, and evidence-backed.

What is already done:

- `[x]` Billing code and billing item types exist.
- `[x]` Billing page displays planned/completed/billed quantities from mock data.
- `[x]` Audit check types exist.
- `[x]` Audit page displays readiness, blockers, checks, and evidence-like rows.
- `[x]` `auditReadinessScore()` calculates readiness from tasks, documents, and fractions.
- `[x]` Audit/security log pages show tokenized/redacted event tables.
- `[x]` Carepath PreAuth Audit template sources are tracked as mapping-in-progress.

Remaining checklist:

- `[ ]` Define billing code master and real code applicability rules.
- `[ ]` Model payer/preauthorization status and required evidence.
- `[ ]` Link billing items to documents, tasks, treatment fractions, and signatures.
- `[ ]` Implement closeout gate: treatment summary, follow-up, billing, required docs, signatures, images, N/A reasons, and final Carepath audit sign.
- `[ ]` Implement final audit sign and course close/lock.
- `[ ]` Add immutable audit events for all closeout actions.
- `[ ]` Add billing/audit exception workflow with reason, owner, due date, and resolution.
- `[ ]` Add reporting for blocked audits, missing docs, missing signatures, missing billing evidence, and overdue follow-ups.
- `[ ]` Add tests for closeout readiness and blocked/exception cases.

Pre-mortem:

- Failure mode: a course is marked closed while billing, signatures, summary, or evidence is missing.
- Early warning: audit checks are displayed but not enforced by backend transitions.
- Prevention: make "close course" a backend command that fails with explicit blockers.

### Phase 8: Persistence, APIs, And Data Boundaries

Current completion: 25%

Goal: replace in-memory mock state with durable OPS/PHI persistence and server-owned APIs.

What is already done:

- `[x]` OPS Prisma schema exists.
- `[x]` PHI Prisma schema exists.
- `[x]` Legacy unified Prisma schema exists.
- `[x]` API routes exist for workflow, patients, IGSRT, and generated documents.
- `[x]` Operational redaction helpers exist.
- `[x]` `server-only` is used in PHI store and fraction log registry service.
- `[x]` `getOperationalWorkflowSnapshot()` exists.

Remaining checklist:

- `[!]` Decide the migration path away from in-memory `clinical-store`.
- `[ ]` Generate Prisma clients for OPS and PHI schemas.
- `[ ]` Configure `OPS_DATABASE_URL` and `PHI_DATABASE_URL` in deployment environments.
- `[ ]` Create migrations for OPS schema.
- `[ ]` Create migrations for PHI schema.
- `[ ]` Implement repository/data-access layer for OPS entities.
- `[ ]` Implement server-only PHI access layer.
- `[ ]` Replace mock data reads in production routes/pages with API/server data.
- `[ ]` Add DTOs that never expose PHI except to authorized PHI routes.
- `[ ]` Add transaction boundaries for patient/course/workflow/document/task creation.
- `[ ]` Add append-only audit event storage.
- `[ ]` Add seed data for demo environments without real PHI.
- `[ ]` Add API input validation.
- `[ ]` Add API integration tests.

Pre-mortem:

- Failure mode: OPS and PHI separation exists in schemas but application code keeps joining raw patient data into broad client views.
- Early warning: client components import `patients` or raw PHI-bearing objects from `clinical-store`.
- Prevention: replace direct imports with server DTO builders and expand HIPAA guardrails to all PHI-sensitive routes.

### Phase 9: Authentication, RBAC, Security, And HIPAA Hardening

Current completion: 35%

Goal: make the app safe for role-based clinical operations and real PHI/ePHI.

What is already done:

- `[x]` Roles are defined in docs and types.
- `[x]` PHI role set exists in `lib/server/phi-store.ts`.
- `[x]` PHI routes return `PHI access denied` without a recognized `x-curerays-role` header.
- `[x]` HIPAA utility functions redact operational data.
- `[x]` HIPAA guardrail script checks selected boundaries.
- `[x]` Audit/security log screens exist with mock/tokenized events.
- `[x]` Central prototype RBAC matrix exists in `lib/rbac.ts`.
- `[x]` PHI API routes use shared role/action helpers instead of local role lists.
- `[x]` Users/Roles display data derives from the same role matrix.
- `[x]` Guardrails check raw-patient client imports and forbid direct client imports of selected PHI-only modules.
- `[x]` Production security headers are configured in Next.js.

Remaining checklist:

- `[!]` Replace `x-curerays-role` header authorization with real authentication and session role claims.
- `[~]` Expand guardrails to catch all client imports of PHI-bearing modules, including patient registry/workspace cases. Current guardrails catch raw patient imports and selected PHI-only modules; transitive client bundle analysis is still needed.
- `[ ]` Implement MFA, session timeout, secure cookies, CSRF strategy if applicable, password/session policy, and logout.
- `[~]` Enforce RBAC by module, route, action, and data sensitivity. Prototype route/action checks exist for PHI, documents, IGSRT mutation, and fraction approvals.
- `[x]` Add least-privilege role matrix for VA, MA, RTT, NP/PA, PCP, Rad Onc, Physicist, Billing, and Admin.
- `[ ]` Add row/facility/location-level scoping if CureRays needs multi-location isolation.
- `[ ]` Add immutable audit logs for PHI reads and writes.
- `[ ]` Remove PHI from logs, errors, stack traces, localStorage/sessionStorage, URLs, analytics, and client bundles.
- `[~]` Add production security headers and monitoring. Security headers exist; monitoring is not implemented.
- `[ ]` Confirm hosting, database, file storage, logs, backups, email, and integrations are BAA-covered where required.
- `[ ]` Add backup/recovery and breach-response procedures.
- `[ ]` Add penetration/security review before go-live.

Pre-mortem:

- Failure mode: prototype PHI shortcuts accidentally ship to production.
- Early warning: mock PHI names/MRNs still appear in client-rendered bundles or unauthenticated pages.
- Prevention: create a production build gate that fails if PHI-bearing modules are imported by client components or public routes.

### Phase 10: Testing, QA, Release, And Pilot Operations

Current completion: 30%

Goal: create confidence that the system works repeatedly, safely, and recoverably.

What is already done:

- `[x]` TypeScript strict mode is enabled.
- `[x]` ESLint passes.
- `[x]` HIPAA guardrail script exists and passes.
- `[x]` Fraction worksheet fixture script exists and passes with `TMPDIR=/tmp`.
- `[x]` Production build passes.

Remaining checklist:

- `[ ]` Add Vitest or Jest for service/unit tests.
- `[ ]` Add React Testing Library for critical components.
- `[ ]` Add Playwright for route smoke tests and primary workflows.
- `[ ]` Add API integration tests for patients, workflow, IGSRT, documents.
- `[ ]` Add seed/reset strategy for test data.
- `[ ]` Add CI pipeline.
- `[ ]` Add release checklist.
- `[ ]` Add environment separation: local, demo, staging, production.
- `[ ]` Add deployment plan and rollback plan.
- `[ ]` Add monitoring/logging with PHI redaction.
- `[ ]` Add user acceptance testing scripts for each role.
- `[ ]` Add clinical validation records for treatment/fraction logic.
- `[ ]` Add staff training checklist and support workflow.

Pre-mortem:

- Failure mode: the app works in developer demos but breaks during real clinic workflow because no automated tests cover complete role flows.
- Early warning: regressions are found manually after UI changes, especially in data tables and fraction workflows.
- Prevention: automate patient creation, course creation, fraction entry, document signing, audit closeout, and role-permission tests before pilot.

## Critical Cross-Cutting Blockers

These should be treated as release gates, not optional cleanup.

- `[!]` PHI in client components: client pages/components must not import raw `patients`, MRNs, names, notes, or generated previews for production.
- `[!]` No durable persistence: current mutations are in-memory and will be lost on restart.
- `[!]` No real authentication/RBAC: role headers are placeholders only.
- `[!]` No immutable audit trail: audit events are in-memory and use placeholder actors.
- `[!]` No real document/file integration: generated output is simulated.
- `[!]` No clinical validation for calculation logic.
- `[!]` Add Patient is wired for prototype-only in-memory workflows, but many other visible action buttons remain disabled placeholders or are not wired to production workflows.

## Recommended Execution Order

### Immediate Stabilization Sprint

Target completion outcome: prototype stays buildable, clear, and honest.

- `[ ]` Add this tracker to the team update ritual.
- `[x]` Add `npm run verify`.
- `[~]` Expand HIPAA guardrails to catch client imports of `clinical-store` PHI data.
- `[~]` Mark or wire non-functional action buttons.
- `[x]` Refactor patient registry to use operational/server DTOs instead of client PHI imports.
- `[x]` Decide whether to use the richer `PatientsRegistry` component or the simpler shared `DataTable` page.
- `[x]` Add demo-only banner.

### MVP Workflow Sprint

Target completion outcome: patient registration through record maintenance works with de-identified durable data.

- `[ ]` Implement persistent patient/course storage for demo/staging.
- `[x]` Wire Add Patient and Edit Patient UI for prototype in-memory state.
- `[~]` Implement create-course flow. Prototype patient creation creates a default course; durable workflow-definition selection is incomplete.
- `[~]` Auto-create workflow steps, tasks, document requirements, audit checks, and folder placeholders. Prototype creates tasks/documents; workflow steps, audit checks, folders, and transaction safety remain incomplete.
- `[ ]` Add tests around patient/course creation and update.

### Clinical Operations Sprint

Target completion outcome: the strongest workflows become usable by roles in a pilot setting.

- `[ ]` Persist IGSRT simulation order, prescription, and fraction worksheet data.
- `[x]` Add role enforcement for DOT/MD approvals.
- `[ ]` Add workflow transition gates.
- `[ ]` Add document render/sign lifecycle persistence.
- `[ ]` Add audit event persistence.

### Integration Sprint

Target completion outcome: the app starts replacing manual Drive/eCW handoffs.

- `[ ]` Implement Drive template sync.
- `[ ]` Implement generated file storage.
- `[ ]` Implement folder creation.
- `[ ]` Implement eCW upload status workflow or integration.
- `[ ]` Implement electronic/manual signature flow.

### Production Hardening Sprint

Target completion outcome: real PHI/ePHI go-live readiness.

- `[ ]` Real auth and RBAC.
- `[ ]` OPS/PHI DB split with server-only access.
- `[ ]` Security review and BAA infrastructure confirmation.
- `[ ]` Monitoring, logging, backup/recovery, incident response.
- `[ ]` Full test suite and UAT.
- `[ ]` Clinical validation sign-off.

## Update Log

| Date | Update | Evidence | Next action |
|---|---|---|---|
| 2026-06-11 | Created initial system progress tracker from repo/docs/code audit. | Docs, routes, services, Prisma schemas, validation scripts, build output reviewed. | Use this as the working checklist for the next implementation phase. |
| 2026-06-11 | Verified current checks. | Typecheck, lint, HIPAA guardrails, fraction worksheet fixture with `TMPDIR=/tmp`, and build passed. | Add `npm run verify` and CI. |
| 2026-06-11 | Identified major go-live blockers. | Client PHI imports, in-memory state, auth header placeholder, simulated documents/storage, missing clinical validation. | Prioritize PHI/client boundary and persistent patient/course creation. |
| 2026-06-11 | Completed one-pass prototype hardening for Phases 0, 1, 2, 6, and 9. | Added `npm run verify`, route smoke, CI, security headers, scrollbar tokens, prototype banner, tokenized `/patients`, guarded Add/Edit Patient forms, patient validation, in-memory course/task/document bundle creation, RBAC helper, fraction reference versioning, approval role gates, expanded HIPAA guardrails, and disabled several placeholder actions. `npm run verify` passed. | Next priority: durable OPS/PHI persistence, real auth/session claims, immutable audit trail, full client-bundle PHI analysis, and formal clinical validation. |
