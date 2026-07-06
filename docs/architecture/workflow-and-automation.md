# Workflow and Automation Architecture

- **Status:** Canonical architecture
- **Implementation:** Partial; see [current state](../status/current-state.md)

## Core Rule

Course state is structured application state. Patient rows must not be copied between tabs, spreadsheets, or folders to represent status. A document’s presence or file name does not advance a course.

## Phase Model

### Cross-patient phase groups

- Upcoming
- On Treatment
- Post

These are filtered views derived from the active course.

### Detailed course phases

1. Consultation
2. Chart Prep
3. Simulation
4. Planning
5. On Treatment
6. Post-Tx
7. Audit
8. Closed

The detailed phase is authoritative. Cross-patient phase groups are derived.

## Canonical Carepath

| Step | Name | Applicability |
|---:|---|---|
| 0 | Carepath Preauthorization | Protocol/payer dependent |
| 1 | Image Guidance or Mapping Order | Protocol dependent |
| 2 | Simulation Order | Required for supported treatment workflows |
| 3 | Simulation Note | Removed from active definitions; history only |
| 4 | Construct Treatment Device Note | Removed from active definitions; evidence belongs to active planning records |
| 5 | Clinical Treatment Planning | Required |
| 6 | Special Physics Consult | Optional/conditional |
| 7 | Radiation Prescription | Required |
| 8 | Fractionation Log | Required for delivered treatment |
| 9 | Special Treatment Procedure | Optional/conditional |
| 10 | OTV/Treatment Management standalone note | Removed; requirements are tracked against treatment/fraction state |
| 11 | Weekly Physics Chart Check standalone note | Removed; requirements are tracked against treatment/fraction state |
| 12 | In-Vivo Dosimetry standalone note | Removed where ACW is authoritative |
| 13 | Treatment Summary | Required at treatment completion |
| 14 | Carepath Audit Sign | Required for final closure |

Removed steps must never reappear as active work, but historical records remain readable.

## Status Model

Workflow/task/document statuses must have explicit transition rules. The shared vocabulary includes:

- Pending
- Needed
- In Progress
- Ready for Review
- Needs Review
- Completed
- Signed
- Uploaded
- Blocked
- Not Applicable
- Closed

Domain-specific states may be more precise. Status must be derived where required; for example, a fraction cannot be Approved while a required DOT or MD approval is missing.

## Applicability

Workflow selection and requirement applicability use:

- diagnosis;
- protocol;
- site/body region;
- laterality;
- modality;
- fraction plan;
- payer/authorization rules;
- approved template availability.

Missing applicability information produces a review/blocking state. It must not silently fall back to a clinically specific workflow.

## Course Site Model

**One treatment course covers one anatomical site: a single body region and laterality pair.** A patient treated for Arthritis in the right hand and the left foot has two courses, not one course with two sites.

Rationale: courses, prescriptions, orders, mappings, and fraction logs are all per-site in both the data model and the source templates. Requirement applicability filters against the single course body region.

A requirement instantiates for a course when all of the following match:

1. diagnosis category;
2. protocol;
3. body region — no filter, or the filter matches the course body region;
4. laterality applicability.

Field-map selection needs no separate rule: each document requirement references exactly one field map, so requirement selection is field-map selection.

Creating a course whose diagnosis carries body-region-filtered requirements without a course body region fails validation at creation. It must not silently instantiate an unfiltered requirement set.

**Known limitation:** the workspace drives one active course at a time. Concurrent courses (for example, hand and foot in parallel) are valid data, but staff work them by switching the active course. Whether per-course switching is sufficient is a staff-pilot validation item, not a settled decision.

## Preauthorization Dependency

Preauthorization (carepath Step 0) does **not** block Prepare work. Intake, mapping, simulation orders, and prescription preparation proceed in parallel with the authorization case.

Preauthorization gates exactly one transition: **Planning → On Treatment**, and only for protocols whose workflow definition requires authorization. The course gate surfaces an unapproved authorization as a blocker at that boundary and nowhere earlier.

The preauthorization record uses the state machine in [clinical workflow](../requirements/clinical-workflow.md) section 4 (not started → information required → submitted → payer pending → approved / partially approved / denied / appeal in progress / expired / not required with reason).

