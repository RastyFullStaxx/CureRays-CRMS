# Current Implementation State

- **Last evidence review:** 2026-07-03
- **Lifecycle stage:** Active development prototype
- **Real PHI/ePHI use:** Prohibited
- **Authority:** This document records implementation status; code and test evidence override prose when they disagree.

## Executive Assessment

The information architecture and mock-data workflow are mature enough for continued design validation and controlled demonstrations. The system is not yet capable of replacing the client’s production worksheet/Drive process or supporting real patient operations.

The four patient-workspace tabs are the correct long-term structure. The primary gaps are implementation depth: complete structured template forms, preauthorization, durable persistence, real authentication and audit, generated artifacts, signatures, external integrations, and formal clinical validation.

## Evidence Summary

| Area | Current state | Evidence | Required next state |
|---|---|---|---|
| Patient-first navigation | Implemented for prototype | Primary navigation and legacy redirects exist | Validate with operational users |
| Four-tab patient workspace | Implemented for prototype | Overview, Prepare, Treatment, Record & Closeout | Keep tabs stable; deepen workbenches |
| Course gate and next action | Implemented from in-memory/domain state | Shared patient workspace derivation | Persist and test every gate source |
| Registration and DOCX prefill | Partial | Server-owned AVS/Intake extraction and review flow | Durable transactional persistence and auth |
| Workflow steps/tasks | Partial | In-memory command repository and mutation routes | Fully Prisma-native repository |
| Template registry | Implemented as metadata | 31 source records, 25 requirements, 25 field maps | Clinical/administrative validation and workspace rendering |
| Prepare structured forms | Not implemented end to end | Workspace shows steps/evidence, not complete field maps | Render, validate, save, version, review |
| Preauthorization | Deferred/missing | Skin preauth sources mapping-in-progress; billing mapping missing | First-class authorization lifecycle |
| Treatment planning/fractions | Strong prototype, clinically unvalidated | Fraction entry, corrections, approvals, image/OTV/physics gates | Durable storage and formal clinical validation |
| Document lifecycle metadata | Partial | Version/status/sign/eCW state machine exists | Real files, identity signatures, storage, integration |
| Document generation | Simulated | Text `contentPreview` plus `app-storage://` metadata | Deterministic DOCX/PDF/XLSX/PPTX generation |
| Image/file attachment | Simulated or metadata-only in several surfaces | Prototype action components do not retain files | Secure durable evidence upload |
| eCW and Drive | Not implemented | Manual confirmation/status placeholders only | Approved adapters with reconciliation |
| Billing and closeout | Partial visibility | Evidence/checklist/status surfaces exist | Full authorization/quantity/claim/audit lifecycle |
| Authentication/RBAC | Prototype only | Synthetic session/role claims | Real IdP, server-enforced permissions, MFA |
| OPS/PHI databases | Partial bridge | Schemas, generated clients, seed/hydration support | No production in-memory fallback; complete repositories |
| Audit | Redacted in-memory events | Audit helpers and views exist | Immutable durable audit and monitoring |
| Clinical validation | Not complete | Production-use blocking checklist exists | Signed protocols and golden clinical tests |

## Template Registry State

Current registry counts:

- 31 source records.
- 22 active sources.
- 2 mapping-in-progress Skin Cancer preauthorization sources.
- 6 draft/revision/duplicate sources.
- 1 missing billing-preauthorization source.
- 25 document requirements.
- 25 field-map records.

“Complete” field-map status currently means registry/pilot metadata coverage. It does not mean the patient workspace captures every source field or that merge/output automation exists.

## What Users Can Reliably Demonstrate

Using synthetic or de-identified data, users can:

- search and open patients;
- create/edit prototype patient-course records;
- review course phase, blockers, next action, and attention items;
- navigate preparation steps and update selected workflow status;
- review treatment readiness and record/correct/approve fraction entries;
- view document, billing, audit, and closeout state;
- inspect templates, workflow queues, schedule, dashboard, analytics, and settings surfaces.

## What Users Must Not Assume

The following are not durable production capabilities:

- a prototype modal completing an action;
- a local “generated” document status;
- a signature status created from a prototype role;
- an eCW upload confirmation without an external adapter result;
- an `app-storage://` reference;
- a field-map status marked complete;
- a phase completion label in an archived plan;
- a realistic fraction or isodose value without clinical validation.

## Highest-Risk Gaps

1. A preparation step can be completed without capturing the entire applicable template field map.
2. Preauthorization is not represented as a complete administrative lifecycle.
3. Workflow/document state remains in memory for important paths.
4. Document generation creates metadata/text previews, not authoritative clinical files.
5. Signing and eCW/Drive actions are not identity-bound external operations.
6. Audit events are not durable and immutable.
7. Calculation/reference behavior remains blocked from production clinical use.
8. The user guide and prior plans historically described simulated actions too optimistically; canonical docs now distinguish target, prototype, and production behavior.

## Status Update Rules

Update this file when a material capability changes. Every claim must identify evidence:

- code path or schema;
- focused automated test/guardrail;
- rendered or browser behavior when UI is involved;
- clinician/operations approval when clinical policy is involved;
- configuration/integration evidence when external systems are involved.

Do not add subjective completion percentages. Use `Not started`, `Partial`, `Implemented for prototype`, `Validated for pilot`, or `Production approved`, with evidence and remaining limitations.

Historical implementation notes are retained in [`../archive/implementation-history-2026.md`](../archive/implementation-history-2026.md) and are non-authoritative.
