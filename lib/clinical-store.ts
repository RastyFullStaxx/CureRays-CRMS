import {
  activities as mockActivities,
  appointments as mockAppointments,
  auditEvents as mockAuditEvents,
  billingCodes as mockBillingCodes,
  carepathTasks as mockCarepathTasks,
  fractionLogEntries as mockFractionLogEntries,
  generatedDocuments as mockGeneratedDocuments,
  patients as mockPatients,
  priorityFlags as mockPriorityFlags,
  treatmentCourses as mockTreatmentCourses
} from "@/lib/mock-data";
import type {
  Activity,
  Appointment,
  AuditCheck,
  AuditEvent,
  BillingCode,
  CarepathTask,
  CarepathWorkflowPhase,
  CourseFolderPlaceholder,
  DiagnosisCategory,
  FractionApprovalType,
  FractionLogEntry,
  GeneratedDocument,
  GeneratedDocumentOutput,
  InitialCourseCreateInput,
  IgsrtWorkspace,
  MappingRecord,
  PatientCreateInput,
  PatientEditDto,
  PatientLifecycleUpdateInput,
  PatientRecordHistoryEntry,
  PatientUpdateInput,
  PatientValidationResult,
  Patient,
  Phase6GateStatus,
  Phase6PlanningReadiness,
  Prescription,
  PrototypeAccessRole,
  PriorityFlag,
  SimulationOrder,
  TreatmentCourse,
  TreatmentFraction,
  WorkflowDefinition,
  WorkflowStep,
  WorkflowSnapshot
} from "@/lib/types";
import {
  PHI_REDACTED,
  courseRef,
  patientRef,
  phiRecordId,
  redactAuditEvent,
  toOperationalActivity,
  toOperationalAppointment,
  toOperationalCourse,
  toOperationalPatient,
  toOperationalPriorityFlag
} from "@/lib/hipaa";
import { canApproveFraction } from "@/lib/rbac";
import { courseDocuments, courseFractions, patientName } from "@/lib/workflow";
import { fileStorageService } from "@/lib/services/file-storage-service";
import {
  deriveWorkflowDocumentStates,
  documentRequirements,
  documentTemplates,
  ensureRequirementDocuments,
  ensureRequirementTasks,
  internalFormTemplates,
  templateSources,
  workflowDefinitions
} from "@/lib/template-registry";
import {
  calculateFractionWorksheetEntry,
  deriveFractionLogStatus,
  isVoidedFractionEntry,
  recalculateFractionWorksheetEntries
} from "@/lib/services/fraction-worksheet-service";

export {
  documentRequirements,
  documentTemplates,
  internalFormTemplates,
  templateSources,
  workflowDefinitions
} from "@/lib/template-registry";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function todayIsoDate() {
  return nowIso().slice(0, 10);
}

function compactBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function activeFractionEntries(entries: FractionLogEntry[]) {
  return entries.filter((entry) => !isVoidedFractionEntry(entry));
}

function textInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function diagnosisCategoryInput(value: unknown): DiagnosisCategory {
  return value === "ARTHRITIS" || value === "DUPUYTRENS" ? value : "SKIN_CANCER";
}

function nextPatientNumber() {
  const numericIds = patients
    .map((patient) => Number(patient.id.replace(/^CR-/, "")))
    .filter(Number.isFinite);
  return Math.max(2400, ...numericIds) + 1;
}

function resolvePatientIndex(patientRefOrId: string) {
  const normalized = patientRefOrId.replace(/^PREF-CR/i, "CR-");
  return patients.findIndex(
    (patient) =>
      patient.id === normalized ||
      patient.id === patientRefOrId ||
      phiRecordId(patient.id) === patientRefOrId ||
      patientRef(patient.id) === patientRefOrId
  );
}

function protocolForDiagnosis(category: DiagnosisCategory) {
  if (category === "ARTHRITIS") {
    return {
      protocolName: "Joint",
      treatmentModality: "Orthovoltage",
      treatmentType: "Arthritis"
    };
  }

  if (category === "DUPUYTRENS") {
    return {
      protocolName: "Dupuytren's workflow",
      treatmentModality: "Orthovoltage",
      treatmentType: "Dupuytren's"
    };
  }

  return {
    protocolName: "Skin Cancer IGSRT",
    treatmentModality: "IGSRT",
    treatmentType: "SRT"
  };
}

const carepathStepNames = [
  "Carepath Preauth",
  "Image Guidance Order",
  "Simulation Order",
  "Simulation Note",
  "Construct Treatment Device Note",
  "Clinical Treatment Planning Note",
  "Special Physics Consult Note",
  "Orthovoltage Radiation Prescription",
  "Fractionation Log",
  "Special Treatment Procedure",
  "OTV / Treatment Management Notes",
  "Weekly Physics Chart Check Note",
  "In-Vivo Dosimetry Note",
  "Treatment Summary",
  "Carepath Audit Note Sign"
];

const workflowStepPhase: Record<number, CarepathWorkflowPhase> = {
  0: "CONSULTATION",
  1: "CHART_PREP",
  2: "SIMULATION",
  3: "SIMULATION",
  4: "PLANNING",
  5: "PLANNING",
  6: "PLANNING",
  7: "PLANNING",
  8: "ON_TREATMENT",
  9: "ON_TREATMENT",
  10: "ON_TREATMENT",
  11: "ON_TREATMENT",
  12: "ON_TREATMENT",
  13: "POST_TX",
  14: "AUDIT"
};

const workflowStepRole: Record<number, CarepathTask["responsibleParty"]> = {
  0: "VA",
  1: "RAD_ONC",
  2: "RAD_ONC",
  3: "MA",
  4: "MA",
  5: "RAD_ONC",
  6: "PHYSICIST",
  7: "RAD_ONC",
  8: "RTT",
  9: "RAD_ONC",
  10: "NP_PA",
  11: "PHYSICIST",
  12: "PHYSICIST",
  13: "RAD_ONC",
  14: "ADMIN"
};

function normalizeCourseText(value: string | undefined, fallback: string) {
  return textInput(value).toUpperCase() || fallback;
}

function normalizeInitialCourseInput(
  input: InitialCourseCreateInput | undefined,
  diagnosisCategory: DiagnosisCategory
) {
  const protocol = protocolForDiagnosis(diagnosisCategory);
  const bodyRegion =
    normalizeCourseText(input?.bodyRegion, diagnosisCategory === "ARTHRITIS" ? "HAND" : "SITE");
  const laterality = normalizeCourseText(input?.laterality, "UNSPECIFIED");
  const totalFractions = Number.isFinite(Number(input?.totalFractions)) && Number(input?.totalFractions) > 0
    ? Number(input?.totalFractions)
    : diagnosisCategory === "SKIN_CANCER"
      ? 20
      : 10;

  return {
    protocolName: textInput(input?.protocol) || protocol.protocolName,
    treatmentModality: textInput(input?.treatmentModality) || protocol.treatmentModality,
    treatmentType: protocol.treatmentType,
    bodyRegion,
    laterality,
    totalFractions,
    startDate: textInput(input?.startDate) || todayIsoDate()
  };
}

function workflowMatchesCourse(workflow: WorkflowDefinition, diagnosisCategory: DiagnosisCategory, course: TreatmentCourse) {
  if (workflow.diagnosis === "ALL") {
    return false;
  }

  const normalizedProtocol = `${course.protocolName} ${course.treatmentModality}`.toLowerCase();
  const workflowProtocol = workflow.protocol.toLowerCase();

  return workflow.diagnosis === diagnosisCategory &&
    (normalizedProtocol.includes(workflowProtocol) ||
      workflowProtocol.includes(course.protocolName.toLowerCase()));
}

function selectWorkflowDefinition(diagnosisCategory: DiagnosisCategory, course: TreatmentCourse) {
  return (
    workflowDefinitions.find((workflow) => workflowMatchesCourse(workflow, diagnosisCategory, course)) ??
    workflowDefinitions.find((workflow) => workflow.id === "WF-UNIVERSAL") ??
    workflowDefinitions[0]
  );
}

function createWorkflowStepsForCourse(
  course: TreatmentCourse,
  workflowDefinition: WorkflowDefinition,
  timestamp: string
): WorkflowStep[] {
  return carepathStepNames.map((stepName, stepNumber) => ({
    id: `WF-${course.id}-${stepNumber}`,
    courseId: course.id,
    stepNumber,
    stepName,
    phase: workflowStepPhase[stepNumber],
    status: stepNumber === 0 ? "PENDING" : "NOT_STARTED",
    responsibleRole: workflowStepRole[stepNumber],
    triggerEvent:
      stepNumber === 0
        ? "New patient-course bundle created"
        : stepNumber === 14
          ? "Summary, billing, images, signatures, and follow-up complete"
          : "Previous workflow requirement ready",
    dueDate: stepNumber < 8 ? course.startDate : undefined,
    requiresSignature: [0, 1, 2, 5, 6, 7, 11, 13, 14].includes(stepNumber),
    blockers:
      workflowDefinition.status === "MAPPING_IN_PROGRESS" && stepNumber === 14
        ? ["Workflow mapping must be reviewed before final closeout"]
        : [],
    auditChecklist: ["Status documented", "Responsible role assigned", "Linked evidence tracked"],
    notes: `Generated from ${workflowDefinition.name}.`,
    createdAt: timestamp,
    updatedAt: timestamp
  }));
}

function createAuditChecksForCourse(course: TreatmentCourse, timestamp: string): AuditCheck[] {
  return [
    "Required documents generated",
    "Workflow N/A reasons documented",
    "Treatment summary complete",
    "Follow-up scheduled",
    "Billing complete",
    "Folder placeholders ready",
    "Final Carepath audit sign ready"
  ].map((label, index) => ({
    id: `AUDIT-${course.id}-${index + 1}`,
    courseId: course.id,
    category: index < 2 ? "Documents" : index < 5 ? "Closeout" : "Final Audit",
    label,
    status: index === 0 || index === 5 ? "PENDING" : "NOT_STARTED",
    required: true,
    notes: "Created with initial patient-course registration bundle.",
    completedAt: undefined,
    completedByUserId: undefined,
    naReason: undefined
  }));
}

function createFolderPlaceholderForCourse(course: TreatmentCourse, timestamp: string): CourseFolderPlaceholder {
  const plannedFolders = fileStorageService.createCourseFolders(course.id);

  return {
    id: `FOLDER-${course.id}`,
    patientRef: patientRef(course.patientId),
    courseRef: courseRef(course.id),
    courseId: course.id,
    storageProvider: "PENDING_DRIVE",
    path: fileStorageService.getCourseFolderPath(patientRef(course.patientId), courseRef(course.id)),
    folders: plannedFolders.folders,
    status: "PLANNED",
    createdAt: timestamp
  };
}

