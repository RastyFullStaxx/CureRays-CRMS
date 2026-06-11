import { findWindowsNode20, unsupportedNodeMessage } from './windows-node20.mjs';

const major = Number(process.versions.node.split('.')[0]);

if (major < 21) {
  process.exit(0);
}

const fallbackNode = findWindowsNode20();

if (fallbackNode) {
  console.warn(`${unsupportedNodeMessage()} Routing this build through ${fallbackNode}.`);
  process.exit(0);
}

console.error(unsupportedNodeMessage());
process.exit(1);
