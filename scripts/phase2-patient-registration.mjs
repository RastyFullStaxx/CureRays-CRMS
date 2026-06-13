import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const require = createRequire(import.meta.url);
const Module = require("node:module");
const ts = require("typescript");
const read = (path) => readFileSync(join(root, path), "utf8");

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message);
}

function assertExcludes(source, forbidden, message) {
  assert.equal(source.includes(forbidden), false, message);
}

function installTsHook() {
  const originalResolve = Module._resolveFilename;
  const originalLoad = Module._load;

  Module._load = function load(request, parent, isMain) {
    return request === "server-only" ? {} : originalLoad.call(this, request, parent, isMain);
  };

  Module._resolveFilename = function resolve(request, parent, isMain, options) {
    if (request.startsWith("@/")) {
      const mapped = join(root, request.slice(2));
      for (const candidate of [mapped, `${mapped}.ts`, `${mapped}.tsx`, join(mapped, "index.ts")]) {
        if (existsSync(candidate)) return candidate;
      }
    }
    return originalResolve.call(this, request, parent, isMain, options);
  };

  for (const extension of [".ts", ".tsx"]) {
    Module._extensions[extension] = function compile(module, filename) {
      const output = ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: {
          esModuleInterop: true,
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020
        },
        fileName: filename
      });
      module._compile(output.outputText, filename);
    };
  }
}

const servicePath = "lib/server/patient-registration-service.ts";
assert.ok(existsSync(join(root, servicePath)), "Phase 2 patient registration service must exist");

const serviceSource = read(servicePath);
const patientRoute = read("app/api/patients/route.ts");
const patientIdRoute = read("app/api/patients/[id]/route.ts");
const historyRoute = read("app/api/patients/[id]/history/route.ts");
const lifecycleRoute = read("app/api/patients/[id]/lifecycle/route.ts");
const clinicalStore = read("lib/clinical-store.ts");
const types = read("lib/types.ts");
const opsSchema = read("prisma/ops-schema.prisma");
const phiSchema = read("prisma/phi-schema.prisma");
const packageJson = read("package.json");

for (const expected of [
  'import "server-only"',
  "export type PatientRegistrationRepository",
  "export const inMemoryPatientRegistrationRepository",
  "export const prismaPatientRegistrationRepository",
  "export async function registerPatient",
  "export async function updatePatientRecord",
  "export async function listOperationalPatientRecords",
  "export async function getPatientEditRecord",
  "export async function listPatientRecordHistoryEntries",
  "export async function updatePatientLifecycleRecord",
  "patientMutationContextFromRequest"
]) {
  assertIncludes(serviceSource, expected, `${servicePath} must contain ${expected}`);
}

for (const expected of [
  "process.env.CURERAYS_PATIENT_REPOSITORY",
  "process.env.CURERAYS_PERSISTENCE_MODE",
  "loadPrismaClient",
  "persistMutationResult"
]) {
  assertIncludes(serviceSource, expected, `Repository service must include ${expected}`);
}

assertIncludes(patientRoute, "await listOperationalPatientRecords", "GET /api/patients must await tokenized service list");
assertIncludes(patientRoute, "await registerPatient", "POST /api/patients must await registration service");
assertIncludes(patientIdRoute, "getPatientEditRecord", "GET /api/patients/[id] must use edit DTO service");
assertIncludes(patientIdRoute, "await updatePatientRecord", "PATCH /api/patients/[id] must use registration service");
assertIncludes(historyRoute, "listPatientRecordHistoryEntries", "History route must use redacted history service");
assertIncludes(lifecycleRoute, "updatePatientLifecycleRecord", "Lifecycle route must use lifecycle service");
assertExcludes(patientIdRoute, "findPatientPhi", "Patient detail route must not return raw Patient PHI directly");

for (const forbidden of ["import { createPatient", "import { updatePatient", "validatePatientCreateInput"]) {
  assertExcludes(patientRoute, forbidden, `Patient collection API must not call clinical-store ${forbidden} directly`);
  assertExcludes(patientIdRoute, forbidden, `Patient detail API must not call clinical-store ${forbidden} directly`);
}

for (const expected of [
  "patientCourseWorkflowSteps: patientCourseWorkflowSteps.length",
  "patientCourseAuditChecks: patientCourseAuditChecks.length",
  "courseFolderPlaceholders: courseFolderPlaceholders.length",
  "patientRecordHistory: patientRecordHistory.length",
  "selectWorkflowDefinition",
  "createWorkflowStepsForCourse",
  "createAuditChecksForCourse",
  "createFolderPlaceholderForCourse",
  "addPatientRecordHistory",
  "Patient record was updated by another session.",
  "changeReason is required."
]) {
  assertIncludes(clinicalStore, expected, `Patient registration bundle must include ${expected}`);
}

