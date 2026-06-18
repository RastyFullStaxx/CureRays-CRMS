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

const sidebar = read("components/sidebar.tsx");
const workspace = read("components/patients/patient-workspace.tsx");
const dataTable = read("components/shared/data-table.tsx");
const patientRegistry = read("components/patients/patient-registry-client.tsx");
const fractionWorksheet = read("components/fraction-worksheet-panel.tsx");

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
  assert.match(sidebar, new RegExp(`href: ['"]${href}['"]`), `Sidebar must expose ${href}`);
}

for (const href of demotedHrefs) {
  assert.doesNotMatch(sidebar, new RegExp(`href: ['"]${href}['"]`), `Sidebar must not expose demoted tool ${href}`);
}

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
