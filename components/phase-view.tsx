import { ClipboardList } from "lucide-react";
import type { CarepathTask, ChartRoundsPhase, FractionLogEntry, GeneratedDocument, Patient, TreatmentCourse } from "@/lib/types";
import { chartRoundsPhaseLabels, countFlaggedPatients, patientsByPhase } from "@/lib/workflow";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";

const phaseCopy: Record<ChartRoundsPhase, { title: string; description: string; eyebrow: string }> = {
  UPCOMING: {
    eyebrow: "Filtered workflow",
    title: "Upcoming patients",
    description:
      "Patients appear here because their chart-rounds phase is Upcoming. Carepath and document readiness still remain visible."
  },
  ON_TREATMENT: {
    eyebrow: "Active coordination",
    title: "On Treatment",
    description:
      "Patients currently in treatment are shown from the centralized record set with fraction readiness and active document blockers."
  },
  POST: {
    eyebrow: "Post-treatment continuity",
    title: "Post-treatment workflow",
    description:
      "Post-treatment patients remain visible for follow-up, billing closure, treatment summaries, and audit readiness."
  }
};

export function PhaseView({
  phase,
  patients,
  courses,
  tasks,
  documents,
  fractions
}: {
  phase: ChartRoundsPhase;
  patients: Patient[];
  courses: TreatmentCourse[];
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
  fractions: FractionLogEntry[];
}) {
  const filteredPatients = patientsByPhase(patients, phase);
  const copy = phaseCopy[phase];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        icon={ClipboardList}
        stat={`${filteredPatients.length} patients`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel rounded-glass p-5">
          <p className="text-sm font-semibold text-curerays-indigo">Visible records</p>
          <p className="mt-2 text-3xl font-semibold text-curerays-dark-plum">{filteredPatients.length}</p>
        </div>
        <div className="glass-panel rounded-glass p-5">
          <p className="text-sm font-semibold text-curerays-indigo">Flagged patients</p>
          <p className="mt-2 text-3xl font-semibold text-curerays-dark-plum">
            {countFlaggedPatients(filteredPatients)}
          </p>
        </div>
        <div className="glass-panel rounded-glass p-5">
          <p className="text-sm font-semibold text-curerays-indigo">Workflow rule</p>
          <p className="mt-2 text-sm font-semibold leading-5 text-curerays-dark-plum">
            {chartRoundsPhaseLabels[phase]} is a field-driven view. No row copies.
          </p>
        </div>
      </div>

      <PatientTable
        patients={filteredPatients}
        courses={courses}
        tasks={tasks}
        documents={documents}
        fractions={fractions}
        title={`${chartRoundsPhaseLabels[phase]} workflow queue`}
        description="Filtered from the same patient source used by every page."
      />
    </div>
  );
}