export type PatientMutationAuditContext = {
  userId: string;
  userName: string;
  role: PrototypeAccessRole;
  sessionId: string;
  ipAddress: string;
  deviceId: string;
  reason: string;
};

function patientAuditContext(
  context: Partial<PatientMutationAuditContext> | undefined,
  fallbackReason: string
): PatientMutationAuditContext {
  return {
    userId: textInput(context?.userId) || "PROTOTYPE-SYSTEM",
    userName: textInput(context?.userName) || "Prototype System",
    role: context?.role ?? "SYSTEM",
    sessionId: textInput(context?.sessionId) || "prototype-session",
    ipAddress: textInput(context?.ipAddress) || "prototype-ip",
    deviceId: textInput(context?.deviceId) || "prototype-device",
    reason: textInput(context?.reason) || fallbackReason
  };
}

function patientAuditFields(context: PatientMutationAuditContext) {
  return {
    userId: context.userId,
    userName: context.userName,
    role: context.role,
    sessionId: context.sessionId,
    ipAddress: context.ipAddress,
    deviceId: context.deviceId,
    reason: context.reason
  };
}

function patientEditDto(patient: Patient, course?: TreatmentCourse): PatientEditDto {
  return {
    phiRecordId: phiRecordId(patient.id),
    patientRef: patientRef(patient.id),
    firstName: patient.firstName,
    lastName: patient.lastName,
    mrn: patient.mrn,
    diagnosis: patient.diagnosis,
    diagnosisCategory: patient.diagnosisCategory,
    location: patient.location,
    physician: patient.physician,
    assignedStaff: patient.assignedStaff,
    chartRoundsPhase: patient.chartRoundsPhase,
    status: patient.status,
    nextAction: patient.nextAction,
    notes: patient.notes,
    lastUpdatedAt: patient.lastUpdatedAt,
    initialCourse: course
      ? {
          protocol: course.protocolName,
          bodyRegion: course.bodyRegion,
          laterality: course.laterality,
          treatmentModality: course.treatmentModality,
          totalFractions: course.totalFractions,
          startDate: course.startDate
        }
      : undefined
  };
}

function patientMutationPayload(patient: Patient, auditEvent: AuditEvent, course?: TreatmentCourse) {
  return {
    data: toOperationalPatient(patient),
    course: course ? toOperationalCourse(course) : undefined,
    bundle: course
      ? {
          workflowDefinitionId: course.workflowDefinitionId,
          workflowStepCount: patientCourseWorkflowSteps.filter((step) => step.courseId === course.id).length,
          taskCount: carepathTasks.filter((task) => task.courseId === course.id).length,
          documentCount: generatedDocuments.filter((document) => document.courseId === course.id).length,
          auditCheckCount: patientCourseAuditChecks.filter((check) => check.courseId === course.id).length,
          folderPlaceholderCount: courseFolderPlaceholders.filter((folder) => folder.courseId === course.id).length,
          historyEntryCount: patientRecordHistory.filter((entry) => entry.patientRef === patientRef(patient.id)).length
        }
      : undefined,
    auditEvent: redactAuditEvent(auditEvent),
    phiBoundary: "PHI fields were accepted by a guarded prototype route and redacted from this response."
  };
}

export const patients: Patient[] = clone(mockPatients);
export const treatmentCourses: TreatmentCourse[] = clone(mockTreatmentCourses);
export const patientCourseWorkflowSteps: WorkflowStep[] = [];
export const patientCourseAuditChecks: AuditCheck[] = [];
export const courseFolderPlaceholders: CourseFolderPlaceholder[] = [];
export const patientRecordHistory: PatientRecordHistoryEntry[] = [];

function addPatientRecordHistory(
  patient: Patient,
  course: TreatmentCourse | undefined,
  action: string,
  summary: string,
  context: PatientMutationAuditContext,
  previousValue: "PHI_REDACTED" | "NONE" = PHI_REDACTED
) {
  const entry: PatientRecordHistoryEntry = {
    id: `HIST-${patient.id}-${patientRecordHistory.length + 1}`,
    patientRef: patientRef(patient.id),
    courseRef: course ? courseRef(course.id) : undefined,
    action,
    summary,
    previousValue,
    newValue: PHI_REDACTED,
    changedBy: context.userName,
    role: context.role,
    sessionId: context.sessionId,
    ipAddress: context.ipAddress,
    deviceId: context.deviceId,
    reason: context.reason,
    timestamp: nowIso()
  };

  patientRecordHistory.push(entry);
  return entry;
}

export const carepathTasks: CarepathTask[] = [
  ...clone(mockCarepathTasks),
  {
    id: "TASK-2401-SIM",
    courseId: "COURSE-2401",
    taskNumber: "IGSRT-01",
    title: "Complete simulation order",
    workflowPhase: "PLANNING",
    documentName: "CTP / SIM IGSRT Order",
    status: "COMPLETED",
    responsibleParty: "RAD_ONC",
    timing: "Before first treatment",
    noteAction: "Confirm setup, margin, imaging, and physics requirements",
    cptCodes: ["77280"],
    auditSteps: ["Simulation order complete", "Rad Onc signature"],
    auditReady: true,
    completedAt: "2026-04-20T09:00:00+08:00",
    signedAt: "2026-04-20T09:05:00+08:00",
    lastUpdatedAt: "2026-04-20T09:05:00+08:00",
    assignedUser: "Dr. Helena Cruz"
  },
  {
    id: "TASK-2401-RX",
    courseId: "COURSE-2401",
    taskNumber: "IGSRT-02",
    title: "Review prescription parameters",
    workflowPhase: "PLANNING",
    documentName: "IGSRT Prescription",
    status: "NEEDS_REVIEW",
    responsibleParty: "RAD_ONC",
    timing: "Before treatment continuation",
    noteAction: "Verify phase prescription, DOT, setup, and image guidance",
    cptCodes: ["77261", "77300"],
    auditSteps: ["Prescription review", "Rad Onc signature"],
    auditReady: false,
    dueDate: "2026-04-27",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    assignedUser: "Dr. Helena Cruz"
  },
  {
    id: "TASK-2401-FXLOG",
    courseId: "COURSE-2401",
    taskNumber: "IGSRT-03",
    title: "Reconcile fraction log approvals",
    workflowPhase: "ON_TREATMENT",
    documentName: "IGSRT Fraction Log",
    status: "NEEDS_REVIEW",
    responsibleParty: "RTT",
    timing: "Daily during treatment",
    noteAction: "Resolve missing MD/DOT approvals and update cumulative dose",
    cptCodes: ["77436", "77437", "77439"],
    auditSteps: ["Daily treatment log", "MD approval", "DOT approval"],
    auditReady: false,
    dueDate: "2026-04-27",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    assignedUser: "Noel Rivera"
  }
];
export const generatedDocuments: GeneratedDocument[] = [
  ...clone(mockGeneratedDocuments),
  {
    id: "DOC-2401-SIM",
    templateId: "TPL-IGSRT-SIM",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    name: "CTP / SIM IGSRT Order",
    clinicalPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    status: "SIGNED",
    requiredAction: "Simulation order signed",
    cptCode: "77280",
    assignedTo: "Dr. Helena Cruz",
    lastUpdatedAt: "2026-04-20T09:05:00+08:00",
    signedAt: "2026-04-20T09:05:00+08:00",
    signReviewState: "SIGNED",
    auditReady: true
  },
  {
    id: "DOC-2401-RX",
    templateId: "TPL-IGSRT-RX",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    name: "IGSRT Prescription",
    clinicalPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    status: "READY_FOR_REVIEW",
    requiredAction: "Rad Onc review and signature needed",
    cptCode: "77300",
    assignedTo: "Dr. Helena Cruz",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    signReviewState: "READY_FOR_SIGNATURE",
    auditReady: false
  },
  {
    id: "DOC-2401-FXLOG",
    templateId: "TPL-IGSRT-FXLOG",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    name: "IGSRT Fraction Log",
    clinicalPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    status: "NEEDS_REVIEW",
    requiredAction: "Reconcile missing MD approval",
    cptCode: "77439",
    assignedTo: "Noel Rivera",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    signReviewState: "REVIEW_REQUIRED",
    auditReady: false
  }
];
export const fractionLogEntries: FractionLogEntry[] = clone(mockFractionLogEntries);
export const billingCodes: BillingCode[] = clone(mockBillingCodes);
export const auditEvents: AuditEvent[] = clone(mockAuditEvents);
export const appointments: Appointment[] = clone(mockAppointments);
export const activities: Activity[] = clone(mockActivities);
export const priorityFlags: PriorityFlag[] = clone(mockPriorityFlags);

export function operationalPatients() {
  return patients.map(toOperationalPatient);
}

export function operationalTreatmentCourses() {
  return treatmentCourses.map(toOperationalCourse);
}

export function operationalAppointments() {
  return appointments.map(toOperationalAppointment);
}

export function operationalActivities() {
  return activities.map(toOperationalActivity);
}

export function operationalPriorityFlags() {
  return priorityFlags.map(toOperationalPriorityFlag);
}

export function operationalAuditEvents() {
  return auditEvents.map(redactAuditEvent);
}

export const simulationOrders: SimulationOrder[] = [
  {
    id: "SIM-2401",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    lesionLocation: "Nasal bridge",
    laterality: "Midline",
    lesionBorderInked: true,
    allMarginsInked: true,
    phaseIMarginInstruction: "Inked at lesion border with planned treatment margin.",
    phaseIIMarginInstruction: "",
    chairSetup: "Face the wall",
    position: "Sitting reclined",
    setupPhotoChecklist: ["Inked target photo", "Sensus ruler circle measurement", "Shielded image photo", "Light field verification"],
    ultrasoundFrequencies: ["20 MHz daily", "50 MHz weekly"],
    specialPhysicsRequired: false,
    specialPhysicsReason: "",
    weeklyPhysicsRequired: true,
    weeklyPhysicsReason: "Weekly chart and coverage checks",
    inVivoDosimetryRequired: false,
    radiationOncologist: "Dr. Helena Cruz",
    dateCompleted: "2026-04-20",
    signedAt: "2026-04-20T09:05:00+08:00",
    status: "SIGNED",
    lastUpdatedAt: "2026-04-20T09:05:00+08:00"
  }
];

export const prescriptions: Prescription[] = [
  {
    id: "RX-2401",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    site: "Nasal bridge",
    laterality: "Midline",
    verifiedInSensus: true,
    phases: [
      {
        id: "RX-2401-P1",
        phaseName: "Phase I",
        energyKv: 50,
        phaseTotalDoseGy: 50,
        dosePerFractionGy: 2.5,
        totalFractions: 20,
        timeMinutes: 4,
        ssdCm: 15,
        applicatorSize: "3 cm cone",
        marginMm: 5,
        technique: "Superficial XRT",
        shieldingDesign: "Custom nasal bridge shield",
        depthOfTargetMm: 4
      }
    ],
    imagingGuidance: ["20 MHz daily isodose tracking", "50 MHz weekly comprehensive IGSRT"],
    priorRadiationTherapy: false,
    preAuthorized: true,
    dateOrdered: "2026-04-20",
    status: "READY_FOR_REVIEW",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00"
  }
];

