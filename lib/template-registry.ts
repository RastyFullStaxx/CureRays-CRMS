import registryDataJson from "@/lib/template-registry-data.json";
import type {
  CarepathTask,
  DocumentRequirement,
  DocumentTemplate,
  GeneratedDocument,
  InternalFormTemplate,
  Patient,
  TemplateFieldMap,
  TemplateRegistryData,
  TemplateRequirementReadiness,
  TemplateSource,
  TreatmentCourse,
  WorkflowDefinition,
  WorkflowDocumentState
} from "@/lib/types";
import { completedDocumentStatuses, orderedCarepathPhases } from "@/lib/workflow";

const registryData = registryDataJson as unknown as TemplateRegistryData;

export const templateRegistrySchemaVersion = registryData.schemaVersion;
export const templateRegistryGeneratedAt = registryData.generatedAt;
export const templateSources = registryData.templateSources;
export const documentRequirements = registryData.documentRequirements;
export const workflowDefinitions: WorkflowDefinition[] = registryData.workflowDefinitions.map((workflow) => ({
  ...workflow,
  phases: workflow.phases.length > 0 ? workflow.phases : orderedCarepathPhases
}));
export const templateFieldMaps = registryData.templateFieldMaps;
export const templateRegistryPlaceholders = registryData.templateRegistryPlaceholders;

export function templateSourceForRequirement(requirement: DocumentRequirement) {
  return templateSources.find((source) => source.id === requirement.templateSourceId);
}

export function fieldMapForRequirement(requirement: DocumentRequirement) {
  return templateFieldMaps.find((fieldMap) => fieldMap.id === requirement.fieldMapId);
}

export function readinessForRequirement(requirement: DocumentRequirement): TemplateRequirementReadiness {
  const source = templateSourceForRequirement(requirement);
  const fieldMap = fieldMapForRequirement(requirement);
  const pilotScope = requirement.pilotScope ?? "IN_SCOPE";
  const generationReadiness = requirement.generationReadiness ?? (pilotScope === "IN_SCOPE" ? "READY_FOR_PILOT" : "DEFERRED");
  const blockers: string[] = [];

  if (pilotScope === "IN_SCOPE") {
    if (!source) {
      blockers.push("Missing template source");
    } else {
      if (source.status === "MISSING") {
        blockers.push("Template source missing");
      }

      if (source.approvalStatus !== "PILOT_APPROVED") {
        blockers.push("Pilot approval pending");
      }
    }

    if (!fieldMap) {
      blockers.push("Field map missing");
    } else if (fieldMap.status !== "COMPLETE") {
      blockers.push("Field map incomplete");
    }
  }

  return {
    requirementId: requirement.id,
    templateSourceId: requirement.templateSourceId,
    fieldMapId: requirement.fieldMapId,
    sourceStatus: source?.status ?? "UNKNOWN",
    fieldMapStatus: fieldMap?.status ?? "MISSING",
    approvalStatus: source?.approvalStatus ?? "UNKNOWN",
    pilotScope,
    generationReadiness,
    readyForPilot: pilotScope === "IN_SCOPE" && blockers.length === 0,
    blockers
  };
}

export const templateRequirementReadiness = documentRequirements.map(readinessForRequirement);

function documentTemplateFileType(source: TemplateSource | undefined): DocumentTemplate["fileType"] {
  if (!source || source.mimeType === "UNKNOWN" || source.mimeType === "FOLDER") {
    return undefined;
  }

  return source.mimeType;
}

