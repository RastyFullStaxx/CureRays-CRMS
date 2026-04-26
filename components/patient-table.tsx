import { AlertTriangle, ArrowRight, LockKeyhole } from "lucide-react";
import type { Patient } from "@/lib/types";
import { formatDate, formatLastUpdated } from "@/lib/workflow";
import { ChecklistProgress } from "@/components/checklist-progress";
import { PhaseBadge, StatusBadge } from "@/components/badges";

type PatientTableProps = {
  patients: Patient[];
  title?: string;
  description?: string;
};

export function PatientTable({ patients, title = "Patient workflow", description }: PatientTableProps) {
  return (
    <section className="glass-panel overflow-hidden rounded-glass">
      <div className="flex flex-col gap-2 border-b border-white/70 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">{title}</h3>
          {description ? <p className="mt-1 text-sm text-curerays-indigo">{description}</p> : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs font-semibold text-curerays-indigo">
          <LockKeyhole className="h-3.5 w-3.5 text-curerays-plum" aria-hidden="true" />
          PHI-minimized list view
        </span>
      </div>

      <div className="scrollbar-soft overflow-x-auto">
        <table className="min-w-[1060px] w-full border-collapse">
          <thead>
            <tr className="bg-white/42 text-left text-xs font-bold uppercase text-curerays-indigo">
              <th scope="col" className="px-5 py-3">Patient</th>
              <th scope="col" className="px-5 py-3">Diagnosis</th>
              <th scope="col" className="px-5 py-3">Phase</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Assigned</th>
              <th scope="col" className="px-5 py-3">Next Action</th>
              <th scope="col" className="px-5 py-3">Checklist</th>
              <th scope="col" className="px-5 py-3">Flags</th>
              <th scope="col" className="px-5 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/70">
            {patients.map((patient) => (
              <tr key={patient.id} className="bg-white/28 transition hover:bg-white/58">
                <td className="px-5 py-4 align-top">
                  <p className="font-semibold text-curerays-dark-plum">{patient.name}</p>
                  <p className="mt-1 text-xs font-semibold text-curerays-indigo">
                    {patient.id} - {patient.location}
                  </p>
                </td>
                <td className="px-5 py-4 align-top">
                  <p className="max-w-44 text-sm font-medium leading-5 text-curerays-dark-plum/78">
                    {patient.diagnosis}
                  </p>
                  <p className="mt-1 text-xs text-curerays-indigo">{patient.md}</p>
                </td>
                <td className="px-5 py-4 align-top">
                  <PhaseBadge phase={patient.phase} />
                  <p className="mt-2 text-xs text-curerays-indigo">Start {formatDate(patient.startDate)}</p>
                </td>
                <td className="px-5 py-4 align-top">
                  <StatusBadge status={patient.status} />
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-curerays-dark-plum/76">
                  {patient.assignedStaff}
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex max-w-56 items-start gap-2 text-sm font-medium leading-5 text-curerays-dark-plum/82">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-curerays-orange" aria-hidden="true" />
                    <span>{patient.nextAction}</span>
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <ChecklistProgress checklist={patient.checklist} />
                </td>
                <td className="px-5 py-4 align-top">
                  {patient.flags.length > 0 ? (
                    <span className="inline-flex max-w-40 items-center gap-2 rounded-full bg-curerays-orange/10 px-3 py-1 text-xs font-bold text-curerays-orange ring-1 ring-curerays-orange/15">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{patient.flags[0]}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-curerays-indigo/58">No active flags</span>
                  )}
                </td>
                <td className="px-5 py-4 align-top text-xs font-semibold text-curerays-indigo">
                  {formatLastUpdated(patient.lastUpdated)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
