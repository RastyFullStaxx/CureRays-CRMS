import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import ts from "typescript";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const opsSchema = read("prisma/ops-schema.prisma");
const phiSchema = read("prisma/phi-schema.prisma");
const clinicalStore = read("lib/clinical-store.ts");
const globalPageData = read("lib/global-page-data.ts");

for (const forbidden of ["firstName", "lastName", "mrn", "contentPreview", "PatientPhi"]) {
  assert.equal(
    opsSchema.includes(forbidden),
    false,
    `OPS schema must not contain PHI-bearing field/model: ${forbidden}`
  );
}

for (const expected of ["model PatientPhi", "model TreatmentCoursePhi", "contentPreview", "PHI_DATABASE_URL"]) {
  assert.ok(phiSchema.includes(expected), `PHI schema must contain ${expected}`);
}

assert.equal(
  /previousValue\s*=\s*JSON\.stringify|newValue:\s*JSON\.stringify/.test(clinicalStore),
  false,
  "Audit logging must not store raw JSON before/after values in the operational path"
);

const operationalPages = [
  "app/page.tsx",
  "app/dashboard/page.tsx",
  "app/patients/page.tsx",
  "app/records/page.tsx",
  "app/upcoming/page.tsx",
  "app/on-treatment/page.tsx",
  "app/post/page.tsx",
  "app/reports/page.tsx",
  "app/analytics/page.tsx"
];

for (const page of operationalPages) {
  const source = read(page);
  assert.equal(
    /import\s+\{[^}]*\bpatients\b[^}]*\}\s+from\s+"@\/lib\/clinical-store"/s.test(source),
    false,
    `${page} must use operationalPatients(), not PHI-bearing patients`
  );
}

const clientForbiddenModules = [
  "@/lib/mock-data",
  "@/lib/server/phi-store"
];
const transitiveClientForbiddenFiles = [
  "lib/clinical-store.ts",
  "lib/mock-data.ts",
  "lib/server/phi-store.ts",
  "lib/server/patient-phi-formatting.ts"
];
const prototypePhiClientAllowlist = new Set([
  "components/patients/patient-registry-client.tsx",
  "components/patients/patient-workspace.tsx"
]);
const rawPhiClientPattern = /\b(firstName|lastName|mrn|contentPreview)\b/;

function listSourceFiles(directory) {
  return readdirSync(join(root, directory)).flatMap((name) => {
    const relative = `${directory}/${name}`;
    const absolute = join(root, relative);
    if (statSync(absolute).isDirectory()) {
      return listSourceFiles(relative);
    }

    return /\.(tsx|ts)$/.test(name) ? [relative] : [];
  });
}

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

const sourceFiles = [...listSourceFiles("app"), ...listSourceFiles("components"), ...listSourceFiles("lib")];
const sourceFileSet = new Set(sourceFiles.map(normalizePath));

function resolveLocalImport(fromFile, specifier) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) {
    return null;
  }

  const base = specifier.startsWith("@/")
    ? join(root, specifier.slice(2))
    : join(root, dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx")
  ];

  for (const candidate of candidates) {
    const relativePath = normalizePath(relative(root, candidate));
    if (sourceFileSet.has(relativePath)) {
      return relativePath;
    }
  }

  return null;
}

function runtimeImportEdges(file) {
  const source = read(file);
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edges = [];

  function visit(node) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
      const resolved = resolveLocalImport(file, node.moduleSpecifier.text);
      if (resolved) {
        edges.push(resolved);
      }
    }

    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const resolved = resolveLocalImport(file, node.moduleSpecifier.text);
      if (resolved) {
        edges.push(resolved);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(tree);
  return edges;
}

const clientFiles = sourceFiles
  .filter((file) => file.startsWith("app/") || file.startsWith("components/"))
  .filter((file) => read(file).trimStart().startsWith("'use client'") || read(file).trimStart().startsWith('"use client"'));

function clientImportGraphViolations() {
  const forbidden = new Set(transitiveClientForbiddenFiles);
  const violations = [];

  for (const entrypoint of clientFiles) {
    const seen = new Set();
    const stack = [entrypoint];

    while (stack.length > 0) {
      const file = stack.pop();
      if (!file || seen.has(file)) {
        continue;
      }

      seen.add(file);

      if (forbidden.has(file) || file.startsWith("lib/server/")) {
        violations.push(`${entrypoint} -> ${file}`);
        continue;
      }

      for (const edge of runtimeImportEdges(file)) {
        stack.push(edge);
      }
    }
  }

  return violations.sort();
}

const transitiveViolations = clientImportGraphViolations();

assert.deepEqual(
  transitiveViolations,
  [],
  `Client entrypoints must not transitively import PHI/server modules: ${transitiveViolations.join(", ")}`
);

const rawPhiClientViolations = clientFiles
  .filter((file) => !prototypePhiClientAllowlist.has(file))
  .filter((file) => rawPhiClientPattern.test(read(file)));

assert.deepEqual(
  rawPhiClientViolations,
  [],
  `Client files must not introduce raw patient fields or generated content previews: ${rawPhiClientViolations.join(", ")}`
);

for (const file of clientFiles) {
  const source = read(file);
  for (const forbiddenModule of clientForbiddenModules) {
    assert.equal(
      source.includes(forbiddenModule),
      false,
      `${file} must not import PHI-bearing module ${forbiddenModule}`
    );
  }

  assert.equal(
    /import\s+\{[^}]*\bpatients\b[^}]*\}\s+from\s+["']@\/lib\/clinical-store["']/s.test(source),
    false,
    `${file} must not import raw patients from clinical-store`
  );
}

assert.equal(
  /patientName\s*\(|\.mrn\b|\bfirstName\b|\blastName\b/.test(globalPageData),
  false,
  "global-page-data must expose tokenized patient labels only"
);

for (const clientEntry of [
  "components/dashboard/dashboard-telemetry-client.tsx",
  "components/workflow/workflow-command-client.tsx",
  "components/tasks/task-queue-client.tsx"
]) {
  const source = read(clientEntry);
  assert.equal(
    source.includes("@/lib/clinical-store"),
    false,
    `${clientEntry} must receive tokenized telemetry props, not import clinical-store`
  );
}

for (const route of ["app/api/patients/[id]/route.ts", "app/api/igsrt/route.ts", "app/api/generated-documents/[id]/route.ts"]) {
  const source = read(route);
  assert.ok(source.includes("PHI access denied"), `${route} must return 403 for unauthorized PHI access`);
}

assert.ok(
  /getOperationalWorkflowSnapshot|listWorkflowCommandSnapshot/.test(read("app/api/workflow/route.ts")),
  "Workflow API must return the tokenized operational snapshot"
);

for (const route of [
  "app/api/tasks/route.ts",
  "app/api/tasks/[taskId]/route.ts",
  "app/api/workflow/courses/[courseId]/advance/route.ts",
  "app/api/workflow/steps/[stepId]/route.ts"
]) {
  const source = read(route);
  assert.equal(source.includes("@/lib/clinical-store"), false, `${route} must use workflow command services, not clinical-store directly`);
  assert.ok(source.includes("workflow-command-service"), `${route} must route through the workflow command service`);
}

console.log("HIPAA guardrails passed");
