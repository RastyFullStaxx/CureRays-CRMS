import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const opsSchema = read("prisma/ops-schema.prisma");
const phiSchema = read("prisma/phi-schema.prisma");
const clinicalStore = read("lib/clinical-store.ts");

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

for (const route of ["app/api/patients/[id]/route.ts", "app/api/igsrt/route.ts", "app/api/generated-documents/[id]/route.ts"]) {
  const source = read(route);
  assert.ok(source.includes("PHI access denied"), `${route} must return 403 for unauthorized PHI access`);
}

assert.ok(
  read("app/api/workflow/route.ts").includes("getOperationalWorkflowSnapshot"),
  "Workflow API must return the tokenized operational snapshot"
);

console.log("HIPAA guardrails passed");
