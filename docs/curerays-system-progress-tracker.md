# CureRays CRMS System Progress Tracker

Last updated: 2026-06-12

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

- Local prototype/app shell readiness: 87%
- End-to-end demo workflow readiness using mock/database-seeded de-identified data: 76%
- Real clinic pilot readiness with strictly de-identified or synthetic data: 56%
- Production readiness for real PHI/ePHI: 31%

Plain answer to the question "pwede na ba from patient registration to record maintenance and updating?":

The system can run locally and can demonstrate the patient-course operating model with mock or locally seeded PostgreSQL data. It can list tokenized patient records, open patient workspaces, show course/workflow/document/fraction/billing/audit state, create and edit patient-course bundles through guarded PHI actions, select workflow definitions from intake course fields, create workflow/task/document/audit/folder placeholders with rollback checks, record redacted correction history with optimistic concurrency, render simulated document previews, sign simulated documents, and update/approve/void fraction worksheet rows.

It is ready to pilot the Phase 2 patient-registration-to-maintenance path with strictly de-identified or synthetic data. Patient creation and update are owned by a server-only service with a repository contract, memory fallback, opt-in Prisma OPS/PHI persistence adapter, tokenized responses, workflow bundle post-conditions, server-owned prototype session claims, and redacted correction history. Local OPS/PHI PostgreSQL tables can now be created and seeded, and server-rendered pages can hydrate the prototype store from PostgreSQL before rendering dashboards, analytics, reports, and other store-backed views. It is still not ready for live PHI clinical use because real authentication/session management, production deployment controls, immutable audit infrastructure, full PHI client-boundary hardening, and full Prisma-native mutation coverage remain later-phase blockers. So: pwede na for internal demo and de-identified pilot workflow alignment; hindi pa pwede for live PHI clinical use.

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
- `lib/template-registry-data.json`
- `lib/module-data.ts`
- `lib/services/**`
- `lib/hipaa.ts`
- `lib/server/phi-store.ts`
- `lib/server/patient-registration-service.ts`
- `lib/server/document-lifecycle-service.ts`
- `lib/server/template-registry-verification.ts`
- `lib/server/phase6-treatment-workflow-service.ts`
- `prisma/schema.prisma`
- `prisma/ops-schema.prisma`
- `prisma/phi-schema.prisma`
- `scripts/hipaa-guardrails.mjs`
- `scripts/phase0-guardrails.mjs`
- `scripts/phase2-patient-registration.mjs`
- `scripts/phase3-workflow-engine.mjs`
- `scripts/phase4-template-registry.mjs`
- `scripts/phase5-document-lifecycle.mjs`
- `scripts/phase6-treatment-planning.mjs`
- `scripts/fraction-worksheet-fixtures.mjs`
- `scripts/route-smoke.mjs`
- `.github/workflows/verify.yml`

Verification run on 2026-06-12:

- `[x]` `npm run typecheck` passed.
- `[x]` `npm run lint` passed. Existing repo warnings remain and should not be treated as production-clean.
- `[x]` `npm run test:phase0` passed.
- `[x]` `npm run test:hipaa` passed.
- `[x]` `TMPDIR=/tmp npm run test:fraction-worksheet` passed. The plain script initially tried to write to the Windows temp folder, which is read-only in this sandbox, so the stable local command should set `TMPDIR=/tmp` when needed.
- `[x]` `npm run test:phase4` passed.
- `[x]` `npm run test:phase5` passed.
- `[x]` `npm run test:phase6` passed.
- `[x]` `npm run test:later-phases` passed.
- `[x]` `npm run test:routes` passed.
- `[x]` `npm run test:phase1` passed.
- `[x]` `npm run test:phase2` passed.
- `[x]` `npm run test:phase3` passed.
- `[x]` Prototype tooling now separates fast daily checks from heavy validation: `npm run verify` is typecheck plus lint, while `npm run test:full` covers build and all phase/HIPAA guardrails.
- `[x]` HIPAA and phase guardrail scripts remain intact and runnable outside the lightweight prototype gate.

Current inventory:

- 34 App Router page files.
- 7 API route files.
- 63 component TSX files.
- 17 service files under `lib/services`.
- 1 shared RBAC helper in `lib/rbac.ts`.
- 1 server-only patient registration service in `lib/server/patient-registration-service.ts`.
- 3 later-phase server-only grounding helpers for workflow commands, document lifecycle, and closeout readiness.
- 1 Phase 0 baseline guardrail in `scripts/phase0-guardrails.mjs`.
- 1 Phase 2 patient registration guardrail in `scripts/phase2-patient-registration.mjs`.
- 1 Phase 4 template registry guardrail in `scripts/phase4-template-registry.mjs`.
- 1 Phase 5 document lifecycle guardrail in `scripts/phase5-document-lifecycle.mjs`.
- 1 Phase 6 treatment planning/fraction worksheet guardrail in `scripts/phase6-treatment-planning.mjs`.
- 1 later-phase grounding guardrail in `scripts/later-phase-grounding.mjs`.
- 30 normalized local template files under `docs/2026_TEMPLATES`.
- 31 `TemplateSource` records loaded from `lib/template-registry-data.json`: 22 active, 2 mapping-in-progress, 6 draft, 1 missing placeholder.
- 25 `DocumentRequirement` records with Phase 4 metadata, reviewer roles, pilot scope, CPT relevance, and field-map links.
- 25 `TemplateFieldMap` records plus 4 explicit deferral/future-placeholder records.
- 4 workflow definitions: Universal active; Skin Cancer IGSRT, Arthritis, and Dupuytren's mapping-in-progress.
- Mock data baseline: 6 patients, 6 treatment courses, 7 mock tasks, 8 mock generated documents, 3 mock fraction rows, plus additional clinical-store/task/template-derived state.
- Local PostgreSQL demo seed baseline: 6 OPS/PHI patients and courses, 36 OPS carepath tasks, 36 OPS generated documents, 36 PHI fraction log rows, treatment fractions, prescriptions, simulation orders, mapping rows, generated outputs, template/workflow rows, and audit events.

## Current Functional Map

### Functioning Now For Demo

