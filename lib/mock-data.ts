import type {
  Activity,
  Appointment,
  AuditEvent,
  BillingCode,
  CarepathTask,
  DocumentTemplate,
  FractionLogEntry,
  GeneratedDocument,
  Patient,
  PriorityFlag,
  TreatmentCourse
} from "@/lib/types";

export const patients: Patient[] = [
  {
    id: "CR-2401",
    firstName: "Avery",
    lastName: "Santos",
    mrn: "MRN-90241",
    diagnosis: "Skin cancer - nasal bridge",
    diagnosisCategory: "SKIN_CANCER",
    location: "Main Campus",
    physician: "Dr. Helena Cruz",
    chartRoundsPhase: "ON_TREATMENT",
    status: "ACTIVE",
    assignedStaff: "Mika Alvarez",
    activeCourseId: "COURSE-2401",
    nextAction: "Rad Onc signature needed for weekly physics chart check",
    flags: [
      {
        id: "PFL-2401",
        severity: "MEDIUM",
        summary: "Weekly physics chart check awaiting signature",
        owner: "RAD_ONC",
        dueDate: "2026-04-26"
      }
    ],
    notes: "Operational summary only. Clinical details remain in the chart.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: true,
      billingComplete: false
    },
    lastUpdatedAt: "2026-04-26T08:48:00+08:00"
  },
  {
    id: "CR-2402",
    firstName: "Noah",
    lastName: "Tan",
    mrn: "MRN-90242",
    diagnosis: "Arthritis - right knee",
    diagnosisCategory: "ARTHRITIS",
    location: "North Suite",
    physician: "Dr. Mateo Reyes",
    chartRoundsPhase: "UPCOMING",
    status: "ACTIVE",
    assignedStaff: "Iris Lim",
    activeCourseId: "COURSE-2402",
    nextAction: "Complete X-ray mapping note before chart prep",
    flags: [
      {
        id: "PFL-2402",
        severity: "HIGH",
        summary: "Joint mapping note still pending",
        owner: "MA",
        dueDate: "2026-04-26"
      }
    ],
    notes: "Joint mapping is required before planning review.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: true
    },
    lastUpdatedAt: "2026-04-26T09:20:00+08:00"
  },
  {
    id: "CR-2403",
    firstName: "Lena",
    lastName: "Brooks",
    mrn: "MRN-90243",
    diagnosis: "Dupuytren's - left palm",
    diagnosisCategory: "DUPUYTRENS",
    location: "Main Campus",
    physician: "Dr. Samir Patel",
    chartRoundsPhase: "POST",
    status: "ACTIVE",
    assignedStaff: "Tessa Nguyen",
    activeCourseId: "COURSE-2403",
    nextAction: "Finalize treatment summary export packet",
    flags: [],
    notes: "Post-treatment closure workflow is in progress.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: false,
      billingComplete: true
    },
    lastUpdatedAt: "2026-04-25T14:15:00+08:00"
  },
  {
    id: "CR-2404",
    firstName: "Ethan",
    lastName: "Keller",
    mrn: "MRN-90244",
    diagnosis: "Skin cancer - cheek",
    diagnosisCategory: "SKIN_CANCER",
    location: "East Wing",
    physician: "Dr. Helena Cruz",
    chartRoundsPhase: "ON_TREATMENT",
    status: "ON_HOLD",
    assignedStaff: "Mika Alvarez",
    activeCourseId: "COURSE-2404",
    nextAction: "Resolve chart hold and document review blocker",
    flags: [
      {
        id: "PFL-2404A",
        severity: "HIGH",
        summary: "Clinical hold requires Rad Onc review",
        owner: "RAD_ONC",
        dueDate: "2026-04-26"
      },
      {
        id: "PFL-2404B",
        severity: "MEDIUM",
        summary: "Special physics consult needs review",
        owner: "PHYSICIST",
        dueDate: "2026-04-27"
      }
    ],
    notes: "Hold reason is restricted. Operations view shows coordination task only.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdatedAt: "2026-04-26T10:05:00+08:00"
  },
  {
    id: "CR-2405",
    firstName: "Maya",
    lastName: "Chen",
    mrn: "MRN-90245",
    diagnosis: "Arthritis - left thumb",
    diagnosisCategory: "ARTHRITIS",
    location: "North Suite",
    physician: "Dr. Mateo Reyes",
    chartRoundsPhase: "POST",
    status: "ACTIVE",
    assignedStaff: "Iris Lim",
    activeCourseId: "COURSE-2405",
    nextAction: "Billing code review before audit closure",
    flags: [
      {
        id: "PFL-2405",
        severity: "MEDIUM",
        summary: "Billing readiness needs review",
        owner: "ADMIN",
        dueDate: "2026-04-27"
      }
    ],
    notes: "Billing workflow pending verification.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: true,
      billingComplete: false
    },
    lastUpdatedAt: "2026-04-25T16:40:00+08:00"
  },
  {
    id: "CR-2406",
    firstName: "Julian",
    lastName: "Park",
    mrn: "MRN-90246",
    diagnosis: "Skin cancer - scalp",
    diagnosisCategory: "SKIN_CANCER",
    location: "Main Campus",
    physician: "Dr. Priya Nair",
    chartRoundsPhase: "UPCOMING",
    status: "PAUSED",
    assignedStaff: "Noel Rivera",
    activeCourseId: "COURSE-2406",
    nextAction: "Confirm start date and simulation order",
    flags: [
      {
        id: "PFL-2406",
        severity: "MEDIUM",
        summary: "Schedule risk after paused start date",
        owner: "VA",
        dueDate: "2026-04-28"
      }
    ],
    notes: "Start date changed; workflow remains phase-driven.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdatedAt: "2026-04-24T11:35:00+08:00"
  }
];

