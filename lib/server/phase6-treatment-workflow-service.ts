import "server-only";

import {
  addFractionLogEntry,
  approveFractionLogEntry,
  generateTreatmentFractionSchedule,
  linkFractionImage,
  recordOtvCheck,
  recordPhysicsCheck,
  requestFractionRevision,
  updateFractionLogEntry,
  voidFractionLogEntry
} from "@/lib/clinical-store";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import { requirePhiAction, type PhiAccessContext } from "@/lib/server/phi-store";
import { persistCourseClinicalMutation } from "@/lib/server/write-through";
import type { FractionApprovalType } from "@/lib/types";

type ClinicalMutationResult = { auditEvent?: { id: string } } | null;

async function writeThroughClinical<T extends ClinicalMutationResult>(courseId: string, result: T): Promise<T> {
  if (!result) {
    return result;
  }

  try {
    await persistCourseClinicalMutation(courseId, result.auditEvent?.id);
  } catch (error) {
    await hydrateClinicalStoreFromDatabase({ force: true });
    throw error;
  }

  return result;
}

function actorUserId(access: PhiAccessContext) {
  return `PROTO-${access.role}`;
}

function requireClinicalMutation(access: PhiAccessContext) {
  requirePhiAction(access, "igsrt:mutate");
}

function requirePhysicsRole(access: PhiAccessContext) {
  if (!["PHYSICIST", "ADMIN", "SYSTEM"].includes(access.role)) {
    throw new Error("PHI access denied");
  }
}

function requireOtvRole(access: PhiAccessContext) {
  if (!["RAD_ONC", "ADMIN", "SYSTEM"].includes(access.role)) {
    throw new Error("PHI access denied");
  }
}

export function createFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(courseId, addFractionLogEntry({ ...data, courseId }));
}

export function correctFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    updateFractionLogEntry({
      ...data,
      courseId,
      id: String(data.id),
      correctedByUserId: actorUserId(access)
    })
  );
}

export function approveFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    approveFractionLogEntry({
      courseId,
      id: String(data.id),
      approvalType: (data.approvalType === "DOT" ? "DOT" : "MD") as FractionApprovalType,
      role: access.role,
      userId: actorUserId(access)
    })
  );
}

export function requestFractionRowRevision(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    requestFractionRevision({
      courseId,
      id: String(data.id),
      approvalType: (data.approvalType === "DOT" ? "DOT" : "MD") as FractionApprovalType,
      reason: String(data.reason ?? ""),
      role: access.role,
      userId: actorUserId(access)
    })
  );
}

export function voidFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    voidFractionLogEntry({
      courseId,
      id: String(data.id),
      reason: String(data.reason ?? ""),
      userId: actorUserId(access)
    })
  );
}

export function createFractionSchedule(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    generateTreatmentFractionSchedule({
      courseId,
      userId: actorUserId(access)
    })
  );
}

export function attachFractionImage(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    linkFractionImage({
      courseId,
      fractionNumber: Number(data.fractionNumber),
      assetId: data.assetId ? String(data.assetId) : undefined,
      notApplicableReason: data.notApplicableReason ? String(data.notApplicableReason) : undefined,
      userId: actorUserId(access)
    })
  );
}

export function completePhysicsCheck(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  requirePhysicsRole(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    recordPhysicsCheck({
      courseId,
      fractionNumber: Number(data.fractionNumber),
      userId: actorUserId(access)
    })
  );
}

export function completeOtvCheck(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  requireOtvRole(access);
  const courseId = String(data.courseId);
  return writeThroughClinical(
    courseId,
    recordOtvCheck({
      courseId,
      fractionNumber: Number(data.fractionNumber),
      userId: actorUserId(access)
    })
  );
}
