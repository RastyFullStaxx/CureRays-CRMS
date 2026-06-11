import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalAppointments,
  operationalAuditEvents,
  operationalPatients,
  operationalPriorityFlags,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';
import type { CarepathWorkflowPhase } from '@/lib/types';

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
  phiBoundary: {
    nodes: PhiGraphNode[];
    links: PhiGraphLink[];
  };
};

const completedTaskStatuses = ['COMPLETED', 'SIGNED', 'CLOSED', 'UPLOADED', 'NOT_APPLICABLE'];
const readyDocumentStatuses = ['SIGNED', 'EXPORTED', 'UPLOADED'];
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
