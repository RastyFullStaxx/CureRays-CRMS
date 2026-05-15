# CureRays Clinical Workflow System

CureRays Clinical Workflow System (CWS) is a centralized workflow and document tracking system for CureRays treatment operations.

The purpose of the system is to replace fragmented Google Drive files, worksheets, and manual reminders with one operational workspace that shows staff what is happening, what is done, what is missing, who owns the next action, and what needs review before a patient workflow can move forward.

## Persistent Product Documentation

The CureRays workflow context is stored in repo docs so future development sessions do not need the domain brief repeated:

- [Product Context](docs/curerays-product-context.md)
- [Workflow Model](docs/curerays-workflow-model.md)
- [Page Plan](docs/curerays-page-plan.md)
- [Data Model](docs/curerays-data-model.md)
- [File Storage And Documents](docs/curerays-file-storage-and-documents.md)
- [Automation Rules](docs/curerays-automation-rules.md)

The current architecture is patient-course centered:

**Patients -> Courses -> Workflow Steps -> Tasks -> Forms/Documents -> Signatures -> Treatment Delivery -> Summary -> Audit -> Closeout.**

## What Problem It Solves

CureRays currently relies on multiple Drive templates, worksheets, and manual status tracking. That creates avoidable operational risk:

- Patient status can be updated in one place but missed in another.
- Documents can be pending, signed, not applicable, or missing without one clear tracker.
- Staff have to remember which template or worksheet comes next.
- Workflow ownership is spread across files instead of being visible by role.
- Audit readiness is hard to judge until someone manually checks the chart and supporting files.

CWS turns those moving parts into structured workflow state.

## Version 2 Direction

Version 2 prioritizes tracking before full automation.

The system should first become a reliable command center for patient workflow, document status, role ownership, and audit readiness. Document generation, deeper template parsing, and smarter automation can build on that foundation later.

The core rule is:

**Patient phase and workflow status are state, not file location.**

A patient should exist once. Upcoming, On Treatment, and Post views should be filtered views of the same patient and course records, not copied spreadsheet rows.

## How The Workflow Roughly Works

1. A patient has one centralized operational record.
2. The patient has an active treatment course with a chart-rounds phase: Upcoming, On Treatment, or Post.
3. The course has Carepath tasks grouped by workflow phase such as Consultation, Chart Prep, Planning, On Treatment, and Post-TX.
4. The course has required or optional documents with lifecycle status such as Pending / Needed, Missing Fields, Ready for Review, Signed, Exported, Completed, or N/A.
5. Each task or document has a responsible party so staff can see who owns the next action.
6. The dashboard, phase queues, patient profile, document page, task queue, reports, analytics, and audit logs all read from the same workflow state.

## What Version 2 Currently Supports

Current implemented frontend scope:

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- Dashboard command center with patient, document, task, audit, and role queue signals.
- Master patient records and phase-driven queues for Upcoming, On Treatment, and Post.
- Patient profile pages with overview, Carepath, documents, fraction log, and audit context.
- Document lifecycle tracking across pending, review, signed, exported, completed, and not-applicable states.
- Responsible-party work queues for clinical and operations roles.
- Audit readiness scoring from tasks, documents, and fraction approvals.
- Reports and analytics views for bottlenecks, audit blockers, diagnosis mix, and automation opportunities.
- IGSRT preview workspace for structured simulation order, prescription, fraction log, signing, rendering, and audit state.
- Template registry preview for Drive-based templates.

Current known limits:

- Data is still mock/in-memory and resets with the app process.
- Real authentication and role enforcement are not implemented yet.
- Prisma split schemas now model separate OPS and PHI databases, but the UI is still backed by mock/in-memory data until migrations and Cloud SQL deployment are run.
- Drive templates are modeled as registry metadata first; most files are not parsed into full field mappings yet.
- Intake and AVS are treated as first universal workflow documents, while diagnosis-specific template mappings continue to evolve.
- Billing pre-auth and additional mappings are intentionally represented as evolving registry items rather than hardcoded final workflow rules.

## Template And Document Strategy

Drive templates should be tracked in a registry before they are fully automated.

The registry should capture:

- Source file name and Drive URL.
- Diagnosis or protocol applicability.
- Workflow phase.
- Responsible party.
- Expected document lifecycle status.
- Whether the template is active, draft, retired, missing, or still being mapped.
- Known required fields when they are understood.

Initial universal documents:

- Intake Form
- AVS PCP Template

Diagnosis-specific families currently identified:

- Skin Cancer / IGSRT templates.
- Arthritis templates by body region such as hand, knee, and foot.
- Dupuytren's templates.
- Ongoing revision files.

The system should not assume these workflows are final. If a template is missing or not fully mapped, CWS should show that clearly instead of hiding the gap.

## How Staff Are Expected To Use It

Staff should use CWS as the daily operational tracker:

- Start on the dashboard to see total workload, open tasks, pending documents, audit readiness, overdue work, and role queues.
- Use phase queues to see which patients are Upcoming, On Treatment, or Post.
- Open a patient profile to see the active course, next action, required documents, Carepath tasks, fraction progress, and audit context.
- Use Documents to check what is pending, signed, N/A, missing, or needing review.
- Use Tasks to see work grouped by responsible party.
- Use Audit Logs to understand sensitive workflow changes.
- Use Reports and Analytics to identify bottlenecks and template/workflow improvement opportunities.

The goal is not to replace clinical judgment. The goal is to make operational status visible, consistent, and auditable.

## Architecture Principles

- Keep patient data centralized.
- Keep patient-identifying and clinical PHI in the PHI data boundary only.
- Keep operational lists tokenized with `patientRef`, `courseRef`, and redacted audit values.
- Derive views from workflow state instead of duplicating records.
- Keep workflow definitions and template metadata separate from sample patient data.
- Keep document requirements flexible by diagnosis, protocol, body region, modality, and future template availability.
- Treat missing or evolving templates as explicit registry states.
- Preserve audit context for important workflow changes.
- Avoid hardcoding final clinical assumptions while the template set is still being reviewed.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma schemas planned for PostgreSQL persistence:
  - `prisma/ops-schema.prisma` uses `OPS_DATABASE_URL` for tokenized workflow state.
  - `prisma/phi-schema.prisma` uses `PHI_DATABASE_URL` for Google Cloud SQL PHI records.

## HIPAA-Aware PHI Boundary

Operational dashboards, queues, reports, and workflow API responses use PHI-minimized DTOs. They should not include names, MRNs, free-text clinical notes, raw audit before/after values, or generated document previews.

Patient profile, IGSRT, and document-generation workflows resolve PHI through server-only code in `lib/server/phi-store.ts`. API requests that expose or mutate PHI must include an authorized `x-curerays-role` value while real authentication is pending.

Before storing real ePHI in Google Cloud SQL, CureRays must confirm the Google Cloud BAA, use only BAA-covered services, deploy the app/API inside the Google Cloud environment, and keep PHI database credentials in Secret Manager or equivalent runtime secret storage.

Run commands:

```bash
npm install
npm run dev
npm run typecheck
npm run test:hipaa
npm run build
```

## Development Notes

Use the existing frontend components and workflow helpers when extending the system. Prefer refactoring toward shared workflow definitions, document requirements, and registry-driven state instead of adding one-off pages for each template.

When a workflow detail is unknown, represent it as configurable metadata or a visible unmapped state. Do not hardcode assumptions about missing templates, billing pre-auth, diagnosis-specific variations, or future Drive mappings
