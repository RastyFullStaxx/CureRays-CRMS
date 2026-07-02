import type {
  AuditCheck,
  CarepathTask,
  DocumentInstance,
  FractionLogEntry,
  GeneratedDocument,
  Phase6PlanningReadiness,
  Task,
  TreatmentCourse,
  TreatmentFraction,
  WorkflowStep,
} from '@/lib/types';
import { auditReadinessScore, responsiblePartyLabels } from '@/lib/workflow';
import { deriveFractionLogStatus, isVoidedFractionEntry } from '@/lib/services/fraction-worksheet-service';

export type PatientWorkspaceTab = 'overview' | 'prepare' | 'treatment' | 'record-closeout';

export type CourseGateState = 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';

export type WorkspaceAction = {
  id: string;
  label: string;
  owner: string;
  due?: string;
  blocking: boolean;
  destination: PatientWorkspaceTab;
  targetKind?: 'step' | 'fraction' | 'document' | 'audit';
  targetId?: string;
};

export type CourseGate = {
  state: CourseGateState;
  reasons: string[];
  evaluatedAt: string;
};

type PatientWorkspaceStateInput = {
  course: TreatmentCourse;
  fallbackNextAction: string;
  workflowSteps: WorkflowStep[];
  tasks: Task[];
  carepathTasks: CarepathTask[];
  documents: DocumentInstance[];
  generatedDocuments: GeneratedDocument[];
  fractionEntries: FractionLogEntry[];
  treatmentFractions: TreatmentFraction[];
  planningReadiness: Phase6PlanningReadiness;
  auditChecks: AuditCheck[];
};

const completedStatuses = new Set(['COMPLETED', 'SIGNED', 'UPLOADED', 'CLOSED', 'NOT_APPLICABLE']);
const legacyTabMap: Record<string, PatientWorkspaceTab> = {
  command: 'overview',
  overview: 'overview',
  carepath: 'prepare',
  workflow: 'prepare',
  tasks: 'prepare',
  prepare: 'prepare',
  treatment: 'treatment',
  planning: 'treatment',
  imaging: 'treatment',
  fractions: 'treatment',
  'documents-billing': 'record-closeout',
  documents: 'record-closeout',
  clinical: 'record-closeout',
  'billing-audit': 'record-closeout',
  activity: 'record-closeout',
  'record-closeout': 'record-closeout',
};

function latestTimestamp(values: Array<string | undefined>): string {
  return values.filter((value): value is string => Boolean(value)).sort().at(-1) ?? '';
}

function taskActionLabel(task: Task): string {
  const subject = task.title.replace(/\s+(sign|review)$/i, '').trim();
  if (task.status === 'BLOCKED') return `Resolve blocker: ${subject}`;
  if (task.type === 'SIGN_DOCUMENT') return `Review and sign ${subject}`;
  if (task.type === 'LAUNCH_DOCUMENT') return `Generate ${subject}`;
  if (task.type === 'UPLOAD_IMAGE') return `Attach evidence for ${subject}`;
  return task.title;
}

export function normalizePatientWorkspaceTab(value?: string): PatientWorkspaceTab {
  return value ? legacyTabMap[value] ?? 'overview' : 'overview';
}

export function activeWorkflowSteps(steps: WorkflowStep[]): WorkflowStep[] {
  return steps.filter((step) => step.applicability !== 'REMOVED');
}

