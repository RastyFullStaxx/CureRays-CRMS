import {
  activities as mockActivities,
  appointments as mockAppointments,
  auditEvents as mockAuditEvents,
  billingCodes as mockBillingCodes,
  carepathTasks as mockCarepathTasks,
  documentTemplates as mockDocumentTemplates,
  fractionLogEntries as mockFractionLogEntries,
  generatedDocuments as mockGeneratedDocuments,
  patients as mockPatients,
  priorityFlags as mockPriorityFlags,
  treatmentCourses as mockTreatmentCourses
} from "@/lib/mock-data";
import type {
  Activity,
  Appointment,
  AuditEvent,
  BillingCode,
  CarepathTask,
  DocumentTemplate,
  FractionLogEntry,
  GeneratedDocument,
  GeneratedDocumentOutput,
  IgsrtWorkspace,
  InternalFormTemplate,
  MappingRecord,
  Patient,
  Prescription,
  PriorityFlag,
  SimulationOrder,
  TreatmentCourse,
  WorkflowSnapshot
} from "@/lib/types";
import { courseDocuments, courseFractions, patientName } from "@/lib/workflow";

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

export const patients: Patient[] = clone(mockPatients);
export const treatmentCourses: TreatmentCourse[] = clone(mockTreatmentCourses);
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
export const documentTemplates: DocumentTemplate[] = [
  ...clone(mockDocumentTemplates),
  {
    id: "TPL-IGSRT-SIM",
    name: "CTP / SIM IGSRT Order",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    category: "PLANNING",
    version: "v2026.02",
    requiredFields: ["lesion location", "margin instruction", "setup photos", "physics requirements"],
    status: "ACTIVE"
  },
  {
    id: "TPL-IGSRT-RX",
    name: "IGSRT Prescription",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    category: "PLANNING",
    version: "v2026.02",
    requiredFields: ["site", "laterality", "phase dose", "energy", "SSD", "DOT"],
    status: "ACTIVE"
  },
  {
    id: "TPL-IGSRT-FXLOG",
    name: "IGSRT Fraction Log",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    category: "ON_TREATMENT",
    version: "v2026.04",
    requiredFields: ["fraction", "date", "dose", "DOT", "isodose", "MD approval", "DOT approval"],
    status: "ACTIVE"
  }
];
export const auditEvents: AuditEvent[] = clone(mockAuditEvents);
export const appointments: Appointment[] = clone(mockAppointments);
export const activities: Activity[] = clone(mockActivities);
export const priorityFlags: PriorityFlag[] = clone(mockPriorityFlags);

export const internalFormTemplates: InternalFormTemplate[] = [
  {
    id: "FORM-IGSRT-SIM",
    name: "Skin Cancer IGSRT Simulation Order",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX",
    sourceDriveUrl: "https://docs.google.com/document/d/1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX/edit",
    sourceFileName: "2. CTP_SIM_IGSRTorder.LOCATION.laterality.SKIN.DDMMYY.LastName.FirstName.docx",
    outputFormats: ["DOCX", "PDF"],
    sections: [
      {
        id: "lesion",
        title: "Lesion and setup",
        fields: [
          { id: "lesionLocation", label: "Lesion location", kind: "text", required: true },
          { id: "laterality", label: "Laterality", kind: "select", required: true, options: ["Left", "Right", "Midline", "Bilateral"] },
          { id: "phaseIMarginInstruction", label: "Phase I margin instruction", kind: "textarea", required: true },
          { id: "chairSetup", label: "Chair setup", kind: "select", required: true, options: ["Face the wall", "Facing the cabinet", "Standard room setup"] },
          { id: "position", label: "Position", kind: "select", required: true, options: ["Upright", "Sitting reclined", "Supine", "Prone"] }
        ]
      },
      {
        id: "physics",
        title: "Physics and imaging",
        fields: [
          { id: "ultrasoundFrequencies", label: "Ultrasound frequencies", kind: "text", required: true },
          { id: "weeklyPhysicsReason", label: "Weekly physics reason", kind: "textarea", required: true },
          { id: "dateCompleted", label: "Date completed", kind: "date", required: true }
        ]
      }
    ]
  },
  {
    id: "FORM-IGSRT-RX",
    name: "Skin Cancer IGSRT Prescription",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi",
    sourceDriveUrl: "https://docs.google.com/document/d/1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi/edit",
    sourceFileName: "7. Prescription.LOCATION.laterality.SCC_BCC.DDMMYY.LastName.FirstName.docx",
    outputFormats: ["DOCX", "PDF"],
    sections: [
      {
        id: "phase",
        title: "Phase prescription",
        fields: [
          { id: "energyKv", label: "Energy kV", kind: "number", required: true },
          { id: "phaseTotalDoseGy", label: "Phase total dose Gy", kind: "number", required: true },
          { id: "dosePerFractionGy", label: "Dose per fraction Gy", kind: "number", required: true },
          { id: "totalFractions", label: "Total fractions", kind: "number", required: true },
          { id: "ssdCm", label: "SSD cm", kind: "number", required: true },
          { id: "depthOfTargetMm", label: "Depth of target mm", kind: "number", required: true }
        ]
      }
    ]
  },
  {
    id: "FORM-IGSRT-FXLOG",
    name: "Skin Cancer IGSRT Fraction Log",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ",
    sourceDriveUrl: "https://docs.google.com/spreadsheets/d/1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ/edit",
    sourceFileName: "12. FX Log.SITE.laterality.SKIN.DDMMYY.LastName.First Name.xlsx",
    outputFormats: ["XLSX", "PDF"],
    sections: [
      {
        id: "daily",
        title: "Daily fraction",
        fields: [
          { id: "fractionNumber", label: "Fraction", kind: "number", required: true },
          { id: "date", label: "Date", kind: "date", required: true },
          { id: "dosePerFraction", label: "Dose per fraction cGy", kind: "number", required: true },
          { id: "depthOfTarget", label: "Depth of target", kind: "text", required: true },
          { id: "isodosePercent", label: "Isodose %", kind: "number", required: true },
          { id: "mdApproval", label: "MD approval", kind: "checkbox", required: true },
          { id: "dotApproval", label: "DOT approval", kind: "checkbox", required: true }
        ]
      }
    ]
  }
];

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

