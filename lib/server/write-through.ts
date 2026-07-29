import "server-only";

import {
  auditEvents,
  carepathTasks,
  clinicalFormResponses,
  courseFolderPlaceholders,
  fractionLogEntries,
  generatedDocumentOutputs,
  generatedDocuments,
  mappingRecords,
  patientCourseAuditChecks,
  patientCourseWorkflowSteps,
  prescriptions,
  simulationOrders,
  treatmentCourses,
  treatmentFractions,
} from "@/lib/clinical-store";
import { patientRef as patientRefFor, redactAuditEvent } from "@/lib/hipaa";
import type {
  AuditEvent,
  CarepathTask,
  ClinicalFormResponse,
  CourseFolderPlaceholder,
  FractionLogEntry,
  GeneratedDocument,
  GeneratedDocumentOutput,
  MappingRecord,
  Prescription,
  SimulationOrder,
  TreatmentCourse,
  TreatmentFraction,
  AuditCheck,
  WorkflowStep,
} from "@/lib/types";

export class PersistenceWriteError extends Error {
  constructor() {
    super("Persistence write-through failed.");
    this.name = "PersistenceWriteError";
  }
}

export function isPrismaPersistenceMode(): boolean {
  return String(process.env.CURERAYS_PERSISTENCE_MODE ?? "").trim().toLowerCase() === "prisma";
}

type PrismaRecord = Record<string, unknown>;

type PrismaDelegateLike = {
  upsert(args: unknown): Promise<PrismaRecord>;
};

type PrismaClientLike = Record<string, unknown> & {
  $transaction<T>(callback: (tx: PrismaClientLike) => Promise<T>): Promise<T>;
  $disconnect(): Promise<void>;
};

function loadPrismaClient(moduleName: ".prisma/ops-client" | ".prisma/phi-client"): PrismaClientLike {
  if (
    (moduleName === ".prisma/ops-client" && !process.env.OPS_DATABASE_URL) ||
    (moduleName === ".prisma/phi-client" && !process.env.PHI_DATABASE_URL)
  ) {
    throw new PersistenceWriteError();
  }

  try {
    const requireFn = eval("require") as NodeRequire;
    const moduleValue = requireFn(moduleName) as { PrismaClient?: new () => PrismaClientLike };
    if (!moduleValue.PrismaClient) {
      throw new PersistenceWriteError();
    }

    return new moduleValue.PrismaClient();
  } catch {
    throw new PersistenceWriteError();
  }
}

function delegate(client: PrismaClientLike, name: string): PrismaDelegateLike {
  const value = client[name];
  if (!value || typeof value !== "object") {
    throw new PersistenceWriteError();
  }

  return value as PrismaDelegateLike;
}