export function derivePatientWorkspaceState(input: PatientWorkspaceStateInput) {
  const workflowSteps = activeWorkflowSteps(input.workflowSteps);
  const blockedSteps = workflowSteps.filter((step) => step.status === 'BLOCKED' || step.blockers.length > 0);
  const urgentTasks = input.tasks.filter(
    (task) => ['URGENT', 'HIGH'].includes(task.priority) || task.status === 'READY_FOR_REVIEW' || task.status === 'BLOCKED',
  );
  const unsignedDocuments = input.documents.filter(
    (document) => !document.signedAt && !completedStatuses.has(document.status),
  );
  const openAuditChecks = input.auditChecks.filter(
    (check) => check.required && !completedStatuses.has(check.status),
  );
  const activeFractions = input.fractionEntries.filter((entry) => !isVoidedFractionEntry(entry));
  const fractionStatuses = activeFractions.map((entry) => ({
    entry,
    status: deriveFractionLogStatus(entry),
  }));
  const revisionFractions = fractionStatuses.filter(({ status }) => status === 'REVISION_NEEDED');
  const reviewFractions = fractionStatuses.filter(({ status }) => status === 'NEEDS_REVIEW' || status === 'RECORDED');
  const approvedFractions = fractionStatuses.filter(({ status }) => status === 'APPROVED');
  const missingImageFractions = input.treatmentFractions.filter((fraction) => fraction.imageGuidanceStatus === 'MISSING');
  const otvDueFractions = input.treatmentFractions.filter(
    (fraction) => fraction.otvRequired && !fraction.otvCompletedAt,
  );
  const physicsDueFractions = input.treatmentFractions.filter(
    (fraction) => fraction.physicsCheckRequired && !fraction.physicsCheckCompletedAt,
  );
  const upcomingScheduledFractions = input.treatmentFractions.filter(
    (fraction) => fraction.scheduledFromPrescription && fraction.status === 'NOT_STARTED',
  );

  const actions: WorkspaceAction[] = [
    ...blockedSteps.map((step) => ({
      id: `step-${step.id}`,
      label: step.requiresSignature && !step.signedAt
        ? `Review and sign ${step.stepName.replace(/\s+sign$/i, '').trim()}`
        : `Resolve blocker: ${step.stepName}`,
      owner: step.assignedUserId ?? responsiblePartyLabels[step.responsibleRole],
      due: step.dueDate,
      blocking: true,
      destination: 'prepare' as const,
      targetKind: 'step' as const,
      targetId: step.id,
    })),
    ...urgentTasks.map((task) => ({
      id: `task-${task.id}`,
      label: taskActionLabel(task),
      owner: task.assignedUserId ?? responsiblePartyLabels[task.assignedRole],
      due: task.dueDate,
      blocking: task.status === 'BLOCKED' || task.priority === 'URGENT',
      destination: task.type === 'COMPLETE_TREATMENT_FRACTION' ? 'treatment' as const : 'prepare' as const,
      targetKind: task.workflowStepId ? 'step' as const : undefined,
      targetId: task.workflowStepId,
    })),
    ...revisionFractions.map(({ entry }) => ({
      id: `fraction-${entry.id}`,
      label: `Resolve fraction ${entry.fractionNumber} revision`,
      owner: 'Treatment team',
      due: entry.date,
      blocking: true,
      destination: 'treatment' as const,
      targetKind: 'fraction' as const,
      targetId: entry.id,
    })),
    ...reviewFractions.map(({ entry }) => ({
      id: `fraction-${entry.id}`,
      label: `Review fraction ${entry.fractionNumber}`,
      owner: !entry.dotApproval ? 'Target depth reviewer' : 'Physician reviewer',
      due: entry.date,
      blocking: false,
      destination: 'treatment' as const,
      targetKind: 'fraction' as const,
      targetId: entry.id,
    })),
    ...unsignedDocuments.map((document) => ({
      id: `document-${document.id}`,
      label: `Review and sign ${document.title}`,
      owner: document.signedByUserId ?? 'Document reviewer',
      blocking: false,
      destination: 'record-closeout' as const,
      targetKind: 'document' as const,
      targetId: document.id,
    })),
    ...openAuditChecks.map((check) => ({
      id: `audit-${check.id}`,
      label: `Complete ${check.label}`,
      owner: check.completedByUserId ?? 'Audit reviewer',
      blocking: false,
      destination: 'record-closeout' as const,
      targetKind: 'audit' as const,
      targetId: check.id,
    })),
  ];

  const blockingReasons = [
    ...blockedSteps.flatMap((step) => step.blockers.length ? step.blockers : [`${step.stepName} is blocked.`]),
    ...revisionFractions.map(({ entry }) => `Fraction ${entry.fractionNumber} requires revision.`),
    ...(input.planningReadiness.status === 'BLOCKED' ? input.planningReadiness.missingInputs : []),
  ];
  const reviewReasons = [
    ...reviewFractions.map(({ entry }) => `Fraction ${entry.fractionNumber} requires approval.`),
    ...(input.planningReadiness.clinicalValidationChecklist.productionUseBlocked
      ? ['Clinical validation must be recorded.']
      : []),
    ...(unsignedDocuments.length ? [`${unsignedDocuments.length} document(s) require signature.`] : []),
    ...(openAuditChecks.length ? [`${openAuditChecks.length} audit check(s) remain open.`] : []),
  ];
  const gateReasons = Array.from(new Set(blockingReasons.length ? blockingReasons : reviewReasons));
  const gateState: CourseGateState = blockingReasons.length
    ? 'BLOCKED'
    : reviewReasons.length || urgentTasks.length
      ? 'REVIEW_REQUIRED'
      : 'READY';
  const lastFraction = activeFractions.toSorted((a, b) => a.fractionNumber - b.fractionNumber).at(-1);
  const currentFraction = Math.max(input.course.currentFraction, lastFraction?.fractionNumber ?? 0);

  return {
    workflowSteps,
    blockedSteps,
    urgentTasks,
    unsignedDocuments,
    openAuditChecks,
    fractionStatuses,
    approvedFractions,
    reviewFractions,
    revisionFractions,
    missingImageFractions,
    otvDueFractions,
    physicsDueFractions,
    upcomingScheduledFractions,
    currentFraction,
    cumulativeDose: lastFraction?.cumulativeDoseCgy ?? lastFraction?.cumulativeDose ?? 0,
    readiness: auditReadinessScore(input.carepathTasks, input.generatedDocuments, activeFractions),
    actions,
    nextAction: actions[0] ?? {
      id: 'course-next-action',
      label: input.fallbackNextAction,
      owner: 'Care team',
      blocking: false,
      destination: 'overview' as const,
    },
    courseGate: {
      state: gateState,
      reasons: gateReasons,
      evaluatedAt: latestTimestamp([
        ...workflowSteps.map((step) => step.updatedAt),
        ...input.tasks.map((task) => task.updatedAt),
        ...input.carepathTasks.map((task) => task.lastUpdatedAt),
        ...input.generatedDocuments.map((document) => document.lastUpdatedAt),
        ...activeFractions.map((entry) => entry.date),
      ]),
    } satisfies CourseGate,
  };
}
