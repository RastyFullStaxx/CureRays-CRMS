# Patient Workspace Optimization Plan

**Status:** Approved design direction for active development  
**Updated:** 2026-07-01  
**Target:** `/patients/[id]` and legacy patient workspace subroutes

**Implementation:** Phases 1–5 implemented for the mock-data prototype; release hardening remains deferred.

## 1. Executive Decision

Rebuild the patient workspace around the clinical course rather than around application data categories.

The new workspace will have four stable tabs:

1. **Overview** — authoritative course status, next action, phase progress, and prioritized exceptions.
2. **Prepare** — intake, mapping/pre-authorization, simulation, planning, prescription, evidence, assignment, and signature work.
3. **Treatment** — ready-to-treat gate, current/next fraction, daily checks, approvals, and treatment history.
4. **Record & Closeout** — generated records, eCW upload, billing evidence, audit checks, AVS/follow-up, activity, and final closure.

The standalone **Activity** tab will be removed. Activity belongs beside the record or action it explains. Documents will also stop behaving like a detached file warehouse; each document will appear in the workflow step where staff create, review, sign, upload, or audit it, with a complete searchable record retained in Record & Closeout.

The full-height left patient rail will become a compact sticky patient/course header below the global command bar. This preserves patient identity and course context while restoring horizontal space for forms, planning details, and treatment tables.

## 2. Evidence and Critique

### Sources reviewed

- Current patient registry and all five workspace screenshots.
- `components/patients/patient-workspace.tsx`, shared tables, badges, shell, and typography tokens.
- CureRays workflow model, template registry, normalization manifest, UI engineering rules, and product register.
- Universal intake and AVS templates.
- Skin Cancer IGSRT carepath/pre-auth/audit, simulation/CTP, prescription, isodose, and fraction templates.
- Arthritis mapping, simulation, prescription, and fraction templates.
- Dupuytren's mapping, simulation, prescription, isodose, and fraction templates.

### Design health

The current workspace scored **18/40** against Nielsen's usability heuristics. It has credible clinical content and useful persistent patient context, but the experience reads as a dense administrative dashboard rather than a guided clinical workstation.

The highest-risk findings are:

- Clinical state can contradict itself: a fraction may appear approved while required DOT or MD approval is pending, and schedule counts are not labeled clearly enough to reconcile with logged fractions.
- Navigation follows storage categories instead of the real course: consultation, mapping/pre-auth, simulation/planning, treatment, and closure.
- The overview repeats next-action and signal information while hiding additional attention items after eight rows.
- Generic `Review` actions do not tell staff whether they must complete, generate, sign, approve, upload, or resolve.
- Typography uses too many sizes and weights, relies on 11px muted text, and gives labels, values, pills, and actions nearly equal emphasis.
- The permanent rail duplicates information, reduces the useful workspace width, and creates large dead areas on sparse views.
- Activity exposes raw audit storage rather than a useful explanation of who changed what, when, and why.

The deterministic UI scanner reported no code-pattern violations. The redesign therefore targets information architecture, clinical-state integrity, hierarchy, and workflow usability rather than superficial lint cleanup.

## 3. Clinical Workflow Model

The templates reveal one gated patient-course workflow:

`Intake / consult → mapping and authorization → simulation and planning → prescription and treatment readiness → daily treatment and approvals → records, billing, audit, AVS, and closure`

The system must replace the manual need to find, copy, rename, route, sign, upload, and cross-check separate Google Drive documents. Each workflow step must provide:

- What must be completed now.
- Why it is required and what it blocks.
- Responsible owner and reviewer.
- Required fields sourced from the applicable template map.
- Required evidence, generated output, signature, and eCW state.
- The exact action that advances the course.
- A readable history of changes and exceptions.

Documents are outputs and evidence of work. They are not the workflow source of truth. Course phase, step status, treatment readiness, assignments, and closure readiness remain structured application state.

## 4. Workspace Architecture

### Sticky patient/course header

Replace the full-height rail with a compact two-row sticky header:

- Primary row: patient name, status, CRMS reference, external MRN label/value, location, and Patient Details action.
- Course row: active course selector, diagnosis/site, current phase, fraction progress, and one authoritative safety/readiness state.
- Show one course-level next action only; do not repeat it inside the header and Overview.
- Keep PHI controlled and never place identifiers in query strings or operational logs.
- At narrow widths, collapse secondary facts behind Patient Details while retaining patient name, course, phase, and readiness.

### Overview

The Overview answers: **What must happen next, what blocks it, and is this course safe to advance?**

