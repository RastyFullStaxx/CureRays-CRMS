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
const workspace = read("components/patients/patient-workspace.tsx");
const dataTable = read("components/shared/data-table.tsx");
const dashboardClient = read("components/dashboard/dashboard-telemetry-client.tsx");
const patientRegistry = read("components/patients/patient-registry-client.tsx");
const fractionWorksheet = read("components/fraction-worksheet-panel.tsx");
const globals = read("app/globals.css");
const rootPage = read("app/page.tsx");

const expectedPrimaryHrefs = [
  "/patients",
  "/today",
  "/schedule",
  "/dashboard",
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

for (const href of demotedHrefs) {
  assert.doesNotMatch(macNavigation, new RegExp(`href: ['"]${href}['"]`), `Mac command bar must not expose demoted tool ${href}`);
}

assert.match(appShell, /MacNavigation/, "AppShell must render the Mac-style navigation");
assert.doesNotMatch(appShell, /Sidebar/, "AppShell must not render the legacy sidebar");
assert.doesNotMatch(macNavigation, /mac-dock/, "Primary navigation must not render the rejected bottom Dock");
assert.match(macNavigation, /className="mac-command-bar"/, "Shell must render a Mac-style top command bar");
assert.match(macNavigation, /Search patient, MRN, course, or action/, "Mac shell must keep patient search prominent");
assert.match(workspace, /mac-glass-surface sticky top-0/, "Patient workspace must use compact glass context chrome");
assert.doesNotMatch(workspace, /clinical-floating-action/, "Patient workspace must not cover content with floating actions");
assert.match(rootPage, /redirect\(['"]\/dashboard['"]\)/, "Root route must load the dashboard by default");
assert.match(globals, /\.dashboard-command-grid[\s\S]*overflow-y: auto/, "Dashboard chart pages must keep a vertical page scroll area");
assert.match(globals, /\.dashboard-command-grid[\s\S]*overflow-x: hidden/, "Dashboard chart pages must avoid horizontal page scrolling");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-y: auto/, "Analytics chart pages must keep a vertical page scroll area");
assert.match(globals, /\.analytics-command-body[\s\S]*overflow-x: hidden/, "Analytics chart pages must avoid horizontal page scrolling");
assert.match(globals, /\.clinical-matrix[\s\S]*--matrix-min-height/, "Square-block chart matrices must reserve enough height to avoid clipping");
assert.match(globals, /\.clinical-matrix[\s\S]*overflow-y: auto/, "Square-block chart matrices must contain tall content inside the chart card");
assert.match(globals, /--matrix-max-height/, "Square-block chart cards must cap matrix height so blocks cannot overlap neighboring content");
assert.match(globals, /\.analytics-insight-rail[\s\S]*--list-max-height/, "Analytics insight lists must remain independently scrollable");
assert.match(dashboardClient, /RiskDomainLoad/, "Dashboard Risk tab must use sorted risk-domain bars instead of another square-block matrix");
assert.doesNotMatch(dashboardClient, /function SafetyMatrix/, "Dashboard Risk tab must not reintroduce the old square Safety Matrix chart");
assert.match(globals, /\.dashboard-panel-risk[\s\S]*"graph side"[\s\S]*"queue side"[\s\S]*"fraction side"/, "Dashboard Risk tab must keep the constellation, triage queue, and summaries in a balanced layout");

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
assert.match(workspace, /scrollbar-soft min-h-0 flex-1 overflow-y-auto/, "Patient workspace content must stay scrollable");
assert.match(workspace, /minTableWidth="1180px"/, "Carepath workflow table must have a readable dense-table width");
assert.match(workspace, /minTableWidth="1080px"/, "Patient workspace dense tables must preserve readable columns");
assert.match(patientRegistry, /minTableWidth="1480px"/, "Patient registry must preserve readable columns for the main work list");
assert.match(fractionWorksheet, /minTableWidth="1320px"/, "Fraction worksheet history must preserve readable treatment columns");

console.log("Product simplification guardrails passed.");
