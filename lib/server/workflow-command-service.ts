import "server-only";

import type { NextRequest } from "next/server";
import {
  carepathTasks,
  appointments,
  generatedDocuments,
  getClinicalFormResponse,
  operationalAuditEvents,
  operationalPatients,
  operationalTreatmentCourses,
  patientCourseAuditChecks,
  patientCourseWorkflowSteps,
  recordOperationalAuditEvent,
  treatmentCourses
} from "@/lib/clinical-store";
import { documentRequirements, workflowDefinitions } from "@/lib/template-registry";
import { PHI_REDACTED, courseRef, patientRef } from "@/lib/hipaa";
import { PROTOTYPE_OPERATIONAL_AS_OF, PROTOTYPE_OPERATIONAL_DATE } from "@/lib/operational-date";
import { roleCan } from "@/lib/rbac";
import { pilotSessionFromRequest, type PilotSessionClaims } from "@/lib/server/pilot-session";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import { isPrismaPersistenceMode, PersistenceWriteError, persistCourseWorkflowMutation } from "@/lib/server/write-through";
import { completedDocumentStatuses, completedTaskStatuses, orderedCarepathPhases } from "@/lib/workflow";
import type {
  CarepathTask,
  CarepathTaskStatus,
  CarepathWorkflowPhase,
  OperationalAuditEvent,
  OperationalTask,
  OperationalTreatmentCourse,
  OperationalWorkflowStep,
  PrototypeAccessRole,
  TaskMutationInput,
  TaskDueBucket,
  TreatmentCourse,
  WorkflowAdvanceInput,
  WorkflowCommandMutationResult,
  WorkflowCommandResult,
  WorkflowItemStatus,
  WorkflowQueueName,
  WorkflowQueueSnapshot,
  WorkflowStep,
  WorkflowStepMutationInput
} from "@/lib/types";

type MaybePromise<T> = T | Promise<T>;

export type WorkflowRepositoryMode = "memory" | "prisma";

export type WorkflowMutationAction = "workflow:step_mutate" | "workflow:advance" | "task:mutate";

export type WorkflowMutationContext = PilotSessionClaims & {
  action: WorkflowMutationAction;
  reason: string;
};

export type WorkflowServiceErrorBody = {
  message: string;
  status?: WorkflowCommandResult["status"];
  errors?: string[];
  blockers?: string[];
};

export type WorkflowServiceResponse<T> =
  | { ok: true; status: number; body: T }
  | { ok: false; status: number; body: WorkflowServiceErrorBody };

export type WorkflowTaskRepository = {
  mode: WorkflowRepositoryMode;
  listWorkflowSteps(asOf?: string): MaybePromise<OperationalWorkflowStep[]>;
  listTasks(asOf?: string): MaybePromise<OperationalTask[]>;
  listQueue(queue: WorkflowQueueName, role?: PrototypeAccessRole, asOf?: string, bucket?: TaskDueBucket): MaybePromise<WorkflowQueueSnapshot>;
  evaluateCourseAdvance(courseIdOrRef: string, asOf?: string): MaybePromise<WorkflowCommandResult>;
  advanceCourse(
    courseIdOrRef: string,
    input: Partial<WorkflowAdvanceInput>,
    context: WorkflowMutationContext,
    asOf?: string
  ): MaybePromise<WorkflowCommandMutationResult>;
  updateWorkflowStep(
    stepId: string,
    input: WorkflowStepMutationInput,
    context: WorkflowMutationContext,
    asOf?: string
  ): MaybePromise<WorkflowCommandMutationResult>;
  updateTask(
    taskId: string,
    input: TaskMutationInput,
    context: WorkflowMutationContext,
    asOf?: string
  ): MaybePromise<WorkflowCommandMutationResult>;
};

class WorkflowRepositoryUnavailableError extends Error {
  constructor() {
    super("Persistent workflow repository is not configured.");
    this.name = "WorkflowRepositoryUnavailableError";
  }
}

const workflowCompletedStatuses: WorkflowItemStatus[] = [
  "COMPLETED",
  "SIGNED",
  "UPLOADED",
  "CLOSED",
  "NOT_APPLICABLE"
];

const queueNames: WorkflowQueueName[] = [
  "ALL",
  "MY_TASKS",
  "TEAM_TASKS",
  "UNASSIGNED",
  "SIGNATURES",
  "OVERDUE",
  "BLOCKED",
  "COMPLETED"
];

const taskDueBuckets: TaskDueBucket[] = ["OVERDUE", "TODAY", "UPCOMING", "ALL_OPEN"];

const roleCodes = new Set(["VA", "MA", "RTT", "NP_PA", "PCP", "RAD_ONC", "PHYSICIST", "BILLING", "ADMIN"]);

function safeText(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function taskDueDate(value: string | undefined) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "") ? value : undefined;
}

function workspaceTabForStep(step: WorkflowStep) {
  if (step.phase === "ON_TREATMENT") {
    return "treatment" as const;
  }

  if (["POST_TX", "AUDIT", "CLOSED"].includes(step.phase)) {
    return "record-closeout" as const;
  }

  return "prepare" as const;
}

function nowIso() {
  return new Date().toISOString();
}