export const treatmentCourses: TreatmentCourse[] = [
  {
    id: "COURSE-2401",
    patientId: "CR-2401",
    diagnosis: "Skin cancer - nasal bridge",
    diagnosisCategory: "SKIN_CANCER",
    protocolName: "IGSRT Skin Cancer 20 Fraction Protocol",
    totalFractions: 20,
    currentFraction: 8,
    startDate: "2026-04-15",
    endDate: "2026-05-10",
    chartRoundsPhase: "ON_TREATMENT",
    status: "ACTIVE",
    treatmentModality: "IGSRT / superficial radiation",
    treatmentType: "Skin lesion protocol",
    phaseOne: "Initial treatment field",
    energy: "50 kV",
    applicator: "3 cm cone",
    dose: "250 cGy x 20",
    targetDepth: "4.0 mm",
    notes: "Isodose support and image guidance documentation required."
  },
  {
    id: "COURSE-2402",
    patientId: "CR-2402",
    diagnosis: "Arthritis - right knee",
    diagnosisCategory: "ARTHRITIS",
    protocolName: "Arthritis Joint Mapping Workflow",
    totalFractions: 6,
    currentFraction: 0,
    startDate: "2026-04-30",
    endDate: null,
    chartRoundsPhase: "UPCOMING",
    status: "NOT_STARTED",
    treatmentModality: "Orthovoltage radiation",
    treatmentType: "Joint pain protocol",
    energy: "100 kV",
    applicator: "Open field",
    dose: "50 cGy x 6",
    targetDepth: "Joint space",
    fieldDesign: "Pending X-ray mapping",
    notes: "Joint space narrowing, osteophyte, sclerosis, and grade need structured capture."
  },
  {
    id: "COURSE-2403",
    patientId: "CR-2403",
    diagnosis: "Dupuytren's - left palm",
    diagnosisCategory: "DUPUYTRENS",
    protocolName: "Dupuytren's Orthovoltage Protocol",
    totalFractions: 10,
    currentFraction: 10,
    startDate: "2026-03-18",
    endDate: "2026-04-12",
    chartRoundsPhase: "POST",
    status: "COMPLETED",
    treatmentModality: "Orthovoltage radiation",
    treatmentType: "Dupuytren's protocol",
    phaseOne: "5 fraction sequence",
    phaseTwo: "5 fraction sequence",
    energy: "100 kV",
    applicator: "Hand cone",
    dose: "300 cGy x 10",
    targetDepth: "Palmar fascia",
    notes: "Treatment summary and export packet are the remaining operational items."
  },
  {
    id: "COURSE-2404",
    patientId: "CR-2404",
    diagnosis: "Skin cancer - cheek",
    diagnosisCategory: "SKIN_CANCER",
    protocolName: "IGSRT Skin Cancer 30 Fraction Protocol",
    totalFractions: 30,
    currentFraction: 11,
    startDate: "2026-04-08",
    endDate: "2026-05-22",
    chartRoundsPhase: "ON_TREATMENT",
    status: "ON_HOLD",
    treatmentModality: "IGSRT / superficial radiation",
    treatmentType: "Skin lesion protocol",
    energy: "70 kV",
    applicator: "4 cm cone",
    dose: "200 cGy x 30",
    targetDepth: "5.5 mm",
    notes: "Hold reason restricted. Physics and Rad Onc review are the visible blockers."
  },
  {
    id: "COURSE-2405",
    patientId: "CR-2405",
    diagnosis: "Arthritis - left thumb",
    diagnosisCategory: "ARTHRITIS",
    protocolName: "Arthritis Small Joint Protocol",
    totalFractions: 6,
    currentFraction: 6,
    startDate: "2026-03-25",
    endDate: "2026-04-09",
    chartRoundsPhase: "POST",
    status: "COMPLETED",
    treatmentModality: "Orthovoltage radiation",
    treatmentType: "Joint pain protocol",
    energy: "80 kV",
    applicator: "Thumb field",
    dose: "50 cGy x 6",
    targetDepth: "Joint space",
    fieldDesign: "Completed",
    notes: "Billing and audit readiness review remain open."
  },
  {
    id: "COURSE-2406",
    patientId: "CR-2406",
    diagnosis: "Skin cancer - scalp",
    diagnosisCategory: "SKIN_CANCER",
    protocolName: "IGSRT Skin Cancer 20 Fraction Protocol",
    totalFractions: 20,
    currentFraction: 0,
    startDate: "2026-05-06",
    endDate: null,
    chartRoundsPhase: "UPCOMING",
    status: "ON_HOLD",
    treatmentModality: "IGSRT / superficial radiation",
    treatmentType: "Skin lesion protocol",
    energy: "50 kV",
    applicator: "Scalp cone",
    dose: "250 cGy x 20",
    targetDepth: "Pending simulation",
    notes: "Simulation order and start date confirmation are required."
  }
];

