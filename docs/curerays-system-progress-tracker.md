# CureRays CRMS System Progress Tracker

Last updated: 2026-06-19

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

- Overall system completion: 69%
- Local prototype/app shell readiness: 97%
- End-to-end demo workflow readiness using mock/database-seeded de-identified data: 90%
- Real clinic pilot readiness with strictly de-identified or synthetic data: 57%
- Production readiness for real PHI/ePHI: 31%

Plain answer to the question "pwede na ba from patient registration to record maintenance and updating?":

The system can run locally and can demonstrate the patient-course operating model with mock or locally seeded PostgreSQL data. It can list tokenized patient records, open patient workspaces, show course/workflow/document/fraction/billing/audit state, create and edit patient-course bundles through guarded PHI actions, select workflow definitions from intake course fields, create workflow/task/document/audit/folder placeholders with rollback checks, record redacted correction history with optimistic concurrency, render simulated document previews, sign simulated documents, and update/approve/void fraction worksheet rows from the patient workspace Fractions tab.

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

Verification highlights through 2026-06-14:

- `[x]` `npm run typecheck` passed.
- `[x]` `npm run lint` passed cleanly after the 2026-06-14 prototype cleanup pass.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after the 2026-06-14 Schedule/Templates/Settings/Security Logs layout-containment pass; route smoke covered 32 routes.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after removing shared DataTable pagination controls; all filtered table rows now render into fixed-height styled scroll regions instead of paginated slices.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after the shared DataTable toolbar was constrained to one responsive row with shrinkable search/filter/action controls.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after expanding Documents, Settings, Templates, and Security Logs review/table regions to fill the screenshot gaps; route smoke covered 32 routes.
- `[x]` Local Node 22 dev server on `127.0.0.1:3011` returned `200 OK` for `/schedule`, `/templates`, `/settings`, and `/security-logs` after the same layout-containment pass. The default shell Node remains 18.19.1, so use `.tools/node-v22.14.0-linux-x64/bin/node` or another Node 20.19+ runtime for live demo checks.
- `[x]` `npm run typecheck` and `npm run lint` passed after the 2026-06-14 workflow/fraction command UI pass and API resilience update.
- `[x]` `npm run test:routes` passed after the same update: 32 routes checked.
- `[x]` `npm run build` passed after the same update when run outside the sandboxed Turbopack worker restriction.
- `[x]` Prisma OPS and PHI schemas validated on 2026-06-14 with `prisma validate`; generated clients exist under `node_modules/.prisma/ops-client` and `node_modules/.prisma/phi-client`.
- `[!]` Local PostgreSQL was not reachable from this WSL/sandbox shell at `localhost:5432` during the 2026-06-14 probe (`P1001`). pgAdmin/schema setup may still be correct on the host, but the demo shell cannot currently query that socket. Read-only demo APIs now fall back to seeded in-memory operational data when Prisma is selected but unreachable; mutation paths still report persistence failures instead of pretending database writes succeeded.
- `[x]` Live API smoke on `http://127.0.0.1:3012` passed for `/api/patients`, `/api/patients/PHI-CR2401`, `/api/workflow`, `/api/tasks`, `/api/igsrt?courseId=COURSE-2401`, and `/api/generated-documents/DOC-2401-SIM` with the `x-curerays-role: ADMIN` prototype role header.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after adding the database-hydration fallback cache. A live Node 22 dev server on `127.0.0.1:3012` returned 200 for 35 landing, patient, workflow, treatment, document, billing, audit, reporting, settings, template, users/roles, security-log, and cohort routes; a warm recheck of the previously slow dev-compile routes returned 200 in roughly 200-1200 ms after first compile.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after the all-command-surface scroll normalization pass. A warm live check on `127.0.0.1:3012` returned 200 for `/patients`, `/records`, `/documents`, `/reports`, `/tasks`, `/workflow`, `/workflow/templates`, `/workflow/igsrt`, `/users-roles`, `/upcoming`, `/on-treatment`, `/post`, `/patients/PHI-CR2401/carepath`, `/patients/PHI-CR2401/documents`, and `/treatment-delivery/fraction-logs`.
- `[x]` `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed after custom dashboard/analytics shell scroll containment. Warm live checks on `127.0.0.1:3012` returned 200 for `/dashboard`, `/analytics`, `/analytics?panel=workflow`, `/analytics?panel=documents`, `/analytics?panel=billing-risk`, and `/patients/PHI-CR2401`.
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

- 33 App Router page files.
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
- `[x]` Branded login/landing screen exists with a token-driven Clinical Aurora layout and decorative Three.js treatment-field canvas.
- `[x]` Dashboard exists with telemetry-heavy operational views and now hydrates from local OPS/PHI PostgreSQL seed data when `CURERAYS_PERSISTENCE_MODE=prisma` is enabled.
- `[x]` Primary navigation is now patient-first and Mac-style: a glass top command bar with patient/MRN/course/action search plus Patients, Today, Schedule, Dashboard, Analytics, and Settings. Redundant global work pages redirect to patient-first destinations instead of competing as separate work surfaces.
- `[x]` Patient registry, master records, upcoming, on-treatment, and post-treatment views display patient/course state from the shared store; server layout hydration can now load that store from local PostgreSQL before render.
- `[x]` Patient workspace route exists and now exposes five full-width patient record sections: Overview, Carepath, Treatment, Documents & Billing, and Activity, with Course Signals available in compact patient context chrome instead of a right rail or floating overlay.
- `[x]` Workflow pages show canonical Carepath steps and blockers from mock/generated or locally seeded PostgreSQL-backed state.
- `[x]` Task, schedule, clinical forms, treatment planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` Courses, Billing, Audit, Clinical Forms, Imaging, Treatment Planning, and Treatment Delivery now use selected-row command surfaces with evidence panels, local PHI-free staged action ledgers, and route links into the patient workspace/carepath/document/fraction/admin flow.
- `[x]` Schedule, Templates, Settings, Audit Logs, and Security Logs have scroll-contained long command surfaces: weekly calendar and table-heavy regions keep shared soft scrollbars, selected-review side panels self-start instead of overlapping adjacent tables, and long review notes/ledgers wrap inside their cards.
- `[x]` Patient registry, records, documents, reports, tasks, workflow, workflow templates, IGSRT, users/roles, phase cohorts, patient carepath/documents, and treatment-delivery fraction logs now opt into page-level `scrollbar-soft` scrolling so long demo content stays reachable inside the fixed app shell.
- `[x]` Dashboard and Analytics custom shells keep fixed command headers while their main content panes and tab strips scroll with shared soft-scrollbar treatment, preventing telemetry panels from clipping during demo viewport changes.
- `[x]` Shared DataTable lists no longer paginate; every matching row is available through the table's fixed-height styled scroll area after search/filtering.
- `[x]` Shared DataTable filter toolbars stay on one row by dynamically shrinking the prefix, search field, filter selects, reset action, and toolbar actions instead of wrapping into stacked rows.
- `[x]` Documents, Templates, Settings, and Security Logs now use taller fixed review/list regions where the main table and selected detail panels visually align without leaving large dead gaps in the demo viewport.
- `[x]` IGSRT fraction worksheet can add, update, approve, request revision, and void rows against in-memory state from the patient workspace Fractions tab.
- `[x]` Fraction worksheet calculations have a fixture script and preserve a "clinical validation required" warning.
- `[x]` Generated document render/sign flows exist as simulated outputs from structured state.
- `[x]` Operational workflow API returns tokenized operational data.
- `[x]` Workflow and task demo APIs now remain available even when the global persistence mode is Prisma; workflow/task reads use the memory-backed command repository unless `CURERAYS_WORKFLOW_REPOSITORY=prisma` is explicitly selected, and the workflow snapshot route falls back to memory if that transitional Prisma adapter is unavailable.
- `[x]` PHI access helper exists with role header gating for PHI routes.
- `[x]` HIPAA guardrail script checks selected PHI boundaries.

