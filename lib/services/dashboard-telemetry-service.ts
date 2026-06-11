import {
  carepathTasks,
  documentRequirements,
  fractionLogEntries,
  generatedDocuments,
  operationalAppointments,
  operationalAuditEvents,
  operationalPatients,
  operationalPriorityFlags,
  operationalTreatmentCourses,
  templateSources,
  workflowDefinitions,
} from '@/lib/clinical-store';
import {
  carepathPhaseLabels,
  orderedCarepathPhases,
  orderedResponsibleParties,
  responsiblePartyLabels,
} from '@/lib/workflow';
import type {
  CarepathTaskStatus,
  CarepathWorkflowPhase,
  DocumentStatus,
  FlagSeverity,
  OperationalTreatmentCourse,
  ResponsibleParty,
  TemplateSourceStatus,
} from '@/lib/types';

export type DashboardPanel = 'ops' | 'flow' | 'risk';

export type DashboardMetric = {
  label: string;
  value: string | number;
  detail: string;
  icon: 'patients' | 'schedule' | 'tasks' | 'documents';
  trend: number[];
};

export type DashboardSignalStageId = 'chart-prep' | 'planning' | 'delivery' | 'closeout';

export type DashboardSignalNode = {
  id: string;
  label: string;
  group: 'patient' | 'course' | 'stage' | 'task' | 'document' | 'risk';
  value: number;
  stage?: DashboardSignalStageId;
  detail?: string;
};

export type DashboardSignalLink = {
  source: string;
  target: string;
  value: number;
};

export type DashboardSignalStageSummary = {
  id: DashboardSignalStageId;
  label: string;
  count: number;
  pressure: number;
};

export type CarepathLaneToken = {
  id: string;
  label: string;
  offset: number;
  tone: 'primary' | 'success' | 'warning' | 'info';
};

export type CarepathLaneDatum = {
  id: DashboardSignalStageId;
  label: string;
  count: number;
  pressure: number;
  handoff: number;
  tokens: CarepathLaneToken[];
};

export type CourseDistributionDatum = {
  name: string;
  value: number;
  color: string;
};

export type ThroughputDatum = {
  day: string;
  fractions: number;
  activeLoad: number;
};

export type AttentionDatum = {
  label: string;
  value: number;
  color: string;
};

export type CapacityBand = {
  label: string;
  treatment: number;
  simulation: number;
  review: number;
  total: number;
  capacity: number;
};

export type ProviderLoad = {
  provider: string;
  appointments: number;
  capacity: number;
};

export type DashboardTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type DashboardKpiDatum = {
  label: string;
  value: string | number;
  detail: string;
  tone: DashboardTone;
};

export type CarepathSankeyNode = {
  name: string;
  phase: CarepathWorkflowPhase;
  count: number;
  riskCount: number;
  tone: DashboardTone;
};

export type CarepathSankeyLink = {
  source: string;
  target: string;
  value: number;
  blocked: number;
  needsReview: number;
  tone: DashboardTone;
};

export type CarepathHeatmapCell = {
  phase: CarepathWorkflowPhase;
  phaseLabel: string;
  owner: ResponsibleParty;
  ownerLabel: string;
  phaseIndex: number;
  ownerIndex: number;
  value: number;
  blocked: number;
  overdue: number;
  needsReview: number;
};

export type HandoffRunwayItem = {
  id: string;
  courseRef: string;
  title: string;
  phase: string;
  owner: string;
  dueState: string;
  status: string;
  reasonCategory: string;
  tone: DashboardTone;
  priorityScore: number;
};

export type TemplateCoverageDatum = {
  label: string;
  active: number;
  draft: number;
  mapping: number;
  missing: number;
  total: number;
};

export type AuditReadinessDatum = {
  phase: CarepathWorkflowPhase;
  label: string;
  ready: number;
  notReady: number;
  blockers: number;
  percent: number;
};

export type CarepathDashboardTelemetry = {
  asOfLabel: string;
  metrics: DashboardKpiDatum[];
  sankey: {
    nodes: CarepathSankeyNode[];
    links: CarepathSankeyLink[];
  };
  phaseOwnerHeatmap: {
    phases: string[];
    owners: string[];
    cells: CarepathHeatmapCell[];
  };
  handoffs: HandoffRunwayItem[];
  templateCoverage: TemplateCoverageDatum[];
  auditReadiness: AuditReadinessDatum[];
};

export type RiskScoreComponent = {
  label: string;
  value: number;
  points: number;
  detail: string;
  tone: DashboardTone;
};

export type RiskGraphNode = {
  id: string;
  name: string;
  category: 'course' | 'domain';
  value: number;
  detail: string;
  tone: DashboardTone;
};

export type RiskGraphLink = {
  source: string;
  target: string;
  value: number;
  reason: string;
  tone: DashboardTone;
};

export type SafetyMatrixCell = {
  domain: string;
  phase: CarepathWorkflowPhase;
  phaseLabel: string;
  domainIndex: number;
  phaseIndex: number;
  value: number;
  severity: DashboardTone;
};

export type FractionApprovalWatchItem = {
  id: string;
  courseRef: string;
  fraction: string;
  issue: string;
  approvalState: string;
  calculation: string;
  tone: DashboardTone;
  priorityScore: number;
};

export type InterventionQueueItem = {
  id: string;
  courseRef: string;
  action: string;
  owner: string;
  phase: string;
  dueState: string;
  reasonCategory: string;
  tone: DashboardTone;
  priorityScore: number;
};

export type PhiAssuranceDatum = {
  label: string;
  value: string | number;
  detail: string;
  tone: DashboardTone;
};

export type RiskDashboardTelemetry = {
  safetyScore: {
    score: number;
    label: string;
    detail: string;
    components: RiskScoreComponent[];
  };
  riskGraph: {
    nodes: RiskGraphNode[];
    links: RiskGraphLink[];
  };
  safetyMatrix: {
    domains: string[];
    phases: string[];
    cells: SafetyMatrixCell[];
  };
  fractionWatch: FractionApprovalWatchItem[];
  interventions: InterventionQueueItem[];
  phiAssurance: PhiAssuranceDatum[];
};

