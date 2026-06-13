import 'server-only';

import type { ChartRoundsPhase } from '@/lib/types';
import type { PhaseCohortMode, PhaseCohortRow } from '@/components/status/phase-cohort-command-client';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/services/operational-page-service';

const phaseByMode: Record<PhaseCohortMode, ChartRoundsPhase> = {
  upcoming: 'UPCOMING',
  'on-treatment': 'ON_TREATMENT',
  post: 'POST',
};

const titleByMode: Record<PhaseCohortMode, { title: string; subtitle: string }> = {
  upcoming: {
    title: 'Upcoming',
    subtitle: 'Patients awaiting treatment initiation, planning completion, and schedule clearance',
  },
  'on-treatment': {
    title: 'On Treatment',
    subtitle: 'Patients actively receiving radiation therapy with treatment-day readiness signals',
  },
  post: {
    title: 'Post-Treatment',
    subtitle: 'Patients who completed treatment and need closeout, billing, follow-up, and audit review',
  },
};

function isOpenTask(status: string) {
  return status !== 'COMPLETED' && status !== 'CLOSED' && status !== 'NOT_APPLICABLE';
}

export function getPhaseCohort(mode: PhaseCohortMode) {
  const phase = phaseByMode[mode];
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const cohort = patients.filter((patient) => patient.chartRoundsPhase === phase);
  const rows: PhaseCohortRow[] = cohort.map((patient) => {
    const course = treatmentCourses.find((item) => item.patientRef === patient.patientRef);
    const courseTasks = carepathTasks.filter((task) => task.courseId === course?.id);
    const courseDocuments = generatedDocuments.filter((document) => document.courseId === course?.id);
    return {
      id: patient.id,
      patientId: patient.id,
      patient: patient.displayLabel,
      patientRef: patient.patientRef,
      diagnosis: patient.diagnosisCategory,
      phase: patient.chartRoundsPhase,
      course: course ? course.id.replace('COURSE-', 'C') : '-',
      courseId: course?.id ?? '-',
      courseStatus: course?.status ?? '-',
      coursePhase: course?.coursePhase ?? course?.chartRoundsPhase ?? '-',
      currentFraction: course?.currentFraction ?? 0,
      totalFractions: course?.totalFractions ?? 0,
      documents: courseDocuments.length,
      openTasks: courseTasks.filter((task) => isOpenTask(task.status)).length,
      blockedTasks: courseTasks.filter((task) => task.status === 'BLOCKED' || task.status === 'OVERDUE').length,
      nextAction: patient.nextActionCategory,
      assignedStaff: patient.assignedStaff,
      lastUpdatedAt: patient.lastUpdatedAt,
    };
  });

  return {
    ...titleByMode[mode],
    rows,
    stats: {
      cohortCount: cohort.length,
      totalCourses: treatmentCourses.length,
      carepathTasks: carepathTasks.length,
      documents: generatedDocuments.length,
      fractions: fractionLogEntries.length,
    },
  };
}