function repositoryModeFromEnv(): WorkflowRepositoryMode {
  return isPrismaPersistenceMode() ? "prisma" : "memory";
}

function courseByIdOrRef(courseIdOrRef: string): TreatmentCourse | undefined {
  return treatmentCourses.find((course) => course.id === courseIdOrRef || courseRef(course.id) === courseIdOrRef);
}

function patientRefForCourse(courseId: string) {
  const course = treatmentCourses.find((item) => item.id === courseId);
  return course ? patientRef(course.patientId) : "PREF-UNKNOWN";
}

function displayLabelForCourse(courseId: string) {
  return `Patient ${patientRefForCourse(courseId)}`;
}

export function workflowDueDateIsOverdue(dueDate: string | undefined, asOf = nowIso()) {
  if (!dueDate) {
    return false;
  }

  const endOfDueDate = new Date(`${dueDate}T23:59:59.999Z`);
  const reference = new Date(asOf);

  return !Number.isNaN(endOfDueDate.getTime()) && endOfDueDate < reference;
}

function stepStatusWithOverdue(step: WorkflowStep, asOf?: string): WorkflowItemStatus {
  if (workflowCompletedStatuses.includes(step.status)) {
    return step.status;
  }

  return workflowDueDateIsOverdue(step.dueDate, asOf) ? "OVERDUE" : step.status;
}

function taskStatusWithOverdue(task: CarepathTask, asOf?: string): CarepathTaskStatus {
  if (completedTaskStatuses.includes(task.status) || task.status === "BLOCKED") {
    return task.status;
  }

  return workflowDueDateIsOverdue(task.dueDate, asOf) ? "OVERDUE" : task.status;
}

function toOperationalStep(step: WorkflowStep, asOf?: string): OperationalWorkflowStep {
  const linkedDocumentRef = step.linkedDocumentId
    ? generatedDocuments.find((document) => document.id === step.linkedDocumentId)?.id ?? step.linkedDocumentId
    : undefined;
  const { courseId, linkedDocumentId, signedByUserId, ...safeStep } = step;
  void linkedDocumentId;
  void signedByUserId;

  return {
    ...safeStep,
    status: stepStatusWithOverdue(step, asOf),
    patientRef: patientRefForCourse(courseId),
    courseRef: courseRef(courseId),
    displayLabel: displayLabelForCourse(courseId),
    linkedDocumentRef
  };
}

function toOperationalTask(task: CarepathTask, asOf?: string): OperationalTask {
  const { courseId, ...safeTask } = task;
  const stepNumber = Number(task.taskNumber.match(/\d+$/)?.[0]);
  const targetStep = Number.isFinite(stepNumber)
    ? patientCourseWorkflowSteps.find((step) => step.courseId === courseId && step.stepNumber === stepNumber)
    : undefined;
  const linkedAppointment = targetStep
    ? appointments.find((appointment) => appointment.courseId === courseId && appointment.linkedWorkflowStepId === targetStep.id)
    : undefined;
  const subject = task.title
    .replace(/^(complete|prepare|reconcile|review)\s+/i, "")
    .replace(/\s+(sign|review)$/i, "")
    .trim();
  const actionLabel = task.status === "BLOCKED"
    ? `Resolve Blocker: ${subject}`
    : task.title.toLowerCase().includes("sign") || task.auditSteps.some((step) => step.toLowerCase().includes("signature"))
      ? `Review and Sign ${subject}`
      : task.noteAction.toLowerCase().includes("image") || task.noteAction.toLowerCase().includes("evidence")
        ? `Attach Evidence: ${subject}`
        : task.title.toLowerCase().includes("review") || task.status === "NEEDS_REVIEW" || task.status === "READY_FOR_REVIEW"
          ? `Review ${subject}`
          : `Complete ${subject}`;

  return {
    ...safeTask,
    dueDate: taskDueDate(task.dueDate),
    status: taskStatusWithOverdue(task, asOf),
    patientRef: patientRefForCourse(courseId),
    courseRef: courseRef(courseId),
    displayLabel: displayLabelForCourse(courseId),
    actionLabel,
    workspaceTarget: targetStep ? {
      tab: workspaceTabForStep(targetStep),
      targetKind: "step",
      targetId: targetStep.id,
    } : undefined,
    linkedAppointment: linkedAppointment?.dateTime ? {
      id: linkedAppointment.id,
      dateTime: linkedAppointment.dateTime,
      title: linkedAppointment.title,
      status: linkedAppointment.status ?? "SCHEDULED",
    } : undefined,
  };
}

function listOperationalWorkflowSteps(asOf?: string) {
  return patientCourseWorkflowSteps.map((step) => toOperationalStep(step, asOf));
}

function listOperationalTasks(asOf?: string) {
  return carepathTasks.map((task) => toOperationalTask(task, asOf));
}

function taskIsUnassigned(task: OperationalTask) {
  return !safeText(task.assignedUser) || roleCodes.has(task.assignedUser);
}

