# Navigation and Page Responsibilities

**Status:** Canonical product structure

## Primary Navigation

The Mac-style command bar exposes:

- Patients
- Today
- Schedule
- Dashboard
- Analytics
- Settings

Persistent search supports patient, MRN, course, and action lookup within the PHI-safe product boundary. Account and theme controls remain available without competing with clinical actions.

## Page Responsibilities

### Patients

The authoritative patient registry for finding, creating, opening, and maintaining patient records. It is the normal entry point into a specific course.

### Today

Cross-patient work requiring attention now: blocked work, assigned work, overdue items, reviews/signatures, authorization follow-up, and treatment exceptions. Rows deep-link to the exact patient-workspace target.

### Schedule

Appointments, simulation, treatment fractions, follow-up, cancellations, and timing. Schedule state references patient/course workflow but does not independently advance it.

### Dashboard

Compact operational oversight: workload, blockers, pending review/signatures, schedule pressure, missing evidence, treatment progress, and recent exceptions. It is not a second patient workspace.

### Analytics

Aggregate operational reporting and bottleneck analysis using PHI-minimized data.

### Settings

Workflow definitions, template metadata, storage/integration configuration, users/roles/permissions, billing dictionaries, notifications, and security administration. Sensitive changes require real authorization and audit in production.

### Patient Workspace

The authoritative single-course work surface with four tabs:

1. Overview
2. Prepare
3. Treatment
4. Record & Closeout

See [patient workspace](patient-workspace.md).

## Legacy Routes

Legacy pages for Courses, Workflow, Tasks, Clinical Forms, Treatment Planning, Imaging, Treatment Delivery, Documents, Billing, Audit, Records, Upcoming, On Treatment, and Post may remain for:

- redirects;
- compatibility links;
- specialized cross-patient administrative queues that answer a distinct question.

They must not maintain competing patient-course state or present themselves as the preferred place to complete work that belongs in the patient workspace.

## Deep-Link Contract

Global queues and alerts link to:

- patient opaque route ID;
- stable workspace tab;
- stable target kind and record ID.

PHI such as name, MRN, DOB, or diagnosis narrative must not be encoded in query strings.

## Responsive Behavior

- The command bar never covers content or modal actions.
- Desktop patient pages use persistent patient/course context.
- Narrow/short layouts preserve identity, course, gate, and tabs while collapsing secondary details.
- The page owns vertical scrolling; tables and wide clinical records may own contained horizontal scrolling.
- Navigation remains keyboard operable and understandable at browser zoom.
