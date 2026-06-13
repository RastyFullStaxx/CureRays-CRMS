import { notFound } from 'next/navigation';
import { PatientWorkspace } from '@/components/patients/patient-workspace';
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  prescriptions,
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

export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const patient = findPatientPhi(id, systemPhiAccess('Render patient workspace page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const domainCourse = getCourses().find((item) => item.id === course.id);
  const prescription = prescriptions.find((item) => item.courseId === course.id);

  return (
    <PatientWorkspace
      patient={patient}
      course={course}
      initialTab={query?.tab === 'fractions' ? 'fractions' : undefined}
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
      prescriptionPhases={prescription?.phases ?? []}
      planningReadiness={getPhase6PlanningReadiness(course.id)}
      images={imagingAssets.filter((image) => image.courseId === course.id)}
      auditChecks={auditChecks.filter((check) => check.courseId === course.id)}
      auditEvents={auditEvents.filter((event) => event.patientId === patient.id || event.entityId.includes(course.id) || event.entityId.includes(patient.id))}
    />
  );
}
