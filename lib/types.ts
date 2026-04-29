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
  | "DRAFT"
  | "PENDING_NEEDED"
  | "MISSING_FIELDS"
  | "READY_FOR_REVIEW"
  | "SIGNED"
  | "EXPORTED"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW"
  | "COMPLETED";

export type BillingReadinessStatus = "READY" | "NEEDS_REVIEW" | "BLOCKED" | "NOT_APPLICABLE";

export type TemplateSourceStatus =
  | "ACTIVE"
  | "DRAFT"
  | "RETIRED"
  | "MISSING"
  | "MAPPING_IN_PROGRESS";

export type TemplateSourceMimeType = "DOCX" | "XLSX" | "PPTX" | "FOLDER" | "UNKNOWN";

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

export type TemplateSource = {
  id: string;
  name: string;
  sourceFileName: string;
  driveFileId?: string;
  driveUrl?: string;
  mimeType: TemplateSourceMimeType;
  status: TemplateSourceStatus;
  notes?: string;
  modifiedAt?: string;
};

export type DocumentApplicability = {
  diagnosis: DiagnosisCategory | "ALL";
  protocol?: string;
  bodyRegion?: string;
  treatmentModality?: string;
  universal?: boolean;
  requiredWhen?: string;
};

export type DocumentRequirement = {
  id: string;
  name: string;
  workflowPhase: CarepathWorkflowPhase;
  responsibleParty: ResponsibleParty;
  applicability: DocumentApplicability;
  templateSourceId?: string;
  defaultStatus: DocumentStatus;
  requiredAction: string;
  requiredFields: string[];
  outputFormats: Array<"DOCX" | "PDF" | "XLSX" | "PPTX">;
  cptCode?: string;
  createsTask: boolean;
  taskTitle?: string;
  taskNumber?: string;
  timing?: string;
  auditSteps?: string[];
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  diagnosis: DiagnosisCategory | "ALL";
  protocol: string;
  description: string;
  phases: CarepathWorkflowPhase[];
  documentRequirementIds: string[];
  status: "ACTIVE" | "DRAFT" | "MAPPING_IN_PROGRESS";
};

