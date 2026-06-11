import "server-only";

import {
  carepathTasks,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/clinical-store";
import type { CarepathTaskStatus, DocumentStatus, OperationalPatient, OperationalTreatmentCourse } from "@/lib/types";

const openTaskStatuses: CarepathTaskStatus[] = ["PENDING", "IN_PROGRESS", "NEEDS_REVIEW", "READY_FOR_REVIEW", "BLOCKED", "OVERDUE"];
const pendingDocumentStatuses: DocumentStatus[] = ["PENDING", "PENDING_NEEDED", "MISSING_FIELDS", "READY_FOR_REVIEW", "NEEDS_REVIEW", "BLOCKED", "OVERDUE"];

export type PatientRegistryRow = {
  id: string;
  patientRef: string;
  phiRecordId: string;
  displayLabel: string;
  diagnosisCategory: OperationalPatient["diagnosisCategory"];
  chartRoundsPhase: OperationalPatient["chartRoundsPhase"];
  status: OperationalPatient["status"];
  assignedStaff: string;
  activeCourseId: string;
  activeCourseRef: string;
  protocolFamily: string;
  totalFractions: number;
  currentFraction: number;
  nextActionCategory: string;
  openTasks: number;
  pendingDocuments: number;
  flags: number;
  checklistReady: number;
  lastUpdatedAt: string;
};

function checklistReadyPercent(patient: OperationalPatient) {
  const values = Object.values(patient.checklist);
  const complete = values.filter(Boolean).length;
  return values.length ? Math.round((complete / values.length) * 100) : 0;
}

function courseForPatient(patient: OperationalPatient, courses: OperationalTreatmentCourse[]) {
  return courses.find((course) => course.courseRef === patient.activeCourseRef);
}

export const patientService = {
  listRegistryPatients() {
    return operationalPatients();
  },
  listRegistryRows(): PatientRegistryRow[] {
    const patients = operationalPatients();
    const courses = operationalTreatmentCourses();

    return patients.map((patient) => {
      const course = courseForPatient(patient, courses);
      const openTasks = course
        ? carepathTasks.filter((task) => task.courseId === course.id && openTaskStatuses.includes(task.status)).length
        : 0;
      const pendingDocuments = course
        ? generatedDocuments.filter((document) => document.courseId === course.id && pendingDocumentStatuses.includes(document.status)).length
        : 0;

      return {
        id: patient.id,
        patientRef: patient.patientRef,
        phiRecordId: patient.phiRecordId,
        displayLabel: patient.displayLabel,
        diagnosisCategory: patient.diagnosisCategory,
        chartRoundsPhase: patient.chartRoundsPhase,
        status: patient.status,
        assignedStaff: patient.assignedStaff,
        activeCourseId: course?.id ?? patient.activeCourseId,
        activeCourseRef: course?.courseRef ?? patient.activeCourseRef,
        protocolFamily: course?.protocolFamily ?? "Treatment workflow",
        totalFractions: course?.totalFractions ?? 0,
        currentFraction: course?.currentFraction ?? 0,
        nextActionCategory: patient.nextActionCategory,
        openTasks,
        pendingDocuments,
        flags: patient.flags.length,
        checklistReady: checklistReadyPercent(patient),
        lastUpdatedAt: patient.lastUpdatedAt
      };
    });
  }
};
