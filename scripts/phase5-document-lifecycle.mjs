import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { lstat, mkdir, mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, parse, resolve } from "node:path";

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

const documentServicePath = "lib/server/document-lifecycle-service.ts";
const generatedDocumentRoutePath = "app/api/generated-documents/[id]/route.ts";
const igsrtRoutePath = "app/api/igsrt/route.ts";
const clinicalStorePath = "lib/clinical-store.ts";
const moduleDataPath = "lib/module-data.ts";
const typesPath = "lib/types.ts";
const rbacPath = "lib/rbac.ts";
const documentsPagePath = "app/(app)/documents/page.tsx";
const patientWorkspacePath = "components/patients/patient-workspace.tsx";
const packageJsonPath = "package.json";
const generatedDocumentStoragePath = "lib/server/generated-document-storage.ts";
const generatedDocumentOutputServicePath = "lib/server/generated-document-output-service.ts";
const generatedDocumentGenerationRoutePath = "app/api/documents/generate/route.ts";
const generatedDocumentDownloadRoutePath = "app/api/generated-document-outputs/[outputId]/download/route.ts";
const phiSchemaPath = "prisma/phi-schema.prisma";
const phiSqlPath = "prisma/phi-schema.sql";
const writeThroughPath = "lib/server/write-through.ts";
const hydrationPath = "lib/server/database-hydration.ts";

for (const path of [
  documentServicePath,
  generatedDocumentRoutePath,
  generatedDocumentStoragePath,
  generatedDocumentOutputServicePath,
  generatedDocumentGenerationRoutePath,
  generatedDocumentDownloadRoutePath
]) {
  assert.ok(existsSync(join(root, path)), `${path} must exist`);
}

const documentService = read(documentServicePath);
const generatedDocumentRoute = read(generatedDocumentRoutePath);
const igsrtRoute = read(igsrtRoutePath);
const clinicalStore = read(clinicalStorePath);
const moduleData = read(moduleDataPath);
const types = read(typesPath);
const rbac = read(rbacPath);
const documentsPage = read(documentsPagePath);
const patientWorkspace = read(patientWorkspacePath);
const packageJson = read(packageJsonPath);
const generatedDocumentOutputServiceSource = read(generatedDocumentOutputServicePath);
const generatedDocumentGenerationRoute = read(generatedDocumentGenerationRoutePath);
const generatedDocumentDownloadRoute = read(generatedDocumentDownloadRoutePath);
const phiSchema = read(phiSchemaPath);
const phiSql = read(phiSqlPath);
const writeThroughSource = read(writeThroughPath);
const hydrationSource = read(hydrationPath);

for (const expected of [
  'import "server-only"',
  "DocumentLifecycleRepository",
  "inMemoryDocumentLifecycleRepository",
  "activeTemplateBlocker",
  "exportGeneratedDocumentLifecycle",
  "confirmGeneratedDocumentEcwUploadLifecycle",
  "voidGeneratedDocumentOutputLifecycle",
  "recordGeneratedDocumentManualEditExceptionLifecycle"
]) {
  assertIncludes(documentService, expected, `document lifecycle service must include ${expected}`);
}

for (const expected of [
  "confirmGeneratedDocumentEcwUploadLifecycle",
  "recordGeneratedDocumentManualEditExceptionLifecycle",
  "pilotSessionFromRequest",
  "DocumentLifecycleResult"
]) {
  assertIncludes(generatedDocumentRoute, expected, `generated document route must include ${expected}`);
}

assertExcludes(igsrtRoute, "renderGeneratedDocument,", "IGSRT route must not import raw renderGeneratedDocument");
assertExcludes(igsrtRoute, "signGeneratedDocument,", "IGSRT route must not import raw signGeneratedDocument");
assertIncludes(igsrtRoute, "renderGeneratedDocumentLifecycle", "IGSRT route must use document lifecycle render");
assertIncludes(igsrtRoute, "signGeneratedDocumentLifecycle", "IGSRT route must use document lifecycle sign");

for (const expected of [
  "GeneratedDocumentFormat",
  "GeneratedDocumentStorageProvider",
  "DocumentLifecycleAction",
  "DocumentLifecycleDocumentDto",
  "DocumentLifecycleOutputDto",
  "storageUrl",
  "manualEditExceptionAt",
  "ecwUploadReference"
]) {
  assertIncludes(types, expected, `types must include ${expected}`);
}

for (const expected of [
  "document:export",
  "document:upload_ecw",
  "document:void",
  "document:manual_edit"
]) {
  assertIncludes(rbac, expected, `RBAC must include ${expected}`);
}

