import { notFound } from "next/navigation";
import { AuditTimeline } from "@/components/audit-timeline";
import { PatientOverviewPanel } from "@/components/patient-overview-panel";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { TreatmentCoursePanel } from "@/components/treatment-course-panel";
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  treatmentCourses
} from "@/lib/clinical-store";
import { findPatientPhi, systemPhiAccess } from "@/lib/server/phi-store";
import {
  courseDocuments,
  courseFractions,
  courseTasks,
  patientActiveCourse
} from "@/lib/workflow";

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess("Render patient profile page"));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const tasks = courseTasks(course.id, carepathTasks);
  const documents = courseDocuments(course.id, generatedDocuments);
  const fractions = courseFractions(course.id, fractionLogEntries);

  return (
    <PatientProfileShell patient={patient} active="overview">
      <PatientOverviewPanel
        patient={patient}
        course={course}
        tasks={tasks}
        documents={documents}
        fractions={fractions}
      />
      <TreatmentCoursePanel course={course} />

      <section id="notes" className="glass-panel rounded-glass p-5">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">Notes and flags</h3>
        <p className="mt-2 text-sm leading-6 text-curerays-indigo">{patient.notes}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {patient.flags.length ? (
            patient.flags.map((flag) => (
              <div key={flag.id} className="rounded-lg bg-curerays-orange/10 p-4">
                <p className="text-sm font-semibold text-curerays-orange">{flag.severity}</p>
                <p className="mt-1 text-sm leading-5 text-curerays-dark-plum">{flag.summary}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white/54 p-4 text-sm font-semibold text-curerays-indigo">
              No active operational flags.
            </div>
          )}
        </div>
      </section>

      <div id="audit">
        <AuditTimeline events={auditEvents} />
      </div>
    </PatientProfileShell>
  );
}
