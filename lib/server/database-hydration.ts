import 'server-only';

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  auditEvents,
  carepathTasks,
  clinicalFormResponses,
  defaultRequirementIdsForStep,
  fractionLogEntries,
  generatedDocumentOutputs,
  generatedDocuments,
  mappingRecords,
  patientCourseAuditChecks,
  patientCourseWorkflowSteps,
  patients,
  prescriptions,
  priorityFlags,
  simulationOrders,
  treatmentCourses,
  treatmentFractions,
} from '@/lib/clinical-store';
import { carepathStepApplicability } from '@/lib/workflow';
import type {
  AuditCheck,
  AuditEvent,
  CarepathTask,
  CarepathWorkflowPhase,
  ChartRoundsPhase,
  ClinicalFormResponse,
  DiagnosisCategory,
  DocumentStatus,
  FractionLogEntry,
  GeneratedDocument,
  GeneratedDocumentOutput,
  MappingRecord,
  Patient,
  PatientFlag,
  PatientStatus,
  Prescription,
  PrescriptionPhase,
  PrototypeAccessRole,
  ResponsibleParty,
  SimulationOrder,
  TreatmentCourse,
  TreatmentCourseStatus,
  TreatmentFraction,
  WorkflowStep,
} from '@/lib/types';

type PrismaDelegate<T> = {
  findMany(args?: unknown): Promise<T[]>;
};

type PrismaClientLike = Record<string, unknown> & {
  $disconnect(): Promise<void>;
};

type OpsPatientRow = {
  patientRef: string;
  phiRecordId: string;
  displayLabel: string;
  diagnosisCategory: DiagnosisCategory;
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
  assignedStaff: string;
  activeCourseRef: string | null;
  nextActionCategory: string;
  checklist: unknown;
  lastUpdatedAt: Date;
};

type OpsCourseRow = {
  courseRef: string;
  patientRef: string;
  diagnosisCategory: DiagnosisCategory;
  protocolFamily: string;
  workflowDefinitionId: string | null;
  bodyRegion: string | null;
  laterality: string | null;
  totalFractions: number;
  currentFraction: number;
  chartRoundsPhase: ChartRoundsPhase;
  status: TreatmentCourseStatus;
  coursePhase: CarepathWorkflowPhase | null;
};

type OpsTaskRow = {
  id: string;
  courseRef: string;
  taskNumber: string;
  title: string;
  workflowPhase: CarepathWorkflowPhase;
  documentName: string;
  status: CarepathTask['status'];
  responsibleParty: ResponsibleParty;
  timing: string;
  noteAction: string;
  cptCodes: string[];
  auditSteps: string[];
  auditReady: boolean;
  dueDate: Date | null;
  completedAt: Date | null;
  signedAt: Date | null;
  lastUpdatedAt: Date;
  assignedUser: string;
};

type OpsDocumentRow = {
  id: string;
  templateId: string;
  patientRef: string;
  courseRef: string;
  name: string;
  clinicalPhase: CarepathWorkflowPhase;
  responsibleParty: ResponsibleParty;
  status: DocumentStatus;
  requiredAction: string;
  cptCode: string | null;
  assignedTo: string;
  lastUpdatedAt: Date;
  signedAt: Date | null;
  exportedAt: Date | null;
  signReviewState: GeneratedDocument['signReviewState'];
  auditReady: boolean;
};

