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
import { requirePhiAction, type PhiAccessContext } from "@/lib/server/phi-store";
import type { FractionApprovalType } from "@/lib/types";

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
  return addFractionLogEntry({ ...data, courseId: String(data.courseId) });
}

export function correctFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return updateFractionLogEntry({
    ...data,
    courseId: String(data.courseId),
    id: String(data.id),
    correctedByUserId: actorUserId(access)
  });
}

export function approveFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return approveFractionLogEntry({
    courseId: String(data.courseId),
    id: String(data.id),
    approvalType: (data.approvalType === "DOT" ? "DOT" : "MD") as FractionApprovalType,
    role: access.role,
    userId: actorUserId(access)
  });
}

export function requestFractionRowRevision(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return requestFractionRevision({
    courseId: String(data.courseId),
    id: String(data.id),
    approvalType: (data.approvalType === "DOT" ? "DOT" : "MD") as FractionApprovalType,
    reason: String(data.reason ?? ""),
    role: access.role,
    userId: actorUserId(access)
  });
}

export function voidFractionRow(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return voidFractionLogEntry({
    courseId: String(data.courseId),
    id: String(data.id),
    reason: String(data.reason ?? ""),
    userId: actorUserId(access)
  });
}

export function createFractionSchedule(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return generateTreatmentFractionSchedule({
    courseId: String(data.courseId),
    userId: actorUserId(access)
  });
}

export function attachFractionImage(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  return linkFractionImage({
    courseId: String(data.courseId),
    fractionNumber: Number(data.fractionNumber),
    assetId: data.assetId ? String(data.assetId) : undefined,
    notApplicableReason: data.notApplicableReason ? String(data.notApplicableReason) : undefined,
    userId: actorUserId(access)
  });
}

export function completePhysicsCheck(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  requirePhysicsRole(access);
  return recordPhysicsCheck({
    courseId: String(data.courseId),
    fractionNumber: Number(data.fractionNumber),
    userId: actorUserId(access)
  });
}

export function completeOtvCheck(access: PhiAccessContext, data: Record<string, unknown>) {
  requireClinicalMutation(access);
  requireOtvRole(access);
  return recordOtvCheck({
    courseId: String(data.courseId),
    fractionNumber: Number(data.fractionNumber),
    userId: actorUserId(access)
  });
}
