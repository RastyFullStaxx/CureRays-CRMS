import 'server-only';

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  patients,
  priorityFlags,
  treatmentCourses,
} from '@/lib/clinical-store';
import type {
  AuditEvent,
  CarepathTask,
  CarepathWorkflowPhase,
  ChartRoundsPhase,
  DiagnosisCategory,
  DocumentStatus,
  FractionLogEntry,
  GeneratedDocument,
  Patient,
  PatientFlag,
  PatientStatus,
  PrototypeAccessRole,
  ResponsibleParty,
  TreatmentCourse,
  TreatmentCourseStatus,
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
  notes: string;
};

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
    tasks: queryViaWindowsPsql<OpsTaskRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('CarepathTask', '"id" ASC')),
    documents: queryViaWindowsPsql<OpsDocumentRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('GeneratedDocument', '"id" ASC')),
    opsAuditEvents: queryViaWindowsPsql<OpsAuditEventRow>('curerays_ops', 'curerays_ops_user', opsPassword, jsonSelect('OperationalAuditEvent', '"timestamp" DESC')),
    phiPatients: queryViaWindowsPsql<PhiPatientRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('PatientPhi', '"patientRef" ASC')),
    phiCourses: queryViaWindowsPsql<PhiCourseRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('TreatmentCoursePhi', '"courseRef" ASC')),
    phiFractions: queryViaWindowsPsql<PhiFractionRow>('curerays_phi', 'curerays_phi_user', phiPassword, jsonSelect('FractionLogEntryPhi', '"courseId" ASC, "fractionNumber" ASC')),
  });
}

function mapPatient(row: PhiPatientRow): Patient {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    mrn: row.mrn,
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
    notes: row.notes,
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
    return { hydrated: false, source: 'memory' as const };
  }

  try {
    const rows = await loadRowsWithPrisma().catch(() => loadRowsWithWindowsFallback());
    const { opsPatients, opsCourses, tasks, documents, opsAuditEvents, phiPatients, phiCourses, phiFractions } = rows;

    if (opsPatients.length === 0 || opsCourses.length === 0 || phiPatients.length === 0 || phiCourses.length === 0) {
      return { hydrated: false, source: 'empty-database' as const };
    }

    replaceArray(patients, phiPatients.map(mapPatient));
    replaceArray(treatmentCourses, phiCourses.map(mapCourse));
    replaceArray(carepathTasks, tasks.map(mapTask));
    replaceArray(generatedDocuments, documents.map(mapDocument));
    replaceArray(fractionLogEntries, phiFractions.map(mapFraction));
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
    return { hydrated: true, source: 'postgres' as const };
  } catch {
    return { hydrated: false, source: 'memory-fallback' as const };
  }
}

async function loadRowsWithPrisma() {
  const ops = loadClient('.prisma/ops-client');
  const phi = loadClient('.prisma/phi-client');

  try {
    const [opsPatients, opsCourses, tasks, documents, opsAuditEvents, phiPatients, phiCourses, phiFractions] = await Promise.all([
      delegate<OpsPatientRow>(ops, 'operationalPatient').findMany({ orderBy: { patientRef: 'asc' } }),
      delegate<OpsCourseRow>(ops, 'operationalCourse').findMany({ orderBy: { courseRef: 'asc' } }),
      delegate<OpsTaskRow>(ops, 'carepathTask').findMany({ orderBy: { id: 'asc' } }),
      delegate<OpsDocumentRow>(ops, 'generatedDocument').findMany({ orderBy: { id: 'asc' } }),
      delegate<OpsAuditEventRow>(ops, 'operationalAuditEvent').findMany({ orderBy: { timestamp: 'desc' } }),
      delegate<PhiPatientRow>(phi, 'patientPhi').findMany({ orderBy: { patientRef: 'asc' } }),
      delegate<PhiCourseRow>(phi, 'treatmentCoursePhi').findMany({ orderBy: { courseRef: 'asc' } }),
      delegate<PhiFractionRow>(phi, 'fractionLogEntryPhi').findMany({ orderBy: [{ courseId: 'asc' }, { fractionNumber: 'asc' }] }),
    ]);

    return { opsPatients, opsCourses, tasks, documents, opsAuditEvents, phiPatients, phiCourses, phiFractions };
  } finally {
    await Promise.allSettled([ops.$disconnect(), phi.$disconnect()]);
  }
}
