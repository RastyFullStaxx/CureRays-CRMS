import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REQUIRED_NODE_VERSION = '20.11.1';

function candidateNodePaths() {
  const candidates = [];

  if (process.env.CURERAYS_NODE20_PATH) {
    candidates.push(process.env.CURERAYS_NODE20_PATH);
  }

  if (process.env.NVM_HOME) {
    candidates.push(path.join(process.env.NVM_HOME, `v${REQUIRED_NODE_VERSION}`, 'node.exe'));
  }

  if (process.env.APPDATA) {
    candidates.push(path.join(process.env.APPDATA, 'nvm', `v${REQUIRED_NODE_VERSION}`, 'node.exe'));
  }

  const home = os.homedir();
  candidates.push(path.join(home, '.config', 'herd', 'bin', 'nvm', `v${REQUIRED_NODE_VERSION}`, 'node.exe'));

  return candidates;
}

export function findWindowsNode20() {
  if (process.platform !== 'win32') {
    return null;
  }

  return candidateNodePaths().find((candidate) => fs.existsSync(candidate)) ?? null;
}

export function unsupportedNodeMessage() {
  return [
    `Unsupported Node.js ${process.version}.`,
    'CureRays CRMS uses Next 14.2.16 and supports Node >=18.17 <21 for reliable Windows builds.',
    `Use nvm install ${REQUIRED_NODE_VERSION} && nvm use ${REQUIRED_NODE_VERSION}, then remove .next and rebuild.`,
  ].join(' ');
}

export { REQUIRED_NODE_VERSION };
