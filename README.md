# CureRays Clinical Workflow System

CureRays CRMS is a patient-course-centered clinical operations prototype for CureRays Radiation Medicine. It is intended to replace fragmented worksheet, Word, PowerPoint, Google Drive, routing, and status-tracking workflows with one structured and auditable patient course.

## Safety Status

This repository is not approved for real patient PHI/ePHI or clinical production use.

Use only synthetic, mock, or properly de-identified data. Major production blockers include real authentication/RBAC, fully durable OPS/PHI repositories, immutable audit infrastructure, approved clinical validation, real document generation/storage/signature, and eCW/Drive integrations.

The authoritative implementation assessment is [docs/status/current-state.md](docs/status/current-state.md). Do not infer readiness from route count, realistic mock screens, archived completion claims, or phase labels.

## Product Model

One patient can have multiple treatment courses. Each course owns its workflow state, tasks, required forms/documents, prescription and planning data, imaging evidence, fractions, billing evidence, audit checks, and closure history.

```text
Patient
  -> Course
    -> Workflow steps and tasks
    -> Structured clinical records
    -> Generated documents and signatures
    -> Treatment fractions and approvals
    -> Billing and audit evidence
    -> Follow-up and closure
```

The database is the intended source of truth. Files are controlled inputs, generated outputs, or evidence—not the workflow state itself.

## Primary Product Surfaces

- **Patients:** registry and entry point to patient-course work.
- **Today:** cross-patient action queue.
- **Schedule:** appointments and treatment timing.
- **Dashboard:** operational oversight.
- **Analytics:** aggregate operational reporting.
- **Settings:** workflow, template, access, and system configuration.
- **Patient Workspace:** four tabs—Overview, Prepare, Treatment, and Record & Closeout.

Legacy module routes may remain as redirects or compatibility surfaces, but they must not maintain competing patient-course state.

## Documentation

Start with [docs/README.md](docs/README.md). The key sources are:

- [Product intent](PRODUCT.md)
- [Current implementation state](docs/status/current-state.md)
- [Clinical workflow requirements](docs/requirements/clinical-workflow.md)
- [Production readiness requirements](docs/requirements/production-readiness.md)
- [Implementation roadmap](docs/roadmap/implementation-roadmap.md)
- [Patient workspace contract](docs/product/patient-workspace.md)
- [Template registry](docs/templates/registry.md)

Repository-specific development rules are in [AGENTS.md](AGENTS.md).

## Technology

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 3 with CSS-token styling
- Prisma schemas for separate OPS and PHI databases
- Mock/in-memory prototype data with partial local Prisma hydration

## Development

Node.js 20.19+ is required. The repository version files currently select Node 22.14.0.

```bash
npm install
npm run dev
npm run verify
```

During active development, use the smallest relevant check. The normal gate is:

```bash
npm run verify
```

Production builds, the full guardrail suite, broad route sweeps, and browser matrices are release-preparation checks and should not be run by default.

Other commands:

```bash
npm run typecheck
npm run lint
npm run test:hipaa
npm run test:guardrails
npm run test:full
npm run build
```

## Local Data Modes

No database is required for the default mock-data prototype.

The repository also contains separate OPS and PHI Prisma schemas and local seed/hydration support. This bridge does not mean every workflow mutation is Prisma-native. Production must not permit an in-memory fallback.

Environment variables are documented in `.env.example`.

## Development Principles

- Preserve one authoritative patient-course state.
- Make blockers, ownership, due state, evidence, and next action explicit.
- Capture structured data before generating documents.
- Keep PHI server-side and minimize operational DTOs.
- Represent missing, draft, deferred, and unmapped requirements honestly.
- Require clinical validation before enabling calculation or treatment automation.
- Never present a simulated action as durable external work.