function taskInQueue(task: OperationalTask, queue: WorkflowQueueName, role?: PrototypeAccessRole) {
  if (queue === "ALL") {
    return true;
  }

  if (queue === "MY_TASKS") {
    return Boolean(role && (task.responsibleParty === role || task.assignedUser === role));
  }

  if (queue === "TEAM_TASKS") {
    return Boolean(role && task.responsibleParty === role);
  }

  if (queue === "UNASSIGNED") {
    return taskIsUnassigned(task);
  }

  if (queue === "SIGNATURES") {
    return task.title.toLowerCase().includes("sign") ||
      task.auditSteps.some((step) => step.toLowerCase().includes("signature")) ||
      ["NEEDS_REVIEW", "READY_FOR_REVIEW", "SIGNED"].includes(task.status);
  }

  if (queue === "OVERDUE") {
    return task.status === "OVERDUE";
  }

  if (queue === "BLOCKED") {
    return task.status === "BLOCKED" || Boolean(task.blockedReason);
  }

  return completedTaskStatuses.includes(task.status);
}

export function taskMatchesDueBucket(
  task: Pick<OperationalTask, "status" | "dueDate">,
  bucket: TaskDueBucket,
  operationalDate = PROTOTYPE_OPERATIONAL_DATE,
) {
  if (completedTaskStatuses.includes(task.status)) {
    return false;
  }
  if (bucket === "ALL_OPEN") {
    return true;
  }
  const dueDate = taskDueDate(task.dueDate);
  if (!dueDate) {
    return false;
  }
  if (bucket === "OVERDUE") {
    return dueDate < operationalDate;
  }
  if (bucket === "TODAY") {
    return dueDate === operationalDate;
  }
  return dueDate > operationalDate;
}

function queueSnapshot(
  queue: WorkflowQueueName,
  role?: PrototypeAccessRole,
  asOf = PROTOTYPE_OPERATIONAL_AS_OF,
  requestedBucket?: TaskDueBucket,
): WorkflowQueueSnapshot {
  const tasks = listOperationalTasks(asOf);
  const counts = queueNames.reduce<Record<WorkflowQueueName, number>>((current, name) => {
    current[name] = tasks.filter((task) => taskInQueue(task, name, role)).length;
    return current;
  }, {
    ALL: 0,
    MY_TASKS: 0,
    TEAM_TASKS: 0,
    UNASSIGNED: 0,
    SIGNATURES: 0,
    OVERDUE: 0,
    BLOCKED: 0,
    COMPLETED: 0
  });
  const scopedTasks = tasks.filter((task) => taskInQueue(task, queue, role));
  const bucketCounts = taskDueBuckets.reduce<Record<TaskDueBucket, number>>((current, bucket) => {
    current[bucket] = scopedTasks.filter((task) => taskMatchesDueBucket(task, bucket)).length;
    return current;
  }, {
    OVERDUE: 0,
    TODAY: 0,
    UPCOMING: 0,
    ALL_OPEN: 0,
  });
  const bucket = requestedBucket ?? taskDueBuckets.find((candidate) => bucketCounts[candidate] > 0) ?? "ALL_OPEN";

  return {
    queue,
    bucket,
    role,
    tasks: scopedTasks.filter((task) => taskMatchesDueBucket(task, bucket)),
    counts,
    bucketCounts,
    generatedAt: asOf,
  };
}

function nextCarepathPhase(course: TreatmentCourse): CarepathWorkflowPhase | undefined {
  const currentPhase = course.coursePhase ?? "CONSULTATION";
  const currentIndex = orderedCarepathPhases.indexOf(currentPhase);

  return currentIndex >= 0 ? orderedCarepathPhases[currentIndex + 1] : undefined;
}

function phaseIsAtOrBefore(phase: CarepathWorkflowPhase, currentPhase: CarepathWorkflowPhase) {
  const phaseIndex = orderedCarepathPhases.indexOf(phase);
  const currentIndex = orderedCarepathPhases.indexOf(currentPhase);

  return phaseIndex >= 0 && currentIndex >= 0 && phaseIndex <= currentIndex;
}

function workflowStepBlockers(courseId: string, asOf?: string) {
  const course = courseByIdOrRef(courseId);
  const currentPhase = course?.coursePhase ?? "CONSULTATION";
  const steps = patientCourseWorkflowSteps.filter((step) => step.courseId === courseId);
  const blockers = steps.flatMap((step) => {
    const reasons: string[] = [];
    const status = stepStatusWithOverdue(step, asOf);

    if (["BLOCKED", "OVERDUE"].includes(status)) {
      reasons.push(`${step.stepName} is ${status.toLowerCase()}.`);
    }

    if (step.status === "NOT_APPLICABLE" && !step.naReason?.trim()) {
      reasons.push(`${step.stepName} is marked N/A without a reason.`);
    }

    if (step.applicability === "REQUIRED" && step.status === "NOT_APPLICABLE") {
      reasons.push(`${step.stepName} is required and cannot be marked N/A.`);
    }

    if (
      step.applicability === "REQUIRED" &&
      phaseIsAtOrBefore(step.phase, currentPhase) &&
      !workflowCompletedStatuses.includes(step.status)
    ) {
      reasons.push(`${step.stepName} must be completed before phase advancement.`);
    }

    if (step.requiresSignature && workflowCompletedStatuses.includes(step.status) && !step.signedAt && step.status !== "NOT_APPLICABLE") {
      reasons.push(`${step.stepName} is complete but missing signature evidence.`);
    }

    return reasons;
  });

  if (steps.length === 0) {
    blockers.push("No workflow steps exist for this course.");
  }

  return blockers;
}

