# Durable Document Pilot Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task by task.

**Goal:** Turn clinical form and fraction-log generation into durable, authorized DOCX/XLSX outputs with complete lifecycle actions, deterministic seed/reset behavior, and a practical pilot feedback runbook.

**Architecture:** Reuse the installed DOCX/XLSX generator and existing document lifecycle/store. Add one local filesystem adapter with strict containment, one orchestration service that resolves pilot-approved templates and persists metadata after bytes are written, and one authorized download route. Extend existing PHI persistence fields rather than building a parallel document database.

**Tech Stack:** Next.js route handlers, Node filesystem/path APIs, existing `docx`/`docxtemplater`/`exceljs` packages, Prisma PHI schema, existing clinical store and hydration/write-through layers.

## Global Constraints

- Generated PHI bytes never enter git, logs, client state, URLs, or preview strings.
- Default storage is an ignored local directory configurable by `GENERATED_DOCUMENT_STORAGE_DIR`.
- Every read/write/delete resolves and verifies strict containment under the configured storage root.
- Output creation is immutable and create-only; version numbers do not overwrite prior bytes.
- If metadata persistence fails after a write, delete only the newly written contained file.
- Server resolves active pilot-approved templates and validates applicability, saved response, required fields, and format.
- Download clients receive an output ID/URL, never a storage path.
- `Sign & Lock` is explicitly pilot acknowledgement, not production electronic signature.
- Do not add document libraries or a background job system.

---

## Task 1: Add contained local output storage and generation orchestration

**Files:**

- Create: `lib/server/generated-document-storage.ts`
- Create: `lib/server/generated-document-output-service.ts`
- Modify: `lib/services/document-generation-service.ts`
- Modify: `app/api/documents/generate/route.ts`
- Modify: `scripts/phase5-document-lifecycle.mjs`
- Modify: `.gitignore`
- Modify: `.env.example`
- Modify: `package.json`

**HTTP contract:**

```ts
type GenerateDocumentRequest =
  | { kind: 'form'; courseId: string; requirementId: string }
  | { kind: 'fraction-log'; courseId: string };

interface GenerateDocumentResponse {
  output: {
    id: string;
    documentId: string;
    format: 'DOCX' | 'XLSX';
    version: number;
    status: GeneratedDocumentOutputStatus;
  };
  downloadUrl: string;
}
```

- [ ] Extend `phase5-document-lifecycle.mjs` first with checks for traversal rejection, create-only writes, form/fraction request validation, missing/inapplicable/unapproved template rejection, missing required fields, and cleanup after metadata failure.
- [ ] Run `npm run test:phase5` and record the expected failure.
- [ ] Implement the storage root resolver plus contained create/read/remove operations with `node:path` and `node:fs/promises`.
- [ ] Reuse the current DOCX/XLSX byte generators and template registry; move server-side preflight validation into the orchestration path.
- [ ] Write bytes first to a unique output/version key, persist lifecycle metadata second, and remove only that new key on metadata failure.
- [ ] Add the authenticated generation route and generic PHI-safe errors.
- [ ] Ignore the default storage directory and document the environment key without a real path/secret.
- [ ] Run `npm run test:phase5` and `npm run typecheck`.
- [ ] Commit with message `feat: persist generated clinical document bytes`.

## Task 2: Persist lifecycle metadata and add authorized downloads

**Files:**

- Modify: `prisma/phi-schema.prisma`
- Modify: `prisma/phi-schema.sql`
- Modify: `lib/types.ts`
- Modify: `lib/clinical-store.ts`
- Modify: `lib/server/database-hydration.ts`
- Modify: `lib/server/write-through.ts`
- Create: `app/api/generated-document-outputs/[outputId]/download/route.ts`
- Modify: `scripts/phase5-document-lifecycle.mjs`

**Persisted fields:**

- `storageProvider`, `storageKey`, `renderedByUserId`
- `exportedAt`, `exportedByUserId`
- `lockedAt`, `lockedByUserId`
- `voidedAt`, `voidedByUserId`, `voidReason`
- existing manual-edit acknowledgement fields already represented in TypeScript

- [ ] Extend the failing document check with hydration/write-through field assertions plus unauthorized/missing/voided/path-tampered download cases.
- [ ] Run it and record the expected failure.
- [ ] Add nullable Prisma columns and matching bootstrap SQL columns so existing rows need no data backfill; regenerate the PHI client.
- [ ] Extend TypeScript, hydration, and write-through mappings one-for-one.
- [ ] Refactor lifecycle rendering to accept real immutable output metadata; remove `app-storage://` and generated PHI text preview behavior.
- [ ] Add a session/PHI-authorized download route that resolves an output by ID, reads only its contained storage key, records export metadata/audit, and streams a safe filename/content type.
- [ ] Run `npm run test:phase5` and `npm run typecheck`.
- [ ] Commit with message `feat: authorize generated document downloads`.

