import 'server-only';

import {
  carepathTasks,
  generatedDocuments,
  operationalAppointments,
  operationalTreatmentCourses,
  patientCourseWorkflowSteps,
} from '@/lib/clinical-store';
import { PROTOTYPE_OPERATIONAL_AS_OF } from '@/lib/operational-date';
import type { StatusTone } from '@/lib/status-utils';
import type {
  CarepathTask,
  CarepathTaskStatus,
  CarepathWorkflowPhase,
  DocumentStatus,
  OperationalTreatmentCourse,
  WorkflowStep,
} from '@/lib/types';
import { formatUiLabel } from '@/lib/ui-copy';
import { responsiblePartyLabels } from '@/lib/workflow';

export interface DashboardOperationsItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
  status: string;
  tone: StatusTone;
  href: string;
}

export interface DashboardOperationsSnapshot {
  generatedAt: string;
  metrics: {
    appointmentsToday: number;
    actionableTasks: number;
    blockedWork: number;
    documentsAwaitingReview: number;
  };
  priorityQueue: DashboardOperationsItem[];
  todaySchedule: DashboardOperationsItem[];
  exceptions: DashboardOperationsItem[];
}

const completedTaskStatuses: CarepathTaskStatus[] = [
  'COMPLETED',
  'SIGNED',
  'CLOSED',
  'UPLOADED',
  'NOT_APPLICABLE',
];

const documentReviewStatuses: DocumentStatus[] = [
  'READY_FOR_REVIEW',
  'NEEDS_REVIEW',
  'BLOCKED',
  'OVERDUE',
  'MISSING_FIELDS',
];

