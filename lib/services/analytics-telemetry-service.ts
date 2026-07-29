import 'server-only';

import {
  auditChecks,
  billingItems,
  carepathTasks,
  documentRequirements,
  fractionLogEntries,
  generatedDocuments,
  operationalAuditEvents,
  operationalPatients,
  operationalTreatmentCourses,
  templateSources,
  workflowDefinitions,
} from '@/lib/services/operational-page-service';
import {
  operationalAppointments,
  operationalPriorityFlags,
} from '@/lib/clinical-store';
import type {
  CarepathWorkflowPhase,
} from '@/lib/types';
import {
  auditReadinessScore,
  carepathPhaseLabels,
  chartRoundsPhaseLabels,
  completedTaskStatuses,
  documentRiskHotspots,
  documentStatusCounts,
  fractionLogCompletionSignals,
  generateAnalyticsInsights,
  orderedCarepathPhases,
  orderedResponsibleParties,
  responsiblePartyLabels,
  workflowBottlenecksByParty,
} from '@/lib/workflow';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import { statusToneToken, type StatusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';

export type AnalyticsPanel =
  | 'overview'
  | 'workflow'
  | 'treatment'
  | 'documents'
  | 'staffing'
  | 'billing-risk';

export type AnalyticsTone = StatusTone;

export type AnalyticsKpi = {
  label: string;
  value: string | number;
  detail: string;
  tone: AnalyticsTone;
};

export type AnalyticsActivityPoint = {
  label: string;
  dayOffset: number;
  fractions: number;
  documents: number;
  tasks: number;
};

export type AnalyticsInsight = {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  evidence: string;
  recommendation: string;
  inspection: string;
  tone: AnalyticsTone;
};

export type AnalyticsDistributionDatum = {
  label: string;
  value: number;
  tone: AnalyticsTone;
  color: string;
};

export type AnalyticsPhaseLoadDatum = {
  phase: CarepathWorkflowPhase;
  label: string;
  open: number;
  review: number;
  blocked: number;
  total: number;
  tone: AnalyticsTone;
};

export type AnalyticsHeatmapCell = {
  x: number;
  y: number;
  value: number;
  blocked: number;
  review: number;
  xLabel: string;
  yLabel: string;
  tone: AnalyticsTone;
};

export type AnalyticsQueueItem = {
  id: string;
  courseRef: string;
  label: string;
  owner: string;
  phase: string;
  status: string;
  signal: string;
  score: number;
  tone: AnalyticsTone;
};

export type AnalyticsRoleLoad = {
  role: string;
  assigned: number;
  review: number;
  overdue: number;
  documents: number;
  pressure: number;
  tone: AnalyticsTone;
};

export type AnalyticsTreatmentProgress = {
  courseRef: string;
  protocol: string;
  phase: string;
  completed: number;
  total: number;
  percent: number;
  status: string;
  tone: AnalyticsTone;
};

export type AnalyticsThroughputPoint = {
  label: string;
  fractions: number;
  approvals: number;
  reviews: number;
};

export type AnalyticsDocumentAging = {
  bucket: string;
  count: number;
  signatures: number;
  risk: number;
};

export type AnalyticsTemplateCoverage = {
  label: string;
  active: number;
  draft: number;
  mapping: number;
  missing: number;
  total: number;
};

export type AnalyticsBillingReadiness = {
  label: string;
  value: number;
  tone: AnalyticsTone;
};

export type AnalyticsRiskRankDatum = {
  label: string;
  value: number;
  tone: AnalyticsTone;
};

export type AnalyticsPhiSignal = {
  label: string;
  value: string | number;
  detail: string;
  tone: AnalyticsTone;
};

export type AnalyticsTelemetry = {
  panels: AnalyticsPanel[];
  asOfLabel: string;
  sampleNotice: string;
  overview: {
    kpis: AnalyticsKpi[];
    activityTrend: AnalyticsActivityPoint[];
    diagnosisMix: AnalyticsDistributionDatum[];
    phaseMix: AnalyticsDistributionDatum[];
    insights: AnalyticsInsight[];
  };
  workflow: {
    phaseLoad: AnalyticsPhaseLoadDatum[];
    phaseOwnerHeatmap: {
      phases: string[];
      owners: string[];
      cells: AnalyticsHeatmapCell[];
    };
    courseDrilldown: AnalyticsQueueItem[];
    insights: AnalyticsInsight[];
  };
  treatment: {
    throughput: AnalyticsThroughputPoint[];
    courseProgress: AnalyticsTreatmentProgress[];
    signals: AnalyticsKpi[];
    insights: AnalyticsInsight[];
  };
  documents: {
    lifecycle: AnalyticsDistributionDatum[];
    signatureAging: AnalyticsDocumentAging[];
    templateCoverage: AnalyticsTemplateCoverage[];
    evidenceMatrix: {
      phases: string[];
      domains: string[];
      cells: AnalyticsHeatmapCell[];
    };
    insights: AnalyticsInsight[];
  };
  staffing: {
    roleLoad: AnalyticsRoleLoad[];
    capacityBands: Array<{
      label: string;
      treatment: number;
      simulation: number;
      review: number;
      pressure: number;
      capacity: number;
      tone: AnalyticsTone;
    }>;
    providerPressure: Array<{
      provider: string;
      appointments: number;
      capacity: number;
      pressure: number;
      tone: AnalyticsTone;
    }>;
    insights: AnalyticsInsight[];
  };
  billingRisk: {
    billingReadiness: AnalyticsBillingReadiness[];
    auditReadiness: AnalyticsDistributionDatum[];
    topCourseRisks: AnalyticsRiskRankDatum[];
    riskDomains: AnalyticsRiskRankDatum[];
    phiBoundary: AnalyticsPhiSignal[];
    insights: AnalyticsInsight[];
  };
};

const panels: AnalyticsPanel[] = [
  'overview',
  'workflow',
  'treatment',
  'documents',
  'staffing',
  'billing-risk',
];

const readyDocumentStatuses = ['SIGNED', 'EXPORTED', 'UPLOADED', 'COMPLETED', 'CLOSED', 'NOT_APPLICABLE'];
const reviewDocumentStatuses = ['READY_FOR_REVIEW', 'NEEDS_REVIEW', 'PENDING_NEEDED', 'PENDING', 'MISSING_FIELDS'];
const blockedDocumentStatuses = ['BLOCKED', 'OVERDUE', 'MISSING_FIELDS'];

function parseDate(value: string | undefined) {
  if (!value) {
    return Number.NaN;
  }

  const normalized = value.includes('T') ? value : `${value}T12:00:00+08:00`;
  return Date.parse(normalized);
}

function asOfDate() {
  const timestamps = [
    ...carepathTasks.flatMap((task) => [task.lastUpdatedAt, task.dueDate, task.completedAt, task.signedAt]),
    ...generatedDocuments.flatMap((document) => [document.lastUpdatedAt, document.signedAt, document.exportedAt]),
    ...fractionLogEntries.map((entry) => entry.correctedAt ?? entry.revisionRequestedAt ?? entry.voidedAt ?? entry.date),
  ]
    .map(parseDate)
    .filter(Number.isFinite);

  return new Date(Math.max(...timestamps, Date.now()));
}

function shortDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value);
}

