import "server-only";

import {
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/clinical-store";
import type {
  DocumentStatus,
  FractionLogStatus,
  FractionWorksheetApprovalState
} from "@/lib/types";

export type FractionLogRegistryRow = {
  id: string;
  href: string;
  patientRef: string;
  courseRef: string;
  courseId: string;
  fractionNumber: number;
  date: string;
  phase: string;
  doseCgy: number;
  cumulativeDoseCgy: number;
  dotApprovalState: FractionWorksheetApprovalState;
  mdApprovalState: FractionWorksheetApprovalState;
  review: "Clear" | "Approval" | "Revision" | "Calculation";
  status: FractionLogStatus;
  document: DocumentStatus | "MISSING";
  technicianInitials: string;
};

function approvalState(approved: boolean, state?: FractionWorksheetApprovalState) {
  if (state) {
    return state;
  }

  return approved ? "APPROVED" : "PENDING";
}

function reviewState(row: {
  status: FractionLogStatus;
  mdApprovalState: FractionWorksheetApprovalState;
  dotApprovalState: FractionWorksheetApprovalState;
  calculationStatus?: string;
}): FractionLogRegistryRow["review"] {
  if (row.status === "REVISION_NEEDED" || row.mdApprovalState === "REVISION_NEEDED" || row.dotApprovalState === "REVISION_NEEDED") {
    return "Revision";
  }

  if (row.mdApprovalState !== "APPROVED" || row.dotApprovalState !== "APPROVED") {
    return "Approval";
  }

  if (row.calculationStatus && row.calculationStatus !== "AUTO_LOOKUP") {
    return "Calculation";
  }

  return "Clear";
}

export function getFractionLogRegistryRows(): FractionLogRegistryRow[] {
  const activeCourses = operationalTreatmentCourses().filter((course) => course.chartRoundsPhase === "ON_TREATMENT");
  const patients = operationalPatients();
  const activeCourseIds = new Set(activeCourses.map((course) => course.id));

  return fractionLogEntries
    .filter((entry) => activeCourseIds.has(entry.courseId))
    .map((entry) => {
      const course = activeCourses.find((item) => item.id === entry.courseId);
      const patient = patients.find((item) => item.patientRef === course?.patientRef);
      const document = generatedDocuments.find(
        (item) => item.courseId === entry.courseId && item.name.toLowerCase().includes("fraction log")
      );
      const mdApprovalState = approvalState(entry.mdApproval, entry.mdApprovalState);
      const dotApprovalState = approvalState(entry.dotApproval, entry.dotApprovalState);
      const documentStatus = (document?.status ?? "MISSING") as FractionLogRegistryRow["document"];

      return {
        id: entry.id,
        href: `/patients/${patient?.phiRecordId ?? course?.patientRef ?? "missing"}/fraction-log`,
        patientRef: patient?.patientRef ?? "PREF-MISSING",
        courseRef: course?.courseRef ?? entry.courseId.replace("COURSE-", "CREF-"),
        courseId: entry.courseId,
        fractionNumber: entry.fractionNumber,
        date: entry.date,
        phase: entry.phase,
        doseCgy: entry.dosePerFractionCgy ?? entry.dosePerFraction,
        cumulativeDoseCgy: entry.cumulativeDoseCgy ?? entry.cumulativeDose,
        dotApprovalState,
        mdApprovalState,
        review: reviewState({
          status: entry.status,
          mdApprovalState,
          dotApprovalState,
          calculationStatus: entry.calculationStatus
        }),
        status: entry.status,
        document: documentStatus,
        technicianInitials: entry.technicianInitials
      };
    })
    .sort((left, right) => {
      const courseOrder = left.courseRef.localeCompare(right.courseRef);
      return courseOrder === 0 ? left.fractionNumber - right.fractionNumber : courseOrder;
    });
}
