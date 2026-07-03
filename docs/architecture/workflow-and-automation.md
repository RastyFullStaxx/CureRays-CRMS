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

## Failure and Concurrency Behavior

- Failed saves preserve entered data and identify the failed field/gate.
- Mutations use expected version/timestamp or equivalent conflict detection.
- Multi-record transitions are transactional.
- External actions are idempotent and recoverable.
- Retrying must not duplicate tasks, documents, fractions, or external uploads.

## Notification Boundary

Notifications are downstream of workflow state. A notification failure must not corrupt or independently advance workflow state. Delivery, retry, escalation, and acknowledgement must be auditable when notifications are implemented.
