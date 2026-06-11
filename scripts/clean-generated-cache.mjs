import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeGeneratedPath(path) {
  const target = join(root, path);

  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      rmSync(target, {
        force: true,
        maxRetries: 5,
        recursive: true,
        retryDelay: 250
      });
      return;
    } catch (error) {
      if (!existsSync(target)) {
        return;
      }

      if (!['ENOTEMPTY', 'EBUSY', 'EPERM'].includes(error?.code)) {
        throw error;
      }

      if (attempt === 29) {
        throw error;
      }

      sleep(250 + attempt * 100);
    }
  }
}

for (const path of ['.next']) {
  removeGeneratedPath(path);
}