export type PhiGraphNode = {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  tone: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

export type PhiGraphLink = {
  source: string;
  target: string;
  label: string;
  isolated?: boolean;
};

export type DashboardTelemetry = {
  metrics: DashboardMetric[];
  signal: {
    nodes: DashboardSignalNode[];
    links: DashboardSignalLink[];
    stages: DashboardSignalStageSummary[];
    loadPercent: number;
    summary: string;
  };
  carepathLanes: CarepathLaneDatum[];
  courseDistribution: CourseDistributionDatum[];
  throughput: ThroughputDatum[];
  attention: AttentionDatum[];
  capacityBands: CapacityBand[];
  providerLoad: ProviderLoad[];
  carepath: CarepathDashboardTelemetry;
  risk: RiskDashboardTelemetry;
  phiBoundary: {
    nodes: PhiGraphNode[];
    links: PhiGraphLink[];
  };
};

const completedTaskStatuses = ['COMPLETED', 'SIGNED', 'CLOSED', 'UPLOADED', 'NOT_APPLICABLE'];
const readyDocumentStatuses = ['SIGNED', 'EXPORTED', 'UPLOADED'];
const riskyTaskStatuses: CarepathTaskStatus[] = ['BLOCKED', 'OVERDUE', 'NEEDS_REVIEW', 'READY_FOR_REVIEW'];
const riskyDocumentStatuses: DocumentStatus[] = ['BLOCKED', 'OVERDUE', 'MISSING_FIELDS', 'NEEDS_REVIEW', 'READY_FOR_REVIEW', 'PENDING_NEEDED'];
const criticalDocumentPhases: CarepathWorkflowPhase[] = ['PLANNING', 'ON_TREATMENT'];
const stageLabels: Record<DashboardSignalStageId, string> = {
  'chart-prep': 'Chart Prep',
  planning: 'Planning',
  delivery: 'Delivery',
  closeout: 'Closeout',
};

function countTasksByPhase(phases: CarepathWorkflowPhase[]) {
  return carepathTasks.filter((task) => phases.includes(task.workflowPhase)).length;
}

function courseStage(phase: 'UPCOMING' | 'ON_TREATMENT' | 'POST'): DashboardSignalStageId {
  if (phase === 'ON_TREATMENT') {
    return 'delivery';
  }

  if (phase === 'POST') {
    return 'closeout';
  }

  return 'chart-prep';
}

function appointmentHour(time: string) {
  const [hour] = time.split(':');
  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : 12;
}

function appointmentMode(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('treatment') || normalized.includes('fraction')) {
    return 'treatment';
  }
  if (normalized.includes('sim') || normalized.includes('mapping')) {
    return 'simulation';
  }
  return 'review';
}

function buildCapacityBands() {
  const bands = [
    { label: '07-10', min: 7, max: 10, capacity: 6 },
    { label: '10-13', min: 10, max: 13, capacity: 7 },
    { label: '13-16', min: 13, max: 16, capacity: 7 },
    { label: '16-18', min: 16, max: 19, capacity: 5 },
  ];

  return bands.map((band) => {
    const scoped = operationalAppointments().filter((appointment) => {
      const hour = appointmentHour(appointment.time);
      return hour >= band.min && hour < band.max;
    });
    const treatment = scoped.filter((appointment) => appointmentMode(appointment.title) === 'treatment').length;
    const simulation = scoped.filter((appointment) => appointmentMode(appointment.title) === 'simulation').length;
    const review = Math.max(0, scoped.length - treatment - simulation);

    return {
      label: band.label,
      treatment,
      simulation,
      review,
      total: scoped.length,
      capacity: band.capacity,
    };
  });
}

function buildProviderLoad() {
  const counts = operationalAppointments().reduce<Record<string, number>>((current, appointment) => {
    current[appointment.staff] = (current[appointment.staff] ?? 0) + 1;
    return current;
  }, {});

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([provider, appointments]) => ({
      provider,
      appointments,
      capacity: 5,
    }));
}

function parseDashboardDate(value: string | undefined) {
  if (!value) {
    return Number.NaN;
  }

  const normalized = value.includes('T') ? value : `${value}T12:00:00+08:00`;
  return Date.parse(normalized);
}

function dashboardAsOfDate() {
  const timestamps = [
    ...carepathTasks.flatMap((task) => [task.lastUpdatedAt, task.dueDate, task.completedAt, task.signedAt]),
    ...generatedDocuments.flatMap((document) => [document.lastUpdatedAt, document.signedAt, document.exportedAt]),
    ...fractionLogEntries.map((entry) => entry.correctedAt ?? entry.revisionRequestedAt ?? entry.voidedAt ?? entry.date),
  ]
    .map(parseDashboardDate)
    .filter(Number.isFinite);

  return new Date(Math.max(...timestamps, Date.now()));
}

function shortDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value);
}

function dueState(dueDate: string | undefined, asOf: Date) {
  if (!dueDate) {
    return 'Monitor';
  }

  const due = new Date(`${dueDate}T12:00:00+08:00`);
  const asOfDay = new Date(asOf);
  due.setHours(12, 0, 0, 0);
  asOfDay.setHours(12, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - asOfDay.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return 'Overdue';
  }

  if (diffDays === 0) {
    return 'Due today';
  }

  if (diffDays <= 2) {
    return `Due in ${diffDays}d`;
  }

  return 'Scheduled';
}

function courseRefMap(courses: OperationalTreatmentCourse[]) {
  return courses.reduce<Record<string, string>>((current, course) => {
    current[course.id] = course.courseRef;
    return current;
  }, {});
}

function courseRefFor(courseId: string, refs: Record<string, string>) {
  return refs[courseId] ?? courseId.replace('COURSE-', 'CRS-');
}

function taskStatusTone(status: CarepathTaskStatus): DashboardTone {
  if (status === 'BLOCKED' || status === 'OVERDUE') {
    return 'error';
  }

  if (status === 'NEEDS_REVIEW' || status === 'READY_FOR_REVIEW') {
    return 'warning';
  }

  if (completedTaskStatuses.includes(status)) {
    return 'success';
  }

  return 'info';
}

