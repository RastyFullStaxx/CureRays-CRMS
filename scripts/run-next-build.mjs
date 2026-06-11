import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findWindowsNode20, unsupportedNodeMessage } from './windows-node20.mjs';

const major = Number(process.versions.node.split('.')[0]);
const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const nodePath = major >= 21 ? findWindowsNode20() : process.execPath;

if (!nodePath) {
  console.error(unsupportedNodeMessage());
  process.exit(1);
}

const nodeDir = path.dirname(nodePath);
const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';
const env = {
  ...process.env,
  [pathKey]: `${nodeDir}${path.delimiter}${process.env[pathKey] ?? ''}`,
};

const result = spawnSync(nodePath, [nextBin, 'build'], {
  cwd: process.cwd(),
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