function daysBetween(value: string | undefined, asOf: Date) {
  const parsed = parseDate(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.round((asOf.getTime() - parsed) / 86_400_000));
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

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays <= 2) return `Due in ${diffDays}d`;
  return 'Scheduled';
}

function pressureTone(value: number): AnalyticsTone {
  if (value >= 85) return 'negative';
  if (value >= 65) return 'intermediate';
  return 'neutral';
}

function severityTone(severity: AnalyticsInsight['severity']): AnalyticsTone {
  if (severity === 'HIGH') return 'negative';
  if (severity === 'MEDIUM') return 'intermediate';
  return 'neutral';
}

function courseRefMap() {
  return operationalTreatmentCourses().reduce<Record<string, string>>((current, course) => {
    current[course.id] = course.courseRef;
    return current;
  }, {});
}

function courseRefFor(courseId: string, refs: Record<string, string>) {
  return refs[courseId] ?? courseId.replace('COURSE-', 'CRS-');
}

function appointmentHour(time: string) {
  const [hour] = time.split(':');
  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : 12;
}

function appointmentMode(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes('treatment') || normalized.includes('fraction')) return 'treatment';
  if (normalized.includes('sim') || normalized.includes('mapping')) return 'simulation';
  return 'review';
}

function taskPriority(status: string, dueDate: string | undefined, asOf: Date) {
  const dueLabel = dueState(dueDate, asOf);
  const dueBoost = dueLabel === 'Overdue' ? 4 : dueLabel === 'Due today' ? 3 : dueLabel.startsWith('Due in') ? 2 : 0;
  const statusScore: Record<string, number> = {
    BLOCKED: 12,
    OVERDUE: 12,
    NEEDS_REVIEW: 8,
    READY_FOR_REVIEW: 7,
    IN_PROGRESS: 4,
    PENDING: 3,
    NOT_STARTED: 2,
  };

  return (statusScore[status] ?? 0) + dueBoost;
}

