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

export type DashboardSignalNode = {
  id: string;
  label: string;
  group: 'patient' | 'course' | 'task' | 'document' | 'risk';
  value: number;
};

export type DashboardSignalLink = {
  source: string;
  target: string;
  value: number;
};

export type CarepathFlowDatum = {
  nodes: Array<{ name: string }>;
  links: Array<{ source: number; target: number; value: number }>;
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
    loadPercent: number;
    summary: string;
  };
  carepath: CarepathFlowDatum;
  courseDistribution: CourseDistributionDatum[];
  throughput: ThroughputDatum[];
  attention: AttentionDatum[];
  capacityBands: CapacityBand[];
  providerLoad: ProviderLoad[];
  phiBoundary: {
    nodes: PhiGraphNode[];
    links: PhiGraphLink[];
    assurance: string;
  };
};

const completedTaskStatuses = ['COMPLETED', 'SIGNED', 'CLOSED', 'UPLOADED', 'NOT_APPLICABLE'];
const readyDocumentStatuses = ['SIGNED', 'EXPORTED', 'UPLOADED'];

function countTasksByPhase(phases: CarepathWorkflowPhase[]) {
  return carepathTasks.filter((task) => phases.includes(task.workflowPhase)).length;
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
  const courseNodes = courses.slice(0, 8).map<DashboardSignalNode>((course) => ({
    id: course.courseRef,
    label: course.courseRef,
    group: 'course',
    value: Math.max(2, course.currentFraction),
  }));
  const phaseNodes: DashboardSignalNode[] = [
    { id: 'phase-chart-prep', label: 'Chart prep', group: 'task', value: prepLoad },
    { id: 'phase-planning', label: 'Planning', group: 'task', value: planningLoad },
    { id: 'phase-delivery', label: 'Delivery', group: 'task', value: deliveryLoad },
    { id: 'phase-closeout', label: 'Closeout', group: 'task', value: closeoutLoad },
    { id: 'document-signature', label: 'Signature queue', group: 'document', value: signatureQueue },
    { id: 'risk-attention', label: 'Risk attention', group: 'risk', value: highFlags + blockedTasks },
  ];
  const patientNodes = patients.slice(0, 8).map<DashboardSignalNode>((patient) => ({
    id: patient.patientRef,
    label: patient.patientRef,
    group: 'patient',
    value: patient.flags.length + 2,
  }));
  const links: DashboardSignalLink[] = courses.slice(0, 8).flatMap((course) => {
    const phaseTarget = course.chartRoundsPhase === 'UPCOMING'
      ? 'phase-chart-prep'
      : course.chartRoundsPhase === 'ON_TREATMENT'
        ? 'phase-delivery'
        : 'phase-closeout';

    return [
      { source: course.patientRef, target: course.courseRef, value: 2 },
      { source: course.courseRef, target: phaseTarget, value: Math.max(1, course.currentFraction) },
    ];
  });

  return {
    metrics: [
      { label: 'Operational patients', value: patients.length, detail: 'Tokenized registry', icon: 'patients', trend: [12, 18, 17, 24, 21, patients.length] },
      { label: 'Treatment cadence', value: appointments.length, detail: 'Today schedule', icon: 'schedule', trend: [8, 11, 9, 14, 12, appointments.length] },
      { label: 'Open work', value: openTasks, detail: `${blockedTasks} blocked`, icon: 'tasks', trend: [20, 17, 19, 13, 15, openTasks] },
      { label: 'Documents ready', value: readyDocuments, detail: `${signatureQueue} signatures`, icon: 'documents', trend: [5, 9, 11, 10, 14, readyDocuments] },
    ],
    signal: {
      nodes: [...patientNodes, ...courseNodes, ...phaseNodes],
      links: [
        ...links,
        { source: 'phase-chart-prep', target: 'phase-planning', value: prepLoad },
        { source: 'phase-planning', target: 'phase-delivery', value: planningLoad },
        { source: 'phase-delivery', target: 'document-signature', value: signatureQueue },
        { source: 'document-signature', target: 'phase-closeout', value: Math.max(1, readyDocuments) },
        { source: 'risk-attention', target: 'phase-planning', value: Math.max(1, highFlags) },
      ],
      loadPercent,
      summary: `${highFlags} high-priority flags, ${blockedTasks} blocked tasks, ${signatureQueue} signatures`,
    },
    carepath: {
      nodes: [
        { name: 'Chart Prep' },
        { name: 'Planning' },
        { name: 'Delivery' },
        { name: 'Closeout' },
      ],
      links: [
        { source: 0, target: 1, value: prepLoad },
        { source: 1, target: 2, value: Math.max(1, Math.round((prepLoad + planningLoad) / 2)) },
        { source: 2, target: 3, value: Math.max(1, Math.round((deliveryLoad + closeoutLoad) / 2)) },
      ],
    },
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
        { id: 'client', label: 'Dashboard client', detail: 'Tokenized telemetry only', x: 12, y: 44, tone: 'primary' },
        { id: 'api', label: 'Operational API', detail: 'Server derivation layer', x: 34, y: 24, tone: 'info' },
        { id: 'ops', label: 'OPS DB', detail: 'Course/task refs', x: 58, y: 24, tone: 'success' },
        { id: 'redaction', label: 'Redaction gate', detail: 'PHI keys stripped', x: 46, y: 64, tone: 'warning' },
        { id: 'audit', label: 'Audit stream', detail: `${auditEvents.length} events today`, x: 72, y: 64, tone: 'info' },
        { id: 'phi', label: 'PHI vault', detail: 'Identifiers isolated', x: 88, y: 34, tone: 'error' },
      ],
      links: [
        { source: 'client', target: 'api', label: 'read model' },
        { source: 'api', target: 'ops', label: 'token refs' },
        { source: 'api', target: 'redaction', label: 'sanitize' },
        { source: 'redaction', target: 'client', label: 'safe payload' },
        { source: 'api', target: 'audit', label: 'append' },
        { source: 'ops', target: 'phi', label: 'no client route', isolated: true },
      ],
      assurance: 'Client telemetry receives operational references only; patient identifiers remain behind the PHI vault boundary.',
    },
  };
}