type OpsWorkflowStepRow = {
  id: string;
  courseRef: string;
  workflowDefinitionId: string;
  stepNumber: number;
  stepName: string;
  phase: CarepathWorkflowPhase;
  status: WorkflowStep['status'];
  applicability: WorkflowStep['applicability'] | null;
  requirementIds: unknown;
  responsibleRole: ResponsibleParty;
  assignedUserId: string | null;
  triggerEvent: string;
  dueDate: Date | null;
  requiresSignature: boolean;
  signedByUserId: string | null;
  signedAt: Date | null;
  linkedDocumentId: string | null;
  naReason: string | null;
  systemReason: string | null;
  blockers: string[];
  auditChecklist: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type OpsAuditCheckRow = {
  id: string;
  courseRef: string;
  category: string;
  label: string;
  status: AuditCheck['status'];
  required: boolean;
  evidenceDocumentId: string | null;
  notes: string | null;
  completedByUserId: string | null;
  completedAt: Date | null;
  naReason: string | null;
};

type OpsAuditEventRow = {
  id: string;
  patientRef: string | null;
  userId: string;
  userName: string;
  role: PrototypeAccessRole | null;
  sessionId: string | null;
  ipAddress: string | null;
  deviceId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  timestamp: Date;
  reason: string | null;
};

type PhiPatientRow = {
  id: string;
  patientRef: string;
  phiRecordId: string;
  firstName: string;
  lastName: string;
  mrn: string | null;
  diagnosis: string;
  diagnosisCategory: DiagnosisCategory;
  location: string;
  physician: string;
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
  assignedStaff: string;
  activeCourseId: string;
  nextAction: string;
  flags: unknown;
  notes: string;
  checklist: unknown;
  lastUpdatedAt: Date;
};

type PhiCourseRow = {
  id: string;
  courseRef: string;
  patientId: string;
  diagnosis: string;
  diagnosisCategory: DiagnosisCategory;
  protocolName: string;
  totalFractions: number;
  currentFraction: number;
  startDate: Date;
  endDate: Date | null;
  chartRoundsPhase: ChartRoundsPhase;
  status: TreatmentCourseStatus;
  treatmentModality: string;
  treatmentType: string;
  workflowDefinitionId: string | null;
  bodyRegion: string | null;
  laterality: string | null;
  coursePhase: CarepathWorkflowPhase | null;
  phaseOne: string | null;
  phaseTwo: string | null;
  energy: string | null;
  applicator: string | null;
  dose: string | null;
  targetDepth: string | null;
  fieldDesign: string | null;
  notes: string;
};

type PhiSimulationOrderRow = {
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
  dateCompleted: Date | null;
  signedAt: Date | null;
  status: SimulationOrder['status'];
  lastUpdatedAt: Date;
};

type PhiPrescriptionRow = {
  id: string;
  patientId: string;
  courseId: string;
  site: string;
  laterality: string;
  verifiedInSensus: boolean;
  imagingGuidance: string[];
  priorRadiationTherapy: boolean;
  preAuthorized: boolean;
  signedAt: Date | null;
  dateOrdered: Date | null;
  status: Prescription['status'];
  lastUpdatedAt: Date;
};

type PhiPrescriptionPhaseRow = {
  id: string;
  prescriptionId: string;
  phaseName: PrescriptionPhase['phaseName'];
  energyKv: number;
  phaseTotalDoseGy: unknown;
  dosePerFractionGy: unknown;
  totalFractions: number;
  timeMinutes: unknown;
  ssdCm: unknown;
  applicatorSize: string;
  marginMm: number;
  technique: string;
  shieldingDesign: string;
  depthOfTargetMm: unknown;
  skinSurfaceDoseCgy: number | null;
};

type PhiMappingRecordRow = {
  id: string;
  patientId: string;
  courseId: string;
  diagnosis: DiagnosisCategory;
  bodySite: string;
  laterality: string;
  impressions: string;
  fieldDesignDecision: string;
  status: MappingRecord['status'];
  lastUpdatedAt: Date;
};

type PhiClinicalResponseRow = {
  id: string;
  patientId: string;
  courseId: string;
  requirementId: string;
  templateId: string;
  status: ClinicalFormResponse['status'];
  responseData: unknown;
  generatedDocumentId: string | null;
  signedByUserId: string | null;
  signedAt: Date | null;
  updatedAt: Date;
};

type PhiTreatmentFractionRow = {
  id: string;
  courseId: string;
  fractionNumber: number;
  phase: string;
  treatmentDate: Date;
  plannedDose: number;
  deliveredDose: number | null;
  cumulativeDose: number;
  energy: string | null;
  applicator: string | null;
  imageGuidanceCompleted: boolean;
  imageGuidanceStatus: TreatmentFraction['imageGuidanceStatus'] | null;
  imageAssetIds: string[];
  imageGuidanceNotApplicableReason: string | null;
  scheduledFromPrescription: boolean;
  sourcePrescriptionId: string | null;
  sourcePhaseId: string | null;
  linkedFractionLogEntryId: string | null;
  physicsCheckRequired: boolean;
  physicsCheckCompletedAt: Date | null;
  physicsCheckCompletedByUserId: string | null;
  otvRequired: boolean;
  otvCompletedAt: Date | null;
  otvCompletedByUserId: string | null;
  generatedAt: Date | null;
  lockedAt: Date | null;
  status: TreatmentFraction['status'];
  therapistId: string | null;
  physicianReviewedAt: Date | null;
  notes: string | null;
};

type PhiGeneratedOutputRow = {
  id: string;
  documentId: string;
  patientId: string;
  courseId: string;
  format: GeneratedDocumentOutput['format'];
  version: number;
  status: GeneratedDocumentOutput['status'];
  driveFileUrl: string | null;
  storageProvider: GeneratedDocumentOutput['storageProvider'] | null;
  storageKey: string | null;
  contentPreview: string;
  renderedAt: Date;
  renderedByUserId: string | null;
};

type PhiFractionRow = {
  id: string;
  courseId: string;
  fractionNumber: number;
  status: FractionLogEntry['status'];
  date: Date;
  phase: string;
  energy: string;
  energyKv: number | null;
  ssd: string;
  ssdCm: unknown;
  fieldSizeCm: string | null;
  treatmentTimeMinutes: unknown;
  dosePerFraction: number;
  dosePerFractionCgy: number | null;
  cumulativeDose: number;
  cumulativeDoseCgy: unknown;
  technicianInitials: string;
  mdApproval: boolean;
  mdApprovalState: FractionLogEntry['mdApprovalState'] | null;
  mdApprovedAt: Date | null;
  mdApprovedByUserId: string | null;
  dotApproval: boolean;
  dotApprovalState: FractionLogEntry['dotApprovalState'] | null;
  dotApprovedAt: Date | null;
  dotApprovedByUserId: string | null;
  depthOfTarget: string;
  depthOfTargetMm: unknown;
  isodosePercent: number;
  isodoseToDotPercent: unknown;
  doseToDepth: number;
  doseToDotCgy: unknown;
  cumulativeDoseToDepth: number;
  cumulativeDoseToDotCgy: unknown;
  treatmentSetupComments: string | null;
  isodoseOverrideReason: string | null;
  calculationStatus: FractionLogEntry['calculationStatus'] | null;
  calculationReferenceVersion: string | null;
  calculationSourceTemplate: string | null;
  calculationSourceTabs: string[];
  calculationDepthRoundedMm: unknown;
  calculationLookupKey: string | null;
  calculationClinicalValidationRequired: boolean;
  calculationWarnings: string[];
  isodoseNote: string | null;
  revisionApprovalType: FractionLogEntry['revisionApprovalType'] | null;
  revisionReason: string | null;
  revisionRequestedAt: Date | null;
  revisionRequestedByUserId: string | null;
  voidReason: string | null;
  voidedAt: Date | null;
  voidedByUserId: string | null;
  correctionReason: string | null;
  correctedAt: Date | null;
  correctedByUserId: string | null;
  skinSurfaceDoseCgy: number | null;
  cumulativeSkinSurfaceDoseCgy: number | null;
  prescriptionMismatchFields: unknown;
  prescriptionOverrideReason: string | null;
  notes: string;
};

type HydrationSource = 'cache' | 'memory' | 'empty-database' | 'postgres' | 'memory-fallback';

type HydrationCacheState = {
  hydrated: boolean;
  source?: HydrationSource;
  checkedAt?: number;
};

const hydrationCacheKey = Symbol.for('curerays.databaseHydrationState');
const hydrationRetryMs = 60_000;

const hydrationCache = ((globalThis as typeof globalThis & {
  [hydrationCacheKey]?: HydrationCacheState;
})[hydrationCacheKey] ??= { hydrated: false });

let hydrated = false;

function loadClient(moduleName: '.prisma/ops-client' | '.prisma/phi-client'): PrismaClientLike {
  const requireFn = eval('require') as NodeRequire;
  const moduleValue = requireFn(moduleName) as { PrismaClient?: new () => PrismaClientLike };
  if (!moduleValue.PrismaClient) {
    throw new Error('Prisma client is unavailable.');
  }

  return new moduleValue.PrismaClient();
}

function delegate<T>(client: PrismaClientLike, name: string): PrismaDelegate<T> {
  const value = client[name];
  if (!value || typeof value !== 'object') {
    throw new Error('Prisma delegate is unavailable.');
  }

  return value as PrismaDelegate<T>;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function numberValue(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function checklist(value: unknown): Patient['checklist'] {
  if (!value || typeof value !== 'object') {
    return { txSummaryComplete: false, followUpScheduled: false, billingComplete: false };
  }

  const record = value as Partial<Patient['checklist']>;
  return {
    txSummaryComplete: record.txSummaryComplete === true,
    followUpScheduled: record.followUpScheduled === true,
    billingComplete: record.billingComplete === true,
  };
}

function flags(value: unknown): PatientFlag[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PatientFlag => {
    if (!item || typeof item !== 'object') return false;
    const record = item as Partial<PatientFlag>;
    return Boolean(record.id && record.severity && record.summary && record.owner);
  });
}

function courseIdFromRef(courseRef: string) {
  return courseRef.replace(/^COURSE-/, 'COURSE-');
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function replaceArray<T>(target: T[], rows: T[]) {
  target.splice(0, target.length, ...rows);
}

function parseJsonRows<T>(value: string): T[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  return JSON.parse(trimmed, (_key, item) => {
    if (typeof item === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(item)) {
      return new Date(item);
    }
    return item;
  }) as T[];
}

function windowsProjectPath(path: string) {
  if (!path.startsWith('/mnt/c/')) return path;
  return `C:${path.slice('/mnt/c'.length).replaceAll('/', '\\')}`;
}

function queryViaWindowsPsql<T>(database: 'curerays_ops' | 'curerays_phi', user: string, password: string, sql: string): T[] {
  const dir = join(tmpdir(), 'curerays-psql');
  mkdirSync(dir, { recursive: true });
  const stamp = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sqlPath = join(dir, `${stamp}.sql`);
  const outPath = join(dir, `${stamp}.out`);
  const errPath = join(dir, `${stamp}.err`);
  writeFileSync(sqlPath, sql, 'utf8');

  const psScript = [
    `$env:PGPASSWORD='${password.replaceAll("'", "''")}'`,
    `$out='${windowsProjectPath(outPath).replaceAll("'", "''")}'`,
    `$err='${windowsProjectPath(errPath).replaceAll("'", "''")}'`,
    `$args='-h localhost -p 5432 -U ${user} -d ${database} -t -A -v ON_ERROR_STOP=1 -f "${windowsProjectPath(sqlPath)}"'`,
    `$p=Start-Process -FilePath 'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe' -ArgumentList $args -NoNewWindow -Wait -PassThru -RedirectStandardOutput $out -RedirectStandardError $err`,
    'if ($p.ExitCode -ne 0) { Get-Content $err -ErrorAction SilentlyContinue; exit $p.ExitCode }',
  ].join('; ');

  try {
    execFileSync('powershell.exe', ['-NoProfile', '-Command', psScript], { stdio: 'pipe' });
    return parseJsonRows<T>(readFileSync(outPath, 'utf8'));
  } finally {
    for (const path of [sqlPath, outPath, errPath]) {
      rmSync(path, { force: true });
    }
  }
}

function jsonSelect(table: string, orderBy: string) {
  return `SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)::text FROM (SELECT * FROM "${table}" ORDER BY ${orderBy}) t;`;
}

async function loadRowsWithWindowsFallback() {
  const opsPassword = 'curerays_dev_password';
  const phiPassword = 'curerays_dev_password';

  return Promise.resolve({
    opsPatients: queryViaWindowsPsql<OpsPatientRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalPatient', '"patientRef" ASC')),
    opsCourses: queryViaWindowsPsql<OpsCourseRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalCourse', '"courseRef" ASC')),
    workflowSteps: queryViaWindowsPsql<OpsWorkflowStepRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalWorkflowStep', '"courseRef" ASC, "stepNumber" ASC')),
    auditChecks: queryViaWindowsPsql<OpsAuditCheckRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalAuditCheck', '"id" ASC')),
    tasks: queryViaWindowsPsql<OpsTaskRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('CarepathTask', '"id" ASC')),
    documents: queryViaWindowsPsql<OpsDocumentRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('GeneratedDocument', '"id" ASC')),
    opsAuditEvents: queryViaWindowsPsql<OpsAuditEventRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalAuditEvent', '"timestamp" DESC')),
    phiPatients: queryViaWindowsPsql<PhiPatientRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('PatientPhi', '"patientRef" ASC')),
    phiCourses: queryViaWindowsPsql<PhiCourseRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('TreatmentCoursePhi', '"courseRef" ASC')),
    phiSimulationOrders: queryViaWindowsPsql<PhiSimulationOrderRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('SimulationOrderPhi', '"id" ASC')),
    phiPrescriptions: queryViaWindowsPsql<PhiPrescriptionRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('PrescriptionPhi', '"id" ASC')),
    phiPrescriptionPhases: queryViaWindowsPsql<PhiPrescriptionPhaseRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('PrescriptionPhasePhi', '"id" ASC')),
    phiMappingRecords: queryViaWindowsPsql<PhiMappingRecordRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('MappingRecordPhi', '"id" ASC')),
    phiClinicalResponses: queryViaWindowsPsql<PhiClinicalResponseRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('ClinicalFormResponsePhi', '"id" ASC')),
    phiTreatmentFractions: queryViaWindowsPsql<PhiTreatmentFractionRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('TreatmentFractionPhi', '"courseId" ASC, "fractionNumber" ASC')),
    phiFractions: queryViaWindowsPsql<PhiFractionRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('FractionLogEntryPhi', '"courseId" ASC, "fractionNumber" ASC')),
    phiGeneratedOutputs: queryViaWindowsPsql<PhiGeneratedOutputRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('GeneratedDocumentOutputPhi', '"id" ASC')),
  });
}

