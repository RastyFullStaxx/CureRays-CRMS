# CureRays CRMS Documentation

This directory contains the durable product, clinical workflow, architecture, design, and delivery guidance for CureRays CRMS.

## Reading Order

Future development sessions should read only the documents relevant to the task. Start with:

1. [`../AGENTS.md`](../AGENTS.md) for repository operating rules.
2. [`../PRODUCT.md`](../PRODUCT.md) for stable product intent and boundaries.
3. [`status/current-state.md`](status/current-state.md) for what is actually implemented today.
4. [`roadmap/implementation-roadmap.md`](roadmap/implementation-roadmap.md) for the next incomplete work.
5. The domain-specific document listed below.

Do not infer implementation status from a requirement, architecture document, user guide, or archived plan. Current implementation status is recorded only in `status/current-state.md` and verified in code/tests.

## Canonical Documents

### Product

- [`product/navigation-and-pages.md`](product/navigation-and-pages.md): primary navigation and route responsibilities.
- [`product/patient-workspace.md`](product/patient-workspace.md): authoritative four-tab patient workspace contract.

### Requirements

- [`requirements/clinical-workflow.md`](requirements/clinical-workflow.md): end-to-end patient and administrative workflow requirements derived from the 2026 templates.
- [`requirements/production-readiness.md`](requirements/production-readiness.md): authentication, persistence, audit, integration, clinical validation, and deployment gates.

### Architecture

- [`architecture/workflow-and-automation.md`](architecture/workflow-and-automation.md): phases, steps, gates, ownership, and automation rules.
- [`architecture/data-and-phi-boundaries.md`](architecture/data-and-phi-boundaries.md): data ownership, OPS/PHI separation, repositories, and safe DTO rules.
- [`architecture/document-lifecycle.md`](architecture/document-lifecycle.md): templates, generated outputs, signatures, storage, eCW, and corrections.

### Design

- [`design/ui-engineering.md`](design/ui-engineering.md): shared component and layout rules.
- [`design/typography.md`](design/typography.md): type roles and accessibility rules.
- [`design/color-system.md`](design/color-system.md): color tokens and semantic status rules.

### Templates

- [`templates/registry.md`](templates/registry.md): template families, registry states, and app mapping.
- [`templates/normalization-manifest.md`](templates/normalization-manifest.md): source-file rename/move evidence and hashes.

### Delivery and Operations

- [`status/current-state.md`](status/current-state.md): concise, evidence-backed implementation truth.
- [`roadmap/implementation-roadmap.md`](roadmap/implementation-roadmap.md): ordered gap-closure plan and acceptance criteria.
- [`guides/user-manual.md`](guides/user-manual.md): current prototype operator guide and explicit limitations.

## Historical Material

Files under [`archive/`](archive/) are non-authoritative historical records. They may explain why a decision was made, but they must never override current requirements, architecture, status, or code.

## Maintenance Rules

- Update stable intent in `PRODUCT.md` or the relevant product/requirements document.
- Update `status/current-state.md` only when code and proportionate verification support the claim.
- Update the roadmap when scope, ordering, blockers, or acceptance evidence changes.
- Update the user manual only for behavior that a user can actually perform.
- Move superseded planning documents to `archive/` or delete them after their durable decisions have been merged.
- Use repository-relative Markdown links and run the documentation link check after moves.
