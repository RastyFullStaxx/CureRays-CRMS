import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");

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
const progressTracker = read("docs/curerays-system-progress-tracker.md");

for (const expected of [
  'import "server-only"',
  "createFractionSchedule",
  "attachFractionImage",
  "completePhysicsCheck",
  "completeOtvCheck",
  "approveFractionRow",
  "requestFractionRowRevision",
  "requireClinicalMutation(access);\n  return approveFractionLogEntry",
  "requireClinicalMutation(access);\n  return requestFractionRevision",
  "voidFractionRow"
]) {
  assertIncludes(serverService, expected, `${serverServicePath} must expose ${expected}`);
}

const mutateActions = apiRoute.match(/const mutateActions = new Set\(\[([\s\S]*?)\]\);/)?.[1] ?? "";
for (const expected of [
  '"approveFraction"',
  '"requestFractionRevision"',
  '"generateFractionSchedule"',
  '"linkFractionImage"',
  '"recordPhysicsCheck"',
  '"recordOtvCheck"'
]) {
  assertIncludes(mutateActions, expected, `/api/igsrt mutateActions must authorize ${expected}`);
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
  "assertUniqueActiveFractionNumber",
  "resetDownstreamRowsAfterCorrection",
  "getPhase6PlanningReadiness",
  "getPhase6ClinicalValidationChecklist",
  "phase6ClinicalValidationChecklistTemplate",
  "getPhase6GateStatuses",
  "TREATMENT_FRACTION"
]) {
  assertIncludes(clinicalStore, expected, `clinical-store must include ${expected}`);
}

for (const expected of [
  "clinicalValidationRequired: true",
  "fractionWorksheetReferenceVersion",
  "Manual isodose override must be greater than 0 and no more than 100.",
  "firstEntryCumulativeDelta",
  "recalculateFractionWorksheetEntries",
  "lowerVoidedEntries"
]) {
  assertIncludes(fractionService, expected, `fraction worksheet service must include ${expected}`);
}

for (const expected of [
  "type Phase6PlanningReadiness",
  "type Phase6ClinicalValidationChecklist",
  "clinicalValidationChecklist: Phase6ClinicalValidationChecklist",
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
  "Phase 6 Clinical Sign-Off Checklist",
  "clinicalValidationChecklist.referenceVersion",
  "Phase6PlanningActions",
  "Worksheet"
]) {
  assertIncludes(treatmentPlanningPage, expected, `Treatment planning page must render ${expected}`);
}

for (const expected of [
  "Phase 6 Readiness",
  "Clinical Validation Required",
  "Clinical Sign-Off Gate",
  "clinicalValidationChecklist.referenceVersion",
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
  "Record Next Fraction",
  "Fraction Details",
  "Link imaging evidence before DOT approval"
]) {
  assertIncludes(worksheetPanel, expected, `Fraction worksheet panel must include ${expected}`);
}

for (const expected of [
  '"/treatment-planning"',
  '"/treatment-delivery"',
  '"/treatment-delivery/fraction-logs"'
]) {
  assertIncludes(routeSmoke, expected, `Route smoke must cover ${expected}`);
}

assertIncludes(patientWorkspace, "initialTab", "Patient workspace must support direct tab selection");
assertIncludes(patientWorkspace, "FractionWorksheetPanel", "Patient workspace Fractions tab must host the worksheet workflow");
assertIncludes(patientWorkspace, "Course Signals", "Patient workspace must expose course signals through the floating action");

assertIncludes(packageJson, '"test:phase6"', "package.json must expose npm run test:phase6");
assertIncludes(packageJson, "npm run test:phase6", "npm run verify must include Phase 6 guardrails");
assertIncludes(progressTracker, "Current completion: 100% for de-identified pilot/code-owned scope", "Progress tracker must record Phase 6 pilot-scope completion");
assertIncludes(progressTracker, "formal clinical validation remains a production blocker", "Progress tracker must not imply production clinical validation is complete");

console.log("Phase 6 treatment planning guardrails passed");
