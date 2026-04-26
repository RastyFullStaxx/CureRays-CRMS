import { BarChart3, ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";
import type { Patient } from "@/lib/types";
import { averageChecklistPercent, countFlaggedPatients, phaseCounts } from "@/lib/workflow";

export function ReportsOverview({ patients }: { patients: Patient[] }) {
  const phases = phaseCounts(patients);
  const reports = [
    {
      label: "Phase Flow",
      value: `${phases["On Treatment"]} active`,
      detail: "Tracks how many patients are in each workflow state.",
      icon: BarChart3
    },
    {
      label: "Checklist Readiness",
      value: `${averageChecklistPercent(patients)}%`,
      detail: "Aggregates TX summary, follow-up, and billing completion.",
      icon: ClipboardCheck
    },
    {
      label: "Flag Burden",
      value: `${countFlaggedPatients(patients)} records`,
      detail: "Shows records with open operational issues.",
      icon: ShieldAlert
    },
    {
      label: "Post Closure",
      value: `${phases.Post} patients`,
      detail: "Keeps post-treatment closure visible after treatment ends.",
      icon: FileCheck2
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {reports.map((report) => {
        const Icon = report.icon;

        return (
          <article key={report.label} className="glass-panel rounded-glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-curerays-indigo">{report.label}</p>
                <p className="mt-3 text-3xl font-semibold text-curerays-dark-plum">{report.value}</p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-white/70 to-curerays-light-indigo/22 text-curerays-blue">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-curerays-dark-plum/72">{report.detail}</p>
          </article>
        );
      })}

      <article className="glass-panel rounded-glass p-5 md:col-span-2">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">Report roadmap</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Daily census", "Checklist exceptions", "Audit export"].map((item) => (
            <div key={item} className="rounded-lg border border-white/70 bg-white/52 p-4">
              <p className="text-sm font-semibold text-curerays-dark-plum">{item}</p>
              <p className="mt-2 text-xs leading-5 text-curerays-indigo">
                API-backed report module planned after source document analysis.
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