function documentPriority(status: string, signReviewState: string) {
  const statusScore: Record<string, number> = {
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

function riskDomain(text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes('physics') || normalized.includes('isodose')) return 'Physics Review';
  if (normalized.includes('prescription') || normalized.includes('order')) return 'Prescription / Order';
  if (normalized.includes('fraction') || normalized.includes('otv') || normalized.includes('treatment')) return 'Treatment Evidence';
  if (normalized.includes('audit') || normalized.includes('billing')) return 'Audit / Billing';
  return 'Workflow Handoff';
}

function makeInsights(asOf: Date): AnalyticsInsight[] {
  const base = generateAnalyticsInsights({
    patients: operationalPatients(),
    courses: operationalTreatmentCourses(),
    tasks: carepathTasks,
    documents: generatedDocuments,
    fractions: fractionLogEntries,
  });

  return base.map((insight) => ({
    id: insight.id,
    title: insight.title,
    severity: insight.severity,
    summary: insight.summary,
    evidence: insight.evidence,
    recommendation: insight.recommendation,
    inspection: `${insight.solutionOpportunity} · model as of ${shortDate(asOf)}`,
    tone: severityTone(insight.severity),
  }));
}

function buildOverviewKpis(asOf: Date): AnalyticsKpi[] {
  const courses = operationalTreatmentCourses();
  const patients = operationalPatients();
  const openTasks = carepathTasks.filter((task) => !completedTaskStatuses.includes(task.status));
  const signatures = generatedDocuments.filter((document) => document.signReviewState !== 'SIGNED');
  const highFlags = operationalPriorityFlags().filter((flag) => flag.severity === 'HIGH');
  const auditReady = auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries);
  const holdCourses = courses.filter((course) => course.status === 'ON_HOLD').length;

  return [
    {
      label: 'Operational Cohort',
      value: patients.length,
      detail: `${courses.length} tokenized courses`,
      tone: 'neutral',
    },
    {
      label: 'Carepath Pressure',
      value: openTasks.length + signatures.length,
      detail: `${openTasks.length} tasks + ${signatures.length} signatures as of ${shortDate(asOf)}`,
      tone: openTasks.length + signatures.length > 8 ? 'intermediate' : 'neutral',
    },
    {
      label: 'Audit Readiness',
      value: `${auditReady}%`,
      detail: 'Tasks, documents, fractions',
      tone: auditReady >= 80 ? 'positive' : auditReady >= 60 ? 'intermediate' : 'negative',
    },
    {
      label: 'Intervention Watch',
      value: highFlags.length + holdCourses,
      detail: `${highFlags.length} high flags, ${holdCourses} holds`,
      tone: highFlags.length + holdCourses > 0 ? 'negative' : 'positive',
    },
  ];
}

function buildActivityTrend(asOf: Date): AnalyticsActivityPoint[] {
  const dayMs = 86_400_000;
  const asOfDay = new Date(asOf);
  asOfDay.setHours(12, 0, 0, 0);
  const offsetFor = (value: string | undefined) => {
    const parsed = parseDate(value);
    if (!Number.isFinite(parsed)) {
      return -1;
    }
    return Math.round((asOfDay.getTime() - parsed) / dayMs);
  };
  const points = Array.from({ length: 30 }, (_, index) => {
    const offset = 29 - index;
    return {
      label: shortDate(new Date(asOfDay.getTime() - offset * dayMs)),
      dayOffset: offset,
      fractions: 0,
      documents: 0,
      tasks: 0,
    };
  });
  const bump = (offset: number, key: 'fractions' | 'documents' | 'tasks') => {
    if (offset < 0 || offset > 29) {
      return;
    }
    points[29 - offset][key] += 1;
  };

  fractionLogEntries.forEach((entry) => bump(offsetFor(entry.date), 'fractions'));
  generatedDocuments.forEach((document) => bump(offsetFor(document.lastUpdatedAt), 'documents'));
  carepathTasks.forEach((task) => bump(offsetFor(task.lastUpdatedAt), 'tasks'));

  return points;
}

function buildDiagnosisMix(): AnalyticsDistributionDatum[] {
  const counts = operationalPatients().reduce<Record<string, number>>((current, patient) => {
    current[patient.diagnosisCategory] = (current[patient.diagnosisCategory] ?? 0) + 1;
    return current;
  }, {});

  return Object.entries(counts).map(([label, value], index) => ({
    label: formatUiLabel(label),
    value,
    tone: 'neutral',
    color: index === 0
      ? 'var(--color-primary)'
      : `color-mix(in srgb, var(--color-primary) ${Math.max(28, 68 - index * 12)}%, var(--color-card-muted))`,
  }));
}

function buildPhaseMix(): AnalyticsDistributionDatum[] {
  const counts = operationalPatients().reduce<Record<string, number>>((current, patient) => {
    current[patient.chartRoundsPhase] = (current[patient.chartRoundsPhase] ?? 0) + 1;
    return current;
  }, {});

  return Object.entries(chartRoundsPhaseLabels).map(([phase, label], index) => ({
    label,
    value: counts[phase] ?? 0,
    tone: 'neutral',
    color: index === 0
      ? 'var(--color-primary)'
      : `color-mix(in srgb, var(--color-primary) ${Math.max(28, 68 - index * 10)}%, var(--color-card-muted))`,
  }));
}

