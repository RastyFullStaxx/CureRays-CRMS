import { notFound } from 'next/navigation';
import { PatientWorkspace } from '@/components/patients/patient-workspace';
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  treatmentCourses,
} from '@/lib/services/operational-page-service';
import {
  auditChecks,
  clinicalFormTemplates,
  getCourses,
  getDocumentInstances,
  getPhase6PlanningReadiness,
  getTasks,
  getTreatmentFractions,
  getTreatmentPlans,
  getWorkflowSteps,
  imagingAssets,
} from '@/lib/services/operational-page-service';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseDocuments, courseFractions, courseTasks, patientActiveCourse } from '@/lib/workflow';

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = findPatientPhi(id, systemPhiAccess('Render patient workspace page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const domainCourse = getCourses().find((item) => item.id === course.id);

  return (
    <PatientWorkspace
      patient={patient}
      course={course}
      domainCourse={domainCourse}
      carepathTasks={courseTasks(course.id, carepathTasks)}
      generatedDocuments={courseDocuments(course.id, generatedDocuments)}
      fractionEntries={courseFractions(course.id, fractionLogEntries)}
      workflowSteps={getWorkflowSteps(course.id)}
      tasks={getTasks().filter((task) => task.courseId === course.id)}
      documents={getDocumentInstances().filter((document) => document.courseId === course.id)}
      clinicalFormTemplates={clinicalFormTemplates}
      treatmentPlans={getTreatmentPlans().filter((plan) => plan.courseId === course.id)}
      treatmentFractions={getTreatmentFractions().filter((fraction) => fraction.courseId === course.id)}
      planningReadiness={getPhase6PlanningReadiness(course.id)}
      images={imagingAssets.filter((image) => image.courseId === course.id)}
      auditChecks={auditChecks.filter((check) => check.courseId === course.id)}
      auditEvents={auditEvents.filter((event) => event.patientId === patient.id || event.entityId.includes(course.id) || event.entityId.includes(patient.id))}
    />
  );
}
