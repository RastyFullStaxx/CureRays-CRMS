import 'server-only';

import { randomUUID } from 'node:crypto';
import {
  commitGeneratedDocumentOutput,
  fractionLogEntries,
  generatedDocuments,
  getClinicalFormResponse,
  latestGeneratedDocumentOutput,
  patients,
  treatmentCourses,
} from '@/lib/clinical-store';
import { isVoidedFractionEntry } from '@/lib/services/fraction-worksheet-service';
import {
  generateClinicalFormDocx,
  generateFractionLogXlsx,
  type GeneratedDocumentArtifact,
} from '@/lib/services/document-generation-service';
import { removeGeneratedDocumentBytes, writeGeneratedDocumentBytes } from '@/lib/server/generated-document-storage';
import { requirePhiAction, type PhiAccessContext } from '@/lib/server/phi-store';
import { isPrismaPersistenceMode, persistDocumentLifecycleMutation } from '@/lib/server/write-through';
import {
  applicableDocumentRequirements,
  documentRequirementAppliesToCourse,
  documentRequirements,
  fieldMapForRequirement,
  templateSourceForRequirement,
} from '@/lib/template-registry';
import type {
  ClinicalFormResponse,
  DocumentRequirement,
  GeneratedDocumentOutput,
  TemplateFieldMap,
  TemplateSource,
  TreatmentCourse,
} from '@/lib/types';

export type GenerateDocumentRequest =
  | { kind: 'form'; courseId: string; requirementId: string }
  | { kind: 'fraction-log'; courseId: string };

export type GenerateDocumentResponse = {
  output: Pick<GeneratedDocumentOutput, 'id' | 'documentId' | 'format' | 'version' | 'status'>;
  downloadUrl: string;
};

export type GeneratedDocumentOutputServiceErrorCode =
  | 'ACCESS_DENIED'
  | 'PERSISTENCE_REQUIRED'
  | 'NOT_FOUND'
  | 'INAPPLICABLE'
  | 'TEMPLATE_NOT_READY'
  | 'SAVED_DATA_REQUIRED'
  | 'MISSING_REQUIRED_FIELDS'
  | 'STORAGE_WRITE_FAILED'
  | 'METADATA_WRITE_FAILED'
  | 'GENERATION_FAILED';

export class GeneratedDocumentOutputServiceError extends Error {
  readonly code: GeneratedDocumentOutputServiceErrorCode;

  constructor(code: GeneratedDocumentOutputServiceErrorCode) {
    super('Document generation failed.');
    this.name = 'GeneratedDocumentOutputServiceError';
    this.code = code;
  }
}

function strictKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === [...expected].sort()[index]);
}

function requiredText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
}

export function parseGenerateDocumentRequest(value: unknown): GenerateDocumentRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const kind = input.kind;
  const courseId = requiredText(input.courseId);

  if (kind === 'form' && courseId && strictKeys(input, ['kind', 'courseId', 'requirementId'])) {
    const requirementId = requiredText(input.requirementId);
    return requirementId ? { kind, courseId, requirementId } : null;
  }

  if (kind === 'fraction-log' && courseId && strictKeys(input, ['kind', 'courseId'])) {
    return { kind, courseId };
  }

  return null;
}