function buildWorkflowPhaseLoad(): AnalyticsPhaseLoadDatum[] {
  return orderedCarepathPhases.map<AnalyticsPhaseLoadDatum>((phase) => {
    const phaseTasks = carepathTasks.filter((task) => task.workflowPhase === phase);
    const phaseDocuments = generatedDocuments.filter((document) => document.clinicalPhase === phase);
    const blocked = phaseTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length
      + phaseDocuments.filter((document) => blockedDocumentStatuses.includes(document.status)).length;
    const review = phaseTasks.filter((task) => task.status === 'NEEDS_REVIEW' || task.status === 'READY_FOR_REVIEW').length
      + phaseDocuments.filter((document) => document.signReviewState !== 'SIGNED' || reviewDocumentStatuses.includes(document.status)).length;
    const total = phaseTasks.length + phaseDocuments.length;

    return {
      phase,
      label: carepathPhaseLabels[phase],
      open: Math.max(0, total - blocked - review),
      review,
      blocked,
      total,
      tone: pressureTone((blocked * 3 + review) * 20),
    };
  });
}

function buildPhaseOwnerHeatmap() {
  const owners = orderedResponsibleParties.filter((owner) =>
    carepathTasks.some((task) => task.responsibleParty === owner)
    || generatedDocuments.some((document) => document.responsibleParty === owner),
  );

  const cells = owners.flatMap((owner, y) =>
    orderedCarepathPhases.map<AnalyticsHeatmapCell>((phase, x) => {
      const tasks = carepathTasks.filter((task) => task.workflowPhase === phase && task.responsibleParty === owner && !completedTaskStatuses.includes(task.status));
      const documents = generatedDocuments.filter((document) => document.clinicalPhase === phase && document.responsibleParty === owner && (!readyDocumentStatuses.includes(document.status) || document.signReviewState !== 'SIGNED'));
      const blocked = tasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length
        + documents.filter((document) => blockedDocumentStatuses.includes(document.status)).length;
      const review = tasks.filter((task) => task.status === 'NEEDS_REVIEW' || task.status === 'READY_FOR_REVIEW').length
        + documents.filter((document) => document.signReviewState !== 'SIGNED').length;
      const value = tasks.length + documents.length;

      return {
        x,
        y,
        value,
        blocked,
        review,
        xLabel: carepathPhaseLabels[phase],
        yLabel: responsiblePartyLabels[owner],
        tone: pressureTone(blocked * 30 + review * 18 + value * 8),
      };
    }),
  );

  return {
    phases: orderedCarepathPhases.map((phase) => carepathPhaseLabels[phase]),
    owners: owners.map((owner) => responsiblePartyLabels[owner]),
    cells,
  };
}

function buildRoleLoad(): AnalyticsRoleLoad[] {
  const roleRows = workflowBottlenecksByParty(carepathTasks, generatedDocuments);
  const roleMap = new Map(roleRows.map((row) => [row.responsibleParty, row]));

  return orderedResponsibleParties
    .filter((role) => roleMap.has(role))
    .map((role) => {
      const row = roleMap.get(role);
      const assigned = row?.assignedTasks ?? 0;
      const review = row?.reviewItems ?? 0;
      const overdue = row?.overdueActions ?? 0;
      const documents = row?.pendingDocuments ?? 0;
      const pressure = Math.min(100, Math.round((assigned + review * 1.4 + overdue * 2.4 + documents * 1.2) * 12));

      return {
        role: responsiblePartyLabels[role],
        assigned,
        review,
        overdue,
        documents,
        pressure,
        tone: pressureTone(pressure),
      };
    })
    .sort((a, b) => b.pressure - a.pressure || a.role.localeCompare(b.role));
}

function buildCourseDrilldown(asOf: Date): AnalyticsQueueItem[] {
  const refs = courseRefMap();
  const taskItems = carepathTasks
    .filter((task) => !completedTaskStatuses.includes(task.status))
    .map<AnalyticsQueueItem>((task) => {
      const score = taskPriority(task.status, task.dueDate, asOf);
      return {
        id: task.id,
        courseRef: courseRefFor(task.courseId, refs),
        label: task.title,
        owner: responsiblePartyLabels[task.responsibleParty],
        phase: carepathPhaseLabels[task.workflowPhase],
        status: formatUiLabel(task.status),
        signal: dueState(task.dueDate, asOf),
        score,
        tone: pressureTone(score * 8),
      };
    });

  const documentItems = generatedDocuments
    .filter((document) => document.signReviewState !== 'SIGNED' || !readyDocumentStatuses.includes(document.status))
    .map<AnalyticsQueueItem>((document) => {
      const score = documentPriority(document.status, document.signReviewState);
      return {
        id: document.id,
        courseRef: courseRefFor(document.courseId, refs),
        label: document.name,
        owner: responsiblePartyLabels[document.responsibleParty],
        phase: carepathPhaseLabels[document.clinicalPhase],
        status: formatUiLabel(document.status),
        signal: document.signReviewState === 'SIGNED' ? 'Evidence gap' : formatUiLabel(document.signReviewState),
        score,
        tone: pressureTone(score * 8),
      };
    });

  return [...taskItems, ...documentItems]
    .sort((a, b) => b.score - a.score || a.courseRef.localeCompare(b.courseRef))
    .slice(0, 8);
}