export const billingCodes: BillingCode[] = [
  {
    id: "BC-77280",
    code: "77280",
    description: "Simulation-aided field setting",
    frequency: "Per setup event",
    purpose: "ORDERS_WORK",
    readinessStatus: "READY"
  },
  {
    id: "BC-77300",
    code: "77300",
    description: "Basic radiation dosimetry calculation",
    frequency: "Per treatment plan",
    purpose: "JUSTIFIES_WORK_DONE",
    readinessStatus: "NEEDS_REVIEW"
  },
  {
    id: "BC-77427",
    code: "77427",
    description: "Radiation treatment management",
    frequency: "Weekly / course-based",
    purpose: "JUSTIFIES_WORK_DONE",
    readinessStatus: "NEEDS_REVIEW"
  },
  {
    id: "BC-N/A",
    code: "N/A",
    description: "Not applicable to selected workflow",
    frequency: "N/A",
    purpose: "REFERENCE_ONLY",
    readinessStatus: "NOT_APPLICABLE"
  }
];

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "TPL-PREAUTH",
    name: "Carepath PreAuth Note",
    diagnosis: "ALL",
    protocol: "Carepath",
    category: "CONSULTATION",
    version: "v1.4",
    requiredFields: ["diagnosis", "responsible party", "authorization outcome"],
    status: "ACTIVE"
  },
  {
    id: "TPL-IGSRT-ISO",
    name: "IGSRT Isodose Curve Support",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    category: "PLANNING",
    version: "v2.1",
    requiredFields: ["energy", "applicator", "depth of target", "isodose percentage"],
    status: "ACTIVE"
  },
  {
    id: "TPL-ARTH-MAP",
    name: "Arthritis X-ray Mapping Note",
    diagnosis: "ARTHRITIS",
    protocol: "Joint mapping",
    category: "CHART_PREP",
    version: "v1.0",
    requiredFields: ["joint space narrowing", "osteophyte", "sclerosis", "overall grade"],
    status: "ACTIVE"
  },
  {
    id: "TPL-TX-SUMMARY",
    name: "Treatment Summary",
    diagnosis: "ALL",
    protocol: "Post-TX",
    category: "POST_TX",
    version: "v1.3",
    requiredFields: ["fractions delivered", "summary status", "follow-up plan"],
    status: "ACTIVE"
  }
];

