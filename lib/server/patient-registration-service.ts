import "server-only";

import type { NextRequest } from "next/server";
import {
  auditEvents,
  carepathTasks,
  createPatient,
  courseFolderPlaceholders,
  generatedDocuments,
  getPatientEditRecord as getPatientEditRecordFromStore,
  listPatientRecordHistory,
  operationalPatients,
  patientCourseAuditChecks,
  patientCourseWorkflowSteps,
  patientRecordHistory,
  patients,
  treatmentCourses,
  updatePatient,
  updatePatientLifecycle,
  validatePatientCreateInput,
  validatePatientLifecycleInput,
  validatePatientUpdateInput,
  type PatientMutationAuditContext
} from "@/lib/clinical-store";
import { phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";
import { prototypeSessionFromRequest } from "@/lib/server/prototype-session";
import type { RoleAction } from "@/lib/rbac";
import type {
  OperationalAuditEvent,
  OperationalPatient,
  OperationalTreatmentCourse,
  PatientEditDto,
  PatientLifecycleUpdateInput,
  PatientRecordHistoryEntry,
  PatientCreateInput,
  PatientUpdateInput,
  PatientValidationResult
} from "@/lib/types";

export type PatientRepositoryMode = "memory" | "prisma";

export type PatientCourseMutationResult = {
  data: OperationalPatient;
  course?: OperationalTreatmentCourse;
  bundle?: {
    workflowDefinitionId?: string;
    workflowStepCount: number;
    taskCount: number;
    documentCount: number;
    auditCheckCount: number;
    folderPlaceholderCount: number;
    historyEntryCount: number;
  };
  auditEvent: OperationalAuditEvent;
  phiBoundary: string;
};

export type PatientMutationAction = Extract<RoleAction, "phi:read" | "phi:create" | "phi:update">;

export type PatientMutationContext = PatientMutationAuditContext & {
  action: PatientMutationAction;
};

type MaybePromise<T> = T | Promise<T>;

export type PatientServiceErrorBody = {
  message: string;
  errors?: string[];
};

export type PatientServiceResponse<T> =
  | {
      ok: true;
      status: number;
      body: T;
    }
  | {
      ok: false;
      status: number;
      body: PatientServiceErrorBody;
    };

export type PatientRegistrationRepository = {
  mode: PatientRepositoryMode;
  listOperationalPatients(): MaybePromise<OperationalPatient[]>;
  validateCreate(input: Partial<PatientCreateInput>): MaybePromise<PatientValidationResult>;
  validateUpdate(patientRefOrId: string, input: Partial<PatientUpdateInput>): MaybePromise<PatientValidationResult>;
  validateLifecycle(
    patientRefOrId: string,
    input: Partial<PatientLifecycleUpdateInput>
  ): MaybePromise<PatientValidationResult>;
  getPatientEditRecord(patientRefOrId: string): MaybePromise<PatientEditDto | null>;
  listPatientRecordHistory(patientRefOrId: string): MaybePromise<PatientRecordHistoryEntry[]>;
  createPatientTransaction(
    input: PatientCreateInput,
    context: PatientMutationAuditContext
  ): MaybePromise<PatientCourseMutationResult>;
  updatePatientTransaction(
    patientRefOrId: string,
    input: PatientUpdateInput,
    context: PatientMutationAuditContext
  ): MaybePromise<PatientCourseMutationResult | null>;
  updatePatientLifecycleTransaction(
    patientRefOrId: string,
    input: PatientLifecycleUpdateInput,
    context: PatientMutationAuditContext
  ): MaybePromise<PatientCourseMutationResult | null>;
};

class PatientRepositoryUnavailableError extends Error {
  constructor() {
    super("Persistent patient repository is not configured.");
    this.name = "PatientRepositoryUnavailableError";
  }
}

class PatientPersistenceWriteError extends Error {
  constructor() {
    super("Patient persistence write failed.");
    this.name = "PatientPersistenceWriteError";
  }
}

function safeText(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function replaceArray<T>(target: T[], rows: T[]) {
  target.splice(0, target.length, ...rows);
}

function snapshotClinicalStore() {
  return {
    patients: clone(patients),
    treatmentCourses: clone(treatmentCourses),
    generatedDocuments: clone(generatedDocuments),
    carepathTasks: clone(carepathTasks),
    patientCourseWorkflowSteps: clone(patientCourseWorkflowSteps),
    patientCourseAuditChecks: clone(patientCourseAuditChecks),
    courseFolderPlaceholders: clone(courseFolderPlaceholders),
    patientRecordHistory: clone(patientRecordHistory),
    auditEvents: clone(auditEvents)
  };
}

function restoreClinicalStore(snapshot: ReturnType<typeof snapshotClinicalStore>) {
  replaceArray(patients, snapshot.patients);
  replaceArray(treatmentCourses, snapshot.treatmentCourses);
  replaceArray(generatedDocuments, snapshot.generatedDocuments);
  replaceArray(carepathTasks, snapshot.carepathTasks);
  replaceArray(patientCourseWorkflowSteps, snapshot.patientCourseWorkflowSteps);
  replaceArray(patientCourseAuditChecks, snapshot.patientCourseAuditChecks);
  replaceArray(courseFolderPlaceholders, snapshot.courseFolderPlaceholders);
  replaceArray(patientRecordHistory, snapshot.patientRecordHistory);
  replaceArray(auditEvents, snapshot.auditEvents);
}

function repositoryModeFromEnv(): PatientRepositoryMode {
  const configuredMode = [
    process.env.CURERAYS_PATIENT_REPOSITORY,
    process.env.CURERAYS_PERSISTENCE_MODE
  ]
    .map((value) => safeText(value).toLowerCase())
    .find(Boolean);

  return configuredMode === "prisma" || configuredMode === "prisma-ready" ? "prisma" : "memory";
}

export const inMemoryPatientRegistrationRepository: PatientRegistrationRepository = {
  mode: "memory",
  listOperationalPatients() {
    return operationalPatients();
  },
  validateCreate(input) {
    return validatePatientCreateInput(input);
  },
  validateUpdate(patientRefOrId, input) {
    return validatePatientUpdateInput(patientRefOrId, input);
  },
  validateLifecycle(patientRefOrId, input) {
    return validatePatientLifecycleInput(patientRefOrId, input);
  },
  getPatientEditRecord(patientRefOrId) {
    return getPatientEditRecordFromStore(patientRefOrId);
  },
  listPatientRecordHistory(patientRefOrId) {
    return listPatientRecordHistory(patientRefOrId);
  },
  createPatientTransaction(input, context) {
    return createPatient(input, context);
  },
  updatePatientTransaction(patientRefOrId, input, context) {
    return updatePatient(patientRefOrId, input, context);
  },
  updatePatientLifecycleTransaction(patientRefOrId, input, context) {
    return updatePatientLifecycle(patientRefOrId, input, context);
  }
};

type PrismaRecord = Record<string, unknown>;
type PrismaDelegateLike = {
  findMany(args?: unknown): Promise<PrismaRecord[]>;
  findUnique(args?: unknown): Promise<PrismaRecord | null>;
  create(args: unknown): Promise<PrismaRecord>;
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
    throw new PatientRepositoryUnavailableError();
  }

  try {
    const requireFn = eval("require") as NodeRequire;
    const moduleValue = requireFn(moduleName) as { PrismaClient?: new () => PrismaClientLike };
    if (!moduleValue.PrismaClient) {
      throw new PatientRepositoryUnavailableError();
    }

    return new moduleValue.PrismaClient();
  } catch {
    throw new PatientRepositoryUnavailableError();
  }
}

function prismaDelegate(client: PrismaClientLike, name: string): PrismaDelegateLike {
  const delegate = client[name];
  if (!delegate || typeof delegate !== "object") {
    throw new PatientRepositoryUnavailableError();
  }

  return delegate as PrismaDelegateLike;
}

function operationalPatientFromRecord(record: PrismaRecord): OperationalPatient {
  return {
    id: String(record.patientRef ?? ""),
    patientRef: String(record.patientRef ?? ""),
    phiRecordId: String(record.phiRecordId ?? ""),
    displayLabel: String(record.displayLabel ?? ""),
    diagnosisCategory: record.diagnosisCategory as OperationalPatient["diagnosisCategory"],
    chartRoundsPhase: record.chartRoundsPhase as OperationalPatient["chartRoundsPhase"],
    status: record.status as OperationalPatient["status"],
    assignedStaff: String(record.assignedStaff ?? ""),
    activeCourseId: String(record.activeCourseRef ?? ""),
    activeCourseRef: String(record.activeCourseRef ?? ""),
    nextActionCategory: String(record.nextActionCategory ?? ""),
    flags: [],
    checklist: typeof record.checklist === "object" && record.checklist ? record.checklist as OperationalPatient["checklist"] : {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdatedAt: record.lastUpdatedAt instanceof Date ? record.lastUpdatedAt.toISOString() : String(record.lastUpdatedAt ?? ""),
    restricted: true
  };
}

function validationErrorsForRequiredPatientFields(input: Partial<PatientCreateInput>) {
  const requiredFields: Array<keyof PatientCreateInput> = [
    "firstName",
    "lastName",
    "diagnosis",
    "diagnosisCategory",
    "location",
    "physician",
    "assignedStaff"
  ];

  return requiredFields
    .filter((field) => !safeText(input[field] as string | undefined))
    .map((field) => `${field} is required.`);
}

function dateTime(value: string | Date | null | undefined, fallback = new Date()) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  const parsed = new Date(String(value ?? ""));
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

function dateOnly(value: string | null | undefined, fallback = new Date()) {
  return dateTime(value ? `${value}T00:00:00.000Z` : undefined, fallback);
}

function optionalDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = dateOnly(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function persistedDocumentStatus(status: string) {
  const allowed = new Set([
    "DRAFT",
    "PENDING_NEEDED",
    "MISSING_FIELDS",
    "READY_FOR_REVIEW",
    "SIGNED",
    "EXPORTED",
    "NOT_APPLICABLE",
    "NEEDS_REVIEW",
    "COMPLETED"
  ]);

  return allowed.has(status) ? status : "NEEDS_REVIEW";
}

function persistablePatient(result: PatientCourseMutationResult) {
  const patient = patients.find((item) => item.id === result.data.id);
  if (!patient) {
    throw new PatientPersistenceWriteError();
  }

  return patient;
}

function persistableCourse(result: PatientCourseMutationResult) {
  if (!result.course) {
    return undefined;
  }

  const course = treatmentCourses.find((item) => item.id === result.course?.id);
  if (!course) {
    throw new PatientPersistenceWriteError();
  }

  return course;
}

async function persistMutationResult(result: PatientCourseMutationResult) {
  const ops = loadPrismaClient(".prisma/ops-client");
  const phi = loadPrismaClient(".prisma/phi-client");
  const updatedAt = new Date(result.data.lastUpdatedAt);
  const patient = persistablePatient(result);
  const course = persistableCourse(result);
  const courseRef = result.course?.courseRef;

  try {
    await ops.$transaction(async (tx) => {
      await prismaDelegate(tx, "operationalPatient").upsert({
        where: { patientRef: result.data.patientRef },
        create: {
          patientRef: result.data.patientRef,
          phiRecordId: result.data.phiRecordId,
          displayLabel: result.data.displayLabel,
          diagnosisCategory: result.data.diagnosisCategory,
          chartRoundsPhase: result.data.chartRoundsPhase,
          status: result.data.status,
          assignedStaff: result.data.assignedStaff,
          activeCourseRef: result.data.activeCourseRef,
          nextActionCategory: result.data.nextActionCategory,
          checklist: result.data.checklist,
          lastUpdatedAt: updatedAt
        },
        update: {
          diagnosisCategory: result.data.diagnosisCategory,
          chartRoundsPhase: result.data.chartRoundsPhase,
          status: result.data.status,
          assignedStaff: result.data.assignedStaff,
          activeCourseRef: result.data.activeCourseRef,
          nextActionCategory: result.data.nextActionCategory,
          checklist: result.data.checklist,
          lastUpdatedAt: updatedAt
        }
      });

      if (result.course && courseRef) {
        await prismaDelegate(tx, "operationalCourse").upsert({
          where: { courseRef },
          create: {
            courseRef,
            patientRef: result.course.patientRef,
            diagnosisCategory: result.course.diagnosisCategory,
            protocolFamily: result.course.protocolFamily,
            workflowDefinitionId: result.course.workflowDefinitionId,
            bodyRegion: result.course.bodyRegion,
            laterality: result.course.laterality,
            totalFractions: result.course.totalFractions,
            currentFraction: result.course.currentFraction,
            chartRoundsPhase: result.course.chartRoundsPhase,
            status: result.course.status,
            coursePhase: result.course.coursePhase
          },
          update: {
            diagnosisCategory: result.course.diagnosisCategory,
            protocolFamily: result.course.protocolFamily,
            workflowDefinitionId: result.course.workflowDefinitionId,
            bodyRegion: result.course.bodyRegion,
            laterality: result.course.laterality,
            totalFractions: result.course.totalFractions,
            currentFraction: result.course.currentFraction,
            chartRoundsPhase: result.course.chartRoundsPhase,
            status: result.course.status,
            coursePhase: result.course.coursePhase
          }
        });
      }

      const courseId = course?.id;
      if (courseId && courseRef) {
        await Promise.all(
          patientCourseWorkflowSteps
            .filter((step) => step.courseId === courseId)
            .map((step) => prismaDelegate(tx, "operationalWorkflowStep").upsert({
              where: { id: step.id },
              create: {
                id: step.id,
                courseRef,
                workflowDefinitionId: step.requirementIds?.length ? course.workflowDefinitionId ?? "WF-UNIVERSAL" : course.workflowDefinitionId ?? "WF-UNIVERSAL",
                stepNumber: step.stepNumber,
                stepName: step.stepName,
                phase: step.phase,
                status: step.status,
                responsibleRole: step.responsibleRole,
                triggerEvent: step.triggerEvent,
                dueDate: optionalDate(step.dueDate),
                requiresSignature: step.requiresSignature,
                linkedDocumentId: step.linkedDocumentId,
                naReason: step.naReason,
                blockers: step.blockers,
                auditChecklist: step.auditChecklist,
                notes: step.notes,
                createdAt: dateTime(step.createdAt),
                updatedAt: dateTime(step.updatedAt)
              },
              update: {
                workflowDefinitionId: course.workflowDefinitionId ?? "WF-UNIVERSAL",
                stepName: step.stepName,
                phase: step.phase,
                status: step.status,
                responsibleRole: step.responsibleRole,
                triggerEvent: step.triggerEvent,
                dueDate: optionalDate(step.dueDate),
                requiresSignature: step.requiresSignature,
                linkedDocumentId: step.linkedDocumentId,
                naReason: step.naReason,
                blockers: step.blockers,
                auditChecklist: step.auditChecklist,
                notes: step.notes,
                updatedAt: dateTime(step.updatedAt)
              }
            }))
        );

        await Promise.all(
          carepathTasks
            .filter((task) => task.courseId === courseId)
            .map((task) => prismaDelegate(tx, "carepathTask").upsert({
              where: { id: task.id },
              create: {
                id: task.id,
                courseRef,
                taskNumber: task.taskNumber,
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
                dueDate: optionalDate(task.dueDate),
                completedAt: task.completedAt ? dateTime(task.completedAt) : null,
                signedAt: task.signedAt ? dateTime(task.signedAt) : null,
                lastUpdatedAt: dateTime(task.lastUpdatedAt),
                assignedUser: task.assignedUser
              },
              update: {
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
                dueDate: optionalDate(task.dueDate),
                completedAt: task.completedAt ? dateTime(task.completedAt) : null,
                signedAt: task.signedAt ? dateTime(task.signedAt) : null,
                lastUpdatedAt: dateTime(task.lastUpdatedAt),
                assignedUser: task.assignedUser
              }
            }))
        );

        await Promise.all(
          generatedDocuments
            .filter((document) => document.courseId === courseId)
            .map((document) => prismaDelegate(tx, "generatedDocument").upsert({
              where: { id: document.id },
              create: {
                id: document.id,
                templateId: document.templateId,
                patientRef: result.data.patientRef,
                courseRef,
                name: document.name,
                clinicalPhase: document.clinicalPhase,
                responsibleParty: document.responsibleParty,
                status: persistedDocumentStatus(document.status),
                requiredAction: document.requiredAction,
                cptCode: document.cptCode,
                assignedTo: document.assignedTo,
                lastUpdatedAt: dateTime(document.lastUpdatedAt),
                signedAt: document.signedAt ? dateTime(document.signedAt) : null,
                exportedAt: document.exportedAt ? dateTime(document.exportedAt) : null,
                signReviewState: document.signReviewState,
                auditReady: document.auditReady
              },
              update: {
                name: document.name,
                clinicalPhase: document.clinicalPhase,
                responsibleParty: document.responsibleParty,
                status: persistedDocumentStatus(document.status),
                requiredAction: document.requiredAction,
                cptCode: document.cptCode,
                assignedTo: document.assignedTo,
                lastUpdatedAt: dateTime(document.lastUpdatedAt),
                signedAt: document.signedAt ? dateTime(document.signedAt) : null,
                exportedAt: document.exportedAt ? dateTime(document.exportedAt) : null,
                signReviewState: document.signReviewState,
                auditReady: document.auditReady
              }
            }))
        );

        await Promise.all(
          patientCourseAuditChecks
            .filter((check) => check.courseId === courseId)
            .map((check) => prismaDelegate(tx, "operationalAuditCheck").upsert({
              where: { id: check.id },
              create: {
                id: check.id,
                courseRef,
                category: check.category,
                label: check.label,
                status: check.status,
                required: check.required,
                evidenceDocumentId: check.evidenceDocumentId,
                notes: check.notes,
                completedByUserId: check.completedByUserId,
                completedAt: check.completedAt ? dateTime(check.completedAt) : null,
                naReason: check.naReason
              },
              update: {
                category: check.category,
                label: check.label,
                status: check.status,
                required: check.required,
                evidenceDocumentId: check.evidenceDocumentId,
                notes: check.notes,
                completedByUserId: check.completedByUserId,
                completedAt: check.completedAt ? dateTime(check.completedAt) : null,
                naReason: check.naReason
              }
            }))
        );

        await Promise.all(
          courseFolderPlaceholders
            .filter((folder) => folder.courseId === courseId)
            .map((folder) => prismaDelegate(tx, "courseFolderPlaceholder").upsert({
              where: { id: folder.id },
              create: {
                id: folder.id,
                patientRef: folder.patientRef,
                courseRef: folder.courseRef,
                storageProvider: folder.storageProvider,
                path: folder.path,
                folders: folder.folders,
                status: folder.status,
                createdAt: dateTime(folder.createdAt)
              },
              update: {
                patientRef: folder.patientRef,
                courseRef: folder.courseRef,
                storageProvider: folder.storageProvider,
                path: folder.path,
                folders: folder.folders,
                status: folder.status
              }
            }))
        );
      }

      await Promise.all(
        patientRecordHistory
          .filter((entry) => entry.patientRef === result.data.patientRef)
          .map((entry) => prismaDelegate(tx, "patientRecordHistory").upsert({
            where: { id: entry.id },
            create: {
              id: entry.id,
              patientRef: entry.patientRef,
              courseRef: entry.courseRef,
              action: entry.action,
              summary: entry.summary,
              previousValue: entry.previousValue,
              newValue: entry.newValue,
              changedBy: entry.changedBy,
              role: entry.role,
              sessionId: entry.sessionId,
              ipAddress: entry.ipAddress,
              deviceId: entry.deviceId,
              reason: entry.reason,
              timestamp: dateTime(entry.timestamp)
            },
            update: {
              courseRef: entry.courseRef,
              action: entry.action,
              summary: entry.summary,
              previousValue: entry.previousValue,
              newValue: entry.newValue,
              changedBy: entry.changedBy,
              role: entry.role,
              sessionId: entry.sessionId,
              ipAddress: entry.ipAddress,
              deviceId: entry.deviceId,
              reason: entry.reason,
              timestamp: dateTime(entry.timestamp)
            }
          }))
      );

      await prismaDelegate(tx, "operationalAuditEvent").upsert({
        where: { id: result.auditEvent.id },
        create: {
          id: result.auditEvent.id,
          patientRef: result.auditEvent.patientRef,
          userId: result.auditEvent.userId,
          userName: result.auditEvent.userName,
          role: result.auditEvent.role,
          sessionId: result.auditEvent.sessionId,
          ipAddress: result.auditEvent.ipAddress,
          deviceId: result.auditEvent.deviceId,
          action: result.auditEvent.action,
          entityType: result.auditEvent.entityType,
          entityId: result.auditEvent.entityId,
          previousValue: result.auditEvent.previousValue,
          newValue: result.auditEvent.newValue,
          redacted: result.auditEvent.redacted,
          timestamp: dateTime(result.auditEvent.timestamp),
          reason: result.auditEvent.reason
        },
        update: {
          patientRef: result.auditEvent.patientRef,
          userId: result.auditEvent.userId,
          userName: result.auditEvent.userName,
          role: result.auditEvent.role,
          sessionId: result.auditEvent.sessionId,
          ipAddress: result.auditEvent.ipAddress,
          deviceId: result.auditEvent.deviceId,
          action: result.auditEvent.action,
          entityType: result.auditEvent.entityType,
          entityId: result.auditEvent.entityId,
          previousValue: result.auditEvent.previousValue,
          newValue: result.auditEvent.newValue,
          redacted: result.auditEvent.redacted,
          timestamp: dateTime(result.auditEvent.timestamp),
          reason: result.auditEvent.reason
        }
      });
    });

    await phi.$transaction(async (tx) => {
      await prismaDelegate(tx, "patientPhi").upsert({
        where: { phiRecordId: result.data.phiRecordId },
        create: {
          id: patient.id,
          patientRef: result.data.patientRef,
          phiRecordId: result.data.phiRecordId,
          firstName: patient.firstName,
          lastName: patient.lastName,
          mrn: patient.mrn || null,
          diagnosis: patient.diagnosis,
          diagnosisCategory: patient.diagnosisCategory,
          location: patient.location,
          physician: patient.physician,
          chartRoundsPhase: patient.chartRoundsPhase,
          status: patient.status,
          assignedStaff: patient.assignedStaff,
          activeCourseId: patient.activeCourseId,
          nextAction: patient.nextAction,
          flags: patient.flags,
          notes: patient.notes,
          checklist: patient.checklist,
          lastUpdatedAt: updatedAt
        },
        update: {
          firstName: patient.firstName,
          lastName: patient.lastName,
          mrn: patient.mrn || null,
          diagnosis: patient.diagnosis,
          diagnosisCategory: patient.diagnosisCategory,
          location: patient.location,
          physician: patient.physician,
          chartRoundsPhase: patient.chartRoundsPhase,
          status: patient.status,
          assignedStaff: patient.assignedStaff,
          activeCourseId: patient.activeCourseId,
          nextAction: patient.nextAction,
          flags: patient.flags,
          notes: patient.notes,
          checklist: patient.checklist,
          lastUpdatedAt: updatedAt
        }
      });

      if (course && courseRef) {
        await prismaDelegate(tx, "treatmentCoursePhi").upsert({
          where: { courseRef },
          create: {
            id: course.id,
            courseRef,
            patientId: patient.id,
            diagnosis: course.diagnosis,
            diagnosisCategory: course.diagnosisCategory,
            protocolName: course.protocolName,
            totalFractions: course.totalFractions,
            currentFraction: course.currentFraction,
            startDate: dateOnly(course.startDate),
            endDate: optionalDate(course.endDate),
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
            notes: course.notes
          },
          update: {
            diagnosis: course.diagnosis,
            diagnosisCategory: course.diagnosisCategory,
            protocolName: course.protocolName,
            totalFractions: course.totalFractions,
            currentFraction: course.currentFraction,
            startDate: dateOnly(course.startDate),
            endDate: optionalDate(course.endDate),
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
            notes: course.notes
          }
        });
      }
    });
  } catch {
    throw new PatientPersistenceWriteError();
  } finally {
    await ops.$disconnect();
    await phi.$disconnect();
  }
}

export const prismaPatientRegistrationRepository: PatientRegistrationRepository = {
  mode: "prisma",
  async listOperationalPatients() {
    const ops = loadPrismaClient(".prisma/ops-client");
    try {
      const records = await prismaDelegate(ops, "operationalPatient").findMany({
        orderBy: { lastUpdatedAt: "desc" }
      });
      return records.map(operationalPatientFromRecord);
    } finally {
      await ops.$disconnect();
    }
  },
  async validateCreate(input) {
    const errors = validationErrorsForRequiredPatientFields(input);
    const phi = loadPrismaClient(".prisma/phi-client");
    try {
      if (safeText(input.mrn)) {
        const duplicate = await prismaDelegate(phi, "patientPhi").findUnique({
          where: { mrn: safeText(input.mrn) }
        });
        if (duplicate) {
          errors.push("External MRN must be unique.");
        }
      }
    } finally {
      await phi.$disconnect();
    }

    return { valid: errors.length === 0, errors };
  },
  validateUpdate(patientRefOrId, input) {
    return validatePatientUpdateInput(patientRefOrId, input);
  },
  validateLifecycle(patientRefOrId, input) {
    return validatePatientLifecycleInput(patientRefOrId, input);
  },
  getPatientEditRecord(patientRefOrId) {
    return getPatientEditRecordFromStore(patientRefOrId);
  },
  listPatientRecordHistory(patientRefOrId) {
    return listPatientRecordHistory(patientRefOrId);
  },
  async createPatientTransaction(input, context) {
    const snapshot = snapshotClinicalStore();
    const result = createPatient(input, context);
    try {
      await persistMutationResult(result);
    } catch (error) {
      restoreClinicalStore(snapshot);
      throw error;
    }
    return result;
  },
  async updatePatientTransaction(patientRefOrId, input, context) {
    const snapshot = snapshotClinicalStore();
    const result = updatePatient(patientRefOrId, input, context);
    if (result) {
      try {
        await persistMutationResult(result);
      } catch (error) {
        restoreClinicalStore(snapshot);
        throw error;
      }
    }
    return result;
  },
  async updatePatientLifecycleTransaction(patientRefOrId, input, context) {
    const snapshot = snapshotClinicalStore();
    const result = updatePatientLifecycle(patientRefOrId, input, context);
    if (result) {
      try {
        await persistMutationResult(result);
      } catch (error) {
        restoreClinicalStore(snapshot);
        throw error;
      }
    }
    return result;
  }
};

export const prismaReadyPatientRegistrationRepository = prismaPatientRegistrationRepository;

export function selectPatientRegistrationRepository(): PatientRegistrationRepository {
  return repositoryModeFromEnv() === "prisma"
    ? prismaPatientRegistrationRepository
    : inMemoryPatientRegistrationRepository;
}

export function patientMutationContextFromRequest(
  request: NextRequest,
  action: PatientMutationAction,
  reason: string
): PatientMutationContext | null {
  const access = phiAccessFromRequest(request, reason);

  if (!access) {
    return null;
  }

  const actorRole = access.role;
  const session = prototypeSessionFromRequest(request);

  return {
    action,
    role: actorRole,
    userId: session?.userId ?? `PROTOTYPE-${actorRole}`,
    userName: session?.userName ?? "Prototype User",
    sessionId: session?.sessionId ?? "prototype-session",
    ipAddress: session?.ipAddress ?? "prototype-ip",
    deviceId: session?.deviceId ?? "prototype-device",
    reason: access.reason
  };
}

function success<T>(status: number, body: T): PatientServiceResponse<T> {
  return { ok: true, status, body };
}

function failure<T>(status: number, message: string, errors?: string[]): PatientServiceResponse<T> {
  return {
    ok: false,
    status,
    body: errors ? { message, errors } : { message }
  };
}

function safeFailure<T>(error: unknown): PatientServiceResponse<T> {
  if (error instanceof PatientRepositoryUnavailableError) {
    return failure(503, "Patient persistence is not available.", [
      "Confirm OPS_DATABASE_URL, PHI_DATABASE_URL, generated Prisma clients, and PostgreSQL connectivity."
    ]);
  }

  if (error instanceof PatientPersistenceWriteError) {
    return failure(500, "Patient could not be saved to the configured database.", [
      "The record was not accepted as saved. Check local OPS/PHI schema setup and retry."
    ]);
  }

  return failure(500, "Patient request could not be completed safely.");
}

function assertPhiAction(context: PatientMutationContext) {
  requirePhiAction({ role: context.role, reason: context.reason }, context.action);
}

function assertCreatePostConditions(result: PatientCourseMutationResult) {
  if (
    !result.course ||
    !result.auditEvent.redacted ||
    !result.auditEvent.patientRef ||
    !result.bundle ||
    result.bundle.workflowStepCount < 1 ||
    result.bundle.taskCount < 1 ||
    result.bundle.documentCount < 1 ||
    result.bundle.auditCheckCount < 1 ||
    result.bundle.folderPlaceholderCount < 1 ||
    result.bundle.historyEntryCount < 1
  ) {
    throw new Error("Patient registration post-condition failed.");
  }
}

export async function listOperationalPatientRecords(): Promise<PatientServiceResponse<{ patients: OperationalPatient[] }>> {
  try {
    const repository = selectPatientRegistrationRepository();
    return success(200, { patients: await repository.listOperationalPatients() });
  } catch {
    return success(200, { patients: await inMemoryPatientRegistrationRepository.listOperationalPatients() });
  }
}

export async function registerPatient(
  input: Partial<PatientCreateInput>,
  context: PatientMutationContext
): Promise<PatientServiceResponse<PatientCourseMutationResult>> {
  try {
    assertPhiAction(context);

    const repository = selectPatientRegistrationRepository();
    const validation = await repository.validateCreate(input);
    if (!validation.valid) {
      return failure(400, "Patient validation failed", validation.errors);
    }

    const result = await repository.createPatientTransaction(input as PatientCreateInput, context);
    assertCreatePostConditions(result);
    return success(201, result);
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}

export async function updatePatientRecord(
  patientRefOrId: string,
  input: Partial<PatientUpdateInput>,
  context: PatientMutationContext
): Promise<PatientServiceResponse<PatientCourseMutationResult>> {
  try {
    assertPhiAction(context);

    const repository = selectPatientRegistrationRepository();
    const validation = await repository.validateUpdate(patientRefOrId, input);
    if (!validation.valid) {
      const status = validation.errors.includes("Patient not found.")
        ? 404
        : validation.errors.includes("Patient record was updated by another session.")
          ? 409
          : 400;
      return failure(status, status === 404 ? "Patient not found" : "Patient validation failed", validation.errors);
    }

    const result = await repository.updatePatientTransaction(patientRefOrId, input as PatientUpdateInput, context);
    if (!result) {
      return failure(404, "Patient not found");
    }

    return success(200, result);
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}

export async function getPatientEditRecord(
  patientRefOrId: string,
  context: PatientMutationContext
): Promise<PatientServiceResponse<{ patient: PatientEditDto }>> {
  try {
    requirePhiAction({ role: context.role, reason: context.reason }, "phi:read");
    const repository = selectPatientRegistrationRepository();
    const patient = await repository.getPatientEditRecord(patientRefOrId);

    if (!patient) {
      return failure(404, "Patient not found");
    }

    return success(200, { patient });
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}

export async function listPatientRecordHistoryEntries(
  patientRefOrId: string,
  context: PatientMutationContext
): Promise<PatientServiceResponse<{ history: PatientRecordHistoryEntry[] }>> {
  try {
    requirePhiAction({ role: context.role, reason: context.reason }, "phi:read");
    const repository = selectPatientRegistrationRepository();
    return success(200, { history: await repository.listPatientRecordHistory(patientRefOrId) });
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}

export async function updatePatientLifecycleRecord(
  patientRefOrId: string,
  input: Partial<PatientLifecycleUpdateInput>,
  context: PatientMutationContext
): Promise<PatientServiceResponse<PatientCourseMutationResult>> {
  try {
    assertPhiAction(context);

    const repository = selectPatientRegistrationRepository();
    const validation = await repository.validateLifecycle(patientRefOrId, input);
    if (!validation.valid) {
      const status = validation.errors.includes("Patient not found.")
        ? 404
        : validation.errors.includes("Patient record was updated by another session.")
          ? 409
          : 400;
      return failure(status, status === 404 ? "Patient not found" : "Patient validation failed", validation.errors);
    }

    const result = await repository.updatePatientLifecycleTransaction(
      patientRefOrId,
      input as PatientLifecycleUpdateInput,
      context
    );
    if (!result) {
      return failure(404, "Patient not found");
    }

    return success(200, result);
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}