function buildTreatmentThroughput(): AnalyticsThroughputPoint[] {
  const groups = new Map<string, AnalyticsThroughputPoint & { date: string }>();

  fractionLogEntries.forEach((entry) => {
    const current = groups.get(entry.date) ?? {
      date: entry.date,
      label: shortDate(new Date(`${entry.date}T12:00:00+08:00`)),
      fractions: 0,
      approvals: 0,
      reviews: 0,
    };

    current.fractions += 1;
    current.approvals += entry.mdApproval && entry.dotApproval ? 1 : 0;
    current.reviews += entry.status === 'NEEDS_REVIEW' || entry.status === 'REVISION_NEEDED' ? 1 : 0;
    groups.set(entry.date, current);
  });

  return [...groups.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map(({ label, fractions, approvals, reviews }) => ({ label, fractions, approvals, reviews }));
}

function buildTreatmentProgress(): AnalyticsTreatmentProgress[] {
  return operationalTreatmentCourses()
    .map((course) => {
      const percent = Math.round((course.currentFraction / Math.max(course.totalFractions, 1)) * 100);
      const tone: AnalyticsTone = course.status === 'ON_HOLD'
        ? 'negative'
        : course.chartRoundsPhase === 'ON_TREATMENT'
          ? 'positive'
          : 'neutral';

      return {
        courseRef: course.courseRef,
        protocol: course.protocolFamily,
        phase: chartRoundsPhaseLabels[course.chartRoundsPhase],
        completed: course.currentFraction,
        total: course.totalFractions,
        percent,
        status: formatUiLabel(course.status),
        tone,
      };
    })
    .sort((a, b) => a.percent - b.percent || a.courseRef.localeCompare(b.courseRef));
}

function buildTreatmentSignals(): AnalyticsKpi[] {
  const courses = operationalTreatmentCourses();
  const active = courses.filter((course) => course.chartRoundsPhase === 'ON_TREATMENT');
  const held = courses.filter((course) => course.status === 'ON_HOLD');
  const fractionSignals = fractionLogCompletionSignals(fractionLogEntries);
  const reviewFractions = fractionLogEntries.filter((entry) => entry.status === 'NEEDS_REVIEW' || entry.status === 'REVISION_NEEDED').length;

  return [
    {
      label: 'Active Tx Courses',
      value: active.length,
      detail: `${active.reduce((sum, course) => sum + course.currentFraction, 0)} fractions progressed`,
      tone: 'neutral',
    },
    {
      label: 'Approval Completion',
      value: `${fractionSignals.percent}%`,
      detail: `MD + DOT on ${fractionSignals.complete}/${fractionSignals.total} logged fractions`,
      tone: fractionSignals.percent >= 90 ? 'positive' : 'intermediate',
    },
    {
      label: 'Held Courses',
      value: held.length,
      detail: 'Requires release review',
      tone: held.length > 0 ? 'negative' : 'positive',
    },
    {
      label: 'Review Fractions',
      value: reviewFractions,
      detail: 'Revision or approval watch before next fraction',
      tone: reviewFractions > 0 ? 'intermediate' : 'positive',
    },
  ];
}

function buildDocumentLifecycle(): AnalyticsDistributionDatum[] {
  const counts = documentStatusCounts(generatedDocuments);
  const ready = readyDocumentStatuses.reduce((sum, status) => sum + (counts[status as keyof typeof counts] ?? 0), 0);
  const review = reviewDocumentStatuses.reduce((sum, status) => sum + (counts[status as keyof typeof counts] ?? 0), 0);
  const blocked = blockedDocumentStatuses.reduce((sum, status) => sum + (counts[status as keyof typeof counts] ?? 0), 0);
  const draft = counts.DRAFT + counts.NOT_STARTED + counts.IN_PROGRESS;

  return [
    { label: 'Ready / Signed', value: ready, tone: 'positive', color: statusToneToken('positive') },
    { label: 'Review Path', value: review, tone: 'intermediate', color: statusToneToken('intermediate') },
    { label: 'Blocked / Missing', value: blocked, tone: 'negative', color: statusToneToken('negative') },
    { label: 'Draft Work', value: draft, tone: 'neutral', color: statusToneToken('neutral') },
  ];
}

function buildSignatureAging(asOf: Date): AnalyticsDocumentAging[] {
  const buckets = [
    { bucket: '0-1d', min: 0, max: 1 },
    { bucket: '2-3d', min: 2, max: 3 },
    { bucket: '4-7d', min: 4, max: 7 },
    { bucket: '8d+', min: 8, max: 999 },
  ];

  return buckets.map((bucket) => {
    const documents = generatedDocuments.filter((document) => {
      const age = daysBetween(document.lastUpdatedAt, asOf);
      return age >= bucket.min && age <= bucket.max;
    });
    return {
      bucket: bucket.bucket,
      count: documents.length,
      signatures: documents.filter((document) => document.signReviewState !== 'SIGNED').length,
      risk: documents.filter((document) => blockedDocumentStatuses.includes(document.status) || document.signReviewState === 'REVIEW_REQUIRED').length,
    };
  });
}

function buildTemplateCoverage(): AnalyticsTemplateCoverage[] {
  return workflowDefinitions.map((workflow) => {
    const statuses = workflow.documentRequirementIds.map((requirementId) => {
      const requirement = documentRequirements.find((item) => item.id === requirementId);
      const source = templateSources.find((item) => item.id === requirement?.templateSourceId);
      return source?.status ?? 'MISSING';
    });

    return {
      label: `${formatUiLabel(workflow.diagnosis)} · ${workflow.protocol}`,
      active: statuses.filter((status) => status === 'ACTIVE').length,
      draft: statuses.filter((status) => status === 'DRAFT').length,
      mapping: statuses.filter((status) => status === 'MAPPING_IN_PROGRESS').length,
      missing: statuses.filter((status) => status === 'MISSING').length,
      total: statuses.length,
    };
  });
}

function buildEvidenceMatrix() {
  const domains = ['Document', 'Signature', 'Fraction', 'Billing', 'Audit'];
  const cells = domains.flatMap((domain, y) =>
    orderedCarepathPhases.map<AnalyticsHeatmapCell>((phase, x) => {
      const docCount = domain === 'Document'
        ? generatedDocuments.filter((document) => document.clinicalPhase === phase && !document.auditReady).length
        : 0;
      const signatureCount = domain === 'Signature'
        ? generatedDocuments.filter((document) => document.clinicalPhase === phase && document.signReviewState !== 'SIGNED').length
        : 0;
      const fractionCount = domain === 'Fraction' && phase === 'ON_TREATMENT'
        ? fractionLogEntries.filter((entry) => !entry.mdApproval || !entry.dotApproval || entry.status === 'NEEDS_REVIEW' || entry.status === 'REVISION_NEEDED').length
        : 0;
      const billingCount = domain === 'Billing' && (phase === 'POST_TX' || phase === 'AUDIT')
        ? billingItems.filter((item) => item.status !== 'COMPLETED' && item.status !== 'NOT_APPLICABLE').length
        : 0;
      const auditCount = domain === 'Audit' && phase === 'AUDIT'
        ? auditChecks.filter((check) => check.courseId && check.status !== 'COMPLETED' && check.status !== 'NOT_APPLICABLE').length
        : 0;
      const value = docCount + signatureCount + fractionCount + billingCount + auditCount;

      return {
        x,
        y,
        value,
        blocked: value,
        review: signatureCount,
        xLabel: carepathPhaseLabels[phase],
        yLabel: domain,
        tone: pressureTone(value * 24),
      };
    }),
  );

  return {
    phases: orderedCarepathPhases.map((phase) => carepathPhaseLabels[phase]),
    domains,
    cells,
  };
}

function buildCapacityBands() {
  const bands = [
    { label: '07-10', min: 7, max: 10, capacity: 6 },
    { label: '10-13', min: 10, max: 13, capacity: 7 },
    { label: '13-16', min: 13, max: 16, capacity: 7 },
    { label: '16-18', min: 16, max: 19, capacity: 5 },
  ];
  const appointments = operationalAppointments();

  return bands.map((band) => {
    const scoped = appointments.filter((appointment) => {
      const hour = appointmentHour(appointment.time);
      return hour >= band.min && hour < band.max;
    });
    const treatment = scoped.filter((appointment) => appointmentMode(appointment.title) === 'treatment').length;
    const simulation = scoped.filter((appointment) => appointmentMode(appointment.title) === 'simulation').length;
    const review = Math.max(0, scoped.length - treatment - simulation);
    const pressure = Math.min(100, Math.round((scoped.length / band.capacity) * 100));

    return {
      label: band.label,
      treatment,
      simulation,
      review,
      pressure,
      capacity: band.capacity,
      tone: pressureTone(pressure),
    };
  });
}

function buildProviderPressure() {
  const counts = operationalAppointments().reduce<Record<string, number>>((current, appointment) => {
    current[appointment.staff] = (current[appointment.staff] ?? 0) + 1;
    return current;
  }, {});

  return Object.entries(counts)
    .map(([provider, appointments]) => {
      const capacity = 5;
      const pressure = Math.min(100, Math.round((appointments / capacity) * 100));
      return {
        provider,
        appointments,
        capacity,
        pressure,
        tone: pressureTone(pressure),
      };
    })
    .sort((a, b) => b.pressure - a.pressure || a.provider.localeCompare(b.provider))
    .map((provider, index) => ({
      ...provider,
      provider: `Provider Slot ${index + 1}`,
    }));
}

function buildBillingReadiness(): AnalyticsBillingReadiness[] {
  const counts = billingItems.reduce<Record<string, number>>((current, item) => {
    current[item.status] = (current[item.status] ?? 0) + 1;
    return current;
  }, {});

  return [
    { label: 'Completed / Ready', value: counts.COMPLETED ?? 0, tone: 'positive' },
    { label: 'Ready For Review', value: counts.READY_FOR_REVIEW ?? 0, tone: 'intermediate' },
    { label: 'Blocked', value: counts.BLOCKED ?? 0, tone: 'negative' },
    { label: 'N/A', value: counts.NOT_APPLICABLE ?? 0, tone: 'neutral' },
  ];
}

function buildAuditReadiness(): AnalyticsDistributionDatum[] {
  const counts = auditChecks.reduce<Record<string, number>>((current, check) => {
    current[check.status] = (current[check.status] ?? 0) + 1;
    return current;
  }, {});

  return [
    { label: 'Complete', value: counts.COMPLETED ?? 0, tone: 'positive', color: statusToneToken('positive') },
    { label: 'Review', value: counts.READY_FOR_REVIEW ?? 0, tone: 'intermediate', color: statusToneToken('intermediate') },
    { label: 'Blocked', value: counts.BLOCKED ?? 0, tone: 'negative', color: statusToneToken('negative') },
    { label: 'Pending', value: counts.PENDING ?? 0, tone: 'neutral', color: statusToneToken('neutral') },
  ];
}

function buildRiskRankings() {
  const refs = courseRefMap();
  const domainScores = new Map<string, number>();
  const courseScores = new Map<string, number>();

  const addRisk = (courseRef: string, domain: string, value: number) => {
    domainScores.set(domain, (domainScores.get(domain) ?? 0) + value);
    courseScores.set(courseRef, (courseScores.get(courseRef) ?? 0) + value);
  };

  operationalPriorityFlags().forEach((flag) => {
    const course = operationalPatients().find((patient) => patient.patientRef === flag.patientRef)?.activeCourseRef ?? flag.patientRef;
    addRisk(course, 'Priority Flag', flag.severity === 'HIGH' ? 9 : 5);
  });

  carepathTasks
    .filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE' || task.status === 'NEEDS_REVIEW')
    .forEach((task) => addRisk(courseRefFor(task.courseId, refs), riskDomain(`${task.title} ${task.documentName}`), task.status === 'BLOCKED' ? 10 : 6));

  generatedDocuments
    .filter((document) => document.signReviewState !== 'SIGNED' || blockedDocumentStatuses.includes(document.status))
    .forEach((document) => addRisk(courseRefFor(document.courseId, refs), riskDomain(document.name), document.signReviewState !== 'SIGNED' ? 5 : 3));

  fractionLogEntries
    .filter((entry) => !entry.mdApproval || !entry.dotApproval || entry.status !== 'APPROVED')
    .forEach((entry) => addRisk(courseRefFor(entry.courseId, refs), 'Fraction Approval', entry.status === 'REVISION_NEEDED' ? 9 : 6));

  const topCourseRisks = [...courseScores.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map<AnalyticsRiskRankDatum>(([label, value]) => ({
      label,
      value,
      tone: pressureTone(value * 7),
    }));
  const riskDomains = [...domainScores.entries()]
    .sort(([, a], [, b]) => b - a)
    .map<AnalyticsRiskRankDatum>(([label, value]) => ({
      label,
      value,
      tone: pressureTone(value * 8),
    }));

  return { topCourseRisks, riskDomains };
}

function scopedInsights(insights: AnalyticsInsight[], keywords: string[], fallback: AnalyticsInsight[]) {
  const normalized = keywords.map((keyword) => keyword.toLowerCase());
  const scoped = insights.filter((insight) =>
    normalized.some((keyword) =>
      `${insight.title} ${insight.summary} ${insight.recommendation} ${insight.inspection}`.toLowerCase().includes(keyword),
    ),
  );

  return (scoped.length > 0 ? scoped : fallback).slice(0, 4);
}

function fallbackInsight(id: string, title: string, evidence: string, recommendation: string, tone: AnalyticsTone): AnalyticsInsight {
  return {
    id,
    title,
    severity: tone === 'negative' ? 'HIGH' : tone === 'intermediate' ? 'MEDIUM' : 'LOW',
    summary: 'Current prototype data is sparse, so the chart should be interpreted as an ops signal rather than a statistical conclusion.',
    evidence,
    recommendation,
    inspection: 'Review tokenized course queues and source module pages before operational decisions.',
    tone,
  };
}

export function isAnalyticsPanel(value: string | undefined): value is AnalyticsPanel {
  return Boolean(value && panels.includes(value as AnalyticsPanel));
}

export async function getAnalyticsTelemetry(): Promise<AnalyticsTelemetry> {
  await hydrateClinicalStoreFromDatabase();

  const asOf = asOfDate();
  const insights = makeInsights(asOf);
  const workflowPhaseLoad = buildWorkflowPhaseLoad();
  const phaseOwnerHeatmap = buildPhaseOwnerHeatmap();
  const roleLoad = buildRoleLoad();
  const treatmentSignals = buildTreatmentSignals();
  const evidenceMatrix = buildEvidenceMatrix();
  const riskRankings = buildRiskRankings();
  const documentHotspots = documentRiskHotspots(generatedDocuments);

  const workflowFallback = fallbackInsight(
    'ANL-WORKFLOW-FALLBACK',
    'Workflow pressure is concentrated where review and signature states overlap',
    `${roleLoad[0]?.role ?? 'Role queue'} has the highest modeled load.`,
    'Use the tokenized drilldown list before adding new handoffs to that lane.',
    roleLoad[0]?.tone ?? 'neutral',
  );
  const treatmentFallback = fallbackInsight(
    'ANL-TREATMENT-FALLBACK',
    'Treatment analytics should be read as course-progress control signals',
    `${treatmentSignals[1]?.value ?? '0%'} approval completion in the current fraction sample.`,
    'Escalate held courses and review fractions before the next treatment slot.',
    treatmentSignals.some((signal) => signal.tone === 'negative') ? 'negative' : 'intermediate',
  );
  const documentFallback = fallbackInsight(
    'ANL-DOCUMENT-FALLBACK',
    'Document lifecycle risk is driven by signatures and audit evidence',
    `${documentHotspots[0]?.count ?? 0} open signals in the top document family.`,
    'Close signature and evidence gaps before export or billing review.',
    documentHotspots.length > 0 ? 'intermediate' : 'neutral',
  );
  const staffingFallback = fallbackInsight(
    'ANL-STAFFING-FALLBACK',
    'Staffing pressure follows role queue load more than appointment count',
    `${roleLoad[0]?.pressure ?? 0}% modeled pressure in the highest role lane.`,
    'Balance review-heavy work before schedule slots become downstream blockers.',
    roleLoad[0]?.tone ?? 'neutral',
  );
  const billingFallback = fallbackInsight(
    'ANL-BILLING-FALLBACK',
    'Billing and audit readiness must stay tied to evidence state',
    `${auditChecks.filter((check) => check.status !== 'COMPLETED').length} audit checks remain open.`,
    'Treat billing readiness as blocked until required evidence and signatures are closed.',
    'intermediate',
  );

  return {
    panels,
    asOfLabel: shortDate(asOf),
    sampleNotice: 'All analytics are derived from the current synthetic pilot dataset; interpret trends as operational signals, not statistics.',
    overview: {
      kpis: buildOverviewKpis(asOf),
      activityTrend: buildActivityTrend(asOf),
      diagnosisMix: buildDiagnosisMix(),
      phaseMix: buildPhaseMix(),
      insights: insights.slice(0, 5),
    },
    workflow: {
      phaseLoad: workflowPhaseLoad,
      phaseOwnerHeatmap,
      courseDrilldown: buildCourseDrilldown(asOf),
      insights: scopedInsights(insights, ['workflow', 'queue', 'handoff', 'role'], [workflowFallback]),
    },
    treatment: {
      throughput: buildTreatmentThroughput(),
      courseProgress: buildTreatmentProgress(),
      signals: treatmentSignals,
      insights: scopedInsights(insights, ['fraction', 'treatment', 'course'], [treatmentFallback]),
    },
    documents: {
      lifecycle: buildDocumentLifecycle(),
      signatureAging: buildSignatureAging(asOf),
      templateCoverage: buildTemplateCoverage(),
      evidenceMatrix,
      insights: scopedInsights(insights, ['document', 'signature', 'template', 'audit'], [documentFallback]),
    },
    staffing: {
      roleLoad,
      capacityBands: buildCapacityBands(),
      providerPressure: buildProviderPressure(),
      insights: scopedInsights(insights, ['role', 'queue', 'capacity', 'staff'], [staffingFallback]),
    },
    billingRisk: {
      billingReadiness: buildBillingReadiness(),
      auditReadiness: buildAuditReadiness(),
      topCourseRisks: riskRankings.topCourseRisks,
      riskDomains: riskRankings.riskDomains,
      phiBoundary: [
        {
          label: 'Client Payload',
          value: 'Tokenized',
          detail: 'Analytics receives patient refs, course refs, aggregates, and redacted audit events only.',
          tone: 'positive',
        },
        {
          label: 'Raw PHI',
          value: 'Excluded',
          detail: 'No names, MRNs, DOBs, notes, or document previews are returned by analytics telemetry.',
          tone: 'positive',
        },
        {
          label: 'Audit Stream',
          value: operationalAuditEvents().length,
          detail: 'Operational events are redacted before reaching the analytics client.',
          tone: 'neutral',
        },
        {
          label: 'Trends',
          value: 'Actuals',
          detail: 'Trend charts plot recorded events only; no projected or modeled values are drawn.',
          tone: 'positive',
        },
      ],
      insights: scopedInsights(insights, ['billing', 'audit', 'risk', 'readiness'], [billingFallback]),
    },
  };
}