for (const expected of [
  "latestGeneratedDocumentOutput",
  "generatedDocumentOutputById",
  "exportGeneratedDocumentOutputById",
  "confirmGeneratedDocumentEcwUpload",
  "voidGeneratedDocumentOutput",
  "recordGeneratedDocumentManualEditException"
]) {
  assertIncludes(clinicalStore, expected, `clinical store must include ${expected}`);
}

assertExcludes(clinicalStore, "drive://generated", "generated outputs must not use fake drive:// URLs");
assertExcludes(clinicalStore, "app-storage://generated", "Generated document lifecycle must not mint fake app-storage URLs");
assertExcludes(clinicalStore, "Manual edit exception recorded. Regenerate", "Generated document lifecycle must not mint PHI preview text");
assertIncludes(moduleData, "?? \"APP_STORAGE\"", "document instances must default to app-owned storage");
assertIncludes(documentsPage, "redirect('/patients')", "Global Documents page must redirect into patient-first work");
assertIncludes(patientWorkspace, "record-closeout", "Patient workspace must own document lifecycle work");
assertIncludes(patientWorkspace, "latestOutputStatus", "Patient document table must show output lifecycle status");
assertIncludes(patientWorkspace, "manualEditExceptionAt", "Patient document table must show manual edit exceptions");
assertIncludes(patientWorkspace, "ecwUploadReference", "Patient document table must show eCW upload state");
assertIncludes(clinicalStore, "commitGeneratedDocumentOutput", "Clinical store must expose one canonical generated-output commit seam");
assertExcludes(generatedDocumentOutputServiceSource, "app-storage://", "Durable generation must not use fake app-storage URLs");
assertExcludes(generatedDocumentOutputServiceSource, "contentPreview", "Generation orchestration must not carry PHI preview text");
assertIncludes(generatedDocumentOutputServiceSource, "persistGeneratedDocumentOutputMutation", "Durable generation must use targeted exact-output persistence");
assertExcludes(generatedDocumentOutputServiceSource, "persistDocumentLifecycleMutation", "Durable generation must not bulk-persist every output version");
assertIncludes(generatedDocumentGenerationRoute, "export async function POST", "Generated document route must expose the strict POST contract");
assertIncludes(generatedDocumentGenerationRoute, "phiAccessFromRequest", "Generated document route must authenticate POST and legacy GET requests");
assertIncludes(generatedDocumentGenerationRoute, "requirePhiAction", "Generated document route must authorize document rendering");
assertExcludes(generatedDocumentGenerationRoute, "error.message", "Generated document route errors must not reflect internal details");

for (const expected of [
  "phiAccessFromRequest",
  "requirePhiAction",
  "document:export",
  "hydrateClinicalStoreFromDatabase",
  "generatedDocumentOutputById",
  "exportGeneratedDocumentOutputById",
  "readGeneratedDocumentBytes",
  "persistGeneratedDocumentOutputMutation",
  "Sec-Fetch-Site"
]) {
  assertIncludes(generatedDocumentDownloadRoute, expected, `Generated output download route must include ${expected}`);
}
for (const forbidden of [
  "latestGeneratedDocumentOutput",
  "storageProvider:",
  "storageKey:",
  "storageUrl:",
  "driveFileUrl:",
  "contentPreview:",
  "error.message"
]) {
  assertExcludes(generatedDocumentDownloadRoute, forbidden, `Generated output download route must exclude ${forbidden}`);
}

