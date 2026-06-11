import "server-only";

import type { NextRequest } from "next/server";
import {
  createPatient,
  getPatientEditRecord as getPatientEditRecordFromStore,
  listPatientRecordHistory,
  operationalPatients,
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

function safeText(value: string | null | undefined) {
  return String(value ?? "").trim();
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
    "mrn",
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

async function persistMutationResult(input: PatientCreateInput | PatientUpdateInput, result: PatientCourseMutationResult) {
  const ops = loadPrismaClient(".prisma/ops-client");
  const phi = loadPrismaClient(".prisma/phi-client");
  const updatedAt = new Date(result.data.lastUpdatedAt);

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

      if (result.course) {
        await prismaDelegate(tx, "operationalCourse").upsert({
          where: { courseRef: result.course.courseRef },
          create: {
            courseRef: result.course.courseRef,
            patientRef: result.course.patientRef,
            diagnosisCategory: result.course.diagnosisCategory,
            protocolFamily: result.course.protocolFamily,
            workflowDefinitionId: result.course.workflowDefinitionId,
            bodyRegion: result.course.bodyRegion,
            laterality: result.course.laterality,
            totalFractions: result.course.totalFractions,
            currentFraction: result.course.currentFraction,
            chartRoundsPhase: result.course.chartRoundsPhase,
            status: result.course.status
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
            status: result.course.status
          }
        });
      }
    });

    await phi.$transaction(async (tx) => {
      await prismaDelegate(tx, "patientPhi").upsert({
        where: { phiRecordId: result.data.phiRecordId },
        create: {
          id: result.data.id,
          patientRef: result.data.patientRef,
          phiRecordId: result.data.phiRecordId,
          firstName: "firstName" in input ? input.firstName : "",
          lastName: "lastName" in input ? input.lastName : "",
          mrn: "mrn" in input ? input.mrn : result.data.phiRecordId,
          diagnosis: "diagnosis" in input ? input.diagnosis : "",
          diagnosisCategory: result.data.diagnosisCategory,
          location: "location" in input ? input.location : "",
          physician: "physician" in input ? input.physician : "",
          chartRoundsPhase: result.data.chartRoundsPhase,
          status: result.data.status,
          assignedStaff: result.data.assignedStaff,
          activeCourseId: result.course?.courseRef ?? result.data.activeCourseRef,
          nextAction: result.data.nextActionCategory,
          flags: [],
          notes: "notes" in input ? input.notes ?? "" : "",
          checklist: result.data.checklist,
          lastUpdatedAt: updatedAt
        },
        update: {
          diagnosisCategory: result.data.diagnosisCategory,
          chartRoundsPhase: result.data.chartRoundsPhase,
          status: result.data.status,
          assignedStaff: result.data.assignedStaff,
          nextAction: result.data.nextActionCategory,
          checklist: result.data.checklist,
          lastUpdatedAt: updatedAt
        }
      });
    });
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
      if (input.mrn) {
        const duplicate = await prismaDelegate(phi, "patientPhi").findUnique({
          where: { mrn: input.mrn }
        });
        if (duplicate) {
          errors.push("MRN must be unique.");
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
    const result = createPatient(input, context);
    await persistMutationResult(input, result);
    return result;
  },
  async updatePatientTransaction(patientRefOrId, input, context) {
    const result = updatePatient(patientRefOrId, input, context);
    if (result) {
      await persistMutationResult(input, result);
    }
    return result;
  },
  async updatePatientLifecycleTransaction(patientRefOrId, input, context) {
    const result = updatePatientLifecycle(patientRefOrId, input, context);
    if (result) {
      await persistMutationResult(input, result);
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
    return failure(503, "Patient persistence is not available.");
  }

  return failure(500, "Patient mutation could not be completed.");
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
  } catch (error) {
    return safeFailure(error);
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
