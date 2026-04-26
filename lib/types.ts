export type ChartRoundsPhase = "UPCOMING" | "ON_TREATMENT" | "POST";

export type CarepathWorkflowPhase =
  | "CONSULTATION"
  | "CHART_PREP"
  | "PLANNING"
  | "ON_TREATMENT"
  | "POST_TX";

export type PatientStatus = "ACTIVE" | "ON_HOLD" | "PAUSED";

export type DiagnosisCategory = "SKIN_CANCER" | "ARTHRITIS" | "DUPUYTRENS";

export type TreatmentCourseStatus = "NOT_STARTED" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

export type CarepathTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "NEEDS_REVIEW"
  | "COMPLETED"
  | "BLOCKED"
  | "NOT_APPLICABLE";

export type DocumentStatus =
  | "PENDING_NEEDED"
  | "SIGNED"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW"
  | "COMPLETED";

export type BillingReadinessStatus = "READY" | "NEEDS_REVIEW" | "BLOCKED" | "NOT_APPLICABLE";

export type ResponsibleParty =
  | "VA"
  | "MA"
  | "RTT"
  | "NP_PA"
  | "PCP"
  | "RAD_ONC"
  | "PHYSICIST"
  | "ADMIN";

export type FlagSeverity = "LOW" | "MEDIUM" | "HIGH";

export type Checklist = {
  txSummaryComplete: boolean;
  followUpScheduled: boolean;
  billingComplete: boolean;
};

export type PatientFlag = {
  id: string;
  severity: FlagSeverity;
  summary: string;
  owner: ResponsibleParty;
  dueDate?: string;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  diagnosis: string;
  diagnosisCategory: DiagnosisCategory;
  location: string;
  physician: string;
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
  assignedStaff: string;
  activeCourseId: string;
  nextAction: string;
  flags: PatientFlag[];
  notes: string;
  checklist: Checklist;
  lastUpdatedAt: string;
};

export type TreatmentCourse = {
  id: string;
  patientId: string;
  diagnosis: string;
  diagnosisCategory: DiagnosisCategory;
  protocolName: string;
  totalFractions: number;
  currentFraction: number;
  startDate: string;
  endDate: string | null;
  chartRoundsPhase: ChartRoundsPhase;
  status: TreatmentCourseStatus;
  treatmentModality: string;
  treatmentType: string;
  phaseOne?: string;
  phaseTwo?: string;
  energy?: string;
  applicator?: string;
  dose?: string;
  targetDepth?: string;
  fieldDesign?: string;
  notes: string;
};

export type BillingCode = {
  id: string;
  code: string;
  description: string;
  frequency: string;
  purpose: "ORDERS_WORK" | "JUSTIFIES_WORK_DONE" | "REFERENCE_ONLY";
  readinessStatus: BillingReadinessStatus;
};

export type CarepathTask = {
  id: string;
  courseId: string;
  taskNumber: string;
  title: string;
  workflowPhase: CarepathWorkflowPhase;
  documentName: string;
  status: CarepathTaskStatus;
  responsibleParty: ResponsibleParty;
  timing: string;
  noteAction: string;
  cptCodes: string[];
  auditSteps: string[];
  auditReady: boolean;
  dueDate?: string;
  completedAt?: string;
  signedAt?: string;
  lastUpdatedAt: string;
  assignedUser: string;
};

export type DocumentTemplate = {
  id: string;
  name: string;
  diagnosis: DiagnosisCategory | "ALL";
  protocol: string;
  category: CarepathWorkflowPhase;
  version: string;
  requiredFields: string[];
  status: "ACTIVE" | "DRAFT" | "RETIRED";
};

export type GeneratedDocument = {
  id: string;
  templateId: string;
  patientId: string;
  courseId: string;
  name: string;
  clinicalPhase: CarepathWorkflowPhase;
  responsibleParty: ResponsibleParty;
  status: DocumentStatus;
  requiredAction: string;
  cptCode?: string;
  assignedTo: string;
  lastUpdatedAt: string;
  signedAt?: string;
  exportedAt?: string;
  signReviewState: "NOT_STARTED" | "READY_FOR_SIGNATURE" | "SIGNED" | "REVIEW_REQUIRED";
  auditReady: boolean;
};

export type FractionLogEntry = {
  id: string;
  courseId: string;
  fractionNumber: number;
  date: string;
  phase: string;
  energy: string;
  ssd: string;
  dosePerFraction: number;
  cumulativeDose: number;
  technicianInitials: string;
  mdApproval: boolean;
  dotApproval: boolean;
  depthOfTarget: string;
  isodosePercent: number;
  doseToDepth: number;
  cumulativeDoseToDepth: number;
  notes: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  time: string;
  location: string;
  staff: string;
  chartRoundsPhase: ChartRoundsPhase;
};

export type PriorityFlag = {
  id: string;
  patientId: string;
  patientName: string;
  severity: FlagSeverity;
  summary: string;
  owner: ResponsibleParty;
  dueAt: string;
};

export type Activity = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
};

export type AuditEvent = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: "PATIENT" | "COURSE" | "CAREPATH_TASK" | "DOCUMENT" | "FRACTION_LOG" | "BILLING" | "SYSTEM";
  entityId: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
  reason?: string;
};

export type RoleQueueItem = {
  responsibleParty: ResponsibleParty;
  assignedTasks: number;
  pendingDocuments: number;
  reviewItems: number;
  overdueActions: number;
  completedActions: number;
};
