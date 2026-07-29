# Operational Command Center UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task by task.

**Goal:** Replace the graph-heavy Dashboard with a daily operational command center, make Analytics the sole aggregate reporting surface, and make the shared shell reliable at 1280 × 800.

**Architecture:** Keep the existing Dashboard and Analytics route/component filenames so guardrails and imports remain stable. Delete obsolete telemetry/chart builders, derive a single tokenized operational snapshot in the server service, and render it through existing shared UI primitives. Fix laptop behavior at the shared shell/table/container rules instead of adding page-local workarounds.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 3, existing CSS tokens and shared components.

## Global Constraints

- Do not edit landing-page layout, artwork, or styling.
- Dashboard contains no charts, analytics tabs, trends, per-course rankings, synthetic scores, or analytics drilldowns.
- Analytics contains no action queue, current-day operations, direct workflow action, or per-course risk ranking.
- At 1280 × 800 and 100% zoom, the command bar has no horizontal overflow and the page has one vertical scroll owner.
- Use existing CSS tokens and shared primitives; do not add dependencies, hardcoded colors, local font sizes, or a second design system.
- Every enabled operational action has a real route. If no destination exists, omit the action.
- Browser evidence uses mock data only.

---

## Task 1: Replace Dashboard telemetry with one operational snapshot

**Files:**

- Modify: `scripts/product-simplification-guardrails.mjs`
- Modify: `lib/services/dashboard-telemetry-service.ts`
- Modify: `components/dashboard/dashboard-telemetry-client.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**

```ts
export interface DashboardOperationsSnapshot {
  generatedAt: string;
  metrics: {
    appointmentsToday: number;
    actionableTasks: number;
    blockedWork: number;
    documentsAwaitingReview: number;
  };
  priorityQueue: DashboardOperationsItem[];
  todaySchedule: DashboardOperationsItem[];
  exceptions: DashboardOperationsItem[];
}