function applyGeneratedDocumentState(
  documentId: string,
  status: GeneratedDocument["status"],
  requiredAction: string,
  auditReady: boolean
) {
  const document = generatedDocuments.find((item) => item.id === documentId);
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

function applyTaskState(documentName: string, status: CarepathTask["status"], auditReady: boolean, noteAction: string) {
  carepathTasks
    .filter((task) => task.documentName === documentName)
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
  treatmentCourses.forEach((course) => {
    const courseEntries = courseFractions(course.id, fractionLogEntries);
    if (courseEntries.length > 0) {
      course.currentFraction = Math.max(...courseEntries.map((entry) => entry.fractionNumber));
    }
  });

  const sim = getSimulationOrder("COURSE-2401");
  if (sim) {
    if (sim.signedAt) {
      sim.status = "SIGNED";
      const simDocument = generatedDocuments.find((document) => document.id === "DOC-2401-SIM");
      applyGeneratedDocumentState(
        "DOC-2401-SIM",
        simDocument?.exportedAt ? "EXPORTED" : "SIGNED",
        simDocument?.exportedAt ? "Simulation order exported" : "Simulation order signed",
        true
      );
      applyTaskState("CTP / SIM IGSRT Order", "COMPLETED", true, "Simulation order complete and signed");
    } else if (isSimulationComplete(sim)) {
      sim.status = "READY_FOR_REVIEW";
      applyGeneratedDocumentState("DOC-2401-SIM", "READY_FOR_REVIEW", "Rad Onc signature needed", false);
      applyTaskState("CTP / SIM IGSRT Order", "NEEDS_REVIEW", false, "Review simulation order and sign");
    } else {
      sim.status = "MISSING_FIELDS";
      applyGeneratedDocumentState("DOC-2401-SIM", "MISSING_FIELDS", "Complete required simulation fields", false);
      applyTaskState("CTP / SIM IGSRT Order", "BLOCKED", false, "Complete required simulation order fields");
    }
  }

  const rx = getPrescription("COURSE-2401");
  if (rx) {
    if (rx.signedAt) {
      rx.status = "SIGNED";
      const rxDocument = generatedDocuments.find((document) => document.id === "DOC-2401-RX");
      applyGeneratedDocumentState(
        "DOC-2401-RX",
        rxDocument?.exportedAt ? "EXPORTED" : "SIGNED",
        rxDocument?.exportedAt ? "Prescription exported" : "Prescription signed",
        true
      );
      applyTaskState("IGSRT Prescription", "COMPLETED", true, "Prescription signed and audit-ready");
    } else if (isPrescriptionComplete(rx)) {
      rx.status = "READY_FOR_REVIEW";
      applyGeneratedDocumentState("DOC-2401-RX", "READY_FOR_REVIEW", "Rad Onc review and signature needed", false);
      applyTaskState("IGSRT Prescription", "NEEDS_REVIEW", false, "Verify phase prescription and sign");
    } else {
      rx.status = "MISSING_FIELDS";
      applyGeneratedDocumentState("DOC-2401-RX", "MISSING_FIELDS", "Complete prescription parameters", false);
      applyTaskState("IGSRT Prescription", "BLOCKED", false, "Complete required prescription fields");
    }
  }

  const course2401Fractions = courseFractions("COURSE-2401", fractionLogEntries);
  const missingApprovals = course2401Fractions.filter((entry) => !entry.mdApproval || !entry.dotApproval).length;
  const fractionLogDocument = generatedDocuments.find((document) => document.id === "DOC-2401-FXLOG");
  if (fractionLogDocument?.signedAt) {
    applyGeneratedDocumentState(
      "DOC-2401-FXLOG",
      fractionLogDocument.exportedAt ? "EXPORTED" : "SIGNED",
      fractionLogDocument.exportedAt ? "Fraction log exported" : "Fraction log signed",
      true
    );
    applyTaskState("IGSRT Fraction Log", "COMPLETED", true, "Fraction log signed and audit-ready");
  } else if (missingApprovals > 0) {
    applyGeneratedDocumentState("DOC-2401-FXLOG", "NEEDS_REVIEW", `${missingApprovals} fraction approval(s) missing`, false);
    applyTaskState("IGSRT Fraction Log", "NEEDS_REVIEW", false, "Resolve missing MD/DOT approvals and update cumulative dose");
  } else if (course2401Fractions.length > 0) {
    applyGeneratedDocumentState("DOC-2401-FXLOG", "READY_FOR_REVIEW", "Fraction log ready for review", false);
    applyTaskState("IGSRT Fraction Log", "IN_PROGRESS", false, "Review generated fraction log");
  }
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
    simulationOrders,
    prescriptions,
    mappingRecords,
    generatedDocumentOutputs,
    auditEvents
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
    courseFractions: courseFractions(course.id, snapshot.fractionLogEntries)
  };
}

