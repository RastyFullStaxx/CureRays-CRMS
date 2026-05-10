import { notFound } from "next/navigation";
import { PatientWorkspace } from "@/components/patients/patient-workspace";
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  treatmentCourses
} from "@/lib/clinical-store";
import {
  auditChecks,
  clinicalFormTemplates,
  getCourses,
  getDocumentInstances,
  getTasks,
  getTreatmentFractions,
  getTreatmentPlans,
  getWorkflowSteps,
  imagingAssets
} from "@/lib/module-data";
import { findPatientPhi, systemPhiAccess } from "@/lib/server/phi-store";
import { courseDocuments, courseFractions, courseTasks, patientActiveCourse } from "@/lib/workflow";

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess("Render patient profile page"));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const domainCourse = getCourses().find((item) => item.id === course.id);
  const workflowSteps = getWorkflowSteps(course.id);
  const moduleTasks = getTasks().filter((task) => task.courseId === course.id);
  const moduleDocuments = getDocumentInstances().filter((document) => document.courseId === course.id);
  const treatmentPlans = getTreatmentPlans().filter((plan) => plan.courseId === course.id);
  const treatmentFractions = getTreatmentFractions().filter((fraction) => fraction.courseId === course.id);
  const courseImages = imagingAssets.filter((asset) => asset.courseId === course.id);
  const courseAuditChecks = auditChecks.filter((check) => check.courseId === course.id);

  return (
    <PatientWorkspace
      patient={patient}
      course={course}
      domainCourse={domainCourse}
      carepathTasks={courseTasks(course.id, carepathTasks)}
      generatedDocuments={courseDocuments(course.id, generatedDocuments)}
      fractionEntries={courseFractions(course.id, fractionLogEntries)}
      workflowSteps={workflowSteps}
      tasks={moduleTasks}
      documents={moduleDocuments}
      clinicalFormTemplates={clinicalFormTemplates}
      treatmentPlans={treatmentPlans}
      treatmentFractions={treatmentFractions}
      images={courseImages}
      auditChecks={courseAuditChecks.length ? courseAuditChecks : auditChecks.slice(0, 4)}
      auditEvents={auditEvents}
    />
  );
}
