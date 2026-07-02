# CureRays CRMS Prototype User Guide

- **Audience:** CureRays clinical, treatment, billing, authorization, and administrative reviewers
- **Applies to:** Current synthetic/de-identified development prototype
- **Not approved for:** Real patient PHI/ePHI or clinical production use

## 1. Before You Start

The prototype is designed to demonstrate how one patient course can replace fragmented worksheets and Drive files. Some buttons intentionally stage or simulate work. A success message is not proof of a durable file, electronic signature, eCW upload, or database write unless the screen explicitly shows a verified integration result.

Use only mock, synthetic, or approved de-identified data.

## 2. Main Navigation

### Patients

Find, create, and open patient records. Patient work should normally begin here.

### Today

Review work that needs attention across patients. Open an item to continue at the relevant patient-workspace tab.

### Schedule

Review appointments and treatment timing. Schedule changes must still satisfy workflow gates.

### Dashboard

Review operational workload and exceptions. The dashboard does not replace the patient workspace.

### Analytics

Review aggregate operational patterns and bottlenecks.

### Settings

Review workflow, template, access, billing, and system configuration surfaces. Many settings actions remain prototype-only.

## 3. Patient Registry

Use search and filters to locate a patient. Open the patient row to enter the active course workspace.

### Add a patient

1. Select Add Patient.
2. Enter the patient/course information or use supported Intake/AVS DOCX prefill.
3. If using prefill, review every detected field.
4. Confirm patient identity deliberately.
5. Complete diagnosis, protocol, site/body region, laterality, providers, and initial course details.
6. Review the summary before saving.

DOCX prefill is assistive. It does not establish identity accuracy and does not generate the official external MRN.

### Edit a patient

1. Open Patient Details or the relevant edit action.
2. Review the full patient/course context.
3. Change only the intended fields.
4. Enter the required correction/change reason.
5. Save and verify the updated value.

Production corrections will require real identity, durable history, and authorization. The prototype may retain changes only in its active data mode.

## 4. Patient Workspace

The workspace has four tabs: Overview, Prepare, Treatment, and Record & Closeout.

Persistent context shows the patient, active course, phase, progress, gate, signals, and next action. On narrow screens, secondary information is available through Patient Details.

### Overview

Use Overview at the start of work.

Check:

- course gate: Ready, Review Required, or Blocked;
- reasons for the gate;
- next action;
- owner and due state;
- current phase;
- grouped attention work.

Select an attention item to open its exact step, fraction, document, or audit target.

Do not advance based only on a green-looking status. Review the stated evidence and approvals.

### Prepare

Prepare contains Consultation, Chart Prep, Simulation, and Planning work.

1. Select a workflow step.
2. Review its status, owner, reviewer, due/trigger, signature requirement, blockers, and related tasks.
3. Complete the exact action shown.
4. Add a reason when reopening or using an exceptional transition.
5. Verify that the course gate refreshes.

Prototype limitation: the complete structured fields from every source template are not yet rendered here. Completing a prototype step does not prove that all source-template fields were captured.

### Treatment

Treatment contains the ready-to-treat gate, fraction workflow, planning snapshot, validation checklist, imaging evidence, and treatment history.

Before recording:

1. Review the course gate and treatment blockers.
2. Confirm the active prescription phase and locked plan parameters.
3. Confirm required image/setup evidence.
4. Confirm physics/OTV requirements.

To record a fraction:

1. Select Record Next Fraction.
2. Confirm the fraction number and date.
3. Enter phase, energy, applicator/field, time, dose, target-depth/DOT, and isodose values as required.
4. Record performer/setup comments and required evidence.
5. Save the entry.
6. Complete required DOT and physician approval actions.

Counts have different meanings:

- Logged: active fraction entries.
- Approved: logged fractions with every required approval.
- Upcoming Scheduled: scheduled fractions without a completed active entry.

#### Revision or correction

Use Request Revision when a reviewer identifies a problem. Use Correct only through the explicit correction action, provide a reason, and verify recalculated cumulative values and downstream approval state.

#### Void

Void is for an invalid entry that must remain in history. It requires a reason and must not renumber or erase historical evidence.

Clinical safety boundary: current calculation/reference behavior remains a development prototype and requires CureRays clinical validation before production use.

### Record & Closeout

Use this tab to review the complete course record and closure blockers.

Check:

- documents and signatures;
- external/eCW upload state;
- treatment completion;
- billing evidence;
- audit checks;
- AVS and follow-up;
- activity history.

Prototype Generate Document, Open Form Builder, Attach Image, export, signature, and upload actions may simulate or stage state without writing an authoritative external file. Read the confirmation text carefully.

Final closure must remain unavailable while any required gate is incomplete.

## 5. Status and Action Guide

### Pending/Needed

The item applies but work has not started.

### In Progress

Work has started but completion criteria are not satisfied.