function documentStatusTone(status: DocumentStatus): DashboardTone {
  if (status === 'BLOCKED' || status === 'OVERDUE' || status === 'MISSING_FIELDS') {
    return 'error';
  }

  if (status === 'NEEDS_REVIEW' || status === 'READY_FOR_REVIEW' || status === 'PENDING_NEEDED') {
    return 'warning';
  }

  if (readyDocumentStatuses.includes(status)) {
    return 'success';
  }

  return 'info';
}

function flagSeverityScore(severity: FlagSeverity) {
  if (severity === 'HIGH') return 3;
  if (severity === 'MEDIUM') return 2;
  return 1;
}

function riskTone(score: number): DashboardTone {
  if (score >= 8) return 'error';
  if (score >= 4) return 'warning';
  if (score > 0) return 'info';
  return 'success';
}

function taskPriority(status: CarepathTaskStatus, due: string | undefined, asOf: Date) {
  const dueLabel = dueState(due, asOf);
  const dueBoost = dueLabel === 'Overdue' ? 4 : dueLabel === 'Due today' ? 3 : dueLabel.startsWith('Due in') ? 2 : 0;
  const statusScore: Record<CarepathTaskStatus, number> = {
    BLOCKED: 12,
    OVERDUE: 12,
    NEEDS_REVIEW: 8,
    READY_FOR_REVIEW: 7,
    IN_PROGRESS: 4,
    PENDING: 3,
    NOT_STARTED: 2,
    SIGNED: 0,
    UPLOADED: 0,
    COMPLETED: 0,
    CLOSED: 0,
    NOT_APPLICABLE: 0,
  };

  return statusScore[status] + dueBoost;
}

function documentPriority(status: DocumentStatus, signReviewState: string) {
  const statusScore: Partial<Record<DocumentStatus, number>> = {
    BLOCKED: 12,
    OVERDUE: 12,
    MISSING_FIELDS: 10,
    NEEDS_REVIEW: 8,
    READY_FOR_REVIEW: 7,
    PENDING_NEEDED: 6,
    PENDING: 4,
    IN_PROGRESS: 3,
    NOT_STARTED: 2,
  };

  return (statusScore[status] ?? 0) + (signReviewState !== 'SIGNED' ? 3 : 0);
}

function taskRiskDomain(title: string, documentName: string) {
  const text = `${title} ${documentName}`.toLowerCase();
  if (text.includes('physics')) return 'Physics review';
  if (text.includes('prescription') || text.includes('rx')) return 'Prescription';
  if (text.includes('fraction') || text.includes('fx')) return 'Fraction approval';
  if (text.includes('audit') || text.includes('billing')) return 'Audit gap';
  return 'Workflow blocker';
}

function documentRiskDomain(name: string) {
  const text = name.toLowerCase();
  if (text.includes('prescription')) return 'Prescription';
  if (text.includes('physics') || text.includes('isodose')) return 'Physics review';
  if (text.includes('fraction') || text.includes('fx')) return 'Fraction approval';
  if (text.includes('audit') || text.includes('billing')) return 'Audit gap';
  return 'Document signature';
}

function fractionIssue(entry: (typeof fractionLogEntries)[number]) {
  if (entry.status === 'VOIDED') return 'Voided fraction review';
  if (entry.status === 'REVISION_NEEDED') return 'Revision needed';
  if (entry.calculationStatus === 'NEEDS_OVERRIDE') return 'Manual override needed';
  if (entry.calculationStatus === 'MANUAL_OVERRIDE') return 'Manual override review';
  if (!entry.mdApproval && !entry.dotApproval) return 'MD and DOT approval';
  if (!entry.mdApproval) return 'MD approval';
  if (!entry.dotApproval) return 'DOT approval';
  if (entry.status === 'NEEDS_REVIEW') return 'Treatment log review';
  return '';
}

function fractionPriority(entry: (typeof fractionLogEntries)[number]) {
  if (entry.status === 'VOIDED' || entry.status === 'REVISION_NEEDED') return 11;
  if (entry.calculationStatus === 'NEEDS_OVERRIDE') return 10;
  if (!entry.mdApproval && !entry.dotApproval) return 9;
  if (!entry.mdApproval || !entry.dotApproval) return 7;
  if (entry.calculationStatus === 'MANUAL_OVERRIDE') return 6;
  if (entry.status === 'NEEDS_REVIEW') return 5;
  return 0;
}

function templateStatusCounts(statuses: TemplateSourceStatus[]) {
  return {
    active: statuses.filter((status) => status === 'ACTIVE').length,
    draft: statuses.filter((status) => status === 'DRAFT').length,
    mapping: statuses.filter((status) => status === 'MAPPING_IN_PROGRESS').length,
    missing: statuses.filter((status) => status === 'MISSING').length,
    total: statuses.length,
  };
}

