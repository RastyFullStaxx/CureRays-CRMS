import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = ["app", "components"];
const tableTags = new Set(["DataTable", "StaticDataTable", "CompactTable"]);

const disabledButtonExpectations = {
  "app/workflow/page.tsx": ["Export", "Customize"],
  "app/templates/page.tsx": ["Upload Template", "Create Template"],
  "app/billing/page.tsx": ["Export Billing Report", "Add Billing Item"],
  "app/imaging/page.tsx": ["Upload Imaging", "New Imaging Study"],
  "app/users-roles/page.tsx": ["Invite User"],
  "app/clinical-forms/page.tsx": ["New Clinical Form", "Open", "Edit Fields"],
  "app/analytics/page.tsx": ["Export Report"],
  "app/audit-logs/page.tsx": ["Export Logs"],
  "app/security-logs/page.tsx": ["Export Logs"],
  "app/treatment-delivery/page.tsx": ["Today, May 6, 2026", "Record Treatment"],
  "app/schedule/page.tsx": ["Today", "May 6, 2026", "New Appointment"]
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

function jsxText(node) {
  if (ts.isJsxText(node)) {
    return node.getText().replace(/\s+/g, " ").trim();
  }

  if (ts.isJsxExpression(node)) {
    return node.expression ? jsxText(node.expression) : "";
  }

  if (ts.isJsxElement(node)) {
    return node.children.map(jsxText).filter(Boolean).join(" ");
  }

  if (ts.isJsxSelfClosingElement(node)) {
    return "";
  }

  return "";
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

for (const [file, labels] of Object.entries(disabledButtonExpectations)) {
  const { tree } = parse(file);
  const buttons = [];

  function visit(node) {
    if (ts.isJsxElement(node) && tagName(node.openingElement, tree) === "Button") {
      buttons.push({
        text: node.children.map(jsxText).filter(Boolean).join(" "),
        disabled: hasAttribute(node.openingElement, "disabled")
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(tree);

  for (const label of labels) {
    const button = buttons.find((item) => item.text.includes(label));
    assert.ok(button, `${file} must render a Button containing "${label}"`);
    assert.ok(button.disabled, `${file} "${label}" must be disabled until the workflow is wired`);
  }
}

assert.equal(
  readFileSync(join(root, "app/settings/page.tsx"), "utf8").includes("<button"),
  false,
  "Settings category rows must be static until settings detail routes are wired"
);

console.log("Phase 1 operational visibility guardrails passed");