export const carepathTasks: CarepathTask[] = [
  {
    id: "TASK-2401-01",
    courseId: "COURSE-2401",
    taskNumber: "CP-08",
    title: "Weekly physics chart check",
    workflowPhase: "ON_TREATMENT",
    documentName: "Weekly Physics Chart Check Note",
    status: "NEEDS_REVIEW",
    responsibleParty: "PHYSICIST",
    timing: "Weekly during treatment",
    noteAction: "Review dose, images, and fraction progression",
    cptCodes: ["77300"],
    auditSteps: ["Physics review", "Rad Onc signature"],
    auditReady: false,
    dueDate: "2026-04-26",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    assignedUser: "Dr. V. Singh"
  },
  {
    id: "TASK-2401-02",
    courseId: "COURSE-2401",
    taskNumber: "CP-09",
    title: "OTV treatment management note",
    workflowPhase: "ON_TREATMENT",
    documentName: "OTV / Treatment Management Note",
    status: "IN_PROGRESS",
    responsibleParty: "RAD_ONC",
    timing: "Weekly",
    noteAction: "Complete management note and signature",
    cptCodes: ["77427"],
    auditSteps: ["Provider note", "Signature"],
    auditReady: false,
    dueDate: "2026-04-27",
    lastUpdatedAt: "2026-04-26T07:48:00+08:00",
    assignedUser: "Dr. Helena Cruz"
  },
  {
    id: "TASK-2402-01",
    courseId: "COURSE-2402",
    taskNumber: "CP-02",
    title: "Joint mapping assessment",
    workflowPhase: "CHART_PREP",
    documentName: "Arthritis X-ray Mapping Note",
    status: "PENDING",
    responsibleParty: "MA",
    timing: "Before simulation",
    noteAction: "Capture joint score and field design decision",
    cptCodes: ["N/A"],
    auditSteps: ["Mapping fields complete", "Provider review"],
    auditReady: false,
    dueDate: "2026-04-26",
    lastUpdatedAt: "2026-04-26T09:20:00+08:00",
    assignedUser: "Iris Lim"
  },
  {
    id: "TASK-2403-01",
    courseId: "COURSE-2403",
    taskNumber: "CP-12",
    title: "Treatment summary closure",
    workflowPhase: "POST_TX",
    documentName: "Treatment Summary",
    status: "COMPLETED",
    responsibleParty: "NP_PA",
    timing: "After final fraction",
    noteAction: "Prepare summary and follow-up plan",
    cptCodes: ["N/A"],
    auditSteps: ["Summary complete", "Export packet ready"],
    auditReady: true,
    completedAt: "2026-04-24T13:05:00+08:00",
    signedAt: "2026-04-24T14:05:00+08:00",
    lastUpdatedAt: "2026-04-25T14:15:00+08:00",
    assignedUser: "Tessa Nguyen"
  },
  {
    id: "TASK-2404-01",
    courseId: "COURSE-2404",
    taskNumber: "CP-06",
    title: "Special physics consult review",
    workflowPhase: "PLANNING",
    documentName: "Special Physics Consult Note",
    status: "BLOCKED",
    responsibleParty: "PHYSICIST",
    timing: "Before course can resume",
    noteAction: "Resolve review blocker and route for Rad Onc approval",
    cptCodes: ["77300"],
    auditSteps: ["Physics consult", "Rad Onc approval", "Hold release"],
    auditReady: false,
    dueDate: "2026-04-26",
    lastUpdatedAt: "2026-04-26T10:05:00+08:00",
    assignedUser: "Dr. V. Singh"
  },
  {
    id: "TASK-2405-01",
    courseId: "COURSE-2405",
    taskNumber: "CP-13",
    title: "Carepath audit note",
    workflowPhase: "POST_TX",
    documentName: "Carepath Audit Note",
    status: "NEEDS_REVIEW",
    responsibleParty: "ADMIN",
    timing: "Before audit closure",
    noteAction: "Confirm billing code references and document completion",
    cptCodes: ["77427"],
    auditSteps: ["Billing review", "Audit sign-off"],
    auditReady: false,
    dueDate: "2026-04-27",
    lastUpdatedAt: "2026-04-25T16:40:00+08:00",
    assignedUser: "Billing Queue"
  },
  {
    id: "TASK-2406-01",
    courseId: "COURSE-2406",
    taskNumber: "CP-03",
    title: "Simulation order",
    workflowPhase: "PLANNING",
    documentName: "Simulation Order",
    status: "PENDING",
    responsibleParty: "RAD_ONC",
    timing: "Before start date",
    noteAction: "Confirm simulation parameters and route for treatment planning",
    cptCodes: ["77280"],
    auditSteps: ["Order complete", "Signature"],
    auditReady: false,
    dueDate: "2026-04-28",
    lastUpdatedAt: "2026-04-24T11:35:00+08:00",
    assignedUser: "Dr. Priya Nair"
  }
];

