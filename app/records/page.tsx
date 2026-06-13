import { RecordsCommandClient, type MasterRecordRow } from '@/components/records/records-command-client';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/services/operational-page-service';

export default function RecordsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const rows: MasterRecordRow[] = patients.map((patient) => {
    const course = treatmentCourses.find((c) => c.patientRef === patient.patientRef);
    const courseTasks = carepathTasks.filter((task) => task.courseId === course?.id);
    const courseDocuments = generatedDocuments.filter((document) => document.courseId === course?.id);
    const courseFractions = fractionLogEntries.filter((fraction) => fraction.courseId === course?.id);
    const checklistItems = Object.values(patient.checklist);
    const readyChecklistItems = checklistItems.filter(Boolean);

    return {
      id: patient.id,
      patientId: patient.id,
      patient: patient.displayLabel,
      patientRef: patient.patientRef,
      diagnosis: patient.diagnosisCategory ?? '—',
      phase: patient.chartRoundsPhase ?? '—',
      course: course ? course.id.replace('COURSE-', 'C') : '—',
      courseId: course?.id ?? '—',
      courseStatus: course?.status ?? '—',
      coursePhase: course?.coursePhase ?? course?.chartRoundsPhase ?? '—',
      fractions: courseFractions.length,
      documents: courseDocuments.length,
      openTasks: courseTasks.filter((task) => task.status !== 'COMPLETED' && task.status !== 'NOT_APPLICABLE').length,
      status: patient.chartRoundsPhase ?? '—',
      nextAction: patient.nextActionCategory,
      assignedStaff: patient.assignedStaff,
      lastUpdatedAt: patient.lastUpdatedAt,
      flags: patient.flags.map((flag) => `${flag.severity}: ${flag.summary}`),
      checklistReady: readyChecklistItems.length,
      checklistTotal: checklistItems.length,
    };
  });

  return (
    <RecordsCommandClient
      rows={rows}
      stats={{
        totalRecords: patients.length,
        activeCourses: treatmentCourses.length,
        carepathTasks: carepathTasks.length,
        documents: generatedDocuments.length,
        fractions: fractionLogEntries.length,
      }}
    />
  );
}
