import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const sourceRoots = ['app', 'components', 'lib'];
const sourceExtensions = new Set(['.ts', '.tsx', '.css']);

function walk(directory) {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      return statSync(path).isDirectory() ? walk(path) : [path];
    })
    .filter((path) => sourceExtensions.has(extname(path)));
}

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

const statusUtils = read('lib/status-utils.ts');
assert.match(
  statusUtils,
  /export type StatusTone\s*=\s*['"]positive['"]\s*\|\s*['"]intermediate['"]\s*\|\s*['"]negative['"]\s*\|\s*['"]neutral['"]/,
  'StatusTone must expose exactly the four guided semantic tones',
);

const globals = read('app/globals.css');
for (const tone of ['positive', 'intermediate', 'negative', 'neutral']) {
  for (const role of ['solid', 'surface', 'border', 'text']) {
    assert.ok(
      globals.includes(`--status-${tone}-${role}`),
      `Missing global semantic token: --status-${tone}-${role}`,
    );
  }
  assert.ok(globals.includes(`.clinical-pill-${tone}`), `Missing pill treatment for ${tone}`);
}

for (const absolutePath of sourceRoots.flatMap((directory) => walk(join(root, directory)))) {
  const path = relative(root, absolutePath).replaceAll('\\', '/');
  if (path === 'app/globals.css') continue;
  const content = readFileSync(absolutePath, 'utf8');

  assert.doesNotMatch(
    content,
    /<Badge\b[^>]*\bvariant=["'](?:primary|info|success|warning|error|default)["']/s,
    `${path} must use guided semantic badge tones`,
  );
  assert.doesNotMatch(
    content,
    /clinical-pill-(?:primary|info|success|warning|error|default)/,
    `${path} must not use legacy pill tones`,
  );
  assert.doesNotMatch(
    content,
    /#[\da-fA-F]{3,8}\b/,
    `${path} must resolve colors through global tokens`,
  );
  assert.doesNotMatch(
    content,
    /\b(?:text|bg|border|ring|fill|stroke)-(?:white|black|slate|gray|zinc|neutral|stone|red|green|emerald|amber|yellow|orange|blue|indigo|violet|purple|pink|cyan|teal)(?:-\d{2,3})?\b/,
    `${path} must not use framework palette colors`,
  );
  assert.doesNotMatch(
    content,
    /var\(--color-accent(?:-soft|-foreground)?\)/,
    `${path} must not reference the retired accent token`,
  );
}

assert.doesNotMatch(
  globals,
  /--color-accent/,
  'The accent token was retired with the three-color brand system',
);

assert.match(statusUtils, /export function phaseTone\([^)]*\): StatusTone \{\s*return ['"]neutral['"];/s);
for (const nonValencedStatus of ['ACTIVE', 'IN_PROGRESS', 'SCHEDULED', 'NOT_STARTED', 'NOT_APPLICABLE']) {
  assert.equal(
    statusUtils.match(new RegExp(`['"]${nonValencedStatus}['"]`, 'g'))?.length ?? 0,
    0,
    `${nonValencedStatus} must remain neutral through the status fallback`,
  );
}

console.log('Color system guardrails passed.');