function taskBlockers(courseId: string, asOf?: string) {
  const course = courseByIdOrRef(courseId);
  const currentPhase = course?.coursePhase ?? "CONSULTATION";

  return carepathTasks
    .filter((task) => task.courseId === courseId)
    .flatMap((task) => {
      const status = taskStatusWithOverdue(task, asOf);

      if (["BLOCKED", "OVERDUE"].includes(status)) {
        return [`${task.title} is ${status.toLowerCase()}.`];
      }

      if (
        phaseIsAtOrBefore(task.workflowPhase, currentPhase) &&
        !completedTaskStatuses.includes(task.status)
      ) {
        return [`${task.title} must be completed before phase advancement.`];
      }

      if (task.auditReady === false && completedTaskStatuses.includes(task.status)) {
        return [`${task.title} is complete but not audit-ready.`];
      }

      return [];
    });
}

function documentBlockers(courseId: string) {
  return generatedDocuments
    .filter((document) => document.courseId === courseId)
    .flatMap((document) => {
      if (["BLOCKED", "OVERDUE", "MISSING_FIELDS", "NEEDS_REVIEW"].includes(document.status)) {
        return [`${document.name} needs resolution before advancement.`];
      }

      if (completedDocumentStatuses.includes(document.status) && !document.auditReady) {
        return [`${document.name} is complete but not audit-ready.`];
      }

      return [];
    });
}

function auditCheckBlockers(courseId: string) {
  return patientCourseAuditChecks
    .filter((check) => check.courseId === courseId && check.required)
    .flatMap((check) => {
      if (check.status === "NOT_APPLICABLE" && !check.naReason?.trim()) {
        return [`${check.label} is marked N/A without a reason.`];
      }

      if (["BLOCKED", "OVERDUE"].includes(check.status)) {
        return [`${check.label} is ${check.status.toLowerCase()}.`];
      }

      return [];
    });
}

const PREAUTH_APPROVED_STATES = new Set(["Approved", "Partially approved", "Not required"]);

// Preauthorization-lite gate: a course whose workflow requires carepath preauthorization
// cannot advance into ON_TREATMENT until the preauth form's authorization state is resolved.
function preauthBlockers(course: TreatmentCourse, nextPhase: CarepathWorkflowPhase | undefined): string[] {
  if (nextPhase !== "ON_TREATMENT") return [];
  const definition = workflowDefinitions.find((workflow) => workflow.id === course.workflowDefinitionId);
  const requirementIds = definition?.documentRequirementIds ?? [];
  const preauthRequirements = documentRequirements.filter(
    (requirement) => requirementIds.includes(requirement.id) && /preauth/i.test(requirement.id) && /carepath|SKIN/i.test(requirement.id),
  );
  if (preauthRequirements.length === 0) return [];
  // A course uses one preauth plan (e.g. 20fx OR 30fx); an approval on any applicable
  // carepath preauth form clears the gate.
  const anyApproved = preauthRequirements.some((requirement) => {
    const state = getClinicalFormResponse(course.id, requirement.id)?.responseData?.authorizationState;
    return typeof state === "string" && PREAUTH_APPROVED_STATES.has(state);
  });
  if (anyApproved) return [];
  return ["Preauthorization is not approved. Resolve carepath authorization before starting treatment."];
}

function evaluateCourseAdvance(courseIdOrRef: string, asOf?: string): WorkflowCommandResult {
  const course = courseByIdOrRef(courseIdOrRef);

  if (!course) {
    return {
      allowed: false,
      status: "NOT_FOUND",
      blockers: ["Course not found."],
      auditAction: "Workflow advancement rejected"
    };
  }

  const nextPhase = nextCarepathPhase(course);
  const blockers = [
    ...workflowStepBlockers(course.id, asOf),
    ...taskBlockers(course.id, asOf),
    ...documentBlockers(course.id),
    ...auditCheckBlockers(course.id),
    ...preauthBlockers(course, nextPhase)
  ];

  if (!nextPhase) {
    blockers.push("Course is already at the final workflow phase.");
  }

  return {
    allowed: blockers.length === 0,
    status: blockers.length === 0 ? "READY" : "BLOCKED",
    blockers,
    auditAction: blockers.length === 0 ? "Workflow advancement evaluated" : "Workflow advancement blocked",
    nextPhase
  };
}

function simplePhaseForCarepath(phase: CarepathWorkflowPhase) {
  if (["ON_TREATMENT"].includes(phase)) {
    return "ON_TREATMENT" as const;
  }

  if (["POST_TX", "AUDIT", "CLOSED"].includes(phase)) {
    return "POST" as const;
  }

  return "UPCOMING" as const;
}

function auditForContext(
  context: WorkflowMutationContext,
  course: TreatmentCourse | undefined,
  action: string,
  entityType: "COURSE" | "CAREPATH_TASK" | "SYSTEM",
  entityId: string
): OperationalAuditEvent {
  return recordOperationalAuditEvent({
    patientId: course?.patientId,
    userId: context.userId,
    userName: context.userName,
    role: context.role,
    sessionId: context.sessionId,
    ipAddress: context.ipAddress,
    deviceId: context.deviceId,
    reason: context.reason,
    action,
    entityType,
    entityId,
    previousValue: PHI_REDACTED,
    newValue: PHI_REDACTED
  });
}

