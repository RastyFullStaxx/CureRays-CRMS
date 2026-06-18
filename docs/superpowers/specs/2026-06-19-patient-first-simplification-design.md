# Patient-First Simplification Design

## Problem

CureRays CRMS currently exposes too many top-level tools for the same patient-course work. Staff see separate pages for patients, courses, workflow, tasks, forms, planning, imaging, delivery, documents, billing, audit, and phase cohorts. The patient workspace then repeats many of those tools as tabs. This makes users decide where work belongs before they can maintain a patient record.

## Product Decision

The product should become patient-record first. Primary work happens from the patient registry and patient workspace. Global pages are retained only when they answer a clearly different question: daily action triage, schedule, dashboard oversight, analytics, and administration.

## Navigation

Primary sidebar links become:

- Patients
- Today
- Schedule
- Dashboard
- Analytics
- Settings

The removed sidebar items are demoted from primary navigation:

- Courses
- Workflow
- Tasks
- Clinical Forms
- Treatment Planning
- Imaging
- Treatment Delivery
- Documents
- Billing
- Audit & QA
- Users & Roles
- Templates
- Security Logs

Existing route files may remain for compatibility, but redundant global work routes should redirect to the patient-first destination instead of remaining separate work surfaces.

## Patient Workspace

The patient workspace exposes five visible sections:

- Overview: current course state, next action, blockers, unsigned documents, treatment gates.
- Carepath: ordered carepath steps and task rows in one place.
- Treatment: planning parameters, readiness gates, imaging evidence, and fraction worksheet.
- Documents & Billing: clinical forms, generated documents, signatures, billing evidence, and audit readiness.
- Activity: redacted history and audit activity.

Workflow is the course path. Tasks are the actionable rows inside that path. Staff should not have to pick between "Workflow" and "Tasks" as separate destinations.

## Dashboard And Analytics

Dashboard and Analytics keep their existing chart-heavy visual direction. They are oversight/reporting surfaces, not primary record maintenance tools.

## Safety

Patient pages keep existing PHI access behavior. The simplification does not add new PHI exposure, logging, or client-side data classes.
