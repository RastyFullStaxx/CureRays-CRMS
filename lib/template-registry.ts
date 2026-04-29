import type {
  CarepathTask,
  DocumentRequirement,
  DocumentTemplate,
  GeneratedDocument,
  InternalFormTemplate,
  Patient,
  TemplateSource,
  TreatmentCourse,
  WorkflowDefinition,
  WorkflowDocumentState
} from "@/lib/types";
import { completedDocumentStatuses, completedTaskStatuses, orderedCarepathPhases } from "@/lib/workflow";

export const templateSources: TemplateSource[] = [
  {
    id: "SRC-INTAKE",
    name: "Intake Form Template",
    sourceFileName: "Intake Form Template_08APR2025.docx",
    driveFileId: "1-lEfDuDmGyndX2zXDbtcyZoYRJXBEcnq",
    driveUrl: "https://docs.google.com/document/d/1-lEfDuDmGyndX2zXDbtcyZoYRJXBEcnq/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Universal starting document. Field mapping is intentionally incomplete in V2.",
    modifiedAt: "2026-04-29T02:01:08.000Z"
  },
  {
    id: "SRC-AVS-PCP",
    name: "AVS PCP Template",
    sourceFileName: "AVS PCP Template.docx",
    driveFileId: "1TxQzo7u2LAJ-VxDMlYU-3Nzxcr1qtXJf",
    driveUrl: "https://docs.google.com/document/d/1TxQzo7u2LAJ-VxDMlYU-3Nzxcr1qtXJf/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Universal post-visit communication document. V2 tracks status before automating output.",
    modifiedAt: "2026-04-29T02:01:40.000Z"
  },
  {
    id: "SRC-SKIN-CAREPATH-PREAUTH-20",
    name: "Skin Cancer Carepath PreAuth Audit - 20fx",
    sourceFileName: "Copy of 0. 2026 CarepathPreAuthAudit.SKIN.lesion#.SkinCancer20fx.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1bTY3iGIw367tB5NgmbAwPplv3OUChA7L",
    driveUrl: "https://docs.google.com/document/d/1bTY3iGIw367tB5NgmbAwPplv3OUChA7L/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Billing pre-auth and audit mapping are not final."
  },
  {
    id: "SRC-SKIN-IGSRT-SIM",
    name: "Skin Cancer IGSRT Simulation Order",
    sourceFileName: "2. CTP_SIM_IGSRTorder.LOCATION.laterality.SKIN.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX",
    driveUrl: "https://docs.google.com/document/d/1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX/edit",
    mimeType: "DOCX",
    status: "ACTIVE",
    modifiedAt: "2026-04-22T10:47:28.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-RX",
    name: "Skin Cancer IGSRT Prescription",
    sourceFileName: "7. Prescription.LOCATION.laterality.SCC_BCC.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi",
    driveUrl: "https://docs.google.com/document/d/1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi/edit",
    mimeType: "DOCX",
    status: "ACTIVE",
    modifiedAt: "2026-04-06T16:17:34.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-FXLOG",
    name: "Skin Cancer IGSRT Fraction Log",
    sourceFileName: "12. FX Log.SITE.laterality.SKIN.DDMMYY.LastName.First Name.xlsx",
    driveFileId: "1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ",
    driveUrl: "https://docs.google.com/spreadsheets/d/1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ/edit",
    mimeType: "XLSX",
    status: "ACTIVE",
    modifiedAt: "2026-04-22T10:53:16.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-ISO",
    name: "Skin Cancer IGSRT Isodose Curves",
    sourceFileName: "Copy of 9. IGSRT Isodose Curves.ANATOMICREGION.laterality.SKIN CANCER.DDMMYY.LastName.FirstName.pptx",
    driveFileId: "17wIN9r2QXhZ6o-dIM1FGgXf-CQNXE3jn",
    driveUrl: "https://docs.google.com/presentation/d/17wIN9r2QXhZ6o-dIM1FGgXf-CQNXE3jn/edit",
    mimeType: "PPTX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Tracked as registry metadata until output rules are mapped."
  },
  {
    id: "SRC-ARTHRITIS-HAND-MAP",
    name: "Arthritis Hand Joint Mapping",
    sourceFileName: "Joint Mapping.HAND.LATERALITY.ARTHRITIS.MM_DD_YY.LastName,FirstName.docx",
    driveFileId: "13qRFW6VF8fJCuUW4O7qSHX3WtjDCQ7ta",
    driveUrl: "https://docs.google.com/document/d/13qRFW6VF8fJCuUW4O7qSHX3WtjDCQ7ta/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "SRC-ARTHRITIS-KNEE-RX",
    name: "Arthritis Knee Prescription",
    sourceFileName: "7. Prescription.KNEE.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1mV6QHLk8blVk31zxDhQMXXJFDljJSJl9",
    driveUrl: "https://docs.google.com/document/d/1mV6QHLk8blVk31zxDhQMXXJFDljJSJl9/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "SRC-DUPUYTRENS-SIM",
    name: "Dupuytren's SIM CTP IGRT",
    sourceFileName: "2. SIM_CTP_IGRT.LOCATION.laterality.DUPUYTREN_S.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1R2FClgrgied8AUX1SrEv1T2sykF_2XUx",
    driveUrl: "https://docs.google.com/document/d/1R2FClgrgied8AUX1SrEv1T2sykF_2XUx/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "SRC-BILLING-PREAUTH-MISSING",
    name: "Billing Pre-Authorization Mapping",
    sourceFileName: "Billing pre-auth template mapping pending",
    mimeType: "UNKNOWN",
    status: "MISSING",
    notes: "Placeholder so missing billing pre-auth work remains visible without hardcoding final rules."
  }
];

