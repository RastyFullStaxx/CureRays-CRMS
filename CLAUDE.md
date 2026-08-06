# CLAUDE.md — CureRays CRMS Operating File

This is the canonical operating entrypoint for agents working in this repository. It records the agreed direction; detailed rules live in the documents it points to. When this file and a pointed-to document disagree, fix the drift — do not silently pick one.

## Snapshot

CureRays CRMS is a patient-course-centered clinical workflow system for CureRays Radiation Medicine, replacing a manual worksheet/Drive/Word workflow (the real templates live in `docs/2026_TEMPLATES`). Next.js 16 App Router + React 19 + TypeScript + Tailwind, with two PostgreSQL databases (OPS tokenized operational data, PHI patient data) behind Prisma. Work happens in a four-tab patient workspace (Overview, Prepare, Treatment, Record & Closeout) plus six global pages. Structured application state — never a file, folder, or document status — is the workflow source of truth.

The repository serves **two surfaces**: a public patient-facing clinic site at `/` (`app/(site)/**`, responsive, static) and the authenticated CRMS behind `/login` (`app/(app)/**`, desktop-only, dynamic). Decision record: [docs/architecture/public-site.md](docs/architecture/public-site.md).

## Pilot North Star

The current target is a **staff pilot (~3 months, synthetic/de-identified data only, no real PHI)** proving the app beats sheets+Drive. The core loop is:

> **fill structured form → durable save → generate real document → download**

When prioritizing anything, ask: **does this ship the loop?** Gates and boundaries: [docs/requirements/pilot-readiness.md](docs/requirements/pilot-readiness.md).

## Pilot Status — the spine is built (P0–P4 done)

The full pilot core loop works end-to-end and is verified in-browser. `docs/status/current-state.md` holds the evidence; this is the orientation.

- **P0 — Durable persistence: DONE.** Hydrate-on-boot + write-through to Postgres behind the in-memory domain engine ([lib/server/write-through.ts](lib/server/write-through.ts)); single `CURERAYS_PERSISTENCE_MODE` flag; API routes hydrate-on-entry. Restart-survival verified.
- **Fractionation correction: DONE.** Auto-computed cumulative/skin/isodose/DOT values + prescription-mismatch review flag ([lib/services/fraction-worksheet-service.ts](lib/services/fraction-worksheet-service.ts)); contract in [workflow-and-automation.md](docs/architecture/workflow-and-automation.md) → "Fraction Calculation Contract", from the clinic script `docs/fractionation_log_app_script/appscript_of_hand_laterality_dupuytren`.
- **P1 — Prepare structured forms: DONE (all 3 carepaths).** [clinical-form-panel.tsx](components/patients/clinical-form-panel.tsx) renders field maps, validates, saves as `ClinicalFormResponse` (draft/submit/sign), resumes across restart. New **`grid` field type** (repeatable table) for the real anatomy grids: Dupuytren's 26-zone US mapping, Arthritis Kellgren-Lawrence per-joint (hand 16 / foot 23). All Sim/Rx/preauth maps enriched to the real `docs/2026_TEMPLATES`.
- **P2 — Document generation: DONE (Stage 2 tagged copies).** Generated DOCX are now the clinic's own forms: all 17 active templates cleaned + tagged into `templates/pilot/<sourceId>.docx` (built by `scripts/pilot-templates/build.py` from specs; golden gate `scripts/stage2-template-check.mjs`), filled by docxtemplater in [document-generation-service.ts](lib/services/document-generation-service.ts) with the Stage 1 builder as fallback; clinic filename convention; XLSX fraction logs stay on `exceljs`; route [app/api/documents/generate](app/api/documents/generate/route.ts) unchanged. Versioned `GeneratedDocumentOutput` disk persistence is still deferred.
- **P3 — Fraction closeout: DONE (export).** XLSX "Export Log" button on the Treatment tab.
- **P4 — Preauth-lite: DONE.** Form-backed `authorizationState` state machine; `preauthBlockers` in [workflow-command-service.ts](lib/server/workflow-command-service.ts) gates Planning → On Treatment. Block/clear verified.