function buildCarepathTelemetry(courses: OperationalTreatmentCourse[]): CarepathDashboardTelemetry {
  const asOf = dashboardAsOfDate();
  const refs = courseRefMap(courses);
  const openTasks = carepathTasks.filter((task) => !completedTaskStatuses.includes(task.status));
  const blockedTasks = carepathTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE');
  const documentsNotReady = generatedDocuments.filter((document) => !document.auditReady || riskyDocumentStatuses.includes(document.status));
  const signatureQueue = generatedDocuments.filter((document) => document.signReviewState !== 'SIGNED');
  const phaseLoad = orderedCarepathPhases.reduce<Record<CarepathWorkflowPhase, { total: number; risk: number; blocked: number; needsReview: number }>>(
    (current, phase) => {
      const phaseTasks = carepathTasks.filter((task) => task.workflowPhase === phase);
      const phaseDocuments = generatedDocuments.filter((document) => document.clinicalPhase === phase);
      const riskyTasks = phaseTasks.filter((task) => riskyTaskStatuses.includes(task.status));
      const riskyDocuments = phaseDocuments.filter((document) => riskyDocumentStatuses.includes(document.status) || document.signReviewState !== 'SIGNED');

      current[phase] = {
        total: phaseTasks.length + phaseDocuments.length,
        risk: riskyTasks.length + riskyDocuments.length,
        blocked: phaseTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length
          + phaseDocuments.filter((document) => document.status === 'BLOCKED' || document.status === 'OVERDUE' || document.status === 'MISSING_FIELDS').length,
        needsReview: phaseTasks.filter((task) => task.status === 'NEEDS_REVIEW' || task.status === 'READY_FOR_REVIEW').length
          + phaseDocuments.filter((document) => document.status === 'NEEDS_REVIEW' || document.status === 'READY_FOR_REVIEW' || document.signReviewState !== 'SIGNED').length,
      };
      return current;
    },
    {} as Record<CarepathWorkflowPhase, { total: number; risk: number; blocked: number; needsReview: number }>,
  );
  const sankeyNodes = orderedCarepathPhases.map<CarepathSankeyNode>((phase) => ({
    name: carepathPhaseLabels[phase],
    phase,
    count: phaseLoad[phase].total,
    riskCount: phaseLoad[phase].risk,
    tone: riskTone(phaseLoad[phase].blocked * 4 + phaseLoad[phase].needsReview * 2),
  }));
  const sankeyLinks = orderedCarepathPhases.slice(0, -1).map<CarepathSankeyLink>((phase, index) => {
    const nextPhase = orderedCarepathPhases[index + 1];
    const value = Math.max(1, Math.round((phaseLoad[phase].total + phaseLoad[nextPhase].total) / 2));
    const blocked = phaseLoad[phase].blocked + phaseLoad[nextPhase].blocked;
    const needsReview = phaseLoad[phase].needsReview + phaseLoad[nextPhase].needsReview;

    return {
      source: carepathPhaseLabels[phase],
      target: carepathPhaseLabels[nextPhase],
      value,
      blocked,
      needsReview,
      tone: riskTone(blocked * 4 + needsReview * 2),
    };
  });
  const activeOwners = orderedResponsibleParties.filter((owner) =>
    carepathTasks.some((task) => task.responsibleParty === owner)
    || generatedDocuments.some((document) => document.responsibleParty === owner),
  );
  const heatmapCells = activeOwners.flatMap((owner, ownerIndex) =>
    orderedCarepathPhases.map<CarepathHeatmapCell>((phase, phaseIndex) => {
      const phaseTasks = carepathTasks.filter((task) => task.workflowPhase === phase && task.responsibleParty === owner && !completedTaskStatuses.includes(task.status));
      const phaseDocuments = generatedDocuments.filter((document) => document.clinicalPhase === phase && document.responsibleParty === owner && (!document.auditReady || document.signReviewState !== 'SIGNED'));

      return {
        phase,
        phaseLabel: carepathPhaseLabels[phase],
        owner,
        ownerLabel: responsiblePartyLabels[owner],
        phaseIndex,
        ownerIndex,
        value: phaseTasks.length + phaseDocuments.length,
        blocked: phaseTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length
          + phaseDocuments.filter((document) => document.status === 'BLOCKED' || document.status === 'OVERDUE' || document.status === 'MISSING_FIELDS').length,
        overdue: phaseTasks.filter((task) => dueState(task.dueDate, asOf) === 'Overdue').length,
        needsReview: phaseTasks.filter((task) => task.status === 'NEEDS_REVIEW' || task.status === 'READY_FOR_REVIEW').length
          + phaseDocuments.filter((document) => document.status === 'NEEDS_REVIEW' || document.status === 'READY_FOR_REVIEW' || document.signReviewState !== 'SIGNED').length,
      };
    }),
  );
  const taskHandoffs = openTasks.map<HandoffRunwayItem>((task) => ({
    id: task.id,
    courseRef: courseRefFor(task.courseId, refs),
    title: task.title,
    phase: carepathPhaseLabels[task.workflowPhase],
    owner: responsiblePartyLabels[task.responsibleParty],
    dueState: dueState(task.dueDate, asOf),
    status: task.status.replaceAll('_', ' '),
    reasonCategory: taskRiskDomain(task.title, task.documentName),
    tone: taskStatusTone(task.status),
    priorityScore: taskPriority(task.status, task.dueDate, asOf),
  }));
  const documentHandoffs = generatedDocuments
    .filter((document) => document.signReviewState !== 'SIGNED' || riskyDocumentStatuses.includes(document.status))
    .map<HandoffRunwayItem>((document) => ({
      id: document.id,
      courseRef: courseRefFor(document.courseId, refs),
      title: document.name,
      phase: carepathPhaseLabels[document.clinicalPhase],
      owner: responsiblePartyLabels[document.responsibleParty],
      dueState: 'Signature path',
      status: document.status.replaceAll('_', ' '),
      reasonCategory: documentRiskDomain(document.name),
      tone: documentStatusTone(document.status),
      priorityScore: documentPriority(document.status, document.signReviewState),
    }));
  const handoffs = [...taskHandoffs, ...documentHandoffs]
    .filter((item) => item.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.courseRef.localeCompare(b.courseRef))
    .slice(0, 5);
  const templateCoverage = workflowDefinitions.map<TemplateCoverageDatum>((workflow) => {
    const statuses = workflow.documentRequirementIds.map((requirementId) => {
      const requirement = documentRequirements.find((item) => item.id === requirementId);
      const source = templateSources.find((item) => item.id === requirement?.templateSourceId);
      return source?.status ?? 'MISSING';
    });

    return {
      label: `${workflow.diagnosis.replaceAll('_', ' ')} · ${workflow.protocol}`,
      ...templateStatusCounts(statuses),
    };
  });
  const auditReadiness = orderedCarepathPhases.map<AuditReadinessDatum>((phase) => {
    const phaseTasks = carepathTasks.filter((task) => task.workflowPhase === phase);
    const phaseDocuments = generatedDocuments.filter((document) => document.clinicalPhase === phase);
    const ready = phaseTasks.filter((task) => task.auditReady).length + phaseDocuments.filter((document) => document.auditReady).length;
    const notReady = phaseTasks.filter((task) => !task.auditReady).length + phaseDocuments.filter((document) => !document.auditReady).length;
    const blockers = phaseTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length
      + phaseDocuments.filter((document) => document.status === 'BLOCKED' || document.status === 'OVERDUE' || document.status === 'MISSING_FIELDS').length;

    return {
      phase,
      label: carepathPhaseLabels[phase],
      ready,
      notReady,
      blockers,
      percent: Math.round((ready / Math.max(ready + notReady, 1)) * 100),
    };
  });

  return {
    asOfLabel: shortDate(asOf),
    metrics: [
      { label: 'Open handoffs', value: openTasks.length + signatureQueue.length, detail: `${blockedTasks.length} blocked`, tone: blockedTasks.length > 0 ? 'warning' : 'success' },
      { label: 'Template gaps', value: templateCoverage.reduce((sum, item) => sum + item.missing + item.draft + item.mapping, 0), detail: 'Draft, missing, or mapping', tone: 'info' },
      { label: 'Audit not ready', value: documentsNotReady.length, detail: 'Documents and task evidence', tone: documentsNotReady.length > 0 ? 'warning' : 'success' },
      { label: 'Signature queue', value: signatureQueue.length, detail: 'Review path still open', tone: signatureQueue.length > 0 ? 'warning' : 'success' },
    ],
    sankey: {
      nodes: sankeyNodes,
      links: sankeyLinks,
    },
    phaseOwnerHeatmap: {
      phases: orderedCarepathPhases.map((phase) => carepathPhaseLabels[phase]),
      owners: activeOwners.map((owner) => responsiblePartyLabels[owner]),
      cells: heatmapCells,
    },
    handoffs,
    templateCoverage,
    auditReadiness,
  };
}