export function createPatient(input: Partial<Patient>) {
  const timestamp = nowIso();
  const patient: Patient = {
    id: input.id ?? `CR-${2400 + patients.length + 1}`,
    firstName: input.firstName ?? "New",
    lastName: input.lastName ?? "Patient",
    mrn: input.mrn ?? `MRN-${90000 + patients.length + 1}`,
    diagnosis: input.diagnosis ?? "Skin cancer - pending site",
    diagnosisCategory: input.diagnosisCategory ?? "SKIN_CANCER",
    location: input.location ?? "Main Campus",
    physician: input.physician ?? "Unassigned",
    chartRoundsPhase: input.chartRoundsPhase ?? "UPCOMING",
    status: input.status ?? "ACTIVE",
    assignedStaff: input.assignedStaff ?? "Unassigned",
    activeCourseId: input.activeCourseId ?? "",
    nextAction: input.nextAction ?? "Create treatment course",
    flags: input.flags ?? [],
    notes: input.notes ?? "New record created from the workflow API.",
    checklist: input.checklist ?? {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdatedAt: timestamp
  };
  patients.push(patient);
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Patient created",
    entityType: "PATIENT",
    entityId: patient.id,
    previousValue: "None",
    newValue: patientName(patient),
    reason: "Structured CRUD record created inside CureRays CWS."
  });
  return { data: patient, auditEvent };
}

export function updatePatient(id: string, input: Partial<Patient>) {
  const patient = patients.find((item) => item.id === id);
  if (!patient) {
    return null;
  }

  const previousValue = JSON.stringify(patient);
  Object.assign(patient, input, { id, lastUpdatedAt: nowIso() });
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Patient updated",
    entityType: "PATIENT",
    entityId: id,
    previousValue,
    newValue: JSON.stringify(patient),
    reason: "Patient workflow state updated through the API."
  });
  return { data: patient, auditEvent };
}

export function updateSimulationOrder(courseId: string, input: Partial<SimulationOrder>) {
  const order = getSimulationOrder(courseId);
  if (!order) {
    return null;
  }

  const previousValue = JSON.stringify(order);
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
    newValue: JSON.stringify(order),
    reason: "IGSRT simulation form fields changed in the system of record."
  });
  return { data: getIgsrtWorkspace(courseId), auditEvent };
}