function dateKey(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function dueState(dueDate: string | undefined, today: string) {
  if (!dueDate) return 'No Due Date';
  if (dueDate < today) return 'Overdue';
  if (dueDate === today) return 'Due Today';
  return 'Upcoming';
}

function taskTone(task: CarepathTask, today: string): StatusTone {
  if (task.status === 'BLOCKED' || task.status === 'OVERDUE' || dueState(task.dueDate, today) === 'Overdue') return 'negative';
  if (task.status === 'NEEDS_REVIEW' || task.status === 'READY_FOR_REVIEW') return 'intermediate';
  return 'neutral';
}

function taskPriority(task: CarepathTask, today: string) {
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
  const dueScore = dueState(task.dueDate, today) === 'Overdue'
    ? 4
    : dueState(task.dueDate, today) === 'Due Today'
      ? 3
      : 0;

  return statusScore[task.status] + dueScore;
}

function workspaceTab(phase: CarepathWorkflowPhase) {
  if (phase === 'ON_TREATMENT') return 'treatment';
  if (['POST_TX', 'AUDIT', 'CLOSED'].includes(phase)) return 'record-closeout';
  return 'prepare';
}

function workspaceHref(
  course: OperationalTreatmentCourse | undefined,
  tab: string,
  targetKind?: 'step' | 'document',
  targetId?: string,
) {
  if (!course) return null;
  const params = new URLSearchParams({ tab });
  if (targetKind && targetId) {
    params.set('targetKind', targetKind);
    params.set('targetId', targetId);
  }
  return `/patients/${encodeURIComponent(course.patientRef)}?${params.toString()}`;
}

function stepForTask(task: CarepathTask) {
  const stepNumber = Number(task.taskNumber.match(/\d+$/)?.[0]);
  return Number.isFinite(stepNumber)
    ? patientCourseWorkflowSteps.find((step) => step.courseId === task.courseId && step.stepNumber === stepNumber)
    : undefined;
}

function taskItem(
  task: CarepathTask,
  today: string,
  courses: Map<string, OperationalTreatmentCourse>,
): DashboardOperationsItem | null {
  const step = stepForTask(task);
  const course = courses.get(task.courseId);
  const href = workspaceHref(course, workspaceTab(task.workflowPhase), step ? 'step' : undefined, step?.id);
  if (!course || !href) return null;

  return {
    id: task.id,
    title: task.title,
    detail: `${course.courseRef} / ${task.documentName}`,
    meta: `${responsiblePartyLabels[task.responsibleParty]} / ${dueState(task.dueDate, today)}`,
    status: formatUiLabel(task.status),
    tone: taskTone(task, today),
    href,
  };
}

function stepException(
  step: WorkflowStep,
  courses: Map<string, OperationalTreatmentCourse>,
): DashboardOperationsItem | null {
  const course = courses.get(step.courseId);
  const href = workspaceHref(course, workspaceTab(step.phase), 'step', step.id);
  if (!course || !href) return null;

  return {
    id: `step-${step.id}`,
    title: step.stepName,
    detail: `${course.courseRef} / ${formatUiLabel(step.phase)}`,
    meta: step.blockers[0] ?? 'Workflow step is blocked',
    status: 'Blocked',
    tone: 'negative',
    href,
  };
}

export function getDashboardOperations(
  asOf: Date = new Date(PROTOTYPE_OPERATIONAL_AS_OF),
): DashboardOperationsSnapshot {
  const today = dateKey(asOf);
  const courses = operationalTreatmentCourses();
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const appointments = operationalAppointments()
    .filter((appointment) => appointment.dateTime?.slice(0, 10) === today && appointment.status !== 'CANCELLED');
  const openTasks = carepathTasks.filter((task) => !completedTaskStatuses.includes(task.status));
  const blockedSteps = patientCourseWorkflowSteps.filter((step) => step.status === 'BLOCKED' || step.blockers.length > 0);
  const blockedTasks = openTasks.filter((task) => task.status === 'BLOCKED');
  const heldCourses = courses.filter((course) => course.status === 'ON_HOLD');
  const documentsAwaitingReview = generatedDocuments.filter((document) =>
    documentReviewStatuses.includes(document.status)
    || document.signReviewState === 'READY_FOR_SIGNATURE'
    || document.signReviewState === 'REVIEW_REQUIRED',
  );
  const priorityCandidates = openTasks
    .filter((task) => task.status === 'OVERDUE' || dueState(task.dueDate, today) === 'Overdue');
  const priorityTasks = (priorityCandidates.length > 0
    ? priorityCandidates
    : openTasks.filter((task) => dueState(task.dueDate, today) === 'Due Today')
  );
  const usefulTasks = priorityTasks.length > 0 ? priorityTasks : openTasks;
  const priorityQueue = usefulTasks
    .sort((left, right) => taskPriority(right, today) - taskPriority(left, today)
      || (left.dueDate ?? '').localeCompare(right.dueDate ?? '')
      || left.id.localeCompare(right.id))
    .map((task) => taskItem(task, today, coursesById))
    .filter((item): item is DashboardOperationsItem => item !== null)
    .slice(0, 5);
  const todaySchedule = appointments
    .sort((left, right) => left.time.localeCompare(right.time))
    .map<DashboardOperationsItem | null>((appointment) => {
      const course = appointment.courseId ? coursesById.get(appointment.courseId) : undefined;
      const step = appointment.linkedWorkflowStepId
        ? patientCourseWorkflowSteps.find((item) => item.id === appointment.linkedWorkflowStepId)
        : undefined;
      const href = workspaceHref(
        course,
        workspaceTab(step?.phase ?? (
          appointment.chartRoundsPhase === 'POST'
            ? 'POST_TX'
            : appointment.chartRoundsPhase === 'UPCOMING'
              ? 'CHART_PREP'
              : 'ON_TREATMENT'
        )),
        step ? 'step' : undefined,
        step?.id,
      );
      if (!course || !href) return null;

      return {
        id: appointment.id,
        title: appointment.title,
        detail: `${appointment.displayLabel} / ${course.courseRef}`,
        meta: `${appointment.time} / ${appointment.location}`,
        status: formatUiLabel(appointment.status ?? 'SCHEDULED'),
        tone: appointment.status === 'MISSED' ? 'negative' : 'neutral',
        href,
      };
    })
    .filter((item): item is DashboardOperationsItem => item !== null)
    .slice(0, 3);
  const stepExceptions = blockedSteps
    .map((step) => stepException(step, coursesById))
    .filter((item): item is DashboardOperationsItem => item !== null);
  const overdueTaskExceptions = openTasks
    .filter((task) => dueState(task.dueDate, today) === 'Overdue')
    .map((task) => taskItem(task, today, coursesById))
    .filter((item): item is DashboardOperationsItem => item !== null);
  const documentExceptions = documentsAwaitingReview
    .map<DashboardOperationsItem | null>((document) => {
      const course = coursesById.get(document.courseId);
      const href = workspaceHref(course, 'record-closeout', 'document', document.id);
      if (!course || !href) return null;

      return {
        id: `document-${document.id}`,
        title: document.requiredAction,
        detail: `${course.courseRef} / ${document.name}`,
        meta: document.assignedTo,
        status: formatUiLabel(document.status),
        tone: ['BLOCKED', 'OVERDUE', 'MISSING_FIELDS'].includes(document.status) ? 'negative' : 'intermediate',
        href,
      };
    })
    .filter((item): item is DashboardOperationsItem => item !== null);
  const configurationExceptions = courses
    .filter((course) => !course.workflowDefinitionId
      || !patientCourseWorkflowSteps.some((step) => step.courseId === course.id))
    .map<DashboardOperationsItem | null>((course) => {
      const href = workspaceHref(course, 'prepare');
      if (!href) return null;
      return {
        id: `configuration-${course.id}`,
        title: 'Configure Course Workflow',
        detail: `${course.courseRef} / ${course.protocolFamily}`,
        meta: 'Workflow configuration is missing',
        status: 'Blocked',
        tone: 'negative',
        href,
      };
    })
    .filter((item): item is DashboardOperationsItem => item !== null);

  return {
    generatedAt: asOf.toISOString(),
    metrics: {
      appointmentsToday: appointments.length,
      actionableTasks: openTasks.length,
      blockedWork: blockedSteps.length + blockedTasks.length + heldCourses.length,
      documentsAwaitingReview: documentsAwaitingReview.length,
    },
    priorityQueue,
    todaySchedule,
    exceptions: [
      ...stepExceptions,
      ...overdueTaskExceptions,
      ...documentExceptions,
      ...configurationExceptions,
    ].slice(0, 3),
  };
}