## Authoritative Course Gate

One derived gate supplies the patient header/sidebar, Overview, Treatment, and Closeout.

```ts
type CourseGateState = 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
```

The gate contains:

- state;
- human-readable reasons;
- evaluated timestamp;
- source record/version references;
- responsible owner for each blocker where available.

The gate evaluates at minimum:

- incomplete/blocked required steps;
- missing required fields or evidence;
- unsigned planning records;
- authorization state;
- prescription/plan lock and validation;
- treatment image, approval, OTV, and physics requirements;
- document signature/external upload state;
- billing/audit/AVS/follow-up closure requirements.

No UI panel may calculate a competing readiness value.

## Action Model

Every actionable item has:

- exact verb and object;
- patient/course context;
- owner and reviewer;
- due date or trigger;
- blocking effect;
- destination and target record;
- required reason for exceptional transitions.

Preferred verbs are Complete, Generate, Review, Sign, Upload, Approve, Correct, Void, Resolve, Schedule, or Mark Not Applicable.

## Next-Action Selection

The workspace surfaces **one** authoritative next action. Selection is deterministic: the same course state always produces the same next action.

**Scope:** the active course only. Exclude removed steps, Not Applicable items, and completed/signed/closed statuses. Evaluate against the operational date.

**Category precedence** — the first non-empty category supplies the next action:

1. **Blocking** — blocked steps/tasks, fractions needing revision, planning-readiness blockers: anything contributing `BLOCKED` to the course gate.
2. **Overdue** — open items with a due date before the operational date.
3. **Due today.**
4. **Review/signature-ready** — items ready for or needing review, unsigned completed documents, fractions awaiting DOT or MD approval.
5. **Workflow-order next** — the first incomplete required step at or before the current phase, ordered by phase index then step number.
6. **Closeout** — open required audit checks.

**Tiebreakers within a category**, applied in order: earlier due date (absent due dates sort last) → lower carepath phase index → lower step/task number → ascending record ID.

**Role-scoped variant:** "my next action" first filters candidates to the session role's owned items, then applies the same precedence. If the filter empties the list, fall back to the global next action labeled with its owner.

**Invariants:**

- The next action and the course gate derive from one evaluation pass; no surface computes a competing value.
- Stored free-text next-action fields never override the derived action and are scheduled for removal.

## Automation Rules

### Course creation

1. Validate patient/course input.
2. Select the applicable workflow definition.
3. Create steps and requirement instances.
4. Create initial tasks, owners, and due rules.
5. Create document/evidence placeholders where required.
6. Commit the patient/course/workflow bundle atomically.
7. Audit creation without operational PHI leakage.

### Consultation to simulation

- Completed consultation creates applicable intake, mapping, authorization, and simulation work.
- Simulation scheduling remains blocked until the approved order and required authorization/signature gates pass.

### Simulation to planning

- Completed simulation activates applicable planning, device, physics, prescription, and evidence work.
- Removed legacy steps are not created.

### Planning to treatment

- Treatment readiness requires applicable planning completion, signed/locked prescription, approved calculation/reference version, required evidence, physics review, and authorization policy.
- Passing the gate may create the fraction schedule from the approved prescription.

### Each fraction

- Validate uniqueness and prescription/phase consistency.
- Record setup, dose, cumulative values, image/DOT state, performer, and required checks.
- Derive approval state.
- Recalculate dependent values after correction.
- Invalidate affected downstream approvals when source values change.
- Create OTV/physics work according to approved protocol rules.

### Final fraction

- Move the course to Post-Tx only when treatment completion is valid.
- Create treatment summary, AVS/follow-up, billing reconciliation, and audit work.

### Closure

- Require treatment, documents, signatures, external uploads, billing evidence, audit checks, AVS/follow-up, and final audit sign as applicable.
- Lock final records.
- Reopening requires authorization, reason, new versions where required, and audit.

## N/A, Blocking, Reopening, and Corrections

- A required item cannot be marked N/A.
- Optional/conditional N/A requires a reason and actor.
- Blocking requires a reason, owner, and resolution path.
- Completed/signed records open read-only.
- Reopening requires a reason and clears or supersedes affected approval/lock state.
- Corrections preserve the prior version and recalculate dependent state.

