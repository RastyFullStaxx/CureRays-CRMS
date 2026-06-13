export const dynamic = 'force-dynamic';

import { CoursesCommandClient, type CourseCommandRow } from '@/components/courses/courses-command-client';
import {
  billingItems,
  moduleSnapshot,
  patientLabel,
  patientMrn,
  statusLabel,
} from '@/lib/services/operational-page-service';

function closeoutStatus(courseId: string) {
  const auditChecks = moduleSnapshot.auditChecks.filter((check) => check.courseId === courseId);
  const blocked = auditChecks.filter((check) => ['BLOCKED', 'OVERDUE', 'READY_FOR_REVIEW'].includes(check.status)).length;

  if (blocked > 0) {
    return `${blocked} audit items`;
  }

  return auditChecks.length ? 'Audit ready' : 'Audit pending';
}

function billingStatus(courseId: string) {
  const linkedBilling = billingItems.filter((item) =>
    moduleSnapshot.documents.some((document) => document.courseId === courseId && document.id === item.linkedDocumentId),
  );
  const blocked = linkedBilling.filter((item) => item.status === 'BLOCKED').length;

  if (blocked > 0) {
    return `${blocked} billing blockers`;
  }

  return linkedBilling.length ? `${linkedBilling.length} billing links` : 'Billing pending';
}

export default function CoursesPage() {
  const courses = moduleSnapshot.courses;
  const rows: CourseCommandRow[] = courses.map((course) => {
    const workflowSteps = moduleSnapshot.workflowSteps.filter((step) => step.courseId === course.id);
    const tasks = moduleSnapshot.tasks.filter((task) => task.courseId === course.id);
    const documents = moduleSnapshot.documents.filter((document) => document.courseId === course.id);
    const fractions = moduleSnapshot.fractions.filter((fraction) => fraction.courseId === course.id);
    const plans = moduleSnapshot.plans.filter((plan) => plan.courseId === course.id);

    return {
      id: course.id,
      patientId: course.patientId,
      patient: patientLabel(course.patientId),
      patientRef: patientMrn(course.patientId),
      course: course.id.replace('COURSE-', 'C'),
      courseNumber: course.courseNumber,
      diagnosis: course.diagnosisType,
      site: course.treatmentSite,
      location: course.location,
      physician: course.physicianId ?? 'Unassigned',
      phase: course.currentPhase,
      status: course.status,
      startDate: course.startDate ?? '',
      endDate: course.endDate ?? '',
      nextAction: course.nextAction,
      staff: course.assignedStaff.join(', '),
      flags: course.flagsIssues,
      workflowSteps: workflowSteps.length,
      openTasks: tasks.filter((task) => !['COMPLETED', 'SIGNED', 'NOT_APPLICABLE'].includes(task.status)).length,
      blockedTasks: tasks.filter((task) => ['BLOCKED', 'OVERDUE'].includes(task.status)).length,
      documents: documents.length,
      missingDocuments: documents.filter((document) => ['BLOCKED', 'MISSING_FIELDS', 'NOT_STARTED', 'PENDING'].includes(document.status)).length,
      fractionsLogged: fractions.length,
      totalFractions: moduleSnapshot.treatmentCourses.find((item) => item.id === course.id)?.totalFractions ?? 0,
      planningStatus: plans.length ? statusLabel(plans[0].physicistReviewStatus) : 'Planning pending',
      billingStatus: billingStatus(course.id),
      auditStatus: closeoutStatus(course.id),
    };
  });

  return (
    <CoursesCommandClient
      rows={rows}
      stats={{
        active: courses.filter((course) => course.status !== 'COMPLETED').length,
        upcoming: courses.filter((course) => course.simpleDashboardPhase === 'UPCOMING').length,
        onTreatment: courses.filter((course) => course.simpleDashboardPhase === 'ON_TREATMENT').length,
        post: courses.filter((course) => course.simpleDashboardPhase === 'POST').length,
        blocked: courses.filter((course) => course.flagsIssues.length || course.status === 'BLOCKED').length,
      }}
    />
  );
}