- Authoritative readiness banner: `Ready`, `Review required`, or `Blocked`, with reasons and last evaluated time.
- One verb-specific primary action with owner and due state.
- Course phase tracker covering Consultation, Chart Prep, Simulation, Planning, On Treatment, Post-Tx, Audit, and Closed.
- Work queue grouped in this order: blocking, ready for the signed-in role, due soon, then informational.
- Show the complete group count and a visible route to all items; never silently truncate the queue.
- Compact course facts appear only when they help the current decision. Do not repeat rail/header values.
- Show only the latest three meaningful events relevant to current work, with a route to full history.

### Prepare

Prepare covers work before treatment begins or before a later treatment phase can continue.

- Replace the seven-column Carepath table with a phase stepper and selected-step workbench.
- Group steps under Consultation, Chart Prep, Simulation, and Planning.
- Each step displays status, owner, reviewer, due/trigger, blocking reason, and completion requirement without requiring horizontal comparison.
- The selected workbench renders fields from the applicable `TemplateFieldMap`, grouped by clinical meaning.
- Display evidence, generated-document status, signature, and eCW state beside the action that needs them.
- Use exact action verbs: `Complete mapping`, `Generate order`, `Review & sign`, `Upload to eCW`, `Resolve blocker`, or `Mark not applicable`.
- `Not applicable` requires a reason. Completed or signed records open read-only first, with a deliberate correction/reopen action.
- Protocol-specific content is selected from diagnosis, protocol, body region/site, laterality, modality, and fraction plan.
- Missing, deferred, draft, or unmapped templates remain visible as explicit coverage states and never masquerade as ready work.

### Treatment

Treatment answers: **Can today’s fraction proceed, what must be recorded, and what still needs approval?**

- Place the ready-to-treat gate first, with specific blocking reasons and responsible owner.
- Put the current/next fraction composer before historical rows.
- Show the locked prescription/plan parameters needed for entry: phase, energy, applicator, dose per fraction, target depth, isodose, and cumulative dose.
- Present daily requirements as a short checklist: schedule, setup/image evidence, dose/DOT values, therapist record, DOT approval, MD approval, OTV, and physics checks when applicable.
- Derive fraction status from required approvals. `Approved` is impossible while a required DOT or MD approval remains pending.
- Label counts precisely: `Logged 6/20`, `Approved 5/6 logged`, and `Upcoming scheduled 2`; do not combine unlike counts.
- Keep treatment history searchable and horizontally scrollable only when the data truly requires it.
- Move reference and billing actions to a secondary overflow or contextual section so they do not compete with recording the next fraction.

### Record & Closeout

Record & Closeout answers: **Is the patient record complete, uploaded, billable, auditable, and ready to close?**

- Start with closure readiness and grouped blockers: documents/signatures, eCW uploads, billing evidence, treatment completion, audit checks, and AVS/follow-up.
- Provide one searchable record list with type, originating step, status, version, signature, eCW state, owner, and updated time.
- Keep clinical forms and generated files in the same record model; distinguish type through labels and filters rather than separate card regions.
- Show billing codes/evidence beside the clinical record that orders or justifies the work.
- Present audit as a completion checklist with evidence links, reviewer, decision, reason, and timestamp.
- Render activity as a readable timeline: actor, plain-language action, affected record, timestamp, and reason. Hide raw entity codes and raw ISO timestamps from normal display.
- Final closure is unavailable until every required gate passes. Reopening a closed item requires a reason and creates an audit event.

## 5. Authoritative State and Action Rules

- Create one derived course gate used by the header, Overview, Treatment, and Closeout. Do not calculate competing readiness values per panel.
- Remove deprecated workflow steps from active definitions. Historical records for removed steps remain accessible only in history.
- Sort work by clinical blocking state, then overdue/due date, then role relevance.
- Every actionable item has one primary verb, owner, due/trigger, blocking effect, and destination.
- A status change confirms success inline and preserves the user’s place. Failed saves preserve entered data and identify the field or gate that failed.
- Signed/generated records are read-only by default and versioned when corrected.
- Course advancement is blocked when required fields, evidence, signatures, approvals, or explicit N/A reasons are missing.

Use small derived view-model types rather than new persistence concepts:

```ts
type PatientWorkspaceTab = 'overview' | 'prepare' | 'treatment' | 'record-closeout';

type CourseGateState = 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';

type WorkspaceAction = {
  id: string;
  label: string;
  owner: string;
  due?: string;
  blocking: boolean;
  destination: PatientWorkspaceTab;
};

type CourseGate = {
  state: CourseGateState;
  reasons: string[];
  evaluatedAt: string;
};
```

Existing clinical entities remain the source data. Do not add a new database or duplicate workflow state for this redesign.

