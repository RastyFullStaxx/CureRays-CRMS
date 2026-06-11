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

const documentServicePath = "lib/server/document-lifecycle-service.ts";
const generatedDocumentRoutePath = "app/api/generated-documents/[id]/route.ts";
const igsrtRoutePath = "app/api/igsrt/route.ts";
const clinicalStorePath = "lib/clinical-store.ts";
const moduleDataPath = "lib/module-data.ts";
const typesPath = "lib/types.ts";
const rbacPath = "lib/rbac.ts";
const documentsPagePath = "app/documents/page.tsx";
const workspaceTabsPath = "components/patients/workspace-tabs/patient-workspace-tabs.tsx";
const packageJsonPath = "package.json";

for (const path of [documentServicePath, generatedDocumentRoutePath]) {
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
const workspaceTabs = read(workspaceTabsPath);
const packageJson = read(packageJsonPath);

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
  "prototypeSessionFromRequest",
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
  "app-storage://generated",
  "latestGeneratedDocumentOutput",
  "exportGeneratedDocumentOutput",
  "confirmGeneratedDocumentEcwUpload",
  "voidGeneratedDocumentOutput",
  "recordGeneratedDocumentManualEditException"
]) {
  assertIncludes(clinicalStore, expected, `clinical store must include ${expected}`);
}

assertExcludes(clinicalStore, "drive://generated", "generated outputs must not use fake drive:// URLs");
assertIncludes(moduleData, "?? \"APP_STORAGE\"", "document instances must default to app-owned storage");
assertIncludes(documentsPage, "patientToken", "Documents page must use tokenized patient labels in client rows");
assertIncludes(documentsPage, "latestOutputStatus", "Documents page must show output lifecycle status");
assertIncludes(workspaceTabs, "manualEditExceptionAt", "Workspace document tab must show manual edit exceptions");

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
  generatedDocuments,
  generatedDocumentOutputs
} = require(join(root, clinicalStorePath));

const radOncAccess = { role: "RAD_ONC", reason: "Phase 5 guardrail" };
const physicistAccess = { role: "PHYSICIST", reason: "Phase 5 guardrail" };
const billingAccess = { role: "BILLING", reason: "Phase 5 guardrail" };
const adminAccess = { role: "ADMIN", reason: "Phase 5 guardrail" };

const readResult = readGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX");
assert.ok(readResult.document, "Authorized document read must return safe document metadata");
assert.equal("patientId" in readResult.document, false, "Document lifecycle DTO must not expose patientId");
assert.equal("courseId" in readResult.document, false, "Document lifecycle DTO must not expose courseId");

assert.throws(
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

const blockedMapping = renderGeneratedDocumentLifecycle(radOncAccess, "DOC-PHASE5-BLOCKED-PREAUTH", "PDF");
assert.match(
  blockedMapping.blockedReason ?? "",
  /MAPPING_IN_PROGRESS/,
  "Mapping-in-progress template sources must block generation"
);

const rendered = renderGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX", "PDF");
assert.ok(rendered.output, "Render must return safe output metadata");
assert.equal("contentPreview" in rendered.output, false, "Lifecycle output DTO must not expose contentPreview");
assert.equal(rendered.output.storageProvider, "APP_STORAGE", "Rendered output must use APP_STORAGE");
assert.match(rendered.output.storageUrl ?? "", /^app-storage:\/\/generated\//, "Rendered output must use app-storage URL");

const exported = exportGeneratedDocumentLifecycle(physicistAccess, "DOC-2401-RX");
assert.equal(exported.output?.status, "EXPORTED", "Export command must mark output exported");
assert.ok(exported.auditEvent?.redacted, "Export audit event must be redacted");

const signed = signGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX");
assert.equal(signed.document?.signReviewState, "SIGNED", "Sign command must close signature state");
assert.ok(signed.document?.lockedAt, "Sign command must lock the document");
assert.equal(signed.output?.status, "LOCKED", "Sign command must lock the current output");

const exportLocked = exportGeneratedDocumentLifecycle(physicistAccess, "DOC-2401-RX");
assert.match(
  exportLocked.blockedReason ?? "",
  /locked/,
  "Locked signature evidence must not be exported again"
);
assert.equal(exportLocked.output?.status, "LOCKED", "Blocked export must preserve locked output status");

const uploaded = confirmGeneratedDocumentEcwUploadLifecycle(billingAccess, "DOC-2401-RX", {
  externalReference: "ECW-MANUAL-2401-RX",
  reason: "Manual upload confirmed by billing queue"
});
assert.ok(uploaded.document?.uploadedToEcwAt, "Billing must be able to confirm manual eCW upload");
assert.equal(uploaded.document?.ecwUploadReference, "ECW-MANUAL-2401-RX", "eCW confirmation must store reference");

const manualEdit = recordGeneratedDocumentManualEditExceptionLifecycle(adminAccess, "DOC-2401-RX", {
  reason: "Provider corrected signed output outside the app"
});
assert.equal(manualEdit.document?.signReviewState, "REVIEW_REQUIRED", "Manual edit must reopen signature review");
assert.equal(manualEdit.document?.uploadedToEcwAt, undefined, "Manual edit must clear downstream eCW readiness");
assert.equal(manualEdit.output?.status, "DRAFT", "Manual edit must create a draft follow-up output version");

const rerendered = renderGeneratedDocumentLifecycle(radOncAccess, "DOC-2401-RX", "PDF");
assert.equal(rerendered.output?.status, "READY", "Document can be regenerated after manual edit exception");
assert.ok(
  (rerendered.output?.version ?? 0) > (rendered.output?.version ?? 0),
  "Regenerated output must increment version"
);

const voided = voidGeneratedDocumentOutputLifecycle(adminAccess, "DOC-2401-RX", {
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
assertIncludes(packageJson, "npm run test:phase5", "npm run verify must include Phase 5 guardrails");

console.log("Phase 5 document lifecycle guardrails passed");