### Ready for Review/Needs Review

The author’s portion may be complete; an authorized reviewer must evaluate it.

### Completed

Required non-signature work is complete. Verify linked evidence.

### Signed

The record indicates signature state. In the prototype this may not be an identity-bound electronic signature.

### Uploaded

The record indicates external transfer state. In the prototype this may be a manual/simulated confirmation.

### Blocked

Work cannot proceed. Review the reason and assigned owner.

### Not Applicable

The optional requirement does not apply. A reason is mandatory.

### Closed

The course passed closure gates. Production reopening must be authorized and audited.

## 6. Common Workflows

### Start the day

1. Open Today.
2. Address blocking and overdue items first.
3. Open the patient target.
4. Confirm patient/course context.
5. Complete the exact action and verify the refreshed state.

### Prepare a new course

1. Confirm intake and diagnosis/protocol applicability.
2. Complete mapping and authorization work.
3. Complete/sign the simulation order.
4. Attach required evidence.
5. Complete planning and prescription.
6. Review the treatment-readiness gate.

### Treat a scheduled fraction

1. Open the patient from Today or Schedule.
2. Review treatment blockers.
3. Confirm prescription/plan and required evidence.
4. Record the fraction.
5. Complete required approvals/checks.
6. Verify logged, approved, cumulative, and scheduled counts.

### Handle a blocker

1. Open the blocking item.
2. Read the reason and owner.
3. Correct the missing field/evidence/approval or reassign through an authorized workflow.
4. Do not mark a required item N/A.
5. Verify the gate reevaluates.

### Correct completed work

1. Open the completed record read-only.
2. Select Reopen/Correct.
3. Enter the reason.
4. Make the correction.
5. Re-review and re-sign the new version where required.

### Close a course

1. Confirm final treatment completion.
2. Complete treatment summary.
3. Reconcile required documents/signatures and external uploads.
4. Reconcile billing evidence.
5. Complete AVS/follow-up.
6. Resolve audit checks.
7. Complete the final audit sign.
8. Verify Closed state.

## 7. Privacy and Security

- Never use real PHI in the development prototype.
- Do not copy patient identifiers into issue trackers, prompts, commits, logs, screenshots, or test data.
- Do not put PHI in URLs or search parameters.
- Do not assume a hidden or collapsed field is secure.
- Report unexpected patient visibility, authorization behavior, or PHI in logs immediately.
- Do not share generated/downloaded material outside the approved environment.

## 8. Troubleshooting

### I cannot find a patient

- Clear filters.
- Search the approved patient identifier.
- Confirm you are in Patients rather than an aggregate page.
- The prototype data may reset when the process/data mode changes.

### A course will not advance

- Read every course-gate reason.
- Check required fields, evidence, authorization, signatures, treatment approvals, audit checks, and N/A reasons.
- Resolve the originating record rather than changing phase manually.

### A fraction cannot be approved

- Confirm required image/DOT evidence.
- Confirm DOT and physician approval requirements.
- Check for revision-needed state.
- Confirm the entry is not voided or superseded.
- Confirm correction did not invalidate downstream approval.

### A document cannot be signed

- Confirm an active approved requirement/template.
- Confirm a current generated output exists.
- Resolve review/correction state.
- Remember that production electronic signing is not implemented.

### A status says complete but the underlying work is missing

Treat this as a prototype defect. Record the course/item reference without PHI, expected evidence, and observed state. Do not use the status as clinical proof.

### The page looks saved but data later disappears

The current repository still contains in-memory and transitional persistence paths. Capture a PHI-safe reproduction and data mode. Durable persistence is an active roadmap requirement.

## 9. Glossary

- **Course:** One diagnosis/protocol treatment episode for a patient.
- **Carepath:** Ordered workflow requirements for the course.
- **Course Gate:** Derived Ready, Review Required, or Blocked decision.
- **DOT:** Depth of Target.
- **eCW:** eClinicalWorks.
- **Evidence:** Linked image, file, response, approval, or external reference supporting completion.
- **Field Map:** Structured definition of fields required by an approved template/requirement.
- **Fraction:** One delivered treatment session/record.
- **IGSRT:** Image-Guided Superficial Radiation Therapy.
- **N/A:** Not Applicable; allowed only for optional/conditional requirements with a reason.
- **OPS:** Tokenized operational data boundary.
- **PHI/ePHI:** Protected Health Information/electronic PHI.
- **RTT:** Radiation Therapist.

## 10. Golden Rules

1. Confirm the patient and active course before acting.
2. Follow the exact next action and blocker evidence.
3. Complete structured records before generating files.
4. Never bypass required approval by changing a status.
5. Use N/A only when allowed and always provide a reason.
6. Correct through versioned/audited actions; do not erase history.
7. Treat prototype signatures, uploads, and generated outputs as simulations unless verified otherwise.
8. Never use real PHI until formal production approval.