### Partially Functioning

- `[~]` Patient registration: `POST /api/patients` and guided Add Patient UI are wired through a server-only registration service. The form starts with optional DOCX AVS/Intake prefill or manual entry, uses a stable tokenized file picker, gates each step by required information, and treats external MRN as optional without displaying generated system references as staff-entered MRNs. Prefill parses in memory, does not retain the uploaded file, and requires staff identity confirmation before detected values enter the form. In Prisma mode, the transitional adapter now persists patient, course, operational bundle references, redacted history, folder placeholder, and redacted audit event where current OPS/PHI schemas support them.
- `[~]` Patient record maintenance: `PATCH /api/patients/[id]` and grouped Edit Patient UI are wired through the server-only registration service with a tokenized section navbar, optimistic concurrency, required change reason, redacted correction history, duplicate external-MRN handling, and transitional Prisma persistence. Production-grade consent/history policy and immutable audit infrastructure remain later-phase work.
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
| Patient registration | 56% | Guided Add Patient UI posts to a server-owned API path that validates required fields, allows optional external MRN, checks duplicate MRN only when provided, can prefill draft values from AVS/Intake DOCX uploads without retaining files, creates the patient/course/task/document/workflow/audit/folder bundle, returns tokenized output, records redacted audit metadata, and persists the transitional OPS/PHI rows in Prisma mode where schemas support them. Successful creates open the new patient workspace while generated system references stay internal. | No real auth/session; no distributed OPS/PHI transaction; immutable audit, production permissions, full Prisma-native repository coverage, production PHI document storage, and OCR/PDF extraction remain incomplete. |
| Patient registry | 65% | `/patients`, `/records`, phase pages, search/filter tables, patient workspace links. | Some client pages import PHI-bearing mock data; operational DTO standard not enforced everywhere; no backend pagination/query permissions. |
| Patient profile/workspace | 70% | Patient workspace displays full-width course state through five simplified sections: Overview, Carepath, Treatment, Documents & Billing, and Activity. Legacy patient subroutes and old tab query names route into those unified sections, and Course Signals remains available through a floating summary modal. | Mostly read-only except fraction/IGSRT-specific routes; PHI handling is prototype-only; no durable writes. |
| Record update/maintenance | 46% | Edit Patient UI fetches PHI explicitly, shows a grouped full-form edit modal, requires change reason, patches through a guarded server service, validates duplicate external MRNs when provided, returns redacted operational output, and captures actor-shaped audit metadata. IGSRT simulation/prescription/fractions/doc statuses update in memory. | No DB transaction; no field-level validation policy; no immutable audit trail; user attribution still comes from prototype headers/placeholders. |
| Course creation | 20% | Course concepts and mock courses exist. | No production create-course API/UI; no diagnosis/protocol workflow selection transaction. |
| Workflow progression | 45% | Carepath steps, task/document requirements, blockers, and audit readiness are modeled and rendered. | No persistent workflow state machine; no guarded transitions; no due-date/escalation engine. |
| Document generation | 35% | Simulated render/sign/export outputs exist. | No real template merge, output file write, Drive/eCW upload, signature provider, or lock/version enforcement. |
| Treatment delivery/fractions | 68% | Strongest interactive slice: native fraction worksheet now lives in the patient workspace Fractions tab, opens history-first, records new fractions through a large three-column modal, keeps calculations, approvals, revisions, voiding, and the treatment-delivery registry table. Treatment Planning and Treatment Delivery now have command surfaces for plan parameters, schedule readiness, clinical gates, validation checklist, daily queue review, image/OTV/physics evidence, worksheet handoff, and staged PHI-free planning/delivery decisions. | Clinical validation required; no durable production persistence; no authenticated role enforcement; no machine/device integration. |
| Billing/audit closeout | 43% | Billing and Audit now have evidence-first command surfaces with selected-row review, document/fraction/task/billing/audit evidence panels, PHI-free staged local decisions, readiness scoring, and tokenized logs. | No real billing engine, payer/preauth validation, claim evidence lock, closeout gate, or immutable audit log. |

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
- `[x]` Mac-style top command bar covers the main modules.
- `[x]` Patient registry and phase views exist.
- `[x]` Patient workspace exists.
- `[x]` Workflow, tasks, schedule, clinical forms, planning, imaging, treatment delivery, documents, billing, audit, reports, analytics, templates, settings, users/roles, audit logs, and security logs pages exist.
- `[x]` DataTable and shared stat/page components are used in many pages.
- `[x]` Route smoke script verifies command bar routes, secondary operational routes, and representative dynamic patient routes.
- `[x]` App shell shows a global prototype/de-identified-data banner.
- `[x]` Non-wired visible prototype actions are disabled for demo clarity.
- `[x]` App-level loading and error boundaries use non-PHI operational copy.
- `[x]` Shared `DataTable` and `StaticDataTable` support explicit loading, empty, and error states.
- `[x]` Phase 1 operational visibility guardrail validates table empty copy, placeholder action states, and route-level loading/error files.

Remaining checklist:

- `[x]` Confirm every nav item points to a meaningful route and no dead routes remain.
- `[x]` Replace non-wired action buttons with either real handlers or disabled/coming-soon states for pilot clarity.
- `[x]` Align patient registry implementation around shared `DataTable` and operational DTOs. The richer `components/patients/patients-registry.tsx` remains unsuitable for production because it is PHI-heavy.
- `[x]` Add route smoke tests for command bar routes, secondary operational routes, and representative dynamic patient routes.
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
- `[x]` Add Patient UI posts to a validated create-patient API path through a stable, sequential modal with gated steps.
- `[x]` Edit Patient UI fetches PHI only after explicit user action and patches through the guarded API from a grouped full-form modal.
- `[x]` Required-field validation and duplicate external-MRN checks exist in the prototype API/store path. External MRN is optional; CRMS keeps system references internal.
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
- `[x]` Add patient search, duplicate checking, optional external-MRN uniqueness checks, internal CRMS reference handling, and required-field validation.
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
- `[x]` Native fraction worksheet UI exists inside the patient workspace Fractions tab.
- `[x]` `fraction-worksheet-service.ts` includes reference curves for 50/70/100 kV, lookup logic, manual override handling, cumulative dose calculations, approval state, correction handling, revision handling, void handling, billing row generation, and isodose note generation.
- `[x]` Fraction worksheet fixture script passes with `TMPDIR=/tmp`.
- `[x]` Treatment Delivery fraction log registry page exists and deep-links to the patient workspace Fractions tab.
- `[x]` Treatment delivery pages exist.
- `[x]` Treatment Delivery main queue now uses a selected-treatment command surface with active treatment cards, delivery table, dose/image/OTV/physics/worksheet evidence, workspace/worksheet/imaging/fraction-log links, and a PHI-free staged delivery decision ledger.
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
- `[x]` Treatment Planning page now uses a selected-plan command surface with plan parameter evidence, schedule readiness, missing-input review, imaging/OTV/physics gate cards, clinical validation checklist, workspace/carepath/worksheet/imaging links, and a PHI-free staged planning decision ledger.
- `[x]` Patient Planning tab shows schedule coverage, missing imaging, OTV due, physics due, logged fraction count, and the clinical validation warning.
- `[x]` Native fraction worksheet consumes scheduled fraction defaults, opens history-first, moves new-fraction entry and details into modals, exposes IMG/OTV/PHYS gate badges, links prototype imaging evidence, and disables DOT approval while required imaging is missing.
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

Current completion: 44%

Goal: make billing readiness and audit closeout enforceable, traceable, and evidence-backed.

What is already done:

- `[x]` Billing code and billing item types exist.
- `[x]` Billing page displays planned/completed/billed quantities from mock data.
- `[x]` Billing page now supports selected-item evidence review, document/fraction/audit links, and a PHI-free staged decision ledger for demo closeout review.
- `[x]` Audit check types exist.
- `[x]` Audit page displays readiness, blockers, checks, and evidence-like rows.
- `[x]` Audit page now derives closeout readiness from checks, generated documents, signatures, billing, fractions, tasks, and course flags, with a selected-course evidence review panel.
- `[x]` `auditReadinessScore()` calculates readiness from tasks, documents, and fractions.
- `[x]` Audit/security log pages show tokenized/redacted event tables.
- `[x]` Clinical Forms and Imaging now expose selected-row evidence review surfaces that feed the billing/audit demo path through documents, signatures, imaging categories, and fraction links.
- `[x]` Carepath PreAuth Audit template sources are tracked as mapping-in-progress.
- `[x]` Server-only closeout readiness helper centralizes blockers across documents, signatures, fractions, billing items, audit checks, and final audit eligibility.

Remaining checklist:

- `[ ]` Define billing code master and real code applicability rules.
- `[ ]` Model payer/preauthorization status and required evidence.
- `[~]` Link billing items to documents, tasks, treatment fractions, and signatures. Prototype command surfaces now show these relationships for review; durable enforced claim/evidence locking remains future work.
- `[~]` Implement closeout gate: treatment summary, follow-up, billing, required docs, signatures, images, N/A reasons, and final Carepath audit sign. Readiness evaluation exists; close/lock mutation is still not implemented.
- `[ ]` Implement final audit sign and course close/lock.
- `[ ]` Add immutable audit events for all closeout actions.
- `[~]` Add billing/audit exception workflow with reason, owner, due date, and resolution. Local PHI-free staged decisions exist; persisted exception ownership/due dates remain.
- `[~]` Add reporting for blocked audits, missing docs, missing signatures, missing billing evidence, and overdue follow-ups. Prototype command surfaces expose these counts; durable reporting and exports remain.
- `[ ]` Add tests for closeout readiness and blocked/exception cases.

Pre-mortem:

- Failure mode: a course is marked closed while billing, signatures, summary, or evidence is missing.
- Early warning: audit checks are displayed but not enforced by backend transitions.
- Prevention: make "close course" a backend command that fails with explicit blockers.

### Phase 8: Persistence, APIs, And Data Boundaries

Current completion: 43%

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
- `[x]` Database hydration caches successful PostgreSQL hydration and short-lived empty/unreachable fallback results during the dev server process, so a missing or unreachable local PostgreSQL socket does not repeatedly slow every demo route render.
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
- `[~]` Add Patient/Edit Patient are wired for de-identified pilot workflows with memory fallback and opt-in Prisma persistence; broader route actions are now demo-local and PHI-safe, but most are not production-persistent workflows yet.

## Recommended Execution Order

### Immediate Stabilization Sprint

Target completion outcome: prototype stays buildable, clear, and honest.