export const mappingRecords: MappingRecord[] = [];
export const generatedDocumentOutputs: GeneratedDocumentOutput[] = [];
export const treatmentFractions: TreatmentFraction[] = seedTreatmentFractionsFromEntries();

ensureRequirementDocuments(patients, treatmentCourses, generatedDocuments);
ensureRequirementTasks(patients, treatmentCourses, carepathTasks);

function addAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">) {
  const auditEvent: AuditEvent = {
    id: `AUD-${900 + auditEvents.length + 1}`,
    timestamp: nowIso(),
    ...event
  };
  auditEvents.unshift(auditEvent);
  return auditEvent;
}

function getSimulationOrder(courseId: string) {
  return simulationOrders.find((order) => order.courseId === courseId);
}

function getPrescription(courseId: string) {
  return prescriptions.find((prescription) => prescription.courseId === courseId);
}

function addCalendarDays(dateIso: string, offsetDays: number) {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function weekdayTreatmentDate(startDateIso: string, treatmentIndex: number) {
  let date = startDateIso;
  let deliveredTreatments = 0;

  while (deliveredTreatments < treatmentIndex) {
    date = addCalendarDays(date, 1);
    const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    if (weekday !== 0 && weekday !== 6) {
      deliveredTreatments += 1;
    }
  }

  return date;
}

function plannedFractionCount(prescription: Prescription | undefined, course: TreatmentCourse | undefined) {
  return prescription?.phases.reduce((total, phase) => total + phase.totalFractions, 0) ?? course?.totalFractions ?? 0;
}

function isPrescriptionPrototypeReady(prescription: Prescription | undefined, simulationOrder: SimulationOrder | undefined) {
  return Boolean(
    prescription &&
      prescription.status === "READY_FOR_REVIEW" &&
      prescription.verifiedInSensus &&
      prescription.preAuthorized &&
      prescription.phases.length > 0 &&
      simulationOrder?.signedAt
  );
}

function isPrescriptionSchedulable(prescription: Prescription | undefined, simulationOrder: SimulationOrder | undefined) {
  return Boolean(prescription?.signedAt || prescription?.status === "SIGNED" || isPrescriptionPrototypeReady(prescription, simulationOrder));
}

function requiresImageGuidance(prescription: Prescription | undefined) {
  return Boolean(prescription?.imagingGuidance.length);
}

function isOtvRequired(fractionNumber: number) {
  return fractionNumber === 1 || fractionNumber % 5 === 0;
}

function isPhysicsCheckRequired(order: SimulationOrder | undefined, fractionNumber: number) {
  return Boolean(order?.weeklyPhysicsRequired && fractionNumber % 5 === 0);
}

function scheduledFractionId(courseId: string, fractionNumber: number) {
  return `TF-${courseId.replace("COURSE-", "")}-${String(fractionNumber).padStart(2, "0")}`;
}

function workflowStatusForFraction(entry: FractionLogEntry | undefined): TreatmentFraction["status"] {
  if (!entry) {
    return "NOT_STARTED";
  }

  if (entry.status === "VOIDED") {
    return "NOT_APPLICABLE";
  }

  if (entry.status === "APPROVED" || (entry.mdApproval && entry.dotApproval)) {
    return "COMPLETED";
  }

  if (entry.status === "REVISION_NEEDED") {
    return "BLOCKED";
  }

  return "READY_FOR_REVIEW";
}

function buildTreatmentFractionFromPlan(input: {
  course: TreatmentCourse;
  prescription: Prescription;
  simulationOrder?: SimulationOrder;
  fractionNumber: number;
  phaseId: string;
  phaseName: string;
  phaseIndex: number;
  treatmentIndex: number;
  plannedDose: number;
  cumulativeDose: number;
  energy: string;
  applicator: string;
  existingEntry?: FractionLogEntry;
  existingScheduled?: TreatmentFraction;
}): TreatmentFraction {
  const requiresImage = requiresImageGuidance(input.prescription);
  const imageAssetIds =
    input.existingScheduled?.imageAssetIds?.length
      ? input.existingScheduled.imageAssetIds
      : input.existingEntry?.dotApproval
        ? [`LEGACY-IMAGE-${input.existingEntry.id}`]
        : [];
  const imageGuidanceNotApplicableReason = input.existingScheduled?.imageGuidanceNotApplicableReason;
  const imageGuidanceCompleted =
    imageAssetIds.length > 0 ||
    Boolean(imageGuidanceNotApplicableReason) ||
    Boolean(input.existingEntry?.dotApproval && !requiresImage);

  return {
    id: input.existingScheduled?.id ?? scheduledFractionId(input.course.id, input.fractionNumber),
    courseId: input.course.id,
    fractionNumber: input.fractionNumber,
    phase: input.phaseName,
    treatmentDate: input.existingScheduled?.treatmentDate ?? weekdayTreatmentDate(input.course.startDate, input.treatmentIndex),
    plannedDose: input.plannedDose,
    deliveredDose: input.existingEntry?.dosePerFractionCgy ?? input.existingEntry?.dosePerFraction,
    cumulativeDose: input.existingEntry?.cumulativeDoseCgy ?? input.existingEntry?.cumulativeDose ?? input.cumulativeDose,
    energy: input.existingEntry?.energy ?? input.energy,
    applicator: input.existingEntry?.fieldSizeCm ?? input.applicator,
    imageGuidanceCompleted,
    imageGuidanceStatus: !requiresImage
      ? "NOT_REQUIRED"
      : imageGuidanceNotApplicableReason
        ? "NOT_APPLICABLE"
        : imageAssetIds.length > 0
          ? "COMPLETE"
          : "MISSING",
    imageAssetIds,
    imageGuidanceNotApplicableReason,
    scheduledFromPrescription: true,
    sourcePrescriptionId: input.prescription.id,
    sourcePhaseId: input.phaseId,
    linkedFractionLogEntryId: input.existingEntry?.id ?? input.existingScheduled?.linkedFractionLogEntryId,
    physicsCheckRequired: isPhysicsCheckRequired(input.simulationOrder, input.fractionNumber),
    physicsCheckCompletedAt: input.existingScheduled?.physicsCheckCompletedAt,
    physicsCheckCompletedByUserId: input.existingScheduled?.physicsCheckCompletedByUserId,
    otvRequired: isOtvRequired(input.fractionNumber),
    otvCompletedAt: input.existingScheduled?.otvCompletedAt,
    otvCompletedByUserId: input.existingScheduled?.otvCompletedByUserId,
    generatedAt: input.existingScheduled?.generatedAt ?? nowIso(),
    lockedAt: input.existingEntry?.status === "APPROVED" ? input.existingEntry.mdApprovedAt ?? input.existingEntry.dotApprovedAt : undefined,
    status: workflowStatusForFraction(input.existingEntry),
    therapistId: input.existingEntry?.technicianInitials ?? input.existingScheduled?.therapistId,
    physicianReviewedAt: input.existingEntry?.mdApprovedAt ?? input.existingScheduled?.physicianReviewedAt,
    notes: input.existingEntry?.notes ?? input.existingScheduled?.notes ?? "Scheduled from prescription phase."
  };
}

function buildScheduledFractionsForCourse(courseId: string) {
  const course = treatmentCourses.find((item) => item.id === courseId);
  const prescription = getPrescription(courseId);
  const simulationOrder = getSimulationOrder(courseId);

  if (!course || !prescription) {
    return [];
  }

  let fractionNumber = 0;
  let cumulativeDose = 0;

  return prescription.phases.flatMap((phase, phaseIndex) =>
    Array.from({ length: phase.totalFractions }, (_, index) => {
      fractionNumber += 1;
      const plannedDose = Math.round(phase.dosePerFractionGy * 100);
      cumulativeDose += plannedDose;
      const existingEntry = fractionLogEntries.find(
        (entry) => entry.courseId === courseId && entry.fractionNumber === fractionNumber && !isVoidedFractionEntry(entry)
      );
      const existingScheduled = treatmentFractions.find(
        (fraction) => fraction.courseId === courseId && fraction.fractionNumber === fractionNumber
      );

      return buildTreatmentFractionFromPlan({
        course,
        prescription,
        simulationOrder,
        fractionNumber,
        phaseId: phase.id,
        phaseName: phase.phaseName,
        phaseIndex,
        treatmentIndex: fractionNumber - 1,
        plannedDose,
        cumulativeDose,
        energy: `${phase.energyKv} kV`,
        applicator: phase.applicatorSize,
        existingEntry,
        existingScheduled
      });
    })
  );
}

function seedTreatmentFractionsFromEntries() {
  return fractionLogEntries
    .map((entry) => {
      const course = treatmentCourses.find((item) => item.id === entry.courseId);
      const prescription = getPrescription(entry.courseId);
      const simulationOrder = getSimulationOrder(entry.courseId);
      const phase = prescription?.phases.find((item) => item.phaseName === entry.phase) ?? prescription?.phases[0];

      if (!course || !prescription || !phase) {
        return null;
      }

      return buildTreatmentFractionFromPlan({
        course,
        prescription,
        simulationOrder,
        fractionNumber: entry.fractionNumber,
        phaseId: phase.id,
        phaseName: entry.phase,
        phaseIndex: prescription.phases.indexOf(phase),
        treatmentIndex: Math.max(entry.fractionNumber - 1, 0),
        plannedDose: entry.dosePerFractionCgy ?? entry.dosePerFraction,
        cumulativeDose: entry.cumulativeDoseCgy ?? entry.cumulativeDose,
        energy: entry.energy,
        applicator: entry.fieldSizeCm ?? phase.applicatorSize,
        existingEntry: entry
      });
    })
    .filter((fraction): fraction is TreatmentFraction => Boolean(fraction));
}

function syncTreatmentFractionsForCourse(courseId: string) {
  const existing = treatmentFractions.filter((fraction) => fraction.courseId === courseId);
  const scheduled = existing.some((fraction) => fraction.scheduledFromPrescription)
    ? buildScheduledFractionsForCourse(courseId)
    : seedTreatmentFractionsFromEntries().filter((fraction) => fraction.courseId === courseId);

  for (let index = treatmentFractions.length - 1; index >= 0; index -= 1) {
    if (treatmentFractions[index].courseId === courseId) {
      treatmentFractions.splice(index, 1);
    }
  }

  treatmentFractions.push(...scheduled);
  treatmentFractions.sort((a, b) => a.courseId.localeCompare(b.courseId) || a.fractionNumber - b.fractionNumber);
}

function courseTreatmentFractions(courseId: string) {
  return treatmentFractions.filter((fraction) => fraction.courseId === courseId).sort((a, b) => a.fractionNumber - b.fractionNumber);
}

function assertFractionImagingGate(courseId: string, fractionNumber: number) {
  const scheduled = treatmentFractions.find((fraction) => fraction.courseId === courseId && fraction.fractionNumber === fractionNumber);

  if (!scheduled || scheduled.imageGuidanceStatus === "NOT_REQUIRED" || scheduled.imageGuidanceStatus === "COMPLETE" || scheduled.imageGuidanceStatus === "NOT_APPLICABLE") {
    return;
  }

  throw new Error("DOT approval requires linked imaging evidence or documented not applicable reason.");
}

function buildGateStatus(input: {
  courseId: string;
  label: string;
  blockedLabel: string;
  clearLabel: string;
  fractions: TreatmentFraction[];
  isRequired: (fraction: TreatmentFraction) => boolean;
  isComplete: (fraction: TreatmentFraction) => boolean;
  evidenceIds?: (fraction: TreatmentFraction) => string[];
}): Phase6GateStatus {
  const required = input.fractions.filter(input.isRequired);
  const completed = required.filter(input.isComplete);
  const missing = required.filter((fraction) => !input.isComplete(fraction));
  const evidenceIds = required.flatMap((fraction) => input.evidenceIds?.(fraction) ?? []);

  return {
    courseId: input.courseId,
    status: missing.length ? "BLOCKED" : required.length ? "CLEAR" : "CLEAR",
    label: input.label,
    detail: missing.length ? input.blockedLabel : input.clearLabel,
    missing: missing.map((fraction) => `Fx ${fraction.fractionNumber}`),
    dueFractions: missing.map((fraction) => fraction.fractionNumber),
    completedFractions: completed.map((fraction) => fraction.fractionNumber),
    evidenceIds
  };
}

export function getPhase6PlanningReadiness(courseId: string): Phase6PlanningReadiness {
  const course = treatmentCourses.find((item) => item.id === courseId);
  const prescription = getPrescription(courseId);
  const simulationOrder = getSimulationOrder(courseId);
  const scheduled = courseTreatmentFractions(courseId);
  const missingInputs: string[] = [];

  if (!course) {
    missingInputs.push("Course record");
  }
  if (!simulationOrder?.signedAt) {
    missingInputs.push("Signed simulation order");
  }
  if (!prescription) {
    missingInputs.push("Prescription");
  }
  if (prescription && prescription.phases.length === 0) {
    missingInputs.push("Prescription phases");
  }
  if (prescription && !prescription.verifiedInSensus) {
    missingInputs.push("Sensus verification");
  }
  if (prescription && !prescription.preAuthorized) {
    missingInputs.push("Preauthorization");
  }

  const plannedFractions = plannedFractionCount(prescription, course);
  const scheduleGenerated = plannedFractions > 0 && scheduled.length >= plannedFractions;
  const signedPrescription = Boolean(prescription?.signedAt || prescription?.status === "SIGNED");
  const prototypeReady = isPrescriptionPrototypeReady(prescription, simulationOrder);

  return {
    courseId,
    status: missingInputs.length
      ? "BLOCKED"
      : scheduleGenerated
        ? "CLINICAL_VALIDATION_REQUIRED"
        : "READY_FOR_SCHEDULE",
    missingInputs,
    signedPrescription,
    prototypeReady,
    scheduleGenerated,
    scheduledFractions: scheduled.length,
    plannedFractions,
    clinicalValidationRequired: true,
    clinicianSignoffStatus: "REQUIRED"
  };
}

export function getPhase6GateStatuses(courseId: string) {
  const fractions = courseTreatmentFractions(courseId);

  return {
    imagingGateStatus: buildGateStatus({
      courseId,
      label: "Imaging Guidance",
      blockedLabel: "Required fraction imaging is missing.",
      clearLabel: "Required imaging is complete or not applicable.",
      fractions,
      isRequired: (fraction) => fraction.imageGuidanceStatus === "MISSING" || fraction.imageGuidanceStatus === "REQUIRED" || fraction.imageGuidanceStatus === "COMPLETE",
      isComplete: (fraction) => fraction.imageGuidanceStatus === "COMPLETE" || fraction.imageGuidanceStatus === "NOT_APPLICABLE",
      evidenceIds: (fraction) => fraction.imageAssetIds ?? []
    }),
    otvDueStatus: buildGateStatus({
      courseId,
      label: "OTV",
      blockedLabel: "OTV documentation is due.",
      clearLabel: "Required OTV checks are clear.",
      fractions,
      isRequired: (fraction) => Boolean(fraction.otvRequired),
      isComplete: (fraction) => Boolean(fraction.otvCompletedAt)
    }),
    physicsCheckDueStatus: buildGateStatus({
      courseId,
      label: "Physics Check",
      blockedLabel: "Weekly physics check is due.",
      clearLabel: "Required physics checks are clear.",
      fractions,
      isRequired: (fraction) => Boolean(fraction.physicsCheckRequired),
      isComplete: (fraction) => Boolean(fraction.physicsCheckCompletedAt)
    })
  };
}

function isSimulationComplete(order: SimulationOrder) {
  return Boolean(
    order.lesionLocation &&
      order.laterality &&
      order.phaseIMarginInstruction &&
      order.chairSetup &&
      order.position &&
      order.ultrasoundFrequencies.length &&
      order.weeklyPhysicsReason &&
      order.dateCompleted
  );
}

function isPrescriptionComplete(prescription: Prescription) {
  return Boolean(
    prescription.site &&
      prescription.laterality &&
      prescription.dateOrdered &&
      prescription.phases.length &&
      prescription.phases.every(
        (phase) =>
          phase.energyKv > 0 &&
          phase.phaseTotalDoseGy > 0 &&
          phase.dosePerFractionGy > 0 &&
          phase.totalFractions > 0 &&
          phase.ssdCm > 0 &&
          phase.depthOfTargetMm > 0
      )
  );
}

function findGeneratedDocument(courseId: string, templateIds: string[], names: string[]) {
  return generatedDocuments.find(
    (document) =>
      document.courseId === courseId &&
      (templateIds.includes(document.templateId) || names.includes(document.name))
  );
}

function applyGeneratedDocumentRecord(
  document: GeneratedDocument | undefined,
  status: GeneratedDocument["status"],
  requiredAction: string,
  auditReady: boolean
) {
  if (!document) {
    return;
  }

  const changed =
    document.status !== status || document.requiredAction !== requiredAction || document.auditReady !== auditReady;
  document.status = status;
  document.requiredAction = requiredAction;
  document.auditReady = auditReady;
  if (changed) {
    document.lastUpdatedAt = nowIso();
  }
  document.signReviewState =
    status === "SIGNED" || status === "EXPORTED"
      ? "SIGNED"
      : status === "READY_FOR_REVIEW"
        ? "READY_FOR_SIGNATURE"
        : status === "NEEDS_REVIEW" || status === "MISSING_FIELDS"
          ? "REVIEW_REQUIRED"
          : "NOT_STARTED";
  if (status === "SIGNED" && !document.signedAt) {
    document.signedAt = nowIso();
  }
  if (status === "EXPORTED" && !document.exportedAt) {
    document.exportedAt = nowIso();
  }
}

function applyTaskState(
  documentName: string,
  status: CarepathTask["status"],
  auditReady: boolean,
  noteAction: string,
  courseId?: string
) {
  carepathTasks
    .filter((task) => task.documentName === documentName && (!courseId || task.courseId === courseId))
    .forEach((task) => {
      const changed = task.status !== status || task.auditReady !== auditReady || task.noteAction !== noteAction;
      task.status = status;
      task.auditReady = auditReady;
      task.noteAction = noteAction;
      if (changed) {
        task.lastUpdatedAt = nowIso();
      }
      if (status === "COMPLETED" && !task.completedAt) {
        task.completedAt = nowIso();
      }
    });
}

function recalculateWorkflowState() {
  ensureRequirementDocuments(patients, treatmentCourses, generatedDocuments);
  ensureRequirementTasks(patients, treatmentCourses, carepathTasks);

  treatmentCourses.forEach((course) => {
    const allCourseEntries = courseFractions(course.id, fractionLogEntries);
    const courseEntries = activeFractionEntries(allCourseEntries);
    if (allCourseEntries.length > 0) {
      course.currentFraction = courseEntries.length > 0
        ? Math.max(...courseEntries.map((entry) => entry.fractionNumber))
        : 0;
    }
  });

  simulationOrders.forEach((sim) => {
    const simDocument = findGeneratedDocument(
      sim.courseId,
      ["REQ-SKIN-IGSRT-SIM", "TPL-IGSRT-SIM"],
      ["CTP / SIM IGSRT Order", "Simulation Order"]
    );

    if (sim.signedAt) {
      sim.status = "SIGNED";
      applyGeneratedDocumentRecord(
        simDocument,
        simDocument?.exportedAt ? "EXPORTED" : "SIGNED",
        simDocument?.exportedAt ? "Simulation order exported" : "Simulation order signed",
        true
      );
      applyTaskState("CTP / SIM IGSRT Order", "COMPLETED", true, "Simulation order complete and signed", sim.courseId);
    } else if (isSimulationComplete(sim)) {
      sim.status = "READY_FOR_REVIEW";
      applyGeneratedDocumentRecord(simDocument, "READY_FOR_REVIEW", "Rad Onc signature needed", false);
      applyTaskState("CTP / SIM IGSRT Order", "NEEDS_REVIEW", false, "Review simulation order and sign", sim.courseId);
    } else {
      sim.status = "MISSING_FIELDS";
      applyGeneratedDocumentRecord(simDocument, "MISSING_FIELDS", "Complete required simulation fields", false);
      applyTaskState("CTP / SIM IGSRT Order", "BLOCKED", false, "Complete required simulation order fields", sim.courseId);
    }
  });

  prescriptions.forEach((rx) => {
    const rxDocument = findGeneratedDocument(
      rx.courseId,
      ["REQ-SKIN-IGSRT-RX", "TPL-IGSRT-RX"],
      ["IGSRT Prescription"]
    );

    if (rx.signedAt) {
      rx.status = "SIGNED";
      applyGeneratedDocumentRecord(
        rxDocument,
        rxDocument?.exportedAt ? "EXPORTED" : "SIGNED",
        rxDocument?.exportedAt ? "Prescription exported" : "Prescription signed",
        true
      );
      applyTaskState("IGSRT Prescription", "COMPLETED", true, "Prescription signed and audit-ready", rx.courseId);
    } else if (isPrescriptionComplete(rx)) {
      rx.status = "READY_FOR_REVIEW";
      applyGeneratedDocumentRecord(rxDocument, "READY_FOR_REVIEW", "Rad Onc review and signature needed", false);
      applyTaskState("IGSRT Prescription", "NEEDS_REVIEW", false, "Verify phase prescription and sign", rx.courseId);
    } else {
      rx.status = "MISSING_FIELDS";
      applyGeneratedDocumentRecord(rxDocument, "MISSING_FIELDS", "Complete prescription parameters", false);
      applyTaskState("IGSRT Prescription", "BLOCKED", false, "Complete required prescription fields", rx.courseId);
    }
  });

  treatmentCourses.forEach((course) => {
    const courseEntries = activeFractionEntries(courseFractions(course.id, fractionLogEntries));
    const fractionLogDocument = findGeneratedDocument(
      course.id,
      ["REQ-SKIN-IGSRT-FXLOG", "TPL-IGSRT-FXLOG"],
      ["IGSRT Fraction Log"]
    );

    if (!fractionLogDocument) {
      return;
    }

    const missingApprovals = courseEntries.filter((entry) => entry.status !== "APPROVED").length;
    if (fractionLogDocument.signedAt) {
      applyGeneratedDocumentRecord(
        fractionLogDocument,
        fractionLogDocument.exportedAt ? "EXPORTED" : "SIGNED",
        fractionLogDocument.exportedAt ? "Fraction log exported" : "Fraction log signed",
        true
      );
      applyTaskState("IGSRT Fraction Log", "COMPLETED", true, "Fraction log signed and audit-ready", course.id);
    } else if (missingApprovals > 0) {
      applyGeneratedDocumentRecord(
        fractionLogDocument,
        "NEEDS_REVIEW",
        `${missingApprovals} fraction approval(s) missing`,
        false
      );
      applyTaskState(
        "IGSRT Fraction Log",
        "NEEDS_REVIEW",
        false,
        "Resolve missing MD/DOT approvals and update cumulative dose",
        course.id
      );
    } else if (courseEntries.length > 0) {
      applyGeneratedDocumentRecord(fractionLogDocument, "READY_FOR_REVIEW", "Fraction log ready for review", false);
      applyTaskState("IGSRT Fraction Log", "IN_PROGRESS", false, "Review generated fraction log", course.id);
    }
  });
}

export function getWorkflowSnapshot(): WorkflowSnapshot {
  recalculateWorkflowState();
  return {
    patients,
    treatmentCourses,
    carepathTasks,
    generatedDocuments,
    fractionLogEntries,
    billingCodes,
    documentTemplates,
    internalFormTemplates,
    templateSources,
    documentRequirements,
    workflowDefinitions,
    workflowDocumentStates: deriveWorkflowDocumentStates(patients, treatmentCourses, generatedDocuments),
    simulationOrders,
    prescriptions,
    treatmentFractions,
    mappingRecords,
    generatedDocumentOutputs,
    auditEvents
  };
}

export function getOperationalWorkflowSnapshot() {
  const snapshot = getWorkflowSnapshot();

  return {
    ...snapshot,
    patients: operationalPatients(),
    treatmentCourses: operationalTreatmentCourses(),
    appointments: operationalAppointments(),
    activities: operationalActivities(),
    priorityFlags: operationalPriorityFlags(),
    auditEvents: operationalAuditEvents(),
    phiBoundary: {
      phiDatabaseEnv: "PHI_DATABASE_URL",
      opsDatabaseEnv: "OPS_DATABASE_URL",
      patientIdentifiers: "Stored in PHI_DB only",
      operationalRecords: "Tokenized patientRef/courseRef records only"
    }
  };
}

export function getIgsrtWorkspace(courseId = "COURSE-2401"): IgsrtWorkspace {
  const snapshot = getWorkflowSnapshot();
  const course = snapshot.treatmentCourses.find((item) => item.id === courseId);
  const patient = course ? snapshot.patients.find((item) => item.id === course.patientId) : undefined;
  const simulationOrder = snapshot.simulationOrders.find((item) => item.courseId === courseId);
  const prescription = snapshot.prescriptions.find((item) => item.courseId === courseId);

  if (!course || !patient || !simulationOrder || !prescription) {
    throw new Error(`IGSRT workspace not found for ${courseId}`);
  }

  return {
    ...snapshot,
    patient,
    course,
    simulationOrder,
    prescription,
    courseDocuments: courseDocuments(course.id, snapshot.generatedDocuments),
    courseFractions: courseFractions(course.id, snapshot.fractionLogEntries),
    treatmentFractions: courseTreatmentFractions(course.id),
    planningReadiness: getPhase6PlanningReadiness(course.id),
    ...getPhase6GateStatuses(course.id)
  };
}

function getWorkflowResponseForCourse(courseId: string) {
  try {
    return getIgsrtWorkspace(courseId);
  } catch {
    return getWorkflowSnapshot();
  }
}

export function validatePatientCreateInput(input: Partial<PatientCreateInput>): PatientValidationResult {
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
  const errors = requiredFields
    .filter((field) => !textInput(input[field]))
    .map((field) => `${field} is required.`);

  const mrn = textInput(input.mrn).toLowerCase();
  if (mrn && patients.some((patient) => patient.mrn.toLowerCase() === mrn)) {
    errors.push("MRN must be unique.");
  }

  if (
    input.initialCourse?.totalFractions !== undefined &&
    (!Number.isFinite(Number(input.initialCourse.totalFractions)) || Number(input.initialCourse.totalFractions) <= 0)
  ) {
    errors.push("totalFractions must be greater than zero.");
  }

  return { valid: errors.length === 0, errors };
}

export function validatePatientUpdateInput(
  patientRefOrId: string,
  input: Partial<PatientUpdateInput>
): PatientValidationResult {
  const errors: string[] = [];
  const patientIndex = resolvePatientIndex(patientRefOrId);

  if (patientIndex < 0) {
    errors.push("Patient not found.");
  }

  const mrn = textInput(input.mrn).toLowerCase();
  if (
    mrn &&
    patients.some((patient, index) => index !== patientIndex && patient.mrn.toLowerCase() === mrn)
  ) {
    errors.push("MRN must be unique.");
  }

  const patient = patients[patientIndex];
  if (patient && input.expectedLastUpdatedAt && patient.lastUpdatedAt !== input.expectedLastUpdatedAt) {
    errors.push("Patient record was updated by another session.");
  }

  if (input.initialCourse?.totalFractions !== undefined &&
    (!Number.isFinite(Number(input.initialCourse.totalFractions)) || Number(input.initialCourse.totalFractions) <= 0)
  ) {
    errors.push("totalFractions must be greater than zero.");
  }

  if (!textInput(input.changeReason)) {
    errors.push("changeReason is required.");
  }

  return { valid: errors.length === 0, errors };
}

export function createPatient(
  input: PatientCreateInput,
  auditContextInput?: Partial<PatientMutationAuditContext>
) {
  const checkpoint = {
    patients: patients.length,
    treatmentCourses: treatmentCourses.length,
    generatedDocuments: generatedDocuments.length,
    carepathTasks: carepathTasks.length,
    patientCourseWorkflowSteps: patientCourseWorkflowSteps.length,
    patientCourseAuditChecks: patientCourseAuditChecks.length,
    courseFolderPlaceholders: courseFolderPlaceholders.length,
    patientRecordHistory: patientRecordHistory.length,
    auditEvents: auditEvents.length
  };
  const timestamp = nowIso();
  const diagnosisCategory = diagnosisCategoryInput(input.diagnosisCategory);
  const patientNumber = nextPatientNumber();
  const patientId = `CR-${patientNumber}`;
  const courseId = `COURSE-${patientNumber}`;
  const initialCourse = normalizeInitialCourseInput(input.initialCourse, diagnosisCategory);
  const patient: Patient = {
    id: patientId,
    firstName: textInput(input.firstName),
    lastName: textInput(input.lastName),
    mrn: textInput(input.mrn),
    diagnosis: textInput(input.diagnosis),
    diagnosisCategory,
    location: textInput(input.location),
    physician: textInput(input.physician),
    chartRoundsPhase: input.chartRoundsPhase ?? "UPCOMING",
    status: input.status ?? "ACTIVE",
    assignedStaff: textInput(input.assignedStaff),
    activeCourseId: courseId,
    nextAction: input.nextAction ?? "Create treatment course",
    flags: [],
    notes: textInput(input.notes) || "New record created from the workflow API.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdatedAt: timestamp
  };
  const course: TreatmentCourse = {
    id: courseId,
    patientId,
    diagnosis: patient.diagnosis,
    diagnosisCategory,
    protocolName: initialCourse.protocolName,
    totalFractions: initialCourse.totalFractions,
    currentFraction: 0,
    startDate: initialCourse.startDate,
    endDate: null,
    chartRoundsPhase: patient.chartRoundsPhase,
    status: "NOT_STARTED",
    treatmentModality: initialCourse.treatmentModality,
    treatmentType: initialCourse.treatmentType,
    bodyRegion: initialCourse.bodyRegion,
    laterality: initialCourse.laterality,
    coursePhase: "CONSULTATION",
    notes: "Pilot course bundle created with workflow steps, documents, tasks, audit checks, and folder placeholders."
  };
  const workflowDefinition = selectWorkflowDefinition(diagnosisCategory, course);
  course.workflowDefinitionId = workflowDefinition.id;
  const auditContext = patientAuditContext(
    auditContextInput,
    "Structured CRUD record created inside CureRays CWS."
  );

  try {
    patients.push(patient);
    treatmentCourses.push(course);
    patientCourseWorkflowSteps.push(...createWorkflowStepsForCourse(course, workflowDefinition, timestamp));
    ensureRequirementDocuments(patients, treatmentCourses, generatedDocuments);
    ensureRequirementTasks(patients, treatmentCourses, carepathTasks);
    patientCourseAuditChecks.push(...createAuditChecksForCourse(course, timestamp));
    courseFolderPlaceholders.push(createFolderPlaceholderForCourse(course, timestamp));
    const auditEvent = addAuditEvent({
      ...patientAuditFields(auditContext),
      patientId: patient.id,
      action: "Patient created",
      entityType: "PATIENT",
      entityId: patient.id,
      previousValue: "None",
      newValue: PHI_REDACTED
    });
    addPatientRecordHistory(
      patient,
      course,
      "Patient-course bundle created",
      `Created ${workflowDefinition.name} registration bundle.`,
      auditContext,
      "NONE"
    );
    const payload = patientMutationPayload(patient, auditEvent, course);
    const hasDocuments = generatedDocuments.some((document) => document.courseId === course.id);
    const hasTasks = carepathTasks.some((task) => task.courseId === course.id);
    const hasWorkflowSteps = patientCourseWorkflowSteps.some((step) => step.courseId === course.id);
    const hasAuditChecks = patientCourseAuditChecks.some((check) => check.courseId === course.id);
    const hasFolderPlaceholder = courseFolderPlaceholders.some((folder) => folder.courseId === course.id);

    if (
      !payload.course ||
      !payload.auditEvent.redacted ||
      !hasDocuments ||
      !hasTasks ||
      !hasWorkflowSteps ||
      !hasAuditChecks ||
      !hasFolderPlaceholder
    ) {
      throw new Error("Patient registration bundle post-condition failed.");
    }

    return payload;
  } catch (error) {
    patients.length = checkpoint.patients;
    treatmentCourses.length = checkpoint.treatmentCourses;
    generatedDocuments.length = checkpoint.generatedDocuments;
    carepathTasks.length = checkpoint.carepathTasks;
    patientCourseWorkflowSteps.length = checkpoint.patientCourseWorkflowSteps;
    patientCourseAuditChecks.length = checkpoint.patientCourseAuditChecks;
    courseFolderPlaceholders.length = checkpoint.courseFolderPlaceholders;
    patientRecordHistory.length = checkpoint.patientRecordHistory;
    auditEvents.length = checkpoint.auditEvents;
    throw error;
  }
}

export function updatePatient(
  patientRefOrId: string,
  input: PatientUpdateInput,
  auditContextInput?: Partial<PatientMutationAuditContext>
) {
  const patientIndex = resolvePatientIndex(patientRefOrId);
  const patient = patients[patientIndex];
  if (!patient) {
    return null;
  }

  const previousPatient = clone(patient);
  const previousValue = PHI_REDACTED;
  const nextDiagnosisCategory = input.diagnosisCategory
    ? diagnosisCategoryInput(input.diagnosisCategory)
    : patient.diagnosisCategory;
  const course = treatmentCourses.find((item) => item.id === patient.activeCourseId);
  const previousCourse = course ? clone(course) : null;
  const auditCheckpoint = auditEvents.length;
  const historyCheckpoint = patientRecordHistory.length;
  const auditContext = patientAuditContext(
    auditContextInput,
    "Patient workflow state updated through the API."
  );

  try {
    Object.assign(patient, {
      firstName: input.firstName === undefined ? patient.firstName : textInput(input.firstName),
      lastName: input.lastName === undefined ? patient.lastName : textInput(input.lastName),
      mrn: input.mrn === undefined ? patient.mrn : textInput(input.mrn),
      diagnosis: input.diagnosis === undefined ? patient.diagnosis : textInput(input.diagnosis),
      diagnosisCategory: nextDiagnosisCategory,
      location: input.location === undefined ? patient.location : textInput(input.location),
      physician: input.physician === undefined ? patient.physician : textInput(input.physician),
      chartRoundsPhase: input.chartRoundsPhase ?? patient.chartRoundsPhase,
      status: input.status ?? patient.status,
      assignedStaff: input.assignedStaff === undefined ? patient.assignedStaff : textInput(input.assignedStaff),
      notes: input.notes === undefined ? patient.notes : textInput(input.notes),
      nextAction: input.nextAction === undefined ? patient.nextAction : textInput(input.nextAction),
      lastUpdatedAt: nowIso()
    });

    if (course) {
      course.diagnosis = patient.diagnosis;
      course.diagnosisCategory = patient.diagnosisCategory;
      course.chartRoundsPhase = patient.chartRoundsPhase;
      if (input.initialCourse) {
        const nextCourse = normalizeInitialCourseInput(input.initialCourse, patient.diagnosisCategory);
        course.protocolName = nextCourse.protocolName;
        course.treatmentModality = nextCourse.treatmentModality;
        course.treatmentType = nextCourse.treatmentType;
        course.bodyRegion = nextCourse.bodyRegion;
        course.laterality = nextCourse.laterality;
        course.totalFractions = nextCourse.totalFractions;
        course.startDate = nextCourse.startDate;
        course.workflowDefinitionId = selectWorkflowDefinition(patient.diagnosisCategory, course).id;
      }
    }

    const auditEvent = addAuditEvent({
      ...patientAuditFields(auditContext),
      patientId: patient.id,
      action: "Patient updated",
      entityType: "PATIENT",
      entityId: patient.id,
      previousValue,
      newValue: PHI_REDACTED
    });
    addPatientRecordHistory(
      patient,
      course,
      "Patient record corrected",
      "Updated patient/course fields through guarded record maintenance.",
      auditContext
    );
    return patientMutationPayload(patient, auditEvent, course);
  } catch (error) {
    Object.assign(patient, previousPatient);
    if (course && previousCourse) {
      Object.assign(course, previousCourse);
    }
    auditEvents.length = auditCheckpoint;
    patientRecordHistory.length = historyCheckpoint;
    throw error;
  }
}

export function getPatientEditRecord(patientRefOrId: string): PatientEditDto | null {
  const patientIndex = resolvePatientIndex(patientRefOrId);
  const patient = patients[patientIndex];
  if (!patient) {
    return null;
  }

  return patientEditDto(patient, treatmentCourses.find((course) => course.id === patient.activeCourseId));
}

export function listPatientRecordHistory(patientRefOrId: string): PatientRecordHistoryEntry[] {
  const patientIndex = resolvePatientIndex(patientRefOrId);
  const patient = patients[patientIndex];
  if (!patient) {
    return [];
  }

  const currentPatientRef = patientRef(patient.id);
  return patientRecordHistory.filter((entry) => entry.patientRef === currentPatientRef);
}

export function validatePatientLifecycleInput(
  patientRefOrId: string,
  input: Partial<PatientLifecycleUpdateInput>
): PatientValidationResult {
  const errors: string[] = [];
  const patientIndex = resolvePatientIndex(patientRefOrId);
  const patient = patients[patientIndex];

  if (!patient) {
    errors.push("Patient not found.");
  }

  if (patient && input.expectedLastUpdatedAt && patient.lastUpdatedAt !== input.expectedLastUpdatedAt) {
    errors.push("Patient record was updated by another session.");
  }

  if (!textInput(input.changeReason)) {
    errors.push("changeReason is required.");
  }

  return { valid: errors.length === 0, errors };
}

export function updatePatientLifecycle(
  patientRefOrId: string,
  input: PatientLifecycleUpdateInput,
  auditContextInput?: Partial<PatientMutationAuditContext>
) {
  const patientIndex = resolvePatientIndex(patientRefOrId);
  const patient = patients[patientIndex];
  if (!patient) {
    return null;
  }

  const course = treatmentCourses.find((item) => item.id === patient.activeCourseId);
  const previousPatient = clone(patient);
  const previousCourse = course ? clone(course) : null;
  const auditCheckpoint = auditEvents.length;
  const historyCheckpoint = patientRecordHistory.length;
  const auditContext = patientAuditContext(
    auditContextInput,
    "Patient/course lifecycle state updated through guarded record maintenance."
  );

  try {
    patient.status = input.patientStatus ?? patient.status;
    patient.chartRoundsPhase = input.chartRoundsPhase ?? patient.chartRoundsPhase;
    patient.lastUpdatedAt = nowIso();

    if (course) {
      course.chartRoundsPhase = patient.chartRoundsPhase;
      course.status = input.courseStatus ?? course.status;
      course.coursePhase = input.coursePhase ?? course.coursePhase;
      course.endDate = input.courseStatus === "COMPLETED" ? todayIsoDate() : course.endDate;
    }

    const auditEvent = addAuditEvent({
      ...patientAuditFields(auditContext),
      patientId: patient.id,
      action: "Patient lifecycle updated",
      entityType: course ? "COURSE" : "PATIENT",
      entityId: course?.id ?? patient.id,
      previousValue: PHI_REDACTED,
      newValue: PHI_REDACTED
    });
    addPatientRecordHistory(
      patient,
      course,
      "Patient lifecycle updated",
      "Updated course/patient lifecycle state through guarded record maintenance.",
      auditContext
    );

    return patientMutationPayload(patient, auditEvent, course);
  } catch (error) {
    Object.assign(patient, previousPatient);
    if (course && previousCourse) {
      Object.assign(course, previousCourse);
    }
    auditEvents.length = auditCheckpoint;
    patientRecordHistory.length = historyCheckpoint;
    throw error;
  }
}

export function updateSimulationOrder(courseId: string, input: Partial<SimulationOrder>) {
  const order = getSimulationOrder(courseId);
  if (!order) {
    return null;
  }

  const previousValue = PHI_REDACTED;
  Object.assign(order, input, {
    lesionBorderInked: input.lesionBorderInked === undefined ? order.lesionBorderInked : compactBoolean(input.lesionBorderInked),
    allMarginsInked: input.allMarginsInked === undefined ? order.allMarginsInked : compactBoolean(input.allMarginsInked),
    specialPhysicsRequired:
      input.specialPhysicsRequired === undefined ? order.specialPhysicsRequired : compactBoolean(input.specialPhysicsRequired),
    weeklyPhysicsRequired:
      input.weeklyPhysicsRequired === undefined ? order.weeklyPhysicsRequired : compactBoolean(input.weeklyPhysicsRequired),
    inVivoDosimetryRequired:
      input.inVivoDosimetryRequired === undefined ? order.inVivoDosimetryRequired : compactBoolean(input.inVivoDosimetryRequired),
    lastUpdatedAt: nowIso()
  });

  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Simulation order updated",
    entityType: "SIMULATION_ORDER",
    entityId: order.id,
    previousValue,
    newValue: PHI_REDACTED,
    reason: "IGSRT simulation form fields changed in the system of record."
  });
  return { data: getIgsrtWorkspace(courseId), auditEvent };
}