function mapPatient(row: PhiPatientRow): Patient {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    mrn: row.mrn ?? "",
    diagnosis: row.diagnosis,
    diagnosisCategory: row.diagnosisCategory,
    location: row.location,
    physician: row.physician,
    chartRoundsPhase: row.chartRoundsPhase,
    status: row.status,
    assignedStaff: row.assignedStaff,
    activeCourseId: row.activeCourseId,
    nextAction: row.nextAction,
    flags: flags(row.flags),
    notes: row.notes,
    checklist: checklist(row.checklist),
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
  };
}

function mapCourse(row: PhiCourseRow): TreatmentCourse {
  return {
    id: row.id,
    patientId: row.patientId,
    diagnosis: row.diagnosis,
    diagnosisCategory: row.diagnosisCategory,
    protocolName: row.protocolName,
    totalFractions: row.totalFractions,
    currentFraction: row.currentFraction,
    startDate: row.startDate.toISOString().slice(0, 10),
    endDate: row.endDate ? row.endDate.toISOString().slice(0, 10) : null,
    chartRoundsPhase: row.chartRoundsPhase,
    status: row.status,
    treatmentModality: row.treatmentModality,
    treatmentType: row.treatmentType,
    workflowDefinitionId: row.workflowDefinitionId ?? undefined,
    bodyRegion: row.bodyRegion ?? undefined,
    laterality: row.laterality ?? undefined,
    coursePhase: row.coursePhase ?? undefined,
    phaseOne: row.phaseOne ?? undefined,
    phaseTwo: row.phaseTwo ?? undefined,
    energy: row.energy ?? undefined,
    applicator: row.applicator ?? undefined,
    dose: row.dose ?? undefined,
    targetDepth: row.targetDepth ?? undefined,
    fieldDesign: row.fieldDesign ?? undefined,
    notes: row.notes,
  };
}

