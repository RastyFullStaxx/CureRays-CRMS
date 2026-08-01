import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
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
import { findPatientPhi } from '@/lib/server/phi-store';
import {
  PILOT_SESSION_COOKIE,
  pilotSessionFromCookieValue
} from '@/lib/server/pilot-session';
import { courseDocuments, courseFractions, courseTasks, patientActiveCourse } from '@/lib/workflow';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import { roleCan } from '@/lib/rbac';
import { normalizePatientWorkspaceTab } from '@/lib/services/patient-workspace-service';
import { evaluateWorkflowCommand } from '@/lib/server/workflow-command-service';

export default async function PatientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string; targetKind?: string; targetId?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const usePrismaStore = (process.env.CURERAYS_PERSISTENCE_MODE ?? "").trim().toLowerCase() === "prisma";

  await hydrateClinicalStoreFromDatabase({
    force: usePrismaStore
  });
  const cookieStore = await cookies();
  const session = pilotSessionFromCookieValue(
    cookieStore.get(PILOT_SESSION_COOKIE)?.value
  );

  if (!session) {
    redirect('/login');
  }

  const patient = findPatientPhi(id, {
    ...session,
    reason: 'Render patient workspace page'
  });

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const domainCourse = getCourses().find((item) => item.id === course.id);
  const coursePhase = course.coursePhase ?? 'CONSULTATION';
  const canAdvanceCourse = roleCan(session.role, 'workflow:advance');
  const workflowEvaluation = evaluateWorkflowCommand(course.id);
  const advanceEvaluation = {
    status: workflowEvaluation.status,
    blockers: workflowEvaluation.blockers,
    nextPhase: workflowEvaluation.nextPhase,
  };
  const prescription = prescriptions.find((item) => item.courseId === course.id);
  const initialTab = normalizePatientWorkspaceTab(query?.tab);
  const allowedTargetKinds = new Set(['step', 'fraction', 'document', 'audit']);
  const initialTarget = query?.targetKind && query.targetId && allowedTargetKinds.has(query.targetKind) && /^[A-Za-z0-9_-]+$/.test(query.targetId)
    ? {
        targetKind: query.targetKind as 'step' | 'fraction' | 'document' | 'audit',
        targetId: query.targetId,
      }
    : undefined;

  return (
    <PatientWorkspace
      patient={patient}
      course={course}
      initialTab={initialTab}
      initialTarget={initialTarget}
      domainCourse={domainCourse}
      coursePhase={coursePhase}
      canAdvanceCourse={canAdvanceCourse}
      advanceEvaluation={advanceEvaluation}
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