const persistedLifecycleFields = [
  "storageProvider",
  "storageKey",
  "renderedByUserId",
  "exportedAt",
  "exportedByUserId",
  "lockedAt",
  "lockedByUserId",
  "voidedAt",
  "voidedByUserId",
  "voidReason",
  "manualEditExceptionAt",
  "manualEditExceptionByUserId",
  "manualEditReason"
];
for (const expected of persistedLifecycleFields) {
  assert.ok(new RegExp(`\\b${expected}\\s+(?:DateTime|String)\\?`).test(phiSchema), `PHI schema must include nullable ${expected}`);
  assert.ok(new RegExp(`"${expected}" (?:TIMESTAMP\\(3\\)|TEXT)`).test(phiSql), `PHI bootstrap SQL must include nullable ${expected}`);
}
for (const expected of ["storageProvider String?", "storageKey      String?", "renderedByUserId String?"]) {
  assertIncludes(phiSchema, expected, `PHI schema must include nullable ${expected.split(" ")[0]}`);
}
assertIncludes(phiSchema, "@@unique([documentId, version])", "Generated output versions must be unique per document");
assertIncludes(phiSql, 'CREATE UNIQUE INDEX "GeneratedDocumentOutputPhi_documentId_version_key"', "PHI bootstrap SQL must enforce output-version uniqueness");
for (const expected of persistedLifecycleFields) {
  assertIncludes(writeThroughSource, `${expected}: output.${expected}`, `Generated output write-through must include ${expected}`);
  assertIncludes(hydrationSource, `${expected}: row.${expected}`, `Generated output hydration must include ${expected}`);
}
assertExcludes(writeThroughSource, "output.driveFileUrl ?? output.storageUrl", "Write-through must not treat app storage as a Drive URL");
assertIncludes(writeThroughSource, "persistGeneratedDocumentOutputMutation", "Write-through must expose a targeted output persistence seam");
assertIncludes(writeThroughSource, "compensateGeneratedDocumentOutput", "Targeted output persistence must compensate a partial cross-database write");
assertExcludes(writeThroughSource, "outputs.map((output) => upsertGeneratedDocumentOutput", "Document persistence must not bulk-upsert stale output versions");
assertIncludes(types, '"storageProvider" | "storageKey" | "storageUrl"', "Document lifecycle DTOs must omit document storage locators");
assertIncludes(types, '"driveFileUrl" | "contentPreview"', "Output lifecycle DTOs must omit storage and preview fields");

installTsHook();

const {
  confirmGeneratedDocumentEcwUploadLifecycle,
  exportGeneratedDocumentLifecycle,
  readGeneratedDocumentLifecycle,
  recordGeneratedDocumentManualEditExceptionLifecycle,
  renderGeneratedDocumentLifecycle,
  signGeneratedDocumentLifecycle,
  voidGeneratedDocumentOutputLifecycle
} = require(join(root, documentServicePath));
const {
  auditEvents,
  clinicalFormResponses,
  exportGeneratedDocumentOutputById,
  generatedDocumentOutputById,
  generatedDocuments,
  generatedDocumentOutputs,
  patients,
  treatmentCourses
} = require(join(root, clinicalStorePath));
const {
  GeneratedDocumentStorageError,
  isSafeGeneratedDocumentStorageRoot,
  readGeneratedDocumentBytes,
  removeGeneratedDocumentBytes,
  writeGeneratedDocumentBytes
} = require(join(root, generatedDocumentStoragePath));

const originalStorageDir = process.env.GENERATED_DOCUMENT_STORAGE_DIR;
const storageTestRoot = await mkdtemp(join(tmpdir(), "curerays-generated-documents-"));
const generatedStorageRoot = join(storageTestRoot, "generated");
process.env.GENERATED_DOCUMENT_STORAGE_DIR = generatedStorageRoot;

