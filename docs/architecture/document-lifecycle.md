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

## Current Prototype Boundary

Current generated-document behavior may create a text preview and `app-storage://` metadata while recording local lifecycle states. These are adapter seams for development, not real files or external proof. User-facing copy and status documents must continue to identify that limitation until replaced and verified.
