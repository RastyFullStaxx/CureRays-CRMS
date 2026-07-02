import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const sourceRoots = ['app', 'components'];
const sourceExtensions = new Set(['.ts', '.tsx', '.css']);

function walk(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory() ? walk(path) : [path];
    })
    .filter((path) => sourceExtensions.has(extname(path)));
}

for (const absolutePath of sourceRoots.flatMap((directory) => walk(join(root, directory)))) {
  const path = relative(root, absolutePath).replaceAll('\\', '/');
  const content = readFileSync(absolutePath, 'utf8');

  assert.doesNotMatch(
    content,
    /\b(?:uppercase|lowercase|capitalize)\b|text-transform\s*:/,
    `${path} must carry accessible casing in source instead of visual text transforms`,
  );
  assert.doesNotMatch(
    content,
    /replaceAll\(\s*['"]_['"]\s*,\s*['"] ['"]\s*\).*replace\(/s,
    `${path} must use the shared enum-label formatter`,
  );
}

const formatter = readFileSync(join(root, 'lib/ui-copy.ts'), 'utf8');
for (const requiredTerm of ['CureRays', 'PHI', 'MRN', 'IGSRT', 'eCW', 'CPT', 'OTV', 'cGy']) {
  assert.ok(formatter.includes(requiredTerm), `UI copy formatter must preserve ${requiredTerm}`);
}

console.log('UI copy guardrails passed.');
