# 2026 Implementation Decision History

> **Non-authoritative archive.** This is a condensed record of major implementation decisions. It intentionally omits old completion percentages, route inventories, task lists, and next-step claims. Use [current implementation state](../status/current-state.md) and the [implementation roadmap](../roadmap/implementation-roadmap.md) for active work. Full detail remains available in Git history.

## June 11: Baseline and Guardrails

- Established a Next.js/React/TypeScript prototype with shared mock clinical data.
- Added lightweight verification, route checks, security headers, and HIPAA-oriented guardrails.
- Identified the enduring production blockers: real identity/RBAC, durable OPS/PHI persistence, immutable audit, actual document/file lifecycle, integrations, and clinical validation.
- Standardized token-first shared UI primitives and removed hardcoded component palettes.

## June 12: Server Seams and Prototype Workflow Domains

- Added patient registration service/repository boundaries and synthetic audit context.
- Added separate OPS and PHI Prisma schemas, local SQL/seed support, and an opt-in hydration bridge.
- Added workflow/task command services with role-aware prototype mutations and explicit blocker/N/A behavior.
- Added the typed template registry, source hashes, requirements, field maps, applicability metadata, and explicit draft/deferred/missing states.
- Added document lifecycle metadata and guarded actions for render/export/sign/manual external confirmation, while intentionally leaving real generation/storage/signature/integration incomplete.
- Added treatment planning/fraction models, scheduling, image/OTV/physics gates, correction/void behavior, and a production clinical-validation block.
- Split daily verification from broad release-style guardrails.

## June 13–14: Workflow Demonstration and UI Hardening

- Improved patient registration/edit flows and DOCX Intake/AVS assisted prefill.
- Expanded patient, schedule, workflow, documents, billing, audit, template, user/role, and settings demonstration surfaces.
- Converted many inert controls into explicitly prototype-only staged actions.
- Added shared scrolling, table containment, modal, responsive, and typography rules.
- Preserved the rule that simulated actions do not establish external files, real signatures, external uploads, or production persistence.

## June 19: Patient-First Simplification

- Reduced primary navigation to Patients, Today, Schedule, Dashboard, Analytics, and Settings.
- Made the patient registry/workspace the preferred place for patient-course maintenance.
- Redirected or demoted redundant global work surfaces.
- Consolidated workflow/tasks and record-related work so application data categories no longer dictate navigation.

The original implementation plan used five patient sections. That design was subsequently superseded by the four-tab workspace below.

## July 1–2: Four-Tab Workspace and Design System Consolidation

- Adopted Overview, Prepare, Treatment, and Record & Closeout as the stable patient-workspace architecture.
- Added a shared course-gate/next-action view model and legacy tab normalization.
- Added desktop sticky patient/course sidebar behavior with compact responsive header/tabs.
- Grouped attention queues and deep-linked targets.
- Corrected displayed fraction approval to derive from required approvals.
- Standardized Inter typography to 18/14/13/12 roles and consolidated semantic colors/statuses.
- Improved modal containment, table overflow, short-height behavior, keyboard navigation, and responsive layouts.

Usability audit scores from this period were point-in-time design evidence only. They did not establish production readiness or clinical validity and are intentionally not preserved as current scores.

## July 3: Documentation Architecture

- Replaced flat, overlapping documentation with product, requirements, architecture, design, templates, status, roadmap, guides, and archive sections.
- Made `docs/status/current-state.md` the sole prose source for current implementation truth.
- Added detailed clinical/administrative workflow and production-readiness requirements.
- Rewrote the user guide around current four-tab behavior and explicit prototype limitations.
- Removed superseded patient-first plans, duplicate product context, repository-discovery notes, and percentage-based readiness claims.

## Enduring Decisions

These decisions remain canonical unless deliberately changed in current product/architecture documents:

- One authoritative patient-course state.
- Four patient-workspace tabs.
- Files are outputs/evidence, not workflow state.
- Structured data precedes document generation.
- Missing/deferred/draft requirements remain visible.
- PHI stays behind server boundaries.
- Production has no in-memory fallback.
- Clinical calculations remain blocked until formal validation.
