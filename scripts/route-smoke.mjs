import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const sidebarRoutes = [
  "/dashboard",
  "/patients",
  "/courses",
  "/workflow",
  "/tasks",
  "/schedule",
  "/treatment-delivery",
  "/clinical-forms",
  "/treatment-planning",
  "/imaging",
  "/documents",
  "/billing",
  "/audit",
  "/analytics",
  "/users-roles",
  "/templates",
  "/settings",
  "/security-logs"
];

const dynamicExamples = [
  { route: "/patients/PHI-CR2401", file: "app/patients/[id]/page.tsx" },
  { route: "/patients/PHI-CR2401/carepath", file: "app/patients/[id]/carepath/page.tsx" },
  { route: "/patients/PHI-CR2401/documents", file: "app/patients/[id]/documents/page.tsx" },
  { route: "/patients/PHI-CR2401/fraction-log", file: "app/patients/[id]/fraction-log/page.tsx" }
];

function routeToPageFile(route) {
  const segments = route.split("/").filter(Boolean);
  return join(root, "app", ...segments, "page.tsx");
}

for (const route of sidebarRoutes) {
  const file = routeToPageFile(route);
  assert.ok(existsSync(file), `${route} must have ${file}`);
}

for (const example of dynamicExamples) {
  assert.ok(
    existsSync(join(root, example.file)),
    `${example.route} must resolve to ${example.file}`
  );
}

console.log(`Route smoke passed for ${sidebarRoutes.length + dynamicExamples.length} routes.`);