function dateTime(value: string | Date | null | undefined, fallback = new Date()): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  const parsed = new Date(String(value ?? ""));
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function optionalDateTime(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function dateOnly(value: string | null | undefined, fallback = new Date()): Date {
  return dateTime(value ? `${value}T00:00:00.000Z` : undefined, fallback);
}

function persistedDocumentStatus(status: string): string {
  const allowed = new Set([
    "DRAFT",
    "PENDING_NEEDED",
    "MISSING_FIELDS",
    "READY_FOR_REVIEW",
    "SIGNED",
    "EXPORTED",
    "NOT_APPLICABLE",
    "NEEDS_REVIEW",
    "COMPLETED",
  ]);

  return allowed.has(status) ? status : "NEEDS_REVIEW";
}

/**
 * Coarse-grained pilot write-through: for the affected course, mirror the
 * OPS course row plus every course-scoped OPS row (workflow steps, tasks,
 * documents, audit checks, folder placeholder) back to PostgreSQL. Keys use
 * the same tokenization as hydration, so app-created rows survive a restart.
 */
async function persistCourseScopedOpsRows(tx: PrismaClientLike, course: TreatmentCourse) {
  const courseRef = course.id;
  const patientRef = patientRefFor(course.patientId);
  const workflowDefinitionId = course.workflowDefinitionId ?? "WF-UNIVERSAL";

  await upsertOperationalCourse(tx, course, patientRef);

  await Promise.all(
    patientCourseWorkflowSteps
      .filter((step) => step.courseId === course.id)
      .map((step) => upsertWorkflowStep(tx, step, courseRef, workflowDefinitionId))
  );

  await Promise.all(
    carepathTasks
      .filter((task) => task.courseId === course.id)
      .map((task) => upsertCarepathTask(tx, task, courseRef))
  );

  await Promise.all(
    generatedDocuments
      .filter((document) => document.courseId === course.id)
      .map((document) => upsertGeneratedDocument(tx, document, patientRef, courseRef))
  );

  await Promise.all(
    patientCourseAuditChecks
      .filter((check) => check.courseId === course.id)
      .map((check) => upsertAuditCheck(tx, check, courseRef))
  );

  await Promise.all(
    courseFolderPlaceholders
      .filter((folder) => folder.courseId === course.id)
      .map((folder) => upsertFolderPlaceholder(tx, folder))
  );
}

function upsertOperationalCourse(tx: PrismaClientLike, course: TreatmentCourse, patientRef: string) {
  const data = {
    patientRef,
    diagnosisCategory: course.diagnosisCategory,
    protocolFamily: course.protocolName,
    workflowDefinitionId: course.workflowDefinitionId,
    bodyRegion: course.bodyRegion,
    laterality: course.laterality,
    totalFractions: course.totalFractions,
    currentFraction: course.currentFraction,
    chartRoundsPhase: course.chartRoundsPhase,
    status: course.status,
    coursePhase: course.coursePhase,
  };

  return delegate(tx, "operationalCourse").upsert({
    where: { courseRef: course.id },
    create: { courseRef: course.id, ...data },
    update: data,
  });
}

function upsertWorkflowStep(
  tx: PrismaClientLike,
  step: WorkflowStep,
  courseRef: string,
  workflowDefinitionId: string
) {
  const shared = {
    workflowDefinitionId,
    stepName: step.stepName,
    phase: step.phase,
    status: step.status,
    applicability: step.applicability ?? null,
    requirementIds: step.requirementIds ?? [],
    responsibleRole: step.responsibleRole,
    assignedUserId: step.assignedUserId ?? null,
    triggerEvent: step.triggerEvent,
    dueDate: optionalDateTime(step.dueDate),
    requiresSignature: step.requiresSignature,
    signedByUserId: step.signedByUserId ?? null,
    signedAt: optionalDateTime(step.signedAt),
    linkedDocumentId: step.linkedDocumentId,
    naReason: step.naReason,
    systemReason: step.systemReason ?? null,
    blockers: step.blockers,
    auditChecklist: step.auditChecklist,
    notes: step.notes,
    updatedAt: dateTime(step.updatedAt),
  };

  return delegate(tx, "operationalWorkflowStep").upsert({
    where: { id: step.id },
    create: {
      id: step.id,
      courseRef,
      stepNumber: step.stepNumber,
      createdAt: dateTime(step.createdAt),
      ...shared,
    },
    update: shared,
  });
}

function upsertCarepathTask(tx: PrismaClientLike, task: CarepathTask, courseRef: string) {
  const shared = {
    title: task.title,
    workflowPhase: task.workflowPhase,
    documentName: task.documentName,
    status: task.status,
    responsibleParty: task.responsibleParty,
    timing: task.timing,
    noteAction: task.noteAction,
    cptCodes: task.cptCodes,
    auditSteps: task.auditSteps,
    auditReady: task.auditReady,
    dueDate: optionalDateTime(task.dueDate),
    completedAt: optionalDateTime(task.completedAt),
    signedAt: optionalDateTime(task.signedAt),
    lastUpdatedAt: dateTime(task.lastUpdatedAt),
    assignedUser: task.assignedUser,
  };

  return delegate(tx, "carepathTask").upsert({
    where: { id: task.id },
    create: { id: task.id, courseRef, taskNumber: task.taskNumber, ...shared },
    update: shared,
  });
}

function upsertGeneratedDocument(
  tx: PrismaClientLike,
  document: GeneratedDocument,
  patientRef: string,
  courseRef: string
) {
  const shared = {
    name: document.name,
    clinicalPhase: document.clinicalPhase,
    responsibleParty: document.responsibleParty,
    status: persistedDocumentStatus(document.status),
    requiredAction: document.requiredAction,
    cptCode: document.cptCode,
    assignedTo: document.assignedTo,
    lastUpdatedAt: dateTime(document.lastUpdatedAt),
    signedAt: optionalDateTime(document.signedAt),
    exportedAt: optionalDateTime(document.exportedAt),
    signReviewState: document.signReviewState,
    auditReady: document.auditReady,
  };

  return delegate(tx, "generatedDocument").upsert({
    where: { id: document.id },
    create: {
      id: document.id,
      templateId: document.templateId,
      patientRef,
      courseRef,
      ...shared,
    },
    update: shared,
  });
}

function upsertAuditCheck(tx: PrismaClientLike, check: AuditCheck, courseRef: string) {
  const shared = {
    category: check.category,
    label: check.label,
    status: check.status,
    required: check.required,
    evidenceDocumentId: check.evidenceDocumentId,
    notes: check.notes,
    completedByUserId: check.completedByUserId,
    completedAt: optionalDateTime(check.completedAt),
    naReason: check.naReason,
  };

  return delegate(tx, "operationalAuditCheck").upsert({
    where: { id: check.id },
    create: { id: check.id, courseRef, ...shared },
    update: shared,
  });
}

function upsertFolderPlaceholder(tx: PrismaClientLike, folder: CourseFolderPlaceholder) {
  const shared = {
    patientRef: folder.patientRef,
    courseRef: folder.courseRef,
    storageProvider: folder.storageProvider,
    path: folder.path,
    folders: folder.folders,
    status: folder.status,
  };

  return delegate(tx, "courseFolderPlaceholder").upsert({
    where: { id: folder.id },
    create: { id: folder.id, createdAt: dateTime(folder.createdAt), ...shared },
    update: shared,
  });
}

function upsertOperationalAuditEvent(tx: PrismaClientLike, event: AuditEvent) {
  const redacted = redactAuditEvent(event);
  const shared = {
    patientRef: redacted.patientRef ?? null,
    userId: redacted.userId,
    userName: redacted.userName,
    role: redacted.role,
    sessionId: redacted.sessionId,
    ipAddress: redacted.ipAddress,
    deviceId: redacted.deviceId,
    action: redacted.action,
    entityType: redacted.entityType,
    entityId: redacted.entityId,
    previousValue: redacted.previousValue,
    newValue: redacted.newValue,
    redacted: redacted.redacted,
    timestamp: dateTime(redacted.timestamp),
    reason: redacted.reason,
  };

  return delegate(tx, "operationalAuditEvent").upsert({
    where: { id: redacted.id },
    create: { id: redacted.id, ...shared },
    update: shared,
  });
}

function upsertTreatmentCoursePhi(tx: PrismaClientLike, course: TreatmentCourse) {
  const shared = {
    patientId: course.patientId,
    diagnosis: course.diagnosis,
    diagnosisCategory: course.diagnosisCategory,
    protocolName: course.protocolName,
    totalFractions: course.totalFractions,
    currentFraction: course.currentFraction,
    startDate: dateOnly(course.startDate),
    endDate: optionalDateTime(course.endDate ? `${course.endDate}T00:00:00.000Z` : null),
    chartRoundsPhase: course.chartRoundsPhase,
    status: course.status,
    treatmentModality: course.treatmentModality,
    treatmentType: course.treatmentType,
    workflowDefinitionId: course.workflowDefinitionId,
    bodyRegion: course.bodyRegion,
    laterality: course.laterality,
    coursePhase: course.coursePhase,
    phaseOne: course.phaseOne,
    phaseTwo: course.phaseTwo,
    energy: course.energy,
    applicator: course.applicator,
    dose: course.dose,
    targetDepth: course.targetDepth,
    fieldDesign: course.fieldDesign,
    notes: course.notes,
  };

  return delegate(tx, "treatmentCoursePhi").upsert({
    where: { id: course.id },
    create: { id: course.id, courseRef: course.id, ...shared },
    update: shared,
  });
}

function upsertFractionLogEntry(tx: PrismaClientLike, entry: FractionLogEntry) {
  const shared = {
    fractionNumber: entry.fractionNumber,
    status: entry.status,
    date: dateOnly(entry.date),
    phase: entry.phase,
    energy: entry.energy,
    energyKv: entry.energyKv ?? null,
    ssd: entry.ssd,
    ssdCm: entry.ssdCm ?? null,
    fieldSizeCm: entry.fieldSizeCm ?? null,
    treatmentTimeMinutes: entry.treatmentTimeMinutes ?? null,
    dosePerFraction: entry.dosePerFraction,
    dosePerFractionCgy: entry.dosePerFractionCgy ?? null,
    cumulativeDose: entry.cumulativeDose,
    cumulativeDoseCgy: entry.cumulativeDoseCgy ?? null,
    technicianInitials: entry.technicianInitials,
    mdApproval: entry.mdApproval,
    mdApprovalState: entry.mdApprovalState ?? null,
    mdApprovedAt: optionalDateTime(entry.mdApprovedAt),
    mdApprovedByUserId: entry.mdApprovedByUserId ?? null,
    dotApproval: entry.dotApproval,
    dotApprovalState: entry.dotApprovalState ?? null,
    dotApprovedAt: optionalDateTime(entry.dotApprovedAt),
    dotApprovedByUserId: entry.dotApprovedByUserId ?? null,
    depthOfTarget: entry.depthOfTarget,
    depthOfTargetMm: entry.depthOfTargetMm ?? null,
    isodosePercent: entry.isodosePercent,
    isodoseToDotPercent: entry.isodoseToDotPercent ?? null,
    doseToDepth: entry.doseToDepth,
    doseToDotCgy: entry.doseToDotCgy ?? null,
    cumulativeDoseToDepth: entry.cumulativeDoseToDepth,
    cumulativeDoseToDotCgy: entry.cumulativeDoseToDotCgy ?? null,
    treatmentSetupComments: entry.treatmentSetupComments ?? null,
    isodoseOverrideReason: entry.isodoseOverrideReason ?? null,
    calculationStatus: entry.calculationStatus ?? null,
    calculationReferenceVersion: entry.calculationMeta?.referenceVersion ?? null,
    calculationSourceTemplate: entry.calculationMeta?.sourceTemplate ?? null,
    calculationSourceTabs: entry.calculationMeta?.sourceTabs ?? [],
    calculationDepthRoundedMm: entry.calculationMeta?.depthRoundedMm ?? null,
    calculationLookupKey: entry.calculationMeta?.lookupKey ?? null,
    calculationClinicalValidationRequired: entry.calculationMeta?.clinicalValidationRequired ?? true,
    calculationWarnings: entry.calculationMeta?.warnings ?? [],
    isodoseNote: entry.isodoseNote ?? null,
    revisionApprovalType: entry.revisionApprovalType ?? null,
    revisionReason: entry.revisionReason ?? null,
    revisionRequestedAt: optionalDateTime(entry.revisionRequestedAt),
    revisionRequestedByUserId: entry.revisionRequestedByUserId ?? null,
    voidReason: entry.voidReason ?? null,
    voidedAt: optionalDateTime(entry.voidedAt),
    voidedByUserId: entry.voidedByUserId ?? null,
    correctionReason: entry.correctionReason ?? null,
    correctedAt: optionalDateTime(entry.correctedAt),
    correctedByUserId: entry.correctedByUserId ?? null,
    skinSurfaceDoseCgy: entry.skinSurfaceDoseCgy ?? null,
    cumulativeSkinSurfaceDoseCgy: entry.cumulativeSkinSurfaceDoseCgy ?? null,
    prescriptionMismatchFields: entry.prescriptionMismatchFields ?? [],
    prescriptionOverrideReason: entry.prescriptionOverrideReason ?? null,
    notes: entry.notes,
  };

  return delegate(tx, "fractionLogEntryPhi").upsert({
    where: { id: entry.id },
    create: { id: entry.id, courseId: entry.courseId, ...shared },
    update: shared,
  });
}

function upsertTreatmentFraction(tx: PrismaClientLike, fraction: TreatmentFraction) {
  const shared = {
    fractionNumber: fraction.fractionNumber,
    phase: fraction.phase,
    treatmentDate: dateOnly(fraction.treatmentDate),
    plannedDose: fraction.plannedDose,
    deliveredDose: fraction.deliveredDose ?? null,
    cumulativeDose: fraction.cumulativeDose,
    energy: fraction.energy ?? null,
    applicator: fraction.applicator ?? null,
    imageGuidanceCompleted: fraction.imageGuidanceCompleted,
    imageGuidanceStatus: fraction.imageGuidanceStatus ?? null,
    imageAssetIds: fraction.imageAssetIds ?? [],
    imageGuidanceNotApplicableReason: fraction.imageGuidanceNotApplicableReason ?? null,
    scheduledFromPrescription: fraction.scheduledFromPrescription ?? false,
    sourcePrescriptionId: fraction.sourcePrescriptionId ?? null,
    sourcePhaseId: fraction.sourcePhaseId ?? null,
    linkedFractionLogEntryId: fraction.linkedFractionLogEntryId ?? null,
    physicsCheckRequired: fraction.physicsCheckRequired ?? false,
    physicsCheckCompletedAt: optionalDateTime(fraction.physicsCheckCompletedAt),
    physicsCheckCompletedByUserId: fraction.physicsCheckCompletedByUserId ?? null,
    otvRequired: fraction.otvRequired ?? false,
    otvCompletedAt: optionalDateTime(fraction.otvCompletedAt),
    otvCompletedByUserId: fraction.otvCompletedByUserId ?? null,
    generatedAt: optionalDateTime(fraction.generatedAt),
    lockedAt: optionalDateTime(fraction.lockedAt),
    status: fraction.status,
    therapistId: fraction.therapistId ?? null,
    physicianReviewedAt: optionalDateTime(fraction.physicianReviewedAt),
    notes: fraction.notes ?? null,
  };

  return delegate(tx, "treatmentFractionPhi").upsert({
    where: { id: fraction.id },
    create: { id: fraction.id, courseId: fraction.courseId, ...shared },
    update: shared,
  });
}

function upsertSimulationOrder(tx: PrismaClientLike, order: SimulationOrder) {
  const shared = {
    patientId: order.patientId,
    lesionLocation: order.lesionLocation,
    laterality: order.laterality,
    lesionBorderInked: order.lesionBorderInked,
    allMarginsInked: order.allMarginsInked,
    phaseIMarginInstruction: order.phaseIMarginInstruction,
    phaseIIMarginInstruction: order.phaseIIMarginInstruction,
    chairSetup: order.chairSetup,
    position: order.position,
    setupPhotoChecklist: order.setupPhotoChecklist,
    ultrasoundFrequencies: order.ultrasoundFrequencies,
    specialPhysicsRequired: order.specialPhysicsRequired,
    specialPhysicsReason: order.specialPhysicsReason,
    weeklyPhysicsRequired: order.weeklyPhysicsRequired,
    weeklyPhysicsReason: order.weeklyPhysicsReason,
    inVivoDosimetryRequired: order.inVivoDosimetryRequired,
    radiationOncologist: order.radiationOncologist,
    dateCompleted: optionalDateTime(order.dateCompleted),
    signedAt: optionalDateTime(order.signedAt),
    status: order.status,
    lastUpdatedAt: dateTime(order.lastUpdatedAt),
  };

  return delegate(tx, "simulationOrderPhi").upsert({
    where: { id: order.id },
    create: { id: order.id, courseId: order.courseId, ...shared },
    update: shared,
  });
}

async function upsertPrescription(tx: PrismaClientLike, prescription: Prescription) {
  const shared = {
    patientId: prescription.patientId,
    site: prescription.site,
    laterality: prescription.laterality,
    verifiedInSensus: prescription.verifiedInSensus,
    imagingGuidance: prescription.imagingGuidance,
    priorRadiationTherapy: prescription.priorRadiationTherapy,
    preAuthorized: prescription.preAuthorized,
    signedAt: optionalDateTime(prescription.signedAt),
    dateOrdered: optionalDateTime(prescription.dateOrdered),
    status: prescription.status,
    lastUpdatedAt: dateTime(prescription.lastUpdatedAt),
  };

  await delegate(tx, "prescriptionPhi").upsert({
    where: { id: prescription.id },
    create: { id: prescription.id, courseId: prescription.courseId, ...shared },
    update: shared,
  });

  await Promise.all(
    prescription.phases.map((phase) => {
      const phaseShared = {
        phaseName: phase.phaseName,
        energyKv: phase.energyKv,
        phaseTotalDoseGy: phase.phaseTotalDoseGy,
        dosePerFractionGy: phase.dosePerFractionGy,
        totalFractions: phase.totalFractions,
        timeMinutes: phase.timeMinutes,
        ssdCm: phase.ssdCm,
        applicatorSize: phase.applicatorSize,
        marginMm: phase.marginMm,
        technique: phase.technique,
        shieldingDesign: phase.shieldingDesign,
        depthOfTargetMm: phase.depthOfTargetMm,
        skinSurfaceDoseCgy: phase.skinSurfaceDoseCgy ?? null,
      };

      return delegate(tx, "prescriptionPhasePhi").upsert({
        where: { id: phase.id },
        create: { id: phase.id, prescriptionId: prescription.id, ...phaseShared },
        update: phaseShared,
      });
    })
  );
}

function upsertClinicalFormResponse(tx: PrismaClientLike, response: ClinicalFormResponse) {
  const shared = {
    patientId: response.patientId,
    requirementId: response.requirementId,
    templateId: response.templateId,
    status: response.status,
    responseData: response.responseData,
    generatedDocumentId: response.generatedDocumentId ?? null,
    signedByUserId: response.signedByUserId ?? null,
    signedAt: optionalDateTime(response.signedAt),
    updatedAt: new Date(),
  };

  return delegate(tx, "clinicalFormResponsePhi").upsert({
    where: { id: response.id },
    create: { id: response.id, courseId: response.courseId, ...shared },
    update: shared,
  });
}

function upsertMappingRecord(tx: PrismaClientLike, record: MappingRecord) {
  const shared = {
    patientId: record.patientId,
    diagnosis: record.diagnosis,
    bodySite: record.bodySite,
    laterality: record.laterality,
    impressions: record.impressions,
    fieldDesignDecision: record.fieldDesignDecision,
    status: record.status,
    lastUpdatedAt: dateTime(record.lastUpdatedAt),
  };

  return delegate(tx, "mappingRecordPhi").upsert({
    where: { id: record.id },
    create: { id: record.id, courseId: record.courseId, ...shared },
    update: shared,
  });
}

function upsertGeneratedDocumentOutput(tx: PrismaClientLike, output: GeneratedDocumentOutput) {
  const shared = {
    documentId: output.documentId,
    patientId: output.patientId,
    format: output.format,
    version: output.version,
    status: output.status,
    driveFileUrl: output.driveFileUrl ?? output.storageUrl ?? null,
    contentPreview: output.contentPreview,
    renderedAt: dateTime(output.renderedAt),
  };

  return delegate(tx, "generatedDocumentOutputPhi").upsert({
    where: { id: output.id },
    create: { id: output.id, courseId: output.courseId, ...shared },
    update: shared,
  });
}

async function withClients<T>(
  needsOps: boolean,
  needsPhi: boolean,
  run: (ops: PrismaClientLike | null, phi: PrismaClientLike | null) => Promise<T>
): Promise<T> {
  const ops = needsOps ? loadPrismaClient(".prisma/ops-client") : null;
  const phi = needsPhi ? loadPrismaClient(".prisma/phi-client") : null;

  try {
    return await run(ops, phi);
  } catch (error) {
    if (error instanceof PersistenceWriteError) {
      throw error;
    }
    throw new PersistenceWriteError();
  } finally {
    await Promise.allSettled(
      [ops, phi].filter((client): client is PrismaClientLike => Boolean(client)).map((client) => client.$disconnect())
    );
  }
}

function courseById(courseId: string): TreatmentCourse | undefined {
  return treatmentCourses.find((course) => course.id === courseId);
}

/**
 * Write-through for a workflow-step / task / course-advance mutation. Persists
 * the affected course's OPS rows plus the recorded operational audit event.
 */
export async function persistCourseWorkflowMutation(
  courseId: string,
  auditEventId?: string,
  workflowStepId?: string,
  taskId?: string
): Promise<void> {
  if (!isPrismaPersistenceMode()) {
    return;
  }

  const course = courseById(courseId);
  if (!course) {
    return;
  }

  const auditEvent = auditEventId ? auditEvents.find((event) => event.id === auditEventId) : undefined;
  const workflowStep = workflowStepId
    ? patientCourseWorkflowSteps.find((step) => step.id === workflowStepId && step.courseId === courseId)
    : undefined;
  const task = taskId
    ? carepathTasks.find((item) => item.id === taskId && item.courseId === courseId)
    : undefined;

  if ((workflowStepId && !workflowStep) || (taskId && !task)) {
    throw new PersistenceWriteError();
  }

  await withClients(true, false, async (ops) => {
    if (!ops) {
      throw new PersistenceWriteError();
    }

    await ops.$transaction(async (tx) => {
      await persistCourseScopedOpsRows(tx, course);
      if (auditEvent) {
        await upsertOperationalAuditEvent(tx, auditEvent);
      }
    });
  });
}

/**
 * Write-through for a fraction-log / treatment-fraction / IGSRT mutation.
 * Persists the affected course's PHI clinical rows (fraction log entries,
 * scheduled treatment fractions, simulation order, prescription, mapping) and
 * the OPS-side operational audit event.
 */
export async function persistCourseClinicalMutation(courseId: string, auditEventId?: string): Promise<void> {
  if (!isPrismaPersistenceMode()) {
    return;
  }

  const course = courseById(courseId);
  if (!course) {
    return;
  }

  const auditEvent = auditEventId ? auditEvents.find((event) => event.id === auditEventId) : undefined;
  const courseFractionEntries = fractionLogEntries.filter((entry) => entry.courseId === courseId);
  const courseTreatmentFractions = treatmentFractions.filter((fraction) => fraction.courseId === courseId);
  const courseSimulationOrders = simulationOrders.filter((order) => order.courseId === courseId);
  const coursePrescriptions = prescriptions.filter((prescription) => prescription.courseId === courseId);
  const courseMappingRecords = mappingRecords.filter((record) => record.courseId === courseId);
  const courseClinicalFormResponses = clinicalFormResponses.filter((response) => response.courseId === courseId);
  const courseOutputs = generatedDocumentOutputs.filter((output) => output.courseId === courseId);

  await withClients(true, true, async (ops, phi) => {
    if (!ops || !phi) {
      throw new PersistenceWriteError();
    }

    await phi.$transaction(async (tx) => {
      await upsertTreatmentCoursePhi(tx, course);
      await Promise.all(courseFractionEntries.map((entry) => upsertFractionLogEntry(tx, entry)));
      await Promise.all(courseTreatmentFractions.map((fraction) => upsertTreatmentFraction(tx, fraction)));
      await Promise.all(courseSimulationOrders.map((order) => upsertSimulationOrder(tx, order)));
      await Promise.all(coursePrescriptions.map((prescription) => upsertPrescription(tx, prescription)));
      await Promise.all(courseMappingRecords.map((record) => upsertMappingRecord(tx, record)));
      await Promise.all(courseClinicalFormResponses.map((response) => upsertClinicalFormResponse(tx, response)));
      await Promise.all(courseOutputs.map((output) => upsertGeneratedDocumentOutput(tx, output)));
    });

    if (auditEvent) {
      await ops.$transaction(async (tx) => {
        await upsertOperationalAuditEvent(tx, auditEvent);
      });
    }
  });
}

/**
 * Write-through for a document-lifecycle mutation. The OPS GeneratedDocument
 * row and the PHI generated output rows for the affected course are mirrored,
 * plus the operational audit event.
 */
export async function persistDocumentLifecycleMutation(
  documentId: string,
  auditEventId?: string
): Promise<void> {
  if (!isPrismaPersistenceMode()) {
    return;
  }

  const document = generatedDocuments.find((item) => item.id === documentId);
  if (!document) {
    return;
  }

  const course = courseById(document.courseId);
  const auditEvent = auditEventId ? auditEvents.find((event) => event.id === auditEventId) : undefined;
  const patientRef = patientRefFor(document.patientId);
  const courseRef = document.courseId;
  const outputs = generatedDocumentOutputs.filter((output) => output.documentId === documentId);

  await withClients(true, true, async (ops, phi) => {
    if (!ops || !phi) {
      throw new PersistenceWriteError();
    }

    await ops.$transaction(async (tx) => {
      await upsertGeneratedDocument(tx, document, patientRef, courseRef);
      if (auditEvent) {
        await upsertOperationalAuditEvent(tx, auditEvent);
      }
    });

    if (course && outputs.length > 0) {
      await phi.$transaction(async (tx) => {
        await Promise.all(outputs.map((output) => upsertGeneratedDocumentOutput(tx, output)));
      });
    }
  });
}
