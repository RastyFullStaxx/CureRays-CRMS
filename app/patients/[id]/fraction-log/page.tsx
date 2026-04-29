import { notFound } from "next/navigation";
import { FractionLogTable } from "@/components/fraction-log-table";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { TreatmentCoursePanel } from "@/components/treatment-course-panel";
import { fractionLogEntries, treatmentCourses } from "@/lib/clinical-store";
import { findPatientPhi, systemPhiAccess } from "@/lib/server/phi-store";
import { courseFractions, patientActiveCourse } from "@/lib/workflow";

export default function PatientFractionLogPage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess("Render patient fraction log page"));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  return (
    <PatientProfileShell patient={patient} active="fraction-log">
      <TreatmentCoursePanel course={course} />
      <FractionLogTable entries={courseFractions(course.id, fractionLogEntries)} />
    </PatientProfileShell>
  );
}