for (const expected of [
  "InitialCourseCreateInput",
  "PatientRegistrationInput",
  "PatientEditDto",
  "PatientLifecycleUpdateInput",
  "PatientRecordHistoryEntry",
  "CourseFolderPlaceholder"
]) {
  assertIncludes(types, expected, `Phase 2 type contract must include ${expected}`);
}
assertIncludes(types, "mrn?: string", "PatientCreateInput.mrn must stay optional for EMR-owned external MRN policy");

for (const expected of [
  "model OperationalWorkflowStep",
  "model OperationalAuditCheck",
  "model CourseFolderPlaceholder",
  "model PatientRecordHistory",
  "workflowDefinitionId",
  "bodyRegion",
  "laterality"
]) {
  assertIncludes(opsSchema, expected, `OPS schema must include ${expected}`);
}

for (const expected of ["workflowDefinitionId", "bodyRegion", "laterality", "coursePhase"]) {
  assertIncludes(phiSchema, expected, `PHI course schema must include ${expected}`);
}
assertIncludes(phiSchema, "mrn              String?", "PHI patient schema must allow missing external MRN");

assertIncludes(packageJson, '"@prisma/client"', "package.json must include Prisma client runtime dependency");
assertIncludes(packageJson, '"prisma:generate:ops"', "package.json must expose OPS Prisma generation");
assertIncludes(packageJson, '"prisma:generate:phi"', "package.json must expose PHI Prisma generation");
assertIncludes(packageJson, "npm run test:phase2", "npm run verify must include Phase 2 guardrails");

installTsHook();

const service = require(join(root, servicePath));
const store = require(join(root, "lib/clinical-store.ts"));

function fakeRequest(headers = {}) {
  const normalized = new Map(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)]));
  return {
    headers: {
      get(name) {
        return normalized.get(String(name).toLowerCase()) ?? null;
      }
    }
  };
}

function context(action, reason, role = "RAD_ONC") {
  return service.patientMutationContextFromRequest(fakeRequest({ "x-curerays-role": role }), action, reason);
}

function registrationInput(suffix, diagnosisCategory = "SKIN_CANCER", initialCourse = {}) {
  return {
    firstName: `Phase${suffix}`,
    lastName: "Patient",
    mrn: `PHASE2-${suffix}`,
    diagnosis: diagnosisCategory === "ARTHRITIS" ? "Right hand arthritis" : diagnosisCategory === "DUPUYTRENS" ? "Left palm Dupuytren's" : "Right cheek skin cancer",
    diagnosisCategory,
    location: "Main Campus",
    physician: "Dr. Phase Two",
    assignedStaff: "RAD_ONC",
    chartRoundsPhase: "UPCOMING",
    status: "ACTIVE",
    nextAction: "Create treatment course",
    notes: "Phase 2 route/service integration fixture.",
    initialCourse: {
      protocol: diagnosisCategory === "ARTHRITIS" ? "Joint" : diagnosisCategory === "DUPUYTRENS" ? "Dupuytren's" : "IGSRT",
      bodyRegion: diagnosisCategory === "ARTHRITIS" ? "HAND" : "SITE",
      laterality: "RIGHT",
      treatmentModality: diagnosisCategory === "SKIN_CANCER" ? "IGSRT" : "Orthovoltage",
      totalFractions: diagnosisCategory === "SKIN_CANCER" ? 20 : 10,
      startDate: "2026-06-12",
      ...initialCourse
    }
  };
}

function bundleCounts() {
  return {
    patients: store.patients.length,
    treatmentCourses: store.treatmentCourses.length,
    generatedDocuments: store.generatedDocuments.length,
    carepathTasks: store.carepathTasks.length,
    workflowSteps: store.patientCourseWorkflowSteps.length,
    auditChecks: store.patientCourseAuditChecks.length,
    folders: store.courseFolderPlaceholders.length,
    history: store.patientRecordHistory.length
  };
}

const createContext = context("phi:create", "Phase 2 test create");
assert.ok(createContext, "RAD_ONC should be able to create patient records in prototype mode");
assert.equal(context("phi:update", "Denied", "BILLING"), null, "BILLING must not receive PHI mutation context");

const created = await service.registerPatient(registrationInput("SKIN"), createContext);
assert.equal(created.ok, true, "Skin registration should succeed");
assert.equal(created.status, 201, "Skin registration should return 201");
assert.equal(created.body.bundle.workflowDefinitionId, "WF-SKIN-IGSRT", "Skin IGSRT workflow should be selected");
assert.ok(created.body.bundle.workflowStepCount >= 15, "Create bundle should include workflow steps");
assert.ok(created.body.bundle.taskCount >= 1, "Create bundle should include tasks");
assert.ok(created.body.bundle.documentCount >= 1, "Create bundle should include documents");
assert.ok(created.body.bundle.auditCheckCount >= 1, "Create bundle should include audit checks");
assert.ok(created.body.bundle.folderPlaceholderCount >= 1, "Create bundle should include folder placeholders");

