# Patient Workspace Contract

- **Status:** Stable product architecture; implemented for prototype with incomplete operational depth
- **Route:** `/patients/[id]`

## Decision

The workspace is organized around the patient course rather than application data categories. It has four stable tabs:

1. **Overview** — authoritative readiness, next action, phase progress, and prioritized exceptions.
2. **Prepare** — intake, mapping, authorization, simulation, planning, prescription, evidence, assignment, and signatures.
3. **Treatment** — ready-to-treat gate, current/next fraction, daily requirements, approvals, and treatment history.
4. **Record & Closeout** — documents, forms, versions, eCW state, billing evidence, audit, AVS/follow-up, activity, and closure.

Do not add a new tab merely because a new entity or document type exists. Add it to the workflow location where staff act on it.

## Persistent Patient/Course Context

At desktop width, a compact sticky sidebar displays:

- patient identity/status within the authorized PHI view;
- external MRN label/value;
- active course and concise diagnosis/protocol/site;
- current phase;
- logged treatment progress;
- course gate;
- one authoritative next action;
- Signals and Patient Details actions;
- vertical four-tab navigation.

Below the desktop breakpoint, the same essential context becomes a compact header and horizontal tabs. Secondary facts move behind Patient Details. The page remains the only vertical scroll owner.

## Shared State Rules

- One derived course gate supplies every tab.
- One next action is selected from blocking state, due state, role relevance, and workflow order.
- Required work is never silently sliced from lists.
- Statuses are derived from evidence/approvals where applicable.
- Completed and signed records open read-only.
- Correction/reopen actions require reasons and preserve history.
- Failed saves preserve user input and explain the failed field or gate.
- Workspace tabs use stable URL/history mapping without PHI in query strings.

## Overview

Overview answers: **What must happen next, who owns it, what blocks the course, and is it safe to advance?**

Required content:

- Ready, Review Required, or Blocked banner with reasons and evaluation time;
- exact next action, owner, due state, and destination;
- Consultation through Closed phase tracker;
- grouped attention queue: blocking, ready for role, due soon, informational;
- concise course facts needed for the current decision;
- recent meaningful activity with access to full history.

Overview must not duplicate every value already visible in persistent context.

## Prepare

Prepare answers: **What must be completed before treatment or the next preparation phase?**

Required design:

- phases grouped as Consultation, Chart Prep, Simulation, and Planning;
- selectable step list/stepper;
- selected-step workbench;
- complete applicable `TemplateFieldMap` sections;
- owner, reviewer, due/trigger, status, blockers, and completion criteria;
- evidence, document version/generation, signature, and external-upload state next to the action;
- exact actions such as Complete Mapping, Generate Order, Review and Sign, Upload to eCW, Resolve Blocker, or Mark Not Applicable.

Current prototype limitation: selected steps and status actions exist, but complete field-map rendering/persistence is not yet wired. This limitation must remain visible until Workstream 1 of the roadmap is complete.

## Treatment

Treatment answers: **Can today’s fraction proceed, what must be recorded, and what remains unapproved?**

Required order:

1. Ready-to-treat gate and blockers.
2. Current/next fraction composer.
3. Locked prescription/plan parameters needed for entry.
4. Daily checklist: schedule, setup/image evidence, dose/DOT, performer, DOT approval, MD approval, OTV, and physics.
5. Searchable treatment history.
6. Secondary reference/billing actions.

Counts remain precise:

- Logged X/Y
- Approved X/Y logged
- Upcoming scheduled X

Approved status is impossible while any required approval is pending. Corrections and voids preserve lineage and recalculate downstream cumulative state.

Current prototype limitation: calculation/reference behavior remains clinically unvalidated and production-blocked.

## Record & Closeout

Record & Closeout answers: **Is the record complete, transferred, billable, auditable, and ready to close?**

Required content:

- closure readiness grouped by documents/signatures, external uploads, treatment, billing, audit, and AVS/follow-up;
- one searchable record list for forms and generated files;
- originating requirement, status, version, signature, external state, owner, and updated time;
- billing evidence beside the clinical source that supports it;
- audit checks with evidence, reviewer, decision, reason, and timestamp;
- readable activity timeline with actor, action, affected record, time, and reason;
- final closure action available only when every applicable gate passes.

Current prototype limitation: several document/form/image actions are simulated and do not produce durable external files.

## Accessibility and Interaction

- Keyboard-operable tabs with correct arrow/Home/End behavior.
- Alt+1–4 shortcuts when they do not conflict with browser/assistive technology behavior.
- Visible focus and semantic headings.
- Text alternatives to color.
- Modal focus containment and deliberate cancel/recovery.
- 12px minimum functional text under the CureRays typography contract.
- Reduced-motion support.
- Usable layout at narrow widths and 200% zoom.

## Acceptance Criteria

- A user identifies patient, active course, gate, next action, owner, and blocker within five seconds.
- No required work is hidden or represented only by an aggregate count.
- No course/fraction appears ready or approved while required evidence or approval is missing.
- Staff can complete intake-to-closeout work without locating a separate Drive template.
- Every generated/attached record remains discoverable from its workflow origin and the complete record.
- Every exceptional state records actor, reason, timestamp, and affected version.
- Prototype-only behavior is labeled honestly and cannot be mistaken for durable work.

## Verification Boundary

UI usability checks establish interaction quality only. They do not establish clinical validity, authorization, durable persistence, immutable audit, real signature, or external transfer. Those gates are defined in [production readiness](../requirements/production-readiness.md).
