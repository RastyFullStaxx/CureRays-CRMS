# Production Readiness Requirements

- **Status:** Mandatory gate for any real PHI/ePHI or clinical production use
- **Current disposition:** Not satisfied

## Rule

Passing prototype guardrails, rendering realistic mock data, or completing a feature phase does not establish production readiness. Production use requires all applicable controls below to be implemented, independently verified, and approved by CureRays.

## 1. Identity, Authentication, and Authorization

- Real identity provider and session management; no role headers or synthetic actors.
- MFA and appropriate session timeout/re-authentication for sensitive actions.
- Server-enforced RBAC for PHI reads, patient/course mutation, document generation, signing, export, eCW confirmation, billing, audit, and administration.
- Facility/tenant scope when more than one clinic or legal entity is supported.
- Least-privilege defaults, role review, access revocation, and break-glass policy.
- Identity-bound signatures that cannot be created by changing a client-visible role.

## 2. Durable OPS and PHI Persistence

- Fully implemented repositories for every read and mutation path; no in-memory fallback in production.
- Separate OPS and PHI databases with tokenized cross-boundary references only.
- Transactional creation of patient/course/workflow bundles.
- Optimistic concurrency or equivalent conflict protection for mutable clinical records.
- Database constraints for uniqueness, required relations, version lineage, and immutable/append-only records.
- Tracked migrations, backup/restore drills, retention rules, and tested disaster recovery.

## 3. PHI and Security Boundaries

- PHI never appears in client bundles, operational APIs, query strings, analytics payloads, logs, error messages, or browser storage unless explicitly required and authorized.
- Server-side PHI resolution with purpose-of-use context.
- Encryption in transit and at rest with managed keys and rotation procedures.
- Secret management with no production credentials in source or client code.
- BAA-covered infrastructure and vendors for every service that stores or processes ePHI.
- Secure headers, dependency/vulnerability management, environment isolation, and incident response.
- Export/download controls, watermarking or policy controls where required, and secure temporary-file cleanup.

## 4. Immutable Audit and Monitoring

- Append-only audit events for PHI read, create, update, delete/void, print, download, export, sign, upload, access denial, permission change, and break-glass use.
- Authenticated actor, patient/course reference, action, resource/version, timestamp, session, device/IP context, reason, and safe before/after metadata.
- No full patient objects or identifiers in monitoring payloads.
- Tamper detection, retention, searchable review, alerting, and periodic access audits.
- Operational monitoring for failed integrations, stuck queues, document failures, and anomalous access.

## 5. Clinical Validation

- Approved field-by-field mapping for every enabled template family.
- Approved workflow applicability and gate rules for each diagnosis/protocol/site/laterality combination.
- Independent validation of isodose/depth-dose references, formulas, interpolation, units, rounding, cumulative-dose behavior, and overrides.
- Golden clinical test cases with expected results and clinician sign-off.
- Human-factors testing with Rad Onc, physics, RTT, billing/authorization, and administrative users.
- A formal change-control process for clinical rules and reference versions.

## 6. Document Generation and Signature

- Real DOCX/PDF/XLSX/PPTX generation from approved immutable template versions.
- Deterministic merge fields and complete required-source validation.
- Rendered-output QA, version lineage, corrections, voiding, and manual-edit exceptions.
- Secure durable storage with checksum, access control, retention, and deletion policy.
- Identity-bound electronic signature with intent, timestamp, signed content hash, and lock state.
- No regeneration or mutation of a signed version; corrections create a new linked version.

## 7. External Integrations

- eCW, Drive/storage, signature, and claim/export adapters must use approved credentials and BAA-covered services where applicable.
- Idempotent operations, retry policy, dead-letter/error queues, reconciliation, and user-visible failure recovery.
- External identifiers and timestamps stored without treating a local status toggle as proof of transfer.
- Periodic reconciliation between CRMS and external systems.
- Downtime and manual fallback procedures with later reconciliation.

## 8. Administrative and Revenue-Cycle Readiness

- Approved preauthorization state model, payer evidence, denial/appeal handling, effective dates, and treatment-gate policy.
- Versioned code/modifier catalog with effective dates and owner review.
- Planned/completed/billed quantity reconciliation tied to source evidence.
- Scheduling, cancellation, rescheduling, no-show, and course interruption handling.
- Record correction, amendment, reopen, retention, and legal-hold procedures.

## 9. Quality Engineering

- Unit tests for services and clinical calculations.
- Behavior tests for store/repository mutations and gate derivation.
- Integration tests for APIs, database transactions, auth/RBAC, and external adapters.
- Browser tests for critical patient workflows, keyboard access, responsive behavior, modal/focus behavior, and table overflow.
- Security tests for authorization bypass, cross-patient/cross-facility access, PHI leakage, file upload, and export.
- Performance/load targets for patient search, queues, course workspace, and bulk operational views.
- Release regression suite using synthetic data only.

## 10. Deployment and Operations

- Production/staging environment separation and controlled release process.
- Infrastructure configuration review, secure backups, restore test, and rollback plan.
- Data migration/reconciliation plan for existing Drive/worksheet records.
- Named operational owners and escalation paths.
- Training, user acceptance, cutover, downtime, and support procedures.
- HIPAA/security risk assessment and final go-live approval.

## Go-Live Evidence Matrix

Production readiness is achieved only when each control has:

- an accountable owner;
- an implemented control or documented approved exception;
- objective evidence such as code, configuration, test output, audit sample, contract/BAA, validation protocol, or signed approval;
- a review date and revalidation trigger.

The authoritative status for these controls belongs in [`../status/current-state.md`](../status/current-state.md), not in this requirements document.
