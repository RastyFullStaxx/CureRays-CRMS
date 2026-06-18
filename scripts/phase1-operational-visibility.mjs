import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = ["app", "components"];
const tableTags = new Set(["DataTable", "StaticDataTable", "CompactTable"]);

const prototypeActionExpectations = {
  "components/templates/templates-command-client.tsx": ["Upload Template", "Create Template"],
  "components/users/users-roles-command-client.tsx": ["Invite User"],
  "components/audit/audit-log-command-client.tsx": ["Export Logs"],
  "components/schedule/schedule-command-client.tsx": ["Today", "May 6, 2026", "New Appointment"],
  "components/reports/reports-command-client.tsx": ["Export Report"]
};

const redirectedRouteExpectations = {
  "app/billing/page.tsx": "/patients",
  "app/clinical-forms/page.tsx": "/patients",
  "app/imaging/page.tsx": "/patients",
  "app/treatment-delivery/page.tsx": "/patients",
  "app/workflow/page.tsx": "/today",
  "app/tasks/page.tsx": "/today"
};

const settingsRouteExpectations = {
  "app/settings/templates/page.tsx": "@/app/templates/page",
  "app/settings/users/page.tsx": "@/app/users-roles/page"
};

function listSourceFiles(directory) {
  return readdirSync(join(root, directory)).flatMap((name) => {
    const relative = `${directory}/${name}`;
    const absolute = join(root, relative);

    if (statSync(absolute).isDirectory()) {
      return listSourceFiles(relative);
    }

    return /\.(ts|tsx)$/.test(name) ? [relative] : [];
  });
}

function parse(relativePath) {
  const source = readFileSync(join(root, relativePath), "utf8");
  return {
    source,
    tree: ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  };
}

function tagName(node, tree) {
  return node.tagName.getText(tree);
}

function hasAttribute(node, name) {
  return node.attributes.properties.some((attribute) => {
    return ts.isJsxAttribute(attribute) && attribute.name.getText() === name;
  });
}

const files = sourceRoots.flatMap(listSourceFiles);

for (const requiredFile of ["app/loading.tsx", "app/error.tsx"]) {
  assert.ok(existsSync(join(root, requiredFile)), `${requiredFile} must exist for prototype route states`);
}

const missingEmpty = [];

for (const file of files) {
  const { tree } = parse(file);

  function visit(node) {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && tableTags.has(tagName(node, tree))) {
      if (!hasAttribute(node, "empty")) {
        const { line, character } = tree.getLineAndCharacterOfPosition(node.getStart());
        missingEmpty.push(`${file}:${line + 1}:${character + 1}`);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(tree);
}

assert.deepEqual(
  missingEmpty,
  [],
  `Operational tables must provide explicit empty copy: ${missingEmpty.join(", ")}`
);

for (const [file, target] of Object.entries(redirectedRouteExpectations)) {
  const source = readFileSync(join(root, file), "utf8");
  assert.ok(source.includes("next/navigation"), `${file} must use Next redirect`);
  assert.ok(source.includes(`redirect('${target}')`), `${file} must redirect to ${target}`);
}

for (const [file, target] of Object.entries(settingsRouteExpectations)) {
  const source = readFileSync(join(root, file), "utf8");
  assert.ok(source.includes(target), `${file} must expose the admin surface from ${target}`);
}

for (const [file, labels] of Object.entries(prototypeActionExpectations)) {
  const source = readFileSync(join(root, file), "utf8");
  assert.ok(source.includes("PrototypeActionButton"), `${file} must use staged prototype actions`);

  for (const label of labels) {
    assert.ok(source.includes(`label="${label}"`), `${file} must expose prototype action "${label}"`);
  }
}

assert.equal(
  readFileSync(join(root, "app/settings/page.tsx"), "utf8").includes("<button"),
  false,
  "Settings category rows must be static until settings detail routes are wired"
);

console.log("Phase 1 operational visibility guardrails passed");
