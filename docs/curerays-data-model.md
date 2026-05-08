# CureRays Data Model

The app should align around these core entities. Existing mock data and Prisma schemas can be adapted incrementally.

## Core Entities

- Patient: identifiers, demographics, diagnosis summary, status, and timestamps.
- Course: diagnosis type, lesion/site/laterality/location, providers, detailed phase, dashboard phase, assigned staff, next action, flags, dates, and notes.
- WorkflowStep: course step number/name/phase/status, responsible role, assigned user, trigger, due date, signature, linked document, N/A reason, blockers, audit checklist, and timestamps.
- Task: role-based actionable work linked to patient, course, workflow step, document, form, appointment, and due date.
- DocumentTemplate: configurable master template metadata and required fields.
- DocumentInstance: generated patient/course document with storage link, preview, version, signature, upload, and lock state.
- ClinicalFormTemplate and ClinicalFormResponse: structured form schemas and responses that can generate documents.
- TreatmentPlan: planning/prescription parameters, depth-dose placeholders, physics review, Rad Onc signature, and lock state.
- TreatmentFraction: daily fraction, dose, cumulative dose, energy, applicator, image guidance, therapist, review, status, and notes.
- ImagingAsset: category, phase, fraction link, storage link, uploader, timestamp, and notes.
- Appointment: patient/course timing, type, status, provider, linked workflow step, and notes.
- BillingItem: code, description, planned/completed/billed quantity, status, linked document, and notes.
- AuditCheck: final closeout checklist item with evidence document, required flag, N/A reason, and completion metadata.
- ActivityLog: actor, patient/course, entity, action, old/new value, timestamp, and optional IP/device.
- User / Role: future RBAC-compatible user and role records.

## Roles

- Admin
- Virtual Assistant
- Medical Assistant
- Therapist / RTT
- Nurse Practitioner / PA
- Doctor / PCP
- Doctor / Rad Onc
- Medical Physicist / PhD
- Billing Staff

Current frontend placeholders anticipate role-based routing and permissions, but final auth and permission enforcement are a later backend/security pass.