- `[x]` Local Next.js app builds and runs.
- `[x]` Branded login/landing screen exists.
- `[x]` Dashboard exists with telemetry-heavy operational views and now hydrates from local OPS/PHI PostgreSQL seed data when `CURERAYS_PERSISTENCE_MODE=prisma` is enabled.
- `[x]` Patient registry, master records, upcoming, on-treatment, and post-treatment views display patient/course state from the shared store; server layout hydration can now load that store from local PostgreSQL before render.
- `[x]` Patient workspace route exists and can show workflow, tasks, clinical, planning, imaging, documents, fractions, billing/audit, and activity tabs for mock patients.
- `[x]` Workflow pages show canonical Carepath steps and blockers from mock/generated or locally seeded PostgreSQL-backed state.
- `[x]` Task, schedule, clinical forms, treatment planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` IGSRT fraction worksheet can add, update, approve, request revision, and void rows against in-memory state.
- `[x]` Fraction worksheet calculations have a fixture script and preserve a "clinical validation required" warning.
- `[x]` Generated document render/sign flows exist as simulated outputs from structured state.
- `[x]` Operational workflow API returns tokenized operational data.
- `[x]` PHI access helper exists with role header gating for PHI routes.
- `[x]` HIPAA guardrail script checks selected PHI boundaries.

### Partially Functioning

- `[~]` Patient registration: `POST /api/patients` and Add Patient UI are wired through a server-only registration service, but no persistent database transaction creates the patient/course/workflow/task/folder bundle.
- `[~]` Patient record maintenance: `PATCH /api/patients/[id]` and Edit Patient UI are wired through the server-only registration service, but updates are in-memory only and there is no consent/history handling or persistent audit trail.
- `[~]` Course/workflow automation: canonical steps and automation rules are documented; generated task/document helpers exist; full "create course -> create steps/tasks/docs/folders" automation is not implemented as durable backend logic.
- `[~]` Template registry: local files are normalized; Phase 4 pilot metadata, field maps, approval status, explicit deferrals, future placeholders, and source-hash checks exist. Live Drive sync and real generation remain later-phase work.
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
| Patient registration | 42% | Add Patient UI posts to a server-owned API path that validates required fields and duplicate MRNs, creates an in-memory patient/course/task/document bundle, returns tokenized output, and records redacted audit metadata. | No persistence; no real auth/session; no Prisma transaction; workflow-definition selection and folder placeholders are incomplete. |
| Patient registry | 65% | `/patients`, `/records`, phase pages, search/filter tables, patient workspace links. | Some client pages import PHI-bearing mock data; operational DTO standard not enforced everywhere; no backend pagination/query permissions. |
| Patient profile/workspace | 68% | Patient workspace displays course, workflow, tasks, documents, fractions, planning, imaging, billing/audit, activity. | Mostly read-only except fraction/IGSRT-specific routes; PHI handling is prototype-only; no durable writes. |
| Record update/maintenance | 44% | Edit Patient UI fetches PHI explicitly, patches through a guarded server service, validates duplicate MRNs, returns redacted operational output, and captures actor-shaped audit metadata. IGSRT simulation/prescription/fractions/doc statuses update in memory. | No DB transaction; no field-level validation policy; no immutable audit trail; user attribution still comes from prototype headers/placeholders. |
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

Current completion: 100%

Goal: keep the prototype coherent, buildable, and aligned with CureRays' patient-course operating model.

Phase 0 is complete for baseline, product-alignment, and repo-health purposes. This does not mean production PHI/ePHI readiness; durable persistence, real auth/RBAC, immutable audit, integrations, and formal clinical validation remain later-phase blockers.

What is already done:

- `[x]` Product context documented.
- `[x]` Workflow model documented.
- `[x]` Page plan documented.
- `[x]` Data model documented.
- `[x]` File/document storage model documented.
- `[x]` Automation rules documented.
- `[x]` Template registry and normalization manifest documented.
- `[x]` Next.js, React, TypeScript, Tailwind, lucide-react, echarts, recharts, and d3-force dependencies installed.
- `[x]` `npm run typecheck` passes.
- `[x]` `npm run lint` passes.
- `[x]` `npm run build` passes on latest rerun.
- `[x]` `npm run test:hipaa` passes.
- `[x]` `TMPDIR=/tmp npm run test:fraction-worksheet` passes.
- `[x]` `npm run test:routes` passes.
- `[x]` `npm run test:phase0` passes.
- `[x]` `npm run verify` is the fast prototype gate for typecheck and lint.
- `[x]` `npm run test:full` is the full validation suite for verify, build, phase guardrails, and HIPAA guardrails.
- `[x]` CI workflow exists for `npm run verify`.
- `[x]` Global scrollbar styling uses top-level design tokens.
- `[x]` Next.js build no longer ignores lint/type errors, and baseline security headers are configured.
- `[x]` Hardcoded UI color literals are removed from `app`, `components`, and `lib` outside global token definitions.
- `[x]` Legacy dark-mode bridges for hardcoded Tailwind hex classes were removed from `app/globals.css`.
- `[x]` Deprecated root UI primitives were removed or moved into `components/ui` and `components/shared`.
- `[x]` Operational page data imports now route through a server-only service helper where appropriate.

Remaining checklist:

- `[x]` Refactor hardcoded hex colors in app/component/lib UI files to CSS tokens. Current scan finds zero hardcoded color literals outside `app/globals.css`.
- `[x]` Normalize current page/component architecture around `components/ui`, `components/shared`, and token-based styling rules.
- `[x]` Convert old page-specific imports of mock/clinical data to service or server component access where appropriate.
- `[x]` Keep `npm run verify` lightweight for prototype feature work.
- `[x]` Add a repeatable `npm run test:full` script for build, HIPAA guardrails, fraction fixtures, route smoke, and phase guardrails.
- `[x]` Add CI for `npm run verify`.
- `[x]` Decide whether `TMPDIR=/tmp` should be embedded in the fraction fixture script or documented as a local Windows/WSL command requirement. Heavy guardrails now run through `npm run test:guardrails` or `npm run test:full`.
- `[x]` Decide whether the first intermittent build failure at `/api/patients` needs a specific regression test if it appears again. No recurrence was observed after route, type, lint, guardrail, and build verification.

Pre-mortem:

- Failure mode: the team keeps adding screens faster than shared patterns stabilize.
- Early warning: duplicate UI primitives, hardcoded colors, mock data imports in many pages, and inconsistent client/server boundaries.
- Prevention: complete the shared layout/UI consolidation before adding major workflow features.

### Phase 1: Prototype Navigation And Operational Visibility

Current completion: 100%

Goal: make the app usable as an internal demo command center using mock or de-identified data.

Phase 1 is complete for internal prototype navigation and operational visibility only. This does not change the later production blockers for real PHI/ePHI use: durable auth, RBAC, OPS/PHI persistence, immutable audit, storage, eCW, and signature integrations remain out of Phase 1 scope.

What is already done:

- `[x]` Landing/login page exists.
- `[x]` Dashboard exists and builds.
- `[x]` Sidebar/navigation covers the main modules.
- `[x]` Patient registry and phase views exist.
- `[x]` Patient workspace exists.
- `[x]` Workflow, tasks, schedule, clinical forms, planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` DataTable and shared stat/page components are used in many pages.
- `[x]` Route smoke script verifies sidebar routes, secondary operational routes, and representative dynamic patient routes.
- `[x]` App shell shows a global prototype/de-identified-data banner.
- `[x]` Non-wired visible prototype actions are disabled for demo clarity.
- `[x]` App-level loading and error boundaries use non-PHI operational copy.
- `[x]` Shared `DataTable` and `StaticDataTable` support explicit loading, empty, and error states.
- `[x]` Phase 1 operational visibility guardrail validates table empty copy, placeholder action states, and route-level loading/error files.