function missingValue(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

export function missingRequiredFormFieldIds(
  fieldMap: Pick<TemplateFieldMap, 'sections'>,
  responseData: ClinicalFormResponse['responseData'],
): string[] {
  const missing: string[] = [];

  for (const field of fieldMap.sections.flatMap((section) => section.fields).filter((item) => item.required)) {
    if (field.kind === 'grid') {
      const gridKeys = (field.rows ?? []).flatMap((row) =>
        (field.columns ?? []).map((column) => `${field.id}__${row.id}__${column.id}`),
      );
      if (gridKeys.length === 0 || gridKeys.some((key) => missingValue(responseData[key]))) missing.push(field.id);
    } else if (missingValue(responseData[field.id])) {
      missing.push(field.id);
    }
  }

  return missing;
}

function readyTemplate(
  requirement: DocumentRequirement,
  source: TemplateSource | undefined,
  fieldMap: TemplateFieldMap | undefined,
  format: 'DOCX' | 'XLSX',
): boolean {
  return Boolean(
    source?.status === 'ACTIVE' &&
      source.approvalStatus === 'PILOT_APPROVED' &&
      source.mimeType === format &&
      requirement.outputFormats.includes(format) &&
      requirement.pilotScope !== 'DEFERRED' &&
      fieldMap?.status === 'COMPLETE',
  );
}

function generatedDocumentFor(requirement: DocumentRequirement, courseId: string) {
  return generatedDocuments.find(
    (document) =>
      document.courseId === courseId &&
      (document.templateId === requirement.id || document.name === requirement.name),
  );
}

function resolveFormGeneration(course: TreatmentCourse, requirementId: string) {
  const patient = patients.find((item) => item.id === course.patientId);
  const requirement = documentRequirements.find((item) => item.id === requirementId);
  if (!patient || !requirement) throw new GeneratedDocumentOutputServiceError('NOT_FOUND');
  if (!documentRequirementAppliesToCourse(requirement, patient, course)) {
    throw new GeneratedDocumentOutputServiceError('INAPPLICABLE');
  }

  const source = templateSourceForRequirement(requirement);
  const fieldMap = fieldMapForRequirement(requirement);
  if (!readyTemplate(requirement, source, fieldMap, 'DOCX')) {
    throw new GeneratedDocumentOutputServiceError('TEMPLATE_NOT_READY');
  }

  const response = getClinicalFormResponse(course.id, requirement.id);
  if (!response || response.templateId !== fieldMap?.id) {
    throw new GeneratedDocumentOutputServiceError('SAVED_DATA_REQUIRED');
  }
  if (missingRequiredFormFieldIds(fieldMap, response.responseData).length > 0) {
    throw new GeneratedDocumentOutputServiceError('MISSING_REQUIRED_FIELDS');
  }

  const document = generatedDocumentFor(requirement, course.id);
  if (!document) throw new GeneratedDocumentOutputServiceError('NOT_FOUND');
  return { document, requirement };
}

function resolveFractionGeneration(course: TreatmentCourse) {
  const patient = patients.find((item) => item.id === course.patientId);
  if (!patient) throw new GeneratedDocumentOutputServiceError('NOT_FOUND');

  const applicable = applicableDocumentRequirements(patient, course).filter((requirement) =>
    requirement.outputFormats.includes('XLSX'),
  );
  if (applicable.length === 0) throw new GeneratedDocumentOutputServiceError('INAPPLICABLE');

  const requirement = applicable.find((candidate) =>
    readyTemplate(candidate, templateSourceForRequirement(candidate), fieldMapForRequirement(candidate), 'XLSX'),
  );
  if (!requirement) throw new GeneratedDocumentOutputServiceError('TEMPLATE_NOT_READY');
  if (!fractionLogEntries.some((entry) => entry.courseId === course.id && !isVoidedFractionEntry(entry))) {
    throw new GeneratedDocumentOutputServiceError('SAVED_DATA_REQUIRED');
  }

  const document = generatedDocumentFor(requirement, course.id);
  if (!document) throw new GeneratedDocumentOutputServiceError('NOT_FOUND');
  return { document };
}

async function renderArtifact(input: GenerateDocumentRequest, course: TreatmentCourse): Promise<{
  artifact: GeneratedDocumentArtifact;
  documentId: string;
  format: 'DOCX' | 'XLSX';
}> {
  if (input.kind === 'form') {
    const resolved = resolveFormGeneration(course, input.requirementId);
    const artifact = await generateClinicalFormDocx(course.id, resolved.requirement.id);
    if (!artifact) throw new GeneratedDocumentOutputServiceError('GENERATION_FAILED');
    return { artifact, documentId: resolved.document.id, format: 'DOCX' };
  }

  const resolved = resolveFractionGeneration(course);
  const artifact = await generateFractionLogXlsx(course.id);
  if (!artifact) throw new GeneratedDocumentOutputServiceError('GENERATION_FAILED');
  return { artifact, documentId: resolved.document.id, format: 'XLSX' };
}

export async function generateGeneratedDocumentOutput(
  access: PhiAccessContext,
  input: GenerateDocumentRequest,
): Promise<GenerateDocumentResponse> {
  try {
    requirePhiAction(access, 'document:render');
  } catch {
    throw new GeneratedDocumentOutputServiceError('ACCESS_DENIED');
  }

  if (!isPrismaPersistenceMode()) {
    throw new GeneratedDocumentOutputServiceError('PERSISTENCE_REQUIRED');
  }

  const course = treatmentCourses.find((item) => item.id === input.courseId);
  if (!course) throw new GeneratedDocumentOutputServiceError('NOT_FOUND');

  const rendered = await renderArtifact(input, course);
  const version = (latestGeneratedDocumentOutput(rendered.documentId)?.version ?? 0) + 1;
  const id = `OUT-${randomUUID()}`;
  const storageKey = `${randomUUID()}.${rendered.format.toLowerCase()}`;
  const renderedAt = new Date().toISOString();

  try {
    await writeGeneratedDocumentBytes(storageKey, rendered.artifact.buffer);
  } catch {
    throw new GeneratedDocumentOutputServiceError('STORAGE_WRITE_FAILED');
  }

  let committed: ReturnType<typeof commitGeneratedDocumentOutput> | undefined;
  try {
    committed = commitGeneratedDocumentOutput(
      {
        id,
        documentId: rendered.documentId,
        format: rendered.format,
        version,
        storageKey,
        renderedAt,
      },
      access,
    );
    await persistDocumentLifecycleMutation(rendered.documentId, committed.auditEvent.id);
  } catch {
    committed?.rollback();
    await removeGeneratedDocumentBytes(storageKey).catch(() => undefined);
    throw new GeneratedDocumentOutputServiceError('METADATA_WRITE_FAILED');
  }

  const { output } = committed;
  return {
    output: {
      id: output.id,
      documentId: output.documentId,
      format: output.format,
      version: output.version,
      status: output.status,
    },
    downloadUrl: `/api/generated-document-outputs/${encodeURIComponent(output.id)}/download`,
  };
}
