#!/usr/bin/env node
// Checks that every relative Markdown link in the docs and root MDs resolves to a real file.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targets = ['AGENTS.md', 'PRODUCT.md', 'README.md', 'CLAUDE.md'].map((f) => join(root, f));

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry.endsWith('.md')) targets.push(full);
  }
}
collect(join(root, 'docs'));

const linkPattern = /\[[^\]]*\]\(([^)\s]+)\)/g;
let failures = 0;

for (const file of targets) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(linkPattern)) {
    const target = match[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const [pathPart] = target.split('#');
    if (!pathPart) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(pathPart));
    if (!existsSync(resolved)) {
      failures += 1;
      console.error(`BROKEN  ${file.slice(root.length + 1).split(sep).join('/')} -> ${target}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} broken relative link(s).`);
  process.exit(1);
}
console.log(`Docs link check passed (${targets.length} files scanned).`);
