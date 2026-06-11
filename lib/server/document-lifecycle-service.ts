import "server-only";

import {
  confirmGeneratedDocumentEcwUpload,
  exportGeneratedDocumentOutput,
  generatedDocuments,
  latestGeneratedDocumentOutput,
  recordGeneratedDocumentManualEditException,
  renderGeneratedDocument,
  signGeneratedDocument,
  voidGeneratedDocumentOutput
} from "@/lib/clinical-store";
import { courseRef, patientRef, redactAuditEvent } from "@/lib/hipaa";
import { roleCan } from "@/lib/rbac";
import { requirePhiAction, type PhiAccessContext } from "@/lib/server/phi-store";
import {
  documentRequirements,
  readinessForRequirement,
  templateSources
} from "@/lib/template-registry";
import type {
  DocumentLifecycleDocumentDto,
  DocumentLifecycleOutputDto,
  DocumentLifecycleResult,
  GeneratedDocument,
  GeneratedDocumentFormat,
  GeneratedDocumentOutput,
  OperationalAuditEvent,
  WorkflowSnapshot
} from "@/lib/types";

const phiBoundary = "Generated document lifecycle is available only through guarded PHI routes.";

type LifecycleMutationData = GeneratedDocumentOutput | WorkflowSnapshot;

type LifecycleMutationResult = {
  data?: LifecycleMutationData;
  auditEvent?: Parameters<typeof redactAuditEvent>[0];
} | null;

export type DocumentLifecycleMutationInput = {
  format?: GeneratedDocumentFormat;
  externalReference?: string;
  reason?: string;
};

export type DocumentLifecycleRepositoryMode = "memory" | "prisma-ready";

export type DocumentLifecycleRepository = {
  mode: DocumentLifecycleRepositoryMode;
  findDocument(documentId: string): GeneratedDocument | null;
  latestOutput(documentId: string): GeneratedDocumentOutput | null;
  render(
    access: PhiAccessContext,
    documentId: string,
    format: GeneratedDocumentFormat
  ): LifecycleMutationResult;
  exportOutput(access: PhiAccessContext, documentId: string): LifecycleMutationResult;
  sign(access: PhiAccessContext, documentId: string): LifecycleMutationResult;
  confirmEcwUpload(
    access: PhiAccessContext,
    documentId: string,
    input: { externalReference: string; reason: string }
  ): LifecycleMutationResult;
  voidOutput(
    access: PhiAccessContext,
    documentId: string,
    input: { reason: string }
  ): LifecycleMutationResult;
  recordManualEditException(
    access: PhiAccessContext,
    documentId: string,
    input: { reason: string }
  ): LifecycleMutationResult;
};

function actorContext(access: PhiAccessContext) {
  return {
    role: access.role,
    userId: `PROTO-${access.role}`,
    userName: access.role === "SYSTEM" ? "Prototype System" : `Prototype ${access.role}`,
    reason: access.reason
  };
}

export const inMemoryDocumentLifecycleRepository: DocumentLifecycleRepository = {
  mode: "memory",
  findDocument(documentId) {
    return generatedDocuments.find((document) => document.id === documentId) ?? null;
  },
  latestOutput(documentId) {
    return latestGeneratedDocumentOutput(documentId);
  },
  render(access, documentId, format) {
    return renderGeneratedDocument(documentId, format, actorContext(access));
  },
  exportOutput(access, documentId) {
    return exportGeneratedDocumentOutput(documentId, actorContext(access));
  },
  sign(access, documentId) {
    const result = signGeneratedDocument(documentId, actorContext(access));
    return result
      ? { data: latestGeneratedDocumentOutput(documentId) ?? undefined, auditEvent: result.auditEvent }
      : null;
  },
  confirmEcwUpload(access, documentId, input) {
    return confirmGeneratedDocumentEcwUpload(documentId, input, actorContext(access));
  },
  voidOutput(access, documentId, input) {
    return voidGeneratedDocumentOutput(documentId, input, actorContext(access));
  },
  recordManualEditException(access, documentId, input) {
    return recordGeneratedDocumentManualEditException(documentId, input, actorContext(access));
  }
};

