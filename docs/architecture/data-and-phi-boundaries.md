# Data and PHI Boundaries

- **Status:** Canonical target architecture
- **Current implementation:** Transitional mock/in-memory plus partial Prisma hydration

## Principles

1. PHI and operational workflow data have different storage and exposure boundaries.
2. Cross-boundary relations use opaque internal references, not names or MRNs.
3. Server services own PHI access and mutation.
4. Client components receive the minimum data necessary for the active patient task.
5. Analytics, queues, and logs are PHI-minimized by default.
6. Production cannot fall back to in-memory state.

## Database Responsibilities

### OPS database

Stores tokenized operational state:

- patient/course opaque references;
- workflow definitions and step instances;
- tasks, owners, due dates, and blockers;
- template metadata and field-map definitions;
- document lifecycle metadata without document PHI content;
- treatment operational status where safely tokenized;
- billing/audit readiness state;
- external-system references;
- append-only operational audit events.

### PHI database

Stores protected patient/clinical data:

- patient identifiers and demographics;
- external MRN and contact information;
- diagnosis/site/laterality and clinical narrative when identifiable;
- structured clinical form responses;
- prescriptions, plans, fractions, and clinical observations;
- document-generation source snapshots;
- PHI-bearing file metadata where required.

The exact placement of treatment and document fields must be decided field by field. Calling a table “operational” does not make identifiable clinical data non-PHI.

## Core Domain Records

- Patient
- TreatmentCourse
- WorkflowDefinition and WorkflowStep
- Task
- TemplateSource, DocumentRequirement, and TemplateFieldMap
- ClinicalFormResponse
- DocumentInstance and DocumentOutputVersion
- TreatmentPlan and PrescriptionPhase
- TreatmentFraction
- ImagingAsset/EvidenceAsset
- Appointment
- AuthorizationCase
- BillingItem
- AuditCheck
- AuditEvent
- User, Role, Permission, and FacilityAssignment

## Repository Rules

- Page components do not mutate shared arrays directly.
- Route handlers delegate to server services.
- Services validate authorization, input, workflow gates, and concurrency.
- Repositories perform durable reads/writes and transactions.
- Production repository selection fails closed if persistence is unavailable.
- Cross-database operations use stable opaque references and explicit coordination; they do not perform unsafe ad hoc joins.
- Patient/course bundle creation defines rollback/compensation behavior across OPS and PHI.

## DTO Rules

Operational DTOs may include:

- `patientRef` and `courseRef`;
- phase/status;
- owner role or opaque user reference;
- due date;
- blocker category;
- counts and aggregate readiness;
- redacted audit description.

Operational DTOs must not include unless the route is explicitly PHI-authorized:

- patient name;
- DOB;
- MRN;
- phone/email/address;
- diagnosis narrative tied to identity;
- clinical notes;
- generated-document preview/content;
- raw before/after audit values;
- storage credentials or signed URLs with excessive lifetime.

## PHI Access Context

Every PHI service action requires:

- authenticated actor;
- authorized role/action;
- patient/course scope;
- purpose/reason;
- session context;
- auditable resource/action identity.

System/background actions require a service identity and cannot impersonate a clinician.

## Client Boundary

- Do not import PHI stores or PHI-bearing mock objects into client modules.
- Do not store PHI in localStorage, sessionStorage, IndexedDB, analytics, or client error telemetry.
- Do not place PHI in URLs or query strings.
- Keep PHI in memory only for the active authorized view.
- Clear temporary upload/preview data after completion or cancellation.
- Treat screenshots, browser recordings, and test artifacts as possible PHI exports.

## Audit Boundary

Audit records identify the actor, action, resource reference, time, reason, and safe change metadata. PHI content is not copied wholesale into audit events. Sensitive before/after evidence belongs in protected versioned records, referenced by opaque IDs.

Audit storage must be append-only in production. Application-level arrays or editable rows are insufficient.

## Error and Logging Rules

- Client errors are generic and actionable.
- Server logs use opaque references.
- Never log request bodies or patient objects by default.
- Sanitize stack traces and integration payloads.
- Failed external operations retain safe diagnostic codes and reconciliation state without copying PHI to general logs.

## File and Object Storage

Files are outside the relational database unless a specific approved design says otherwise. The database stores controlled metadata, checksums, ownership, versions, access state, and external references. Access is authorized server-side and uses short-lived retrieval mechanisms.

See [document lifecycle](document-lifecycle.md).

## Current Transitional State

The repository contains separate Prisma schemas, generated clients, local SQL/seed support, and server hydration. Several command repositories and UI flows still use shared in-memory state or simulated persistence. This is acceptable only for synthetic/de-identified development and must remain visible as a production blocker in [current state](../status/current-state.md).
