import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceRoots = ["app", "components", "lib"];
const colorLiteralPattern = /#[0-9A-Fa-f]{3,8}\b|rgba?\(|hsla?\(/;
const tokenFile = "app/globals.css";
const deprecatedRootImports = [
  "@/components/data-table",
  "@/components/page-header",
  "@/components/section-card",
  "@/components/empty-state"
];
const clientForbiddenModules = [
  "@/lib/clinical-store",
  "@/lib/mock-data",
  "@/lib/global-page-data",
  "@/lib/module-data",
  "@/lib/dashboard-data",
  "@/lib/page-layout-data",
  "@/lib/server/phi-store"
];

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function listSourceFiles(directory) {
  return readdirSync(join(root, directory)).flatMap((name) => {
    const relative = `${directory}/${name}`;
    const absolute = join(root, relative);

    if (statSync(absolute).isDirectory()) {
      return listSourceFiles(relative);
    }

    return /\.(css|ts|tsx)$/.test(name) ? [relative] : [];
  });
}

const files = sourceRoots.flatMap(listSourceFiles);
function globalsTokenViolations() {
  const lines = read(tokenFile).split(/\r?\n/);
  const violations = [];
  let inTokenDeclaration = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("--")) {
      inTokenDeclaration = true;
    }

    if (colorLiteralPattern.test(line) && !inTokenDeclaration) {
      violations.push(`${tokenFile}:${index + 1}`);
    }

    if (inTokenDeclaration && trimmed.endsWith(";")) {
      inTokenDeclaration = false;
    }
  });

  return violations;
}

const colorViolations = [
  ...files
    .filter((file) => file !== tokenFile)
    .filter((file) => colorLiteralPattern.test(read(file))),
  ...globalsTokenViolations(),
];

assert.deepEqual(
  colorViolations,
  [],
  `Hardcoded color literals must live only in ${tokenFile} token declarations: ${colorViolations.join(", ")}`
);

const globals = read(tokenFile);
assert.equal(
  /\.dark\s+\[class\*=["'].*#/.test(globals),
  false,
  "globals.css must not keep legacy dark-mode bridges for hardcoded Tailwind hex classes"
);

const deprecatedImportViolations = files
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .filter((file) => deprecatedRootImports.some((moduleName) => read(file).includes(moduleName)));

assert.deepEqual(
  deprecatedImportViolations,
  [],
  `Use components/ui or components/shared instead of deprecated root primitives: ${deprecatedImportViolations.join(", ")}`
);

const clientFiles = files
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .filter((file) => {
    const source = read(file).trimStart();
    return source.startsWith("'use client'") || source.startsWith('"use client"');
  });

const clientImportViolations = clientFiles.filter((file) => {
  const source = read(file);
  return clientForbiddenModules.some((moduleName) => source.includes(moduleName));
});

assert.deepEqual(
  clientImportViolations,
  [],
  `Client files must receive DTO props instead of importing PHI/data modules: ${clientImportViolations.join(", ")}`
);

console.log("Phase 0 guardrails passed");
