import "server-only";

import type { NextRequest } from "next/server";
import {
  auditEvents,
  generatedDocumentOutputs,
  mappingRecords,
  patients,
  prescriptions,
  simulationOrders,
  treatmentFractions,
  treatmentCourses
} from "@/lib/clinical-store";
import { phiRecordId } from "@/lib/hipaa";
import { canAccessPhi, roleCan } from "@/lib/rbac";
import { prototypeSessionFromRequest } from "@/lib/server/prototype-session";
import type { Patient, PrototypeAccessRole } from "@/lib/types";

export type PhiAccessContext = {
  role: PrototypeAccessRole;
  reason: string;
};

export function phiAccessFromRequest(request: NextRequest, reason: string): PhiAccessContext | null {
  const session = prototypeSessionFromRequest(request);
  const role = session?.role ?? null;

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
    treatmentFractions: treatmentFractions.filter((fraction) => courseIds.has(fraction.courseId)),
    mappingRecords: mappingRecords.filter((record) => courseIds.has(record.courseId)),
    generatedDocumentOutputs: generatedDocumentOutputs.filter((output) => courseIds.has(output.courseId)),
    auditEvents: auditEvents.filter((event) => event.patientId === patient.id || courseIds.has(event.entityId))
  };
}