export const generatedDocuments: GeneratedDocument[] = [
  {
    id: "DOC-2401-01",
    templateId: "TPL-IGSRT-ISO",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    name: "IGSRT Isodose Curve Support",
    clinicalPhase: "PLANNING",
    responsibleParty: "PHYSICIST",
    status: "SIGNED",
    requiredAction: "No action needed",
    cptCode: "77300",
    assignedTo: "Dr. V. Singh",
    lastUpdatedAt: "2026-04-22T13:10:00+08:00",
    signedAt: "2026-04-22T13:40:00+08:00",
    exportedAt: "2026-04-22T14:00:00+08:00",
    signReviewState: "SIGNED",
    auditReady: true
  },
  {
    id: "DOC-2401-02",
    templateId: "TPL-TX-SUMMARY",
    patientId: "CR-2401",
    courseId: "COURSE-2401",
    name: "OTV / Treatment Management Note",
    clinicalPhase: "ON_TREATMENT",
    responsibleParty: "RAD_ONC",
    status: "NEEDS_REVIEW",
    requiredAction: "Provider signature required",
    cptCode: "77427",
    assignedTo: "Dr. Helena Cruz",
    lastUpdatedAt: "2026-04-26T08:48:00+08:00",
    signReviewState: "REVIEW_REQUIRED",
    auditReady: false
  },
  {
    id: "DOC-2402-01",
    templateId: "TPL-ARTH-MAP",
    patientId: "CR-2402",
    courseId: "COURSE-2402",
    name: "Arthritis X-ray Mapping Note",
    clinicalPhase: "CHART_PREP",
    responsibleParty: "MA",
    status: "PENDING_NEEDED",
    requiredAction: "Capture scores and field decision",
    assignedTo: "Iris Lim",
    lastUpdatedAt: "2026-04-26T09:20:00+08:00",
    signReviewState: "NOT_STARTED",
    auditReady: false
  },
  {
    id: "DOC-2403-01",
    templateId: "TPL-TX-SUMMARY",
    patientId: "CR-2403",
    courseId: "COURSE-2403",
    name: "Treatment Summary",
    clinicalPhase: "POST_TX",
    responsibleParty: "NP_PA",
    status: "COMPLETED",
    requiredAction: "Export packet ready",
    assignedTo: "Tessa Nguyen",
    lastUpdatedAt: "2026-04-25T14:15:00+08:00",
    signedAt: "2026-04-25T14:18:00+08:00",
    exportedAt: "2026-04-25T14:30:00+08:00",
    signReviewState: "SIGNED",
    auditReady: true
  },
  {
    id: "DOC-2404-01",
    templateId: "TPL-IGSRT-ISO",
    patientId: "CR-2404",
    courseId: "COURSE-2404",
    name: "Special Physics Consult Note",
    clinicalPhase: "PLANNING",
    responsibleParty: "PHYSICIST",
    status: "NEEDS_REVIEW",
    requiredAction: "Resolve hold blocker",
    cptCode: "77300",
    assignedTo: "Dr. V. Singh",
    lastUpdatedAt: "2026-04-26T10:05:00+08:00",
    signReviewState: "REVIEW_REQUIRED",
    auditReady: false
  },
  {
    id: "DOC-2405-01",
    templateId: "TPL-TX-SUMMARY",
    patientId: "CR-2405",
    courseId: "COURSE-2405",
    name: "Carepath Audit Note",
    clinicalPhase: "POST_TX",
    responsibleParty: "ADMIN",
    status: "NEEDS_REVIEW",
    requiredAction: "Review CPT link and billing readiness",
    cptCode: "77427",
    assignedTo: "Billing Queue",
    lastUpdatedAt: "2026-04-25T16:40:00+08:00",
    signReviewState: "REVIEW_REQUIRED",
    auditReady: false
  },
  {
    id: "DOC-2406-01",
    templateId: "TPL-PREAUTH",
    patientId: "CR-2406",
    courseId: "COURSE-2406",
    name: "Construct Treatment Device Note",
    clinicalPhase: "PLANNING",
    responsibleParty: "RTT",
    status: "NOT_APPLICABLE",
    requiredAction: "Not applicable for selected setup",
    assignedTo: "Noel Rivera",
    lastUpdatedAt: "2026-04-24T11:35:00+08:00",
    signReviewState: "NOT_STARTED",
    auditReady: true
  },
  {
    id: "DOC-2406-02",
    templateId: "TPL-PREAUTH",
    patientId: "CR-2406",
    courseId: "COURSE-2406",
    name: "Simulation Order",
    clinicalPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    status: "PENDING_NEEDED",
    requiredAction: "Order and signature needed",
    cptCode: "77280",
    assignedTo: "Dr. Priya Nair",
    lastUpdatedAt: "2026-04-24T11:35:00+08:00",
    signReviewState: "READY_FOR_SIGNATURE",
    auditReady: false
  }
];

