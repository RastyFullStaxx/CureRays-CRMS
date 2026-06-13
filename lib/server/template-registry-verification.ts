import "server-only";

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { templateSources } from "@/lib/template-registry";
import type { TemplateSource } from "@/lib/types";

export type TemplateSourceHashVerification = {
  sourceId: string;
  name: string;
  sourceFileName: string;
  expectedSha256?: string;
  actualSha256?: string;
  status: "VERIFIED" | "MISSING_SOURCE" | "HASH_MISMATCH" | "NO_HASH_REQUIRED";
};

function fileSha256(relativePath: string) {
  const absolutePath = join(/*turbopackIgnore: true*/ process.cwd(), relativePath);
  if (!existsSync(absolutePath)) {
    return undefined;
  }

  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex");
}

function verifySource(source: TemplateSource): TemplateSourceHashVerification {
  if (source.status === "MISSING" || !source.sourceFileName.startsWith("docs/")) {
    return {
      sourceId: source.id,
      name: source.name,
      sourceFileName: source.sourceFileName,
      expectedSha256: source.sourceSha256,
      status: "NO_HASH_REQUIRED"
    };
  }

  const actualSha256 = fileSha256(source.sourceFileName);
  if (!actualSha256) {
    return {
      sourceId: source.id,
      name: source.name,
      sourceFileName: source.sourceFileName,
      expectedSha256: source.sourceSha256,
      status: "MISSING_SOURCE"
    };
  }

  return {
    sourceId: source.id,
    name: source.name,
    sourceFileName: source.sourceFileName,
    expectedSha256: source.sourceSha256,
    actualSha256,
    status: actualSha256 === source.sourceSha256 ? "VERIFIED" : "HASH_MISMATCH"
  };
}

export function verifyTemplateSourceHashes() {
  const results = templateSources.map(verifySource);

  return {
    results,
    verified: results.filter((result) => result.status === "VERIFIED").length,
    mismatched: results.filter((result) => result.status === "HASH_MISMATCH").length,
    missing: results.filter((result) => result.status === "MISSING_SOURCE").length,
    notRequired: results.filter((result) => result.status === "NO_HASH_REQUIRED").length
  };
}