export const documentLifecycleRepository = inMemoryDocumentLifecycleRepository;

function documentDto(document: GeneratedDocument): DocumentLifecycleDocumentDto {
  const { patientId, courseId, ...safeDocument } = document;

  return {
    ...safeDocument,
    patientRef: patientRef(patientId),
    courseRef: courseRef(courseId),
    version: document.version ?? latestGeneratedDocumentOutput(document.id)?.version ?? 0
  };
}

function outputDto(output: GeneratedDocumentOutput | null): DocumentLifecycleOutputDto | undefined {
  if (!output) {
    return undefined;
  }

  const { patientId, courseId, contentPreview, ...safeOutput } = output;
  void contentPreview;
  return {
    ...safeOutput,
    patientRef: patientRef(patientId),
    courseRef: courseRef(courseId)
  };
}

function auditDto(result: LifecycleMutationResult | undefined): OperationalAuditEvent | undefined {
  return result?.auditEvent ? redactAuditEvent(result.auditEvent) : undefined;
}

function mutationOutput(result: LifecycleMutationResult): GeneratedDocumentOutput | null {
  const data = result?.data;
  return data && "documentId" in data ? data : null;
}

function resultForDocument(
  document: GeneratedDocument | null,
  output?: GeneratedDocumentOutput | null,
  mutation?: LifecycleMutationResult
): DocumentLifecycleResult {
  const resolvedOutput = output ?? (document ? documentLifecycleRepository.latestOutput(document.id) : null);

  return {
    document: document ? documentDto(document) : null,
    output: outputDto(resolvedOutput),
    auditEvent: auditDto(mutation),
    phiBoundary
  };
}

function notFoundResult(): DocumentLifecycleResult {
  return {
    document: null,
    phiBoundary,
    blockedReason: "Document not found."
  };
}

function blockedResult(document: GeneratedDocument | null, blockedReason: string): DocumentLifecycleResult {
  return {
    document: document ? documentDto(document) : null,
    output: document ? outputDto(documentLifecycleRepository.latestOutput(document.id)) : undefined,
    phiBoundary,
    blockedReason
  };
}

function requirementForDocument(document: GeneratedDocument) {
  return documentRequirements.find(
    (requirement) => requirement.id === document.templateId || requirement.name === document.name
  ) ?? null;
}

function activeTemplateBlocker(document: GeneratedDocument) {
  const requirement = requirementForDocument(document);
  const source = requirement
    ? templateSources.find((candidate) => candidate.id === requirement.templateSourceId)
    : null;
  const readiness = requirement ? readinessForRequirement(requirement) : null;

  if (!requirement) {
    return "Document is not linked to an approved document requirement.";
  }

  if (!source) {
    return "Document requirement is not linked to a template source.";
  }

  if (source.status !== "ACTIVE") {
    return `Template source is ${source.status}; resolve mapping before generating output.`;
  }

  if (!readiness?.readyForPilot) {
    return readiness?.blockers.length
      ? `Template source is not pilot-ready: ${readiness.blockers.join("; ")}.`
      : "Template source is not pilot-ready for generated output.";
  }

  return null;
}

function requireDocumentAction(access: PhiAccessContext, action: Parameters<typeof roleCan>[1]) {
  if (!roleCan(access.role, action)) {
    throw new Error("PHI access denied");
  }
}

function safeRequiredText(value: string | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function readGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string
): DocumentLifecycleResult {
  requirePhiAction(access, "phi:read");
  const document = documentLifecycleRepository.findDocument(documentId);

  return document
    ? resultForDocument(document)
    : notFoundResult();
}

export function renderGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string,
  format: GeneratedDocumentFormat = "PDF"
): DocumentLifecycleResult {
  requirePhiAction(access, "document:render");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  const blocker = activeTemplateBlocker(document);
  if (blocker) {
    return blockedResult(document, blocker);
  }

  if (document.lockedAt || document.signReviewState === "SIGNED") {
    return blockedResult(document, "Signed documents are locked; record a manual edit exception before regenerating.");
  }

  const result = documentLifecycleRepository.render(access, documentId, format);

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), mutationOutput(result), result)
    : notFoundResult();
}

