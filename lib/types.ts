export type ChartRoundsPhase = "UPCOMING" | "ON_TREATMENT" | "POST";

export type CarepathWorkflowPhase =
  | "CONSULTATION"
  | "CHART_PREP"
  | "SIMULATION"
  | "PLANNING"
  | "ON_TREATMENT"
  | "POST_TX"
  | "AUDIT"
  | "CLOSED";

export type PatientStatus = "ACTIVE" | "ON_HOLD" | "PAUSED";

export type DiagnosisCategory = "SKIN_CANCER" | "ARTHRITIS" | "DUPUYTRENS";

export type TreatmentCourseStatus = "NOT_STARTED" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

export type CarepathTaskStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "IN_PROGRESS"
  | "NEEDS_REVIEW"
  | "READY_FOR_REVIEW"
  | "SIGNED"
  | "UPLOADED"
  | "COMPLETED"
  | "BLOCKED"
  | "OVERDUE"
  | "CLOSED"
  | "NOT_APPLICABLE";

export type DocumentStatus =
  | "DRAFT"
  | "NOT_STARTED"
  | "PENDING_NEEDED"
  | "PENDING"
  | "IN_PROGRESS"
  | "MISSING_FIELDS"
  | "READY_FOR_REVIEW"
  | "SIGNED"
  | "UPLOADED"
  | "EXPORTED"
  | "NOT_APPLICABLE"
  | "NEEDS_REVIEW"
  | "COMPLETED"
  | "BLOCKED"
  | "OVERDUE"
  | "CLOSED";

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
  | "BILLING"
  | "ADMIN";

export type UserRole = ResponsibleParty;

export type WorkflowItemStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "IN_PROGRESS"
  | "READY_FOR_REVIEW"
  | "SIGNED"
  | "UPLOADED"
  | "COMPLETED"
  | "NOT_APPLICABLE"
  | "BLOCKED"
  | "OVERDUE"
  | "CLOSED";

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
  patientId?: string;
  firstName: string;
  lastName: string;
  dob?: string;
  sex?: string;
  mrn: string;
  diagnosis: string;
  diagnosisSummary?: string;
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