export function getDashboardOperations(
  asOf?: Date,
): DashboardOperationsSnapshot;
```

- [ ] Update `product-simplification-guardrails.mjs` first so it fails while Dashboard still exposes `Clinical Safety Score`, chart imports, tabs, or risk/trend panels, and requires `Priority Queue`, `Today Schedule`, and `Exceptions`.
- [ ] Run `node scripts/product-simplification-guardrails.mjs` and record the expected failure.
- [ ] Delete obsolete Dashboard telemetry DTOs, fake score/risk builders, chart configuration, tab state, and unused CSS.
- [ ] Build the four metrics from existing operational appointments, task queue data, blocked workflow state, and generated-document review state.
- [ ] Limit visible collections to five priority items and three items in each right-hand list; include only items with a valid route target.
- [ ] Render a compact summary row and a two-column body using `PageStack`, `PageHeader`, `StatGrid`, `StatCard`, `Card`, `Badge`/`StatusBadge`, and route-backed links.
- [ ] Run the product simplification guardrail and `npm run typecheck`.
- [ ] Commit with message `feat: replace dashboard telemetry with daily operations`.

## Task 2: Make Analytics aggregate-only and laptop-safe

**Files:**

- Modify: `lib/services/analytics-telemetry-service.ts`
- Modify: `components/analytics/analytics-command-client.tsx`
- Modify: `app/globals.css`
- Modify: `scripts/product-simplification-guardrails.mjs`

**Interfaces:**

- Keep the six canonical panel labels: `Overview`, `Workflow`, `Treatment`, `Documents`, `Staffing`, `Billing & Risk`.
- Rename the control label `Date Range` to `Trend Range`.
- Keep aggregate domain risk data; remove course-specific queue/ranking DTOs and builders.

- [ ] Add failing guardrail assertions that Analytics has no `QueueDrilldown`, direct task actions, or top-course risk ranking, and that paired chart grids begin only above 1320px.
- [ ] Run the guardrail and record the expected failure.
- [ ] Delete the queue drilldown and per-course risk-ranking service output and client rendering.
- [ ] Change paired chart/insight layouts so widths at or below 1320px render one chart per row with the insight panel in normal document flow; allow paired panels only when each can remain at least 480px wide.
- [ ] Keep the six aggregate categories and aggregate billing, audit, PHI, and risk-domain summaries.
- [ ] Run the guardrail and `npm run typecheck`.
- [ ] Commit with message `refactor: keep analytics focused on aggregate insight`.

## Task 3: Fix shared 1280 × 800 shell and overflow behavior

**Files:**

- Modify: `components/mac-navigation.tsx`
- Modify: `components/shared/data-table.tsx`
- Modify: `components/patients/patient-workspace.tsx`
- Modify: `app/globals.css`
- Modify: `scripts/product-simplification-guardrails.mjs`

**Contracts:**

- At 1280px, product identity, active navigation label, patient/course search, account control, and theme control remain visible.
- Inactive navigation may collapse to icons with accessible labels/tooltips.
- `DataTable` must not infer a 920px viewport from its default page size.
- Prepare workbench becomes two columns at container width 900px, with a 220–240px navigation rail.

- [ ] Add source guardrail assertions for the compact command-bar breakpoint, the 900px Prepare container threshold, and removal of implicit `20 × 44px` DataTable viewport sizing.
- [ ] Run the guardrail and record the expected failure.
- [ ] Collapse only inactive command navigation labels at the laptop breakpoint; retain `aria-label`/`title` text and the active label.
- [ ] Make DataTable height content-driven unless a caller explicitly supplies a row/viewport limit; preserve `flex-1 min-h-0` for pages that own remaining height.
- [ ] Change the Prepare workbench threshold to 900px and keep the expanded/collapsed rail within 220–240px without overlapping the work area.
- [ ] Ensure schedule/settings/admin scroll regions retain one explicit scroll owner and `scrollbar-soft`.
- [ ] Run the guardrail and `npm run typecheck`.
- [ ] Commit with message `fix: make shared operations layout laptop safe`.

## Task 4: Make prototype controls and route aliases honest

**Files:**

- Modify: `components/shared/prototype-action-button.tsx`
- Modify: `components/tasks/task-queue-client.tsx`
- Modify: `lib/server/workflow-command-service.ts`
- Modify: `app/workflow/igsrt/page.tsx`
- Modify: `app/workflow/templates/page.tsx`
- Modify: `app/reports/page.tsx`
- Modify: `app/security-logs/page.tsx`
- Modify: callers returned by `rg -n "PrototypeActionButton|/workflow/igsrt|/workflow/templates|/reports|/security-logs" app components lib`
- Modify: `scripts/product-simplification-guardrails.mjs`

**Contracts:**

```ts
type PrototypeActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
```

- A button without an `href` or async action is disabled.
- Async actions expose a pending state and never report success before the callback resolves.
- Permanent aliases:
  - `/workflow/igsrt` → `/patients`
  - `/workflow/templates` → `/templates`
  - `/reports` → `/analytics`
  - `/security-logs` → `/audit-logs`
- Default task bucket is the first non-empty bucket in order: overdue, today, upcoming, all open.

- [ ] Add failing guardrail assertions for the action contract, permanent redirects, and default task-bucket order.
- [ ] Run the guardrail and record the expected failure.
- [ ] Remove unused action-button props and fake timeout success; implement only route-backed and explicit async actions.
- [ ] Update callers to provide a real route/callback or render disabled/omit the action.
- [ ] Add permanent redirects and update internal links to canonical destinations.
- [ ] Change the task queue default selection without changing user-selected buckets.
- [ ] Run the guardrail and `npm run typecheck`.
- [ ] Commit with message `fix: connect prototype controls to real destinations`.

## Task 5: Verify the operational UI at 1280 × 800

**Files:**

- Create/update evidence only under `.superpowers/sdd/` or the thread visualization directory; do not commit screenshots.

- [ ] Run `npm run verify`.
- [ ] Start/reuse the mock-data development server.
- [ ] Use the browser at exactly 1280 × 800 to inspect `/dashboard`, every Analytics panel, `/patients`, `/tasks`, `/schedule`, `/settings`, and one patient Prepare workspace.
- [ ] Verify no horizontal page overflow, command-bar overlap, nested page scrolling, clipped table controls, or analytics content on Dashboard.
- [ ] Exercise Dashboard links, canonical redirects, task bucket selection, theme control, and collapsed/expanded patient navigation.
- [ ] Capture final Dashboard and Analytics screenshots and compare them against the approved information architecture.
- [ ] Fix only defects revealed by these checks, rerun the narrow failing check, and commit with message `fix: close laptop operational ui defects`.