function operationalCourse(courseId: string): OperationalTreatmentCourse | undefined {
  return operationalTreatmentCourses().find((course) => course.id === courseId || course.courseRef === courseRef(courseId));
}

function mutationResult(
  result: WorkflowCommandResult,
  extra: Partial<WorkflowCommandMutationResult> = {}
): WorkflowCommandMutationResult {
  return {
    ...result,
    ...extra,
    phiBoundary: "Workflow/task commands return tokenized patientRef/courseRef records and redacted audit events."
  };
}

function validateReason(value: string | undefined, label = "changeReason") {
  return safeText(value) ? [] : [`${label} is required.`];
}

function validateContext(context: WorkflowMutationContext, action: WorkflowMutationAction) {
  return context.action === action && roleCan(context.role, action);
}

function advanceCourseInMemory(
  courseIdOrRef: string,
  input: Partial<WorkflowAdvanceInput>,
  context: WorkflowMutationContext,
  asOf?: string
): WorkflowCommandMutationResult {
  const inputErrors: string[] = [];

  if (typeof input.reason !== "string" || !input.reason.trim()) {
    inputErrors.push("reason is required.");
  }

  if (typeof input.expectedCoursePhase !== "string") {
    inputErrors.push(input.expectedCoursePhase == null
      ? "expectedCoursePhase is required."
      : "expectedCoursePhase is invalid.");
  } else if (!orderedCarepathPhases.includes(input.expectedCoursePhase)) {
    inputErrors.push("expectedCoursePhase is invalid.");
  }

  if (!validateContext(context, "workflow:advance")) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: ["Workflow advance access denied."],
      auditAction: "Workflow advancement rejected"
    });
  }

  if (inputErrors.length > 0) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: inputErrors,
      auditAction: "Workflow advancement rejected"
    });
  }

  const course = courseByIdOrRef(courseIdOrRef);
  if (!course) {
    return mutationResult(evaluateCourseAdvance(courseIdOrRef, asOf));
  }

  if (input.expectedCoursePhase !== course.coursePhase) {
    return mutationResult({
      allowed: false,
      status: "STALE",
      blockers: ["Course phase was updated by another session."],
      auditAction: "Workflow advancement rejected"
    });
  }

  const evaluated = evaluateCourseAdvance(course.id, asOf);
  if (!evaluated.allowed || !evaluated.nextPhase) {
    return mutationResult(evaluated);
  }

  course.coursePhase = evaluated.nextPhase;
  course.chartRoundsPhase = simplePhaseForCarepath(evaluated.nextPhase);
  course.status = evaluated.nextPhase === "CLOSED" ? "COMPLETED" : course.status === "NOT_STARTED" ? "ACTIVE" : course.status;

  const auditEvent = auditForContext(
    context,
    course,
    `Workflow advanced to ${evaluated.nextPhase}`,
    "COURSE",
    course.id
  );

  return mutationResult(
    {
      allowed: true,
      status: "READY",
      blockers: [],
      auditAction: "Workflow advanced",
      nextPhase: evaluated.nextPhase
    },
    {
      course: operationalCourse(course.id),
      auditEvent
    }
  );
}

function updateWorkflowStepInMemory(
  stepId: string,
  input: WorkflowStepMutationInput,
  context: WorkflowMutationContext,
  asOf?: string
): WorkflowCommandMutationResult {
  const step = patientCourseWorkflowSteps.find((item) => item.id === stepId);
  const reasonErrors = validateReason(input.changeReason);

  if (!validateContext(context, "workflow:step_mutate")) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: ["Workflow mutation access denied."],
      auditAction: "Workflow step update rejected"
    });
  }

  if (!step) {
    return mutationResult({
      allowed: false,
      status: "NOT_FOUND",
      blockers: ["Workflow step not found."],
      auditAction: "Workflow step update rejected"
    });
  }

  if (input.expectedUpdatedAt && input.expectedUpdatedAt !== step.updatedAt) {
    reasonErrors.push("Workflow step was updated by another session.");
  }

  if (step.applicability === "REMOVED" && input.status && input.status !== "NOT_APPLICABLE") {
    reasonErrors.push(`${step.stepName} is removed from the CureRays Carepath model.`);
  }

  if (input.status === "NOT_APPLICABLE") {
    if (step.applicability === "REQUIRED") {
      reasonErrors.push(`${step.stepName} is required and cannot be marked N/A.`);
    }

    if (!safeText(input.naReason)) {
      reasonErrors.push("N/A reason is required.");
    }
  }

  if (input.status === "BLOCKED" && !safeText(input.blockedReason)) {
    reasonErrors.push("Blocked reason is required.");
  }

  if (input.reopenReason !== undefined && !safeText(input.reopenReason)) {
    reasonErrors.push("Reopen reason is required.");
  }

  if (reasonErrors.length > 0) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: reasonErrors,
      auditAction: "Workflow step update rejected"
    });
  }

  if (input.assignedUserId !== undefined) {
    step.assignedUserId = safeText(input.assignedUserId) || undefined;
  }

  if (input.dueDate !== undefined) {
    step.dueDate = safeText(input.dueDate) || undefined;
  }

  if (input.reopenReason) {
    step.status = "PENDING";
    step.signedAt = undefined;
    step.signedByUserId = undefined;
    step.blockers = [];
    step.notes = `Reopened: ${safeText(input.reopenReason)}`;
  }

  if (input.status) {
    step.status = input.status;
    if (input.status === "NOT_APPLICABLE") {
      step.naReason = safeText(input.naReason);
      step.blockers = [];
    } else if (input.status === "BLOCKED") {
      step.blockers = [safeText(input.blockedReason)];
    } else {
      step.blockers = [];
      step.naReason = undefined;
    }

    if (["SIGNED", "COMPLETED", "UPLOADED", "CLOSED"].includes(input.status) && step.requiresSignature) {
      step.signedAt = nowIso();
      step.signedByUserId = context.userId;
    }
  }

  step.updatedAt = nowIso();
  const course = courseByIdOrRef(step.courseId);
  const auditEvent = auditForContext(context, course, "Workflow step updated", "COURSE", step.id);

  return mutationResult(
    {
      allowed: true,
      status: "READY",
      blockers: [],
      auditAction: "Workflow step updated",
      nextPhase: step.phase
    },
    {
      step: toOperationalStep(step, asOf),
      auditEvent
    }
  );
}

