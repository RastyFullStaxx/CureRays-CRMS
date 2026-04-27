import { notFound } from "next/navigation";
import { CarepathTaskCard } from "@/components/carepath-task-card";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { carepathTasks, patients, treatmentCourses } from "@/lib/clinical-store";
import { carepathPhaseLabels, courseTasks, patientActiveCourse } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";

const phases: CarepathWorkflowPhase[] = ["CONSULTATION", "CHART_PREP", "PLANNING", "ON_TREATMENT", "POST_TX"];

export default function PatientCarepathPage({ params }: { params: { id: string } }) {
  const patient = patients.find((item) => item.id === params.id);

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

      {phases.map((phase) => {
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