### What a new session should pick up next

1. **Clinical-owner sign-off** on the mapped field content **and the tagged pilot templates** (faithful to the clinic's files, but the clinic is the authority) — no code, a review gate. The specs' `unplaced` lists in `scripts/pilot-templates/specs/` name the form fields with no honest slot in a template.
2. **P2 Stage 2 remainder** — persist `GeneratedDocumentOutput` versions to a gitignored `storage/`, downloadable from Record & Closeout.
3. **P5 — Settings template management** (planned in the roadmap): list/upload/version carepath templates per protocol, map to requirements/field maps, active/draft gating of generation resolution.
4. **Deferred production workstreams** (see roadmap) — real auth/IdP, immutable audit, eCW/Drive, clinical validation — only when moving past the no-PHI pilot.

**Cut list — do not build these even if older docs mention them:** eCW/Drive adapters · IdP/MFA · immutable-audit infrastructure · deep analytics · imaging beyond evidence attach · PDF/PPTX generation · **mobile layouts in the authenticated app** (the public site at `app/(site)/**` *is* responsive — do not delete its responsive CSS) · live/WYSIWYG document editing (documents are generated from structured forms, permanently).

## Reading Order

1. [AGENTS.md](AGENTS.md) — repository operating rules (commands, code style, UI rules, pitfalls).
2. [PRODUCT.md](PRODUCT.md) — stable product intent, design principles, anti-patterns.
3. [docs/status/current-state.md](docs/status/current-state.md) — the **only** prose source of implementation truth.
4. [docs/roadmap/implementation-roadmap.md](docs/roadmap/implementation-roadmap.md) — the active plan.
5. The domain document for your task, via [docs/README.md](docs/README.md).

Never infer implementation status from a requirements, architecture, or design document — they describe targets. `docs/archive/` is historical and non-authoritative.

## Key Recorded Decisions

Each decision lives in exactly one place:

- **Persistence mode** (hydrate-on-boot + write-through, single env flag, single instance): [docs/architecture/data-and-phi-boundaries.md](docs/architecture/data-and-phi-boundaries.md)
- **Next-action selection, course-site model, correction semantics, evidence attachment, preauth dependency**: [docs/architecture/workflow-and-automation.md](docs/architecture/workflow-and-automation.md)
- **Document generation profile** (docxtemplater/exceljs, tagged copies, output versions): [docs/architecture/document-lifecycle.md](docs/architecture/document-lifecycle.md)
- **Route inventory and retirements**: [docs/product/navigation-and-pages.md](docs/product/navigation-and-pages.md)
- **Public clinic site, route-group split, three-color brand palette, two typography systems, shadcn/ui dependency decision**: [docs/architecture/public-site.md](docs/architecture/public-site.md)
- **Pilot gates and non-goals**: [docs/requirements/pilot-readiness.md](docs/requirements/pilot-readiness.md)

## Discipline and Skills

- **Ponytail is the default implementation discipline**: understand the affected flow end to end first, then make the smallest safe change; reuse existing seams, helpers, and primitives; no unrequested abstractions, scaffolding, or dependencies. Never simplify away validation, security, accessibility, error handling that prevents data loss, or HIPAA controls.
- For UI work, start with `design-taste-frontend` for audit/direction; bring in `frontend-design`, `ui-ux-pro-max`, `impeccable`, or `design-motion-principles` only when their specialty is needed. Project rules and `docs/design/*.md` override generic skill guidance.
- Select the minimum skill set that materially helps; do not invoke every skill for every task.
- Basically don't work alone, use our .agents skills

## Guardrails

- PHI never appears in client bundles, query strings, logs, or browser storage. Use `lib/hipaa.ts` redaction for logging. Mock/synthetic data only in browser sessions.
- All styling through CSS tokens in `app/globals.css`; base UI only from `components/ui/`.
- No new dependencies without a recorded decision in the relevant architecture document. (Current recorded exceptions: `docxtemplater` + `pizzip` and `exceljs`, in the document lifecycle doc.)
- Business logic lives in `lib/services/` and server services, not page components.
- Prototype actions that fake durable work are removed or visibly disabled — never left interactive as "simulated".

## Verification Policy

- Default gate: `npm run verify` — typecheck + lint + typography/ui-copy/color guardrails.
- Keep verification proportional: one targeted check covering the edited behavior beats broad suites.
- `npm run build`, `npm run test:full`, full guardrails, and browser matrices only when explicitly requested or in declared release preparation.
- Documentation changes: run `npm run test:docs` (relative-link check across `docs/`, root MDs).

## Known Stale-Doc Traps

Verified corrections — trust these over older prose:

- Env vars are `OPS_DATABASE_URL` / `PHI_DATABASE_URL` (see `.env.example`), not `DATABASE_URL_OPS/PHI`.
- `npm run verify` runs more than typecheck+lint (see Verification Policy above) — it now also runs `test:contrast`.
- **`/` is the public clinic home, not a redirect to `/login`.** Authenticated routes live under `app/(app)/`; `app/page.tsx` no longer exists.
- **`cn()` lives in `lib/utils.ts`** (`twMerge(clsx(...))`), not `lib/workflow.ts`.
- **There is no `--color-accent`.** The accent and every `--landing-color-*` token were retired with the three-color brand system. `--color-success/warning/error/info` never existed despite older AGENTS.md tables.
- **`components/landing/` is now `components/login/`.** The `.landing-*` CSS block is gone; the login shell uses `.login-*`.
- Guardrail scripts hardcode `app/(app)/...` paths. Moving a route means updating `route-smoke`, `hipaa-guardrails`, `phase1`, `phase3`, `phase6`, and `product-simplification-guardrails`.
- `scripts/phase2-patient-registration.mjs`, `phase4-template-registry.mjs`, `phase5-document-lifecycle.mjs`, and `phase6-treatment-planning.mjs` **fail on `main` already** — pre-existing, unrelated to routing, and invisible because none is in `npm run verify`.
- Read hydration from Postgres **is** wired (`lib/server/database-hydration.ts`) **and** write-through persistence is live (P0 done) — the store is durable, not memory-only.
- The route table of record is [docs/product/navigation-and-pages.md](docs/product/navigation-and-pages.md), not AGENTS.md.
- New deps in use: `docx`, `exceljs` (document generation). Recorded exception in [document-lifecycle.md](docs/architecture/document-lifecycle.md).

## Operating Notes (hard-won)

- **Restart the dev server after a batch of edits before browser-checking.** Next dev/Turbopack hot-reload wedges after many edits (symptoms: "Page Not Found" on valid routes, or stale module state); a clean restart fixes it. Editing `lib/template-registry-data.json` or module-level singletons in particular needs a restart to take effect.
- **Hydration is per-route-module-instance + module-local `hydrated` flag.** In Next *dev*, route handlers and pages are separate module graphs, so a mutation on one route can be briefly invisible to another until it hydrates. Harmless in single-instance production. Every API route must `await hydrateClinicalStoreFromDatabase()` on entry (they do) so cold instances read Postgres, not mock data.
- **The seed is the source of truth for durable data.** `npm run prisma:seed` restores a clean synthetic dataset; re-seed after any DB-poking test. Patients CR-2401 (Skin), CR-2402/2408 (Dupuytren's), CR-2403/2405/2407 (Arthritis).
- **Field maps drive the forms.** Clinical forms are pure data in `lib/template-registry-data.json` rendered by the shared engine; enrich a protocol by editing its map (reuse the `grid` kind for repeated anatomy), no engine change.