export type Course = {
  id: string;
  patientId: string;
  courseNumber: string;
  diagnosisType: "Skin" | "Arthritis" | "Dupuytren's" | "Other";
  lesionNumber?: string;
  treatmentSite: string;
  laterality?: string;
  location: string;
  physicianId?: string;
  radOncId?: string;
  currentPhase: CarepathWorkflowPhase;
  simpleDashboardPhase: ChartRoundsPhase;
  status: WorkflowItemStatus;
  startDate?: string;
  endDate?: string;
  assignedStaff: string[];
  nextAction: string;
  flagsIssues: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowStep = {
  id: string;
  courseId: string;
  stepNumber: number;
  stepName: string;
  phase: CarepathWorkflowPhase;
  status: WorkflowItemStatus;
  responsibleRole: ResponsibleParty;
  assignedUserId?: string;
  triggerEvent: string;
  dueDate?: string;
  requiresSignature: boolean;
  signedByUserId?: string;
  signedAt?: string;
  linkedDocumentId?: string;
  naReason?: string;
  blockers: string[];
  auditChecklist: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  courseId: string;
  patientId: string;
  workflowStepId?: string;
  title: string;
  description: string;
  type:
    | "LAUNCH_DOCUMENT"
    | "FILL_CLINICAL_FORM"
    | "UPLOAD_IMAGE"
    | "REVIEW_PLAN"
    | "SIGN_DOCUMENT"
    | "COMPLETE_TREATMENT_FRACTION"
    | "WEEKLY_PHYSICS_CHECK"
    | "SCHEDULE_FOLLOW_UP"
    | "FINISH_AUDIT";
  status: WorkflowItemStatus;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignedRole: ResponsibleParty;
  assignedUserId?: string;
  dueDate?: string;
  completedAt?: string;
  linkedDocumentId?: string;
  linkedFormId?: string;
  linkedAppointmentId?: string;
  comments?: string[];
  createdAt: string;
  updatedAt: string;
};

export type OperationalPatient = {
  id: string;
  patientRef: string;
  phiRecordId: string;
  displayLabel: string;
  diagnosisCategory: DiagnosisCategory;
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
  assignedStaff: string;
  activeCourseId: string;
  activeCourseRef: string;
  nextActionCategory: string;
  flags: PatientFlag[];
  checklist: Checklist;
  lastUpdatedAt: string;
  restricted: true;
};

export type OperationalTreatmentCourse = {
  id: string;
  courseRef: string;
  patientRef: string;
  diagnosisCategory: DiagnosisCategory;
  protocolFamily: string;
  totalFractions: number;
  currentFraction: number;
  chartRoundsPhase: ChartRoundsPhase;
  status: TreatmentCourseStatus;
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
  diagnosisType?: Course["diagnosisType"];
  fileType?: "DOCX" | "PDF" | "PPTX" | "XLSX" | "GOOGLE_DOC" | "GOOGLE_SHEET" | "GOOGLE_SLIDE";
  templateStorageProvider?: "GOOGLE_DRIVE" | "APP_LIBRARY" | "LOCAL";
  templateFileIdOrPath?: string;
  active?: boolean;
};

export type DocumentInstance = {
  id: string;
  patientId: string;
  courseId: string;
  workflowStepId?: string;
  templateId?: string;
  title: string;
  category: string;
  status: WorkflowItemStatus;
  storageProvider: "GOOGLE_DRIVE" | "APP_STORAGE" | "EXTERNAL";
  fileIdOrPath?: string;
  previewUrl?: string;
  version: number;
  generatedAt?: string;
  generatedByUserId?: string;
  signedAt?: string;
  signedByUserId?: string;
  uploadedToEcwAt?: string;
  lockedAt?: string;
  naReason?: string;
};

export type ClinicalFormTemplate = {
  id: string;
  name: string;
  diagnosisType: Course["diagnosisType"] | "All";
  schema: FormTemplateSection[];
  active: boolean;
};

export type ClinicalFormResponse = {
  id: string;
  patientId: string;
  courseId: string;
  templateId: string;
  status: WorkflowItemStatus;
  responseData: Record<string, string | number | boolean | null>;
  generatedDocumentId?: string;
  signedByUserId?: string;
  signedAt?: string;
};

export type TreatmentPlan = {
  id: string;
  patientId: string;
  courseId: string;
  diagnosisType: Course["diagnosisType"];
  site: string;
  laterality?: string;
  energy?: string;
  applicatorSize?: string;
  depthOfInvasion?: string;
  totalDose?: string;
  dosePerFraction?: string;
  totalFractions?: number;
  phaseIParams?: string;
  phaseIIParams?: string;
  percentDepthDose?: number;
  doseToDepth?: string;
  coverage?: string;
  physicistReviewStatus: WorkflowItemStatus;
  radOncSignatureStatus: WorkflowItemStatus;
  lockedAt?: string;
};

export type TreatmentFraction = {
  id: string;
  courseId: string;
  fractionNumber: number;
  phase: string;
  treatmentDate: string;
  plannedDose: number;
  deliveredDose?: number;
  cumulativeDose: number;
  energy?: string;
  applicator?: string;
  imageGuidanceCompleted: boolean;
  status: WorkflowItemStatus;
  therapistId?: string;
  physicianReviewedAt?: string;
  notes?: string;
};

export type ImagingAsset = {
  id: string;
  patientId: string;
  courseId: string;
  category: string;
  phase: CarepathWorkflowPhase;
  fractionId?: string;
  fileIdOrPath?: string;
  previewUrl?: string;
  uploadedByUserId?: string;
  uploadedAt?: string;
  notes?: string;
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
  autoCreate?: boolean;
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
  courseId?: string;
  appointmentType?:
    | "CONSULT"
    | "MAPPING"
    | "SIMULATION"
    | "VERIFICATION_SIMULATION"
    | "TREATMENT_FRACTION"
    | "OTV"
    | "PHYSICS_CHECK"
    | "FOLLOW_UP";
  dateTime?: string;
  status?: "SCHEDULED" | "COMPLETED" | "MISSED" | "RESCHEDULED" | "CANCELLED";
  assignedProviderId?: string;
  linkedWorkflowStepId?: string;
  notes?: string;
};

export type BillingItem = {
  id: string;
  courseId: string;
  code: string;
  description: string;
  plannedQuantity: number;
  completedQuantity: number;
  billedQuantity: number;
  status: WorkflowItemStatus;
  linkedDocumentId?: string;
  notes?: string;
};

export type AuditCheck = {
  id: string;
  courseId: string;
  category: string;
  label: string;
  status: WorkflowItemStatus;
  required: boolean;
  evidenceDocumentId?: string;
  notes?: string;
  completedByUserId?: string;
  completedAt?: string;
  naReason?: string;
};

export type ActivityLog = {
  id: string;
  actorUserId: string;
  patientId?: string;
  courseId?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  roles: UserRole[];
  active: boolean;
};

export type OperationalAppointment = Omit<Appointment, "patientId" | "patientName"> & {
  patientRef: string;
  displayLabel: string;
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

export type OperationalPriorityFlag = Omit<PriorityFlag, "patientId" | "patientName"> & {
  patientRef: string;
  displayLabel: string;
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
  patientId?: string;
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

export type OperationalAuditEvent = Omit<AuditEvent, "previousValue" | "newValue"> & {
  patientRef?: string;
  previousValue: "PHI_REDACTED" | "NONE" | string;
  newValue: "PHI_REDACTED" | "NONE" | string;
  redacted: boolean;
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

export type OperationalWorkflowSnapshot = Omit<
  WorkflowSnapshot,
  "patients" | "treatmentCourses" | "appointments" | "priorityFlags" | "auditEvents"
> & {
  patients: OperationalPatient[];
  treatmentCourses: OperationalTreatmentCourse[];
  auditEvents: OperationalAuditEvent[];
};

export type IgsrtWorkspace = WorkflowSnapshot & {
  patient: Patient;
  course: TreatmentCourse;
  simulationOrder: SimulationOrder;
  prescription: Prescription;
  courseDocuments: GeneratedDocument[];
  courseFractions: FractionLogEntry[];
};