export const documentRequirements: DocumentRequirement[] = [
  {
    id: "REQ-INTAKE",
    name: "Intake Form",
    workflowPhase: "CONSULTATION",
    responsibleParty: "VA",
    applicability: {
      diagnosis: "ALL",
      universal: true,
      requiredWhen: "Required at the start of every patient workflow."
    },
    templateSourceId: "SRC-INTAKE",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete intake packet and confirm required demographics/workflow fields",
    requiredFields: ["patient identifiers", "diagnosis", "contact details", "initial workflow needs"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete intake packet",
    taskNumber: "V2-01",
    timing: "Before chart prep",
    auditSteps: ["Intake complete", "Required fields reviewed"]
  },
  {
    id: "REQ-AVS-PCP",
    name: "AVS PCP Template",
    workflowPhase: "POST_TX",
    responsibleParty: "PCP",
    applicability: {
      diagnosis: "ALL",
      universal: true,
      requiredWhen: "Required when after-visit or PCP communication is part of closure."
    },
    templateSourceId: "SRC-AVS-PCP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Prepare AVS/PCP communication when discharge or closure details are ready",
    requiredFields: ["visit summary", "follow-up plan", "PCP communication details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Prepare AVS / PCP communication",
    taskNumber: "V2-02",
    timing: "At post-treatment or visit closure",
    auditSteps: ["AVS reviewed", "Communication status confirmed"]
  },
  {
    id: "REQ-SKIN-PREAUTH",
    name: "Carepath PreAuth Note",
    workflowPhase: "CONSULTATION",
    responsibleParty: "ADMIN",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Needed when payer authorization and audit evidence are required."
    },
    templateSourceId: "SRC-SKIN-CAREPATH-PREAUTH-20",
    defaultStatus: "MISSING_FIELDS",
    requiredAction: "Map billing pre-auth requirements before treating this as fully automated",
    requiredFields: ["diagnosis", "authorization outcome", "payer requirements"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "N/A",
    createsTask: false
  },
  {
    id: "REQ-SKIN-IGSRT-SIM",
    name: "CTP / SIM IGSRT Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Before first treatment."
    },
    templateSourceId: "SRC-SKIN-IGSRT-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete simulation order and route for Rad Onc signature",
    requiredFields: ["lesion location", "margin instruction", "setup photos", "physics requirements"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77280",
    createsTask: true,
    taskTitle: "Complete simulation order",
    taskNumber: "IGSRT-01",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-SKIN-IGSRT-RX",
    name: "IGSRT Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-SKIN-IGSRT-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify prescription parameters and route for signature",
    requiredFields: ["site", "laterality", "phase dose", "energy", "SSD", "DOT"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review prescription parameters",
    taskNumber: "IGSRT-02",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-SKIN-IGSRT-FXLOG",
    name: "IGSRT Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-SKIN-IGSRT-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "DOT", "isodose", "MD approval", "DOT approval"],
    outputFormats: ["XLSX", "PDF"],
    cptCode: "77439",
    createsTask: true,
    taskTitle: "Reconcile fraction log approvals",
    taskNumber: "IGSRT-03",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "MD approval", "DOT approval"]
  },
  {
    id: "REQ-SKIN-IGSRT-ISO",
    name: "IGSRT Isodose Curve Support",
    workflowPhase: "PLANNING",
    responsibleParty: "PHYSICIST",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "When isodose support is needed for treatment planning."
    },
    templateSourceId: "SRC-SKIN-IGSRT-ISO",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Confirm isodose support requirements and mapping status",
    requiredFields: ["energy", "applicator", "depth of target", "isodose percentage"],
    outputFormats: ["PPTX", "PDF"],
    cptCode: "77300",
    createsTask: false
  },
  {
    id: "REQ-ARTHRITIS-MAPPING",
    name: "Arthritis X-ray Mapping Note",
    workflowPhase: "CHART_PREP",
    responsibleParty: "MA",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint mapping",
      bodyRegion: "HAND/KNEE/FOOT",
      requiredWhen: "Before simulation or planning review."
    },
    templateSourceId: "SRC-ARTHRITIS-HAND-MAP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Capture joint scores and field design decision",
    requiredFields: ["joint space narrowing", "osteophyte", "sclerosis", "overall grade"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Joint mapping assessment",
    taskNumber: "ARTH-01",
    timing: "Before simulation",
    auditSteps: ["Mapping fields complete", "Provider review"]
  },
  {
    id: "REQ-DUPUYTRENS-SIM",
    name: "Dupuytren's Simulation Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      requiredWhen: "Before treatment planning."
    },
    templateSourceId: "SRC-DUPUYTRENS-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Map Dupuytren's simulation fields before automation",
    requiredFields: ["location", "laterality", "field design", "setup details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: false
  },
  {
    id: "REQ-BILLING-PREAUTH-MAPPING",
    name: "Billing Pre-Authorization Mapping",
    workflowPhase: "CONSULTATION",
    responsibleParty: "ADMIN",
    applicability: {
      diagnosis: "ALL",
      requiredWhen: "Needed for workflows where billing pre-auth applies."
    },
    templateSourceId: "SRC-BILLING-PREAUTH-MISSING",
    defaultStatus: "MISSING_FIELDS",
    requiredAction: "Template mapping missing; confirm billing pre-auth workflow before automation",
    requiredFields: ["payer", "authorization status", "billing rule mapping"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: false
  }
];

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "WF-UNIVERSAL",
    name: "Universal Patient Workflow",
    diagnosis: "ALL",
    protocol: "Universal",
    description: "Core intake and closure documents that can apply across evolving diagnosis workflows.",
    phases: orderedCarepathPhases,
    documentRequirementIds: ["REQ-INTAKE", "REQ-AVS-PCP", "REQ-BILLING-PREAUTH-MAPPING"],
    status: "ACTIVE"
  },
  {
    id: "WF-SKIN-IGSRT",
    name: "Skin Cancer IGSRT Workflow",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    description: "Skin cancer IGSRT tracking for simulation, prescription, fraction log, isodose, and pre-auth evidence.",
    phases: orderedCarepathPhases,
    documentRequirementIds: [
      "REQ-INTAKE",
      "REQ-SKIN-PREAUTH",
      "REQ-SKIN-IGSRT-SIM",
      "REQ-SKIN-IGSRT-RX",
      "REQ-SKIN-IGSRT-FXLOG",
      "REQ-SKIN-IGSRT-ISO",
      "REQ-AVS-PCP"
    ],
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "WF-ARTHRITIS",
    name: "Arthritis Workflow",
    diagnosis: "ARTHRITIS",
    protocol: "Joint mapping",
    description: "Arthritis tracking by body region while template details continue to be mapped.",
    phases: orderedCarepathPhases,
    documentRequirementIds: ["REQ-INTAKE", "REQ-ARTHRITIS-MAPPING", "REQ-AVS-PCP"],
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "WF-DUPUYTRENS",
    name: "Dupuytren's Workflow",
    diagnosis: "DUPUYTRENS",
    protocol: "Dupuytren's",
    description: "Dupuytren's tracking with simulation, prescription, fraction log, and mapping still evolving.",
    phases: orderedCarepathPhases,
    documentRequirementIds: ["REQ-INTAKE", "REQ-DUPUYTRENS-SIM", "REQ-AVS-PCP"],
    status: "MAPPING_IN_PROGRESS"
  }
];

