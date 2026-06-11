import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

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

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
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
      for (const candidate of [mapped, `${mapped}.ts`, `${mapped}.tsx`, `${mapped}.json`, join(mapped, "index.ts")]) {
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
          resolveJsonModule: true,
          target: ts.ScriptTarget.ES2020
        },
        fileName: filename
      });
      module._compile(output.outputText, filename);
    };
  }
}

function assertUnique(items, label) {
  const ids = new Set();
  for (const item of items) {
    assert.equal(ids.has(item.id), false, `Duplicate ${label} id: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

function sha256(relativePath) {
  return createHash("sha256").update(readFileSync(join(root, relativePath))).digest("hex");
}

function assertApplicable({
  label,
  patient,
  course,
  includes,
  excludes,
  applicableDocumentRequirements
}) {
  const ids = new Set(applicableDocumentRequirements(patient, course).map((requirement) => requirement.id));
  for (const requirementId of includes) {
    assert.ok(ids.has(requirementId), `${label} must include ${requirementId}`);
  }
  for (const requirementId of excludes) {
    assert.equal(ids.has(requirementId), false, `${label} must exclude ${requirementId}`);
  }
}

const registrySource = read("lib/template-registry.ts");
const typesSource = read("lib/types.ts");
const packageJson = read("package.json");
const registryJson = JSON.parse(read("lib/template-registry-data.json"));

assertIncludes(registrySource, "template-registry-data.json", "template-registry.ts must load canonical JSON");
assertExcludes(registrySource, "export const templateSources: TemplateSource[] = [", "template sources must not be hardcoded in TypeScript");
assertExcludes(registrySource, "export const documentRequirements: DocumentRequirement[] = [", "document requirements must not be hardcoded in TypeScript");
assertExcludes(registrySource, "export const workflowDefinitions: WorkflowDefinition[] = [", "workflow definitions must not be hardcoded in TypeScript");

for (const expectedType of [
  "export type TemplateFieldMap",
  "export type TemplateRegistryData",
  "export type TemplateRequirementReadiness",
  "TemplateSourceApprovalStatus",
  "TemplateCptRelevance"
]) {
  assertIncludes(typesSource, expectedType, `types must include ${expectedType}`);
}

assert.equal(registryJson.schemaVersion, "phase4-template-registry-v1", "registry JSON must use the Phase 4 schema version");
assert.ok(Array.isArray(registryJson.templateSources), "registry JSON must include template sources");
assert.ok(Array.isArray(registryJson.documentRequirements), "registry JSON must include document requirements");
assert.ok(Array.isArray(registryJson.workflowDefinitions), "registry JSON must include workflow definitions");
assert.ok(Array.isArray(registryJson.templateFieldMaps), "registry JSON must include field maps");
assert.ok(Array.isArray(registryJson.templateRegistryPlaceholders), "registry JSON must include placeholders");

installTsHook();

const registry = require(join(root, "lib/template-registry.ts"));
const { verifyTemplateSourceHashes } = require(join(root, "lib/server/template-registry-verification.ts"));

assert.equal(registry.templateSources.length, registryJson.templateSources.length, "loader source count must match JSON");
assert.equal(registry.documentRequirements.length, registryJson.documentRequirements.length, "loader requirement count must match JSON");
assert.equal(registry.workflowDefinitions.length, registryJson.workflowDefinitions.length, "loader workflow count must match JSON");
assert.equal(registry.templateFieldMaps.length, registryJson.templateFieldMaps.length, "loader field-map count must match JSON");

const sourceIds = assertUnique(registry.templateSources, "template source");
const requirementIds = assertUnique(registry.documentRequirements, "document requirement");
const workflowIds = assertUnique(registry.workflowDefinitions, "workflow definition");
const fieldMapIds = assertUnique(registry.templateFieldMaps, "template field map");
assert.ok(workflowIds.has("WF-SKIN-IGSRT"), "Skin IGSRT workflow must remain registered");

const expectedMissingSourceIds = new Set(["SRC-BILLING-PREAUTH-MISSING"]);
const expectedDeferredRequirementIds = new Set([
  "REQ-BILLING-PREAUTH-MAPPING",
  "REQ-SKIN-PREAUTH-20FX",
  "REQ-SKIN-PREAUTH-30FX"
]);

for (const source of registry.templateSources) {
  assert.ok(["ACTIVE", "DRAFT", "RETIRED", "MISSING", "MAPPING_IN_PROGRESS"].includes(source.status), `${source.id} has explicit status`);
  assert.ok(source.version, `${source.id} must carry a registry version`);
  assert.ok(source.approvalStatus, `${source.id} must carry approval status`);

  if (source.status === "MISSING") {
    assert.ok(expectedMissingSourceIds.has(source.id), `${source.id} is an unapproved missing template source`);
    continue;
  }

  if (source.sourceFileName.startsWith("docs/")) {
    assert.ok(existsSync(join(root, source.sourceFileName)), `${source.id} source file must exist`);
    assert.ok(source.sourceSha256, `${source.id} must record source SHA-256`);
    assert.equal(sha256(source.sourceFileName), source.sourceSha256, `${source.id} source hash must match normalized file`);
  }
}

const fieldMapsByRequirement = new Map(registry.templateFieldMaps.map((fieldMap) => [fieldMap.requirementId, fieldMap]));

for (const requirement of registry.documentRequirements) {
  assert.ok(requirement.workflowPhase, `${requirement.id} must include workflow phase`);
  assert.ok(requirement.responsibleParty, `${requirement.id} must include responsible role`);
  assert.ok(requirement.reviewerRole, `${requirement.id} must include reviewer role`);
  assert.ok(requirement.applicability?.diagnosis, `${requirement.id} must include diagnosis applicability`);
  assert.ok(requirement.applicability?.laterality, `${requirement.id} must include laterality applicability`);
  assert.ok(requirement.requiredFields.length > 0, `${requirement.id} must list required fields`);
  assert.ok(requirement.outputFormats.length > 0, `${requirement.id} must list output formats`);
  assert.ok(requirement.cptRelevance, `${requirement.id} must include CPT relevance`);
  assert.ok(requirement.templateSourceId, `${requirement.id} must point to a template source`);
  assert.ok(sourceIds.has(requirement.templateSourceId), `${requirement.id} must point to a known source`);

  const readiness = registry.readinessForRequirement(requirement);
  if (requirement.pilotScope === "DEFERRED") {
    assert.ok(expectedDeferredRequirementIds.has(requirement.id), `${requirement.id} is an unapproved Phase 4 deferral`);
    assert.equal(requirement.createsTask, false, `${requirement.id} deferred requirement must not create tasks automatically`);
    assert.equal(requirement.autoCreate, false, `${requirement.id} deferred requirement must not auto-create`);
    continue;
  }

  assert.equal(requirement.pilotScope, "IN_SCOPE", `${requirement.id} must be in pilot scope or explicitly deferred`);
  assert.ok(requirement.fieldMapId, `${requirement.id} must point to a field map`);
  assert.ok(fieldMapIds.has(requirement.fieldMapId), `${requirement.id} must point to a known field map`);
  assert.equal(readiness.readyForPilot, true, `${requirement.id} must be ready for Phase 4 pilot scope`);

  const fieldMap = fieldMapsByRequirement.get(requirement.id);
  assert.ok(fieldMap, `${requirement.id} must have a field map`);
  assert.equal(fieldMap.status, "COMPLETE", `${requirement.id} field map must be complete`);

  const fieldLabels = new Set(fieldMap.sections.flatMap((section) => section.fields.map((field) => normalize(field.label))));
  for (const requiredField of requirement.requiredFields) {
    assert.ok(fieldLabels.has(normalize(requiredField)), `${requirement.id} field map must include ${requiredField}`);
  }
}

for (const workflow of registry.workflowDefinitions) {
  for (const requirementId of workflow.documentRequirementIds) {
    assert.ok(requirementIds.has(requirementId), `${workflow.id} references unknown requirement ${requirementId}`);
  }
}

const futurePlaceholderSourceIds = new Set(
  registry.templateRegistryPlaceholders
    .filter((placeholder) => placeholder.disposition === "FUTURE_PLACEHOLDER")
    .map((placeholder) => placeholder.sourceId)
);

for (const requirement of registry.documentRequirements) {
  assert.equal(
    futurePlaceholderSourceIds.has(requirement.templateSourceId),
    false,
    `${requirement.id} must not require a future-placeholder source`
  );
}

const hashSummary = verifyTemplateSourceHashes();
assert.equal(hashSummary.mismatched, 0, "template source hash verification must have zero mismatches");
assert.equal(hashSummary.missing, 0, "template source hash verification must have zero missing files");

const baseCourse = {
  id: "COURSE-TEST",
  patientId: "CR-TEST",
  diagnosis: "Test",
  protocolName: "IGSRT",
  totalFractions: 20,
  currentFraction: 0,
  startDate: "2026-06-12",
  endDate: null,
  chartRoundsPhase: "Upcoming",
  status: "ACTIVE",
  treatmentModality: "IGSRT",
  treatmentType: "IGSRT",
  notes: ""
};

assertApplicable({
  label: "Skin IGSRT",
  patient: { id: "CR-SKIN", diagnosisCategory: "SKIN_CANCER", activeCourseId: "COURSE-SKIN" },
  course: { ...baseCourse, id: "COURSE-SKIN", diagnosis: "Skin Cancer", bodyRegion: "NOSE", protocolName: "IGSRT" },
  includes: ["REQ-INTAKE", "REQ-SKIN-IGSRT-SIM", "REQ-SKIN-IGSRT-RX", "REQ-SKIN-IGSRT-FXLOG", "REQ-AVS-PCP"],
  excludes: ["REQ-ARTHRITIS-HAND-SIM", "REQ-DUPUYTRENS-SIM"],
  applicableDocumentRequirements: registry.applicableDocumentRequirements
});

for (const [bodyRegion, expectedRequirement] of [
  ["HAND", "REQ-ARTHRITIS-HAND-SIM"],
  ["FOOT", "REQ-ARTHRITIS-FOOT-SIM"],
  ["KNEE", "REQ-ARTHRITIS-KNEE-SIM"]
]) {
  assertApplicable({
    label: `Arthritis ${bodyRegion}`,
    patient: { id: `CR-ARTH-${bodyRegion}`, diagnosisCategory: "ARTHRITIS", activeCourseId: `COURSE-ARTH-${bodyRegion}` },
    course: {
      ...baseCourse,
      id: `COURSE-ARTH-${bodyRegion}`,
      diagnosis: `Arthritis ${bodyRegion}`,
      protocolName: "Joint mapping",
      treatmentModality: "IGRT",
      treatmentType: "Joint",
      bodyRegion
    },
    includes: ["REQ-INTAKE", expectedRequirement, "REQ-AVS-PCP"],
    excludes: ["REQ-SKIN-IGSRT-SIM", "REQ-DUPUYTRENS-SIM"],
    applicableDocumentRequirements: registry.applicableDocumentRequirements
  });
}

assertApplicable({
  label: "Dupuytren's",
  patient: { id: "CR-DUP", diagnosisCategory: "DUPUYTRENS", activeCourseId: "COURSE-DUP" },
  course: {
    ...baseCourse,
    id: "COURSE-DUP",
    diagnosis: "Dupuytren's",
    protocolName: "Dupuytren's",
    treatmentModality: "IGRT",
    treatmentType: "Dupuytren's",
    bodyRegion: "HAND"
  },
  includes: ["REQ-INTAKE", "REQ-DUPUYTRENS-US-MAPPING", "REQ-DUPUYTRENS-SIM", "REQ-DUPUYTRENS-RX", "REQ-DUPUYTRENS-FXLOG", "REQ-AVS-PCP"],
  excludes: ["REQ-SKIN-IGSRT-SIM", "REQ-ARTHRITIS-HAND-SIM"],
  applicableDocumentRequirements: registry.applicableDocumentRequirements
});

assertApplicable({
  label: "Nonmatching body region",
  patient: { id: "CR-ELBOW", diagnosisCategory: "ARTHRITIS", activeCourseId: "COURSE-ELBOW" },
  course: {
    ...baseCourse,
    id: "COURSE-ELBOW",
    diagnosis: "Arthritis elbow",
    protocolName: "Joint mapping",
    treatmentModality: "IGRT",
    treatmentType: "Joint",
    bodyRegion: "ELBOW"
  },
  includes: ["REQ-INTAKE", "REQ-AVS-PCP"],
  excludes: ["REQ-ARTHRITIS-HAND-SIM", "REQ-ARTHRITIS-FOOT-SIM", "REQ-ARTHRITIS-KNEE-SIM"],
  applicableDocumentRequirements: registry.applicableDocumentRequirements
});

assertIncludes(packageJson, '"test:phase4"', "package.json must expose npm run test:phase4");
assertIncludes(packageJson, "npm run test:phase4", "npm run verify must include Phase 4 guardrail");

console.log("Phase 4 template registry guardrails passed");
