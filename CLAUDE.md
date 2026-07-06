# CLAUDE.md — CureRays CRMS Operating File

This is the canonical operating entrypoint for agents working in this repository. It records the agreed direction; detailed rules live in the documents it points to. When this file and a pointed-to document disagree, fix the drift — do not silently pick one.

## Snapshot

CureRays CRMS is a patient-course-centered clinical workflow system for CureRays Radiation Medicine, replacing a manual worksheet/Drive/Word workflow (the real templates live in `docs/2026_TEMPLATES`). Next.js 16 App Router + React 19 + TypeScript + Tailwind, with two PostgreSQL databases (OPS tokenized operational data, PHI patient data) behind Prisma. Work happens in a four-tab patient workspace (Overview, Prepare, Treatment, Record & Closeout) plus six global pages. Structured application state — never a file, folder, or document status — is the workflow source of truth.

## Pilot North Star

The current target is a **staff pilot (~3 months, synthetic/de-identified data only, no real PHI)** proving the app beats sheets+Drive. The core loop is:

> **fill structured form → durable save → generate real document → download**

When prioritizing anything, ask: **does this ship the loop?** Gates and boundaries: [docs/requirements/pilot-readiness.md](docs/requirements/pilot-readiness.md).

## Priority Order

Active milestones (detail in [docs/roadmap/implementation-roadmap.md](docs/roadmap/implementation-roadmap.md)):

1. **P0** — Durable persistence: write-through to Postgres behind the existing in-memory domain engine.
2. **P1** — Prepare structured forms: render `TemplateFieldMap` sections; Dupuytren's first, then Arthritis, then Skin Cancer.
3. **P2** — Real DOCX/XLSX generation from tagged template copies; download from Record & Closeout.
4. **P3** — Fraction closeout: XLSX export, approval polish, treatment summary.
5. **P4** — Preauthorization-lite state machine gating Planning → On Treatment.

**Fractionation calculation correction (user-mandated, active now):** the fraction worksheet must auto-compute — never hand-enter — Cumulative Dose (cGy), Cumulative Skin-Surface Dose (cGy), Isodose to DOT (%), Dose to DOT (cGy), and Cumulative Dose to DOT (cGy), and must flag an entry for review when its Energy, SSD, Time, Dose/Fx, or Skin-Surface Dose does not match the prescription set for its phase. The authoritative calculation reference is the clinic's corrected log script at `docs/fractionation_log_app_script/appscript_of_hand_laterality_dupuytren` (sample sheet: the clinic's fixed Dupuytren's Google Sheet). The precise contract is recorded in [workflow-and-automation.md](docs/architecture/workflow-and-automation.md) → "Fraction Calculation Contract".

**Cut list — do not build these even if older docs mention them:** eCW/Drive adapters · IdP/MFA · immutable-audit infrastructure · deep analytics · imaging beyond evidence attach · PDF/PPTX generation · mobile layouts · live/WYSIWYG document editing (documents are generated from structured forms, permanently).

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
- **Pilot gates and non-goals**: [docs/requirements/pilot-readiness.md](docs/requirements/pilot-readiness.md)

## Discipline and Skills

- **Ponytail is the default implementation discipline**: understand the affected flow end to end first, then make the smallest safe change; reuse existing seams, helpers, and primitives; no unrequested abstractions, scaffolding, or dependencies. Never simplify away validation, security, accessibility, error handling that prevents data loss, or HIPAA controls.
- For UI work, start with `design-taste-frontend` for audit/direction; bring in `frontend-design`, `ui-ux-pro-max`, `impeccable`, or `design-motion-principles` only when their specialty is needed. Project rules and `docs/design/*.md` override generic skill guidance.
- Select the minimum skill set that materially helps; do not invoke every skill for every task.

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
- `npm run verify` runs more than typecheck+lint (see Verification Policy above).
- Read hydration from Postgres **is** wired (`lib/server/database-hydration.ts`, invoked from `app/layout.tsx` and major pages); it is **writes** that are memory-only until P0 lands.
- The route table of record is [docs/product/navigation-and-pages.md](docs/product/navigation-and-pages.md), not AGENTS.md.
