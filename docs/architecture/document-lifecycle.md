# Document and Evidence Lifecycle

- **Status:** Canonical target architecture
- **Current implementation:** Lifecycle metadata exists; real generation, storage, signature, and external transfer remain incomplete.

## Core Rule

Structured clinical/workflow data is authoritative. Documents are versioned outputs or evidence. A file must not independently set course phase, completion, authorization, billing, or closure state.

## Record Types

- Template source
- Template field map
- Structured clinical response
- Generated document instance
- Generated output version
- Uploaded evidence asset
- External-system transfer record
- Signature record
- Manual-edit exception
- Correction/void lineage

## Template Source Lifecycle

Template sources use explicit states:

- Active
- Mapping In Progress
- Draft
- Duplicate Review
- Retired
- Missing

An active source requires:

- stable ID and version;
- normalized path or approved external source;
- checksum;
- owner and approval metadata;
- effective date;
- diagnosis/protocol applicability;
- linked requirement and field map;
- supported output formats.

Draft, missing, deferred, or mapping-in-progress sources cannot masquerade as generation-ready.

## Generation Preconditions

Generation is allowed only when:

- the requirement applies to the course;
- the template source/version is active and approved;
- the field map is approved;
- all required structured fields and evidence are present;
- the actor is authorized;
- the generation format is supported;
- clinical-validation gates pass for calculation-bearing content.

## Generated Output Version

Each generated version records:

- document/course/patient opaque references;
- template source ID, version, and checksum;
- field-map version;
- structured source-data snapshot/version;
- generation code/reference version;
- output format;
- output checksum;
- storage provider/key;
- generator actor and timestamp;
- review status;
- signature/lock state;
- correction/void lineage.

A signed output is immutable. Regeneration or correction creates a new linked version.

## Review and Signature

Lifecycle:

`Draft -> Generated -> Ready for Review -> Needs Correction | Ready for Signature -> Signed and Locked`

Review captures reviewer, decision, reason, and timestamp. Signature captures authenticated signer, intent, signed content hash, time, and signature provider evidence. A client-selected role or status field is not an electronic signature.

## Manual Edits

Manual edits are controlled exceptions:

- record editor, reason, time, and source version;
- mark the output review-required;
- invalidate prior signature/lock as policy requires;
- preserve the previous file;
- require regeneration or approved exception review before signature.

## Evidence Upload

Evidence uploads require:

- allowed file type and size validation;
- malware/content screening as appropriate;
- patient/course/step/fraction linkage;
- category and description;
- uploader and timestamp;
- checksum;
- secure storage;
- access controls and retention;
- correction/void handling.

Prototype file inputs that discard content are not evidence uploads.

## Storage Layout

Physical folders are an implementation detail. Logical ownership is patient -> course -> record/version. Do not put PHI in object keys when an opaque reference works.

Suggested logical categories:

- Chart Prep
- Simulation
- Planning
- On Treatment
- Post-Tx
- Audit
- Images/Evidence

The app database stores lifecycle metadata. Approved storage holds the bytes.

## eCW and External Transfer

External transfer state includes:

- queued;
- in progress;
- confirmed;
- failed/retryable;
- failed/manual intervention;
- reconciled;
- superseded/voided.

Confirmation requires adapter evidence: external record/reference, adapter result, timestamp, source version, and actor/system identity. A manual checkbox can record a controlled fallback only when policy permits and must include the external reference and reason.

## Drive/Template Sync

Drive is a template/storage integration boundary, not workflow state. Sync must:

- compare stable IDs/checksums;
- detect changed, missing, duplicate, or unexpected files;
- avoid silently replacing approved template versions;
- create review work for changes;
- preserve source and approval history.

## Failure Recovery

- Generation failure leaves source data intact.
- Upload retry is idempotent.
- Failed external transfer remains visible with a recovery action.
- Signed/locked versions are never overwritten.
- Storage/link failure cannot produce a false Uploaded/Complete state.
- Reconciliation detects app/external disagreement.

## Pilot Generation Profile

This section defines how generation works for the staff pilot ([pilot readiness](../requirements/pilot-readiness.md)). The target architecture above remains the production goal; the profile below is the approved pilot subset.

