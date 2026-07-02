import { AlertTriangle } from "lucide-react";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import type { Course, Patient } from "@/lib/types";
import { patientName } from "@/lib/server/patient-phi-formatting";

export function PatientSummaryHeader({ patient, course }: { patient: Patient; course: Course }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-card)]">
      <p className="type-label text-[var(--color-text-muted)]">Patient Workspace</p>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="type-title text-[var(--color-text)]">{patientName(patient)}</h1>
          <p className="mt-2 type-body text-[var(--color-text-soft)]">
            DOB {patient.dob ?? "Not entered"} · MRN {patient.mrn} · {patient.diagnosis}
          </p>
          <p className="mt-1 type-body text-[var(--color-text-soft)]">
            Current course: {course.courseNumber} · {course.treatmentSite} · Physician {patient.physician}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PhaseBadge phase={course.simpleDashboardPhase} />
          <StatusBadge status={patient.status} />
          {course.flagsIssues.length ? (
            <span className="clinical-pill clinical-pill-intermediate gap-2 px-2.5 py-0.5 type-supporting">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              {course.flagsIssues.length} flag(s)
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
