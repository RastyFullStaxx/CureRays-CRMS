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

**Status:** Done and verified across all three carepaths. Maps enriched to the real clinic templates: Dupuytren's US mapping = 26-zone grid (new `grid` field type), Sim (23 fields), Rx (29 fields); Arthritis HAND/FOOT mapping = Kellgren-Lawrence per-joint grids (16 / 23 joints) reusing the `grid` type, plus Arthritis+Skin Sim/Rx enriched to their templates. Verified render + save in-browser for a patient in each protocol. **Remaining:** clinical-owner sign-off on the mapped fields before production (the field content is a faithful read of the templates, but the clinic is the domain authority).

### P2. Real document generation and download

- **Outcome:** structured data produces the clinic's own documents (pilot gate G3).

Scope: the two-stage [pilot generation profile](../architecture/document-lifecycle.md). Isodose PPTX re-scoped to static reference attachments. No PDF.

**Status:** Stage 1 done and verified — `docx`/`exceljs` generate real, downloadable DOCX and XLSX fraction logs via `app/api/documents/generate`. **Stage 2 tagged-copy generation done and verified** — all 17 active DOCX templates cleaned (classification title pages removed, sample data cleared) and tagged into `templates/pilot/` by the re-runnable `scripts/pilot-templates/build.py` + specs; `generateClinicalFormDocx` fills them with docxtemplater (Stage 1 builder stays as the fallback); filenames follow the clinic convention; golden check `scripts/stage2-template-check.mjs` renders every copy. Verified in-browser for Dupuytren's CR-2402 (saved form values appear in the clinic's own 26-zone layout; Word opens everything clean). **Remaining:** versioned `GeneratedDocumentOutput` disk persistence + download from Record & Closeout, and clinical-owner sign-off of the tagged copies.

Acceptance: Stage 1 — downloading a valid DOCX and XLSX confirmed. Stage 2 — golden output check per enabled template (`node scripts/stage2-template-check.mjs`, green).

### P3. Fraction closeout

- **Outcome:** the treatment loop closes cleanly (pilot gate G4).

Scope: XLSX fraction-log export, approval queue polish on the Treatment tab, treatment summary form. Fraction durability itself lands in P0; correction semantics and the auto-computed values follow the [fraction calculation contract](../architecture/workflow-and-automation.md). The calculation correction (cumulative doses, isodose/dose to DOT, prescription-mismatch review flags) is user-mandated and may land ahead of the rest of P3.

Acceptance: record → correct → approve → export cycle on a synthetic course.

### P4. Preauthorization-lite

- **Outcome:** authorization is structured state, not a document checkbox (pilot gate G5).

Scope:

- Minimal preauthorization record with the state machine from [clinical workflow](../requirements/clinical-workflow.md) section 4; no payer integration.
- Gates only the Planning → On Treatment advance for protocols that require it, per the [preauthorization dependency](../architecture/workflow-and-automation.md).
- Data prerequisite: complete the two deferred Skin Cancer carepath/preauth template mappings.

Acceptance: state transitions demonstrated; gate blocks and unblocks treatment readiness correctly.

**Status:** Done and verified. Preauth-lite reuses the P1 clinical-form stack — the Skin Cancer preauth field maps carry a canonical `authorizationState` select (the full state machine), persisted durably like any form. `preauthBlockers` in `lib/server/workflow-command-service.ts` blocks `PLANNING → ON_TREATMENT` for a course whose workflow requires carepath preauth until any applicable preauth form reaches an approved state (`Approved` / `Partially approved` / `Not required`). Verified: unapproved → advance blocked with "Preauthorization is not approved"; approved → gate clears. No dedicated Prisma entity — form-backed for the pilot; a first-class `AuthorizationCase` with payer evidence/appeals remains the deferred production workstream.

### P5. Template management in Settings (planned, not started)

- **Outcome:** the clinic can maintain its carepath-program templates in-app instead of via repo edits.

Scope (extends the existing `app/settings/templates/page.tsx` registry surface):

- List the template files used per protocol/requirement with tagged-copy presence, checksum, and version (source of truth: the template-source lifecycle in [document lifecycle](../architecture/document-lifecycle.md)).
- Upload a new template version: bytes to gitignored storage, checksum + version bump, never silently replacing an approved version — a changed template creates review work.
- Map an uploaded template to its requirement/field map; surface unmapped fields (the specs' `unplaced` lists) for clinical review.
- Active/draft toggle that gates generation resolution, replacing the convention-path lookup (`templates/pilot/<sourceId>.docx`) with registry-driven resolution.

Prerequisites: `GeneratedDocumentOutput`/storage groundwork (P2 Stage 2 remainder) and moving template-source records from static JSON to durable rows. Depends on clinical-owner sign-off of the current tagged copies.

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