export function updatePrescription(courseId: string, input: Partial<Prescription>) {
  const prescription = getPrescription(courseId);
  if (!prescription) {
    return null;
  }

  const previousValue = PHI_REDACTED;
  Object.assign(prescription, input, {
    verifiedInSensus:
      input.verifiedInSensus === undefined ? prescription.verifiedInSensus : compactBoolean(input.verifiedInSensus),
    priorRadiationTherapy:
      input.priorRadiationTherapy === undefined
        ? prescription.priorRadiationTherapy
        : compactBoolean(input.priorRadiationTherapy),
    preAuthorized: input.preAuthorized === undefined ? prescription.preAuthorized : compactBoolean(input.preAuthorized),
    lastUpdatedAt: nowIso()
  });

  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Prescription updated",
    entityType: "PRESCRIPTION",
    entityId: prescription.id,
    previousValue,
    newValue: PHI_REDACTED,
    reason: "IGSRT prescription parameters changed in the system of record."
  });
  return { data: getIgsrtWorkspace(courseId), auditEvent };
}

function replaceCourseFractionEntries(courseId: string, entries: FractionLogEntry[]) {
  for (let index = fractionLogEntries.length - 1; index >= 0; index -= 1) {
    if (fractionLogEntries[index].courseId === courseId) {
      fractionLogEntries.splice(index, 1);
    }
  }
  fractionLogEntries.push(...entries);
  fractionLogEntries.sort((a, b) => a.courseId.localeCompare(b.courseId) || a.fractionNumber - b.fractionNumber);
}