function mapTask(row: OpsTaskRow): CarepathTask {
  return {
    id: row.id,
    courseId: courseIdFromRef(row.courseRef),
    taskNumber: row.taskNumber,
    title: row.title,
    workflowPhase: row.workflowPhase,
    documentName: row.documentName,
    status: row.status,
    responsibleParty: row.responsibleParty,
    timing: row.timing,
    noteAction: row.noteAction,
    cptCodes: row.cptCodes,
    auditSteps: row.auditSteps,
    auditReady: row.auditReady,
    dueDate: iso(row.dueDate),
    completedAt: iso(row.completedAt),
    signedAt: iso(row.signedAt),
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
    assignedUser: row.assignedUser,
  };
}

function mapDocument(row: OpsDocumentRow): GeneratedDocument {
  return {
    id: row.id,
    templateId: row.templateId,
    patientId: row.patientRef.replace(/^PREF-/, ''),
    courseId: courseIdFromRef(row.courseRef),
    name: row.name,
    clinicalPhase: row.clinicalPhase,
    responsibleParty: row.responsibleParty,
    status: row.status,
    requiredAction: row.requiredAction,
    cptCode: row.cptCode ?? undefined,
    assignedTo: row.assignedTo,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
    signedAt: iso(row.signedAt),
    exportedAt: iso(row.exportedAt),
    signReviewState: row.signReviewState,
    auditReady: row.auditReady,
  };
}

