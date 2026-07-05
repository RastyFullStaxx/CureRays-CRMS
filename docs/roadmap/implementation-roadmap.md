# Implementation Roadmap

- **Goal:** Ship the staff pilot defined in [pilot readiness](../requirements/pilot-readiness.md) without changing the stable four-tab patient-first product model, then close the remaining production gaps.
- **Status source:** [`../status/current-state.md`](../status/current-state.md)
- **Requirements:** [pilot readiness](../requirements/pilot-readiness.md), [clinical workflow](../requirements/clinical-workflow.md), and [production readiness](../requirements/production-readiness.md)

## Delivery Rule

Work is complete only when the behavior, persistence, security boundary, user recovery, and proportionate verification are complete. A screen, status field, interface, placeholder repository, or mocked adapter is not completion.

During the pilot phase, "proportionate verification" follows the AGENTS.md development-phase policy: a targeted guardrail script or manual browser check plus `npm run verify`, not the production test pyramid. The production evidence lists live with the deferred workstreams below.

## Pilot North Star

One synthetic patient per protocol goes intake → closeout entirely in-app, with durable data and real generated documents. The core loop is **fill structured form → durable save → generate real document → download**. When prioritizing, ask: does this ship the loop?

## Pilot Milestones (Active Plan)

### P0. Durable persistence (write-through)

- **Outcome:** every pilot mutation survives an application restart (pilot gate G1).

Scope:

- Keep the in-memory clinical store as the domain engine; add write-through to PostgreSQL after each successful mutation using the inverse of the existing hydration mappers, per the [pilot persistence mode](../architecture/data-and-phi-boundaries.md).
- Cover the mutation paths for workflow steps/tasks, fraction entries, patient registration/update, and document lifecycle actions.
- Consolidate the two persistence environment flags into one.
- Do **not** reimplement business rules inside Prisma repositories — that refactor stays deferred (see below).

Acceptance: restart-survival check per entity type; `npm run verify` green.

### P1. Prepare structured forms (Dupuytren's first)

- **Outcome:** staff complete real intake/mapping/order/prescription work inside Prepare (pilot gate G2).

Scope:

- Resolve each preparation step to its applicable document requirement and field map per the [course site model](../architecture/workflow-and-automation.md).
- Render field-map sections with shared form primitives; validate required fields, units, and options; save and resume drafts; support the existing status vocabulary through draft/submit/review/sign.
- Start with Dupuytren's — the smallest complete workflow that exercises every form archetype, including repeated per-region anatomy observations — then Arthritis (per-joint observations), then Skin Cancer.
- Display missing/deferred/draft mappings as blockers, not editable work.

Acceptance: each Dupuytren's form completed end to end in a browser; drafts survive restart (depends on P0).

### P2. Real document generation and download

- **Outcome:** structured data produces the clinic's own documents (pilot gate G3).

Scope: the [pilot generation profile](../architecture/document-lifecycle.md) — tagged template copies in `templates/pilot/`, docxtemplater DOCX generation, exceljs fraction-log XLSX, versioned `GeneratedDocumentOutput` records, opaque-key local storage, role-checked download. Isodose PPTX re-scoped to static reference attachments. No PDF.

Acceptance: golden output check per enabled template; download works from Record & Closeout.

### P3. Fraction closeout

- **Outcome:** the treatment loop closes cleanly (pilot gate G4).

Scope: XLSX fraction-log export, approval queue polish on the Treatment tab, treatment summary form. Fraction durability itself lands in P0; correction semantics follow [workflow and automation](../architecture/workflow-and-automation.md).

Acceptance: record → correct → approve → export cycle on a synthetic course.

### P4. Preauthorization-lite

- **Outcome:** authorization is structured state, not a document checkbox (pilot gate G5).

Scope:

- Minimal preauthorization record with the state machine from [clinical workflow](../requirements/clinical-workflow.md) section 4; no payer integration.
- Gates only the Planning → On Treatment advance for protocols that require it, per the [preauthorization dependency](../architecture/workflow-and-automation.md).
- Data prerequisite: complete the two deferred Skin Cancer carepath/preauth template mappings.

Acceptance: state transitions demonstrated; gate blocks and unblocks treatment readiness correctly.

## Deferred Production Workstreams

These carry the full production scope and acceptance evidence previously listed as Workstreams 1–8. They are deferred, not deleted: any real PHI/ePHI use requires them per [production readiness](../requirements/production-readiness.md).

| Deferred workstream | Former | Relationship to pilot milestones |
|---|---|---|
| Structured preparation completion (all protocols, clinical owner approval of field maps and completion gates) | WS1 | P1 delivers the pilot subset |
| Preauthorization and billing administration (payer evidence, denial/appeal, quantity reconciliation, versioned coding language, missing billing-preauth source/SOP) | WS2 | P4 delivers the state machine; the administrative lifecycle remains |
| Durable data and repository completion (Prisma-native repositories, transactions, optimistic concurrency, no memory engine) | WS3 | P0 delivers write-through; the repository refactor remains |
| Authentication, RBAC, and immutable audit (IdP, MFA, server-enforced permissions, append-only audit storage) | WS4 | Fully deferred; pilot uses named local users (gate G6) |
| Real document and evidence lifecycle (all formats, render QA, identity-bound signatures, encrypted storage, evidence upload hardening) | WS5 | P2 delivers the pilot generation profile; the rest remains |
| eCW, Drive, and external reconciliation (approved adapters, idempotent sync, reconciliation reports) | WS6 | Fully deferred |
| Clinical calculation and treatment validation (approved references, golden clinical cases, physicist/Rad Onc sign-off) | WS7 | Fully deferred; prototype calculations stay production-blocked |
| Closeout, operations, and release (interruption policy, retention/legal hold, monitoring, migration, go-live gates) | WS8 | Fully deferred; pilot exit criteria feed its scoping |

The detailed production scope and acceptance evidence for each deferred workstream are preserved in [`../archive/production-workstreams-2026.md`](../archive/production-workstreams-2026.md).

## Dependency Order

1. P0 durable persistence.
2. P1 structured preparation (Dupuytren's → Arthritis → Skin Cancer).
3. P2 document generation (depends on P1 saved data).
4. P3 fraction closeout.
5. P4 preauthorization-lite (mapping prerequisite may proceed in parallel).
6. Staff pilot; exit assessment per [pilot readiness](../requirements/pilot-readiness.md).
7. Deferred production workstreams, re-ordered by pilot findings.

Milestones may overlap, but no milestone may bypass an unmet persistence or data dependency, and nothing in the pilot path relaxes a production gate.

## Explicitly Out of Scope Until Approved

- Real patient PHI/ePHI.
- Production clinical calculation or treatment guidance.
- Automated payer or claim submission.
- Live eCW/Drive writes.
- PDF/PPTX generation and live/WYSIWYG document editing.
- Treating archived plans or UI mock behavior as evidence of completion.
