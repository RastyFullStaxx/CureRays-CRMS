import { notFound } from "next/navigation";
import { BillingCodePanel } from "@/components/billing-code-panel";
import { DocumentLifecycleTable } from "@/components/document-lifecycle-table";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { billingCodes, generatedDocuments, patients, treatmentCourses } from "@/lib/mock-data";
import { courseDocuments, patientActiveCourse } from "@/lib/workflow";

export default function PatientDocumentsPage({ params }: { params: { id: string } }) {
  const patient = patients.find((item) => item.id === params.id);

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  return (
    <PatientProfileShell patient={patient} active="documents">
      <DocumentLifecycleTable documents={courseDocuments(course.id, generatedDocuments)} />
      <BillingCodePanel codes={billingCodes} />
    </PatientProfileShell>
  );
}
