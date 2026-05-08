import {
  appointments,
  auditEvents,
  billingCodes,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  mappingRecords,
  operationalPatients,
  operationalTreatmentCourses,
  patients,
  prescriptions,
  priorityFlags,
  simulationOrders,
  templateSources,
  treatmentCourses
} from "@/lib/clinical-store";
import type {
  AuditCheck,
  BillingItem,
  ClinicalFormTemplate,
  Course,
  DocumentInstance,
  DocumentStatus,
  ImagingAsset,
  ResponsibleParty,
  Task,
  TreatmentFraction,
  TreatmentPlan,
  WorkflowItemStatus,
  WorkflowStep
} from "@/lib/types";
import { carepathPhaseLabels, courseDocuments, courseFractions, courseTasks } from "@/lib/workflow";

const timestamp = "2026-04-26T10:00:00+08:00";

const stepPhase: Record<number, WorkflowStep["phase"]> = {
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

const stepRole: Record<number, ResponsibleParty> = {
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

function statusForStep(stepNumber: number, currentFraction: number): WorkflowItemStatus {
  if (stepNumber < 7) {
    return "COMPLETED";
  }
  if (stepNumber === 7) {
    return "READY_FOR_REVIEW";
  }
  if (stepNumber >= 8 && stepNumber <= 12 && currentFraction > 0) {
    return "IN_PROGRESS";
  }
  if (stepNumber === 13 && currentFraction > 0) {
    return "PENDING";
  }
  if (stepNumber === 14) {
    return "BLOCKED";
  }
  return "PENDING";
}

export const canonicalWorkflowSteps: WorkflowStep[] = carepathStepNames.map((stepName, stepNumber) => ({
  id: `WF-CANON-${stepNumber}`,
  courseId: "TEMPLATE",
  stepNumber,
  stepName,
  phase: stepPhase[stepNumber],
  status: "PENDING",
  responsibleRole: stepRole[stepNumber],
  triggerEvent:
    stepNumber === 0
      ? "New course created"
      : stepNumber === 13
        ? "Final treatment fraction completed"
        : stepNumber === 14
          ? "Summary, billing, images, signatures, and follow-up complete"
          : `Previous ${carepathPhaseLabels[stepPhase[stepNumber]]} requirement ready`,
  dueDate: stepNumber < 8 ? "Before treatment start" : stepNumber === 14 ? "Before course closeout" : "During treatment",
  requiresSignature: [0, 1, 2, 5, 6, 7, 11, 13, 14].includes(stepNumber),
  linkedDocumentId: undefined,
  blockers: stepNumber === 14 ? ["Treatment summary, billing, follow-up, signatures, and images must be complete"] : [],
  auditChecklist: ["Status documented", "Responsible role assigned", "Linked evidence tracked"],
  createdAt: timestamp,
  updatedAt: timestamp
}));

function toWorkflowStatus(status: DocumentStatus): WorkflowItemStatus {
  if (status === "DRAFT" || status === "NOT_STARTED") {
    return "NOT_STARTED";
  }
  if (status === "PENDING_NEEDED" || status === "PENDING") {
    return "PENDING";
  }
  if (status === "MISSING_FIELDS" || status === "BLOCKED") {
    return "BLOCKED";
  }
  if (status === "NEEDS_REVIEW" || status === "READY_FOR_REVIEW") {
    return "READY_FOR_REVIEW";
  }
  if (status === "EXPORTED" || status === "UPLOADED") {
    return "UPLOADED";
  }
  return status;
}

export function getCourses(): Course[] {
  return treatmentCourses.map((course) => ({
    id: course.id,
    patientId: course.patientId,
    courseNumber: course.id.replace("COURSE-", "Course "),
    diagnosisType:
      course.diagnosisCategory === "SKIN_CANCER"
        ? "Skin"
        : course.diagnosisCategory === "ARTHRITIS"
          ? "Arthritis"
          : "Dupuytren's",
    treatmentSite: course.diagnosis,
    laterality: course.diagnosis.includes("left") ? "Left" : course.diagnosis.includes("right") ? "Right" : "Midline",
    location: patients.find((patient) => patient.id === course.patientId)?.location ?? "Main Campus",
    physicianId: patients.find((patient) => patient.id === course.patientId)?.physician,
    radOncId: patients.find((patient) => patient.id === course.patientId)?.physician,
    currentPhase:
      course.chartRoundsPhase === "UPCOMING"
        ? "CHART_PREP"
        : course.chartRoundsPhase === "ON_TREATMENT"
          ? "ON_TREATMENT"
          : course.status === "COMPLETED"
            ? "AUDIT"
            : "POST_TX",
    simpleDashboardPhase: course.chartRoundsPhase,
    status: course.status === "COMPLETED" ? "COMPLETED" : course.status === "ON_HOLD" ? "BLOCKED" : "IN_PROGRESS",
    startDate: course.startDate,
    endDate: course.endDate ?? undefined,
    assignedStaff: [patients.find((patient) => patient.id === course.patientId)?.assignedStaff ?? "Unassigned"],
    nextAction: patients.find((patient) => patient.id === course.patientId)?.nextAction ?? "Review workflow",
    flagsIssues: patients.find((patient) => patient.id === course.patientId)?.flags.map((flag) => flag.summary) ?? [],
    notes: course.notes,
    createdAt: course.startDate,
    updatedAt: timestamp
  }));
}

export function getWorkflowSteps(courseId?: string): WorkflowStep[] {
  const course = treatmentCourses.find((item) => item.id === courseId) ?? treatmentCourses[0];
  const courseDocs = courseDocuments(course.id, generatedDocuments);
  return canonicalWorkflowSteps.map((step) => {
    const linkedDocument = courseDocs.find((document) => document.name.includes(step.stepName.split(" ")[0]));
    const status = statusForStep(step.stepNumber, course.currentFraction);
    return {
      ...step,
      id: `WF-${course.id}-${step.stepNumber}`,
      courseId: course.id,
      status,
      linkedDocumentId: linkedDocument?.id,
      signedAt: ["COMPLETED", "SIGNED"].includes(status) && step.requiresSignature ? timestamp : undefined,
      blockers: status === "BLOCKED" ? step.blockers : [],
      notes:
        status === "NOT_APPLICABLE"
          ? "N/A requires a documented reason before saving."
          : "Generated from the canonical Carepath workflow template.",
      updatedAt: timestamp
    };
  });
}

export function getTasks(): Task[] {
  return carepathTasks.map((task) => {
    const course = treatmentCourses.find((item) => item.id === task.courseId);
    return {
      id: task.id,
      courseId: task.courseId,
      patientId: course?.patientId ?? "UNKNOWN",
      workflowStepId: `WF-${task.courseId}-${task.taskNumber}`,
      title: task.title,
      description: task.noteAction,
      type: task.title.toLowerCase().includes("sign") ? "SIGN_DOCUMENT" : "LAUNCH_DOCUMENT",
      status:
        task.status === "NEEDS_REVIEW"
          ? "READY_FOR_REVIEW"
          : task.status === "NOT_APPLICABLE"
            ? "NOT_APPLICABLE"
            : task.status,
      priority: task.status === "BLOCKED" ? "URGENT" : task.dueDate ? "HIGH" : "MEDIUM",
      assignedRole: task.responsibleParty,
      assignedUserId: task.assignedUser,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      comments: [task.timing],
      createdAt: task.lastUpdatedAt,
      updatedAt: task.lastUpdatedAt
    };
  });
}

export function getDocumentInstances(): DocumentInstance[] {
  return generatedDocuments.map((document, index) => ({
    id: document.id,
    patientId: document.patientId,
    courseId: document.courseId,
    templateId: document.templateId,
    title: document.name,
    category: document.clinicalPhase,
    status: toWorkflowStatus(document.status),
    storageProvider: "GOOGLE_DRIVE",
    fileIdOrPath: `Patients/course-output/${document.id}`,
    previewUrl: `/api/generated-documents/${document.id}`,
    version: index + 1,
    generatedAt: document.lastUpdatedAt,
    signedAt: document.signedAt,
    uploadedToEcwAt: document.exportedAt,
    lockedAt: document.signedAt,
    naReason: document.status === "NOT_APPLICABLE" ? "Document not required for this diagnosis/protocol." : undefined
  }));
}

export const clinicalFormTemplates: ClinicalFormTemplate[] = [
  {
    id: "FORM-HAND-ARTHRITIS-MAPPING",
    name: "Hand Arthritis X-ray Mapping",
    diagnosisType: "Arthritis",
    active: true,
    schema: [
      {
        id: "patient-context",
        title: "Patient Context",
        fields: [
          { id: "dos", label: "DOS", kind: "date", required: true },
          { id: "laterality", label: "Laterality", kind: "select", required: true, options: ["Left", "Right", "Bilateral"] },
          { id: "performedBy", label: "Performed by", kind: "text", required: true }
        ]
      },
      {
        id: "joint-grading",
        title: "Joint Grading",
        fields: [
          {
            id: "jointSpaceNarrowing",
            label: "Joint Space Narrowing",
            kind: "select",
            required: true,
            options: ["None", "Mild", "Moderate", "Severe"]
          },
          { id: "osteophytes", label: "Osteophytes", kind: "select", required: true, options: ["None", "Mild", "Moderate", "Severe"] },
          { id: "sclerosis", label: "Sclerosis", kind: "select", required: true, options: ["None", "Mild", "Moderate", "Severe"] },
          { id: "overallGrade", label: "Overall Grade", kind: "select", required: true, options: ["0", "1", "2", "3", "4"] },
          { id: "fieldDecision", label: "Include / Exclude Decision", kind: "textarea", required: true }
        ]
      }
    ]
  }
];

export function getTreatmentPlans(): TreatmentPlan[] {
  return prescriptions.map((prescription) => ({
    id: `PLAN-${prescription.id}`,
    patientId: prescription.patientId,
    courseId: prescription.courseId,
    diagnosisType: "Skin",
    site: prescription.site,
    laterality: prescription.laterality,
    energy: prescription.phases[0]?.energyKv ? `${prescription.phases[0].energyKv} kV` : undefined,
    applicatorSize: prescription.phases[0]?.applicatorSize,
    depthOfInvasion: prescription.phases[0]?.depthOfTargetMm
      ? `${prescription.phases[0].depthOfTargetMm} mm`
      : undefined,
    totalDose: prescription.phases[0]?.phaseTotalDoseGy ? `${prescription.phases[0].phaseTotalDoseGy} Gy` : undefined,
    dosePerFraction: prescription.phases[0]?.dosePerFractionGy ? `${prescription.phases[0].dosePerFractionGy} Gy` : undefined,
    totalFractions: prescription.phases[0]?.totalFractions,
    phaseIParams: prescription.phases[0]?.technique,
    phaseIIParams: "Placeholder for second-phase plan parameters when protocol requires them.",
    percentDepthDose: 90,
    doseToDepth: "Calculated once percent-depth-dose data is mapped.",
    coverage: "Coverage summary placeholder from IGSRT isodose data.",
    physicistReviewStatus: "READY_FOR_REVIEW",
    radOncSignatureStatus: prescription.signedAt ? "SIGNED" : "READY_FOR_REVIEW",
    lockedAt: prescription.signedAt
  }));
}

export function getTreatmentFractions(): TreatmentFraction[] {
  return fractionLogEntries.map((entry) => ({
    id: entry.id,
    courseId: entry.courseId,
    fractionNumber: entry.fractionNumber,
    phase: entry.phase,
    treatmentDate: entry.date,
    plannedDose: entry.dosePerFraction,
    deliveredDose: entry.dosePerFraction,
    cumulativeDose: entry.cumulativeDose,
    energy: entry.energy,
    applicator: entry.ssd,
    imageGuidanceCompleted: entry.dotApproval,
    status: entry.mdApproval && entry.dotApproval ? "COMPLETED" : "READY_FOR_REVIEW",
    therapistId: entry.technicianInitials,
    physicianReviewedAt: entry.mdApproval ? entry.date : undefined,
    notes: entry.notes
  }));
}

export const imagingCategories = [
  "Lesion without ink",
  "Lesion inked at border",
  "Dermoscopy",
  "Lesion with Phase I margin",
  "Lesion with Phase II margin",
  "Lesion with all margins",
  "Ultrasound image at simulation",
  "X-ray image",
  "Shielded nozzle view",
  "Side nozzle view",
  "Isodose overlay",
  "Other"
];

export const imagingAssets: ImagingAsset[] = imagingCategories.slice(0, 5).map((category, index) => ({
  id: `IMG-${index + 1}`,
  patientId: patients[index % patients.length]?.id ?? "CR-2401",
  courseId: treatmentCourses[index % treatmentCourses.length]?.id ?? "COURSE-2401",
  category,
  phase: index < 2 ? "SIMULATION" : "PLANNING",
  fileIdOrPath: `Patients/sample-course/Images/${category.replaceAll(" ", "-").toLowerCase()}.jpg`,
  previewUrl: undefined,
  uploadedByUserId: ["MA", "RTT", "PHYSICIST"][index % 3],
  uploadedAt: timestamp,
  notes: "Placeholder image record. Actual upload will route through fileStorageService."
}));

export const billingItems: BillingItem[] = billingCodes.map((code, index) => ({
  id: `BILL-${code.id}`,
  courseId: treatmentCourses[index % treatmentCourses.length]?.id ?? "COURSE-2401",
  code: code.code,
  description: code.description,
  plannedQuantity: index % 2 === 0 ? 1 : 6,
  completedQuantity: index % 2 === 0 ? 1 : 3,
  billedQuantity: code.readinessStatus === "READY" ? 1 : 0,
  status:
    code.readinessStatus === "READY"
      ? "COMPLETED"
      : code.readinessStatus === "BLOCKED"
        ? "BLOCKED"
        : code.readinessStatus === "NOT_APPLICABLE"
          ? "NOT_APPLICABLE"
          : "READY_FOR_REVIEW",
  linkedDocumentId: generatedDocuments[index % generatedDocuments.length]?.id,
  notes: code.frequency
}));

export { templateSources };

export const auditChecks: AuditCheck[] = [
  "Required documents signed",
  "N/A items include reason",
  "Treatment summary complete",
  "Follow-up scheduled",
  "Billing complete",
  "Required images attached",
  "Final Carepath audit sign ready"
].map((label, index) => ({
  id: `AUDIT-CHECK-${index + 1}`,
  courseId: treatmentCourses[index % treatmentCourses.length]?.id ?? "COURSE-2401",
  category: index < 2 ? "Documents" : index < 5 ? "Closeout" : "Final Audit",
  label,
  status: index < 3 ? "COMPLETED" : index === 4 ? "READY_FOR_REVIEW" : "BLOCKED",
  required: true,
  evidenceDocumentId: generatedDocuments[index % generatedDocuments.length]?.id,
  notes: index === 1 ? "N/A cannot be saved without a reason in final workflow logic." : undefined
}));

export function getModuleSnapshot() {
  return {
    patients: operationalPatients(),
    courses: getCourses(),
    operationalCourses: operationalTreatmentCourses(),
    treatmentCourses,
    workflowSteps: getWorkflowSteps(),
    tasks: getTasks(),
    documents: getDocumentInstances(),
    generatedDocuments,
    clinicalFormTemplates,
    mappingRecords,
    treatmentPlans: getTreatmentPlans(),
    treatmentFractions: getTreatmentFractions(),
    imagingCategories,
    imagingAssets,
    appointments,
    priorityFlags,
    billingItems,
    auditChecks,
    auditEvents,
    simulationOrders,
    prescriptions,
    templateSources
  };
}
