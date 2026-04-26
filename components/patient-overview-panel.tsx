import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import type { CarepathTask, FractionLogEntry, GeneratedDocument, Patient, TreatmentCourse } from "@/lib/types";
import {
  auditReadinessScore,
  carepathProgress,
  documentProgress,
  patientName
} from "@/lib/workflow";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import { ProgressBar } from "@/components/progress-bar";

export function PatientOverviewPanel({
  patient,
  course,
  tasks,
  documents,
  fractions
}: {
  patient: Patient;
  course: TreatmentCourse;
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
  fractions: FractionLogEntry[];
}) {
  const carepath = carepathProgress(tasks);
  const document = documentProgress(documents);
  const audit = auditReadinessScore(tasks, documents, fractions);

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PhaseBadge phase={patient.chartRoundsPhase} />
            <StatusBadge status={patient.status} />
            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              PHI-minimized
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-curerays-dark-plum">{patientName(patient)}</h2>
          <p className="mt-2 text-sm leading-6 text-curerays-indigo">
            {patient.diagnosis} - {patient.location} - {patient.physician}
          </p>
        </div>
        <div className="rounded-lg border border-white/70 bg-white/52 p-4 lg:w-80">
          <p className="flex items-center gap-2 text-sm font-semibold text-curerays-dark-plum">
            <ArrowRight className="h-4 w-4 text-curerays-orange" aria-hidden="true" />
            Next action
          </p>
          <p className="mt-2 text-sm leading-5 text-curerays-indigo">{patient.nextAction}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white/54 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-curerays-dark-plum">
            <UserRound className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
            Assigned staff
          </p>
          <p className="mt-2 text-lg font-semibold text-curerays-dark-plum">{patient.assignedStaff}</p>
          <p className="text-xs font-semibold text-curerays-indigo">{patient.mrn}</p>
        </div>
        <div className="rounded-lg bg-white/54 p-4">
          <ProgressBar value={carepath.percent} label="Carepath progress" />
          <p className="mt-2 text-xs font-semibold text-curerays-indigo">
            {carepath.completed}/{carepath.total} tasks ready
          </p>
        </div>
        <div className="rounded-lg bg-white/54 p-4">
          <ProgressBar value={document.percent} label="Document progress" />
          <p className="mt-2 text-xs font-semibold text-curerays-indigo">
            Audit readiness {audit}%
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-curerays-blue/5 p-4">
        <p className="text-sm font-semibold text-curerays-dark-plum">{course.protocolName}</p>
        <p className="mt-1 text-sm leading-6 text-curerays-indigo">{course.notes}</p>
      </div>
    </section>
  );
}
