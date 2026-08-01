import 'server-only';

import { mkdir, readFile, realpath, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join, parse, relative, resolve, sep } from 'node:path';

export class GeneratedDocumentStorageError extends Error {
  constructor() {
    super('Generated document storage operation failed.');
    this.name = 'GeneratedDocumentStorageError';
  }
}

function storageKeySegments(storageKey: string): string[] {
  if (!storageKey || storageKey !== storageKey.trim() || isAbsolute(storageKey)) {
    throw new GeneratedDocumentStorageError();
  }

  const segments = storageKey.split(/[\\/]+/);
  if (
    segments.length !== 1 ||
    segments.some(
      (segment) =>
        !segment ||
        segment === '.' ||
        segment === '..' ||
        !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment),
    )
  ) {
    throw new GeneratedDocumentStorageError();
  }

  return segments;
}

function isContained(root: string, candidate: string): boolean {
  const location = relative(root, candidate);
  return Boolean(location) && location !== '..' && !location.startsWith(`..${sep}`) && !isAbsolute(location);
}

export function isSafeGeneratedDocumentStorageRoot(candidate: string): boolean {
  const root = resolve(candidate);
  return root !== parse(root).root;
}

async function storageRoot(): Promise<string> {
  const configured = String(process.env.GENERATED_DOCUMENT_STORAGE_DIR ?? '').trim();
  const root = resolve(configured || join(process.cwd(), 'storage', 'generated-documents'));
  if (!isSafeGeneratedDocumentStorageRoot(root)) throw new GeneratedDocumentStorageError();
  await mkdir(root, { recursive: true, mode: 0o700 });
  const canonicalRoot = await realpath(root);
  if (!isSafeGeneratedDocumentStorageRoot(canonicalRoot)) throw new GeneratedDocumentStorageError();
  return canonicalRoot;
}

async function containedWriteTarget(storageKey: string): Promise<string> {
  const root = await storageRoot();
  const segments = storageKeySegments(storageKey);
  const lexicalTarget = resolve(root, ...segments);
  if (!isContained(root, lexicalTarget)) {
    throw new GeneratedDocumentStorageError();
  }

  return lexicalTarget;
}

async function containedExistingTarget(storageKey: string): Promise<string> {
  const root = await storageRoot();
  const segments = storageKeySegments(storageKey);
  const lexicalTarget = resolve(root, ...segments);
  if (!isContained(root, lexicalTarget)) {
    throw new GeneratedDocumentStorageError();
  }

  const target = await realpath(lexicalTarget);
  if (!isContained(root, target)) {
    throw new GeneratedDocumentStorageError();
  }

  return target;
}

function storageError(error: unknown): GeneratedDocumentStorageError {
  return error instanceof GeneratedDocumentStorageError ? error : new GeneratedDocumentStorageError();
}

export async function writeGeneratedDocumentBytes(storageKey: string, bytes: Buffer): Promise<void> {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) {
    throw new GeneratedDocumentStorageError();
  }

  try {
    const target = await containedWriteTarget(storageKey);
    await writeFile(target, bytes, { flag: 'wx', mode: 0o600 });
  } catch (error) {
    throw storageError(error);
  }
}

export async function readGeneratedDocumentBytes(storageKey: string): Promise<Buffer> {
  try {
    return await readFile(await containedExistingTarget(storageKey));
  } catch (error) {
    throw storageError(error);
  }
}

export async function removeGeneratedDocumentBytes(storageKey: string): Promise<boolean> {
  try {
    await unlink(await containedExistingTarget(storageKey));
    return true;
  } catch (error) {
    throw storageError(error);
  }
}
