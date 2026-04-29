import type {
  AnalyticsInsight,
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
  DRAFT: "Draft",
  PENDING_NEEDED: "Pending / Needed",
  MISSING_FIELDS: "Missing Fields",
  READY_FOR_REVIEW: "Ready for Review",
  SIGNED: "Signed",
  EXPORTED: "Exported",
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

export const orderedChartRoundsPhases: ChartRoundsPhase[] = ["UPCOMING", "ON_TREATMENT", "POST"];

export const orderedCarepathPhases: CarepathWorkflowPhase[] = [
  "CONSULTATION",
  "CHART_PREP",
  "PLANNING",
  "ON_TREATMENT",
  "POST_TX"
];

export const orderedResponsibleParties: ResponsibleParty[] = [
  "VA",
  "MA",
  "RTT",
  "NP_PA",
  "PCP",
  "RAD_ONC",
  "PHYSICIST",
  "ADMIN"
];

export const completedTaskStatuses: CarepathTaskStatus[] = ["COMPLETED", "NOT_APPLICABLE"];

export const completedDocumentStatuses: DocumentStatus[] = [
  "SIGNED",
  "EXPORTED",
  "COMPLETED",
  "NOT_APPLICABLE"
];

export const openDocumentRiskStatuses: DocumentStatus[] = [
  "PENDING_NEEDED",
  "MISSING_FIELDS",
  "NEEDS_REVIEW"
];

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

  const completed = tasks.filter((task) => completedTaskStatuses.includes(task.status)).length;

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
      DRAFT: 0,
      PENDING_NEEDED: 0,
      MISSING_FIELDS: 0,
      READY_FOR_REVIEW: 0,
      SIGNED: 0,
      EXPORTED: 0,
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

  const completed = documents.filter((document) => completedDocumentStatuses.includes(document.status)).length;

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

  return new Date(`${date}T23:59:59`) < new Date();
}

export function overdueTaskCount(tasks: CarepathTask[]) {
  return tasks.filter((task) => !completedTaskStatuses.includes(task.status) && isOverdue(task.dueDate)).length;
}