- `[ ]` Add this tracker to the team update ritual.
- `[x]` Add `npm run verify`.
- `[~]` Expand HIPAA guardrails to catch client imports of `clinical-store` PHI data. Transitive runtime import checks exist; prototype PHI client allowlist remains.
- `[x]` Mark or wire non-functional action buttons for the prototype demo. Remaining production persistence/integration work is tracked by phase.
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
| 2026-06-19 | Added a reachable Mac liquid-glass login route and transition polish. | Added `/login` as the unauthenticated landing surface while keeping `/` redirected to `/dashboard`; kept the login route outside the authenticated Mac command shell; brightened the landing surface and login panel with tokenized liquid-glass blur, white layered backgrounds, and clearer typography; added subtle Mac page-entry animation and a glass loading panel; confirmed local `.env` is in Prisma mode with OPS/PHI URLs on `localhost:5432`, generated Prisma clients are available, and the local PostgreSQL port is reachable. | Run simplification, verify, full guardrails, production build, and route probes for `/login`, `/dashboard`, `/patients`, and `/analytics`; continue deeper action-by-action functionality testing separately. |
| 2026-06-19 | Shifted the shell toward a light Mac liquid-glass experience and Dashboard-first navigation. | Reordered the Mac command bar so Dashboard is the first primary destination and the CureRays brand routes to `/dashboard`; changed theme initialization from system-dark preference to an explicit `curerays_theme_mode` key that migrates legacy dark-mode storage back to the light-first Mac default; brightened core light tokens, card shadows, liquid-glass shell chrome, and command-bar active/hover states; updated `.env.example` so both OPS and PHI database URLs target local PostgreSQL by default; extended simplification guardrails for Dashboard-first navigation, light-first theme wiring, local DB examples, and the full-width Risk layout. | Run simplification, verify, guardrails, production build, and route probes; continue deeper functionality/database wiring audits separately from the visible UI pass. |
| 2026-06-19 | Converted Dashboard Risk into a full-width page-scroll layout. | Preserved the Risk Constellation chart but gave it a larger stable display area; replaced the cramped right-side Risk summary rail with a full-width summary row for Clinical Safety Score, Risk Domain Load, and PHI Boundary; let Intervention Queue and Fraction Approval Watch expand naturally so the dashboard page scroll carries overflow instead of tiny card scroll strips; redesigned Risk Domain Load rows into readable label/detail/count/bar rows; updated simplification guardrails to require the vertical Risk layout and prevent the old side rail. | Verify with simplification, full guardrails, production build, and browser route checks on `/dashboard`. |
| 2026-06-19 | Reworked the Dashboard Risk tab into a clinical triage layout. | Preserved the Risk Constellation as the main visual anchor; replaced the square Safety Matrix with sorted risk-domain load bars that better answer which risk categories need attention; moved score, domain load, and PHI assurance into a right-side summary stack; gave the intervention queue and fraction approval watch more readable full-width list regions with styled scroll containment; added simplification guardrails against reintroducing the old square risk matrix or equal-weight grid. | Verify dashboard build/guardrails and browser-check the Risk tab at desktop and short-height viewports. |
| 2026-06-19 | Rebalanced Dashboard and Analytics chart layouts around CureRays palette. | Made `/` redirect to `/dashboard`; kept Dashboard and Analytics inside styled vertical page-scroll bodies; let chart panels and square-block matrices reserve natural height instead of clipping inside fixed viewport rows; contained square-block matrices with smaller tokenized cells, shared scrollbars, and card-level max heights so heatmap blocks cannot overlap legends or neighboring charts; made long chart-adjacent lists scrollable with shared scrollbar styling; kept Analytics insight rails in one consistent right-side location across every tab with only the insight list scrolling internally; remapped non-status chart series to CureRays blue/orange/white while leaving green/yellow/red for explicit status/risk signals; added simplification guardrails for dashboard/analytics scroll containment and matrix height. `npm run verify`, `npm run test:routes`, and `npm run test:simplification` passed. | Run full guardrails and production build, then browser-check Dashboard and all Analytics tabs at desktop and narrower widths. |
| 2026-06-19 | Replaced the Dock experiment with a Mac-style top command bar. | Kept the Mac-like glass chrome but moved primary navigation into one fixed top command bar with CureRays identity, patient/MRN/course/action search, notifications, theme toggle, and account controls; removed the rejected bottom Dock; tightened patient workspace chrome so patient context and signals no longer consume the working viewport; updated simplification guardrails and UI docs to require the command bar and ban Dock regression. | Verify with `npm run verify`, `npm run test:simplification`, route smoke/build, and browser screenshots across patient registry/workspace at desktop and narrower widths. |
| 2026-06-14 | Added scroll containment to the custom Dashboard and Analytics shells. | Updated `app/globals.css` so the dashboard command grid and tab strip use soft scrollbars, dashboard panels no longer clip their own grid content, and the Analytics overview panel uses the same scrollable command body as the other analytics tabs. Updated readiness percentages to 69% overall, 97% local prototype/app shell, and 90% end-to-end demo workflow. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. Warm live checks on `127.0.0.1:3012` returned 200 for `/dashboard`, `/analytics`, `/analytics?panel=workflow`, `/analytics?panel=documents`, `/analytics?panel=billing-risk`, and `/patients/PHI-CR2401`. | Continue interaction checks on patient workspace tab actions and modal flows; keep production persistence/auth/audit/PHI hardening separate from demo readiness. |
| 2026-06-14 | Normalized page-level scrolling across the remaining command/demo surfaces. | Added `scrollbar-soft overflow-y-auto pb-1 pr-1` to the remaining long PageStack command surfaces: patient registry, master records, documents, reports, tasks, workflow, workflow templates, users/roles, phase cohorts, patient carepath/documents, IGSRT tools, and treatment-delivery fraction logs. Added stable table heights on patient registry, records, documents, reports, tasks, workflow, phase cohorts, and patient documents so the fixed app shell keeps tables/review regions usable instead of clipping. Updated readiness percentages to 68% overall, 96% local prototype/app shell, and 89% end-to-end demo workflow. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. Warm live checks on `127.0.0.1:3012` returned 200 for 15 touched routes across patient, records, documents, reports, tasks, workflow, users/roles, cohorts, and treatment-delivery fraction logs. | Continue a browser visual/interaction pass, focusing next on patient workspace tabs and any custom analytics/dashboard surfaces that do not use PageStack. |
| 2026-06-14 | Optimized demo hydration fallback and completed a broad landing-to-admin live route sweep. | Added a process-wide database-hydration cache in `lib/server/database-hydration.ts` so successful PostgreSQL hydration and short-lived empty/unreachable fallback states are reused during the dev server process instead of retrying the same unavailable local socket on every page. Updated readiness percentages to 67% overall, 95% local prototype/app shell, and 88% end-to-end demo workflow. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. Live Node 22 dev server on `127.0.0.1:3012` returned 200 for 35 routes across landing, dashboard, patients, courses, workflow, tasks, schedule, treatment delivery/fraction logs, clinical forms, treatment planning, imaging, documents, billing, audit, analytics, reports, users/roles, templates, workflow templates/IGSRT, settings, audit/security logs, records, phase cohorts, and patient workspace subroutes. A warm recheck of the slowest first-compile routes returned 200 in roughly 200-1200 ms after initial compile. | Continue the browser visual/interaction pass from landing through patient workspace and admin tabs, then prioritize production persistence/auth/audit hardening rather than raising PHI readiness. |
| 2026-06-14 | Filled the remaining admin/document table and review-panel gaps from the screenshot pass. | Expanded the Security Logs review table and selected-event panel to matched taller regions, shortened its toolbar action to `Export`, raised the Documents list viewport, expanded Settings `Selected Setting` through a taller change-note field, and shortened the Templates registry action to `Export`. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke covered 32 routes. | Continue live browser visual checks across Documents, Templates, Settings, and Security Logs at the demo zoom/viewport size. |
| 2026-06-14 | Kept shared table filter strips to a single responsive row. | Updated `components/shared/data-table.tsx` so the default toolbar uses a non-wrapping min-width-aware flex row. Toolbar prefix, search input, select filters, reset action, and toolbar actions now shrink within the row instead of forcing filter controls onto a second line. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke covered 32 routes. | Continue live visual checks on the widest filter strips, especially Templates and Workflow Templates, and tune per-page control labels if a very narrow viewport needs more compression. |
| 2026-06-14 | Removed shared table pagination in favor of fixed-height table scrolling. | Updated `components/shared/data-table.tsx` so DataTable no longer slices rows by page or shows the previous count/arrow pagination footer. Existing `pageSize` values now control the table viewport height only, preserving the earlier table sizes while all filtered rows remain available through the internal `scrollbar-soft` table body. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke covered 32 routes. | Continue live visual checks on table-heavy pages and keep `pageSize` values tuned as viewport-height controls. |
| 2026-06-14 | Relieved Schedule, Templates, Settings, and Security Logs overflow from the screenshot pass. | Adjusted `ScheduleCommandClient` so the selected-visit panel no longer competes with the appointment/calendar region, made the weekly calendar taller with both-axis soft scrolling, and widened calendar lanes. Adjusted `TemplatesCommandClient` table/detail grids to self-start with larger table heights so stacked registry/requirement tables no longer visually overlap. Lengthened the Settings "Review before changing settings" list with its own soft scrollbar. Constrained Security Log selected-event review notes and reviewed-event IDs so fields wrap inside the card. `npm run typecheck`, `npm run lint`, `npm run verify`, and `npm run test:routes` passed; local Node 22 dev server returned `200 OK` for `/schedule`, `/templates`, `/settings`, and `/security-logs` on `127.0.0.1:3011`. | Continue the broader landing-to-admin browser visual pass and interaction pass across patient workspace, schedule, documents, templates, settings, users/roles, audit logs, and security logs. |
| 2026-06-14 | Upgraded Treatment Delivery into a daily queue command surface and refreshed tracker percentages/checklists. | Added `TreatmentDeliveryCommandClient` and slimmed `/treatment-delivery` into a server-prepared data wrapper that passes scheduled fraction rows, tokenized patient/course context, room/therapist timing, dose progress, image guidance, OTV, physics, and worksheet state into the client. The page now supports active treatment cards, selected-treatment review, workspace/worksheet/imaging/fraction-log navigation, and local PHI-free staged delivery decisions. Updated overall/demo readiness percentages plus the Phase 6 and end-to-end readiness checklist text. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/treatment-delivery` returned 200. | Run a broader landing-to-admin demo pass, then address any visual/route gaps found during that sweep. |
| 2026-06-14 | Upgraded Treatment Planning into a selected-plan readiness command surface and refreshed tracker percentages/checklists. | Added `TreatmentPlanningCommandClient` and slimmed `/treatment-planning` into a server-prepared data wrapper that passes plan parameters, Phase 6 readiness, missing inputs, schedule coverage, imaging/OTV/physics gates, and clinical validation checklist evidence into the client. The page now supports selected-plan review, workspace/carepath/worksheet/imaging navigation, local PHI-free staged planning decisions, and keeps page-level scrolling with a taller table. Updated overall/demo readiness percentages plus Phase 6 and end-to-end readiness checklist text. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/treatment-planning` returned 200. | Continue with the Treatment Delivery main queue command-surface polish, then run a broader landing-to-admin demo pass. |
| 2026-06-14 | Upgraded Imaging into an evidence review command surface. | Added `ImagingCommandClient` and slimmed `/imaging` into a server-prepared data wrapper that joins imaging assets to tokenized patient/course context, phase labels, upload references, and fraction-link counts. The page now supports selected-asset review, prototype preview placeholder, file/phase/fraction/note evidence cards, workspace/carepath/document/audit navigation, required-category gap matrix, and a PHI-free staged imaging decision ledger. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/imaging` returned 200 and rendered Imaging/evidence content. | Continue the command-surface pass for Treatment Planning and Treatment Delivery, then run a broader landing-to-admin demo pass. |
| 2026-06-14 | Upgraded Clinical Forms into a structured documentation command surface. | Added `ClinicalFormsCommandClient` and slimmed `/clinical-forms` into a server-prepared data wrapper that joins document-instance rows with generated-document signature/audit metadata. The page now supports selected-form review, mapped-field/signature/regeneration/workflow-route evidence cards, workspace/carepath/document/template navigation, a tokenized structured field editor, hand-joint mapping capture, and a PHI-free staged form decision ledger. Removed the old hardcoded static patient preview. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/clinical-forms` returned 200 and rendered Clinical Forms/structured content. | Continue the command-surface pass for Imaging, Treatment Planning, and Treatment Delivery while preserving page-level scroll and selected-row evidence panels. |
| 2026-06-14 | Upgraded Audit into a closeout command surface. | Added `AuditCommandClient` and slimmed `/audit` into a server-prepared data wrapper that derives readiness from course audit checks, generated documents, signatures, billing items, fraction logs, open tasks, and course flags. The page now supports selected-course closeout review, checklist/document/billing/treatment/task evidence cards, patient workspace/carepath/document/fraction/billing/security-log navigation, local PHI-free staged audit decisions, and tokenized export/run-check prototype actions. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/audit` returned 200 and rendered Audit/closeout content. | Continue the command-surface pass for Clinical Forms, Imaging, Treatment Planning, and Treatment Delivery while preserving scrollable full-page review surfaces. |
| 2026-06-14 | Upgraded Billing/Coding into an evidence-first command surface. | Added `BillingCommandClient` and slimmed `/billing` into a server-prepared data wrapper that joins billing items to tokenized patient/course context, linked documents, fraction counts, and audit status. The page now supports selected billing-item review, quantity/document/fraction/closeout evidence panels, workspace/document/fraction/audit navigation, and a PHI-free staged billing decision ledger. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `127.0.0.1:3012/billing` returned 200. The lint config now ignores nested generated `.next` output so Windows-path Turbopack artifacts do not enter source linting. | Continue the command-surface pass for Audit, Clinical Forms, Imaging, Treatment Planning, and Treatment Delivery. |
| 2026-06-14 | Fixed long-page scrolling and route layout clipping across key demo tabs. | Kept the global fixed-height app shell intact and opted long command pages into `scrollbar-soft` page-level scrolling. Moved the Courses table above selected-course review and raised its table height, added scrollable page bodies for Schedule, Treatment Planning, Templates, Settings, and Security Logs, wrapped the Schedule week grid in horizontal scroll, raised Treatment Planning and Template table heights, constrained the Settings category list with its own soft scrollbar, and prevented Security Log selected-event clipping. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live route probes on `127.0.0.1:3012` returned 200 for `/courses`, `/schedule`, `/treatment-planning`, `/templates`, `/settings`, and `/security-logs`. | Continue the broader demo-completion pass by upgrading the remaining table-heavy operational pages into command surfaces, prioritizing Billing, Audit, Clinical Forms, Imaging, Treatment Planning, and Treatment Delivery. |
| 2026-06-19 | Simplified the product into a patient-first record maintenance system and tightened dense table layout. | Reduced the sidebar to Patients, Today, Schedule, Dashboard, Analytics, and Settings; added a Today patient action queue; collapsed the patient workspace to Overview, Carepath, Treatment, Documents & Billing, and Activity; redirected redundant global work pages and legacy patient carepath/document subroutes into the unified patient record; added readable minimum widths/wrapped toolbars for dense DataTables; restored document lifecycle and Phase 6 sign-off signals inside the unified patient record; added `npm run test:simplification` to guard against reintroducing the old module-heavy navigation. `npm run verify`, `npm run test:guardrails`, and Node 22 `npm run build` passed. Windows-side live route probes returned 200 for `/patients`, `/today`, `/dashboard`, and `/analytics` on `127.0.0.1:3011`. | Run browser screenshot review across patient registry/workspace at target desktop and smaller widths, then continue production persistence/auth/audit hardening separately. |
| 2026-06-14 | Upgraded Courses into a carepath command center instead of a passive registry table. | Added `CoursesCommandClient` and slimmed `/courses` into a server-prepared data shell. The route now supports selected-course review, carepath/task/document/fraction/billing/audit evidence counts, workspace/carepath/document/fraction navigation, local PHI-free staged course decisions, and tokenized course export/new-course prototype actions. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live `curl -I http://127.0.0.1:3012/courses` returned 200. | Continue hardening remaining table-heavy operational pages such as Billing, Audit, Clinical Forms, Imaging, Treatment Planning, and Treatment Delivery into richer command surfaces where the demo still feels passive. |
| 2026-06-14 | Verified the upgraded prototype with a full production build. | Initial sandboxed `npm run build` hit a Turbopack worker/process permission panic while processing `app/globals.css`; rerunning the same command outside the sandbox completed successfully. Build compiled, ran TypeScript, generated all 18 static pages after automatic retries for several slower pages, and produced the app route manifest covering landing, dashboard, patient routes, workflow/IGSRT/templates, treatment delivery/fraction logs, reports, settings, users/roles, templates, audit/security logs, and APIs. | Continue with live browser demo verification across landing, patient workspace, workflow, treatment delivery, and admin tabs when localhost checks are available; consider marking slow prerender pages dynamic if build retries become a recurring local issue. |
| 2026-06-16 | Synced the patient registry table with persisted DB state in Prisma mode. | Updated `/patients/page.tsx` to force `hydrateClinicalStoreFromDatabase({ force: true })` when `CURERAYS_PERSISTENCE_MODE=prisma`, so patient list rows are rebuilt from OPS/PHI data before render and new add/edit operations appear in the table on the next navigation. In-memory behavior is preserved as fallback when persistence is disabled. | Verify by creating/updating a patient, then navigating to `/patients` and confirming table row visibility and workspace navigation remains stable for `/patients/<PHI-record-id>`. |
| 2026-06-16 | Fixed patient workspace navigation after add/create for Prisma mode. | Updated `/patients/[id]/page.tsx` to hydrate the clinical store before PHI lookup so a just-created record can resolve immediately, and added create-flow fallback routing in `patient-registry-client.tsx` using `phiRecordId`, `id`, then `patientRef` so workspace links remain resolvable if response shapes differ. | Re-test Add Patient end-to-end: create a patient, ensure `POST /api/patients` returns 201, and verify auto-open route lands on `/patients/<id>` without returning Not Found. |
| 2026-06-16 | Hardened Prisma-mode hydration and workspace-course resolution. | Updated both patient routes to force DB hydration when `CURERAYS_PATIENT_REPOSITORY` is set to `prisma`/`prisma-ready` (case-insensitive), and expanded `patientActiveCourse` matching to handle `COURSE-*` and `CREF-COURSE-*` identifier combinations so mixed route/course IDs no longer fail workspace resolution. | Re-test `/patients` Add Patient flow in Prisma mode, open `/patients/<id>` for a new patient, and verify workspace renders without the custom not-found shell. |
| 2026-06-16 | Fixed TypeScript-safe course matching in workspace resolver. | Updated `patientActiveCourse` to avoid direct `activeCourseRef` reads on union-typed patients and to merge identifier fallbacks only when the field exists on the patient shape. This keeps Prisma/memory course lookup safe across both patient types while preserving mixed identifier matching behavior. | Re-run a local validation/build pass and re-verify Add Patient → workspace navigation in Prisma mode. |
| 2026-06-14 | Removed verified-dead legacy patient workspace tab and static-table code. | Route audit showed the live patient workspace uses `components/patients/patient-workspace.tsx`, while the old `components/patients/workspace-tabs/*` subtree was unreferenced and still contained obsolete right-rail and placeholder patterns. Deleted that subtree, removed unused `AuditChecklist`, `DocumentList`, and the now-orphaned `StaticDataTable` primitive. Follow-up `rg` found no remaining references to `StaticDataTable`, `workspace-tabs`, `AuditChecklist`, `DocumentList`, or `RightRailCard`. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. | Continue the route-by-route demo audit for any remaining passive route sections, then perform the live landing-to-admin browser pass when localhost checks are available. |
| 2026-06-14 | Upgraded Treatment Delivery Fraction Logs into an interactive registry command surface. | Replaced the old single-table `/treatment-delivery/fraction-logs` route with `FractionLogCommandClient`, adding selected-fraction review, approval/document/dose evidence panels, staged review disposition, open-workspace worksheet action, on-treatment course rollups, a local review ledger, and PHI-free batch/export prototype actions. Deleted the superseded `FractionLogRegistryTable` component after confirming no other references. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke explicitly covers `/treatment-delivery/fraction-logs`. | Continue the route-by-route demo audit and then perform a live landing-to-admin browser pass when localhost checks are available. |
| 2026-06-14 | Upgraded IGSRT Tools into a fuller command surface around the fraction worksheet. | Added `IgsrtCommandClient` and replaced the bare `/workflow/igsrt` worksheet wrapper with tokenized course summary, simulation and prescription readiness, Sensus/preauthorization checks, treatment gate review, generated-document evidence, staged IGSRT review disposition, local review ledger, and existing worksheet mutation flow beneath it. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke explicitly includes `/workflow/igsrt`. | Continue the route-by-route demo audit for remaining static subroutes such as treatment fraction logs, then perform a live landing-to-admin browser pass when localhost checks are available. |
| 2026-06-14 | Upgraded Workflow Templates into an interactive carepath-template command surface. | Replaced the static `/workflow/templates` card layout with `WorkflowTemplateCommandClient`, including selectable workflow definitions, linked document/task requirement tables, source and field-map readiness badges, carepath build preview by phase, publish/review disposition staging, PHI-free bundle preview action, and a local workflow review ledger. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke explicitly covers `/workflow/templates` as part of 32 routes. | Continue the route-by-route demo audit for remaining static subroutes such as IGSRT tools and treatment fraction logs, then perform a live browser pass when localhost checks are available. |
| 2026-06-14 | Cleared remaining prototype lint debt after the route/workbench upgrades. | Removed the remaining unused imports/helpers, deleted one unused patient profile shell, replaced React render/effect lint patterns in shared workspace primitives, sidebar, nav, and DataTable, and kept operational workflow DTO redaction typed without leaking course/document signer IDs. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; route smoke covered 32 routes. | Continue the landing-to-admin browser demo pass when live localhost checks are available; production auth/RBAC, immutable audit, and PHI hardening remain later-phase blockers. |
| 2026-06-14 | Removed verified-dead legacy UI components and the last old-style route surface. | Deleted the unused old glass-panel components and the superseded `IgsrtCrudWorkspace` path after reference checks showed no live imports. Removed dead phase/table/task/course helper components, modernized `app/not-found.tsx` to shared token surfaces, and confirmed no `glass-panel`, `rounded-glass`, `text-curerays*`, or `bg-curerays*` classes remain in `app` or `components`. `npm run typecheck`, `npm run test:routes`, and `npm run lint` passed; lint warnings dropped from 33 to 28. | Continue feature-completion audit for remaining routes and perform a live browser demo pass when localhost checks are available. |
| 2026-06-14 | Upgraded Reports into an interactive report workbench. | Added `ReportsCommandClient` and reduced `/reports` to a server telemetry wrapper. The page now supports selectable report packs for workflow, treatment, documents, and billing/risk; report readiness/evidence table; analytics drilldown links; PHI-safe export action staging; report review notes; and a local staged report ledger. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. | Continue replacing any remaining passive overview widgets and run a full browser demo pass across landing, records, phase cohorts, reports, analytics, patient workspace, and admin tabs when live checks are available. |
| 2026-06-14 | Consolidated Upcoming, On Treatment, and Post-Treatment into interactive phase cohort consoles. | Added `PhaseCohortCommandClient` and `getPhaseCohort` so all three status routes share server-prepared cohort data and client-local demo actions. Replaced duplicate static tables on `/upcoming`, `/on-treatment`, and `/post` with selected-patient review, course/fraction/carepath/document evidence cards, workspace/carepath/document/schedule navigation, schedule/export prototype actions, phase-specific staged review actions, and a local PHI-free cohort ledger. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. | Continue polishing remaining passive report/overview widgets and run a full browser demo pass across the status cohorts, records, patient workspace, and admin tabs when live checks are available. |
| 2026-06-14 | Upgraded Master Records into a record-maintenance command console. | Added `RecordsCommandClient` with selected-record review, course/task/document/fraction/checklist evidence cards, patient workspace/carepath/document/fraction navigation, local PHI-free maintenance update staging, register/export prototype actions, and a staged maintenance ledger. Replaced `/records` with a server-prepared tokenized record model and removed unused legacy `RecordsSummary` and `ReportsOverview` components that still used old glass styling. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed. | Continue hardening any remaining passive status/report routes, then run a full browser demo pass across landing, patient lifecycle, records, carepath, and admin tabs when live checks are available. |
| 2026-06-14 | Upgraded Users & Roles into an interactive access-control console. | Added row selection across users, roles, and permission modules; selected-record review panels; MFA reset, role review, role activation, and permission update staging; role-level access previews; PHI-free review notes; and a local staged admin-decision ledger in `UsersRolesCommandClient`. Restored the generated `next-env.d.ts` route import back to the dev type file. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live localhost verification remains pending because additional approval-backed curl checks are unavailable in this environment. | Perform a full browser demo pass across landing, patient workspace, schedule, documents, templates, settings, users/roles, audit logs, and security logs when live checks are available. |
| 2026-06-14 | Upgraded Templates into an interactive registry workbench. | Added `TemplatesCommandClient` with selectable template sources, status/hash/approval badges, linked requirement review, field-map/readiness inspection, review disposition controls, local staged review ledger, placeholder summary, and PHI-free registry export actions. Replaced `/templates` with a server-prepared data shell that passes source, requirement, placeholder, hash, and stats data to the client. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live curl verification remains pending because the environment approval usage limit blocks additional localhost checks. | Continue remaining admin polish for Users & Roles, then perform a full landing-to-admin browser demo pass when live checks are available. |
| 2026-06-14 | Upgraded Audit Logs and Security Logs into shared interactive review consoles. | Added `AuditLogCommandClient` with event row selection, audit/security mode copy, review-session counter, domain filtering, redaction preview, review notes, mark-reviewed state, PHI-safe export staging, and an evidence-packet action. Replaced `/audit-logs` and `/security-logs` static table pages with slim server wrappers that pass redacted operational audit events into the client. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live curl verification was attempted but blocked by the environment approval usage limit. | Live-check `/audit-logs` and `/security-logs` when approvals are available, then continue admin-tab hardening for Templates and Users & Roles. |
| 2026-06-14 | Upgraded Settings into an interactive admin command console and refreshed local seed data. | Replaced the passive Settings category list with `SettingsCommandClient`: selectable configuration areas, category-specific mode defaults, admin-approval toggle, staged preview, reset/apply controls, and a local demo change ledger. Ran `npm run prisma:seed` through the Windows PostgreSQL fallback to refresh local OPS/PHI demo rows for patients, courses, workflow tasks, generated documents, fractions, and audit events. `npm run typecheck`, `npm run lint`, and post-seed `npm run test:routes` passed; live `/settings` returned 200 and rendered the command console markers. | Continue admin-tab hardening for Templates, Users & Roles, Security Logs, and Audit Logs, then run a full landing-to-admin browser demo pass. |
| 2026-06-14 | Turned the patient Carepath subroute into an interactive demo command surface. | Added `CarepathCommandClient` for canonical step review, filter chips, selected-step details, linked task evidence, staged status/owner/reason updates, next-open-step navigation, and prototype carepath-note generation. Replaced the static task-grouped `/patients/[id]/carepath` page with server-prepared workflow steps plus client-local demo actions. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; fresh dev server at `127.0.0.1:3011` returned 200 for `/patients/PHI-CR2401/carepath` and rendered the new command markers. | Continue interaction/visual hardening for the patient workspace tabs and admin tabs, then run a broader browser demo pass from landing through closeout. |
| 2026-06-14 | Hardened server/client table boundaries for the demo route sweep. | Added `SerializedDataTable` for server-prepared table rows and converted Courses, Billing, Audit, Imaging, Clinical Forms, Treatment Planning, and Treatment Delivery away from server-passed render/search/filter callbacks. Preserved row actions through client-local prototype buttons and row-specific links. `npm run typecheck`, `npm run lint`, and `npm run test:routes` passed; live dev server returned 200 for `/`, `/dashboard`, `/courses`, `/schedule`, `/treatment-planning`, `/treatment-delivery`, `/clinical-forms`, `/documents`, `/billing`, `/audit`, `/imaging`, `/templates`, `/settings`, `/users-roles`, `/users-roles?tab=roles`, `/users-roles?tab=permissions`, `/patients/PHI-CR2401/carepath`, and `/patients/PHI-CR2401/documents`. | Continue a browser visual pass and interaction pass across landing, dashboard, patient workspace, schedule, treatment planning/delivery, documents, and admin tabs. |
| 2026-06-14 | Upgraded schedule and patient subroute demo flow, then verified live routes under local Node 22. | Replaced the static Schedule page with a tokenized `ScheduleCommandClient` that supports day/type/location filters, selectable appointment cards, detail review, calendar blocks, and staged visit updates. Added prototype actions to patient Carepath and patient Documents subroutes. Installed a local Linux Node 22.14.0 runtime under ignored `.tools` for WSL verification, moved `/documents` and `/users-roles` table render callbacks into client wrappers to remove Next client-prop serialization errors, ran typecheck, lint, and route smoke, started Next dev on `127.0.0.1:3011`, and confirmed 200 responses for `/`, `/schedule`, `/settings`, `/users-roles`, `/users-roles?tab=roles`, `/users-roles?tab=permissions`, `/templates`, `/documents`, `/patients/PHI-CR2401/carepath`, and `/patients/PHI-CR2401/documents`. | Continue route-by-route demo hardening for any remaining thin surfaces, then perform a browser visual pass across landing, dashboard, patient workspace, carepath, documents, schedule, and admin tabs. |
| 2026-06-14 | Converted dead prototype controls into working demo actions across core and admin routes. | Added a reusable `PrototypeActionButton` client island and wired it into Courses, Schedule, Clinical Forms, Documents, Audit, Billing, Imaging, Treatment Planning, Treatment Delivery, Users & Roles, Templates, Settings, Security Logs, Audit Logs, Workflow secondary actions, and patient workspace tab actions. Removed hidden disabled workflow/analytics stubs, cleaned touched-page unused imports, kept actions local/prototype-only and PHI-safe, and confirmed `npm run typecheck` plus `npm run lint` complete with no errors. | Run route smoke and browser pass for landing-to-admin demo flow; keep durable persistence, real auth/RBAC, immutable audit, external file writes, and production PHI readiness in later hardening phases. |
| 2026-06-14 | Redesigned the unauthenticated landing/login surface. | Replaced the old wave landing with a token-driven Clinical Aurora layout, added a client-only Three.js treatment-field canvas, kept login routing to `/dashboard`, preserved password reveal and secure-access copy, reused shared input/button primitives, and avoided PHI imports on the entry page. | Run verify, build, HIPAA guardrails, and browser visual checks for `/` across desktop/mobile, light/dark, reduced motion, and login routing. |
| 2026-06-14 | Refined patient workspace UI, edit modal sizing, and compact pill tokens. | Removed duplicate patient header shortcuts, renamed the workspace Workflow tab to Carepath, expanded Edit Patient to the XL clinical modal without the section nav, added review-first Command tab cards and styled scroll regions, compacted badge token triplets into `clinical-pill` tone classes, normalized analytics and legacy text pills, and documented modal/scrollbar rules in `AGENTS.md` and the UI engineering rules. | Run typecheck, lint, Phase 2/6, fraction worksheet, HIPAA, and route guardrails; continue improving individual workspace tab workflows without adding new APIs in this UI-only pass. |
| 2026-06-14 | Polished patient modals, fraction entry modal, and shared UI rules. | Added the must-read UI engineering rules doc, linked it from `AGENTS.md`, made badges solid soft-square primitives, replaced the Add Patient native file input with a tokenized DOCX picker, hid generated system references from registration, kept Edit Patient as a grouped full-form modal, and changed Record Next Fraction to a large three-column modal with visible advanced fields. | Validate with typecheck, lint, Phase 2/6, fraction worksheet, HIPAA, and route guardrails; continue formal clinical validation before production PHI use. |
| 2026-06-14 | Added DOCX AVS/Intake assisted Add Patient prefill. | Added Step 0 upload/manual choice, server-owned `/api/patients/prefill`, in-memory DOCX XML extraction, detected-details review with identity confirmation, no file retention, and Phase 2 guardrail coverage. | Keep PDF/image/OCR, retained upload evidence, and production PHI document storage out of scope until auth, storage, audit, and BAA infrastructure are ready. |
| 2026-06-14 | Cleaned up patient Add/Edit and fraction workspace UX around older-staff usability. | Add Patient now uses fixed-size guided steps with validation gating and optional external MRN; Edit Patient uses one grouped full-form modal with required change reason; patient workspace tabs are full-width with a floating Course Signals modal; patient-level fraction work moved to the Fractions tab with history-first table, modal Record Next Fraction flow, and modal details/actions. | Run the requested validation suite and continue formal clinical validation, production auth/session work, immutable audit, and persistent fraction storage before live PHI use. |
| 2026-06-13 | Improved patient registration durability and oldies-friendly patient/fraction workflows. | Added guided 4-step Add/Edit Patient UI, shared textarea primitive, Prisma-mode persistence for patient/course bundle references, PHI-safe actionable persistence errors with in-memory rollback on failed writes, Save & Open workspace flow, and review-first Fraction Log with hidden step-based Record Next Fraction flow. `npm run typecheck` passed. | Run lint, HIPAA, Phase 2, and fraction worksheet guardrails; continue production hardening for real auth, immutable audit, full Prisma-native repositories, and formal clinical validation. |
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
