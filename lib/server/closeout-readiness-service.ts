import "server-only";

import {
  fractionLogEntries,
  generatedDocuments,
  patientCourseAuditChecks,
  treatmentCourses
} from "@/lib/clinical-store";
import { courseRef } from "@/lib/hipaa";
import { billingItems } from "@/lib/module-data";
import { completedDocumentStatuses } from "@/lib/workflow";
import type { BillingItem, CloseoutReadiness, TreatmentCourse } from "@/lib/types";

const closedBillingStatuses = new Set(["COMPLETED", "CLOSED", "NOT_APPLICABLE"]);

function unresolvedDocumentEvidence(course: TreatmentCourse) {
  return generatedDocuments
    .filter((document) => document.courseId === course.id)
    .filter((document) => !completedDocumentStatuses.includes(document.status))
    .map((document) => `${document.name}: ${document.requiredAction}`);
}

function missingSignatureEvidence(course: TreatmentCourse) {
  return generatedDocuments
    .filter((document) => document.courseId === course.id)
    .filter((document) => document.signReviewState !== "SIGNED" && document.status !== "NOT_APPLICABLE")
    .map((document) => `${document.name}: signature not complete`);
}

function unresolvedFractionEvidence(course: TreatmentCourse) {
  const activeFractions = fractionLogEntries.filter((entry) => entry.courseId === course.id && entry.status !== "VOIDED");
  const missing: string[] = [];

  if (activeFractions.length < course.totalFractions) {
    missing.push(`Fraction log has ${activeFractions.length} of ${course.totalFractions} planned fractions.`);
  }

  for (const fraction of activeFractions) {
    if (!fraction.mdApproval || !fraction.dotApproval) {
      missing.push(`Fraction ${fraction.fractionNumber} is missing MD or DOT approval.`);
    }
  }

  return missing;
}

function unresolvedBillingEvidence(courseBillingItems: BillingItem[]) {
  if (courseBillingItems.length === 0) {
    return ["No billing items are linked to this course."];
  }

  return courseBillingItems
    .filter((item) => !closedBillingStatuses.has(item.status))
    .map((item) => `${item.code}: ${item.description} is ${item.status.toLowerCase()}.`);
}

function unresolvedAuditEvidence(course: TreatmentCourse) {
  const checks = patientCourseAuditChecks.filter((check) => check.courseId === course.id && check.required);

  if (checks.length === 0) {
    return ["No app-owned audit checks exist for this course."];
  }

  return checks.flatMap((check) => {
    if (check.status === "NOT_APPLICABLE" && !check.naReason?.trim()) {
      return [`${check.label}: N/A reason missing.`];
    }

    if (!closedBillingStatuses.has(check.status)) {
      return [`${check.label}: ${check.status.toLowerCase()}.`];
    }

    return [];
  });
}

export function evaluateCloseoutReadiness(courseId: string): CloseoutReadiness {
  const course = treatmentCourses.find((item) => item.id === courseId || courseRef(item.id) === courseId);

  if (!course) {
    return {
      courseRef: courseId,
      ready: false,
      blockers: ["Course not found."],
      missingEvidence: ["Course record"],
      requiredActions: ["Select a valid course before evaluating closeout."]
    };
  }

  const courseBillingItems = billingItems.filter((item) => item.courseId === course.id);
  const missingEvidence = [
    ...unresolvedDocumentEvidence(course),
    ...missingSignatureEvidence(course),
    ...unresolvedFractionEvidence(course),
    ...unresolvedBillingEvidence(courseBillingItems),
    ...unresolvedAuditEvidence(course)
  ];
  const blockers = [...missingEvidence];

  if (!["POST_TX", "AUDIT", "CLOSED"].includes(course.coursePhase ?? "CONSULTATION")) {
    blockers.push("Course has not reached Post-Tx or Audit phase.");
  }

  return {
    courseRef: courseRef(course.id),
    ready: blockers.length === 0,
    blockers,
    missingEvidence,
    requiredActions: blockers.length === 0
      ? ["Final Carepath audit sign may be prepared."]
      : ["Resolve missing evidence before final audit sign or course close."]
  };
}
