import { ClipboardList } from "lucide-react";
import type { Patient, Phase } from "@/lib/types";
import { countFlaggedPatients, patientsByPhase } from "@/lib/workflow";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";

const phaseCopy: Record<Phase, { title: string; description: string; eyebrow: string }> = {
  Upcoming: {
    eyebrow: "Filtered workflow",
    title: "Upcoming patients",
    description:
      "Patients appear here because their Phase is Upcoming. This view replaces manual worksheet tab movement with state-driven visibility."
  },
  "On Treatment": {
    eyebrow: "Active coordination",
    title: "On Treatment",
    description:
      "Patients currently in treatment are shown from the centralized record set, keeping next actions, flags, and checklist progress together."
  },
  Post: {
    eyebrow: "Post-treatment continuity",
    title: "Post-treatment workflow",
    description:
      "Post-treatment patients remain visible for follow-up, billing closure, and summary completion without duplicating records."
  }
};

export function PhaseView({ phase, patients }: { phase: Phase; patients: Patient[] }) {
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
            Phase field controls this page. No row copies.
          </p>
        </div>
      </div>

      <PatientTable
        patients={filteredPatients}
        title={`${phase} workflow queue`}
        description="Filtered from the same patient source used by every page."
      />
    </div>
  );
}
