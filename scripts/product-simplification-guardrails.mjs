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
const workspace = read("components/patients/patient-workspace.tsx");
const dataTable = read("components/shared/data-table.tsx");
const dashboardClient = read("components/dashboard/dashboard-telemetry-client.tsx");
const patientRegistry = read("components/patients/patient-registry-client.tsx");
const fractionWorksheet = read("components/fraction-worksheet-panel.tsx");
const globals = read("app/globals.css");
const rootPage = read("app/page.tsx");
const envExample = read(".env.example");

const expectedPrimaryHrefs = [
  "/dashboard",
  "/patients",
  "/today",
  "/schedule",
  "/analytics",
  "/settings",
];

const demotedHrefs = [
  "/courses",
  "/workflow",
  "/tasks",
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
assert.match(workspace, /patient-context-rail clinical-surface/, "Patient workspace must keep patient context in the fixed desktop rail");
assert.match(workspace, /patient-context-compact clinical-surface/, "Patient workspace must provide compact patient context below the desktop breakpoint");
assert.doesNotMatch(workspace, /clinical-floating-action/, "Patient workspace must not cover content with floating actions");
assert.match(workspace, /selectedCarepathStep/, "Patient Carepath must use a selected step as the working surface");
assert.match(workspace, /Related Work Items/, "Patient Carepath must fold related work items into the selected step panel");
assert.doesNotMatch(workspace, /clinical-label">Work Items/, "Patient Carepath must not render Work Items as a second competing full table");
assert.match(rootPage, /redirect\(['"]\/dashboard['"]\)/, "Root route must load the dashboard by default");
assert.match(loginPage, /landing-page/, "Login route must expose the liquid-glass landing page");
assert.match(loginPage, /LoginCard/, "Login route must render the reusable login card");
assert.match(read("app/layout.tsx"), /curerays_theme_mode/, "Root layout must initialize the light-first Mac theme key");
assert.match(envExample, /OPS_DATABASE_URL=.*localhost/, "OPS database example URL must target local PostgreSQL");
assert.match(envExample, /PHI_DATABASE_URL=.*localhost/, "PHI database example URL must target local PostgreSQL");
assert.match(globals, /\.dashboard-command-grid[\s\S]*overflow-y: auto/, "Dashboard chart pages must keep a vertical page scroll area");
assert.match(globals, /\.mac-main > \*[\s\S]*mac-page-enter/, "Mac shell must provide a subtle page transition");
assert.match(globals, /\.landing-login-card[\s\S]*backdrop-filter: blur\(34px\)/, "Landing login card must use liquid-glass blur");
assert.match(globals, /\.dashboard-command-grid[\s\S]*overflow-x: hidden/, "Dashboard chart pages must avoid horizontal page scrolling");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-y: auto/, "Analytics chart pages must keep a vertical page scroll area");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-x: hidden/, "Analytics chart pages must avoid horizontal page scrolling");
assert.match(globals, /\.clinical-matrix[\s\S]*--matrix-min-height/, "Square-block chart matrices must reserve enough height to avoid clipping");
assert.match(globals, /\.clinical-matrix[\s\S]*overflow-y: auto/, "Square-block chart matrices must contain tall content inside the chart card");
assert.match(globals, /--matrix-max-height/, "Square-block chart cards must cap matrix height so blocks cannot overlap neighboring content");
assert.match(globals, /\.analytics-insight-rail[\s\S]*--list-max-height/, "Analytics insight lists must remain independently scrollable");
assert.match(dashboardClient, /RiskDomainLoad/, "Dashboard Risk tab must use sorted risk-domain bars instead of another square-block matrix");
assert.doesNotMatch(dashboardClient, /function SafetyMatrix/, "Dashboard Risk tab must not reintroduce the old square Safety Matrix chart");
assert.match(dashboardClient, /dashboard-risk-summary-row/, "Dashboard Risk tab must place score, domain load, and PHI assurance in a full-width summary row");
assert.doesNotMatch(dashboardClient, /dashboard-risk-side/, "Dashboard Risk tab must not use the cramped right-side summary rail");
assert.match(globals, /\.dashboard-panel-risk[\s\S]*"graph"[\s\S]*"summary"[\s\S]*"queue"[\s\S]*"fraction"/, "Dashboard Risk tab must use a vertical full-width page-scroll layout");
assert.match(globals, /\.dashboard-risk-graph-card[\s\S]*min-height: 560px/, "Dashboard Risk constellation must reserve enough room for labels and nodes");
assert.match(globals, /\.dashboard-panel-risk \.dashboard-intervention-list[\s\S]*max-height: none/, "Dashboard Risk intervention list must expand naturally by default");

const visibleWorkspaceLabels = [
  "Overview",
  "Carepath",
  "Treatment",
  "Documents & Billing",
  "Activity",
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

assert.ok(existsSync(routeFile("/today")), "Today route must exist");

const redirectedRoutes = [
  "/courses",
  "/records",
  "/workflow",
  "/tasks",
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
    target: "?tab=carepath",
  },
  {
    file: "app/patients/[id]/documents/page.tsx",
    target: "?tab=documents-billing",
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
assert.match(workspace, /patient-workspace-surface clinical-surface/, "Patient workspace must merge tabs and content into one surface");
assert.match(globals, /\.patient-workspace[\s\S]*overflow-y: auto/, "Patient workspace page must own vertical scrolling");
assert.match(globals, /\.patient-context-rail[\s\S]*position: sticky/, "Patient context rail must remain sticky and non-scrolling");
assert.match(globals, /\.patient-workspace-tabs[\s\S]*position: sticky/, "Patient workspace tabs must remain visible while the page scrolls");
assert.doesNotMatch(workspace, /patient-workspace-canvas scrollbar-soft/, "Patient workspace canvas must not render its own vertical scrollbar");
assert.match(workspace, /role="tablist"/, "Patient workspace must expose semantic tab navigation");
assert.match(workspace, /aria-selected=\{selected\}/, "Patient workspace tabs must expose selected state");
assert.match(workspace, /minTableWidth="980px"/, "Carepath workflow table must fit beside the selected-step action panel without forcing a wide duplicate-table experience");
assert.match(workspace, /minTableWidth="1240px"/, "Patient workspace document table must preserve readable lifecycle columns");
assert.match(patientRegistry, /minTableWidth="1480px"/, "Patient registry must preserve readable columns for the main work list");
assert.match(fractionWorksheet, /minTableWidth="1320px"/, "Fraction worksheet history must preserve readable treatment columns");

console.log("Product simplification guardrails passed.");