function recalculateCourseFractionEntries(courseId: string) {
  const entries = courseFractions(courseId, fractionLogEntries);
  const recalculatedEntries = recalculateFractionWorksheetEntries(entries);
  replaceCourseFractionEntries(courseId, recalculatedEntries);
  return recalculatedEntries;
}

function resetDownstreamRowsAfterCorrection(
  courseId: string,
  correctedFractionNumber: number,
  previousTotals: Map<string, { cumulativeDoseCgy: number; cumulativeDoseToDotCgy: number }>,
  actorUserId: string
) {
  const now = nowIso();
  const changedEntries = activeFractionEntries(courseFractions(courseId, fractionLogEntries)).filter((entry) => {
    if (entry.fractionNumber <= correctedFractionNumber) {
      return false;
    }

    const previous = previousTotals.get(entry.id);
    if (!previous) {
      return true;
    }

    return (
      previous.cumulativeDoseCgy !== (entry.cumulativeDoseCgy ?? entry.cumulativeDose) ||
      previous.cumulativeDoseToDotCgy !== (entry.cumulativeDoseToDotCgy ?? entry.cumulativeDoseToDepth)
    );
  });

  changedEntries.forEach((entry) => {
    entry.mdApproval = false;
    entry.mdApprovalState = "PENDING";
    entry.mdApprovedAt = undefined;
    entry.mdApprovedByUserId = undefined;
    entry.dotApproval = false;
    entry.dotApprovalState = "PENDING";
    entry.dotApprovedAt = undefined;
    entry.dotApprovedByUserId = undefined;
    entry.status = "NEEDS_REVIEW";
    entry.correctionReason = `Downstream recalculation after Fx ${correctedFractionNumber}.`;
    entry.correctedAt = now;
    entry.correctedByUserId = actorUserId;

    addAuditEvent({
      userId: actorUserId,
      userName: "Workflow API",
      action: "Downstream fraction approval reset",
      entityType: "FRACTION_LOG",
      entityId: entry.id,
      previousValue: PHI_REDACTED,
      newValue: PHI_REDACTED,
      reason: "Historical correction changed dependent cumulative dose totals."
    });
  });
}

