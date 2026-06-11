import "server-only";

import {
  carepathTasks,
  generatedDocuments,
  patientCourseAuditChecks,
  patientCourseWorkflowSteps,
  treatmentCourses
} from "@/lib/clinical-store";
import { courseRef } from "@/lib/hipaa";
import { completedDocumentStatuses, completedTaskStatuses, orderedCarepathPhases } from "@/lib/workflow";
import type {
  CarepathWorkflowPhase,
  TreatmentCourse,
  WorkflowCommandResult
} from "@/lib/types";

function nextCarepathPhase(course: TreatmentCourse): CarepathWorkflowPhase | undefined {
  const currentPhase = course.coursePhase ?? "CONSULTATION";
  const currentIndex = orderedCarepathPhases.indexOf(currentPhase);

  return currentIndex >= 0 ? orderedCarepathPhases[currentIndex + 1] : undefined;
}

function workflowStepBlockers(courseId: string) {
  const steps = patientCourseWorkflowSteps.filter((step) => step.courseId === courseId);
  const blockers = steps.flatMap((step) => {
    const reasons: string[] = [];

    if (["BLOCKED", "OVERDUE"].includes(step.status)) {
      reasons.push(`${step.stepName} is ${step.status.toLowerCase()}.`);
    }

    if (step.status === "NOT_APPLICABLE" && !step.naReason?.trim()) {
      reasons.push(`${step.stepName} is marked N/A without a reason.`);
    }

    if (step.requiresSignature && completedTaskStatuses.includes(step.status) && !step.signedAt) {
      reasons.push(`${step.stepName} is complete but missing signature evidence.`);
    }

    return reasons;
  });

  if (steps.length === 0) {
    blockers.push("No workflow steps exist for this course.");
  }

  return blockers;
}

function taskBlockers(courseId: string) {
  return carepathTasks
    .filter((task) => task.courseId === courseId)
    .flatMap((task) => {
      if (["BLOCKED", "OVERDUE"].includes(task.status)) {
        return [`${task.title} is ${task.status.toLowerCase()}.`];
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

export function evaluateWorkflowCommand(courseId: string): WorkflowCommandResult {
  const course = treatmentCourses.find((item) => item.id === courseId || courseRef(item.id) === courseId);

  if (!course) {
    return {
      allowed: false,
      status: "NOT_FOUND",
      blockers: ["Course not found."],
      auditAction: "Workflow advancement rejected"
    };
  }

  const blockers = [
    ...workflowStepBlockers(course.id),
    ...taskBlockers(course.id),
    ...documentBlockers(course.id),
    ...auditCheckBlockers(course.id)
  ];
  const nextPhase = nextCarepathPhase(course);

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
