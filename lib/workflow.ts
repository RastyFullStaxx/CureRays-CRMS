import type {
  CarepathTask,
  CarepathTaskStatus,
  CarepathWorkflowPhase,
  ChartRoundsPhase,
  Checklist,
  DocumentStatus,
  FractionLogEntry,
  GeneratedDocument,
  Patient,
  PatientStatus,
  ResponsibleParty,
  TreatmentCourse
} from "@/lib/types";

export const chartRoundsPhaseLabels: Record<ChartRoundsPhase, string> = {
  UPCOMING: "Upcoming",
  ON_TREATMENT: "On Treatment",
  POST: "Post"
};

export const carepathPhaseLabels: Record<CarepathWorkflowPhase, string> = {
  CONSULTATION: "Consultation",
  CHART_PREP: "Chart Prep",
  PLANNING: "Planning",
  ON_TREATMENT: "On Treatment",
  POST_TX: "Post-TX"
};

export const patientStatusLabels: Record<PatientStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  PAUSED: "Paused"
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  PENDING_NEEDED: "Pending / Needed",
  SIGNED: "Signed",
  NOT_APPLICABLE: "N/A",
  NEEDS_REVIEW: "Needs Review",
  COMPLETED: "Completed"
};

export const carepathTaskStatusLabels: Record<CarepathTaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  NEEDS_REVIEW: "Needs Review",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
  NOT_APPLICABLE: "N/A"
};

export const responsiblePartyLabels: Record<ResponsibleParty, string> = {
  VA: "Virtual Assistant",
  MA: "Medical Assistant",
  RTT: "Therapist",
  NP_PA: "NP / PA",
  PCP: "Doctor PCP",
  RAD_ONC: "Rad Onc",
  PHYSICIST: "Physicist",
  ADMIN: "Admin"
};

export function patientName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName}`;
}

export function checklistScore(checklist: Checklist) {
  const completed = [
    checklist.txSummaryComplete,
    checklist.followUpScheduled,
    checklist.billingComplete
  ].filter(Boolean).length;

  return {
    completed,
    total: 3,
    percent: Math.round((completed / 3) * 100)
  };
}

export function patientsByPhase(patients: Patient[], phase: ChartRoundsPhase) {
  return patients.filter((patient) => patient.chartRoundsPhase === phase);
}

export function phaseCounts(patients: Patient[]) {
  return patients.reduce<Record<ChartRoundsPhase, number>>(
    (counts, patient) => {
      counts[patient.chartRoundsPhase] += 1;
      return counts;
    },
    {
      UPCOMING: 0,
      ON_TREATMENT: 0,
      POST: 0
    }
  );
}

export function countFlaggedPatients(patients: Patient[]) {
  return patients.filter((patient) => patient.flags.length > 0).length;
}

export function averageChecklistPercent(patients: Patient[]) {
  if (patients.length === 0) {
    return 0;
  }

  const total = patients.reduce((sum, patient) => sum + checklistScore(patient.checklist).percent, 0);
  return Math.round(total / patients.length);
}

export function statusCounts(patients: Patient[]) {
  return patients.reduce<Record<PatientStatus, number>>(
    (counts, patient) => {
      counts[patient.status] += 1;
      return counts;
    },
    {
      ACTIVE: 0,
      ON_HOLD: 0,
      PAUSED: 0
    }
  );
}

export function carepathProgress(tasks: CarepathTask[]) {
  if (tasks.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = tasks.filter((task) =>
    ["COMPLETED", "NOT_APPLICABLE"].includes(task.status)
  ).length;

  return {
    completed,
    total: tasks.length,
    percent: Math.round((completed / tasks.length) * 100)
  };
}

export function documentStatusCounts(documents: GeneratedDocument[]) {
  return documents.reduce<Record<DocumentStatus, number>>(
    (counts, document) => {
      counts[document.status] += 1;
      return counts;
    },
    {
      PENDING_NEEDED: 0,
      SIGNED: 0,
      NOT_APPLICABLE: 0,
      NEEDS_REVIEW: 0,
      COMPLETED: 0
    }
  );
}

export function documentProgress(documents: GeneratedDocument[]) {
  if (documents.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }

  const completed = documents.filter((document) =>
    ["SIGNED", "COMPLETED", "NOT_APPLICABLE"].includes(document.status)
  ).length;

  return {
    completed,
    total: documents.length,
    percent: Math.round((completed / documents.length) * 100)
  };
}

export function auditReadinessScore(tasks: CarepathTask[], documents: GeneratedDocument[], fractions: FractionLogEntry[]) {
  const taskScore = carepathProgress(tasks).percent;
  const documentScore = documentProgress(documents).percent;
  const fractionScore =
    fractions.length === 0
      ? 100
      : Math.round(
          (fractions.filter((entry) => entry.mdApproval && entry.dotApproval).length / fractions.length) * 100
        );

  return Math.round(taskScore * 0.4 + documentScore * 0.4 + fractionScore * 0.2);
}

export function isOverdue(date?: string) {
  if (!date) {
    return false;
  }

  return new Date(`${date}T23:59:59`) < new Date("2026-04-26T23:59:59+08:00");
}

export function overdueTaskCount(tasks: CarepathTask[]) {
  return tasks.filter((task) => !["COMPLETED", "NOT_APPLICABLE"].includes(task.status) && isOverdue(task.dueDate)).length;
}

export function responsiblePartyQueue(tasks: CarepathTask[], documents: GeneratedDocument[]) {
  const parties: ResponsibleParty[] = ["VA", "MA", "RTT", "NP_PA", "PCP", "RAD_ONC", "PHYSICIST", "ADMIN"];

  return parties.map((party) => {
    const partyTasks = tasks.filter((task) => task.responsibleParty === party);
    const partyDocuments = documents.filter((document) => document.responsibleParty === party);

    return {
      responsibleParty: party,
      assignedTasks: partyTasks.filter((task) => !["COMPLETED", "NOT_APPLICABLE"].includes(task.status)).length,
      pendingDocuments: partyDocuments.filter((document) => document.status === "PENDING_NEEDED").length,
      reviewItems:
        partyTasks.filter((task) => task.status === "NEEDS_REVIEW" || task.status === "BLOCKED").length +
        partyDocuments.filter((document) => document.status === "NEEDS_REVIEW").length,
      overdueActions: overdueTaskCount(partyTasks),
      completedActions:
        partyTasks.filter((task) => task.status === "COMPLETED").length +
        partyDocuments.filter((document) => ["SIGNED", "COMPLETED"].includes(document.status)).length
    };
  });
}

export function patientCourses(patientId: string, courses: TreatmentCourse[]) {
  return courses.filter((course) => course.patientId === patientId);
}

export function patientActiveCourse(patient: Patient, courses: TreatmentCourse[]) {
  return courses.find((course) => course.id === patient.activeCourseId);
}

export function courseTasks(courseId: string, tasks: CarepathTask[]) {
  return tasks.filter((task) => task.courseId === courseId);
}

export function courseDocuments(courseId: string, documents: GeneratedDocument[]) {
  return documents.filter((document) => document.courseId === courseId);
}

export function courseFractions(courseId: string, fractions: FractionLogEntry[]) {
  return fractions.filter((entry) => entry.courseId === courseId);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatLastUpdated(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