const listed = await service.listOperationalPatientRecords();
assert.equal(listed.ok, true, "Operational list should succeed");
assert.ok(listed.body.patients.some((patient) => patient.patientRef === created.body.data.patientRef), "Operational list should include created patient");

const noMrnInput = registrationInput("NO-MRN");
delete noMrnInput.mrn;
const noMrn = await service.registerPatient(noMrnInput, createContext);
assert.equal(noMrn.ok, true, "Registration without external MRN should succeed");
assert.ok(noMrn.body.data.patientRef, "Registration without external MRN should still return a CRMS patient reference");

const readContext = context("phi:read", "Phase 2 read");
const editDto = await service.getPatientEditRecord(created.body.data.phiRecordId, readContext);
assert.equal(editDto.ok, true, "Guarded edit DTO read should succeed");
assert.ok(editDto.body.patient.lastUpdatedAt, "Edit DTO should expose lastUpdatedAt for concurrency");

const noReason = await service.updatePatientRecord(
  created.body.data.phiRecordId,
  { physician: "Dr. Missing Reason", expectedLastUpdatedAt: editDto.body.patient.lastUpdatedAt },
  context("phi:update", "Missing reason")
);
assert.equal(noReason.ok, false, "Update without changeReason should fail");
assert.equal(noReason.status, 400, "Update without changeReason should return 400");

const conflict = await service.updatePatientRecord(
  created.body.data.phiRecordId,
  { physician: "Dr. Conflict", expectedLastUpdatedAt: "1900-01-01T00:00:00.000Z", changeReason: "Testing stale edit rejection." },
  context("phi:update", "Testing stale edit rejection")
);
assert.equal(conflict.ok, false, "Stale update should fail");
assert.equal(conflict.status, 409, "Stale update should return 409");

const updated = await service.updatePatientRecord(
  created.body.data.phiRecordId,
  { physician: "Dr. Updated", expectedLastUpdatedAt: editDto.body.patient.lastUpdatedAt, changeReason: "Testing guarded correction history." },
  context("phi:update", "Testing guarded correction history")
);
assert.equal(updated.ok, true, "Guarded update should succeed");

const history = await service.listPatientRecordHistoryEntries(created.body.data.phiRecordId, readContext);
assert.equal(history.ok, true, "History route service should succeed");
assert.ok(history.body.history.length >= 2, "History should include create and correction entries");
assert.ok(history.body.history.every((entry) => entry.previousValue === "PHI_REDACTED" || entry.previousValue === "NONE"), "History must stay redacted");
assert.ok(history.body.history.every((entry) => entry.reason), "History entries must include a reason");

const lifecycle = await service.updatePatientLifecycleRecord(
  created.body.data.phiRecordId,
  { courseStatus: "COMPLETED", coursePhase: "AUDIT", expectedLastUpdatedAt: updated.body.data.lastUpdatedAt, changeReason: "Testing course-level completion." },
  context("phi:update", "Testing course-level completion")
);
assert.equal(lifecycle.ok, true, "Lifecycle update should succeed");
assert.equal(lifecycle.body.course.status, "COMPLETED", "Completion should be modeled on the course");

const duplicateCounts = bundleCounts();
const duplicate = await service.registerPatient(registrationInput("SKIN"), createContext);
assert.equal(duplicate.ok, false, "Duplicate external MRN should fail");
assert.equal(duplicate.status, 400, "Duplicate external MRN should return 400");
assert.deepEqual(bundleCounts(), duplicateCounts, "Duplicate external MRN must not leave a partial bundle");

const arthritis = await service.registerPatient(registrationInput("ARTH-HAND", "ARTHRITIS", { bodyRegion: "HAND", protocol: "Joint" }), createContext);
assert.equal(arthritis.ok, true, "Arthritis registration should succeed");
assert.equal(arthritis.body.bundle.workflowDefinitionId, "WF-ARTHRITIS", "Arthritis workflow should be selected");
assert.ok(
  store.generatedDocuments.some((document) => document.courseId === arthritis.body.course.id && document.name.toLowerCase().includes("hand")),
  "Arthritis hand bundle should create hand-specific requirements"
);

const dupuytrens = await service.registerPatient(registrationInput("DUP", "DUPUYTRENS", { protocol: "Dupuytren's", bodyRegion: "HAND" }), createContext);
assert.equal(dupuytrens.ok, true, "Dupuytren's registration should succeed");
assert.equal(dupuytrens.body.bundle.workflowDefinitionId, "WF-DUPUYTRENS", "Dupuytren's workflow should be selected");

const fallback = await service.registerPatient(registrationInput("FALLBACK", "SKIN_CANCER", { protocol: "Universal", treatmentModality: "Unknown modality" }), createContext);
assert.equal(fallback.ok, true, "Fallback registration should succeed");
assert.equal(fallback.body.bundle.workflowDefinitionId, "WF-UNIVERSAL", "Unknown protocol should fall back to universal workflow");

console.log("Phase 2 patient registration guardrails passed");