This profile has two stages. **Stage 1 (implemented)** generates clean, real, downloadable documents from the structured form/fraction data. **Stage 2 (tagged-copy generation implemented; output persistence deferred)** upgrades DOCX output to copies of the clinic's exact forms filled from the structured data.

### Formats and libraries (Stage 1, implemented)

- **DOCX:** the `docx` builder library constructs a structured clinical document directly from the requirement's `TemplateFieldMap` + saved `ClinicalFormResponse` — a header (patient/MRN/course/status), one table per section (label → value), and grid fields rendered as tables (e.g. the 26-zone Dupuytren's mapping). Real, readable, downloadable — but not a pixel-clone of the clinic's Word layout.
- **XLSX:** `exceljs` renders fraction-log workbooks from fraction entries, mirroring the source workbook's columns (including the corrected cumulative-dose / dose-to-DOT columns).
- **PDF:** not generated in the pilot. Staff print from Word/Excel.
- **PPTX:** never generated. Isodose/planning references are re-scoped to **static reference attachments** on the applicable step.

`docx`, `exceljs`, `docxtemplater`, and `pizzip` are the recorded exceptions to the no-new-dependencies guardrail, justified here (`docxtemplater`/`pizzip` landed with Stage 2 tagged-copy generation).

### Delivery (Stage 1)

- Generation is a pure server service ([`lib/services/document-generation-service.ts`](../../lib/services/document-generation-service.ts), `server-only`): `generateClinicalFormDocx(courseId, requirementId)` and `generateFractionLogXlsx(courseId)` each return a buffer + filename + content type.
- The download route [`app/api/documents/generate`](../../app/api/documents/generate/route.ts) hydrates the store, generates on demand, and streams the file with `Content-Disposition: attachment`. No bytes are persisted to disk in Stage 1 — documents regenerate deterministically from the durable structured source.
- The "Generate Document (DOCX)" control lives in the Prepare clinical-form panel; the fraction-log XLSX export lands with P3.

### Stage 2 — pixel-faithful tagged copies (generation implemented)

- `docxtemplater` + `pizzip` fill tagged copies of the clinic's own templates so output matches their familiar form exactly. Implemented in [`document-generation-service.ts`](../../lib/services/document-generation-service.ts): when `templates/pilot/<templateSourceId>.docx` exists, `generateClinicalFormDocx` fills it; otherwise it falls back to the Stage 1 structured builder (currently only fraction-log DOCX falls back).
- Tagged copies live in `templates/pilot/` (17 files, one per active DOCX source incl. both mapping-in-progress preauth sources) with `{placeholder}` tags aligned to `TemplateFieldMap` field IDs — grid cells use the flat `{gridId__rowId__colId}` keys the form stack already persists, so the 26-zone US mapping and per-joint arthritis tables fill without loop syntax. A small set of context tags (`patientName`, `dob`, `ageSex`, `mrn`, `diagnosis`, `laterality`, `site`, `generatedDate`, `responseStatus`, `signedBy`, `orderedDate`) fills the identity headers. The `docs/2026_TEMPLATES` originals stay pristine.
- The copies are built reproducibly by `scripts/pilot-templates/build.py` from per-template specs in `scripts/pilot-templates/specs/` (title/tab divider pages removed, sample data cleared, tags inserted; every operation count-asserted). Fields a template has no honest slot for are recorded in the spec's `unplaced` list. `scripts/stage2-template-check.mjs` is the golden gate: every pilot copy must render under docxtemplater with field-map-derived sample data and contain no tag unbacked by the field map or context keys.
- Generated filenames follow the clinic's own naming convention, derived from the source filename pattern (e.g. `01_US_Mapping.DUPUYTRENS.HAND.Left.DDMMYY.LastName.FirstName.docx`).
- **Still deferred:** persisting each generation as a `GeneratedDocumentOutput` version (format, incremented version, `APP_STORAGE` opaque storage key, bytes under a gitignored `storage/` directory, `contentPreview`), downloadable by output ID through a role-checked route, with `Draft → Ready → Locked on sign` lifecycle. Stage 2 generation currently streams on demand like Stage 1 and persists no bytes.

## Current Prototype Boundary

Current generated-document behavior may create a text preview and `app-storage://` metadata while recording local lifecycle states. These are adapter seams for development, not real files or external proof. User-facing copy and status documents must continue to identify that limitation until replaced and verified.
