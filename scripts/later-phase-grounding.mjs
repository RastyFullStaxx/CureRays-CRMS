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

const workflowServicePath = "lib/server/workflow-command-service.ts";
const documentServicePath = "lib/server/document-lifecycle-service.ts";
const closeoutServicePath = "lib/server/closeout-readiness-service.ts";
const documentRoutePath = "app/api/generated-documents/[id]/route.ts";
const typesSource = read("lib/types.ts");
const hipaaGuardrail = read("scripts/hipaa-guardrails.mjs");
const packageJson = read("package.json");

for (const path of [workflowServicePath, documentServicePath, closeoutServicePath]) {
  assert.ok(existsSync(join(root, path)), `${path} must exist`);
  assertIncludes(read(path), 'import "server-only"', `${path} must remain server-only`);
}

for (const expected of [
  "export type WorkflowCommandResult",
  "export type DocumentLifecycleResult",
  "export type CloseoutReadiness"
]) {
  assertIncludes(typesSource, expected, `types must include ${expected}`);
}

for (const expected of [
  "evaluateWorkflowCommand",
  "markWorkflowStepNotApplicable",
  "Workflow advancement blocked",
  "N/A reason"
]) {
  assertIncludes(read(workflowServicePath), expected, `workflow command service must include ${expected}`);
}

for (const expected of [
  "readGeneratedDocumentLifecycle",
  "renderGeneratedDocumentLifecycle",
  "signGeneratedDocumentLifecycle",
  "requirePhiAction"
]) {
  assertIncludes(read(documentServicePath), expected, `document lifecycle service must include ${expected}`);
}

for (const expected of [
  "evaluateCloseoutReadiness",
  "missingEvidence",
  "Final Carepath audit sign"
]) {
  assertIncludes(read(closeoutServicePath), expected, `closeout readiness service must include ${expected}`);
}

const documentRoute = read(documentRoutePath);
assertIncludes(documentRoute, "readGeneratedDocumentLifecycle", "Document GET must use document lifecycle service");
assertIncludes(documentRoute, "phiAccessFromRequest", "Document GET/POST must require PHI access");
assertExcludes(documentRoute, "@/lib/clinical-store", "Document route must not import clinical-store directly");

for (const expected of [
  "runtimeImportEdges",
  "transitiveClientForbiddenFiles",
  "rawPhiClientPattern",
  "contentPreview"
]) {
  assertIncludes(hipaaGuardrail, expected, `HIPAA guardrail must include ${expected}`);
}

installTsHook();

const {
  documentRequirements,
  templateSources,
  workflowDefinitions
} = require(join(root, "lib/template-registry.ts"));
const {
  evaluateWorkflowCommand,
  markWorkflowStepNotApplicable
} = require(join(root, workflowServicePath));
const {
  readGeneratedDocumentLifecycle
} = require(join(root, documentServicePath));
const {
  evaluateCloseoutReadiness
} = require(join(root, closeoutServicePath));

const templateSourceIds = new Set();
for (const source of templateSources) {
  assert.equal(templateSourceIds.has(source.id), false, `Duplicate template source id: ${source.id}`);
  templateSourceIds.add(source.id);
  assert.ok(["ACTIVE", "DRAFT", "RETIRED", "MISSING", "MAPPING_IN_PROGRESS"].includes(source.status), `${source.id} has explicit status`);

  if (source.status !== "MISSING" && source.sourceFileName.startsWith("docs/")) {
    assert.ok(existsSync(join(root, source.sourceFileName)), `${source.id} source file must exist: ${source.sourceFileName}`);
  }
}

const requirementIds = new Set();
const expectedMissingRequirementIds = new Set(["REQ-BILLING-PREAUTH-MAPPING"]);

for (const requirement of documentRequirements) {
  assert.equal(requirementIds.has(requirement.id), false, `Duplicate document requirement id: ${requirement.id}`);
  requirementIds.add(requirement.id);
  assert.ok(requirement.requiredFields.length > 0, `${requirement.id} must list required fields`);
  assert.ok(requirement.outputFormats.length > 0, `${requirement.id} must list output formats`);
  assert.ok(requirement.templateSourceId, `${requirement.id} must point to a template source`);
  assert.ok(templateSourceIds.has(requirement.templateSourceId), `${requirement.id} must point to a known template source`);

  const source = templateSources.find((item) => item.id === requirement.templateSourceId);
  if (source.status === "MISSING") {
    assert.ok(expectedMissingRequirementIds.has(requirement.id), `${requirement.id} is an unapproved missing template requirement`);
    assert.equal(requirement.createsTask, false, `${requirement.id} missing template must not create task automatically`);
    assert.equal(requirement.autoCreate, false, `${requirement.id} missing template must not auto-create`);
  }
}

for (const workflow of workflowDefinitions) {
  for (const requirementId of workflow.documentRequirementIds) {
    assert.ok(requirementIds.has(requirementId), `${workflow.id} references unknown requirement ${requirementId}`);
  }
}

const missingWorkflow = evaluateWorkflowCommand("CREF-NOT-FOUND");
assert.equal(missingWorkflow.allowed, false, "Missing workflow command must not be allowed");
assert.equal(missingWorkflow.status, "NOT_FOUND", "Missing workflow command must be reported as not found");

const missingNa = markWorkflowStepNotApplicable("WF-NOT-FOUND", "");
assert.equal(missingNa.allowed, false, "Missing workflow step N/A command must not be allowed");

const documentRead = readGeneratedDocumentLifecycle({ role: "RAD_ONC", reason: "Later-phase grounding guardrail" }, "DOC-2401-SIM");
assert.ok(documentRead.document, "Authorized document lifecycle read should return a document");
assert.equal(documentRead.phiBoundary.includes("guarded PHI routes"), true, "Document lifecycle read must name the PHI boundary");

const closeout = evaluateCloseoutReadiness("COURSE-2401");
assert.equal(closeout.ready, false, "Prototype course closeout should still report blockers");
assert.ok(closeout.blockers.length > 0, "Prototype closeout readiness must expose blockers");
assert.ok(closeout.requiredActions.length > 0, "Prototype closeout readiness must expose required actions");

assertIncludes(packageJson, '"test:later-phases"', "package.json must expose later-phase guardrail");
assertIncludes(packageJson, "npm run test:later-phases", "npm run verify must include later-phase guardrail");

console.log("Later-phase grounding guardrails passed");
