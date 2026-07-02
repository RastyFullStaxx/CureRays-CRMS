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

const sourceFiles = sourceRoots.flatMap((directory) => walk(join(root, directory)));
const classSizePattern = /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b|text-\[(?:\d+(?:\.\d+)?(?:px|rem))\]/;
const classFontPattern = /\bfont-(?:heading|body|sans|serif|mono|normal|medium|semibold|bold|extrabold|black)\b/;
const localStylePattern = /\b(?:fontSize|fontFamily|fontWeight|lineHeight|letterSpacing)\s*:/;

for (const absolutePath of sourceFiles) {
  const path = relative(root, absolutePath).replaceAll('\\', '/');
  const content = readFileSync(absolutePath, 'utf8');

  assert.doesNotMatch(content, classSizePattern, `${path} must use semantic typography classes`);
  assert.doesNotMatch(content, classFontPattern, `${path} must not use local font utilities`);

  if (!['components/analytics/analytics-command-client.tsx', 'components/dashboard/dashboard-telemetry-client.tsx'].includes(path)) {
    assert.doesNotMatch(content, localStylePattern, `${path} must not declare local typography styles`);
  } else {
    for (const line of content.split(/\r?\n/)) {
      if (!localStylePattern.test(line)) continue;
      assert.match(
        line,
        /(?:uiTypography\.(?:size|weight)|resolveUiFontFamily\(\))/,
        `${path} visualization typography must use the shared adapter`,
      );
    }
  }
}

const globals = read('app/globals.css');
const layout = read('app/layout.tsx');
const button = read('components/ui/button.tsx');
const adapter = read('lib/ui-typography.ts');

assert.match(layout, /import \{ Inter \} from ["']next\/font\/google["']/, 'Root layout must load Inter through next/font');
assert.match(layout, /variable:\s*["']--font-inter["']/, 'Inter must expose the global CSS variable');
assert.doesNotMatch(globals, /fonts\.googleapis|@import\s+url/, 'Global CSS must not load remote fonts');
assert.doesNotMatch(globals, /Manrope/, 'Typography must use Inter exclusively');

for (const token of [
  '--font-ui',
  '--type-title-size:    1.25rem',
  '--type-heading-size:  1rem',
  '--type-body-size: 0.875rem',
  '--type-label-size: 0.75rem',
]) {
  assert.ok(globals.includes(token), `Global typography token is missing: ${token}`);
}

for (const className of [
  '.type-title',
  '.type-heading',
  '.type-body',
  '.type-body-strong',
  '.type-supporting',
  '.type-label',
  '.type-button',
]) {
  assert.ok(globals.includes(className), `Semantic typography class is missing: ${className}`);
}

const fontFamilyLines = globals.split(/\r?\n/).filter((line) => line.includes('font-family:'));
assert.deepEqual(fontFamilyLines.map((line) => line.trim()), ['font-family: var(--font-ui);']);

for (const line of globals.split(/\r?\n/)) {
  const fontSize = line.match(/font-size:\s*([^;]+);/);
  if (fontSize) {
    assert.match(
      fontSize[1],
      /^(?:var\(--type-(?:title|heading|body|label)-size\)(?: !important)?|16px|2\.7px|3\.2px)$/,
      `Unsupported global font size: ${fontSize[1]}`,
    );
  }

  const lineHeight = line.match(/line-height:\s*([^;]+);/);
  if (lineHeight) {
    assert.match(
      lineHeight[1],
      /^var\(--type-(?:title|heading|body|label)-line\)(?: !important)?$/,
      `Unsupported global line height: ${lineHeight[1]}`,
    );
  }

  const fontWeight = line.match(/font-weight:\s*([^;]+);/);
  if (fontWeight) {
    assert.match(
      fontWeight[1],
      /^var\(--font-weight-(?:normal|medium|semibold|bold)\)(?: !important)?$/,
      `Unsupported global font weight: ${fontWeight[1]}`,
    );
  }

  assert.doesNotMatch(line, /letter-spacing:/, 'Local letter spacing is not allowed');
}

assert.match(
  globals,
  /\.dashboard-phi-link-label\s*\{[^}]*font-size:\s*2\.7px;/s,
  'The first SVG coordinate-space exception must remain explicit',
);
assert.match(
  globals,
  /\.dashboard-phi-node text\s*\{[^}]*font-size:\s*3\.2px;/s,
  'The second SVG coordinate-space exception must remain explicit',
);
assert.equal((globals.match(/font-size:\s*(?:2\.7|3\.2)px;/g) ?? []).length, 2, 'Only two SVG size exceptions are allowed');

assert.match(button, /type-button/, 'Buttons must use the shared 14px typography role');
assert.doesNotMatch(button, /type-supporting/, 'Small buttons must not shrink their text');
assert.match(
  globals,
  /button\s*\{[^}]*font-size:\s*var\(--type-body-size\)\s*!important;[^}]*font-weight:\s*var\(--font-weight-semibold\)\s*!important;/s,
  'All button implementations must resolve to the shared 14px/600 contract',
);
assert.match(adapter, /label:\s*12/);
assert.match(adapter, /body:\s*14/);
assert.match(adapter, /heading:\s*16/);
assert.match(adapter, /title:\s*20/);

console.log('Typography guardrails passed.');