export const fractionLogEntries: FractionLogEntry[] = [
  {
    id: "FR-2401-01",
    courseId: "COURSE-2401",
    fractionNumber: 7,
    date: "2026-04-24",
    phase: "Phase I",
    energy: "50 kV",
    ssd: "15 cm",
    dosePerFraction: 250,
    cumulativeDose: 1750,
    technicianInitials: "NR",
    mdApproval: true,
    dotApproval: true,
    depthOfTarget: "4.0 mm",
    isodosePercent: 90,
    doseToDepth: 225,
    cumulativeDoseToDepth: 1575,
    notes: "Image guidance reviewed."
  },
  {
    id: "FR-2401-02",
    courseId: "COURSE-2401",
    fractionNumber: 8,
    date: "2026-04-26",
    phase: "Phase I",
    energy: "50 kV",
    ssd: "15 cm",
    dosePerFraction: 250,
    cumulativeDose: 2000,
    technicianInitials: "NR",
    mdApproval: false,
    dotApproval: true,
    depthOfTarget: "4.0 mm",
    isodosePercent: 90,
    doseToDepth: 225,
    cumulativeDoseToDepth: 1800,
    notes: "MD approval queued."
  },
  {
    id: "FR-2403-01",
    courseId: "COURSE-2403",
    fractionNumber: 10,
    date: "2026-04-12",
    phase: "Phase II",
    energy: "100 kV",
    ssd: "20 cm",
    dosePerFraction: 300,
    cumulativeDose: 3000,
    technicianInitials: "TN",
    mdApproval: true,
    dotApproval: true,
    depthOfTarget: "Palmar fascia",
    isodosePercent: 85,
    doseToDepth: 255,
    cumulativeDoseToDepth: 2550,
    notes: "Final fraction completed."
  }
];

