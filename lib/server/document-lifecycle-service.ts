import "server-only";

import {
  generatedDocuments,
  renderGeneratedDocument,
  signGeneratedDocument
} from "@/lib/clinical-store";
import { requirePhiAction, type PhiAccessContext } from "@/lib/server/phi-store";
import type {
  DocumentLifecycleResult,
  GeneratedDocumentOutput
} from "@/lib/types";

const phiBoundary = "Generated document lifecycle is available only through guarded PHI routes.";

function findGeneratedDocument(documentId: string) {
  return generatedDocuments.find((document) => document.id === documentId) ?? null;
}

function notFoundResult(): DocumentLifecycleResult {
  return {
    document: null,
    phiBoundary,
    blockedReason: "Document not found."
  };
}

export function readGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string
): DocumentLifecycleResult {
  requirePhiAction(access, "phi:read");
  const document = findGeneratedDocument(documentId);

  return document
    ? { document, phiBoundary }
    : notFoundResult();
}

export function renderGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string,
  format: GeneratedDocumentOutput["format"] = "PDF"
): DocumentLifecycleResult {
  requirePhiAction(access, "document:render");
  const result = renderGeneratedDocument(documentId, format);

  if (!result) {
    return notFoundResult();
  }

  return {
    document: findGeneratedDocument(documentId),
    output: result.data,
    auditEvent: result.auditEvent,
    phiBoundary
  };
}

export function signGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string
): DocumentLifecycleResult {
  requirePhiAction(access, "document:sign");
  const result = signGeneratedDocument(documentId);

  if (!result) {
    return notFoundResult();
  }

  return {
    document: findGeneratedDocument(documentId),
    auditEvent: result.auditEvent,
    phiBoundary
  };
}
