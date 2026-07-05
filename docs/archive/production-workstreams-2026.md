# Archived: Production Workstreams (2026 Roadmap Detail)

> **Non-authoritative historical record.** This preserves the full scope and acceptance evidence of the eight production workstreams from the pre-pilot roadmap, superseded on 2026-07-06 when the active plan was re-scoped to the pilot milestones in [`../roadmap/implementation-roadmap.md`](../roadmap/implementation-roadmap.md). The production gates themselves remain authoritative in [`../requirements/production-readiness.md`](../requirements/production-readiness.md).

## Workstream 1: Structured Preparation Workbench

**Outcome:** Staff complete the real intake/mapping/simulation/prescription work inside Prepare.

### Scope

- Resolve each workflow step to an applicable `DocumentRequirement` and `TemplateFieldMap`.
- Render field-map sections using shared form primitives.
- Persist typed values and evidence references.
- Enforce required fields, units, allowed options, and conditional applicability.
- Support draft, submit for review, return for correction, sign, N/A, reopen, and version history.
- Display missing/deferred/draft mappings as blockers rather than editable ready work.
- Cover repeated anatomy observations for Arthritis and Dupuytren's mapping.

### Acceptance evidence

- Service and repository behavior tests.
- API integration tests for draft/review/sign/reopen.
- Browser test for one Skin Cancer, Arthritis, and Dupuytren's preparation flow.
- Clinical owner approval of field mapping and completion gates.

## Workstream 2: Preauthorization and Billing Administration

**Outcome:** Authorization and billing readiness are structured, traceable, and tied to evidence.

### Scope

- Complete 20fx/30fx Skin Cancer carepath/preauth mapping.
- Obtain and map the missing billing-preauthorization source/SOP.
- Implement payer/requested-services/evidence/submission/decision/effective-date states.
- Add denial, appeal/reconsideration, partial approval, expiration, and N/A handling.
- Tie authorization policy to treatment readiness.
- Reconcile planned, authorized, completed, and billable quantities.
- Version codes/modifiers and medical-necessity language by effective date.

### Acceptance evidence

- Authorization state-transition tests.
- Quantity/evidence reconciliation tests.
- Billing/authorization stakeholder sign-off.
- Exception and appeal workflow demonstration.

## Workstream 3: Durable Data and Repository Completion

**Outcome:** Every production path uses durable OPS/PHI persistence with no memory fallback.

### Scope

- Inventory every read/mutation path and assign OPS or PHI ownership.
- Implement Prisma repositories for workflow, tasks, clinical responses, documents, fractions, billing, audit, and closeout.
- Add transactions for patient/course bundles and multi-record workflow transitions.
- Add constraints, optimistic concurrency, rollback, and idempotency.
- Remove production fallback to shared mutable arrays.
- Add tracked migrations, seed fixtures, and backup/restore procedures.

### Acceptance evidence

- Repository contract tests against PostgreSQL.
- API integration tests proving persistence across process restart.
- Transaction rollback and concurrency tests.
- Data-boundary review and migration evidence.

## Workstream 4: Authentication, RBAC, and Immutable Audit

**Outcome:** Every sensitive action has a real actor, enforced authorization, and immutable trace.

### Scope

- Integrate an approved identity provider, MFA, sessions, timeout, and revocation.
- Replace prototype role headers and synthetic actors.
- Define permissions by role, action, and PHI sensitivity.
- Enforce access in server services/routes, not client UI.
- Implement append-only audit storage for reads, writes, signatures, exports, permissions, and denials.
- Add access review, break-glass, alerting, and audit retention.

### Acceptance evidence

- Authorization matrix and negative tests.
- Cross-patient/facility isolation tests where applicable.
- Audit immutability and completeness tests.
- Security/compliance approval.

## Workstream 5: Real Document and Evidence Lifecycle

**Outcome:** Approved templates generate authoritative, reviewable, signed, versioned files.

### Scope

- Build deterministic DOCX/PDF/XLSX/PPTX generation adapters.
- Snapshot structured source data and template checksum per version.
- Store generated files in approved encrypted storage.
- Implement render QA, review, correction, void, and manual-edit exception behavior.
- Implement evidence/image upload with validation, metadata, checksum, and access control.
- Implement identity-bound signatures and immutable signed versions.

### Acceptance evidence

- Golden generated-output fixtures for each enabled template family.
- Render/visual QA and field-completeness tests.
- Signature content-hash and lock tests.
- Storage access, retention, and recovery tests.

## Workstream 6: eCW, Drive, and External Reconciliation

**Outcome:** External state is confirmed by adapters, not manually asserted toggles.

### Scope

- Define approved eCW and storage/Drive integration contracts.
- Implement idempotent upload/sync operations, retries, and failure queues.
- Store external IDs, timestamps, result payload metadata, and reconciliation state.
- Provide user-visible retry/recovery without duplicating records.
- Define downtime/manual procedures and later reconciliation.

### Acceptance evidence

- Sandbox/approved-environment integration tests.
- Duplicate/retry/failure recovery tests.
- Reconciliation reports and operational runbooks.
- Vendor/security/BAA approval where ePHI is processed.

## Workstream 7: Clinical Calculation and Treatment Validation

**Outcome:** Treatment planning and fraction calculations are validated, versioned, and safe.

### Scope

- Approve source isodose/depth-dose tables and checksums.
- Specify lookup/interpolation, units, rounding, and boundary behavior.
- Validate phase totals, cumulative surface dose, dose-to-depth, and correction recalculation.
- Define image/DOT, physician, OTV, and physics gates by protocol.
- Create golden clinical cases and independent expected results.
- Record sign-off and change-control requirements.

### Acceptance evidence

- Physicist/Rad Onc-approved validation protocol.
- Golden-case automated tests.
- Boundary/override/correction tests.
- Production reference-version approval.

## Workstream 8: Closeout, Operations, and Release

**Outcome:** A complete patient course can be operated, audited, closed, reopened, and supported.

### Scope

- Complete AVS/follow-up, billing, external upload, audit, and final closure gates.
- Add scheduling interruption, cancellation, no-show, and resumption policy.
- Add correction/amendment, retention, legal hold, and downtime procedures.
- Complete accessibility and critical-path browser testing.
- Define monitoring, backup/recovery, incident response, training, cutover, and support.
- Migrate/reconcile legacy worksheet and Drive records using approved procedures.

### Acceptance evidence

- End-to-end synthetic patient scenarios for every enabled protocol.
- UAT sign-off from each operational role.
- Security/HIPAA risk assessment.
- Restore, rollback, downtime, and support drills.
- Formal go-live approval.
