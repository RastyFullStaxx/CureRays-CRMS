const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

const retryMs = 30000;
const intervalMs = 50;

function isNextBuildArtifactPath(filePath) {
  return (
    typeof filePath === 'string' &&
    filePath.includes(`${path.sep}.next${path.sep}`)
  );
}

function fallbackManifestContent(filePath) {
  const name = path.basename(filePath);

  if (name === 'middleware-manifest.json') {
    return JSON.stringify({ version: 3, middleware: {}, sortedMiddleware: [], functions: {} });
  }

  if (name === 'pages-manifest.json') {
    return JSON.stringify({});
  }

  if (name === 'next-font-manifest.json' || name === 'font-manifest.json') {
    return JSON.stringify({
      pages: {},
      app: {},
      appUsingSizeAdjust: false,
      pagesUsingSizeAdjust: false
    });
  }

  if (name === 'server-reference-manifest.json') {
    return JSON.stringify({ node: {}, edge: {}, encryptionKey: '' });
  }

  if (name === 'build-manifest.json') {
    return JSON.stringify({
      polyfillFiles: [],
      devFiles: [],
      ampDevFiles: [],
      lowPriorityFiles: [],
      rootMainFiles: [],
      pages: {},
      ampFirstPages: []
    });
  }

  if (['react-loadable-manifest.json', 'app-build-manifest.json', 'app-paths-manifest.json'].includes(name)) {
    return JSON.stringify({});
  }

  return null;
}

function ensureFallbackManifest(filePath) {
  if (!isNextBuildArtifactPath(String(filePath)) || fs.existsSync(filePath)) {
    return false;
  }

  const content = fallbackManifestContent(filePath);
  if (content === null) {
    return false;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

function isRetriable(error, filePath) {
  return error?.code === 'ENOENT' && isNextBuildArtifactPath(String(filePath));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

async function retryAsync(operation, filePath) {
  const deadline = Date.now() + retryMs;

  for (;;) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetriable(error, filePath) || Date.now() >= deadline) {
        if (isRetriable(error, filePath) && ensureFallbackManifest(filePath)) {
          continue;
        }

        throw error;
      }

      await sleep(intervalMs);
    }
  }
}

function retryCallback(operation, filePath, callback) {
  const deadline = Date.now() + retryMs;

  function attempt() {
    operation((error, ...results) => {
      if (!isRetriable(error, filePath) || Date.now() >= deadline) {
        if (isRetriable(error, filePath) && ensureFallbackManifest(filePath)) {
          attempt();
          return;
        }

        callback(error, ...results);
        return;
      }

      setTimeout(attempt, intervalMs);
    });
  }

  attempt();
}

function retrySync(operation, filePath) {
  const deadline = Date.now() + retryMs;

  for (;;) {
    try {
      return operation();
    } catch (error) {
      if (!isRetriable(error, filePath) || Date.now() >= deadline) {
        if (isRetriable(error, filePath) && ensureFallbackManifest(filePath)) {
          continue;
        }

        throw error;
      }

      sleepSync(intervalMs);
    }
  }
}

const originalReadFileSync = fs.readFileSync.bind(fs);
fs.readFileSync = function readFileSyncWithNextBuildArtifactRetry(filePath, ...args) {
  return retrySync(() => originalReadFileSync(filePath, ...args), filePath);
};

const originalOpenSync = fs.openSync.bind(fs);
fs.openSync = function openSyncWithNextBuildArtifactRetry(filePath, ...args) {
  return retrySync(() => originalOpenSync(filePath, ...args), filePath);
};

const originalReadFile = fs.readFile.bind(fs);
fs.readFile = function readFileWithNextBuildArtifactRetry(filePath, ...args) {
  const callback = args.at(-1);
  if (typeof callback !== 'function') {
    return originalReadFile(filePath, ...args);
  }

  const readArgs = args.slice(0, -1);
  return retryCallback((next) => originalReadFile(filePath, ...readArgs, next), filePath, callback);
};

const originalOpen = fs.open.bind(fs);
fs.open = function openWithNextBuildArtifactRetry(filePath, ...args) {
  const callback = args.at(-1);
  if (typeof callback !== 'function') {
    return originalOpen(filePath, ...args);
  }

  const openArgs = args.slice(0, -1);
  return retryCallback((next) => originalOpen(filePath, ...openArgs, next), filePath, callback);
};

const originalPromisesReadFile = fs.promises.readFile.bind(fs.promises);
fs.promises.readFile = function readFileWithNextBuildArtifactRetry(filePath, ...args) {
  return retryAsync(() => originalPromisesReadFile(filePath, ...args), filePath);
};

const originalPromisesOpen = fs.promises.open.bind(fs.promises);
fs.promises.open = function openWithNextBuildArtifactRetry(filePath, ...args) {
  return retryAsync(() => originalPromisesOpen(filePath, ...args), filePath);
};

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFilenameWithNextBuildArtifactRetry(request, parent, isMain, options) {
  if (isNextBuildArtifactPath(String(request))) {
    ensureFallbackManifest(request);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
