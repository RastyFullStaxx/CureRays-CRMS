import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function routeFile(route) {
  return join(root, "app", ...route.split("/").filter(Boolean), "page.tsx");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const appShell = read("components/app-shell.tsx");
const macNavigation = read("components/mac-navigation.tsx");
const loginPage = read("app/login/page.tsx");
const loginCard = read("components/landing/login-card.tsx");
const workspace = read("components/patients/patient-workspace.tsx");
const dataTable = read("components/shared/data-table.tsx");
const dashboardClient = read("components/dashboard/dashboard-telemetry-client.tsx");
const dashboardService = read("lib/services/dashboard-telemetry-service.ts");
const analyticsClient = read("components/analytics/analytics-command-client.tsx");
const analyticsService = read("lib/services/analytics-telemetry-service.ts");
const patientRegistry = read("components/patients/patient-registry-client.tsx");
const fractionWorksheet = read("components/fraction-worksheet-panel.tsx");
const globals = read("app/globals.css");
const rootPage = read("app/page.tsx");
const envExample = read(".env.example");

const expectedPrimaryHrefs = [
  "/dashboard",
  "/patients",
  "/tasks",
  "/schedule",
  "/analytics",
  "/settings",
];

const demotedHrefs = [
  "/courses",
  "/workflow",
  "/today",
  "/treatment-delivery",
  "/clinical-forms",
  "/treatment-planning",
  "/imaging",
  "/documents",
  "/billing",
  "/audit",
  "/users-roles",
  "/templates",
  "/security-logs",
];

for (const href of expectedPrimaryHrefs) {
  assert.match(macNavigation, new RegExp(`href: ['"]${href}['"]`), `Mac command bar must expose ${href}`);
}

assert.match(
  macNavigation,
  /const commandItems = \[\s*\{ key: ['"]dashboard['"], href: ['"]\/dashboard['"]/,
  "Dashboard must be the first primary navigation tab",
);
assert.match(macNavigation, /<Link href="\/dashboard" className="mac-brand"/, "CureRays brand must route to the dashboard");

for (const href of demotedHrefs) {
  assert.doesNotMatch(macNavigation, new RegExp(`href: ['"]${href}['"]`), `Mac command bar must not expose demoted tool ${href}`);
}

assert.match(appShell, /MacNavigation/, "AppShell must render the Mac-style navigation");
assert.doesNotMatch(appShell, /Sidebar/, "AppShell must not render the legacy sidebar");
assert.match(appShell, /pathname === '\/login'/, "Login route must stay outside the authenticated Mac command shell");
assert.doesNotMatch(macNavigation, /mac-dock/, "Primary navigation must not render the rejected bottom Dock");
assert.match(macNavigation, /className="mac-command-bar"/, "Shell must render a Mac-style top command bar");
assert.match(macNavigation, /Search patient, MRN, course, or action/, "Mac shell must keep patient search prominent");
assert.match(macNavigation, /curerays_theme_mode/, "Mac shell must use the explicit light-first theme preference key");
assert.match(macNavigation, /aria-label=\{item\.label\}/, "Compact command navigation must retain accessible labels");
assert.match(macNavigation, /title=\{item\.label\}/, "Compact command navigation must retain tooltips");
assert.match(globals, /@media \(max-width: 1320px\)[\s\S]*\.mac-command-nav-item:not\(\.is-active\) span\s*\{[^}]*display:\s*none;/s, "Mac command bar must collapse only inactive labels at the laptop breakpoint");
assert.match(globals, /@media \(max-width: 1320px\)[\s\S]*\.mac-command-nav\s*\{[^}]*overflow-x:\s*hidden;/s, "Compact command navigation must not horizontally scroll");
assert.match(workspace, /patient-workspace-sidebar clinical-surface/, "Patient workspace must keep desktop patient context in the left sidebar");
assert.match(workspace, /patient-workspace-compact clinical-surface/, "Patient workspace must retain compact patient context below the sidebar breakpoint");
assert.match(workspace, /PatientWorkspaceNavigation/, "Patient workspace must share navigation behavior across sidebar and compact layouts");
assert.doesNotMatch(workspace, /clinical-floating-action/, "Patient workspace must not cover content with floating actions");
assert.match(workspace, /selectedCarepathStep/, "Patient Carepath must use a selected step as the working surface");
assert.match(workspace, /Related Work Items/, "Patient Carepath must fold related work items into the selected step panel");
assert.doesNotMatch(workspace, /clinical-label">Work Items/, "Patient Carepath must not render Work Items as a second competing full table");
assert.match(rootPage, /redirect\(['"]\/login['"]\)/, "Root route must load the pilot login by default");
assert.match(loginPage, /landing-page/, "Login route must expose the liquid-glass landing page");
assert.match(loginPage, /LoginCard/, "Login route must render the reusable login card");
assert.doesNotMatch(loginPage, /className="landing-page dark"/, "Landing must use its fixed daylight palette");
assert.doesNotMatch(loginPage, /Synthetic Data Pilot|Synthetic data/i, "Landing page must not expose removed pilot wording");
assert.doesNotMatch(loginCard, /Synthetic Data Pilot|Synthetic data/i, "Landing sign-in must not expose removed pilot wording");
assert.match(loginPage, /About CureRays/, "Landing must introduce CureRays Radiation Medicine");
assert.match(loginPage, /href="#sign-in"/, "Landing header must provide a direct sign-in anchor");
assert.match(loginPage, /sizes="/, "Landing editorial image must provide responsive sizes");
assert.match(globals, /\.landing-story-link\s*\{[^}]*min-height:\s*40px;/s, "Landing story link must keep a 40px touch target");
assert.match(globals, /\.landing-password-toggle\s*\{[^}]*height:\s*40px;[^}]*width:\s*40px;/s, "Landing password toggle must keep a 40px touch target");
assert.match(read("app/layout.tsx"), /curerays_theme_mode/, "Root layout must initialize the light-first Mac theme key");
assert.match(envExample, /OPS_DATABASE_URL=.*localhost/, "OPS database example URL must target local PostgreSQL");
assert.match(envExample, /PHI_DATABASE_URL=.*localhost/, "PHI database example URL must target local PostgreSQL");
assert.match(globals, /\.dashboard-operations\s*\{[^}]*overflow-y: auto/, "Dashboard operations page must keep a vertical page scroll area");
assert.match(globals, /\.mac-main > \*[\s\S]*mac-page-enter/, "Mac shell must provide a subtle page transition");
assert.match(globals, /\.landing-login-card[\s\S]*backdrop-filter: blur\(28px\)/, "Landing login card must use liquid-glass blur");
assert.match(globals, /\.dashboard-operations\s*\{[^}]*overflow-x: hidden/, "Dashboard operations page must avoid horizontal page scrolling");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-y: auto/, "Analytics chart pages must keep a vertical page scroll area");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-x: hidden/, "Analytics chart pages must avoid horizontal page scrolling");
assert.match(globals, /\.clinical-matrix[\s\S]*--matrix-min-height/, "Square-block chart matrices must reserve enough height to avoid clipping");
assert.match(globals, /\.clinical-matrix[\s\S]*overflow-y: auto/, "Square-block chart matrices must contain tall content inside the chart card");
assert.match(globals, /--matrix-max-height/, "Square-block chart cards must cap matrix height so blocks cannot overlap neighboring content");
assert.doesNotMatch(analyticsClient, /QueueDrilldown|Tokenized Inspection Queue|courseDrilldown/, "Analytics must not render current-work queues");
assert.doesNotMatch(analyticsClient, /fetch\(|\/api\/(?:tasks|workflow)|<Button|onTaskAction/, "Analytics must not expose direct workflow actions");
assert.doesNotMatch(analyticsClient, /Top Course Risk|topCourseRisks|Active Course Progress|courseProgress/, "Analytics must not rank or track individual courses");
assert.doesNotMatch(analyticsService, /AnalyticsQueueItem|buildCourseDrilldown|courseDrilldown|AnalyticsTreatmentProgress|buildTreatmentProgress|courseProgress|topCourseRisks|buildRiskRankings/, "Analytics telemetry must remain aggregate-only");
for (const label of ["Overview", "Workflow", "Treatment", "Documents", "Staffing", "Billing & Risk"]) {
  assert.match(analyticsClient, new RegExp(`['"]${escapeRegExp(label)}['"]`), `Analytics must retain the ${label} panel`);
}
assert.match(analyticsClient, />Trend Range</, "Analytics must label the aggregate time control Trend Range");
assert.match(analyticsClient, /aria-label="Analytics Trend Range"/, "Analytics trend control must expose its aggregate purpose");
assert.doesNotMatch(analyticsClient, /(?:lg|xl):grid-cols/, "Analytics paired panels must not begin at framework laptop breakpoints");
assert.match(globals, /\.analytics-paired-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s, "Analytics paired chart grids must default to one chart per row");
assert.match(globals, /\.analytics-mix-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s, "Analytics cohort charts must default to one chart per row");
assert.match(globals, /\.analytics-insight-rail\s*\{[^}]*position:\s*static;[^}]*width:\s*100%;/s, "Analytics insights must stay full-width and nonsticky by default");
assert.match(globals, /\.analytics-insight-list\s*\{[^}]*overflow:\s*visible;/s, "Analytics insights must not add an inner laptop scrollbar");
assert.match(globals, /@media \(min-width: 1321px\)[\s\S]*\.analytics-panel-split[\s\S]*minmax\(480px,[\s\S]*\.analytics-paired-grid[\s\S]*480px/s, "Analytics may pair panels only above 1320px with at least 480px per panel");
assert.doesNotMatch(dashboardClient, /Clinical Safety Score/, "Dashboard must not expose a synthetic clinical safety score");
assert.doesNotMatch(dashboardClient, /from ['"]recharts['"]|ChartCard|ClinicalMatrix/, "Dashboard must not import or render charts");
assert.doesNotMatch(dashboardClient, /TabStrip|role="tabpanel"|DashboardPanel|RiskDashboard|Trend/, "Dashboard must not expose tabs, risk panels, or trends");
assert.match(dashboardClient, /Priority Queue/, "Dashboard must expose the Priority Queue");
assert.match(dashboardClient, /Today Schedule/, "Dashboard must expose Today Schedule");
assert.match(dashboardClient, /Exceptions/, "Dashboard must expose Exceptions");
assert.match(dashboardService, /listQueue\('BLOCKED', 'RAD_ONC', asOf\.toISOString\(\), 'ALL_OPEN'\)/, "Blocked Work must use the linked BLOCKED and ALL_OPEN snapshot");
assert.match(dashboardService, /listQueue\('SIGNATURES', 'RAD_ONC', asOf\.toISOString\(\), 'ALL_OPEN'\)/, "Documents Awaiting Review must use the linked SIGNATURES and ALL_OPEN snapshot");
assert.match(dashboardService, /blockedWork: blockedTaskQueue\.tasks\.length/, "Blocked Work must count the linked snapshot tasks");
assert.match(dashboardService, /documentsAwaitingReview: signatureTaskQueue\.tasks\.length/, "Documents Awaiting Review must count the linked snapshot tasks");

const visibleWorkspaceLabels = [
  "Overview",
  "Prepare",
  "Treatment",
  "Record & Closeout",
];

for (const label of visibleWorkspaceLabels) {
  assert.match(workspace, new RegExp(`label: ['"]${escapeRegExp(label)}['"]`), `Patient workspace must expose ${label}`);
}

const removedWorkspaceLabels = [
  "Command",
  "Tasks",
  "Clinical",
  "Planning",
  "Imaging",
  "Documents",
  "Fractions",
  "Billing / Audit",
];

for (const label of removedWorkspaceLabels) {
  assert.doesNotMatch(workspace, new RegExp(`label: ['"]${escapeRegExp(label)}['"]`), `Patient workspace must not expose legacy tab ${label}`);
}

assert.ok(existsSync(routeFile("/tasks")), "Tasks route must exist");
assert.ok(existsSync(routeFile("/today")), "Today compatibility route must exist");

const redirectedRoutes = [
  "/courses",
  "/records",
  "/workflow",
  "/today",
  "/clinical-forms",
  "/treatment-planning",
  "/imaging",
  "/treatment-delivery",
  "/documents",
  "/billing",
  "/audit",
  "/upcoming",
  "/on-treatment",
  "/post",
];

for (const route of redirectedRoutes) {
  const relativePath = join("app", ...route.split("/").filter(Boolean), "page.tsx");
  const source = read(relativePath);
  assert.match(source, /from ['"]next\/navigation['"]/, `${route} must use Next redirect`);
  assert.match(source, /redirect\(/, `${route} must redirect to patient-first work`);
}

const redirectedPatientSubroutes = [
  {
    file: "app/patients/[id]/carepath/page.tsx",
    target: "?tab=prepare",
  },
  {
    file: "app/patients/[id]/documents/page.tsx",
    target: "?tab=record-closeout",
  },
];

for (const route of redirectedPatientSubroutes) {
  const source = read(route.file);
  assert.match(source, /from ['"]next\/navigation['"]/, `${route.file} must use Next redirect`);
  assert.match(source, /redirect\(/, `${route.file} must redirect to the unified patient workspace`);
  assert.match(source, new RegExp(escapeRegExp(route.target)), `${route.file} must target ${route.target}`);
}

assert.match(dataTable, /minTableWidth/, "DataTable must support explicit minimum widths for dense clinical tables");
assert.match(dataTable, /tableMinWidth/, "DataTable must calculate a default minimum table width");
assert.match(dataTable, /overflow-x-auto/, "DataTable must keep horizontal scrolling for wide tables");
assert.match(dataTable, /scrollbar-soft/, "DataTable scroll regions must use the shared styled scrollbar");
assert.match(dataTable, /flex-wrap items-center gap-2/, "DataTable toolbar controls must wrap instead of clipping");
assert.match(dataTable, /filteredRows\.slice\(0,\s*pageSize\)/, "DataTable pageSize must cap rendered content");
assert.doesNotMatch(dataTable, /tableViewportHeight|viewportRows|\*\s*var\(--height-table-row\)/, "DataTable pageSize must not imply a fixed row-height viewport");
assert.match(workspace, /patient-workspace-surface patient-workspace-canvas/, "Patient workspace must use the shared full-width tab content canvas");
assert.match(globals, /\.patient-workspace[\s\S]*overflow-y: auto/, "Patient workspace page must own vertical scrolling");
assert.match(globals, /\.patient-workspace-sidebar[\s\S]*overflow: hidden[\s\S]*position: sticky/, "Patient sidebar must remain sticky without an independent scrollbar");
assert.match(globals, /@media \(min-width: 1280px\)[\s\S]*patient-workspace-layout[\s\S]*grid-template-columns: clamp\(232px, 17vw, 248px\)/, "Patient sidebar must use the approved desktop width and breakpoint");
assert.doesNotMatch(workspace, /patient-workspace-canvas scrollbar-soft/, "Patient workspace canvas must not render its own vertical scrollbar");
assert.match(globals, /@container \(min-width: 900px\)[\s\S]*\.prepare-workbench-layout\s*\{[^}]*grid-template-columns:\s*minmax\(220px,\s*240px\)\s+minmax\(0,\s*1fr\);/s, "Prepare workbench must use the laptop-safe two-column threshold and rail width");
assert.doesNotMatch(globals, /\.prepare-path-rail\s*\{[^}]*100dvh/s, "Prepare rail must not own an independent viewport-height scroll region");
assert.doesNotMatch(workspace, /prepare-step-status/, "Prepare workflow status must use shared labeled pill semantics");
assert.match(workspace, /treatmentWorkflowSteps\.length \? \(/, "Treatment workflow section must render only when it has steps");
assert.doesNotMatch(workspace, /No on-treatment workflow steps are configured/, "Treatment workspace must not render an empty workflow section");
assert.match(workspace, /role="tablist"/, "Patient workspace must expose semantic tab navigation");
assert.match(workspace, /aria-selected=\{selected\}/, "Patient workspace tabs must expose selected state");
assert.match(workspace, /aria-orientation=\{orientation\}/, "Patient workspace navigation must declare horizontal or vertical orientation");
assert.match(workspace, /ArrowUp/, "Vertical patient workspace navigation must support Up and Down arrow keys");
assert.match(workspace, /minTableWidth="1240px"/, "Patient workspace document table must preserve readable lifecycle columns");
assert.match(fractionWorksheet, /deriveFractionLogStatus\(row\.entry\)/, "Fraction history must derive displayed status from current approval state");
assert.match(patientRegistry, /minTableWidth="1480px"/, "Patient registry must preserve readable columns for the main work list");
assert.match(fractionWorksheet, /minTableWidth="1320px"/, "Fraction worksheet history must preserve readable treatment columns");

console.log("Product simplification guardrails passed.");