function updateTaskInMemory(
  taskId: string,
  input: TaskMutationInput,
  context: WorkflowMutationContext,
  asOf?: string
): WorkflowCommandMutationResult {
  const task = carepathTasks.find((item) => item.id === taskId);
  const reasonErrors = validateReason(input.changeReason);

  if (!validateContext(context, "task:mutate")) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: ["Task mutation access denied."],
      auditAction: "Task update rejected"
    });
  }

  if (!task) {
    return mutationResult({
      allowed: false,
      status: "NOT_FOUND",
      blockers: ["Task not found."],
      auditAction: "Task update rejected"
    });
  }

  if (input.expectedLastUpdatedAt && input.expectedLastUpdatedAt !== task.lastUpdatedAt) {
    reasonErrors.push("Task was updated by another session.");
  }

  if (input.status === "NOT_APPLICABLE" && !safeText(input.naReason)) {
    reasonErrors.push("N/A reason is required.");
  }

  if (input.status === "BLOCKED" && !safeText(input.blockedReason)) {
    reasonErrors.push("Blocked reason is required.");
  }

  if (input.reopenReason !== undefined && !safeText(input.reopenReason)) {
    reasonErrors.push("Reopen reason is required.");
  }

  if (reasonErrors.length > 0) {
    return mutationResult({
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: reasonErrors,
      auditAction: "Task update rejected"
    });
  }

  if (input.assignedUser !== undefined) {
    task.assignedUser = safeText(input.assignedUser) || task.responsibleParty;
  }

  if (input.dueDate !== undefined) {
    task.dueDate = safeText(input.dueDate) || undefined;
  }

  if (input.reopenReason) {
    task.status = "PENDING";
    task.auditReady = false;
    task.completedAt = undefined;
    task.signedAt = undefined;
    task.reopenReason = safeText(input.reopenReason);
    task.blockedReason = undefined;
    task.naReason = undefined;
  }

  if (input.status) {
    task.status = input.status;
    task.blockedReason = input.status === "BLOCKED" ? safeText(input.blockedReason) : undefined;
    task.naReason = input.status === "NOT_APPLICABLE" ? safeText(input.naReason) : undefined;

    if (completedTaskStatuses.includes(input.status)) {
      task.completedAt = task.completedAt ?? nowIso();
      task.auditReady = true;
    } else {
      task.auditReady = false;
      task.completedAt = undefined;
    }

    if (input.status === "SIGNED") {
      task.signedAt = task.signedAt ?? nowIso();
    }
  }

  task.lastUpdatedAt = nowIso();
  const course = courseByIdOrRef(task.courseId);
  const auditEvent = auditForContext(context, course, "Carepath task updated", "CAREPATH_TASK", task.id);

  return mutationResult(
    {
      allowed: true,
      status: "READY",
      blockers: [],
      auditAction: "Task updated"
    },
    {
      task: toOperationalTask(task, asOf),
      auditEvent
    }
  );
}

export const inMemoryWorkflowTaskRepository: WorkflowTaskRepository = {
  mode: "memory",
  listWorkflowSteps(asOf) {
    return listOperationalWorkflowSteps(asOf);
  },
  listTasks(asOf) {
    return listOperationalTasks(asOf);
  },
  listQueue(queue, role, asOf, bucket) {
    return queueSnapshot(queue, role, asOf, bucket);
  },
  evaluateCourseAdvance(courseIdOrRef, asOf) {
    return evaluateCourseAdvance(courseIdOrRef, asOf);
  },
  advanceCourse(courseIdOrRef, input, context, asOf) {
    return advanceCourseInMemory(courseIdOrRef, input, context, asOf);
  },
  updateWorkflowStep(stepId, input, context, asOf) {
    return updateWorkflowStepInMemory(stepId, input, context, asOf);
  },
  updateTask(taskId, input, context, asOf) {
    return updateTaskInMemory(taskId, input, context, asOf);
  }
};

function courseIdForStep(stepId: string): string | undefined {
  return patientCourseWorkflowSteps.find((step) => step.id === stepId)?.courseId;
}