Remaining checklist:

- `[x]` Confirm every nav item points to a meaningful route and no dead routes remain.
- `[x]` Replace non-wired action buttons with either real handlers or disabled/coming-soon states for pilot clarity.
- `[x]` Align patient registry implementation around shared `DataTable` and operational DTOs. The richer `components/patients/patients-registry.tsx` remains unsuitable for production because it is PHI-heavy.
- `[x]` Add route smoke tests for sidebar routes, secondary operational routes, and representative dynamic patient routes.
- `[x]` Add empty/error/loading states for every table-driven page.
- `[x]` Add consistent app-level "mock/de-identified data only" environment banner until production controls exist.

Pre-mortem:

- Failure mode: stakeholders believe visible pages mean backend workflows are complete.
- Early warning: buttons named Add, Upload, Create, Edit, or Sync do nothing or only update runtime memory.
- Prevention: label the prototype status clearly and prioritize wiring the end-to-end patient/course path.

Baseline note: Phase 0 and Phase 1 are now treated as committed baseline architecture as of 2026-06-11. No dirty-worktree preservation assumptions remain.

### Phase 2: Patient Registration, Registry, And Record Maintenance

Current completion: 100% for de-identified pilot scope; production PHI readiness remains blocked by later security/persistence hardening.

Goal: support safe patient/course intake and ongoing record maintenance as structured app state.

Phase 2 is complete for strictly de-identified or synthetic pilot data. It does not authorize live PHI use; real authentication, production session controls, immutable audit infrastructure, deployed database migrations, and full client-bundle PHI hardening remain later-phase requirements.

What is already done:

- `[x]` Patient and course types exist.
- `[x]` Mock patients and treatment courses exist.
- `[x]` `createPatient(input)` can create an in-memory patient.
- `[x]` `updatePatient(id, input)` can update an in-memory patient.
- `[x]` `GET /api/patients` returns operational patients through the server-only patient registration service.
- `[x]` `POST /api/patients` delegates to `registerPatient()` behind server-owned prototype session claims.
- `[x]` `GET /api/patients/[id]` returns a guarded minimal `PatientEditDto`, not the raw `Patient` object.
- `[x]` `PATCH /api/patients/[id]` delegates to `updatePatientRecord()` with optimistic concurrency and required change reason.
- `[x]` `GET /api/patients/[id]/history` returns redacted correction history.
- `[x]` `PATCH /api/patients/[id]/lifecycle` supports patient/course lifecycle and phase updates while modeling completion at the course level.
- `[x]` `patientRef`, `courseRef`, and `phiRecordId` helpers exist.
- `[x]` Redacted audit events are created for in-memory create/update operations with actor-shaped metadata fields.
- `[x]` `/patients` renders tokenized operational DTOs by default and no longer imports raw `patients`.
- `[x]` Add Patient UI posts to a validated create-patient API path.
- `[x]` Edit Patient UI fetches PHI only after explicit user action and patches through the guarded API.
- `[x]` Required-field validation and duplicate MRN checks exist in the prototype API/store path.
- `[x]` Patient creation accepts initial-course fields: protocol, body region/site, laterality, modality, total fractions, and start date.
- `[x]` Patient creation selects workflow definitions by diagnosis/protocol/body region/modality with universal fallback.
- `[x]` Patient creation creates course, workflow steps, tasks, document requirements, audit checks, and folder placeholders as one checked bundle.
- `[x]` `lib/server/patient-registration-service.ts` owns the create/update service API and returns only operational/redacted mutation responses.
- `[x]` `PatientRegistrationRepository` defines the persistence contract with the current in-memory adapter and an opt-in Prisma OPS/PHI adapter behind `CURERAYS_PATIENT_REPOSITORY` / `CURERAYS_PERSISTENCE_MODE`.
- `[x]` Prototype patient creation now uses rollback checkpoints for patient, course, document, task, workflow step, audit check, folder placeholder, history, and audit arrays if bundle post-conditions fail.
- `[x]` OPS and PHI Prisma audit models include actor metadata placeholders for role, session, IP, and device.
- `[x]` Prisma 6.19.3 is installed with OPS/PHI generation and migration scripts.
- `[x]` OPS/PHI schemas include course workflow metadata, operational workflow steps, audit checks, folder placeholders, and redacted record history.
- `[x]` `npm run test:phase2` validates service/repository boundary, API delegation, rollback structure, redacted responses, duplicate-MRN guard, workflow selection, bundle post-conditions, unauthorized access denial, optimistic concurrency, lifecycle updates, and correction history.

Remaining checklist:

- `[!]` Remove PHI-bearing patient data from all client bundles before production. `/patients` is hardened, but patient workspaces and other prototype paths still intentionally render PHI after server-side lookup.
- `[x]` Wire Add Patient UI to a validated create-patient form.
- `[x]` Wire Edit Patient UI to `PATCH /api/patients/[id]`.
- `[x]` Add patient search, duplicate checking, MRN uniqueness checks, and required-field validation.
- `[x]` Create course creation flow as part of registration with initial-course fields.
- `[x]` On course creation, select the workflow definition by diagnosis/protocol/body region/laterality/modality.
- `[x]` On course creation, create workflow steps, tasks, document requirements, initial audit checks, and folder placeholders in one checked bundle with in-memory rollback.
- `[x]` Add patient status update workflow for active, on hold, and paused.
- `[x]` Add course-level completion and phase update workflow for Upcoming, On Treatment, Post, and detailed internal phases.
- `[~]` Persist patients/courses in OPS/PHI databases. Opt-in Prisma adapter, generated clients, and schema support exist; deployed database migrations/environments remain Phase 8/production work.
- `[~]` Add audit trail with authenticated actor, IP/device/session, before/after redaction, and reason for sensitive changes. Redacted history and actor-shaped metadata exist; real authenticated session claims and immutable audit storage remain incomplete.
- `[x]` Add optimistic concurrency rules for simultaneous edits using `expectedLastUpdatedAt`.
- `[x]` Add record history view/API and correction policy with redacted append-only entries; destructive rollback is intentionally not implemented.
- `[~]` Add React/UI tests for registration and update flows. Deferred until a React test framework is introduced; Phase 2 has service/route guardrails.
- `[x]` Add lightweight Node route/service integration tests for create/update/list/read, duplicate rollback, workflow selection, bundle post-conditions, unauthorized PHI denial, concurrency conflict, lifecycle update, and redacted history.

Pre-mortem:

- Failure mode: a patient is created without a linked course, workflow, tasks, documents, or folder placeholders, causing downstream pages to show inconsistent state.
- Early warning: a new patient appears in `/patients` but not in `/records`, `/workflow`, `/tasks`, documents, or phase views.
- Prevention: implement patient/course creation as one backend transaction with rollback and required post-conditions.

### Phase 3: Course Workflow Engine And Task Queues

Current completion: 100% for prototype-seam scope; production persistence, real auth, immutable audit infrastructure, and external notification delivery remain later-phase work.

Goal: make workflows and task queues the operational source of truth instead of static page data.

Phase 3 is complete for de-identified pilot workflow operations. Workflow steps and task queues are now owned by a server-only command service with guarded mutations, role-gated prototype actions, tokenized DTOs, due-date/overdue derivation, explicit N/A rules, assignment/reassignment commands, task reopen/block/complete flows, and redacted audit events. The implementation intentionally uses the in-memory repository adapter by default with a Prisma-ready repository seam; deployed database-backed workflow persistence remains a Phase 8/production hardening requirement.

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
- `[x]` Server-only workflow command helper evaluates course advancement blockers and N/A reason requirements without mutating state.
- `[x]` `lib/server/workflow-command-service.ts` owns workflow/task list, queue, transition, N/A, assignment, blocked, completed, reopen, and audit command behavior.
- `[x]` `WorkflowTaskRepository` seam exists with default in-memory adapter and opt-in Prisma-ready adapter selected by `CURERAYS_WORKFLOW_REPOSITORY` / `CURERAYS_PERSISTENCE_MODE`.
- `[x]` Workflow and task command APIs exist: `GET /api/workflow`, `POST /api/workflow/courses/[courseId]/advance`, `PATCH /api/workflow/steps/[stepId]`, `GET /api/tasks`, and `PATCH /api/tasks/[taskId]`.
- `[x]` `/workflow` and `/tasks` now use command clients backed by tokenized command snapshots instead of disabled placeholder actions.
- `[x]` Due-date rules by Carepath phase drive stored workflow rows and task overdue derivation.
- `[x]` Removed Carepath steps initialize as N/A with system reasons; optional and required N/A logic is enforced by backend commands.
- `[x]` Phase 3 guardrail validates workflow creation, transition blockers, successful advancement, N/A reason enforcement, overdue logic, role queues, task mutation flows, and redacted audit events.

Remaining checklist:

- `[x]` Persist workflow steps and tasks for prototype runtime through stored in-memory rows and command-owned mutations; live OPS persistence remains behind the repository seam for later deployment.
- `[x]` Implement create-course workflow-definition selection.
- `[x]` Generate applicable workflow steps from `WorkflowDefinition.documentRequirementIds`.
- `[x]` Enforce optional/removed step logic with explicit N/A reason where relevant.
- `[x]` Implement guarded workflow transitions with blockers, mutation commands, optimistic phase checks, and redacted audit events.
- `[x]` Add due date calculation rules by phase/role/template for prototype workflow timing.
- `[x]` Add task assignment and reassignment UI.
- `[x]` Add task completion, review, signature, blocked, overdue, N/A, and reopen flows.
- `[x]` Add role-specific queue views backed by prototype authenticated user context.
- `[x]` Add notification/escalation rules for prototype queues through blocked, overdue, signature, unassigned, and role-lane queue surfaces; external notification delivery remains later-phase work.
- `[x]` Add audit events for workflow transitions and task mutations.
- `[x]` Add tests for workflow creation, transition guards, N/A reason enforcement, blockers, overdue logic, and role queues.

Pre-mortem:

- Failure mode: workflow state becomes another spreadsheet-like status label instead of a controlled state machine.
- Early warning: users can mark a course On Treatment even while required planning/signature/fraction prerequisites are incomplete.
- Prevention: make phase advancement a backend command with blockers returned to the UI.

### Phase 4: Template Registry And Document Requirements

Current completion: 100% for de-identified pilot scope; production document generation remains Phase 5.

Goal: turn the Drive template inventory into app-readable, versioned, clinically approved document requirements.

Phase 4 is complete for registry and workflow-readiness purposes. This does not mean document generation is production-ready: DOCX/PPTX/XLSX/PDF merge/export, live Drive sync, eCW upload, electronic signature integration, immutable output versioning, and production clinical sign-off remain Phase 5 and hardening work.

What is already done:

- `[x]` 30 local source files normalized under `docs/2026_TEMPLATES`.
- `[x]` Normalization manifest includes original path, normalized path, diagnosis, workflow step, app category, status, SHA-256, and notes.
- `[x]` `lib/template-registry-data.json` is the canonical structured metadata source for template sources, document requirements, workflow definitions, field maps, and placeholders.
- `[x]` `lib/template-registry.ts` now acts as the typed loader/helper layer instead of hardcoding the registry arrays.
- `[x]` `templateSources` includes 31 records, including active, draft, mapping-in-progress, and missing placeholder states.
- `[x]` `documentRequirements` includes 25 records with phase, role, reviewer role, diagnosis/protocol/body-region/laterality/modality applicability, required fields, output formats, CPT relevance, pilot scope, and generation-readiness metadata.
- `[x]` `templateFieldMaps` includes 25 field-map records using existing form-section/field vocabulary.
- `[x]` Universal, Skin Cancer IGSRT, Arthritis, and Dupuytren's workflow definitions exist.
- `[x]` App pages can list templates, document rows, readiness, field-map status, source-hash status, approval status, and explicit placeholders.
- `[x]` `applicableDocumentRequirements()` and related helpers exist.
- `[x]` Later-phase guardrail verifies template source IDs, local source-file existence, workflow requirement references, and the expected missing billing pre-auth placeholder.
- `[x]` Server-only source-hash verification compares recorded SHA-256 values against normalized local files.
- `[x]` Phase 4 guardrail validates canonical JSON loading, uniqueness, hashes, requirement metadata, field-map coverage, approved deferrals/placeholders, workflow references, and applicability scenarios.