export const documentTemplates: DocumentTemplate[] = documentRequirements.map((requirement) => {
  const source = templateSources.find((item) => item.id === requirement.templateSourceId);

  return {
    id: requirement.id.replace("REQ-", "TPL-"),
    name: requirement.name,
    diagnosis: requirement.applicability.diagnosis,
    protocol: requirement.applicability.protocol ?? (requirement.applicability.universal ? "Universal" : "Registry"),
    category: requirement.workflowPhase,
    version: source?.status === "ACTIVE" ? "registry-active" : "registry-mapping",
    requiredFields: requirement.requiredFields,
    status: source?.status === "ACTIVE" ? "ACTIVE" : source?.status === "RETIRED" ? "RETIRED" : "DRAFT"
  };
});

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

function sourceForRequirement(requirement: DocumentRequirement) {
  return templateSources.find((source) => source.id === requirement.templateSourceId);
}

function protocolMatches(requirementProtocol: string | undefined, course: TreatmentCourse) {
  if (!requirementProtocol) {
    return true;
  }

  const normalizedRequirement = requirementProtocol.toLowerCase();
  const normalizedCourse = `${course.protocolName} ${course.treatmentModality} ${course.treatmentType}`.toLowerCase();
  return normalizedCourse.includes(normalizedRequirement.toLowerCase()) || normalizedRequirement === "universal";
}

