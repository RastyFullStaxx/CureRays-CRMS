import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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

const clientFiles = [...listSourceFiles("app"), ...listSourceFiles("components")]
  .filter((file) => read(file).trimStart().startsWith("'use client'") || read(file).trimStart().startsWith('"use client"'));

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

for (const clientEntry of ["components/dashboard/dashboard-telemetry-client.tsx"]) {
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
  read("app/api/workflow/route.ts").includes("getOperationalWorkflowSnapshot"),
  "Workflow API must return the tokenized operational snapshot"
);

console.log("HIPAA guardrails passed");