function mapFraction(row: PhiFractionRow): FractionLogEntry {
  return {
    id: row.id,
    courseId: row.courseId,
    fractionNumber: row.fractionNumber,
    status: row.status,
    date: row.date.toISOString().slice(0, 10),
    phase: row.phase,
    energy: row.energy,
    energyKv: row.energyKv ?? undefined,
    ssd: row.ssd,
    ssdCm: numberValue(row.ssdCm),
    fieldSizeCm: row.fieldSizeCm ?? undefined,
    treatmentTimeMinutes: numberValue(row.treatmentTimeMinutes),
    dosePerFraction: row.dosePerFraction,
    dosePerFractionCgy: row.dosePerFractionCgy ?? undefined,
    cumulativeDose: row.cumulativeDose,
    cumulativeDoseCgy: numberValue(row.cumulativeDoseCgy),
    technicianInitials: row.technicianInitials,
    mdApproval: row.mdApproval,
    mdApprovalState: row.mdApprovalState ?? undefined,
    mdApprovedAt: iso(row.mdApprovedAt),
    mdApprovedByUserId: row.mdApprovedByUserId ?? undefined,
    dotApproval: row.dotApproval,
    dotApprovalState: row.dotApprovalState ?? undefined,
    dotApprovedAt: iso(row.dotApprovedAt),
    dotApprovedByUserId: row.dotApprovedByUserId ?? undefined,
    depthOfTarget: row.depthOfTarget,
    depthOfTargetMm: numberValue(row.depthOfTargetMm),
    isodosePercent: row.isodosePercent,
    isodoseToDotPercent: numberValue(row.isodoseToDotPercent),
    doseToDepth: row.doseToDepth,
    doseToDotCgy: numberValue(row.doseToDotCgy),
    cumulativeDoseToDepth: row.cumulativeDoseToDepth,
    cumulativeDoseToDotCgy: numberValue(row.cumulativeDoseToDotCgy),
    treatmentSetupComments: row.treatmentSetupComments ?? undefined,
    isodoseOverrideReason: row.isodoseOverrideReason ?? undefined,
    calculationStatus: row.calculationStatus ?? undefined,
    calculationMeta: row.calculationReferenceVersion
      ? {
          referenceVersion: row.calculationReferenceVersion,
          sourceTemplate: row.calculationSourceTemplate ?? 'Seeded worksheet',
          sourceTabs: row.calculationSourceTabs,
          depthRoundedMm: numberValue(row.calculationDepthRoundedMm) ?? 0,
          lookupKey: row.calculationLookupKey ?? undefined,
          calculatedAt: row.date.toISOString(),
          clinicalValidationRequired: row.calculationClinicalValidationRequired,
          warnings: row.calculationWarnings,
        }
      : undefined,
    isodoseNote: row.isodoseNote ?? undefined,
    revisionApprovalType: row.revisionApprovalType ?? undefined,
    revisionReason: row.revisionReason ?? undefined,
    revisionRequestedAt: iso(row.revisionRequestedAt),
    revisionRequestedByUserId: row.revisionRequestedByUserId ?? undefined,
    voidReason: row.voidReason ?? undefined,
    voidedAt: iso(row.voidedAt),
    voidedByUserId: row.voidedByUserId ?? undefined,
    correctionReason: row.correctionReason ?? undefined,
    correctedAt: iso(row.correctedAt),
    correctedByUserId: row.correctedByUserId ?? undefined,
    skinSurfaceDoseCgy: numberValue(row.skinSurfaceDoseCgy),
    cumulativeSkinSurfaceDoseCgy: numberValue(row.cumulativeSkinSurfaceDoseCgy),
    prescriptionMismatchFields: stringArray(row.prescriptionMismatchFields),
    prescriptionOverrideReason: row.prescriptionOverrideReason ?? undefined,
    notes: row.notes,
  };
}

