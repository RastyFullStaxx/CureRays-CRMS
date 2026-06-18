# Patient-First Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify CureRays CRMS so patient record maintenance becomes the primary work surface while dashboard and analytics remain visual oversight surfaces.

**Architecture:** Keep existing data and route modules, but reduce primary navigation, add a Today patient-action queue, and collapse the patient workspace into five sections. Redundant global work pages redirect to patient-first destinations so old links remain valid without preserving parallel tools.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 3, existing shared UI components, Node guardrail scripts.

---

### File Map

- `scripts/product-simplification-guardrails.mjs`: Verifies the new primary navigation, visible patient workspace tabs, Today route, and redundant route redirects.
- `package.json`: Adds `npm run test:simplification`.
- `components/sidebar.tsx`: Replaces broad module navigation with patient-first navigation.
- `app/today/page.tsx`: Creates a filtered patient action queue for current work.
- `components/patients/patient-registry-client.tsx`: Allows Patients and Today to share the registry UI with different page copy.
- `app/patients/[id]/page.tsx`: Normalizes legacy tab query links to the new workspace sections.
- `components/patients/patient-workspace.tsx`: Exposes five visible sections and groups duplicated work together.
- Redundant route pages under `app/`: Redirect old global work surfaces to `/patients` or `/today`.
- `docs/curerays-page-plan.md`, `docs/curerays-product-context.md`, `docs/curerays-system-progress-tracker.md`: Record the product simplification.

### Task 1: Guardrail

- [ ] Add `scripts/product-simplification-guardrails.mjs` to assert the desired navigation and workspace structure.
- [ ] Add `test:simplification` to `package.json`.
- [ ] Run `npm run test:simplification` and confirm it fails against the current broad navigation.

### Task 2: Primary Navigation

- [ ] Modify `components/sidebar.tsx` so the only visible primary links are Patients, Today, Schedule, Dashboard, Analytics, and Settings.
- [ ] Add `app/today/page.tsx` with needs-action patient rows.
- [ ] Extend `PatientRegistryClient` with optional `title`, `subtitle`, and `empty` copy props.
- [ ] Run `npm run test:simplification` and confirm the navigation/Today checks pass or reveal only remaining workspace/redirect failures.

### Task 3: Patient Workspace Sections

- [ ] Update `app/patients/[id]/page.tsx` to map old query tab names to new section names.
- [ ] Update `components/patients/patient-workspace.tsx` to show only Overview, Carepath, Treatment, Documents & Billing, and Activity.
- [ ] Add combined Carepath, Treatment, and Documents & Billing section rendering.
- [ ] Run `npm run test:simplification`.

### Task 4: Redirect Redundant Global Work Pages

- [ ] Replace redundant global work pages with `redirect('/patients')` or `redirect('/today')`.
- [ ] Keep Dashboard, Analytics, Schedule, Patients, Today, and Settings as working top-level routes.
- [ ] Run `npm run test:simplification`.

### Task 5: Docs And Verification

- [ ] Update product/page-plan/progress docs with the simplified operating model.
- [ ] Run `npm run test:simplification`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