Legacy routes and query values map as follows:

- `command` → `overview`
- `carepath` and the patient carepath subroute → `prepare`
- `treatment` and fraction links → `treatment`
- `documents-billing`, `activity`, and the patient documents subroute → `record-closeout`

## 6. Typography Contract

Patient workspaces follow `docs/curerays-typography-style-guide.md`: Inter only, with 20px title, 16px heading, 14px body/control, and 12px supporting roles. Page-local font declarations are prohibited. Ordinary records use normal or medium weight; 700 is reserved for patient identity and critical values.

## 7. Visual and Interaction Direction

- Use one continuous work surface per tab, separated by section bands and dividers rather than nested cards.
- Use status pills only for actual state. Plain metadata, counts, phases, and owners should usually be text.
- Preserve the CureRays token palette and light-first behavior; ensure the dark theme remains readable without becoming the design baseline.
- Keep one primary action per decision area and no more than two visible secondary actions; place rare actions in a labeled menu.
- Prefer master-detail or stepper-workbench layouts over wide comparison tables for workflow actions.
- Keep tables for historical or multi-record comparison, not for completing a single clinical step.
- Preserve keyboard tab behavior, visible focus, semantic headings, descriptive labels, and text alternatives to color.
- Use motion only for state transitions and panel changes, with reduced-motion support.

## 8. Implementation Sequence

### Phase 1 — State integrity and shared view model — Complete

- Reconcile canonical workflow steps with removed/optional steps.
- Centralize course gate, fraction approval, readiness, next-action, and priority derivation.
- Add the new tab type and legacy route/query normalization.

### Phase 2 — Workspace shell and typography — Complete

- Replace the full-height rail with the compact sticky patient/course header.
- Implement the four-tab shell and shared semantic typography classes.
- Remove duplicated status summaries, nested borders, and decorative dead space.

### Phase 3 — Guided workspaces — Complete

- Build Overview and the Prepare selected-step workbench first.
- Build the Treatment current-fraction workflow and corrected approval model.
- Consolidate documents, forms, billing, audit, and activity into Record & Closeout.

### Phase 4 — Workflow completion behavior — Complete for prototype scope

- Connect verb-specific actions to existing store/service mutations.
- Add inline success, validation, recovery, version/reopen reasons, and course gate refresh behavior.
- Update mock data so every supported diagnosis demonstrates valid normal, blocked, review-required, and completed states.

### Phase 5 - Patient context sidebar and usability hardening - Complete

- Move patient identity, essential course context, gate state, and workspace navigation into a 232-248px sticky left sidebar at 1280px and wider.
- Retain compact sticky patient context and horizontal tabs below the sidebar breakpoint.
- Add orientation-correct keyboard navigation, Alt+1-4 workspace shortcuts, browser history for tab changes, grouped attention queues, contextual gate guidance, and correction/reopen recovery.
- Derive every displayed fraction status from its current approvals so stale stored status cannot display an unsafe approved state.
- Preserve page-owned scrolling, horizontal table overflow, modal focus containment, and full patient details through the existing modal.

## 9. Development Verification

The project remains in active development. Use only proportional checks:

- Run `npm run verify` after implementation slices.
- Use one narrowly targeted guardrail or local interaction check when a state rule changes.
- Manually inspect the changed workspace at one representative desktop width and one narrow width only when the change is visual.
- Do not run production builds, full guardrails, browser matrices, exhaustive route sweeps, or full suites until the user explicitly declares release preparation.

## 10. Acceptance Criteria

- A staff member can identify the patient, active course, readiness state, next action, owner, and blocker within five seconds.
- No required work is hidden by list slicing, collapsed counts, or an unrelated tab.
- No fraction or course can display an approved/ready state while a required approval or gate is pending.
- Staff can complete intake-to-closeout work without searching for a separate global module or Drive template.
- Documents and billing evidence appear in the workflow context where they are produced and remain discoverable in the complete record.
- All four tabs use the typography contract with no functional text below 12px.
- Patient identity and course context remain sticky without consuming a permanent full-height column.
- The primary flow is keyboard operable, readable at 200% zoom, and does not rely on color alone.
- Light and dark themes use the same hierarchy and semantic state system.
- No new dependency or duplicate persistence model is introduced.

## 11. Explicit Non-Goals

- Production authentication, authorization, immutable audit infrastructure, and real eCW/Drive integrations remain separate release-readiness work.
- This redesign does not make deferred or draft template mappings production-ready.
- The template source files remain reference inputs; this work does not rewrite their clinical content.
- Broad application redesign outside the patient registry and patient workspace is not part of this plan.