export const documentTemplates: DocumentTemplate[] = documentRequirements.map((requirement) => {
  const source = templateSourceForRequirement(requirement);

  return {
    id: requirement.id.replace("REQ-", "TPL-"),
    name: requirement.name,
    diagnosis: requirement.applicability.diagnosis,
    protocol: requirement.applicability.protocol ?? (requirement.applicability.universal ? "Universal" : "Registry"),
    category: requirement.workflowPhase,
    version: source?.version ?? (source?.status === "ACTIVE" ? "registry-active" : "registry-mapping"),
    requiredFields: requirement.requiredFields,
    status: source?.status === "ACTIVE" ? "ACTIVE" : source?.status === "RETIRED" ? "RETIRED" : "DRAFT",
    fileType: documentTemplateFileType(source),
    templateStorageProvider: source?.sourceFileName.startsWith("docs/") ? "LOCAL" : undefined,
    templateFileIdOrPath: source?.sourceFileName,
    active: source?.status === "ACTIVE"
  };
});

type InternalFormOutputFormat = InternalFormTemplate["outputFormats"][number];

function isInternalFormOutputFormat(format: DocumentRequirement["outputFormats"][number]): format is InternalFormOutputFormat {
  return format === "DOCX" || format === "PDF" || format === "XLSX";
}

function fieldMapToInternalForm(fieldMap: TemplateFieldMap): InternalFormTemplate | null {
  if (fieldMap.status !== "COMPLETE") {
    return null;
  }

  const requirement = documentRequirements.find((item) => item.id === fieldMap.requirementId);
  if (!requirement) {
    return null;
  }

  const source = templateSourceForRequirement(requirement);
  if (!source || source.status === "MISSING") {
    return null;
  }

  const outputFormats = requirement.outputFormats.filter(isInternalFormOutputFormat);
  if (outputFormats.length === 0) {
    return null;
  }

  return {
    id: fieldMap.id.replace("MAP-", "FORM-"),
    name: requirement.name,
    diagnosis: requirement.applicability.diagnosis,
    protocol: requirement.applicability.protocol ?? (requirement.applicability.universal ? "Universal" : "Registry"),
    sourceDriveFileId: source.driveFileId ?? source.id,
    sourceDriveUrl: source.driveUrl ?? "",
    sourceFileName: source.sourceFileName,
    outputFormats,
    sections: fieldMap.sections
  };
}

export const internalFormTemplates: InternalFormTemplate[] = templateFieldMaps
  .map(fieldMapToInternalForm)
  .filter((template): template is InternalFormTemplate => Boolean(template));

function protocolMatches(requirementProtocol: string | undefined, course: TreatmentCourse) {
  if (!requirementProtocol) {
    return true;
  }

  const normalizedRequirement = requirementProtocol.toLowerCase();
  const normalizedCourse = `${course.protocolName} ${course.treatmentModality} ${course.treatmentType}`.toLowerCase();
  return normalizedCourse.includes(normalizedRequirement) || normalizedRequirement === "universal";
}

function bodyRegionMatches(requirementBodyRegion: string | undefined, course: TreatmentCourse) {
  if (!requirementBodyRegion) {
    return true;
  }

  const normalizedRequirement = requirementBodyRegion.toLowerCase();
  const normalizedCourse =
    `${course.diagnosis} ${course.protocolName} ${course.treatmentType} ${course.bodyRegion ?? ""} ${course.applicator ?? ""} ${course.targetDepth ?? ""}`.toLowerCase();
  const aliases: Record<string, string[]> = {
    hand: ["hand", "thumb", "finger", "palm", "wrist"],
    foot: ["foot", "toe", "ankle"],
    knee: ["knee"]
  };
  const matchTerms = aliases[normalizedRequirement] ?? [normalizedRequirement];

  return matchTerms.some((term) => normalizedCourse.includes(term));
}

export function documentRequirementAppliesToCourse(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
) {
  if (requirement.applicability.universal || requirement.applicability.diagnosis === "ALL") {
    return true;
  }

  return (
    requirement.applicability.diagnosis === patient.diagnosisCategory &&
    protocolMatches(requirement.applicability.protocol, course) &&
    bodyRegionMatches(requirement.applicability.bodyRegion, course)
  );
}

export function applicableDocumentRequirements(patient: Patient, course: TreatmentCourse) {
  return documentRequirements.filter((requirement) => documentRequirementAppliesToCourse(requirement, patient, course));
}