export function responsiblePartyQueue(tasks: CarepathTask[], documents: GeneratedDocument[]) {
  return orderedResponsibleParties.map((party) => {
    const partyTasks = tasks.filter((task) => task.responsibleParty === party);
    const partyDocuments = documents.filter((document) => document.responsibleParty === party);

    return {
      responsibleParty: party,
      assignedTasks: partyTasks.filter((task) => !completedTaskStatuses.includes(task.status)).length,
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

export function workflowBottlenecksByParty(tasks: CarepathTask[], documents: GeneratedDocument[]) {
  return responsiblePartyQueue(tasks, documents)
    .map((queue) => ({
      ...queue,
      unresolved: queue.assignedTasks + queue.pendingDocuments + queue.reviewItems + queue.overdueActions
    }))
    .filter((queue) => queue.unresolved > 0)
    .sort((a, b) => b.unresolved - a.unresolved);
}

export function documentRiskHotspots(documents: GeneratedDocument[]) {
  return documents
    .filter((document) => openDocumentRiskStatuses.includes(document.status) || !document.auditReady)
    .reduce<Array<{ name: string; count: number; reviewCount: number; pendingCount: number }>>((hotspots, document) => {
      const existing = hotspots.find((item) => item.name === document.name);

      if (existing) {
        existing.count += 1;
        existing.reviewCount += document.status === "NEEDS_REVIEW" ? 1 : 0;
        existing.pendingCount += document.status === "PENDING_NEEDED" ? 1 : 0;
        return hotspots;
      }

      hotspots.push({
        name: document.name,
        count: 1,
        reviewCount: document.status === "NEEDS_REVIEW" ? 1 : 0,
        pendingCount: document.status === "PENDING_NEEDED" ? 1 : 0
      });
      return hotspots;
    }, [])
    .sort((a, b) => b.count - a.count);
}

export function diagnosisWorkflowMix(patients: Patient[]) {
  return patients
    .reduce<Array<{ diagnosis: Patient["diagnosisCategory"]; count: number }>>((mix, patient) => {
      const existing = mix.find((item) => item.diagnosis === patient.diagnosisCategory);

      if (existing) {
        existing.count += 1;
        return mix;
      }

      mix.push({ diagnosis: patient.diagnosisCategory, count: 1 });
      return mix;
    }, [])
    .sort((a, b) => b.count - a.count);
}

export function auditBlockers(tasks: CarepathTask[], documents: GeneratedDocument[], fractions: FractionLogEntry[]) {
  const taskBlockers = tasks.filter((task) => !task.auditReady && !completedTaskStatuses.includes(task.status));
  const documentBlockers = documents.filter((document) => !document.auditReady || openDocumentRiskStatuses.includes(document.status));
  const fractionBlockers = fractions.filter((entry) => !entry.mdApproval || !entry.dotApproval);

  return {
    taskBlockers,
    documentBlockers,
    fractionBlockers,
    total: taskBlockers.length + documentBlockers.length + fractionBlockers.length
  };
}

export function courseAttentionSignals(courses: TreatmentCourse[]) {
  return courses.filter((course) => ["ON_HOLD", "NOT_STARTED"].includes(course.status));
}

export function fractionLogCompletionSignals(fractions: FractionLogEntry[]) {
  if (fractions.length === 0) {
    return {
      total: 0,
      complete: 0,
      missingApproval: 0,
      percent: 100
    };
  }

  const complete = fractions.filter((entry) => entry.mdApproval && entry.dotApproval).length;

  return {
    total: fractions.length,
    complete,
    missingApproval: fractions.length - complete,
    percent: Math.round((complete / fractions.length) * 100)
  };
}

export function generateAnalyticsInsights({
  patients,
  courses,
  tasks,
  documents,
  fractions
}: {
  patients: Patient[];
  courses: TreatmentCourse[];
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
  fractions: FractionLogEntry[];
}): AnalyticsInsight[] {
  const bottlenecks = workflowBottlenecksByParty(tasks, documents);
  const topBottleneck = bottlenecks[0];
  const docHotspots = documentRiskHotspots(documents);
  const topDocHotspot = docHotspots[0];
  const diagnosisMix = diagnosisWorkflowMix(patients);
  const topDiagnosis = diagnosisMix[0];
  const blockers = auditBlockers(tasks, documents, fractions);
  const fractionSignals = fractionLogCompletionSignals(fractions);
  const coursesNeedingAttention = courseAttentionSignals(courses);
  const naDocuments = documents.filter((document) => document.status === "NOT_APPLICABLE").length;

  const insights: AnalyticsInsight[] = [];

  if (topBottleneck) {
    insights.push({
      id: "INS-WORKFLOW-BOTTLENECK",
      title: `${responsiblePartyLabels[topBottleneck.responsibleParty]} owns the largest open queue`,
      category: "WORKFLOW_BOTTLENECK",
      severity: topBottleneck.unresolved >= 4 ? "HIGH" : "MEDIUM",
      summary: "The highest unresolved workload is concentrated in one responsible-party lane.",
      evidence: `${topBottleneck.unresolved} unresolved items, including ${topBottleneck.reviewItems} review items and ${topBottleneck.overdueActions} overdue actions.`,
      recommendation: "Prioritize this role queue before adding more new workflow tasks.",
      solutionOpportunity: "Role-based work queue automation"
    });
  }

  if (topDocHotspot) {
    insights.push({
      id: "INS-DOCUMENT-HOTSPOT",
      title: `${topDocHotspot.name} is a document-risk hotspot`,
      category: "DOCUMENT_LIFECYCLE",
      severity: topDocHotspot.count >= 2 ? "HIGH" : "MEDIUM",
      summary: "Document lifecycle status is creating audit and routing friction.",
      evidence: `${topDocHotspot.count} open risk signals, with ${topDocHotspot.pendingCount} pending and ${topDocHotspot.reviewCount} needing review.`,
      recommendation: "Create clearer routing and signature states for this document family.",
      solutionOpportunity: "Smart document lifecycle tracker"
    });
  }

  if (blockers.total > 0) {
    insights.push({
      id: "INS-AUDIT-BLOCKERS",
      title: "Audit readiness is being reduced by unresolved workflow evidence",
      category: "AUDIT_RISK",
      severity: blockers.total >= 6 ? "HIGH" : "MEDIUM",
      summary: "Tasks, documents, and fraction approvals are all contributing to audit risk.",
      evidence: `${blockers.taskBlockers.length} task blockers, ${blockers.documentBlockers.length} document blockers, and ${blockers.fractionBlockers.length} fraction log blockers.`,
      recommendation: "Surface audit blockers as a single checklist before export or upload.",
      solutionOpportunity: "Audit readiness checklist generator"
    });
  }

  if (topDiagnosis) {
    insights.push({
      id: "INS-DIAGNOSIS-MIX",
      title: `${topDiagnosis.diagnosis.replaceAll("_", " ")} is the largest workflow segment`,
      category: "DIAGNOSIS_PATTERN",
      severity: topDiagnosis.count >= 3 ? "MEDIUM" : "LOW",
      summary: "The diagnosis mix can guide which workflow templates should be refined first.",
      evidence: `${topDiagnosis.count} of ${patients.length} patient records use this diagnosis category.`,
      recommendation: "Prioritize template quality and exception handling for the largest segment.",
      solutionOpportunity: "Diagnosis workflow template builder"
    });
  }

  if (fractionSignals.missingApproval > 0) {
    insights.push({
      id: "INS-FRACTION-APPROVALS",
      title: "Fraction approvals need automated follow-up",
      category: "AUTOMATION_OPPORTUNITY",
      severity: "MEDIUM",
      summary: "Missing MD or DOT approvals can quietly block readiness if not surfaced early.",
      evidence: `${fractionSignals.missingApproval} of ${fractionSignals.total} fraction log entries are missing at least one approval.`,
      recommendation: "Trigger reminders when fraction entries are saved without required approvals.",
      solutionOpportunity: "Fraction log validation assistant"
    });
  }

  if (naDocuments > 0) {
    insights.push({
      id: "INS-DOCUMENT-APPLICABILITY",
      title: "N/A document handling should become rules-driven",
      category: "AUTOMATION_OPPORTUNITY",
      severity: "LOW",
      summary: "Not-applicable documents are expected, but manual N/A decisions can become inconsistent.",
      evidence: `${naDocuments} generated documents are marked not applicable in the workflow.`,
      recommendation: "Model applicability by diagnosis, protocol, modality, and course state.",
      solutionOpportunity: "Smart document applicability engine"
    });
  }

  if (coursesNeedingAttention.length > 0) {
    insights.push({
      id: "INS-COURSE-ATTENTION",
      title: "Some treatment courses need operational attention",
      category: "WORKFLOW_BOTTLENECK",
      severity: coursesNeedingAttention.length >= 2 ? "HIGH" : "MEDIUM",
      summary: "Course status signals can identify work before it becomes a missed handoff.",
      evidence: `${coursesNeedingAttention.length} courses are not started or on hold.`,
      recommendation: "Use course attention signals to drive daily huddle priorities.",
      solutionOpportunity: "Treatment course attention board"
    });
  }

  return insights;
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