function buildRiskTelemetry(courses: OperationalTreatmentCourse[]): RiskDashboardTelemetry {
  const asOf = dashboardAsOfDate();
  const refs = courseRefMap(courses);
  const patients = operationalPatients();
  const patientRefToCourseRef = patients.reduce<Record<string, string>>((current, patient) => {
    current[patient.patientRef] = patient.activeCourseRef;
    return current;
  }, {});
  const flags = operationalPriorityFlags();
  const highFlags = flags.filter((flag) => flag.severity === 'HIGH');
  const blockedTasks = carepathTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE');
  const treatmentHolds = courses.filter((course) => course.status === 'ON_HOLD');
  const unsignedCriticalDocuments = generatedDocuments.filter((document) =>
    criticalDocumentPhases.includes(document.clinicalPhase) && document.signReviewState !== 'SIGNED',
  );
  const fractionIssues = fractionLogEntries
    .map((entry) => ({ entry, issue: fractionIssue(entry), priorityScore: fractionPriority(entry) }))
    .filter((item) => item.priorityScore > 0);
  const auditGapDocuments = generatedDocuments.filter((document) => !document.auditReady);
  const components: RiskScoreComponent[] = [
    { label: 'High flags', value: highFlags.length, points: highFlags.length * 10, detail: 'High-severity operational flags', tone: highFlags.length > 0 ? 'error' : 'success' },
    { label: 'Blocked work', value: blockedTasks.length, points: blockedTasks.length * 14, detail: 'Blocked or overdue carepath tasks', tone: blockedTasks.length > 0 ? 'error' : 'success' },
    { label: 'Treatment holds', value: treatmentHolds.length, points: treatmentHolds.length * 15, detail: 'Courses paused before release', tone: treatmentHolds.length > 0 ? 'error' : 'success' },
    { label: 'Unsigned critical docs', value: unsignedCriticalDocuments.length, points: unsignedCriticalDocuments.length * 8, detail: 'Planning or treatment docs not signed', tone: unsignedCriticalDocuments.length > 0 ? 'warning' : 'success' },
    { label: 'Fraction issues', value: fractionIssues.length, points: fractionIssues.length * 8, detail: 'Approval, revision, or override watch', tone: fractionIssues.length > 0 ? 'warning' : 'success' },
    { label: 'Audit gaps', value: auditGapDocuments.length, points: auditGapDocuments.length * 4, detail: 'Evidence not audit-ready', tone: auditGapDocuments.length > 0 ? 'info' : 'success' },
  ];
  const totalPoints = components.reduce((sum, item) => sum + item.points, 0);
  const safetyScore = Math.max(0, Math.min(100, 100 - totalPoints));
  const domainNodes: RiskGraphNode[] = [
    { id: 'domain-high-flag', name: 'High flag', category: 'domain', value: highFlags.length, detail: 'Priority flag', tone: 'error' },
    { id: 'domain-blocker', name: 'Workflow blocker', category: 'domain', value: blockedTasks.length, detail: 'Blocked task', tone: 'error' },
    { id: 'domain-hold', name: 'Treatment hold', category: 'domain', value: treatmentHolds.length, detail: 'Course hold', tone: 'error' },
    { id: 'domain-prescription', name: 'Prescription', category: 'domain', value: unsignedCriticalDocuments.filter((document) => documentRiskDomain(document.name) === 'Prescription').length, detail: 'Unsigned review', tone: 'warning' },
    { id: 'domain-physics', name: 'Physics review', category: 'domain', value: blockedTasks.filter((task) => taskRiskDomain(task.title, task.documentName) === 'Physics review').length, detail: 'Physics path', tone: 'warning' },
    { id: 'domain-fraction', name: 'Fraction approval', category: 'domain', value: fractionIssues.length, detail: 'MD/DOT approval', tone: 'warning' },
    { id: 'domain-signature', name: 'Document signature', category: 'domain', value: unsignedCriticalDocuments.length, detail: 'Signature queue', tone: 'info' },
    { id: 'domain-audit', name: 'Audit gap', category: 'domain', value: auditGapDocuments.length, detail: 'Audit readiness', tone: 'info' },
  ];
  const courseRiskScores: Record<string, number> = {};
  const riskLinks: RiskGraphLink[] = [];
  const addCourseRisk = (courseRef: string, target: string, value: number, reason: string, tone: DashboardTone) => {
    courseRiskScores[courseRef] = (courseRiskScores[courseRef] ?? 0) + value;
    riskLinks.push({ source: courseRef, target, value, reason, tone });
  };

  highFlags.forEach((flag) => addCourseRisk(patientRefToCourseRef[flag.patientRef] ?? flag.patientRef, 'domain-high-flag', flagSeverityScore(flag.severity) + 2, flag.summary, 'error'));
  blockedTasks.forEach((task) => addCourseRisk(courseRefFor(task.courseId, refs), 'domain-blocker', taskPriority(task.status, task.dueDate, asOf), taskRiskDomain(task.title, task.documentName), 'error'));
  treatmentHolds.forEach((course) => addCourseRisk(course.courseRef, 'domain-hold', 12, 'Course hold', 'error'));
  unsignedCriticalDocuments.forEach((document) => {
    const domain = documentRiskDomain(document.name);
    const target = domain === 'Prescription' ? 'domain-prescription' : domain === 'Physics review' ? 'domain-physics' : 'domain-signature';
    addCourseRisk(courseRefFor(document.courseId, refs), target, documentPriority(document.status, document.signReviewState), domain, documentStatusTone(document.status));
  });
  fractionIssues.forEach(({ entry, issue, priorityScore }) => addCourseRisk(courseRefFor(entry.courseId, refs), 'domain-fraction', priorityScore, issue, priorityScore >= 10 ? 'error' : 'warning'));
  auditGapDocuments.forEach((document) => addCourseRisk(courseRefFor(document.courseId, refs), 'domain-audit', 3, 'Audit gap', 'info'));

  const courseNodes = Object.entries(courseRiskScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map<RiskGraphNode>(([courseRef, value]) => ({
      id: courseRef,
      name: courseRef,
      category: 'course',
      value,
      detail: `${value} risk weight`,
      tone: riskTone(value),
    }));
  const shownNodeIds = new Set([...courseNodes.map((node) => node.id), ...domainNodes.map((node) => node.id)]);
  const graphLinks = riskLinks
    .filter((link) => shownNodeIds.has(link.source) && shownNodeIds.has(link.target))
    .sort((a, b) => b.value - a.value)
    .slice(0, 18);
  const domains = ['High flag', 'Treatment hold', 'Prescription', 'Physics review', 'Fraction approval', 'Document signature', 'Audit gap'];
  const matrixCells = domains.flatMap((domain, domainIndex) =>
    orderedCarepathPhases.map<SafetyMatrixCell>((phase, phaseIndex) => {
      const taskCount = carepathTasks.filter((task) =>
        task.workflowPhase === phase
        && riskyTaskStatuses.includes(task.status)
        && (domain === 'Treatment hold' ? false : taskRiskDomain(task.title, task.documentName) === domain || (domain === 'High flag' && false)),
      ).length;
      const documentCount = generatedDocuments.filter((document) =>
        document.clinicalPhase === phase
        && (riskyDocumentStatuses.includes(document.status) || document.signReviewState !== 'SIGNED')
        && documentRiskDomain(document.name) === domain,
      ).length;
      const fractionCount = domain === 'Fraction approval' && phase === 'ON_TREATMENT' ? fractionIssues.length : 0;
      const holdCount = domain === 'Treatment hold' && (phase === 'PLANNING' || phase === 'ON_TREATMENT') ? treatmentHolds.length : 0;
      const flagCount = domain === 'High flag' && phase === 'PLANNING' ? highFlags.length : 0;
      const auditCount = domain === 'Audit gap' ? generatedDocuments.filter((document) => document.clinicalPhase === phase && !document.auditReady).length : 0;
      const value = taskCount + documentCount + fractionCount + holdCount + flagCount + auditCount;

      return {
        domain,
        phase,
        phaseLabel: carepathPhaseLabels[phase],
        domainIndex,
        phaseIndex,
        value,
        severity: riskTone(value * 2),
      };
    }),
  );
  const fractionWatch = fractionIssues
    .sort((a, b) => b.priorityScore - a.priorityScore || a.entry.courseId.localeCompare(b.entry.courseId))
    .slice(0, 5)
    .map<FractionApprovalWatchItem>(({ entry, issue, priorityScore }) => ({
      id: entry.id,
      courseRef: courseRefFor(entry.courseId, refs),
      fraction: `Fx ${entry.fractionNumber}`,
      issue,
      approvalState: `MD ${entry.mdApprovalState ?? (entry.mdApproval ? 'APPROVED' : 'PENDING')} · DOT ${entry.dotApprovalState ?? (entry.dotApproval ? 'APPROVED' : 'PENDING')}`,
      calculation: entry.calculationStatus?.replaceAll('_', ' ') ?? 'Standard calc',
      tone: priorityScore >= 10 ? 'error' : 'warning',
      priorityScore,
    }));
  const interventions = [
    ...blockedTasks.map<InterventionQueueItem>((task) => ({
      id: task.id,
      courseRef: courseRefFor(task.courseId, refs),
      action: task.noteAction,
      owner: responsiblePartyLabels[task.responsibleParty],
      phase: carepathPhaseLabels[task.workflowPhase],
      dueState: dueState(task.dueDate, asOf),
      reasonCategory: taskRiskDomain(task.title, task.documentName),
      tone: 'error',
      priorityScore: taskPriority(task.status, task.dueDate, asOf),
    })),
    ...fractionWatch.map<InterventionQueueItem>((item) => ({
      id: item.id,
      courseRef: item.courseRef,
      action: item.issue,
      owner: responsiblePartyLabels.RTT,
      phase: carepathPhaseLabels.ON_TREATMENT,
      dueState: 'Before next treatment',
      reasonCategory: 'Fraction approval',
      tone: item.tone,
      priorityScore: item.priorityScore,
    })),
    ...unsignedCriticalDocuments.map<InterventionQueueItem>((document) => ({
      id: document.id,
      courseRef: courseRefFor(document.courseId, refs),
      action: document.requiredAction,
      owner: responsiblePartyLabels[document.responsibleParty],
      phase: carepathPhaseLabels[document.clinicalPhase],
      dueState: 'Signature path',
      reasonCategory: documentRiskDomain(document.name),
      tone: documentStatusTone(document.status),
      priorityScore: documentPriority(document.status, document.signReviewState),
    })),
  ]
    .sort((a, b) => b.priorityScore - a.priorityScore || a.courseRef.localeCompare(b.courseRef))
    .slice(0, 5);

  return {
    safetyScore: {
      score: safetyScore,
      label: safetyScore >= 85 ? 'Stable' : safetyScore >= 70 ? 'Watch' : safetyScore >= 50 ? 'Intervene' : 'Critical',
      detail: `${totalPoints} weighted risk points across ${components.reduce((sum, item) => sum + item.value, 0)} signals`,
      components,
    },
    riskGraph: {
      nodes: [...domainNodes, ...courseNodes],
      links: graphLinks,
    },
    safetyMatrix: {
      domains,
      phases: orderedCarepathPhases.map((phase) => carepathPhaseLabels[phase]),
      cells: matrixCells,
    },
    fractionWatch,
    interventions,
    phiAssurance: [
      { label: 'Client payload', value: 'Tokenized', detail: 'No direct identifiers in dashboard telemetry', tone: 'success' },
      { label: 'PHI boundary', value: 'Isolated', detail: 'PHI vault is not exposed to dashboard charts', tone: 'success' },
      { label: 'Audit events', value: operationalAuditEvents().length, detail: 'Redacted operational audit stream', tone: 'info' },
      { label: 'Risk tooltips', value: 'Safe', detail: 'Plain labels only, no raw HTML formatter', tone: 'success' },
    ],
  };
}

export function getDashboardTelemetry(): DashboardTelemetry {
  const patients = operationalPatients();
  const courses = operationalTreatmentCourses();
  const appointments = operationalAppointments();
  const flags = operationalPriorityFlags();
  const auditEvents = operationalAuditEvents();
  const upcoming = courses.filter((course) => course.chartRoundsPhase === 'UPCOMING').length;
  const active = courses.filter((course) => course.chartRoundsPhase === 'ON_TREATMENT').length;
  const post = courses.filter((course) => course.chartRoundsPhase === 'POST').length;
  const openTasks = carepathTasks.filter((task) => !completedTaskStatuses.includes(task.status)).length;
  const blockedTasks = carepathTasks.filter((task) => task.status === 'BLOCKED').length;
  const signatureQueue = generatedDocuments.filter((document) => document.signReviewState !== 'SIGNED').length;
  const readyDocuments = generatedDocuments.filter((document) => readyDocumentStatuses.includes(document.status)).length;
  const completedFractions = fractionLogEntries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const highFlags = flags.filter((flag) => flag.severity === 'HIGH').length;
  const carepathLoad = openTasks + signatureQueue + highFlags;
  const loadPercent = Math.round((carepathLoad / Math.max(carepathTasks.length + generatedDocuments.length, 1)) * 100);
  const prepLoad = Math.max(1, upcoming + countTasksByPhase(['CONSULTATION', 'CHART_PREP', 'SIMULATION']));
  const planningLoad = Math.max(1, countTasksByPhase(['PLANNING']));
  const deliveryLoad = Math.max(1, active + countTasksByPhase(['ON_TREATMENT']));
  const closeoutLoad = Math.max(1, post + countTasksByPhase(['POST_TX', 'AUDIT', 'CLOSED']));
  const stageIds: DashboardSignalStageId[] = ['chart-prep', 'planning', 'delivery', 'closeout'];
  const stageLoads: Record<DashboardSignalStageId, number> = {
    'chart-prep': prepLoad,
    planning: planningLoad,
    delivery: deliveryLoad,
    closeout: closeoutLoad,
  };
  const maxStageLoad = Math.max(...Object.values(stageLoads), 1);
  const signalStages = stageIds.map<DashboardSignalStageSummary>((stageId) => ({
    id: stageId,
    label: stageLabels[stageId],
    count: stageLoads[stageId],
    pressure: Math.max(8, Math.round((stageLoads[stageId] / maxStageLoad) * 100)),
  }));
  const stageNodes = signalStages.map<DashboardSignalNode>((stage) => ({
    id: `stage-${stage.id}`,
    label: stage.label,
    group: 'stage',
    stage: stage.id,
    value: stage.count,
    detail: `${stage.count} active items`,
  }));
  const courseNodes = courses.slice(0, 8).map<DashboardSignalNode>((course) => ({
    id: course.courseRef,
    label: course.courseRef,
    group: 'course',
    stage: courseStage(course.chartRoundsPhase),
    value: Math.max(2, course.currentFraction),
    detail: `${course.currentFraction}/${course.totalFractions} fx`,
  }));
  const satelliteNodes: DashboardSignalNode[] = [
    { id: 'task-blocked', label: 'Blocked work', group: 'task', stage: 'planning', value: Math.max(1, blockedTasks), detail: `${blockedTasks} blocked` },
    { id: 'document-signature', label: 'Signature queue', group: 'document', stage: 'closeout', value: signatureQueue, detail: `${signatureQueue} pending` },
    { id: 'risk-attention', label: 'Risk attention', group: 'risk', stage: 'planning', value: highFlags + blockedTasks, detail: `${highFlags} high flags` },
  ];
  const patientNodes = patients.slice(0, 8).map<DashboardSignalNode>((patient) => ({
    id: patient.patientRef,
    label: patient.patientRef,
    group: 'patient',
    stage: courseStage(patient.chartRoundsPhase),
    value: patient.flags.length + 2,
    detail: stageLabels[courseStage(patient.chartRoundsPhase)],
  }));
  const links: DashboardSignalLink[] = courses.slice(0, 8).flatMap((course) => {
    const stageId = courseStage(course.chartRoundsPhase);

    return [
      { source: course.patientRef, target: course.courseRef, value: 2 },
      { source: course.courseRef, target: `stage-${stageId}`, value: Math.max(1, course.currentFraction) },
    ];
  });
  const laneTone: Record<DashboardSignalStageId, CarepathLaneToken['tone']> = {
    'chart-prep': 'info',
    planning: 'warning',
    delivery: 'success',
    closeout: 'primary',
  };
  const carepathLanes = stageIds.map<CarepathLaneDatum>((stageId, stageIndex) => {
    const stageCourses = courses.filter((course) => courseStage(course.chartRoundsPhase) === stageId).slice(0, 3);
    const nextStageId = stageIds[stageIndex + 1];
    const fallbackTokens = Array.from({ length: Math.min(3, Math.max(1, Math.ceil(stageLoads[stageId] / Math.max(maxStageLoad, 1) * 3))) }, (_, index) => ({
      id: `${stageId}-queue-${index + 1}`,
      label: `Q${index + 1}`,
      offset: (index * 23 + stageIndex * 11) % 62,
      tone: laneTone[stageId],
    }));
    const tokens = stageCourses.length > 0
      ? stageCourses.map((course, index) => ({
        id: course.courseRef,
        label: course.courseRef,
        offset: (index * 19 + stageIndex * 13) % 64,
        tone: laneTone[stageId],
      }))
      : fallbackTokens;

    return {
      id: stageId,
      label: stageLabels[stageId],
      count: stageLoads[stageId],
      pressure: Math.max(8, Math.round((stageLoads[stageId] / maxStageLoad) * 100)),
      handoff: nextStageId
        ? Math.max(1, Math.round((stageLoads[stageId] + stageLoads[nextStageId]) / 2))
        : Math.max(1, readyDocuments),
      tokens,
    };
  });

  return {
    metrics: [
      { label: 'Operational patients', value: patients.length, detail: 'Tokenized registry', icon: 'patients', trend: [12, 18, 17, 24, 21, patients.length] },
      { label: 'Treatment cadence', value: appointments.length, detail: 'Today schedule', icon: 'schedule', trend: [8, 11, 9, 14, 12, appointments.length] },
      { label: 'Open work', value: openTasks, detail: `${blockedTasks} blocked`, icon: 'tasks', trend: [20, 17, 19, 13, 15, openTasks] },
      { label: 'Documents ready', value: readyDocuments, detail: `${signatureQueue} signatures`, icon: 'documents', trend: [5, 9, 11, 10, 14, readyDocuments] },
    ],
    signal: {
      nodes: [...stageNodes, ...patientNodes, ...courseNodes, ...satelliteNodes],
      links: [
        ...links,
        { source: 'stage-chart-prep', target: 'stage-planning', value: prepLoad },
        { source: 'stage-planning', target: 'stage-delivery', value: planningLoad },
        { source: 'stage-delivery', target: 'stage-closeout', value: deliveryLoad },
        { source: 'task-blocked', target: 'stage-planning', value: Math.max(1, blockedTasks) },
        { source: 'stage-delivery', target: 'document-signature', value: Math.max(1, signatureQueue) },
        { source: 'document-signature', target: 'stage-closeout', value: Math.max(1, readyDocuments) },
        { source: 'risk-attention', target: 'stage-planning', value: Math.max(1, highFlags) },
      ],
      stages: signalStages,
      loadPercent,
      summary: `${highFlags} high-priority flags, ${blockedTasks} blocked tasks, ${signatureQueue} signatures`,
    },
    carepathLanes,
    courseDistribution: [
      { name: 'Upcoming', value: upcoming, color: 'var(--color-info)' },
      { name: 'On Tx', value: active, color: 'var(--color-success)' },
      { name: 'Post', value: post, color: 'var(--color-primary)' },
    ],
    throughput: [
      { day: 'Mon', fractions: 18, activeLoad: active + 4 },
      { day: 'Tue', fractions: 24, activeLoad: active + 7 },
      { day: 'Wed', fractions: 20, activeLoad: active + 5 },
      { day: 'Thu', fractions: 29, activeLoad: active + 8 },
      { day: 'Fri', fractions: 25, activeLoad: active + 6 },
      { day: 'Sat', fractions: 21, activeLoad: active + 3 },
      { day: 'Sun', fractions: Math.max(4, completedFractions + active), activeLoad: active },
    ],
    attention: [
      { label: 'High-priority flags', value: highFlags, color: 'var(--color-error)' },
      { label: 'Blocked tasks', value: blockedTasks, color: 'var(--color-warning)' },
      { label: 'Pending signatures', value: signatureQueue, color: 'var(--color-info)' },
      { label: 'Audit events today', value: auditEvents.length, color: 'var(--color-primary)' },
    ],
    capacityBands: buildCapacityBands(),
    providerLoad: buildProviderLoad(),
    carepath: buildCarepathTelemetry(courses),
    risk: buildRiskTelemetry(courses),
    phiBoundary: {
      nodes: [
        { id: 'client', label: 'Dashboard client', detail: 'Tokenized telemetry only', x: 10, y: 56, tone: 'primary' },
        { id: 'api', label: 'Operational API', detail: 'Server derivation layer', x: 34, y: 24, tone: 'info' },
        { id: 'ops', label: 'OPS DB', detail: 'Course/task refs', x: 64, y: 20, tone: 'success' },
        { id: 'redaction', label: 'Redaction gate', detail: 'PHI keys stripped', x: 42, y: 68, tone: 'warning' },
        { id: 'audit', label: 'Audit stream', detail: `${auditEvents.length} events today`, x: 72, y: 66, tone: 'info' },
        { id: 'phi', label: 'PHI vault', detail: 'Identifiers isolated', x: 92, y: 42, tone: 'error' },
      ],
      links: [
        { source: 'client', target: 'api', label: 'read model' },
        { source: 'api', target: 'ops', label: 'token refs' },
        { source: 'api', target: 'redaction', label: 'sanitize' },
        { source: 'redaction', target: 'client', label: 'safe payload' },
        { source: 'api', target: 'audit', label: 'append' },
        { source: 'ops', target: 'phi', label: 'no client route', isolated: true },
      ],
    },
  };
}
