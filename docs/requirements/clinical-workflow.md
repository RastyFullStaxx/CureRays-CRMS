# Clinical and Administrative Workflow Requirements

- **Status:** Canonical target requirements
- **Evidence base:** `docs/2026_TEMPLATES`, the typed template registry, current clinical workflow code, and the patient-first operating model
- **Scope:** Patient registration through course closure for Skin Cancer IGSRT, Arthritis, and Dupuytren's workflows

## Purpose

CureRays CRMS must replace the operational dependence on copied Word documents, fraction spreadsheets, PowerPoint planning references, folder movement, and manually reconciled status trackers. The application database—not a file name or Drive folder—is the workflow source of truth.

These requirements describe the target behavior. They do not claim that the current prototype implements it. See [`../status/current-state.md`](../status/current-state.md) for implementation status.

## Source Template Coverage

The normalized 2026 source library contains 30 physical files: 19 DOCX, 9 XLSX, and 2 PPTX. The registry contains 31 source records because it also tracks one explicitly missing billing/preauthorization mapping.

The source artifacts define these workflow families:

- Universal patient intake and AVS/PCP communication.
- Skin Cancer IGSRT carepath/preauthorization audit, simulation/CTP order, prescription, isodose support, and fractionation log.
- Arthritis hand/foot joint mapping, hand/foot/knee simulation orders, prescriptions, and fractionation logs.
- Dupuytren's ultrasound mapping, simulation order, prescription, isodose support, and fractionation log.
- Draft/revision candidates for Arthritis and Gynecomastia that are not approved active workflow sources.

The templates are evidence for fields and artifacts, but they are not complete organizational SOPs. CureRays owners must separately validate exception handling, appeals, scheduling policy, responsibility handoffs, coding policy, retention, and downtime procedures.

## Required Operating Model

The patient course follows one gated flow:

`Registration and intake -> consultation -> mapping and authorization -> simulation -> planning and prescription -> treatment readiness -> daily treatment and approvals -> records and billing -> audit and follow-up -> closure`

Every actionable workflow item must identify:

- the patient and course within the PHI boundary;
- the applicable diagnosis, protocol, site/body region, laterality, modality, and fraction plan;
- the required fields and evidence;
- the responsible owner and reviewer;
- the due date or triggering event;
- the status, blockers, and exact next action;
- the generated artifact, version, signature, and external-system state when applicable;
- the audit history, including correction, N/A, override, and reopening reasons.

## 1. Registration and Intake

The system must:

- create one patient identity record and one or more treatment courses without duplicating patients by phase;
- treat any AVS/Intake DOCX prefill as an untrusted draft that staff must review and confirm;
- never derive or generate the official external MRN;
- require a deliberate identity confirmation before saving detected name, DOB, MRN, or contact information;
- capture diagnosis category, protocol, body region/site, laterality, treating team, referral/consult context, and initial course dates;
- select a workflow definition only after required applicability data is known;
- create applicable steps, tasks, document requirements, owners, due rules, and initial audit evidence atomically;
- reject partial saves that would leave a patient without its required course/workflow bundle;
- record creation and later correction as audited events without exposing PHI in operational logs.

## 2. Consultation and Preparation

The Prepare workspace must render the complete applicable field map rather than only a step status.

It must support:

- universal intake completion and review;
- consultation findings and treatment intent;
- diagnosis/protocol-specific mapping;
- preauthorization status and evidence;
- simulation and planning orders;
- prescription preparation and review;
- evidence attachment, including required photos/images;
- owner assignment, due date, reviewer, completion criteria, and blockers;
- explicit N/A with a reason only for optional requirements;
- read-only completed/signed records with an audited correction/reopen action.

Completion of a step must be blocked until its required structured fields, evidence, review, and signature state are satisfied.

## 3. Mapping Requirements

### Arthritis joint mapping

The structured record must support the applicable hand or foot anatomy and capture:

- laterality and mapped joint/region;
- joint-space narrowing, osteophyte, sclerosis, and overall grade where the approved template requires them;
- field inclusion/exclusion decision;
- clinical photographs or mapped image evidence;
- comments/impression and performing clinician;
- coding/medical-necessity language selected from an approved, effective-dated content version.

### Dupuytren's ultrasound mapping

The structured record must support:

- laterality and mapped hand/palm/wrist regions;
- nodule/cord or target findings by region;
- depth, margins, internal architecture, and tendon/fascial relationship where clinically required;
- included/excluded treatment regions and field design rationale;
- archived ultrasound image evidence;
- performer, interpretation, date, and approved coding language version.

Mapping content must not be reduced to one generic note field when the source template requires repeated anatomy-specific observations.

## 4. Preauthorization and Administrative Readiness

The system must model preauthorization as a first-class workflow, not a document checkbox.

Required states include at minimum:

- not started;
- information required;
- submitted;
- payer pending;
- approved;
- partially approved;
- denied;
- appeal/reconsideration in progress;
- expired;
- not required, with reason.

The record must capture payer/plan reference, requested services/codes and quantities, submitted evidence, authorization number, effective dates, decision, denial reason, appeal history, responsible owner, reviewer, and source documents. Treatment readiness must use this structured state according to CureRays-approved policy.

The two Skin Cancer preauthorization templates and the missing billing-preauthorization mapping remain explicit blockers until clinically and administratively mapped.

## 5. Simulation and Planning Orders

Applicable orders must capture the full approved template field set, including:

- diagnosis/site and laterality;
- target/margin instructions by phase;
- anticipated energy, dose, dose per fraction, and fraction count;
- positioning, chair/setup, markers, shields/devices, and immobilization;
- required treatment-planning photographs and image checklist;
- ultrasound/dermoscopy/x-ray requirements as applicable;
- physics requirements, special-physics reason, weekly check requirements, and in-vivo dosimetry state;
- ordering clinician, completion date, review, and signature.

Scheduling simulation or advancing to planning must be blocked when mandatory order data or signature evidence is missing.

## 6. Prescription and Treatment Plan

The prescription must be structured and versioned. It must support one or more phases and capture:

- site and laterality;
- total dose, dose per fraction, cumulative dose target, and fractions per phase;
- energy, applicator, SSD, treatment time, margin, technique, and beam arrangement;
- shielding/devices and setup requirements;
- fractions per day/week, sequential/synchronous behavior, and standard/hypofractionated designation;
- imaging guidance requirements and target-depth/DOT parameters;
- prior radiation/concurrent therapy and clinically relevant constraints;
- preauthorization linkage;
- clinician review, signature, lock state, and correction version.

No treatment fraction may be recorded against an unsigned, unlocked, superseded, or internally inconsistent prescription unless an approved emergency/override policy exists and a reason is audited.

## 7. Isodose and Clinical Calculation Safety

Isodose curves and depth-dose tables are controlled clinical references. The system must:

- bind calculations to an approved reference version, energy, applicator/field, and measurement units;
- preserve the original approved reference artifact and checksum;
- distinguish table lookup/interpolation, manually entered override, and device-derived values;
- validate allowed ranges and require a reason/reviewer for manual overrides;
- show surface dose, target depth, percent depth dose/isodose, dose to target depth, and cumulative values with explicit units;
- record the formula/reference version used for each result;
- prevent production use until CureRays clinical validation and sign-off are recorded;
- never present prototype calculations as validated clinical guidance.

## 8. Treatment Readiness and Scheduling

One authoritative course gate must determine whether treatment may proceed. It must aggregate:

- applicable preparation steps;
- authorization policy;
- signed simulation/planning orders;
- signed and locked prescription;
- approved treatment plan and clinical calculation reference;
- required image/setup evidence;
- device/shield readiness;
- physics and clinician sign-offs;
- appointment/schedule state.

The UI must list specific blocking reasons and the responsible owner. A generic `Not Ready` state is insufficient.

## 9. Daily Fraction Recording

The fraction workflow must capture:

- fraction number and treatment date/time;
- prescription phase;
- energy, applicator/field size, SSD, and treatment time;
- dose per fraction and cumulative surface dose;
- target depth/DOT, isodose percentage, dose to DOT, and cumulative dose to DOT when applicable;
- therapist/technologist identity;
- treatment setup comments and required image evidence;
- DOT/imaging approval and physician approval;
- OTV and physics check requirements and completion;
- applicable service/coding evidence;
- correction, revision, or void history.

The system must prevent duplicate active fraction numbers and must derive approval status from required approvals. Corrections must recalculate dependent cumulative values and invalidate downstream approvals when required.

## 10. Documents and Records

Clinical forms and generated files must share a searchable course record model with:

- originating workflow requirement;
- template/version/checksum;
- structured source-data snapshot;
- output format and version;
- generation status;
- reviewer and review decision;
- signature and lock state;
- external storage reference;
- eCW transfer/confirmation state;
- manual-edit exception and correction lineage;
- audit readiness and evidence links.

Files are outputs and evidence. Their presence must never substitute for structured workflow state.

## 11. Billing and Coding Evidence

Billing readiness must be derived from documented services rather than a free-standing `Ready` flag. The system must reconcile:

- authorized/requested services;
- planned quantities from the prescription/course;
- completed quantities from treatment and imaging records;
- required physician/physics/therapy documentation;
- applicable code and modifier version/effective date;
- linked supporting record;
- billing review decision and exception reason;
- claim/export status when that integration is implemented.

Coding language embedded in source templates must be versioned, owner-approved, and reviewed when payer rules or effective dates change.

## 12. AVS, Follow-Up, Audit, and Closure

Closure must remain blocked until all applicable requirements pass:

- final treatment status and treatment summary;
- completed/signed/locked required documents;
- external upload confirmation where required;
- billing evidence reconciliation;
- required image and physics evidence;
- resolved audit checks and explicit N/A reasons;
- AVS/PCP communication and follow-up plan;
- approved final audit signature.

Reopening a closed course or locked record requires an authorized role, a reason, a new version where applicable, and an immutable audit event.

## 13. Cross-Patient Administrative Work

The patient workspace is the source of truth for one course, but staff also require PHI-minimized global views for:

- today/assigned work;
- overdue and blocked work;
- pending signatures and reviews;
- authorization follow-up;
- treatment schedule;
- billing and audit exceptions;
- operational analytics;
- workflow/template/user configuration.

Global views must deep-link to the exact patient-course action and must not maintain competing workflow state.

## Validation Ownership

Before a workflow family is production-enabled, CureRays must record approval from the appropriate owners:

- Radiation Oncologist: clinical workflow, prescriptions, treatment gates, generated clinical content.
- Medical Physicist: isodose/depth-dose references, calculation behavior, physics evidence, device/setup rules.
- Therapists/RTTs: fraction-entry workflow and practical treatment-room evidence.
- Billing/authorization staff: payer states, codes, quantities, evidence, denial/appeal workflow.
- Compliance/security owner: PHI access, audit, retention, export, and incident procedures.
- Operations/admin owner: assignments, scheduling, exceptions, downtime, and closeout handoffs.
