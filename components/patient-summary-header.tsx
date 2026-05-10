import { AlertTriangle } from "lucide-react";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import type { Course, Patient } from "@/lib/types";
import { patientName } from "@/lib/workflow";

export function PatientSummaryHeader({ patient, course }: { patient: Patient; course: Course }) {
  return (
    <section className="rounded-2xl border border-[#D8E4F5] bg-white p-5 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <p className="text-xs font-bold uppercase tracking-wide text-[#FF6620]">Patient workspace</p>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#061A55]">{patientName(patient)}</h1>
          <p className="mt-2 text-sm font-semibold text-[#3D5A80]">
            DOB {patient.dob ?? "Not entered"} · MRN {patient.mrn} · {patient.diagnosis}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#3D5A80]">
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
