import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message);
}

function assertExcludes(source, forbidden, message) {
  assert.equal(source.includes(forbidden), false, message);
}

function assertBefore(source, earlier, later, message) {
  const earlierIndex = source.indexOf(earlier);
  const laterIndex = source.indexOf(later);

  assert.ok(earlierIndex >= 0, `${message}: missing ${earlier}`);
  assert.ok(laterIndex >= 0, `${message}: missing ${later}`);
  assert.ok(earlierIndex < laterIndex, message);
}

const servicePath = "lib/server/patient-registration-service.ts";
assert.ok(existsSync(join(root, servicePath)), "Phase 2 patient registration service must exist");

const service = read(servicePath);
const patientRoute = read("app/api/patients/route.ts");
const patientIdRoute = read("app/api/patients/[id]/route.ts");
const clinicalStore = read("lib/clinical-store.ts");
const types = read("lib/types.ts");
const opsSchema = read("prisma/ops-schema.prisma");
const phiSchema = read("prisma/phi-schema.prisma");
const packageJson = read("package.json");

for (const expected of [
  'import "server-only"',
  "export type PatientRegistrationRepository",
  "export const inMemoryPatientRegistrationRepository",
  "export const prismaReadyPatientRegistrationRepository",
  "export function selectPatientRegistrationRepository",
  "export function registerPatient",
  "export function updatePatientRecord",
  "export function listOperationalPatientRecords",
  "patientMutationContextFromRequest"
]) {
  assertIncludes(service, expected, `${servicePath} must contain ${expected}`);
}

assertIncludes(service, "process.env.CURERAYS_PATIENT_REPOSITORY", "Patient repository must be selectable by env flag");
assertIncludes(service, "process.env.CURERAYS_PERSISTENCE_MODE", "Patient repository must honor persistence mode env flag");
assertIncludes(service, "Persistent patient repository is not configured.", "Prisma-ready adapter must fail safe until configured");

assertIncludes(patientRoute, "listOperationalPatientRecords", "GET /api/patients must use tokenized service list");
assertIncludes(patientRoute, "registerPatient", "POST /api/patients must use registration service");
assertIncludes(patientRoute, "patientMutationContextFromRequest", "POST /api/patients must build mutation actor context");
assertIncludes(patientIdRoute, "updatePatientRecord", "PATCH /api/patients/[id] must use registration service");
assertIncludes(patientIdRoute, "patientMutationContextFromRequest", "PATCH /api/patients/[id] must build mutation actor context");
assertIncludes(patientIdRoute, "findPatientPhi", "GET /api/patients/[id] remains explicit PHI read");
assertIncludes(patientIdRoute, "PHI access denied", "PHI read route must keep a safe denied response");

for (const forbidden of [
  "import { createPatient",
  "import { updatePatient",
  "validatePatientCreateInput",
  "validatePatientUpdateInput"
]) {
  assertExcludes(patientRoute, forbidden, `Patient collection API must not call clinical-store ${forbidden} directly`);
  assertExcludes(patientIdRoute, forbidden, `Patient detail API must not call clinical-store ${forbidden} directly`);
}

assertBefore(
  service,
  "const validation = repository.validateCreate(input);",
  "repository.createPatientTransaction(input as PatientCreateInput, context)",
  "Create validation must happen before mutation"
);
assertBefore(
  service,
  "const validation = repository.validateUpdate(patientRefOrId, input);",
  "repository.updatePatientTransaction(patientRefOrId, input as PatientUpdateInput, context)",
  "Update validation must happen before mutation"
);

for (const expected of [
  "patients: patients.length",
  "treatmentCourses: treatmentCourses.length",
  "generatedDocuments: generatedDocuments.length",
  "carepathTasks: carepathTasks.length",
  "auditEvents: auditEvents.length",
  "patients.length = checkpoint.patients",
  "treatmentCourses.length = checkpoint.treatmentCourses",
  "generatedDocuments.length = checkpoint.generatedDocuments",
  "carepathTasks.length = checkpoint.carepathTasks",
  "auditEvents.length = checkpoint.auditEvents"
]) {
  assertIncludes(clinicalStore, expected, `In-memory registration transaction must rollback ${expected}`);
}

for (const expected of [
  "ensureRequirementDocuments(patients, treatmentCourses, generatedDocuments)",
  "ensureRequirementTasks(patients, treatmentCourses, carepathTasks)",
  "generatedDocuments.some((document) => document.courseId === course.id)",
  "carepathTasks.some((task) => task.courseId === course.id)",
  "MRN must be unique."
]) {
  assertIncludes(clinicalStore, expected, `Patient registration post-condition must include ${expected}`);
}

for (const expected of [
  "data: toOperationalPatient(patient)",
  "course: course ? toOperationalCourse(course) : undefined",
  "auditEvent: redactAuditEvent(auditEvent)",
  "phiBoundary"
]) {
  assertIncludes(clinicalStore, expected, `Mutation responses must stay operational/redacted via ${expected}`);
}

for (const expected of [
  "role?: PrototypeAccessRole",
  "sessionId?: string",
  "ipAddress?: string",
  "deviceId?: string"
]) {
  assertIncludes(types, expected, `AuditEvent must include actor metadata field ${expected}`);
}

for (const schema of [opsSchema, phiSchema]) {
  for (const expected of ["role", "sessionId", "ipAddress", "deviceId"]) {
    assert.ok(
      new RegExp(`\\b${expected}\\s+String\\?`).test(schema),
      `Prisma audit schemas must include ${expected}`
    );
  }
}

assertIncludes(packageJson, '"test:phase2"', "package.json must expose npm run test:phase2");
assertIncludes(packageJson, "npm run test:phase2", "npm run verify must include Phase 2 guardrails");

console.log("Phase 2 patient registration guardrails passed");