export function addFractionLogEntry(input: Partial<FractionLogEntry> & { courseId: string }) {
  const courseEntries = activeFractionEntries(courseFractions(input.courseId, fractionLogEntries)).sort(
    (a, b) => a.fractionNumber - b.fractionNumber
  );
  const previousEntry = courseEntries.at(-1);
  const nextFractionNumber = previousEntry ? previousEntry.fractionNumber + 1 : 1;
  const entry = calculateFractionWorksheetEntry(
    {
      ...input,
      id: input.id ?? `FR-${input.courseId.replace("COURSE-", "")}-${String(nextFractionNumber).padStart(2, "0")}`,
      fractionNumber: input.fractionNumber ?? nextFractionNumber,
      date: input.date ?? todayIsoDate(),
      status: input.status ?? "NEEDS_REVIEW",
      mdApproval: false,
      mdApprovalState: input.mdApprovalState ?? "PENDING",
      dotApproval: false,
      dotApprovalState: input.dotApprovalState ?? "PENDING"
    },
    courseEntries
  );
  fractionLogEntries.push(entry);
  recalculateCourseFractionEntries(input.courseId);
  syncTreatmentFractionsForCourse(input.courseId);
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Fraction log entry created",
    entityType: "FRACTION_LOG",
    entityId: entry.id,
    previousValue: "None",
    newValue: PHI_REDACTED,
    reason: "Daily IGSRT treatment entry saved and dose totals recalculated."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function updateFractionLogEntry(input: Partial<FractionLogEntry> & { courseId: string; id: string }) {
  const entryIndex = fractionLogEntries.findIndex((entry) => entry.id === input.id && entry.courseId === input.courseId);
  if (entryIndex < 0) {
    return null;
  }

  const previousValue = PHI_REDACTED;
  const existingEntry = fractionLogEntries[entryIndex];
  if (isVoidedFractionEntry(existingEntry)) {
    throw new Error("Voided fraction rows cannot be edited.");
  }
  if (existingEntry.mdApproval && existingEntry.dotApproval && existingEntry.status === "APPROVED") {
    throw new Error("Approved fraction rows are locked. Request revision or void the row before editing.");
  }

  const courseEntries = activeFractionEntries(courseFractions(input.courseId, fractionLogEntries)).sort(
    (a, b) => a.fractionNumber - b.fractionNumber
  );
  const latestActiveFractionNumber = Math.max(...courseEntries.map((entry) => entry.fractionNumber));
  const isHistoricalCorrection =
    existingEntry.status === "APPROVED" || existingEntry.fractionNumber < latestActiveFractionNumber;
  const correctionReason = String(input.correctionReason ?? "").trim();

  if (isHistoricalCorrection && !correctionReason) {
    throw new Error("Historical fraction correction requires a correction reason.");
  }

  const previousTotals = new Map(
    courseEntries.map((entry) => [
      entry.id,
      {
        cumulativeDoseCgy: entry.cumulativeDoseCgy ?? entry.cumulativeDose,
        cumulativeDoseToDotCgy: entry.cumulativeDoseToDotCgy ?? entry.cumulativeDoseToDepth
      }
    ])
  );
  const approvalReset: Partial<FractionLogEntry> = correctionReason
    ? {
        mdApproval: false,
        mdApprovalState: "PENDING" as const,
        mdApprovedAt: undefined,
        mdApprovedByUserId: undefined,
        dotApproval: false,
        dotApprovalState: "PENDING" as const,
        dotApprovedAt: undefined,
        dotApprovedByUserId: undefined,
        revisionApprovalType: undefined,
        revisionReason: undefined,
        revisionRequestedAt: undefined,
        revisionRequestedByUserId: undefined,
        status: "NEEDS_REVIEW" as const,
        correctionReason,
        correctedAt: nowIso(),
        correctedByUserId: input.correctedByUserId ?? "SYSTEM"
      }
    : {};
  const updatedEntry = calculateFractionWorksheetEntry(
    {
      ...existingEntry,
      ...input,
      ...approvalReset,
      mdApproval: approvalReset.mdApproval ?? existingEntry.mdApproval,
      dotApproval: approvalReset.dotApproval ?? existingEntry.dotApproval
    },
    courseEntries,
    { existingId: existingEntry.id }
  );
  Object.assign(existingEntry, updatedEntry);
  recalculateCourseFractionEntries(input.courseId);
  if (correctionReason) {
    resetDownstreamRowsAfterCorrection(
      input.courseId,
      updatedEntry.fractionNumber,
      previousTotals,
      input.correctedByUserId ?? "SYSTEM"
    );
  }
  syncTreatmentFractionsForCourse(input.courseId);
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Fraction worksheet entry updated",
    entityType: "FRACTION_LOG",
    entityId: input.id,
    previousValue,
    newValue: PHI_REDACTED,
    reason: "Native fractionation worksheet row updated and dependent dose totals recalculated."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

function normalizeApprovalType(value: unknown): FractionApprovalType {
  return value === "DOT" ? "DOT" : "MD";
}

export function approveFractionLogEntry(input: {
  courseId: string;
  id: string;
  approvalType: FractionApprovalType;
  userId?: string;
  role?: PrototypeAccessRole;
}) {
  const entry = fractionLogEntries.find((item) => item.id === input.id && item.courseId === input.courseId);
  if (!entry) {
    return null;
  }
  if (isVoidedFractionEntry(entry)) {
    throw new Error("Voided fraction rows cannot be approved.");
  }

  const approvalType = normalizeApprovalType(input.approvalType);
  if (!canApproveFraction(input.role ?? null, approvalType)) {
    throw new Error(`${approvalType} approval is not allowed for the current prototype role.`);
  }
  if (approvalType === "DOT") {
    assertFractionImagingGate(input.courseId, entry.fractionNumber);
  }
  const approvedAt = nowIso();
  const approvedByUserId = input.userId ?? "SYSTEM";

  if (approvalType === "MD") {
    entry.mdApproval = true;
    entry.mdApprovalState = "APPROVED";
    entry.mdApprovedAt = approvedAt;
    entry.mdApprovedByUserId = approvedByUserId;
  } else {
    entry.dotApproval = true;
    entry.dotApprovalState = "APPROVED";
    entry.dotApprovedAt = approvedAt;
    entry.dotApprovedByUserId = approvedByUserId;
  }

  if (entry.revisionApprovalType === approvalType) {
    entry.revisionApprovalType = undefined;
    entry.revisionReason = undefined;
    entry.revisionRequestedAt = undefined;
    entry.revisionRequestedByUserId = undefined;
  }

  entry.status = deriveFractionLogStatus(entry);
  recalculateCourseFractionEntries(input.courseId);
  syncTreatmentFractionsForCourse(input.courseId);
  const auditEvent = addAuditEvent({
    userId: approvedByUserId,
    userName: "Workflow API",
    action: `${approvalType} fraction approval recorded`,
    entityType: "FRACTION_LOG",
    entityId: input.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Role-based fraction review completed inside CureRays CWS."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function requestFractionRevision(input: {
  courseId: string;
  id: string;
  approvalType: FractionApprovalType;
  reason: string;
  userId?: string;
  role?: PrototypeAccessRole;
}) {
  const entry = fractionLogEntries.find((item) => item.id === input.id && item.courseId === input.courseId);
  if (!entry) {
    return null;
  }
  if (isVoidedFractionEntry(entry)) {
    throw new Error("Voided fraction rows cannot be marked for revision.");
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("Revision request requires a reason.");
  }

  const approvalType = normalizeApprovalType(input.approvalType);
  if (!canApproveFraction(input.role ?? null, approvalType)) {
    throw new Error(`${approvalType} revision is not allowed for the current prototype role.`);
  }
  if (approvalType === "MD") {
    entry.mdApproval = false;
    entry.mdApprovalState = "REVISION_NEEDED";
    entry.mdApprovedAt = undefined;
    entry.mdApprovedByUserId = undefined;
  } else {
    entry.dotApproval = false;
    entry.dotApprovalState = "REVISION_NEEDED";
    entry.dotApprovedAt = undefined;
    entry.dotApprovedByUserId = undefined;
  }

  entry.status = "REVISION_NEEDED";
  entry.revisionApprovalType = approvalType;
  entry.revisionReason = reason;
  entry.revisionRequestedAt = nowIso();
  entry.revisionRequestedByUserId = input.userId ?? "SYSTEM";
  recalculateCourseFractionEntries(input.courseId);
  syncTreatmentFractionsForCourse(input.courseId);
  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: `${approvalType} fraction revision requested`,
    entityType: "FRACTION_LOG",
    entityId: input.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Role-based fraction review requested a documented correction."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function voidFractionLogEntry(input: {
  courseId: string;
  id: string;
  reason: string;
  userId?: string;
}) {
  const entry = fractionLogEntries.find((item) => item.id === input.id && item.courseId === input.courseId);
  if (!entry) {
    return null;
  }

  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("Voiding a fraction row requires a reason.");
  }

  entry.status = "VOIDED";
  entry.voidReason = reason;
  entry.voidedAt = nowIso();
  entry.voidedByUserId = input.userId ?? "SYSTEM";
  recalculateCourseFractionEntries(input.courseId);
  syncTreatmentFractionsForCourse(input.courseId);
  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: "Fraction row voided",
    entityType: "FRACTION_LOG",
    entityId: input.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Clinical fraction row was voided and retained for audit."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function generateTreatmentFractionSchedule(input: { courseId: string; userId?: string }) {
  const course = treatmentCourses.find((item) => item.id === input.courseId);
  const prescription = getPrescription(input.courseId);
  const simulationOrder = getSimulationOrder(input.courseId);

  if (!course || !prescription) {
    return null;
  }

  if (!isPrescriptionSchedulable(prescription, simulationOrder)) {
    throw new Error("Fraction schedule requires signed prescription or prototype-ready prescription review.");
  }

  const scheduled = buildScheduledFractionsForCourse(input.courseId);
  for (let index = treatmentFractions.length - 1; index >= 0; index -= 1) {
    if (treatmentFractions[index].courseId === input.courseId) {
      treatmentFractions.splice(index, 1);
    }
  }
  treatmentFractions.push(...scheduled);
  treatmentFractions.sort((a, b) => a.courseId.localeCompare(b.courseId) || a.fractionNumber - b.fractionNumber);

  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: "Fraction schedule generated",
    entityType: "TREATMENT_FRACTION",
    entityId: input.courseId,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Prescription phases generated planned treatment fraction rows."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function linkFractionImage(input: {
  courseId: string;
  fractionNumber: number;
  assetId?: string;
  notApplicableReason?: string;
  userId?: string;
}) {
  const fraction = treatmentFractions.find(
    (item) => item.courseId === input.courseId && item.fractionNumber === Number(input.fractionNumber)
  );

  if (!fraction) {
    return null;
  }

  const notApplicableReason = String(input.notApplicableReason ?? "").trim();
  const assetId = String(input.assetId ?? "").trim();

  if (!assetId && !notApplicableReason) {
    throw new Error("Fraction imaging requires an asset reference or not-applicable reason.");
  }

  if (assetId && !fraction.imageAssetIds?.includes(assetId)) {
    fraction.imageAssetIds = [...(fraction.imageAssetIds ?? []), assetId];
  }
  if (notApplicableReason) {
    fraction.imageGuidanceNotApplicableReason = notApplicableReason;
  }
  fraction.imageGuidanceCompleted = true;
  fraction.imageGuidanceStatus = notApplicableReason ? "NOT_APPLICABLE" : "COMPLETE";

  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: notApplicableReason ? "Fraction imaging marked not applicable" : "Fraction imaging linked",
    entityType: "TREATMENT_FRACTION",
    entityId: fraction.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Image guidance evidence gate updated for treatment fraction."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function recordPhysicsCheck(input: {
  courseId: string;
  fractionNumber: number;
  userId?: string;
}) {
  const fraction = treatmentFractions.find(
    (item) => item.courseId === input.courseId && item.fractionNumber === Number(input.fractionNumber)
  );

  if (!fraction) {
    return null;
  }

  fraction.physicsCheckRequired = true;
  fraction.physicsCheckCompletedAt = nowIso();
  fraction.physicsCheckCompletedByUserId = input.userId ?? "SYSTEM";

  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: "Physics fraction check recorded",
    entityType: "TREATMENT_FRACTION",
    entityId: fraction.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Weekly physics check status recorded for Phase 6 workflow."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

export function recordOtvCheck(input: {
  courseId: string;
  fractionNumber: number;
  userId?: string;
}) {
  const fraction = treatmentFractions.find(
    (item) => item.courseId === input.courseId && item.fractionNumber === Number(input.fractionNumber)
  );

  if (!fraction) {
    return null;
  }

  fraction.otvRequired = true;
  fraction.otvCompletedAt = nowIso();
  fraction.otvCompletedByUserId = input.userId ?? "SYSTEM";

  const auditEvent = addAuditEvent({
    userId: input.userId ?? "SYSTEM",
    userName: "Workflow API",
    action: "OTV fraction check recorded",
    entityType: "TREATMENT_FRACTION",
    entityId: fraction.id,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED,
    reason: "Treatment management check status recorded for Phase 6 workflow."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

function renderContent(document: GeneratedDocument) {
  const patient = patients.find((item) => item.id === document.patientId);
  const course = treatmentCourses.find((item) => item.id === document.courseId);
  const order = getSimulationOrder(document.courseId);
  const prescription = getPrescription(document.courseId);
  const fractions = activeFractionEntries(courseFractions(document.courseId, fractionLogEntries));

  if (!patient || !course) {
    return "Document could not be rendered because the linked patient or course is missing.";
  }

  if (["TPL-IGSRT-SIM", "REQ-SKIN-IGSRT-SIM"].includes(document.templateId) && order) {
    return [
      `CTP / SIM IGSRT Order`,
      `Patient: ${patientName(patient)} (${patient.id})`,
      `Site: ${order.lesionLocation} | Laterality: ${order.laterality}`,
      `Setup: ${order.chairSetup}, ${order.position}`,
      `Margin: ${order.phaseIMarginInstruction}`,
      `Ultrasound: ${order.ultrasoundFrequencies.join(", ")}`,
      `Physics: ${order.weeklyPhysicsReason}`,
      `Radiation Oncologist: ${order.radiationOncologist}`,
      `Status: ${order.status}`
    ].join("\n");
  }

  if (["TPL-IGSRT-RX", "REQ-SKIN-IGSRT-RX"].includes(document.templateId) && prescription) {
    const phaseLines = prescription.phases.map(
      (phase) =>
        `${phase.phaseName}: ${phase.energyKv} kV, ${phase.phaseTotalDoseGy} Gy total, ${phase.dosePerFractionGy} Gy x ${phase.totalFractions}, SSD ${phase.ssdCm} cm, DOT ${phase.depthOfTargetMm} mm`
    );
    return [
      `IGSRT Prescription`,
      `Patient: ${patientName(patient)} (${patient.id})`,
      `Course: ${course.protocolName}`,
      `Site: ${prescription.site} | Laterality: ${prescription.laterality}`,
      ...phaseLines,
      `Imaging: ${prescription.imagingGuidance.join(", ")}`,
      `Verified in Sensus: ${prescription.verifiedInSensus ? "Yes" : "No"}`,
      `Status: ${prescription.status}`
    ].join("\n");
  }

  if (["TPL-IGSRT-FXLOG", "REQ-SKIN-IGSRT-FXLOG"].includes(document.templateId)) {
    const lastFraction = fractions.at(-1);
    return [
      `IGSRT Fraction Log`,
      `Patient: ${patientName(patient)} (${patient.id})`,
      `Course: ${course.protocolName}`,
      `Fractions logged: ${fractions.length}`,
      `Current fraction: ${course.currentFraction}/${course.totalFractions}`,
      `Cumulative dose: ${lastFraction?.cumulativeDoseCgy ?? lastFraction?.cumulativeDose ?? 0} cGy`,
      `Cumulative dose to DOT: ${lastFraction?.cumulativeDoseToDotCgy ?? lastFraction?.cumulativeDoseToDepth ?? 0} cGy`,
      `Open approvals: ${fractions.filter((entry) => !entry.mdApproval || !entry.dotApproval).length}`,
      `Clinical validation: Required before production clinical use`,
      `Latest Isodose Note: ${lastFraction?.isodoseNote ?? "No isodose note generated"}`
    ].join("\n");
  }

  return `${document.name}\nPatient: ${patientName(patient)}\nStatus: ${document.status}`;
}

export function renderGeneratedDocument(documentId: string, format: GeneratedDocumentOutput["format"] = "PDF") {
  const document = generatedDocuments.find((item) => item.id === documentId);
  if (!document) {
    return null;
  }

  const priorVersions = generatedDocumentOutputs.filter((output) => output.documentId === documentId);
  const renderedAt = nowIso();
  const output: GeneratedDocumentOutput = {
    id: `OUT-${documentId}-${priorVersions.length + 1}`,
    documentId,
    patientId: document.patientId,
    courseId: document.courseId,
    format,
    version: priorVersions.length + 1,
    status: "READY",
    driveFileUrl: `drive://generated/${document.patientId}/${document.courseId}/${documentId}.${format.toLowerCase()}`,
    contentPreview: renderContent(document),
    renderedAt
  };
  generatedDocumentOutputs.unshift(output);
  document.exportedAt = renderedAt;
  document.status = document.status === "SIGNED" ? "EXPORTED" : document.status;
  document.lastUpdatedAt = renderedAt;

  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Document Renderer",
    action: "Generated document rendered",
    entityType: "DOCUMENT",
    entityId: document.id,
    previousValue: "No rendered output",
    newValue: `${format} v${output.version}`,
    reason: "System generated a document output from structured source-of-truth data."
  });
  return { data: output, workspace: getWorkflowResponseForCourse(document.courseId), auditEvent };
}

export function signGeneratedDocument(documentId: string) {
  const document = generatedDocuments.find((item) => item.id === documentId);
  if (!document) {
    return null;
  }

  const previousValue = document.status;
  if (["TPL-IGSRT-SIM", "REQ-SKIN-IGSRT-SIM"].includes(document.templateId)) {
    const order = getSimulationOrder(document.courseId);
    if (order) {
      order.signedAt = nowIso();
    }
  }
  if (["TPL-IGSRT-RX", "REQ-SKIN-IGSRT-RX"].includes(document.templateId)) {
    const prescription = getPrescription(document.courseId);
    if (prescription) {
      prescription.signedAt = nowIso();
    }
  }
  document.status = "SIGNED";
  document.signedAt = nowIso();
  document.signReviewState = "SIGNED";
  document.auditReady = true;
  document.requiredAction = "No action needed";
  document.lastUpdatedAt = nowIso();
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Generated document signed",
    entityType: "DOCUMENT",
    entityId: document.id,
    previousValue,
    newValue: "SIGNED",
    reason: "Document signature state updated inside the workflow system."
  });
  return { data: getWorkflowResponseForCourse(document.courseId), auditEvent };
}
