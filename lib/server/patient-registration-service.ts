import "server-only";

import type { NextRequest } from "next/server";
import {
  createPatient,
  operationalPatients,
  updatePatient,
  validatePatientCreateInput,
  validatePatientUpdateInput,
  type PatientMutationAuditContext
} from "@/lib/clinical-store";
import { phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";
import { PROTOTYPE_ROLE_HEADER, roleLabels, type RoleAction } from "@/lib/rbac";
import type {
  OperationalAuditEvent,
  OperationalPatient,
  OperationalTreatmentCourse,
  PatientCreateInput,
  PatientUpdateInput,
  PatientValidationResult,
  PrototypeAccessRole
} from "@/lib/types";

export type PatientRepositoryMode = "memory" | "prisma-ready";

export type PatientCourseMutationResult = {
  data: OperationalPatient;
  course?: OperationalTreatmentCourse;
  auditEvent: OperationalAuditEvent;
  phiBoundary: string;
};

export type PatientMutationAction = Extract<RoleAction, "phi:create" | "phi:update">;

export type PatientMutationContext = PatientMutationAuditContext & {
  action: PatientMutationAction;
};

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
  listOperationalPatients(): OperationalPatient[];
  validateCreate(input: Partial<PatientCreateInput>): PatientValidationResult;
  validateUpdate(patientRefOrId: string, input: Partial<PatientUpdateInput>): PatientValidationResult;
  createPatientTransaction(
    input: PatientCreateInput,
    context: PatientMutationAuditContext
  ): PatientCourseMutationResult;
  updatePatientTransaction(
    patientRefOrId: string,
    input: PatientUpdateInput,
    context: PatientMutationAuditContext
  ): PatientCourseMutationResult | null;
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

function actorNameForRole(role: PrototypeAccessRole) {
  if (role === "CLINICIAN") {
    return "Prototype Clinician";
  }

  if (role === "SYSTEM") {
    return "Prototype System";
  }

  return roleLabels[role];
}

function requestIpAddress(request: NextRequest) {
  const forwarded = safeText(request.headers.get("x-forwarded-for"));
  const forwardedFirst = safeText(forwarded.split(",")[0]);
  return forwardedFirst || safeText(request.headers.get("x-real-ip")) || "prototype-ip";
}

function repositoryModeFromEnv(): PatientRepositoryMode {
  const configuredMode = [
    process.env.CURERAYS_PATIENT_REPOSITORY,
    process.env.CURERAYS_PERSISTENCE_MODE
  ]
    .map((value) => safeText(value).toLowerCase())
    .find(Boolean);

  return configuredMode === "prisma" || configuredMode === "prisma-ready" ? "prisma-ready" : "memory";
}

function unavailable(): never {
  throw new PatientRepositoryUnavailableError();
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
  createPatientTransaction(input, context) {
    return createPatient(input, context);
  },
  updatePatientTransaction(patientRefOrId, input, context) {
    return updatePatient(patientRefOrId, input, context);
  }
};

export const prismaReadyPatientRegistrationRepository: PatientRegistrationRepository = {
  mode: "prisma-ready",
  listOperationalPatients: unavailable,
  validateCreate: unavailable,
  validateUpdate: unavailable,
  createPatientTransaction: unavailable,
  updatePatientTransaction: unavailable
};

export function selectPatientRegistrationRepository(): PatientRegistrationRepository {
  return repositoryModeFromEnv() === "prisma-ready"
    ? prismaReadyPatientRegistrationRepository
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

  return {
    action,
    role: actorRole,
    userId:
      safeText(request.headers.get("x-curerays-user-id")) ||
      `PROTOTYPE-${safeText(request.headers.get(PROTOTYPE_ROLE_HEADER)) || actorRole}`,
    userName: safeText(request.headers.get("x-curerays-user-name")) || actorNameForRole(actorRole),
    sessionId: safeText(request.headers.get("x-curerays-session-id")) || "prototype-session",
    ipAddress: requestIpAddress(request),
    deviceId: safeText(request.headers.get("x-curerays-device-id")) || "prototype-device",
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
  if (!result.course || !result.auditEvent.redacted || !result.auditEvent.patientRef) {
    throw new Error("Patient registration post-condition failed.");
  }
}

export function listOperationalPatientRecords(): PatientServiceResponse<{ patients: OperationalPatient[] }> {
  try {
    const repository = selectPatientRegistrationRepository();
    return success(200, { patients: repository.listOperationalPatients() });
  } catch (error) {
    return safeFailure(error);
  }
}

export function registerPatient(
  input: Partial<PatientCreateInput>,
  context: PatientMutationContext
): PatientServiceResponse<PatientCourseMutationResult> {
  try {
    assertPhiAction(context);

    const repository = selectPatientRegistrationRepository();
    const validation = repository.validateCreate(input);
    if (!validation.valid) {
      return failure(400, "Patient validation failed", validation.errors);
    }

    const result = repository.createPatientTransaction(input as PatientCreateInput, context);
    assertCreatePostConditions(result);
    return success(201, result);
  } catch (error) {
    if (error instanceof Error && error.message === "PHI access denied") {
      return failure(403, "PHI access denied");
    }

    return safeFailure(error);
  }
}

export function updatePatientRecord(
  patientRefOrId: string,
  input: Partial<PatientUpdateInput>,
  context: PatientMutationContext
): PatientServiceResponse<PatientCourseMutationResult> {
  try {
    assertPhiAction(context);

    const repository = selectPatientRegistrationRepository();
    const validation = repository.validateUpdate(patientRefOrId, input);
    if (!validation.valid) {
      const status = validation.errors.includes("Patient not found.") ? 404 : 400;
      return failure(status, status === 404 ? "Patient not found" : "Patient validation failed", validation.errors);
    }

    const result = repository.updatePatientTransaction(patientRefOrId, input as PatientUpdateInput, context);
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