try {
  await mkdir(generatedStorageRoot, { recursive: true });
  const outsideRoot = join(storageTestRoot, "outside");
  await mkdir(outsideRoot);
  assert.equal(isSafeGeneratedDocumentStorageRoot(parse(generatedStorageRoot).root), false, "Storage must reject a filesystem root");
  assert.equal(isSafeGeneratedDocumentStorageRoot(generatedStorageRoot), true, "Storage must accept a scoped generated-output root");

  await symlink(outsideRoot, join(generatedStorageRoot, "linked"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(
    () => writeGeneratedDocumentBytes("linked/nested/escape.bin", Buffer.from("blocked")),
    GeneratedDocumentStorageError,
    "Storage must reject a nested symlink escape"
  );
  assert.equal(existsSync(join(outsideRoot, "nested")), false, "Rejected writes must not create directories through a symlink");

  for (const invalidKey of [
    "",
    ".",
    resolve(storageTestRoot, "absolute.bin"),
    "../escape.bin",
    "..\\escape.bin",
    "nested/../../escape.bin"
  ]) {
    await assert.rejects(
      () => writeGeneratedDocumentBytes(invalidKey, Buffer.from("blocked")),
      (error) => error instanceof GeneratedDocumentStorageError && !String(error.message).includes(storageTestRoot),
      `Storage must reject unsafe key ${JSON.stringify(invalidKey)} without exposing a path`
    );
  }

  await assert.rejects(
    () => writeGeneratedDocumentBytes("empty.bin", Buffer.alloc(0)),
    GeneratedDocumentStorageError,
    "Storage must reject empty generated output bytes"
  );

  const firstWriteResult = await writeGeneratedDocumentBytes("output.bin", Buffer.from("first"));
  assert.equal(firstWriteResult, undefined, "Storage writes must not return filesystem paths");
  assert.deepEqual(await readGeneratedDocumentBytes("output.bin"), Buffer.from("first"), "Contained reads must return the created bytes");
  await assert.rejects(
    () => writeGeneratedDocumentBytes("output.bin", Buffer.from("overwrite")),
    GeneratedDocumentStorageError,
    "Generated output writes must be create-only"
  );
  assert.deepEqual(await readGeneratedDocumentBytes("output.bin"), Buffer.from("first"), "Create-only failure must preserve the first bytes");
  if (process.platform !== "win32") {
    assert.equal((await lstat(join(generatedStorageRoot, "output.bin"))).mode & 0o777, 0o600, "Generated output files must use mode 0600");
  }

  await assert.rejects(
    () => writeGeneratedDocumentBytes("linked/escape.bin", Buffer.from("blocked")),
    GeneratedDocumentStorageError,
    "Storage must reject a symlink escape"
  );
  await writeFile(join(outsideRoot, "outside.bin"), Buffer.from("outside"));
  await assert.rejects(
    () => readGeneratedDocumentBytes("linked"),
    GeneratedDocumentStorageError,
    "Storage reads must reject a symlink escape"
  );
  await assert.rejects(
    () => removeGeneratedDocumentBytes("linked"),
    GeneratedDocumentStorageError,
    "Storage removes must reject a symlink escape"
  );
  assert.deepEqual(readFileSync(join(outsideRoot, "outside.bin")), Buffer.from("outside"), "Rejected symlink removal must preserve outside bytes");
  assert.deepEqual(await readdir(outsideRoot), ["outside.bin"], "Rejected symlink writes must not create bytes outside the storage root");

  assert.equal(await removeGeneratedDocumentBytes("output.bin"), true, "Contained remove must delete the selected generated output");
  await assert.rejects(
    () => readGeneratedDocumentBytes("output.bin"),
    GeneratedDocumentStorageError,
    "Removed output bytes must no longer be readable"
  );
} finally {
  if (originalStorageDir === undefined) delete process.env.GENERATED_DOCUMENT_STORAGE_DIR;
  else process.env.GENERATED_DOCUMENT_STORAGE_DIR = originalStorageDir;
  await rm(storageTestRoot, { recursive: true, force: true });
}

function accessFor(role) {
  return {
    role,
    userId: `PHASE5-${role}`,
    userName: `Phase 5 ${role}`,
    sessionId: "phase5-session",
    ipAddress: "phase5-ip",
    deviceId: "phase5-device",
    reason: "Phase 5 guardrail"
  };
}

const radOncAccess = accessFor("RAD_ONC");
const physicistAccess = accessFor("PHYSICIST");
const billingAccess = accessFor("BILLING");
const adminAccess = accessFor("ADMIN");

const writeThrough = require(join(root, writeThroughPath));
const originalPersistDocumentLifecycleMutation = writeThrough.persistDocumentLifecycleMutation;
const originalPersistGeneratedDocumentOutputMutation = writeThrough.persistGeneratedDocumentOutputMutation;
writeThrough.persistDocumentLifecycleMutation = async () => {};
writeThrough.persistGeneratedDocumentOutputMutation = async () => {};
const {
  GeneratedDocumentOutputServiceError,
  generateGeneratedDocumentOutput,
  missingRequiredFormFieldIds,
  parseGenerateDocumentRequest
} = require(join(root, generatedDocumentOutputServicePath));
const {
  documentRequirements,
  fieldMapForRequirement,
  templateSourceForRequirement
} = require(join(root, "lib/template-registry.ts"));
const { NextRequest } = require("next/server");
const generatedDocumentGenerationRouteHandlers = require(join(root, generatedDocumentGenerationRoutePath));

assert.deepEqual(
  parseGenerateDocumentRequest({ kind: "form", courseId: "COURSE-2401", requirementId: "REQ-SKIN-IGSRT-RX" }),
  { kind: "form", courseId: "COURSE-2401", requirementId: "REQ-SKIN-IGSRT-RX" },
  "Form generation requests must use the exact form union member"
);
assert.deepEqual(
  parseGenerateDocumentRequest({ kind: "fraction-log", courseId: "COURSE-2401" }),
  { kind: "fraction-log", courseId: "COURSE-2401" },
  "Fraction generation requests must use the exact fraction-log union member"
);
for (const invalidRequest of [
  null,
  [],
  {},
  { kind: "form", courseId: "COURSE-2401" },
  { kind: "form", courseId: " ", requirementId: "REQ-SKIN-IGSRT-RX" },
  { kind: "form", courseId: "COURSE-2401", requirementId: "REQ-SKIN-IGSRT-RX", extra: true },
  { kind: "fraction-log", courseId: "COURSE-2401", requirementId: "REQ-SKIN-IGSRT-FXLOG" },
  { kind: "pdf", courseId: "COURSE-2401" }
]) {
  assert.equal(parseGenerateDocumentRequest(invalidRequest), null, "Malformed generation requests must fail the strict union parser");
}

const requiredValueMap = {
  sections: [
    {
      fields: [
        { id: "count", kind: "number", required: true },
        { id: "confirmed", kind: "checkbox", required: true },
        { id: "label", kind: "text", required: true }
      ]
    }
  ]
};
assert.deepEqual(
  missingRequiredFormFieldIds(requiredValueMap, { count: 0, confirmed: false, label: "Saved" }),
  [],
  "Required validation must accept saved zero and false values"
);
assert.deepEqual(
  missingRequiredFormFieldIds(requiredValueMap, { count: 0, confirmed: false, label: "   " }),
  ["label"],
  "Required validation must reject blank saved strings"
);

const unauthorizedLegacyGet = await generatedDocumentGenerationRouteHandlers.GET(
  new NextRequest("http://localhost/api/documents/generate?kind=form&courseId=COURSE-2401&requirementId=REQ-SKIN-IGSRT-RX")
);
assert.equal(unauthorizedLegacyGet.status, 403, "Legacy generation GET must reject an unsigned request");
const unauthorizedPost = await generatedDocumentGenerationRouteHandlers.POST(
  new NextRequest("http://localhost/api/documents/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "fraction-log", courseId: "COURSE-2401" })
  })
);
assert.equal(unauthorizedPost.status, 403, "Durable generation POST must reject an unsigned request");

const originalOutputStorageDir = process.env.GENERATED_DOCUMENT_STORAGE_DIR;
const originalPersistenceMode = process.env.CURERAYS_PERSISTENCE_MODE;
const outputTestRoot = await mkdtemp(join(tmpdir(), "curerays-output-service-"));
process.env.GENERATED_DOCUMENT_STORAGE_DIR = join(outputTestRoot, "generated");
process.env.CURERAYS_PERSISTENCE_MODE = "prisma";

const course = treatmentCourses.find((item) => item.id === "COURSE-2401");
const patient = patients.find((item) => item.id === course?.patientId);
const formRequirement = documentRequirements.find((item) => item.id === "REQ-SKIN-IGSRT-RX");
const formFieldMap = formRequirement ? fieldMapForRequirement(formRequirement) : undefined;
const formSource = formRequirement ? templateSourceForRequirement(formRequirement) : undefined;
const formDocument = generatedDocuments.find(
  (item) => item.courseId === course?.id && (item.templateId === formRequirement?.id || item.name === formRequirement?.name)
);
assert.ok(course && patient && formRequirement && formFieldMap && formSource && formDocument, "Phase 5 generation fixtures must resolve");

const formResponse = {
  id: "FORM-PHASE5-DURABLE",
  patientId: patient.id,
  courseId: course.id,
  templateId: formFieldMap.id,
  requirementId: formRequirement.id,
  status: "IN_PROGRESS",
  responseData: {
    site: "Nasal bridge",
    laterality: "Midline",
    cumulativeDoseGy: 0,
    dosePerFractionCgy: 250,
    totalFractions: 20,
    energy: "50 kV"
  }
};
clinicalFormResponses.push(formResponse);

async function discardGeneratedOutput(result, documentSnapshot, outputCount, auditCount) {
  const storedOutput = generatedDocumentOutputs.find((output) => output.id === result.output.id);
  assert.ok(storedOutput?.storageKey, "Committed generated output must retain an opaque storage key server-side");
  await removeGeneratedDocumentBytes(storedOutput.storageKey);
  generatedDocumentOutputs.splice(0, generatedDocumentOutputs.length - outputCount);
  auditEvents.splice(0, auditEvents.length - auditCount);
  for (const key of Object.keys(formDocument)) delete formDocument[key];
  Object.assign(formDocument, documentSnapshot);
}

try {
  await assert.rejects(
    () => generateGeneratedDocumentOutput(billingAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "ACCESS_DENIED",
    "Generation orchestration must require document:render"
  );

  process.env.CURERAYS_PERSISTENCE_MODE = "memory";
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "PERSISTENCE_REQUIRED",
    "Durable generation must fail closed outside Prisma persistence mode"
  );
  assert.deepEqual(await readdir(outputTestRoot), [], "Persistence-mode rejection must happen before any storage write");
  process.env.CURERAYS_PERSISTENCE_MODE = "prisma";

  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: "COURSE-MISSING", requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "NOT_FOUND",
    "Generation must reject a missing course"
  );
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: "REQ-DUPUYTRENS-RX" }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "INAPPLICABLE",
    "Generation must reject an inapplicable form requirement"
  );

  const originalTemplateSourceId = formRequirement.templateSourceId;
  formRequirement.templateSourceId = undefined;
  try {
    await assert.rejects(
      () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
      (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "TEMPLATE_NOT_READY",
      "Generation must reject a requirement without a template source"
    );
  } finally {
    formRequirement.templateSourceId = originalTemplateSourceId;
  }

  const originalSourceStatus = formSource.status;
  formSource.status = "DRAFT";
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "TEMPLATE_NOT_READY",
    "Generation must reject an inactive template source"
  );
  formSource.status = originalSourceStatus;

  const originalApprovalStatus = formSource.approvalStatus;
  formSource.approvalStatus = "DRAFT_REVIEW";
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "TEMPLATE_NOT_READY",
    "Generation must reject a template without pilot approval"
  );
  formSource.approvalStatus = originalApprovalStatus;

  const originalPilotScope = formRequirement.pilotScope;
  formRequirement.pilotScope = "FUTURE_PLACEHOLDER";
  clinicalFormResponses.splice(clinicalFormResponses.indexOf(formResponse), 1);
  try {
    await assert.rejects(
      () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
      (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "TEMPLATE_NOT_READY",
      "Generation must use the registry's canonical pilot-readiness decision"
    );
  } finally {
    formRequirement.pilotScope = originalPilotScope;
    clinicalFormResponses.push(formResponse);
  }

  clinicalFormResponses.splice(clinicalFormResponses.indexOf(formResponse), 1);
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "SAVED_DATA_REQUIRED",
    "Generation must reject a form without saved structured data"
  );
  clinicalFormResponses.push(formResponse);

  formResponse.responseData.site = "   ";
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "MISSING_REQUIRED_FIELDS",
    "Generation must reject blank required saved strings"
  );
  formResponse.responseData.site = "Nasal bridge";

  const formDocumentSnapshot = structuredClone(formDocument);
  const formOutputCount = generatedDocumentOutputs.length;
  const formAuditCount = auditEvents.length;
  const generatedForm = await generateGeneratedDocumentOutput(radOncAccess, {
    kind: "form",
    courseId: course.id,
    requirementId: formRequirement.id
  });
  assert.deepEqual(
    Object.keys(generatedForm.output).sort(),
    ["documentId", "format", "id", "status", "version"],
    "Generation response output must contain only safe lifecycle fields"
  );
  assert.equal(generatedForm.output.format, "DOCX", "Form generation must persist DOCX output metadata");
  assert.equal(generatedForm.downloadUrl, `/api/generated-document-outputs/${generatedForm.output.id}/download`, "Generation must return an output-ID download URL");
  const storedFormOutput = generatedDocumentOutputs.find((output) => output.id === generatedForm.output.id);
  assert.ok(storedFormOutput?.storageKey, "Form generation must store an opaque key server-side");
  assert.match(storedFormOutput.storageKey, /^[0-9a-f-]+\.docx$/, "Form storage keys must be opaque UUID-based names");
  for (const forbidden of [patient.id, patient.firstName, patient.lastName, patient.mrn, formDocument.id]) {
    assert.equal(storedFormOutput.storageKey.includes(forbidden), false, "Form storage keys must not contain patient or document identifiers");
  }
  assert.equal(storedFormOutput.contentPreview, "", "Durable generated output metadata must not retain a PHI preview");
  assert.equal(storedFormOutput.storageProvider, "APP_STORAGE", "Durable generated output metadata must use APP_STORAGE");
  assert.equal(storedFormOutput.storageUrl, undefined, "Durable generated output metadata must not use fake storage URLs");
  assert.deepEqual((await readGeneratedDocumentBytes(storedFormOutput.storageKey)).subarray(0, 2), Buffer.from("PK"), "Persisted DOCX bytes must have an Open XML signature");
  await discardGeneratedOutput(generatedForm, formDocumentSnapshot, formOutputCount, formAuditCount);

  const fractionDocument = generatedDocuments.find(
    (item) => item.courseId === course.id && (item.templateId === "REQ-SKIN-IGSRT-FXLOG" || item.name === "IGSRT Fraction Log")
  );
  assert.ok(fractionDocument, "Applicable fraction-log document fixture must resolve");
  const fractionDocumentSnapshot = structuredClone(fractionDocument);
  const fractionOutputCount = generatedDocumentOutputs.length;
  const fractionAuditCount = auditEvents.length;
  const generatedFractionLog = await generateGeneratedDocumentOutput(radOncAccess, {
    kind: "fraction-log",
    courseId: course.id
  });
  assert.equal(generatedFractionLog.output.format, "XLSX", "Fraction generation must resolve an applicable XLSX requirement");
  const storedFractionOutput = generatedDocumentOutputs.find((output) => output.id === generatedFractionLog.output.id);
  assert.ok(storedFractionOutput?.storageKey, "Fraction generation must persist an opaque storage key");
  assert.match(storedFractionOutput.storageKey, /^[0-9a-f-]+\.xlsx$/, "Fraction storage keys must be opaque UUID-based names");
  assert.deepEqual((await readGeneratedDocumentBytes(storedFractionOutput.storageKey)).subarray(0, 2), Buffer.from("PK"), "Persisted XLSX bytes must have an Open XML signature");
  const storedFractionKey = storedFractionOutput.storageKey;
  await removeGeneratedDocumentBytes(storedFractionKey);
  generatedDocumentOutputs.splice(0, generatedDocumentOutputs.length - fractionOutputCount);
  auditEvents.splice(0, auditEvents.length - fractionAuditCount);
  for (const key of Object.keys(fractionDocument)) delete fractionDocument[key];
  Object.assign(fractionDocument, fractionDocumentSnapshot);

  await writeGeneratedDocumentBytes("sentinel.bin", Buffer.from("keep"));
  const filesBeforeMetadataFailure = await readdir(process.env.GENERATED_DOCUMENT_STORAGE_DIR);
  const failedDocumentSnapshot = structuredClone(formDocument);
  const failedOutputCount = generatedDocumentOutputs.length;
  const failedAuditCount = auditEvents.length;
  writeThrough.persistGeneratedDocumentOutputMutation = async () => {
    throw new Error("database path and patient details must stay private");
  };
  await assert.rejects(
    () => generateGeneratedDocumentOutput(radOncAccess, { kind: "form", courseId: course.id, requirementId: formRequirement.id }),
    (error) => error instanceof GeneratedDocumentOutputServiceError && error.code === "METADATA_WRITE_FAILED" && !String(error.message).includes("database"),
    "Metadata failure must surface a generic PHI-safe generation error"
  );
  assert.deepEqual(await readdir(process.env.GENERATED_DOCUMENT_STORAGE_DIR), filesBeforeMetadataFailure, "Metadata failure must delete only the newly created storage key");
  assert.deepEqual(await readGeneratedDocumentBytes("sentinel.bin"), Buffer.from("keep"), "Metadata cleanup must preserve unrelated stored bytes");
  assert.equal(generatedDocumentOutputs.length, failedOutputCount, "Metadata failure must roll back the in-memory generated output");
  assert.equal(auditEvents.length, failedAuditCount, "Metadata failure must roll back its audit event");
  assert.deepEqual(formDocument, failedDocumentSnapshot, "Metadata failure must restore the generated document lifecycle row");
  await removeGeneratedDocumentBytes("sentinel.bin");
} finally {
  writeThrough.persistDocumentLifecycleMutation = originalPersistDocumentLifecycleMutation;
  writeThrough.persistGeneratedDocumentOutputMutation = originalPersistGeneratedDocumentOutputMutation;
  const responseIndex = clinicalFormResponses.indexOf(formResponse);
  if (responseIndex >= 0) clinicalFormResponses.splice(responseIndex, 1);
  if (originalOutputStorageDir === undefined) delete process.env.GENERATED_DOCUMENT_STORAGE_DIR;
  else process.env.GENERATED_DOCUMENT_STORAGE_DIR = originalOutputStorageDir;
  if (originalPersistenceMode === undefined) delete process.env.CURERAYS_PERSISTENCE_MODE;
  else process.env.CURERAYS_PERSISTENCE_MODE = originalPersistenceMode;
  await rm(outputTestRoot, { recursive: true, force: true });
}