function mapWorkflowStep(row: OpsWorkflowStepRow): WorkflowStep {
  return {
    id: row.id,
    courseId: courseIdFromRef(row.courseRef),
    stepNumber: row.stepNumber,
    stepName: row.stepName,
    phase: row.phase,
    status: row.status,
    applicability: row.applicability ?? carepathStepApplicability(row.stepNumber),
    requirementIds: stringArray(row.requirementIds).length > 0
      ? stringArray(row.requirementIds)
      : defaultRequirementIdsForStep(row.stepNumber, row.workflowDefinitionId),
    responsibleRole: row.responsibleRole,
    assignedUserId: row.assignedUserId ?? undefined,
    triggerEvent: row.triggerEvent,
    dueDate: iso(row.dueDate),
    requiresSignature: row.requiresSignature,
    signedByUserId: row.signedByUserId ?? undefined,
    signedAt: iso(row.signedAt),
    linkedDocumentId: row.linkedDocumentId ?? undefined,
    naReason: row.naReason ?? undefined,
    systemReason: row.systemReason ?? undefined,
    blockers: row.blockers,
    auditChecklist: row.auditChecklist,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAuditCheck(row: OpsAuditCheckRow): AuditCheck {
  return {
    id: row.id,
    courseId: courseIdFromRef(row.courseRef),
    category: row.category,
    label: row.label,
    status: row.status,
    required: row.required,
    evidenceDocumentId: row.evidenceDocumentId ?? undefined,
    notes: row.notes ?? undefined,
    completedByUserId: row.completedByUserId ?? undefined,
    completedAt: iso(row.completedAt),
    naReason: row.naReason ?? undefined,
  };
}

function mapSimulationOrder(row: PhiSimulationOrderRow): SimulationOrder {
  return {
    id: row.id,
    patientId: row.patientId,
    courseId: row.courseId,
    lesionLocation: row.lesionLocation,
    laterality: row.laterality,
    lesionBorderInked: row.lesionBorderInked,
    allMarginsInked: row.allMarginsInked,
    phaseIMarginInstruction: row.phaseIMarginInstruction,
    phaseIIMarginInstruction: row.phaseIIMarginInstruction,
    chairSetup: row.chairSetup,
    position: row.position,
    setupPhotoChecklist: stringArray(row.setupPhotoChecklist),
    ultrasoundFrequencies: stringArray(row.ultrasoundFrequencies),
    specialPhysicsRequired: row.specialPhysicsRequired,
    specialPhysicsReason: row.specialPhysicsReason,
    weeklyPhysicsRequired: row.weeklyPhysicsRequired,
    weeklyPhysicsReason: row.weeklyPhysicsReason,
    inVivoDosimetryRequired: row.inVivoDosimetryRequired,
    radiationOncologist: row.radiationOncologist,
    dateCompleted: iso(row.dateCompleted) ?? null,
    signedAt: iso(row.signedAt),
    status: row.status,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
  };
}

function mapPrescriptionPhase(row: PhiPrescriptionPhaseRow): PrescriptionPhase {
  return {
    id: row.id,
    phaseName: row.phaseName,
    energyKv: row.energyKv,
    phaseTotalDoseGy: numberValue(row.phaseTotalDoseGy) ?? 0,
    dosePerFractionGy: numberValue(row.dosePerFractionGy) ?? 0,
    totalFractions: row.totalFractions,
    timeMinutes: numberValue(row.timeMinutes) ?? 0,
    ssdCm: numberValue(row.ssdCm) ?? 0,
    applicatorSize: row.applicatorSize,
    marginMm: row.marginMm,
    technique: row.technique,
    shieldingDesign: row.shieldingDesign,
    depthOfTargetMm: numberValue(row.depthOfTargetMm) ?? 0,
    skinSurfaceDoseCgy: numberValue(row.skinSurfaceDoseCgy),
  };
}

function mapPrescription(row: PhiPrescriptionRow, phaseRows: PhiPrescriptionPhaseRow[]): Prescription {
  return {
    id: row.id,
    patientId: row.patientId,
    courseId: row.courseId,
    site: row.site,
    laterality: row.laterality,
    verifiedInSensus: row.verifiedInSensus,
    phases: phaseRows.filter((phase) => phase.prescriptionId === row.id).map(mapPrescriptionPhase),
    imagingGuidance: stringArray(row.imagingGuidance),
    priorRadiationTherapy: row.priorRadiationTherapy,
    preAuthorized: row.preAuthorized,
    signedAt: iso(row.signedAt),
    dateOrdered: iso(row.dateOrdered) ?? null,
    status: row.status,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
  };
}

function mapMappingRecord(row: PhiMappingRecordRow): MappingRecord {
  return {
    id: row.id,
    patientId: row.patientId,
    courseId: row.courseId,
    diagnosis: row.diagnosis,
    bodySite: row.bodySite,
    laterality: row.laterality,
    impressions: row.impressions,
    fieldDesignDecision: row.fieldDesignDecision,
    status: row.status,
    lastUpdatedAt: row.lastUpdatedAt.toISOString(),
  };
}

function responseDataRecord(value: unknown): ClinicalFormResponse['responseData'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record: ClinicalFormResponse['responseData'] = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (item instanceof Date) {
      record[key] = item.toISOString();
    } else if (item === null || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
      record[key] = item;
    }
  }
  return record;
}

function mapClinicalResponse(row: PhiClinicalResponseRow): ClinicalFormResponse {
  return {
    id: row.id,
    patientId: row.patientId,
    courseId: row.courseId,
    templateId: row.templateId,
    requirementId: row.requirementId,
    status: row.status,
    responseData: responseDataRecord(row.responseData),
    generatedDocumentId: row.generatedDocumentId ?? undefined,
    signedByUserId: row.signedByUserId ?? undefined,
    signedAt: iso(row.signedAt),
  };
}

function mapTreatmentFraction(row: PhiTreatmentFractionRow): TreatmentFraction {
  return {
    id: row.id,
    courseId: row.courseId,
    fractionNumber: row.fractionNumber,
    phase: row.phase,
    treatmentDate: row.treatmentDate.toISOString().slice(0, 10),
    plannedDose: row.plannedDose,
    deliveredDose: numberValue(row.deliveredDose),
    cumulativeDose: row.cumulativeDose,
    energy: row.energy ?? undefined,
    applicator: row.applicator ?? undefined,
    imageGuidanceCompleted: row.imageGuidanceCompleted,
    imageGuidanceStatus: row.imageGuidanceStatus ?? undefined,
    imageAssetIds: stringArray(row.imageAssetIds),
    imageGuidanceNotApplicableReason: row.imageGuidanceNotApplicableReason ?? undefined,
    scheduledFromPrescription: row.scheduledFromPrescription,
    sourcePrescriptionId: row.sourcePrescriptionId ?? undefined,
    sourcePhaseId: row.sourcePhaseId ?? undefined,
    linkedFractionLogEntryId: row.linkedFractionLogEntryId ?? undefined,
    physicsCheckRequired: row.physicsCheckRequired,
    physicsCheckCompletedAt: iso(row.physicsCheckCompletedAt),
    physicsCheckCompletedByUserId: row.physicsCheckCompletedByUserId ?? undefined,
    otvRequired: row.otvRequired,
    otvCompletedAt: iso(row.otvCompletedAt),
    otvCompletedByUserId: row.otvCompletedByUserId ?? undefined,
    generatedAt: iso(row.generatedAt),
    lockedAt: iso(row.lockedAt),
    status: row.status,
    therapistId: row.therapistId ?? undefined,
    physicianReviewedAt: iso(row.physicianReviewedAt),
    notes: row.notes ?? undefined,
  };
}

function mapGeneratedOutput(row: PhiGeneratedOutputRow): GeneratedDocumentOutput {
  return {
    id: row.id,
    documentId: row.documentId,
    patientId: row.patientId,
    courseId: row.courseId,
    format: row.format,
    version: row.version,
    status: row.status,
    driveFileUrl: row.driveFileUrl ?? undefined,
    storageProvider: row.storageProvider ?? undefined,
    storageKey: row.storageKey ?? undefined,
    contentPreview: row.contentPreview,
    renderedAt: row.renderedAt.toISOString(),
    renderedByUserId: row.renderedByUserId ?? undefined,
  };
}

function mapAuditEvent(row: OpsAuditEventRow): AuditEvent {
  return {
    id: row.id,
    patientId: row.patientRef ?? undefined,
    userId: row.userId,
    userName: row.userName,
    role: row.role ?? undefined,
    sessionId: row.sessionId ?? undefined,
    ipAddress: row.ipAddress ?? undefined,
    deviceId: row.deviceId ?? undefined,
    action: row.action,
    entityType: row.entityType as AuditEvent['entityType'],
    entityId: row.entityId,
    previousValue: row.previousValue,
    newValue: row.newValue,
    timestamp: row.timestamp.toISOString(),
    reason: row.reason ?? undefined,
  };
}

export async function hydrateClinicalStoreFromDatabase(options: { force?: boolean } = {}) {
  if (hydrated && !options.force) {
    return { hydrated: true, source: 'cache' as const };
  }

  if (process.env.CURERAYS_PERSISTENCE_MODE !== 'prisma') {
    hydrationCache.hydrated = false;
    hydrationCache.source = 'memory';
    hydrationCache.checkedAt = Date.now();
    return { hydrated: false, source: 'memory' as const };
  }

  if (
    !options.force &&
    hydrationCache.checkedAt &&
    hydrationCache.source &&
    hydrationCache.source !== 'postgres' &&
    Date.now() - hydrationCache.checkedAt < hydrationRetryMs
  ) {
    return {
      hydrated: false,
      source: hydrationCache.source === 'empty-database' ? 'empty-database' as const : 'memory-fallback' as const,
    };
  }

  try {
    const rows = await loadRowsWithPrisma().catch(() => loadRowsWithWindowsFallback());
    const {
      opsPatients,
      opsCourses,
      workflowSteps,
      auditChecks,
      tasks,
      documents,
      opsAuditEvents,
      phiPatients,
      phiCourses,
      phiSimulationOrders,
      phiPrescriptions,
      phiPrescriptionPhases,
      phiMappingRecords,
      phiClinicalResponses,
      phiTreatmentFractions,
      phiFractions,
      phiGeneratedOutputs,
    } = rows;

    if (opsPatients.length === 0 || opsCourses.length === 0 || phiPatients.length === 0 || phiCourses.length === 0) {
      hydrationCache.hydrated = false;
      hydrationCache.source = 'empty-database';
      hydrationCache.checkedAt = Date.now();
      return { hydrated: false, source: 'empty-database' as const };
    }

    replaceArray(patients, phiPatients.map(mapPatient));
    replaceArray(treatmentCourses, phiCourses.map(mapCourse));
    replaceArray(patientCourseWorkflowSteps, workflowSteps.map(mapWorkflowStep));
    replaceArray(patientCourseAuditChecks, auditChecks.map(mapAuditCheck));
    replaceArray(carepathTasks, tasks.map(mapTask));
    replaceArray(generatedDocuments, documents.map(mapDocument));
    replaceArray(simulationOrders, phiSimulationOrders.map(mapSimulationOrder));
    replaceArray(prescriptions, phiPrescriptions.map((prescription) => mapPrescription(prescription, phiPrescriptionPhases)));
    replaceArray(mappingRecords, phiMappingRecords.map(mapMappingRecord));
    replaceArray(clinicalFormResponses, phiClinicalResponses.map(mapClinicalResponse));
    replaceArray(treatmentFractions, phiTreatmentFractions.map(mapTreatmentFraction));
    replaceArray(fractionLogEntries, phiFractions.map(mapFraction));
    replaceArray(generatedDocumentOutputs, phiGeneratedOutputs.map(mapGeneratedOutput));
    replaceArray(auditEvents, opsAuditEvents.map(mapAuditEvent));
    replaceArray(priorityFlags, phiPatients.flatMap((patient) => flags(patient.flags).map((flag) => ({
      id: flag.id,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      severity: flag.severity,
      summary: flag.summary,
      owner: flag.owner,
      dueAt: flag.dueDate ?? patient.lastUpdatedAt.toISOString(),
    }))));

    hydrated = true;
    hydrationCache.hydrated = true;
    hydrationCache.source = 'postgres';
    hydrationCache.checkedAt = Date.now();
    return { hydrated: true, source: 'postgres' as const };
  } catch {
    hydrationCache.hydrated = false;
    hydrationCache.source = 'memory-fallback';
    hydrationCache.checkedAt = Date.now();
    return { hydrated: false, source: 'memory-fallback' as const };
  }
}

async function loadRowsWithPrisma() {
  const ops = loadClient('.prisma/ops-client');
  const phi = loadClient('.prisma/phi-client');

  try {
    const [
      opsPatients,
      opsCourses,
      workflowSteps,
      auditChecks,
      tasks,
      documents,
      opsAuditEvents,
      phiPatients,
      phiCourses,
      phiSimulationOrders,
      phiPrescriptions,
      phiPrescriptionPhases,
      phiMappingRecords,
      phiClinicalResponses,
      phiTreatmentFractions,
      phiFractions,
      phiGeneratedOutputs,
    ] = await Promise.all([
      delegate<OpsPatientRow>(ops, 'operationalPatient').findMany({ orderBy: { patientRef: 'asc' } }),
      delegate<OpsCourseRow>(ops, 'operationalCourse').findMany({ orderBy: { courseRef: 'asc' } }),
      delegate<OpsWorkflowStepRow>(ops, 'operationalWorkflowStep').findMany({ orderBy: [{ courseRef: 'asc' }, { stepNumber: 'asc' }] }),
      delegate<OpsAuditCheckRow>(ops, 'operationalAuditCheck').findMany({ orderBy: { id: 'asc' } }),
      delegate<OpsTaskRow>(ops, 'carepathTask').findMany({ orderBy: { id: 'asc' } }),
      delegate<OpsDocumentRow>(ops, 'generatedDocument').findMany({ orderBy: { id: 'asc' } }),
      delegate<OpsAuditEventRow>(ops, 'operationalAuditEvent').findMany({ orderBy: { timestamp: 'desc' } }),
      delegate<PhiPatientRow>(phi, 'patientPhi').findMany({ orderBy: { patientRef: 'asc' } }),
      delegate<PhiCourseRow>(phi, 'treatmentCoursePhi').findMany({ orderBy: { courseRef: 'asc' } }),
      delegate<PhiSimulationOrderRow>(phi, 'simulationOrderPhi').findMany({ orderBy: { id: 'asc' } }),
      delegate<PhiPrescriptionRow>(phi, 'prescriptionPhi').findMany({ orderBy: { id: 'asc' } }),
      delegate<PhiPrescriptionPhaseRow>(phi, 'prescriptionPhasePhi').findMany({ orderBy: { id: 'asc' } }),
      delegate<PhiMappingRecordRow>(phi, 'mappingRecordPhi').findMany({ orderBy: { id: 'asc' } }),
      delegate<PhiClinicalResponseRow>(phi, 'clinicalFormResponsePhi').findMany({ orderBy: { id: 'asc' } }),
      delegate<PhiTreatmentFractionRow>(phi, 'treatmentFractionPhi').findMany({ orderBy: [{ courseId: 'asc' }, { fractionNumber: 'asc' }] }),
      delegate<PhiFractionRow>(phi, 'fractionLogEntryPhi').findMany({ orderBy: [{ courseId: 'asc' }, { fractionNumber: 'asc' }] }),
      delegate<PhiGeneratedOutputRow>(phi, 'generatedDocumentOutputPhi').findMany({ orderBy: { id: 'asc' } }),
    ]);

    return {
      opsPatients,
      opsCourses,
      workflowSteps,
      auditChecks,
      tasks,
      documents,
      opsAuditEvents,
      phiPatients,
      phiCourses,
      phiSimulationOrders,
      phiPrescriptions,
      phiPrescriptionPhases,
      phiMappingRecords,
      phiClinicalResponses,
      phiTreatmentFractions,
      phiFractions,
      phiGeneratedOutputs,
    };
  } finally {
    await Promise.allSettled([ops.$disconnect(), phi.$disconnect()]);
  }
}