Remaining checklist:

- `[x]` Complete field-level mapping for each pilot-relevant active/current template.
- `[x]` Create a structured template metadata source that can be loaded without editing TypeScript for every registry change.
- `[x]` Add admin UI for template status, clinical approval, retirement, duplicate review, and missing template tracking.
- `[x]` Map every requirement to diagnosis, protocol, body region/site, laterality, modality, phase, responsible role, reviewer role, required fields, output formats, CPT relevance, and audit evidence.
- `[x]` Resolve all `MAPPING_IN_PROGRESS` statuses that are needed for pilot. Remaining mapping-in-progress pre-auth sources are explicit deferrals and are not autocreated.
- `[x]` Resolve the `MISSING` billing pre-authorization mapping placeholder or explicitly defer it. It is explicitly deferred, visible, non-autocreated, and non-generating.
- `[x]` Decide whether draft Gynecomastia fraction log remains out-of-scope. It is cataloged as a future placeholder with no workflow requirement.
- `[x]` Add template versioning and source hash verification in the app.
- `[x]` Add tests for requirement applicability by diagnosis/protocol/body site/laterality.

Pre-mortem:

- Failure mode: documents generate from the wrong template variant or omit required fields.
- Early warning: active templates have missing field maps, ambiguous laterality/site placeholders, or duplicated source candidates.
- Prevention: require template approval status and field-map completeness before production generation.

### Phase 5: Document Generation, Signatures, File Storage, Drive, And eCW

Current completion: 100% for de-identified pilot lifecycle scope; production Drive/eCW/e-signature and BAA-covered storage integration remain blocked.

Goal: generate, store, sign, export, upload, version, and audit patient/course documents.

Phase 5 is complete for adapter-ready, app-owned document lifecycle in the de-identified pilot. It does not mean real Google Drive file operations, eCW upload integration, electronic signature integration, BAA-covered production storage, or live PHI document handling are ready.

What is already done:

- `[x]` Generated document types and mock/generated document rows exist.
- `[x]` Simulated `renderGeneratedDocument()` creates versioned `GeneratedDocumentOutput` records in memory.
- `[x]` Simulated `signGeneratedDocument()` updates document and related IGSRT order/prescription status.
- `[x]` Documents page shows signature and eCW upload status.
- `[x]` File storage and Drive service names are documented.
- `[x]` `fileStorageService.createCourseFolders()` returns a planned folder list.
- `[x]` `driveSyncService` exists as a stub.
- `[x]` `documentGenerationService.generateFromTemplate()` exists as a stub.
- `[x]` Server-only document lifecycle helper owns generated-document read/render/sign command shape for the prototype adapter.
- `[x]` `/api/generated-documents/[id]` now requires PHI access for reads and routes render/sign mutations through the document lifecycle helper.
- `[x]` Server-only document lifecycle repository contract exists with an in-memory adapter and Prisma-ready boundary.
- `[x]` Lifecycle API responses use tokenized document/output DTOs and omit generated `contentPreview`.
- `[x]` Generated outputs use provider-neutral `APP_STORAGE` metadata and `app-storage://generated/...` references instead of fake `drive://` URLs.
- `[x]` Lifecycle commands exist for read, render, export, sign, manual eCW upload confirmation, output voiding, and manual edit exception recording.
- `[x]` Render/export are blocked when the linked template source is missing, draft, mapping-in-progress, or otherwise not active.
- `[x]` Signatures require a rendered/export-ready output, lock the current output, and record signer metadata.
- `[x]` Manual edit exceptions reopen review/signature state, increment output version state, and clear downstream eCW readiness.
- `[x]` Manual eCW upload confirmation records external reference/reason metadata after signed locked evidence exists.
- `[x]` `/api/igsrt` document actions delegate to the document lifecycle helper instead of calling raw store render/sign functions.
- `[x]` Documents page and patient workspace document tab show output version/status, storage state, lock state, manual exceptions, and eCW confirmation metadata without rendering generated content previews.
- `[x]` `scripts/phase5-document-lifecycle.mjs` verifies lifecycle commands, RBAC, versioning, locking, manual edit, eCW confirmation, API routing, storage references, and client-preview guardrails.

Remaining checklist:

- `[!]` Pick production file storage provider and confirm HIPAA/BAA coverage.
- `[~]` Implement template merge for DOCX. Adapter-ready lifecycle records exist; real DOCX generation libraries/integration remain future work.
- `[~]` Implement spreadsheet output for fraction logs. Adapter-ready XLSX lifecycle records exist; real XLSX generation remains future work.
- `[x]` Implement PPTX/isodose output strategy or keep as managed source artifact. PPTX/isodose remains a managed source artifact for pilot.
- `[~]` Implement PDF rendering/export. Adapter-ready PDF export state exists; real PDF rendering remains future work.
- `[ ]` Implement Drive template metadata sync.
- `[~]` Implement patient/course folder creation. Folder placeholders exist; live provider folder creation remains future work.
- `[x]` Store generated outputs outside the template library for pilot metadata via app-owned storage references.
- `[x]` Track document versions, lock state, reviewer/signer, export state, eCW upload state, storage URL, void state, and manual edit exception metadata.
- `[x]` Replace simulated `drive://` URLs with provider-neutral app storage references.
- `[x]` Add electronic signature provider or documented manual signature workflow. Pilot uses guarded manual signature state, not a live e-signature provider.
- `[x]` Add eCW upload integration or manual upload confirmation workflow. Pilot uses guarded manual eCW upload confirmation with external reference/reason.
- `[~]` Add audit events for open, render, sign, export, upload, void, and manual edit. Prototype render/export/sign/upload/void/manual-edit audit events exist; immutable production audit storage and open/read persistence remain incomplete.
- `[x]` Add tests for document generation, versioning, signing, lock rules, and eCW upload state.

Pre-mortem:

- Failure mode: Google Drive remains the real source of truth while the app only reflects stale metadata.
- Early warning: staff edit generated files manually and the app does not know which version is current.
- Prevention: app database owns lifecycle state; file edits become auditable outputs or exceptions.