function courseIdForTask(taskId: string): string | undefined {
  return carepathTasks.find((task) => task.id === taskId)?.courseId;
}

async function writeThroughOrRestore(courseId: string | undefined, auditEventId?: string) {
  if (!courseId) {
    return;
  }

  try {
    await persistCourseWorkflowMutation(courseId, auditEventId);
  } catch (error) {
    await hydrateClinicalStoreFromDatabase({ force: true });
    throw error;
  }
}

export const prismaWorkflowTaskRepository: WorkflowTaskRepository = {
  mode: "prisma",
  listWorkflowSteps(asOf) {
    return inMemoryWorkflowTaskRepository.listWorkflowSteps(asOf);
  },
  listTasks(asOf) {
    return inMemoryWorkflowTaskRepository.listTasks(asOf);
  },
  listQueue(queue, role, asOf, bucket) {
    return inMemoryWorkflowTaskRepository.listQueue(queue, role, asOf, bucket);
  },
  evaluateCourseAdvance(courseIdOrRef, asOf) {
    return inMemoryWorkflowTaskRepository.evaluateCourseAdvance(courseIdOrRef, asOf);
  },
  async advanceCourse(courseIdOrRef, input, context, asOf) {
    const result = advanceCourseInMemory(courseIdOrRef, input, context, asOf);
    if (result.allowed) {
      await writeThroughOrRestore(courseByIdOrRef(courseIdOrRef)?.id, result.auditEvent?.id);
    }
    return result;
  },
  async updateWorkflowStep(stepId, input, context, asOf) {
    const result = updateWorkflowStepInMemory(stepId, input, context, asOf);
    if (result.allowed) {
      await writeThroughOrRestore(courseIdForStep(stepId), result.auditEvent?.id);
    }
    return result;
  },
  async updateTask(taskId, input, context, asOf) {
    const result = updateTaskInMemory(taskId, input, context, asOf);
    if (result.allowed) {
      await writeThroughOrRestore(courseIdForTask(taskId), result.auditEvent?.id);
    }
    return result;
  }
};

export const prismaReadyWorkflowTaskRepository = prismaWorkflowTaskRepository;

export function selectWorkflowTaskRepository(): WorkflowTaskRepository {
  return repositoryModeFromEnv() === "prisma"
    ? prismaWorkflowTaskRepository
    : inMemoryWorkflowTaskRepository;
}

function success<T>(status: number, body: T): WorkflowServiceResponse<T> {
  return { ok: true, status, body };
}

function failure<T>(
  status: number,
  message: string,
  errors?: string[],
  blockers?: string[],
  workflowStatus?: WorkflowCommandResult["status"]
): WorkflowServiceResponse<T> {
  return {
    ok: false,
    status,
    body: { message, status: workflowStatus, errors, blockers }
  };
}

function safeFailure<T>(error: unknown): WorkflowServiceResponse<T> {
  if (error instanceof WorkflowRepositoryUnavailableError) {
    return failure(503, "Workflow persistence is not available.");
  }

  if (error instanceof PersistenceWriteError) {
    return failure(500, "Workflow change could not be saved to the configured database.");
  }

  return failure(500, "Workflow command could not be completed.");
}

function queueFromRequest(value: string | null): WorkflowQueueName {
  const normalized = safeText(value).toUpperCase();
  return queueNames.includes(normalized as WorkflowQueueName) ? normalized as WorkflowQueueName : "ALL";
}

export function taskDueBucketFromValue(value: string | null | undefined): TaskDueBucket | undefined {
  const normalized = safeText(value).toUpperCase();
  return taskDueBuckets.includes(normalized as TaskDueBucket) ? normalized as TaskDueBucket : undefined;
}

export function taskQueueFromValue(value: string | null | undefined): WorkflowQueueName {
  return queueFromRequest(value ?? null);
}

export async function getTaskQueueSnapshot(
  queue: WorkflowQueueName = "ALL",
  bucket?: TaskDueBucket,
  role: PrototypeAccessRole = "RAD_ONC",
  asOf = PROTOTYPE_OPERATIONAL_AS_OF,
) {
  return selectWorkflowTaskRepository().listQueue(queue, role, asOf, bucket);
}

export function workflowReadContextFromRequest(request: NextRequest): PilotSessionClaims | null {
  return pilotSessionFromRequest(request);
}

export function workflowMutationContextFromRequest(
  request: NextRequest,
  action: WorkflowMutationAction,
  reason: string
): WorkflowMutationContext | null {
  const session = pilotSessionFromRequest(request);
  if (!session || !roleCan(session.role, action)) {
    return null;
  }

  return {
    ...session,
    action,
    reason: safeText(reason) || "Workflow/task command"
  };
}