## Task 3: Migrate form and fraction generation callers

**Files:**

- Modify: `components/patients/clinical-form-panel.tsx`
- Modify: `components/fraction-worksheet-panel.tsx`
- Modify or retire: the legacy generated-document GET route returned by `rg -n "generated-document|downloadUrl|Export DOCX|Export XLSX" app components`
- Modify: `scripts/phase5-document-lifecycle.mjs`

**Client contract:**

- Save/validation remains explicit.
- Generate submits JSON to `POST /api/documents/generate`.
- On success, navigate to the returned same-origin `downloadUrl`.
- On failure, display the server’s generic actionable message and keep entered data intact.

- [ ] Add failing source assertions that both callers use the POST contract and no client constructs a template/raw-download GET URL or sends actor headers.
- [ ] Run the document check and record the expected failure.
- [ ] Migrate both clients with the existing button/pending/error patterns.
- [ ] Retire the raw generator route if no canonical caller remains.
- [ ] Run `npm run test:phase5` and `npm run typecheck`.
- [ ] Use the browser with mock data to generate and download one DOCX and one XLSX and verify their signatures (`PK`) and non-zero size.
- [ ] Commit with message `refactor: use durable document generation clients`.

## Task 4: Complete Records & Closeout lifecycle actions

**Files:**

- Modify: `components/patients/patient-workspace.tsx`
- Modify: existing generated-document lifecycle route(s) under `app/api/generated-documents/`
- Modify: `lib/server/document-lifecycle-service.ts`
- Modify: `lib/clinical-store.ts`
- Modify: `scripts/phase5-document-lifecycle.mjs`

**Action contract:**

- `Generate` creates the next immutable output version.
- `Review` opens/selects the output and records review state without claiming signature.
- `Sign & Lock` records named pilot acknowledgement and blocks further mutation of that version.
- `Download` uses the authorized output download URL.
- `Void` requires a reason, records named actor/time, preserves bytes/metadata, and prevents normal download.
- Each table row carries both `documentId` and `outputId`.

- [ ] Add failing HTTP/source checks for the five exact actions, named actors, lock enforcement, void reason, and output/document IDs.
- [ ] Run the document check and record the expected failure.
- [ ] Extend existing lifecycle actions/routes; do not add a second lifecycle state machine.
- [ ] Add the five row actions using existing menu/modal/button/toast patterns; disable unavailable transitions rather than faking success.
- [ ] Label `Sign & Lock` as pilot acknowledgement in supporting copy.
- [ ] Run `npm run test:phase5` and `npm run typecheck`.
- [ ] Exercise generate → review → sign/lock → download and generate → void in the browser.
- [ ] Commit with message `feat: complete records closeout document actions`.

## Task 5: Make seed/reset deterministic and add the pilot runbook

**Files:**

- Modify: `scripts/seed-postgres.mjs`
- Modify or delete: `scripts/seed-postgres-local.sql`
- Modify/create: the reset script identified by `rg -n "reset|seed-postgres-local|template-registry-data" scripts package.json`
- Modify: `package.json`
- Create: `docs/guides/pilot-feedback.md`
- Create: `docs/templates/pilot-feedback-entry.md`
- Modify: `docs/README.md`
- Modify: `scripts/phase5-document-lifecycle.mjs`

**Contracts:**

- Template seed payload is derived from `lib/template-registry-data.json`; no duplicate six-template list.
- No embedded database password or divergent SQL fallback.
- Reset clears both pilot database state and generated bytes, using the same contained storage helper/algorithm.
- Feedback entries contain no patient name, MRN, DOB, diagnosis narrative, screenshots, exported records, credentials, or tokens.

- [ ] Add failing source checks for registry-derived seeding, password removal, contained byte reset, and presence of PHI-safe feedback fields.
- [ ] Run the document check and record the expected failure.
- [ ] Refactor seed/reset to use the canonical registry and remove the divergent SQL/password path.
- [ ] Add a reset command that fails closed when the storage root is unsafe and reports only counts/IDs.
- [ ] Write the coordinator runbook and reusable entry template with fields for route, role, course token, action, expected/observed result, severity, timestamp, browser, and PHI confirmation.
- [ ] Link the runbook from `docs/README.md`.
- [ ] Run `npm run test:phase5` and `npm run verify`.
- [ ] Commit with message `docs: make pilot reset and feedback repeatable`.