### Phase 6: Treatment Planning And Fractionation Worksheet

Current completion: 100% for de-identified pilot/code-owned scope; formal clinical validation remains a production blocker.

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
- `[x]` Treatment fraction rows are now modeled separately from recorded worksheet rows, with prescription-derived schedule fields, linked worksheet row IDs, imaging gate state, OTV state, and physics-check state.
- `[x]` Prisma prototype and PHI schemas now include rich fraction calculation metadata, approval states, correction/revision/void metadata, and treatment fraction schedule models.
- `[x]` Server-owned Phase 6 workflow service exists for schedule generation, image linking, OTV/physics checks, and fraction mutation wrappers.
- `[x]` `/api/igsrt` supports `generateFractionSchedule`, `linkFractionImage`, `recordPhysicsCheck`, and `recordOtvCheck` in addition to the existing simulation, prescription, document, and fraction actions.
- `[x]` Treatment Planning page shows Phase 6 readiness, missing inputs, schedule coverage, imaging/OTV/physics gates, and worksheet links.
- `[x]` Patient Planning tab shows schedule coverage, missing imaging, OTV due, physics due, logged fraction count, and the clinical validation warning.
- `[x]` Native fraction worksheet consumes scheduled fraction defaults, exposes IMG/OTV/PHYS gate badges, links prototype imaging evidence, and disables DOT approval while required imaging is missing.
- `[x]` Historical corrections recalculate dependent active rows and reset downstream approvals when cumulative totals change.
- `[x]` Voided rows remain retained for history and are excluded from active recalculation paths.
- `[x]` Route-level `/api/igsrt` mutation authorization covers fraction approval and revision requests in addition to creation, correction, voiding, schedule, imaging, OTV, and physics actions.
- `[x]` Server-owned Phase 6 wrappers enforce clinical mutation access before approval and revision commands.
- `[x]` Invalid manual isodose override values are rejected, and duplicate active fraction rows for the same course/fraction number are blocked while voided rows remain historical.
- `[x]` Phase 6 readiness includes a version-tied clinical validation checklist for reference curves, rounding/override policy, cumulative recalculation, and generated note language.
- `[x]` Treatment Planning and patient Planning surfaces show clinician sign-off status, reference version, and required checklist evidence without offering a fake sign-off mutation.
- `[x]` `scripts/phase6-treatment-planning.mjs` verifies Phase 6 service/API/schema/UI/test wiring.

Remaining checklist:

- `[!]` Obtain formal clinical validation for reference curves, calculations, rounding, override rules, cumulative dose handling, and generated notes.
- `[x]` Version all clinical reference data and tie calculations to reference version for the prototype reference table.
- `[x]` Persist fraction entries and recalculated dependent totals in app-owned in-memory state for pilot. Durable OPS/PHI database persistence remains a production blocker.
- `[x]` Add role-specific MD and DOT approval enforcement at the prototype API boundary.
- `[x]` Add lock rules after final approval and clear correction workflows after lock.
- `[x]` Add treatment schedule/fraction creation from prescription for signed or prototype-ready prescriptions.
- `[x]` Connect imaging guidance completion to required image assets at the prototype evidence-gate level.
- `[x]` Connect weekly physics checks and OTV/treatment management rules at the prototype schedule-gate level.
- `[x]` Add redacted audit logs for fraction create/update/approve/revise/void plus schedule/image/OTV/physics actions.
- `[x]` Add guardrail coverage for calculation edge cases and historical correction scenarios. Formal unit-test framework remains future work.
- `[x]` Add API/workflow guardrail coverage for `/api/igsrt` Phase 6 actions. Full integration tests remain future work.
- `[x]` Add clinician sign-off checklist before any production use.

Pre-mortem:

- Failure mode: staff trust unvalidated calculation output because it looks polished.
- Early warning: calculation warnings are hidden, ignored, or not tied to clinical sign-off.
- Prevention: keep "Clinical Validation Required" and the clinician sign-off checklist visible until documented validation is complete and versioned.

### Phase 7: Billing, Coding, Audit, And Closeout

Current completion: 38%

Goal: make billing readiness and audit closeout enforceable, traceable, and evidence-backed.

What is already done:

- `[x]` Billing code and billing item types exist.
- `[x]` Billing page displays planned/completed/billed quantities from mock data.
- `[x]` Audit check types exist.
- `[x]` Audit page displays readiness, blockers, checks, and evidence-like rows.
- `[x]` `auditReadinessScore()` calculates readiness from tasks, documents, and fractions.
- `[x]` Audit/security log pages show tokenized/redacted event tables.
- `[x]` Carepath PreAuth Audit template sources are tracked as mapping-in-progress.
- `[x]` Server-only closeout readiness helper centralizes blockers across documents, signatures, fractions, billing items, audit checks, and final audit eligibility.

Remaining checklist:

- `[ ]` Define billing code master and real code applicability rules.
- `[ ]` Model payer/preauthorization status and required evidence.
- `[ ]` Link billing items to documents, tasks, treatment fractions, and signatures.
- `[~]` Implement closeout gate: treatment summary, follow-up, billing, required docs, signatures, images, N/A reasons, and final Carepath audit sign. Readiness evaluation exists; close/lock mutation is still not implemented.
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

Current completion: 42%

Goal: replace in-memory mock state with durable OPS/PHI persistence and server-owned APIs.

What is already done:

- `[x]` OPS Prisma schema exists.
- `[x]` PHI Prisma schema exists.
- `[x]` Legacy unified Prisma schema exists.
- `[x]` Local OPS/PHI PostgreSQL databases have been created and schema SQL has been applied for development.
- `[x]` Prisma clients for OPS and PHI schemas have been generated locally.
- `[x]` Local `.env` supports `OPS_DATABASE_URL`, `PHI_DATABASE_URL`, and `CURERAYS_PERSISTENCE_MODE=prisma`.
- `[x]` Local seed command exists: `npm run prisma:seed`.
- `[x]` Local seed data populates every current OPS/PHI Prisma model with synthetic/de-identified demo rows.
- `[x]` Server-only database hydration helper loads PostgreSQL rows into the shared clinical store before server-rendered pages render, with memory fallback.
- `[x]` Dashboard, Analytics, and Reports telemetry now await database hydration before building chart payloads.
- `[x]` API routes exist for workflow, patients, IGSRT, and generated documents.
- `[x]` Operational redaction helpers exist.
- `[x]` `server-only` is used in PHI store and fraction log registry service.
- `[x]` `getOperationalWorkflowSnapshot()` exists.
- `[x]` New workflow, document lifecycle, and closeout helpers define server-owned command/readiness interfaces while still using in-memory adapters.