export function exportGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string
): DocumentLifecycleResult {
  requireDocumentAction(access, "document:export");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  const blocker = activeTemplateBlocker(document);
  if (blocker) {
    return blockedResult(document, blocker);
  }

  const latestOutput = documentLifecycleRepository.latestOutput(documentId);
  if (!latestOutput || latestOutput.status === "VOIDED") {
    return blockedResult(document, "Render an active generated output before export.");
  }

  if (document.lockedAt || latestOutput.status === "LOCKED") {
    return blockedResult(document, "Signed and locked outputs cannot be exported again.");
  }

  const result = documentLifecycleRepository.exportOutput(access, documentId);

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), mutationOutput(result), result)
    : notFoundResult();
}

export function signGeneratedDocumentLifecycle(
  access: PhiAccessContext,
  documentId: string
): DocumentLifecycleResult {
  requirePhiAction(access, "document:sign");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  const latestOutput = documentLifecycleRepository.latestOutput(documentId);
  if (!latestOutput || !["READY", "EXPORTED"].includes(latestOutput.status)) {
    return blockedResult(document, "Render or export the latest generated output before signature.");
  }

  const result = documentLifecycleRepository.sign(access, documentId);

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), documentLifecycleRepository.latestOutput(documentId), result)
    : notFoundResult();
}

export function confirmGeneratedDocumentEcwUploadLifecycle(
  access: PhiAccessContext,
  documentId: string,
  input: DocumentLifecycleMutationInput
): DocumentLifecycleResult {
  requireDocumentAction(access, "document:upload_ecw");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  if (!document.signedAt || !document.lockedAt) {
    return blockedResult(document, "Document must be signed and locked before manual eCW upload confirmation.");
  }

  const externalReference = safeRequiredText(input.externalReference);
  if (!externalReference) {
    return blockedResult(document, "External eCW reference is required.");
  }

  const reason = safeRequiredText(input.reason);
  if (!reason) {
    return blockedResult(document, "Manual eCW upload confirmation reason is required.");
  }

  const result = documentLifecycleRepository.confirmEcwUpload(access, documentId, { externalReference, reason });

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), mutationOutput(result), result)
    : notFoundResult();
}

export function voidGeneratedDocumentOutputLifecycle(
  access: PhiAccessContext,
  documentId: string,
  input: DocumentLifecycleMutationInput
): DocumentLifecycleResult {
  requireDocumentAction(access, "document:void");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  if (!documentLifecycleRepository.latestOutput(documentId)) {
    return blockedResult(document, "No generated output exists to void.");
  }

  const reason = safeRequiredText(input.reason);
  if (!reason) {
    return blockedResult(document, "Void reason is required.");
  }

  const result = documentLifecycleRepository.voidOutput(access, documentId, { reason });

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), mutationOutput(result), result)
    : notFoundResult();
}

export function recordGeneratedDocumentManualEditExceptionLifecycle(
  access: PhiAccessContext,
  documentId: string,
  input: DocumentLifecycleMutationInput
): DocumentLifecycleResult {
  requireDocumentAction(access, "document:manual_edit");
  const document = documentLifecycleRepository.findDocument(documentId);

  if (!document) {
    return notFoundResult();
  }

  if (!document.signedAt && !document.lockedAt) {
    return blockedResult(document, "Manual edit exceptions are only needed after a document has been signed or locked.");
  }

  const reason = safeRequiredText(input.reason);
  if (!reason) {
    return blockedResult(document, "Manual edit exception reason is required.");
  }

  const result = documentLifecycleRepository.recordManualEditException(access, documentId, { reason });

  return result
    ? resultForDocument(documentLifecycleRepository.findDocument(documentId), mutationOutput(result), result)
    : notFoundResult();
}