export async function listWorkflowCommandSnapshot(asOf?: string) {
  const repository = selectWorkflowTaskRepository();
  const role = "RAD_ONC" as PrototypeAccessRole;

  try {
    return {
      patients: operationalPatients(),
      treatmentCourses: operationalTreatmentCourses(),
      workflowSteps: await repository.listWorkflowSteps(asOf),
      tasks: await repository.listTasks(asOf),
      queue: await repository.listQueue("ALL", role, asOf ?? PROTOTYPE_OPERATIONAL_AS_OF),
      auditEvents: operationalAuditEvents(),
      phiBoundary: {
        identitySource: "Signed pilot session",
        patientIdentifiers: "Not returned from workflow/task command APIs",
        operationalRecords: "Tokenized patientRef/courseRef records only"
      }
    };
  } catch (error) {
    if (!(error instanceof WorkflowRepositoryUnavailableError)) {
      throw error;
    }
  }

  return {
    patients: operationalPatients(),
    treatmentCourses: operationalTreatmentCourses(),
    workflowSteps: await inMemoryWorkflowTaskRepository.listWorkflowSteps(asOf),
    tasks: await inMemoryWorkflowTaskRepository.listTasks(asOf),
    queue: await inMemoryWorkflowTaskRepository.listQueue("ALL", role, asOf ?? PROTOTYPE_OPERATIONAL_AS_OF),
    auditEvents: operationalAuditEvents(),
    phiBoundary: {
      identitySource: "Signed pilot session",
      patientIdentifiers: "Not returned from workflow/task command APIs",
      operationalRecords: "Tokenized patientRef/courseRef records only"
    }
  };
}

export async function listTaskQueue(
  request: NextRequest,
  asOf?: string
): Promise<WorkflowServiceResponse<WorkflowQueueSnapshot>> {
  try {
    const context = workflowReadContextFromRequest(request);
    const repository = selectWorkflowTaskRepository();
    const queue = queueFromRequest(request.nextUrl.searchParams.get("queue"));
    const bucket = taskDueBucketFromValue(request.nextUrl.searchParams.get("bucket"));

    return success(200, await repository.listQueue(
      queue,
      context?.role,
      asOf ?? PROTOTYPE_OPERATIONAL_AS_OF,
      bucket,
    ));
  } catch (error) {
    return safeFailure(error);
  }
}

export async function advanceCourseWorkflow(
  courseIdOrRef: string,
  input: Partial<WorkflowAdvanceInput>,
  context: WorkflowMutationContext,
  asOf?: string
): Promise<WorkflowServiceResponse<WorkflowCommandMutationResult>> {
  try {
    const repository = selectWorkflowTaskRepository();
    const result = await repository.advanceCourse(courseIdOrRef, input, context, asOf);

    if (!result.allowed) {
      return failure(
        result.status === "NOT_FOUND" ? 404 : result.status === "VALIDATION_FAILED" ? 400 : 409,
        result.auditAction,
        result.status === "VALIDATION_FAILED" ? result.blockers : undefined,
        result.blockers,
        result.status
      );
    }

    return success(200, result);
  } catch (error) {
    return safeFailure(error);
  }
}

export async function updateWorkflowStepCommand(
  stepId: string,
  input: Partial<WorkflowStepMutationInput>,
  context: WorkflowMutationContext,
  asOf?: string
): Promise<WorkflowServiceResponse<WorkflowCommandMutationResult>> {
  try {
    const repository = selectWorkflowTaskRepository();
    const result = await repository.updateWorkflowStep(stepId, input as WorkflowStepMutationInput, context, asOf);

    if (!result.allowed) {
      return failure(
        result.status === "NOT_FOUND" ? 404 : 400,
        result.auditAction,
        result.blockers,
        result.blockers
      );
    }

    return success(200, result);
  } catch (error) {
    return safeFailure(error);
  }
}

export async function updateTaskCommand(
  taskId: string,
  input: Partial<TaskMutationInput>,
  context: WorkflowMutationContext,
  asOf?: string
): Promise<WorkflowServiceResponse<WorkflowCommandMutationResult>> {
  try {
    const repository = selectWorkflowTaskRepository();
    const result = await repository.updateTask(taskId, input as TaskMutationInput, context, asOf);

    if (!result.allowed) {
      return failure(
        result.status === "NOT_FOUND" ? 404 : 400,
        result.auditAction,
        result.blockers,
        result.blockers
      );
    }

    return success(200, result);
  } catch (error) {
    return safeFailure(error);
  }
}

export function evaluateWorkflowCommand(courseId: string): WorkflowCommandResult {
  return evaluateCourseAdvance(courseId);
}

export function markWorkflowStepNotApplicable(stepId: string, reason: string): WorkflowCommandResult {
  const step = patientCourseWorkflowSteps.find((item) => item.id === stepId);

  if (!step) {
    return {
      allowed: false,
      status: "NOT_FOUND",
      blockers: ["Workflow step not found."],
      auditAction: "Workflow N/A rejected"
    };
  }

  if (step.applicability === "REQUIRED") {
    return {
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: [`${step.stepName} is required and cannot be marked N/A.`],
      auditAction: "Workflow N/A rejected"
    };
  }

  if (!reason.trim()) {
    return {
      allowed: false,
      status: "VALIDATION_FAILED",
      blockers: [`${step.stepName} requires a non-empty N/A reason.`],
      auditAction: "Workflow N/A rejected"
    };
  }

  return {
    allowed: true,
    status: "READY",
    blockers: [],
    auditAction: "Workflow N/A reason accepted",
    nextPhase: step.phase
  };
}

export function listWorkflowCommandBlockers(courseId: string) {
  return evaluateWorkflowCommand(courseId).blockers;
}