Remaining checklist:

- `[~]` Complete the migration path away from in-memory `clinical-store`. Current state uses PostgreSQL hydration into the shared store rather than fully Prisma-native reads everywhere.
- `[~]` Configure `OPS_DATABASE_URL` and `PHI_DATABASE_URL` in deployment environments. Local development is configured; deployment/staging environments remain.
- `[ ]` Create tracked Prisma migrations for OPS schema. Local schema SQL exists, but migration history is not yet formalized.
- `[ ]` Create tracked Prisma migrations for PHI schema. Local schema SQL exists, but migration history is not yet formalized.
- `[~]` Implement repository/data-access layer for OPS entities. Patient/workflow seams and DB hydration exist; all routes/pages/actions are not fully repository-backed yet.
- `[~]` Implement server-only PHI access layer. PHI route helpers and DB hydration exist; production-grade access/audit policy remains incomplete.
- `[~]` Replace mock data reads in production routes/pages with API/server data. Server layout hydration now feeds many store-backed server views from PostgreSQL, but several modules still depend on hydrated in-memory arrays and fallback mock state.
- `[~]` Add DTOs that never expose PHI except to authorized PHI routes. Tokenized operational telemetry exists; full production DTO split for all patient workspace paths remains.
- `[ ]` Add transaction boundaries for patient/course/workflow/document/task creation.
- `[ ]` Add append-only audit event storage.
- `[x]` Add seed data for demo environments without real PHI.
- `[ ]` Add API input validation.
- `[ ]` Add API integration tests.

Pre-mortem:

- Failure mode: OPS and PHI separation exists in schemas but application code keeps joining raw patient data into broad client views.
- Early warning: client components import `patients` or raw PHI-bearing objects from `clinical-store`.
- Prevention: replace direct imports with server DTO builders and expand HIPAA guardrails to all PHI-sensitive routes.

### Phase 9: Authentication, RBAC, Security, And HIPAA Hardening

Current completion: 39%

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
- `[x]` HIPAA guardrails now walk transitive runtime imports from client entrypoints and block PHI/server modules from client bundles.
- `[x]` Raw patient-name formatting moved out of shared workflow helpers and into a server-only PHI formatting module.
- `[x]` Generated document content previews are no longer stored or rendered by the IGSRT client workspace.

Remaining checklist:

- `[!]` Replace `x-curerays-role` header authorization with real authentication and session role claims.
- `[~]` Expand guardrails to catch all client imports of PHI-bearing modules, including patient registry/workspace cases. Transitive runtime import analysis exists; two prototype PHI client screens remain explicitly allowlisted until a production DTO split is completed.
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

Current completion: 32%

Goal: create confidence that the system works repeatedly, safely, and recoverably.

What is already done:

- `[x]` TypeScript strict mode is enabled.
- `[x]` ESLint passes.
- `[x]` HIPAA guardrail script exists and passes.
- `[x]` Fraction worksheet fixture script exists and passes with `TMPDIR=/tmp`.
- `[x]` Production build passes.
- `[x]` Later-phase grounding guardrail validates server command helper seams, document route wiring, template readiness references, and closeout blocker visibility.

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

- `[!]` PHI in client components: client pages/components must not import raw `patients`, MRNs, names, notes, or generated previews for production. Transitive import guardrails now exist, but prototype PHI client screens still require a production DTO split.
- `[~]` Durable persistence transition: local OPS/PHI PostgreSQL schema, seed data, and server hydration exist, but many mutations and route-level repositories still rely on hydrated in-memory state or memory fallback.
- `[!]` No real authentication/RBAC: role headers are placeholders only.
- `[!]` No immutable audit trail: audit events are in-memory and use placeholder actors.
- `[!]` No real document/file integration: generated output is simulated.
- `[!]` No clinical validation for calculation logic.
- `[~]` Add Patient/Edit Patient are wired for de-identified pilot workflows with memory fallback and opt-in Prisma persistence; many other visible action buttons remain disabled placeholders or are not wired to production workflows.

## Recommended Execution Order

### Immediate Stabilization Sprint

Target completion outcome: prototype stays buildable, clear, and honest.

- `[ ]` Add this tracker to the team update ritual.
- `[x]` Add `npm run verify`.
- `[~]` Expand HIPAA guardrails to catch client imports of `clinical-store` PHI data. Transitive runtime import checks exist; prototype PHI client allowlist remains.
- `[~]` Mark or wire non-functional action buttons.
- `[x]` Refactor patient registry to use operational/server DTOs instead of client PHI imports.
- `[x]` Decide whether to use the richer `PatientsRegistry` component or the simpler shared `DataTable` page.
- `[x]` Add demo-only banner.

### MVP Workflow Sprint

Target completion outcome: patient registration through record maintenance works with de-identified durable data.

- `[~]` Implement persistent patient/course storage for demo/staging. Local OPS/PHI PostgreSQL databases, schema SQL, seed data, generated clients, and DB hydration exist; deployed databases, tracked migrations, and complete Prisma-native mutation coverage still need work.
- `[x]` Wire Add Patient and Edit Patient UI for de-identified pilot state.
- `[x]` Implement create-course flow as part of registration with workflow-definition selection.
- `[x]` Auto-create workflow steps, tasks, document requirements, audit checks, and folder placeholders with bundle post-condition checks.
- `[x]` Add tests around patient/course creation and update through the Phase 2 Node route/service guardrail.

### Clinical Operations Sprint

Target completion outcome: the strongest workflows become usable by roles in a pilot setting.

- `[ ]` Persist IGSRT simulation order, prescription, and fraction worksheet data.
- `[x]` Add role enforcement for DOT/MD approvals.
- `[~]` Add workflow transition gates. Evaluation helper exists; persisted transition command remains.
- `[x]` Add document render/sign lifecycle persistence for pilot metadata. Server command helper, version state, output state, locks, and manual upload confirmation exist; durable database/file persistence remains later work.
- `[ ]` Add audit event persistence.

### Integration Sprint

Target completion outcome: the app starts replacing manual Drive/eCW handoffs.

