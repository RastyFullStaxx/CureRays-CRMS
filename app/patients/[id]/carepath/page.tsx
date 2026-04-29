import { notFound } from "next/navigation";
import { CarepathTaskCard } from "@/components/carepath-task-card";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { carepathTasks, treatmentCourses } from "@/lib/clinical-store";
import { findPatientPhi, systemPhiAccess } from "@/lib/server/phi-store";
import { carepathPhaseLabels, courseTasks, orderedCarepathPhases, patientActiveCourse } from "@/lib/workflow";

export default function PatientCarepathPage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess("Render patient carepath page"));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const tasks = courseTasks(course.id, carepathTasks);

  return (
    <PatientProfileShell patient={patient} active="carepath">
      <section className="glass-panel rounded-glass p-5">
        <h2 className="text-2xl font-semibold text-curerays-dark-plum">Carepath workflow</h2>
        <p className="mt-2 text-sm leading-6 text-curerays-indigo">
          Tasks are grouped by internal Carepath phase, separate from chart-rounds phase.
        </p>
      </section>

      {orderedCarepathPhases.map((phase) => {
        const phaseTasks = tasks.filter((task) => task.workflowPhase === phase);

        if (!phaseTasks.length) {
          return null;
        }

        return (
          <section key={phase} className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-curerays-indigo">{carepathPhaseLabels[phase]}</h3>
            {phaseTasks.map((task) => (
              <CarepathTaskCard key={task.id} task={task} />
            ))}
          </section>
        );
      })}
    </PatientProfileShell>
  );
}