export function documentRequirementAppliesToCourse(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
) {
  if (requirement.applicability.universal || requirement.applicability.diagnosis === "ALL") {
    return true;
  }

  return (
    requirement.applicability.diagnosis === patient.diagnosisCategory &&
    protocolMatches(requirement.applicability.protocol, course)
  );
}

export function applicableDocumentRequirements(patient: Patient, course: TreatmentCourse) {
  return documentRequirements.filter((requirement) => documentRequirementAppliesToCourse(requirement, patient, course));
}

export function deriveDocumentStateFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse,
  documents: GeneratedDocument[]
): WorkflowDocumentState {
  const existing = documents.find(
    (document) =>
      document.courseId === course.id &&
      (document.templateId === requirement.id || document.name === requirement.name)
  );
  const source = sourceForRequirement(requirement);
  const status = existing?.status ?? requirement.defaultStatus;

  return {
    requirementId: requirement.id,
    documentId: existing?.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    workflowPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status,
    requiredAction: existing?.requiredAction ?? requirement.requiredAction,
    auditReady: existing?.auditReady ?? completedDocumentStatuses.includes(status),
    templateSourceStatus: source?.status,
    sourceDriveUrl: source?.driveUrl,
    mapped: source ? source.status === "ACTIVE" : false
  };
}

export function deriveWorkflowDocumentStates(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  return patients.flatMap((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return [];
    }

    return applicableDocumentRequirements(patient, course).map((requirement) =>
      deriveDocumentStateFromRequirement(requirement, patient, course, documents)
    );
  });
}

export function createGeneratedDocumentFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse,
  index: number
): GeneratedDocument {
  return {
    id: `DOC-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    templateId: requirement.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    clinicalPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status: requirement.defaultStatus,
    requiredAction: requirement.requiredAction,
    cptCode: requirement.cptCode,
    assignedTo: requirement.responsibleParty,
    lastUpdatedAt: patient.lastUpdatedAt,
    signReviewState:
      requirement.defaultStatus === "READY_FOR_REVIEW"
        ? "READY_FOR_SIGNATURE"
        : requirement.defaultStatus === "NEEDS_REVIEW" || requirement.defaultStatus === "MISSING_FIELDS"
          ? "REVIEW_REQUIRED"
          : "NOT_STARTED",
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus) || index < 0
  };
}

export function ensureRequirementDocuments(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    applicableDocumentRequirements(patient, course).forEach((requirement, index) => {
      const exists = documents.some(
        (document) =>
          document.courseId === course.id &&
          (document.templateId === requirement.id || document.name === requirement.name)
      );

      if (!exists) {
        documents.push(createGeneratedDocumentFromRequirement(requirement, patient, course, index));
      }
    });
  });
}

export function createTaskFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
): CarepathTask | null {
  if (!requirement.createsTask) {
    return null;
  }

  return {
    id: `TASK-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    courseId: course.id,
    taskNumber: requirement.taskNumber ?? requirement.id.replace("REQ-", ""),
    title: requirement.taskTitle ?? requirement.name,
    workflowPhase: requirement.workflowPhase,
    documentName: requirement.name,
    status: completedDocumentStatuses.includes(requirement.defaultStatus) ? "COMPLETED" : "PENDING",
    responsibleParty: requirement.responsibleParty,
    timing: requirement.timing ?? requirement.applicability.requiredWhen ?? "As required by workflow",
    noteAction: requirement.requiredAction,
    cptCodes: requirement.cptCode ? [requirement.cptCode] : ["N/A"],
    auditSteps: requirement.auditSteps ?? ["Document status reviewed"],
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus),
    dueDate: patient.lastUpdatedAt.slice(0, 10),
    lastUpdatedAt: patient.lastUpdatedAt,
    assignedUser: requirement.responsibleParty
  };
}

export function ensureRequirementTasks(
  patients: Patient[],
  courses: TreatmentCourse[],
  tasks: CarepathTask[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    applicableDocumentRequirements(patient, course).forEach((requirement) => {
      const task = createTaskFromRequirement(requirement, patient, course);
      const exists =
        !task ||
        tasks.some((item) => item.courseId === course.id && item.documentName === requirement.name);

      if (task && !exists) {
        tasks.push(task);
      }
    });
  });
}