export function updatePrescription(courseId: string, input: Partial<Prescription>) {
  const prescription = getPrescription(courseId);
  if (!prescription) {
    return null;
  }

  const previousValue = JSON.stringify(prescription);
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
    newValue: JSON.stringify(prescription),
    reason: "IGSRT prescription parameters changed in the system of record."
  });
  return { data: getIgsrtWorkspace(courseId), auditEvent };
}

export function addFractionLogEntry(input: Partial<FractionLogEntry> & { courseId: string }) {
  const courseEntries = courseFractions(input.courseId, fractionLogEntries).sort((a, b) => a.fractionNumber - b.fractionNumber);
  const previousEntry = courseEntries.at(-1);
  const fractionNumber = Number(input.fractionNumber ?? (previousEntry ? previousEntry.fractionNumber + 1 : 1));
  const dosePerFraction = Number(input.dosePerFraction ?? 0);
  const isodosePercent = Number(input.isodosePercent ?? 0);
  const doseToDepth = Math.round(dosePerFraction * (isodosePercent / 100));
  const cumulativeDose = (previousEntry?.cumulativeDose ?? 0) + dosePerFraction;
  const cumulativeDoseToDepth = (previousEntry?.cumulativeDoseToDepth ?? 0) + doseToDepth;

  const entry: FractionLogEntry = {
    id: input.id ?? `FR-${input.courseId.replace("COURSE-", "")}-${String(fractionLogEntries.length + 1).padStart(2, "0")}`,
    courseId: input.courseId,
    fractionNumber,
    date: input.date ?? todayIsoDate(),
    phase: input.phase ?? "Phase I",
    energy: input.energy ?? "50 kV",
    ssd: input.ssd ?? "15 cm",
    dosePerFraction,
    cumulativeDose,
    technicianInitials: input.technicianInitials ?? "NR",
    mdApproval: compactBoolean(input.mdApproval),
    dotApproval: compactBoolean(input.dotApproval),
    depthOfTarget: input.depthOfTarget ?? "4.0 mm",
    isodosePercent,
    doseToDepth,
    cumulativeDoseToDepth,
    notes: input.notes ?? "Created from structured CureRays fraction log."
  };

  fractionLogEntries.push(entry);
  const auditEvent = addAuditEvent({
    userId: "SYSTEM",
    userName: "Workflow API",
    action: "Fraction log entry created",
    entityType: "FRACTION_LOG",
    entityId: entry.id,
    previousValue: "None",
    newValue: JSON.stringify(entry),
    reason: "Daily IGSRT treatment entry saved and dose totals recalculated."
  });
  return { data: getIgsrtWorkspace(input.courseId), auditEvent };
}

function renderContent(document: GeneratedDocument) {
  const patient = patients.find((item) => item.id === document.patientId);
  const course = treatmentCourses.find((item) => item.id === document.courseId);
  const order = getSimulationOrder(document.courseId);
  const prescription = getPrescription(document.courseId);
  const fractions = courseFractions(document.courseId, fractionLogEntries);

  if (!patient || !course) {
    return "Document could not be rendered because the linked patient or course is missing.";
  }

  if (document.templateId === "TPL-IGSRT-SIM" && order) {
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

  if (document.templateId === "TPL-IGSRT-RX" && prescription) {
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

  if (document.templateId === "TPL-IGSRT-FXLOG") {
    const lastFraction = fractions.at(-1);
    return [
      `IGSRT Fraction Log`,
      `Patient: ${patientName(patient)} (${patient.id})`,
      `Course: ${course.protocolName}`,
      `Fractions logged: ${fractions.length}`,
      `Current fraction: ${course.currentFraction}/${course.totalFractions}`,
      `Cumulative dose: ${lastFraction?.cumulativeDose ?? 0} cGy`,
      `Cumulative dose to DOT: ${lastFraction?.cumulativeDoseToDepth ?? 0} cGy`,
      `Open approvals: ${fractions.filter((entry) => !entry.mdApproval || !entry.dotApproval).length}`
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
  return { data: output, workspace: getIgsrtWorkspace(document.courseId), auditEvent };
}

export function signGeneratedDocument(documentId: string) {
  const document = generatedDocuments.find((item) => item.id === documentId);
  if (!document) {
    return null;
  }

  const previousValue = document.status;
  if (document.templateId === "TPL-IGSRT-SIM") {
    const order = getSimulationOrder(document.courseId);
    if (order) {
      order.signedAt = nowIso();
    }
  }
  if (document.templateId === "TPL-IGSRT-RX") {
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
  return { data: getIgsrtWorkspace(document.courseId), auditEvent };
}