export function patientTrackingDocumentRequirements(patient: Patient, course: TreatmentCourse) {
  return applicableDocumentRequirements(patient, course).filter((requirement) => requirement.autoCreate !== false);
}

export function deriveDocumentStateFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse,
  documents: GeneratedDocument[]
): WorkflowDocumentState {
  const existing = documents.find(
    (document) =>
      document.courseId === course.id &&
      (document.templateId === requirement.id || document.name === requirement.name)
  );
  const source = templateSourceForRequirement(requirement);
  const fieldMap = fieldMapForRequirement(requirement);
  const status = existing?.status ?? requirement.defaultStatus;

  return {
    requirementId: requirement.id,
    documentId: existing?.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    workflowPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status,
    requiredAction: existing?.requiredAction ?? requirement.requiredAction,
    auditReady: existing?.auditReady ?? completedDocumentStatuses.includes(status),
    templateSourceStatus: source?.status,
    sourceDriveUrl: source?.driveUrl,
    mapped: source?.status === "ACTIVE" && fieldMap?.status === "COMPLETE"
  };
}

export function deriveWorkflowDocumentStates(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  return patients.flatMap((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return [];
    }

    return patientTrackingDocumentRequirements(patient, course).map((requirement) =>
      deriveDocumentStateFromRequirement(requirement, patient, course, documents)
    );
  });
}

export function createGeneratedDocumentFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
): GeneratedDocument {
  return {
    id: `DOC-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    templateId: requirement.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    clinicalPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status: requirement.defaultStatus,
    requiredAction: requirement.requiredAction,
    cptCode: requirement.cptCode,
    assignedTo: requirement.responsibleParty,
    lastUpdatedAt: patient.lastUpdatedAt,
    signReviewState:
      requirement.defaultStatus === "READY_FOR_REVIEW"
        ? "READY_FOR_SIGNATURE"
        : requirement.defaultStatus === "NEEDS_REVIEW" || requirement.defaultStatus === "MISSING_FIELDS"
          ? "REVIEW_REQUIRED"
          : "NOT_STARTED",
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus)
  };
}

export function ensureRequirementDocuments(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    patientTrackingDocumentRequirements(patient, course).forEach((requirement) => {
      const exists = documents.some(
        (document) =>
          document.courseId === course.id &&
          (document.templateId === requirement.id || document.name === requirement.name)
      );

      if (!exists) {
        documents.push(createGeneratedDocumentFromRequirement(requirement, patient, course));
      }
    });
  });
}

export function createTaskFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
): CarepathTask | null {
  if (!requirement.createsTask) {
    return null;
  }

  return {
    id: `TASK-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    courseId: course.id,
    taskNumber: requirement.taskNumber ?? requirement.id.replace("REQ-", ""),
    title: requirement.taskTitle ?? requirement.name,
    workflowPhase: requirement.workflowPhase,
    documentName: requirement.name,
    status: completedDocumentStatuses.includes(requirement.defaultStatus) ? "COMPLETED" : "PENDING",
    responsibleParty: requirement.responsibleParty,
    timing: requirement.timing ?? requirement.applicability.requiredWhen ?? "As required by workflow",
    noteAction: requirement.requiredAction,
    cptCodes: requirement.cptCode ? [requirement.cptCode] : ["N/A"],
    auditSteps: requirement.auditSteps ?? ["Document status reviewed"],
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus),
    dueDate: patient.lastUpdatedAt.slice(0, 10),
    lastUpdatedAt: patient.lastUpdatedAt,
    assignedUser: requirement.responsibleParty
  };
}

export function ensureRequirementTasks(
  patients: Patient[],
  courses: TreatmentCourse[],
  tasks: CarepathTask[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    patientTrackingDocumentRequirements(patient, course).forEach((requirement) => {
      const task = createTaskFromRequirement(requirement, patient, course);
      const exists =
        !task ||
        tasks.some((item) => item.courseId === course.id && item.documentName === requirement.name);

      if (task && !exists) {
        tasks.push(task);
      }
    });
  });
}
