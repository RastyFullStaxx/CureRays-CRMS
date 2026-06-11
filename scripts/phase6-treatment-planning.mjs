import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message);
}

const serverServicePath = "lib/server/phase6-treatment-workflow-service.ts";
assert.ok(existsSync(join(root, serverServicePath)), "Phase 6 server workflow service must exist");

const serverService = read(serverServicePath);
const apiRoute = read("app/api/igsrt/route.ts");
const clinicalStore = read("lib/clinical-store.ts");
const fractionService = read("lib/services/fraction-worksheet-service.ts");
const types = read("lib/types.ts");
const packageJson = read("package.json");
const mainSchema = read("prisma/schema.prisma");
const phiSchema = read("prisma/phi-schema.prisma");
const treatmentPlanningPage = read("app/treatment-planning/page.tsx");
const patientWorkspace = read("components/patients/patient-workspace.tsx");
const worksheetPanel = read("components/fraction-worksheet-panel.tsx");
const routeSmoke = read("scripts/route-smoke.mjs");

for (const expected of [
  'import "server-only"',
  "createFractionSchedule",
  "attachFractionImage",
  "completePhysicsCheck",
  "completeOtvCheck",
  "approveFractionRow",
  "voidFractionRow"
]) {
  assertIncludes(serverService, expected, `${serverServicePath} must expose ${expected}`);
}

for (const expected of [
  "generateFractionSchedule",
  "linkFractionImage",
  "recordPhysicsCheck",
  "recordOtvCheck",
  "createFractionSchedule(access",
  "attachFractionImage(access",
  "completePhysicsCheck(access",
  "completeOtvCheck(access"
]) {
  assertIncludes(apiRoute, expected, `/api/igsrt must route ${expected}`);
}

for (const expected of [
  "export const treatmentFractions",
  "generateTreatmentFractionSchedule",
  "linkFractionImage",
  "recordPhysicsCheck",
  "recordOtvCheck",
  "assertFractionImagingGate",
  "resetDownstreamRowsAfterCorrection",
  "getPhase6PlanningReadiness",
  "getPhase6GateStatuses",
  "TREATMENT_FRACTION"
]) {
  assertIncludes(clinicalStore, expected, `clinical-store must include ${expected}`);
}

for (const expected of [
  "clinicalValidationRequired: true",
  "fractionWorksheetReferenceVersion",
  "recalculateFractionWorksheetEntries",
  "lowerVoidedEntries"
]) {
  assertIncludes(fractionService, expected, `fraction worksheet service must include ${expected}`);
}

for (const expected of [
  "type Phase6PlanningReadiness",
  "type Phase6GateStatus",
  "treatmentFractions: TreatmentFraction[]",
  "imageGuidanceStatus",
  "physicsCheckRequired",
  "otvRequired"
]) {
  assertIncludes(types, expected, `Phase 6 types must include ${expected}`);
}

for (const schema of [mainSchema, phiSchema]) {
  for (const expected of [
    "model TreatmentFraction",
    "imageGuidanceStatus",
    "calculationReferenceVersion",
    "calculationClinicalValidationRequired",
    "revisionRequestedAt",
    "voidedAt",
    "correctedAt"
  ]) {
    assertIncludes(schema, expected, `Prisma schema must include ${expected}`);
  }
}

for (const expected of [
  "getPhase6PlanningReadiness",
  "getPhase6GateStatuses",
  "Phase6PlanningActions",
  "Worksheet"
]) {
  assertIncludes(treatmentPlanningPage, expected, `Treatment planning page must render ${expected}`);
}

for (const expected of [
  "Phase 6 Readiness",
  "Clinical Validation Required",
  "missingImageFractions",
  "physicsDueFractions",
  "otvDueFractions"
]) {
  assertIncludes(patientWorkspace, expected, `Patient planning tab must render ${expected}`);
}

for (const expected of [
  "scheduledFractions",
  "linkFractionImage",
  "Image missing",
  "IMG {missingImageCount}",
  "Link imaging evidence before DOT approval"
]) {
  assertIncludes(worksheetPanel, expected, `Fraction worksheet panel must include ${expected}`);
}

for (const expected of [
  '"/treatment-planning"',
  '"/treatment-delivery"',
  '"/treatment-delivery/fraction-logs"',
  '"/patients/PHI-CR2401/fraction-log"'
]) {
  assertIncludes(routeSmoke, expected, `Route smoke must cover ${expected}`);
}

assertIncludes(packageJson, '"test:phase6"', "package.json must expose npm run test:phase6");
assertIncludes(packageJson, "npm run test:phase6", "npm run verify must include Phase 6 guardrails");

console.log("Phase 6 treatment planning guardrails passed");