- `[ ]` Implement Drive template sync.
- `[~]` Implement generated file storage. Pilot uses app-owned storage references; live provider writes remain future work.
- `[ ]` Implement folder creation.
- `[x]` Implement eCW upload status workflow or integration. Pilot uses guarded manual upload confirmation.
- `[x]` Implement electronic/manual signature flow. Pilot uses guarded manual signature state and output locks.

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
| 2026-06-11 | Completed Phase 1 prototype navigation and operational visibility to 100%. | Added app loading/error boundaries, explicit table empty/error/loading states, disabled non-wired prototype actions, static settings rows, expanded route smoke coverage, and `npm run test:phase1` guardrails for operational visibility. | Keep Phase 1 limited to internal demo readiness; proceed next to durable patient/course persistence, real auth/session claims, and production PHI controls. |
| 2026-06-11 | Completed Phase 0 baseline, product alignment, and repo health to 100%. | Added `npm run test:phase0`, removed hardcoded UI colors outside `app/globals.css`, removed legacy dark-mode hex bridges, deleted deprecated root UI primitives, moved static table/section-card helpers under `components/shared`, added server-only operational page service, and confirmed zero Phase 0 guardrail violations. | Keep Phase 0 guarded through `npm run verify`; continue production-readiness work in later phases without reopening baseline debt. |
| 2026-06-11 | Completed Phase 2A patient registration and record maintenance foundation. | Added `lib/server/patient-registration-service.ts`, repository contract with in-memory and Prisma-ready adapters, service-owned create/update API delegation, rollback checkpoints for prototype patient/course/task/document/audit creation, audit actor metadata fields, OPS/PHI schema placeholders, and `npm run test:phase2`. Focused checks and full `npm run verify` passed. | Continue to durable OPS/PHI persistence, real auth/session claims, workflow-definition selection, immutable audit storage, and true API integration tests. |
| 2026-06-12 | Completed Phase 2 for de-identified pilot scope. | Added Prisma 6.19.3, OPS/PHI client generation and migration scripts, opt-in Prisma repository adapter, server-owned prototype session claims, initial-course intake fields, workflow-definition selection with universal fallback, workflow/task/document/audit/folder bundle post-conditions, guarded edit DTO, lifecycle and history routes, optimistic concurrency, redacted correction history, and expanded `npm run test:phase2`. `npm run verify` passed. | Keep production PHI use blocked until real auth/session controls, deployed OPS/PHI databases, immutable audit infrastructure, and broader PHI client-boundary hardening are complete. |
| 2026-06-12 | Completed later-phase grounding pass across Phases 3, 4, 5, 7, 8, 9, and 10. | Added server-only workflow command, document lifecycle, and closeout readiness helpers; guarded generated-document GET/read lifecycle; moved raw patient-name formatting out of shared workflow helpers; removed generated content preview rendering from the IGSRT client; expanded HIPAA transitive client import guardrails; added `npm run test:later-phases`. `npm run verify` passed. | Use the new helper seams when implementing durable workflow transitions, document persistence, closeout locks, OPS/PHI repositories, and production DTO splits. |
| 2026-06-12 | Completed Phase 4 template registry and document requirements for de-identified pilot scope. | Added canonical `lib/template-registry-data.json`, typed registry loader, template field maps, requirement reviewer/CPT/pilot-scope metadata, explicit pre-auth deferral and future placeholders, server-only source-hash verification, upgraded `/templates` and `/workflow/templates`, and `npm run test:phase4`. | Keep Phase 5 generation, live Drive sync, eCW upload, electronic signatures, immutable generated-file storage, and production clinical sign-off out of scope until their dedicated phases. |
| 2026-06-12 | Completed Phase 3 course workflow engine and task queues for prototype-seam scope. | Added command-owned workflow/task repository seam, guarded workflow advancement, step/task mutation APIs, role-aware task queues, command clients for `/workflow` and `/tasks`, due-date/overdue rules, explicit optional/removed/N/A handling, redacted workflow/task audit events, expanded HIPAA route checks, and `npm run test:phase3`. Focused typecheck, lint, HIPAA, Phase 2, and Phase 3 checks passed. | Keep live OPS persistence, real authenticated actor claims, immutable audit storage, and external notifications in later production-hardening phases. |
| 2026-06-12 | Completed Phase 5 document lifecycle for de-identified pilot scope. | Added server-only document lifecycle repository/adapter, tokenized lifecycle DTOs, APP_STORAGE output references, guarded render/export/sign/manual eCW upload/void/manual-edit commands, lifecycle metadata on document pages, `/api/igsrt` lifecycle delegation, RBAC actions, and `npm run test:phase5`. | Keep live Drive sync, production file storage/BAA confirmation, real DOCX/XLSX/PDF generation, eCW integration, electronic signatures, and immutable audit storage as production blockers. |
| 2026-06-12 | Completed Phase 6 treatment planning and fractionation for de-identified pilot/code-owned scope. | Added Phase 6 mutation hardening, duplicate active fraction prevention, manual override validation, version-tied clinical sign-off checklist, Treatment Planning and patient Planning checklist surfaces, and expanded Phase 6/fraction guardrails. `npm run test:phase6`, `TMPDIR=/tmp npm run test:fraction-worksheet`, `npm run typecheck`, and `npm run lint` passed. | Keep formal clinical validation, durable OPS/PHI persistence, real authentication/session claims, immutable audit storage, and production file/device integrations as production blockers. |
| 2026-06-12 | Relaxed prototype tooling without removing guardrails. | Split `npm run verify` into a fast typecheck/lint gate, added `npm run test:guardrails`, kept HIPAA and phase checks available through `npm run test:full`, moved linting to ESLint CLI, cleaned generated/session artifacts, and preserved security headers plus PHI guardrail scripts. | Use `npm run verify` during feature work; run `npm run test:full` before higher-confidence reviews or release-style checkpoints. |
| 2026-06-12 | Added local OPS/PHI PostgreSQL bootstrap, seed data, and DB hydration for server-rendered prototype views. | Created local schema SQL artifacts, configured `.env` for `OPS_DATABASE_URL`, `PHI_DATABASE_URL`, and `CURERAYS_PERSISTENCE_MODE=prisma`, added `npm run prisma:seed`, seeded synthetic OPS/PHI rows across all current Prisma models, and added server-only hydration so dashboard, analytics, reports, and store-backed server pages can render from PostgreSQL-backed state with memory fallback. `npm run typecheck` passed; lint passes with existing repo warnings. | Continue from hydration bridge to fully Prisma-native repositories, tracked migrations, production auth/session claims, immutable audit storage, and complete PHI-safe DTO splits before live PHI use. |
