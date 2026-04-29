import type {
  Activity,
  Appointment,
  AuditEvent,
  OperationalAppointment,
  OperationalAuditEvent,
  OperationalPatient,
  OperationalPriorityFlag,
  OperationalTreatmentCourse,
  Patient,
  PriorityFlag,
  TreatmentCourse
} from "@/lib/types";

export const PHI_REDACTED = "PHI_REDACTED" as const;
export const NONE_RECORDED = "NONE" as const;

const phiKeys = [
  "firstName",
  "lastName",
  "mrn",
  "diagnosis",
  "notes",
  "contentPreview",
  "patientName",
  "lesionLocation",
  "site",
  "laterality",
  "previousValue",
  "newValue"
];

export function patientRef(patientId: string) {
  return `PREF-${patientId.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export function courseRef(courseId: string) {
  return `CREF-${courseId.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export function phiRecordId(entityId: string) {
  return `PHI-${entityId.replace(/[^a-zA-Z0-9]/g, "")}`;
}

export function isPhiBearingKey(key: string) {
  return phiKeys.includes(key);
}

export function toOperationalPatient(patient: Patient): OperationalPatient {
  return {
    id: patient.id,
    patientRef: patientRef(patient.id),
    phiRecordId: phiRecordId(patient.id),
    displayLabel: `Patient ${patientRef(patient.id)}`,
    diagnosisCategory: patient.diagnosisCategory,
    chartRoundsPhase: patient.chartRoundsPhase,
    status: patient.status,
    assignedStaff: patient.assignedStaff,
    activeCourseId: patient.activeCourseId,
    activeCourseRef: courseRef(patient.activeCourseId),
    nextActionCategory: summarizeAction(patient.nextAction),
    flags: patient.flags.map((flag) => ({
      ...flag,
      summary: summarizeAction(flag.summary)
    })),
    checklist: patient.checklist,
    lastUpdatedAt: patient.lastUpdatedAt,
    restricted: true
  };
}

export function toOperationalCourse(course: TreatmentCourse): OperationalTreatmentCourse {
  return {
    id: course.id,
    courseRef: courseRef(course.id),
    patientRef: patientRef(course.patientId),
    diagnosisCategory: course.diagnosisCategory,
    protocolFamily: summarizeProtocol(course.protocolName),
    totalFractions: course.totalFractions,
    currentFraction: course.currentFraction,
    chartRoundsPhase: course.chartRoundsPhase,
    status: course.status
  };
}

export function toOperationalAppointment(appointment: Appointment): OperationalAppointment {
  return {
    id: appointment.id,
    patientRef: patientRef(appointment.patientId),
    displayLabel: `Patient ${patientRef(appointment.patientId)}`,
    title: appointment.title,
    time: appointment.time,
    location: appointment.location,
    staff: appointment.staff,
    chartRoundsPhase: appointment.chartRoundsPhase
  };
}

export function toOperationalPriorityFlag(flag: PriorityFlag): OperationalPriorityFlag {
  return {
    id: flag.id,
    patientRef: patientRef(flag.patientId),
    displayLabel: `Patient ${patientRef(flag.patientId)}`,
    severity: flag.severity,
    summary: summarizeAction(flag.summary),
    owner: flag.owner,
    dueAt: flag.dueAt
  };
}

export function toOperationalActivity(activity: Activity): Activity {
  return {
    ...activity,
    target: activity.target.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "restricted patient record")
  };
}

export function redactAuditEvent(event: AuditEvent): OperationalAuditEvent {
  const hadPreviousValue = event.previousValue && event.previousValue !== "None";
  const hadNewValue = event.newValue && event.newValue !== "None";
  const redacted = Boolean(event.entityType === "PATIENT" || hadPreviousValue || hadNewValue);

  return {
    ...event,
    patientRef: event.patientId ? patientRef(event.patientId) : undefined,
    previousValue: hadPreviousValue ? PHI_REDACTED : NONE_RECORDED,
    newValue: hadNewValue ? PHI_REDACTED : NONE_RECORDED,
    redacted
  };
}

export function summarizeAction(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("signature") || normalized.includes("sign")) {
    return "Signature or review needed";
  }
  if (normalized.includes("billing") || normalized.includes("authorization") || normalized.includes("pre-auth")) {
    return "Billing or authorization review";
  }
  if (normalized.includes("mapping") || normalized.includes("simulation") || normalized.includes("planning")) {
    return "Planning workflow action";
  }
  if (normalized.includes("hold") || normalized.includes("paused")) {
    return "Course attention needed";
  }
  if (normalized.includes("document") || normalized.includes("template") || normalized.includes("export")) {
    return "Document workflow action";
  }

  return "Operational follow-up needed";
}

function summarizeProtocol(protocolName: string) {
  if (protocolName.toLowerCase().includes("igsrt")) {
    return "IGSRT workflow";
  }
  if (protocolName.toLowerCase().includes("arthritis")) {
    return "Arthritis workflow";
  }
  if (protocolName.toLowerCase().includes("dupuytren")) {
    return "Dupuytren workflow";
  }

  return "Treatment workflow";
}
