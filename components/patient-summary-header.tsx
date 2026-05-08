import { AlertTriangle } from "lucide-react";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import type { Course, Patient } from "@/lib/types";
import { patientName } from "@/lib/workflow";

export function PatientSummaryHeader({ patient, course }: { patient: Patient; course: Course }) {
  return (
    <section className="glass-panel rounded-glass p-5">
      <p className="text-xs font-bold uppercase text-curerays-orange">Patient workspace</p>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-curerays-dark-plum">{patientName(patient)}</h1>
          <p className="mt-2 text-sm text-curerays-indigo">
            DOB {patient.dob ?? "Not entered"} · MRN {patient.mrn} · {patient.diagnosis}
          </p>
          <p className="mt-1 text-sm text-curerays-indigo">
            Current course: {course.courseNumber} · {course.treatmentSite} · Physician {patient.physician}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PhaseBadge phase={course.simpleDashboardPhase} />
          <StatusBadge status={patient.status} />
          {course.flagsIssues.length ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-curerays-orange/10 px-3 py-1 text-xs font-bold text-curerays-orange">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {course.flagsIssues.length} flag(s)
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