const readResult = readGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX");
assert.ok(readResult.document, "Authorized document read must return safe document metadata");
assert.equal("patientId" in readResult.document, false, "Document lifecycle DTO must not expose patientId");
assert.equal("courseId" in readResult.document, false, "Document lifecycle DTO must not expose courseId");

await assert.rejects(
  () => renderGeneratedDocumentLifecycle(billingAccess, "DOC-2401-RX", "PDF"),
  /PHI access denied/,
  "Billing cannot render PHI document output"
);

generatedDocuments.push({
  id: "DOC-PHASE5-BLOCKED-PREAUTH",
  templateId: "REQ-SKIN-PREAUTH-20FX",
  patientId: "CR-2401",
  courseId: "COURSE-2401",
  name: "Carepath PreAuth Audit - 20fx",
  clinicalPhase: "CONSULTATION",
  responsibleParty: "ADMIN",
  status: "MISSING_FIELDS",
  requiredAction: "Mapping deferred for guardrail",
  assignedTo: "ADMIN",
  lastUpdatedAt: new Date().toISOString(),
  signReviewState: "REVIEW_REQUIRED",
  auditReady: false
});

const blockedMapping = await renderGeneratedDocumentLifecycle(radOncAccess, "DOC-PHASE5-BLOCKED-PREAUTH", "PDF");
assert.match(
  blockedMapping.blockedReason ?? "",
  /MAPPING_IN_PROGRESS/,
  "Mapping-in-progress template sources must block generation"
);