### Fraction Calculation Contract

Derived from the clinic's corrected Dupuytren's fractionation log. Authoritative reference: `docs/fractionation_log_app_script/appscript_of_hand_laterality_dupuytren` (the Apps Script the clinic now runs on its live log).

**Inputs per fraction** (staff-entered): phase, energy, SSD, treatment time, dose per fraction (cGy), dose at skin surface per fraction (cGy), DOT depth (rounded to 0.1 for lookup).

**Derived values** (auto-computed, never hand-entered):

| Value | Rule |
|---|---|
| Cumulative Dose (cGy) | Running sum of dose per fraction across the course's logged fractions in fraction order |
| Cumulative Skin-Surface Dose (cGy) | Running sum of skin-surface dose per fraction |
| Isodose to DOT (%) | PDD lookup keyed by (energy reference table, field size from the phase's prescription, DOT depth rounded to 0.1); raw values > 1 normalize as raw/100 |
| Dose to DOT (cGy) | Isodose × skin-surface dose (falls back to dose per fraction when skin-surface dose is absent) |
| Cumulative Dose to DOT (cGy) | Running sum of Dose to DOT |

**Review flagging:** an entry whose energy, SSD, treatment time, dose per fraction, or skin-surface dose does not match the prescription values for its selected phase is flagged for review and cannot reach Approved until corrected or explicitly overridden with an audited reason.

**No fabricated reference data:** where approved PDD reference tables are not loaded in the application, Isodose to DOT remains a manually entered value that is itself flagged for review. The system must never invent lookup values.

**Corrections recalculate:** editing or voiding a fraction recalculates every downstream cumulative value and invalidates affected approvals, per the correction semantics below. All calculation behavior remains clinically unvalidated and production-blocked per [current state](../status/current-state.md) until formal validation.

**Carepath coverage — one engine, per-carepath columns.** All five active fraction logs (Skin Cancer IGSRT, Arthritis Hand/Foot/Knee, Dupuytren's Hand) share this engine: prescription-by-phase table, cumulative sums, energy-tab (50/70/100 kV) isodose lookup by rounded depth, and approval tracking. They differ in column layout and phase count: Dupuytren's is the **superset** (the only log with skin-surface-dose and cumulative-skin-surface-dose columns) and is the reference because it is the repaired sample; Skin Cancer omits skin-surface dose and runs up to Phase IV; Arthritis is single-phase and its template still carries unrepaired `#REF!` cells. This contract is carepath-agnostic — skin-surface dose is optional (Dose to DOT falls back to dose per fraction when it is absent) and phases come from the prescription — so only the XLSX **column mapping at export time** (P2/P3) is per-carepath, not the calculation.

### Correction Semantics by Record Type

The governing rule is **mutable until signed, superseded after signed**:

- **Workflow steps and tasks** reopen in place with a mandatory reason. Reopening clears the affected signature/approval state on the step itself; no parallel copy is created.
- **Fractions** are never edited in place once approved. A correction creates a superseding entry carrying the correction reason and void lineage, and downstream cumulative values recalculate.
- **Generated documents** are never edited. A change regenerates a new linked output version; signed versions are immutable; voiding requires a reason. See [document lifecycle](document-lifecycle.md).

## Evidence Attachment (Pilot Profile)

Evidence attaches at the level where it proves work: a workflow step, a fraction, or an audit check.

Each attachment records category, description, uploader, timestamp, and checksum. Pilot storage is a local opaque-key store — no PHI in storage keys, listing and download only, no inline viewer.

File inputs that discard their bytes are not evidence uploads. Any such prototype input is removed or visibly disabled; it must not remain interactive while labeled "simulated".

## Failure and Concurrency Behavior

- Failed saves preserve entered data and identify the failed field/gate.
- Mutations use expected version/timestamp or equivalent conflict detection.
- Multi-record transitions are transactional.
- External actions are idempotent and recoverable.
- Retrying must not duplicate tasks, documents, fractions, or external uploads.

## Notification Boundary

Notifications are downstream of workflow state. A notification failure must not corrupt or independently advance workflow state. Delivery, retry, escalation, and acknowledgement must be auditable when notifications are implemented.
