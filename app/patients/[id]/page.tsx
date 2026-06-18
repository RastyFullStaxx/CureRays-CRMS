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
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';

export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const persistenceMode = (process.env.CURERAYS_PATIENT_REPOSITORY ?? process.env.CURERAYS_PERSISTENCE_MODE ?? "")
    .trim()
    .toLowerCase();
  const usePrismaStore = persistenceMode === "prisma" || persistenceMode === "prisma-ready";

  await hydrateClinicalStoreFromDatabase({
    force: usePrismaStore
  });
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
  const requestedTab = query?.tab;
  const initialTab =
    requestedTab === 'carepath' || requestedTab === 'workflow' || requestedTab === 'tasks'
      ? 'carepath'
      : requestedTab === 'treatment' || requestedTab === 'planning' || requestedTab === 'imaging' || requestedTab === 'fractions'
        ? 'treatment'
        : requestedTab === 'documents-billing' || requestedTab === 'documents' || requestedTab === 'clinical' || requestedTab === 'billing-audit'
          ? 'documents-billing'
          : requestedTab === 'activity'
            ? 'activity'
            : undefined;

  return (
    <PatientWorkspace
      patient={patient}
      course={course}
      initialTab={initialTab}
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
