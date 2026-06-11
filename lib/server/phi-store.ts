import "server-only";

import type { NextRequest } from "next/server";
import {
  auditEvents,
  generatedDocumentOutputs,
  mappingRecords,
  patients,
  prescriptions,
  simulationOrders,
  treatmentCourses
} from "@/lib/clinical-store";
import { phiRecordId } from "@/lib/hipaa";
import { canAccessPhi, normalizeRole, PROTOTYPE_ROLE_HEADER, roleCan } from "@/lib/rbac";
import type { Patient, PrototypeAccessRole } from "@/lib/types";

export type PhiAccessContext = {
  role: PrototypeAccessRole;
  reason: string;
};

export function phiAccessFromRequest(request: NextRequest, reason: string): PhiAccessContext | null {
  const role = normalizeRole(request.headers.get(PROTOTYPE_ROLE_HEADER));

  if (role && canAccessPhi(role)) {
    return { role, reason };
  }

  return null;
}

export function systemPhiAccess(reason: string): PhiAccessContext {
  return { role: "SYSTEM", reason };
}

export function requirePhiAccess(context: PhiAccessContext | null) {
  if (!context || !canAccessPhi(context.role)) {
    throw new Error("PHI access denied");
  }
}

export function requirePhiAction(context: PhiAccessContext | null, action: Parameters<typeof roleCan>[1]) {
  requirePhiAccess(context);

  if (!context || !roleCan(context.role, action)) {
    throw new Error("PHI access denied");
  }
}

export function findPatientPhi(patientRefOrId: string, context: PhiAccessContext | null): Patient | null {
  requirePhiAccess(context);
  const normalized = patientRefOrId.replace(/^PREF-CR/i, "CR-");
  return patients.find((patient) => patient.id === normalized || phiRecordId(patient.id) === patientRefOrId) ?? null;
}

export function getPatientPhiBundle(patientRefOrId: string, context: PhiAccessContext | null) {
  const patient = findPatientPhi(patientRefOrId, context);

  if (!patient) {
    return null;
  }

  const courses = treatmentCourses.filter((course) => course.patientId === patient.id);
  const courseIds = new Set(courses.map((course) => course.id));

  return {
    patient,
    courses,
    simulationOrders: simulationOrders.filter((order) => courseIds.has(order.courseId)),
    prescriptions: prescriptions.filter((prescription) => courseIds.has(prescription.courseId)),
    mappingRecords: mappingRecords.filter((record) => courseIds.has(record.courseId)),
    generatedDocumentOutputs: generatedDocumentOutputs.filter((output) => courseIds.has(output.courseId)),
    auditEvents: auditEvents.filter((event) => event.patientId === patient.id || courseIds.has(event.entityId))
  };
}