const rendered = await renderGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX", "PDF");
assert.ok(rendered.output, "Render must return safe output metadata");
assert.equal("contentPreview" in rendered.output, false, "Lifecycle output DTO must not expose contentPreview");
assert.equal(rendered.output.storageProvider, "APP_STORAGE", "Rendered output must use APP_STORAGE");
assert.match(rendered.output.storageUrl ?? "", /^app-storage:\/\/generated\//, "Rendered output must use app-storage URL");

const exported = await exportGeneratedDocumentLifecycle(physicistAccess, "DOC-2401-RX");
assert.equal(exported.output?.status, "EXPORTED", "Export command must mark output exported");
assert.ok(exported.auditEvent?.redacted, "Export audit event must be redacted");

const signed = await signGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX");
assert.equal(signed.document?.signReviewState, "SIGNED", "Sign command must close signature state");
assert.ok(signed.document?.lockedAt, "Sign command must lock the document");
assert.equal(signed.output?.status, "LOCKED", "Sign command must lock the current output");

const exportLocked = await exportGeneratedDocumentLifecycle(physicistAccess, "DOC-2401-RX");
assert.match(
  exportLocked.blockedReason ?? "",
  /locked/,
  "Locked signature evidence must not be exported again"
);
assert.equal(exportLocked.output?.status, "LOCKED", "Blocked export must preserve locked output status");

const uploaded = await confirmGeneratedDocumentEcwUploadLifecycle(billingAccess, "DOC-2401-RX", {
  externalReference: "ECW-MANUAL-2401-RX",
  reason: "Manual upload confirmed by billing queue"
});
assert.ok(uploaded.document?.uploadedToEcwAt, "Billing must be able to confirm manual eCW upload");
assert.equal(uploaded.document?.ecwUploadReference, "ECW-MANUAL-2401-RX", "eCW confirmation must store reference");

const manualEdit = await recordGeneratedDocumentManualEditExceptionLifecycle(adminAccess, "DOC-2401-RX", {
  reason: "Provider corrected signed output outside the app"
});
assert.equal(manualEdit.document?.signReviewState, "REVIEW_REQUIRED", "Manual edit must reopen signature review");
assert.equal(manualEdit.document?.uploadedToEcwAt, undefined, "Manual edit must clear downstream eCW readiness");
assert.equal(manualEdit.output?.status, "DRAFT", "Manual edit must create a draft follow-up output version");

const rerendered = await renderGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX", "PDF");
assert.equal(rerendered.output?.status, "READY", "Document can be regenerated after manual edit exception");
assert.ok(
  (rerendered.output?.version ?? 0) > (rendered.output?.version ?? 0),
  "Regenerated output must increment version"
);

const voided = await voidGeneratedDocumentOutputLifecycle(adminAccess, "DOC-2401-RX", {
  reason: "Superseded by corrected version"
});
assert.equal(voided.output?.status, "VOIDED", "Void command must void latest output");
assert.equal(voided.document?.status, "BLOCKED", "Voided document must require follow-up");

for (const output of generatedDocumentOutputs) {
  assert.equal(
    String(output.driveFileUrl ?? output.storageUrl ?? "").includes("drive://"),
    false,
    "Generated output storage references must not use drive://"
  );
}

assertIncludes(packageJson, '"test:phase5"', "package.json must expose npm run test:phase5");
assertIncludes(packageJson, "npm run test:phase5", "npm run test:guardrails must include Phase 5 guardrails");

console.log("Phase 5 document lifecycle guardrails passed");