export type WorkflowDocumentState = {
  requirementId: string;
  documentId?: string;
  patientId: string;
  courseId: string;
  name: string;
  workflowPhase: CarepathWorkflowPhase;
  responsibleParty: ResponsibleParty;
  status: DocumentStatus;
  requiredAction: string;
  auditReady: boolean;
  templateSourceStatus?: TemplateSourceStatus;
  sourceDriveUrl?: string;
  mapped: boolean;
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

export type FormFieldKind = "text" | "number" | "date" | "select" | "checkbox" | "textarea";

export type FormTemplateField = {
  id: string;
  label: string;
  kind: FormFieldKind;
  required: boolean;
  placeholder?: string;
  options?: string[];
};

export type FormTemplateSection = {
  id: string;
  title: string;
  fields: FormTemplateField[];
};

export type InternalFormTemplate = {
  id: string;
  name: string;
  diagnosis: DiagnosisCategory | "ALL";
  protocol: string;
  sourceDriveFileId: string;
  sourceDriveUrl: string;
  sourceFileName: string;
  outputFormats: Array<"DOCX" | "PDF" | "XLSX">;
  sections: FormTemplateSection[];
};

export type SimulationOrder = {
  id: string;
  patientId: string;
  courseId: string;
  lesionLocation: string;
  laterality: string;
  lesionBorderInked: boolean;
  allMarginsInked: boolean;
  phaseIMarginInstruction: string;
  phaseIIMarginInstruction: string;
  chairSetup: string;
  position: string;
  setupPhotoChecklist: string[];
  ultrasoundFrequencies: string[];
  specialPhysicsRequired: boolean;
  specialPhysicsReason: string;
  weeklyPhysicsRequired: boolean;
  weeklyPhysicsReason: string;
  inVivoDosimetryRequired: boolean;
  radiationOncologist: string;
  dateCompleted: string | null;
  signedAt?: string;
  status: "DRAFT" | "MISSING_FIELDS" | "READY_FOR_REVIEW" | "SIGNED";
  lastUpdatedAt: string;
};

export type PrescriptionPhase = {
  id: string;
  phaseName: "Phase I" | "Phase II" | "Phase III" | "Phase IV";
  energyKv: number;
  phaseTotalDoseGy: number;
  dosePerFractionGy: number;
  totalFractions: number;
  timeMinutes: number;
  ssdCm: number;
  applicatorSize: string;
  marginMm: number;
  technique: string;
  shieldingDesign: string;
  depthOfTargetMm: number;
};

export type Prescription = {
  id: string;
  patientId: string;
  courseId: string;
  site: string;
  laterality: string;
  verifiedInSensus: boolean;
  phases: PrescriptionPhase[];
  imagingGuidance: string[];
  priorRadiationTherapy: boolean;
  preAuthorized: boolean;
  signedAt?: string;
  dateOrdered: string | null;
  status: "DRAFT" | "MISSING_FIELDS" | "READY_FOR_REVIEW" | "SIGNED";
  lastUpdatedAt: string;
};

export type MappingRecord = {
  id: string;
  patientId: string;
  courseId: string;
  diagnosis: DiagnosisCategory;
  bodySite: string;
  laterality: string;
  impressions: string;
  fieldDesignDecision: string;
  status: "DRAFT" | "READY_FOR_REVIEW" | "SIGNED";
  lastUpdatedAt: string;
};

export type GeneratedDocumentOutput = {
  id: string;
  documentId: string;
  patientId: string;
  courseId: string;
  format: "DOCX" | "PDF" | "XLSX";
  version: number;
  status: "DRAFT" | "READY" | "EXPORTED";
  driveFileUrl?: string;
  contentPreview: string;
  renderedAt: string;
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
  entityType:
    | "PATIENT"
    | "COURSE"
    | "CAREPATH_TASK"
    | "DOCUMENT"
    | "FRACTION_LOG"
    | "BILLING"
    | "SIMULATION_ORDER"
    | "PRESCRIPTION"
    | "MAPPING_RECORD"
    | "SYSTEM";
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

export type AnalyticsInsightCategory =
  | "WORKFLOW_BOTTLENECK"
  | "DOCUMENT_LIFECYCLE"
  | "AUDIT_RISK"
  | "ROLE_CAPACITY"
  | "DIAGNOSIS_PATTERN"
  | "AUTOMATION_OPPORTUNITY";

export type AnalyticsInsightSeverity = "LOW" | "MEDIUM" | "HIGH";

export type AnalyticsInsight = {
  id: string;
  title: string;
  category: AnalyticsInsightCategory;
  severity: AnalyticsInsightSeverity;
  summary: string;
  evidence: string;
  recommendation: string;
  solutionOpportunity: string;
};

export type WorkflowSnapshot = {
  patients: Patient[];
  treatmentCourses: TreatmentCourse[];
  carepathTasks: CarepathTask[];
  generatedDocuments: GeneratedDocument[];
  fractionLogEntries: FractionLogEntry[];
  billingCodes: BillingCode[];
  documentTemplates: DocumentTemplate[];
  internalFormTemplates: InternalFormTemplate[];
  templateSources: TemplateSource[];
  documentRequirements: DocumentRequirement[];
  workflowDefinitions: WorkflowDefinition[];
  workflowDocumentStates: WorkflowDocumentState[];
  simulationOrders: SimulationOrder[];
  prescriptions: Prescription[];
  mappingRecords: MappingRecord[];
  generatedDocumentOutputs: GeneratedDocumentOutput[];
  auditEvents: AuditEvent[];
};

export type IgsrtWorkspace = WorkflowSnapshot & {
  patient: Patient;
  course: TreatmentCourse;
  simulationOrder: SimulationOrder;
  prescription: Prescription;
  courseDocuments: GeneratedDocument[];
  courseFractions: FractionLogEntry[];
};
