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
import type { Patient, ResponsibleParty } from "@/lib/types";

const phiRoles = new Set<ResponsibleParty | "ADMIN" | "CLINICIAN" | "SYSTEM">([
  "ADMIN",
  "CLINICIAN",
  "SYSTEM",
  "RAD_ONC",
  "NP_PA",
  "MA",
  "RTT",
  "PHYSICIST"
]);

export type PhiAccessContext = {
  role: ResponsibleParty | "ADMIN" | "CLINICIAN" | "SYSTEM";
  reason: string;
};

export function phiAccessFromRequest(request: NextRequest, reason: string): PhiAccessContext | null {
  const role = request.headers.get("x-curerays-role")?.toUpperCase();

  if (role && phiRoles.has(role as PhiAccessContext["role"])) {
    return { role: role as PhiAccessContext["role"], reason };
  }

  return null;
}

export function systemPhiAccess(reason: string): PhiAccessContext {
  return { role: "SYSTEM", reason };
}

export function requirePhiAccess(context: PhiAccessContext | null) {
  if (!context || !phiRoles.has(context.role)) {
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