export const appointments: Appointment[] = [
  {
    id: "APT-101",
    patientId: "CR-2401",
    patientName: "Avery Santos",
    title: "Weekly treatment review",
    time: "09:30",
    location: "Main Campus",
    staff: "Mika Alvarez",
    chartRoundsPhase: "ON_TREATMENT"
  },
  {
    id: "APT-102",
    patientId: "CR-2402",
    patientName: "Noah Tan",
    title: "X-ray mapping prep",
    time: "11:00",
    location: "North Suite",
    staff: "Iris Lim",
    chartRoundsPhase: "UPCOMING"
  },
  {
    id: "APT-103",
    patientId: "CR-2404",
    patientName: "Ethan Keller",
    title: "Hold review",
    time: "14:15",
    location: "East Wing",
    staff: "Dr. Helena Cruz",
    chartRoundsPhase: "ON_TREATMENT"
  }
];

export const priorityFlags: PriorityFlag[] = patients.flatMap((patient) =>
  patient.flags.map((flag) => ({
    id: flag.id,
    patientId: patient.id,
    patientName: `${patient.firstName} ${patient.lastName}`,
    severity: flag.severity,
    summary: flag.summary,
    owner: flag.owner,
    dueAt: flag.dueDate ? "Due soon" : "Monitor"
  }))
);

export const activities: Activity[] = [
  {
    id: "ACT-01",
    actor: "Mika Alvarez",
    action: "routed weekly physics chart check",
    target: "CR-2401",
    timestamp: "18 minutes ago"
  },
  {
    id: "ACT-02",
    actor: "Iris Lim",
    action: "added joint mapping blocker",
    target: "CR-2402",
    timestamp: "34 minutes ago"
  },
  {
    id: "ACT-03",
    actor: "System",
    action: "recalculated audit readiness",
    target: "Workflow dashboard",
    timestamp: "1 hour ago"
  },
  {
    id: "ACT-04",
    actor: "Billing Queue",
    action: "flagged CPT review",
    target: "CR-2405",
    timestamp: "2 hours ago"
  }
];

export const auditEvents: AuditEvent[] = [
  {
    id: "AUD-901",
    userId: "USR-12",
    userName: "Mika Alvarez",
    action: "Carepath task routed",
    entityType: "CAREPATH_TASK",
    entityId: "TASK-2401-01",
    previousValue: "In progress",
    newValue: "Needs review",
    timestamp: "2026-04-26 08:48",
    reason: "Weekly physics chart check requires review before audit closure."
  },
  {
    id: "AUD-902",
    userId: "USR-18",
    userName: "Iris Lim",
    action: "Document requirement updated",
    entityType: "DOCUMENT",
    entityId: "DOC-2402-01",
    previousValue: "Not started",
    newValue: "Pending / Needed",
    timestamp: "2026-04-26 09:20",
    reason: "Arthritis mapping note required before chart prep can complete."
  },
  {
    id: "AUD-903",
    userId: "USR-44",
    userName: "Billing Queue",
    action: "Billing readiness changed",
    entityType: "BILLING",
    entityId: "BC-77427",
    previousValue: "Ready",
    newValue: "Needs review",
    timestamp: "2026-04-25 16:40",
    reason: "Carepath audit note still requires CPT link verification."
  },
  {
    id: "AUD-904",
    userId: "USR-01",
    userName: "Clinical Admin",
    action: "Access view reviewed",
    entityType: "SYSTEM",
    entityId: "RBAC-PREVIEW",
    previousValue: "Dashboard only",
    newValue: "Workflow command center",
    timestamp: "2026-04-25 15:05",
    reason: "Role-based work queues added to frontend prototype."
  }
];
