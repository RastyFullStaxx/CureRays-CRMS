import { BarChart3, ClipboardCheck, FileCheck2, ShieldAlert } from "lucide-react";
import type { CarepathTask, FractionLogEntry, GeneratedDocument, OperationalPatient, Patient } from "@/lib/types";
import {
  auditReadinessScore,
  carepathProgress,
  countFlaggedPatients,
  documentStatusCounts,
  phaseCounts
} from "@/lib/workflow";

export function ReportsOverview({
  patients,
  tasks = [],
  documents = [],
  fractions = []
}: {
  patients: Array<Patient | OperationalPatient>;
  tasks?: CarepathTask[];
  documents?: GeneratedDocument[];
  fractions?: FractionLogEntry[];
}) {
  const phases = phaseCounts(patients);
  const docCounts = documentStatusCounts(documents);
  const reports = [
    {
      label: "Phase Flow",
      value: `${phases.ON_TREATMENT} active`,
      detail: "Tracks chart-rounds phase without moving patient records.",
      icon: BarChart3
    },
    {
      label: "Carepath Readiness",
      value: `${carepathProgress(tasks).percent}%`,
      detail: "Aggregates task completion and not-applicable workflow steps.",
      icon: ClipboardCheck
    },
    {
      label: "Document Risk",
      value: `${docCounts.PENDING_NEEDED + docCounts.NEEDS_REVIEW} items`,
      detail: "Shows documents that still need completion, review, or signature.",
      icon: ShieldAlert
    },
    {
      label: "Audit Readiness",
      value: `${auditReadinessScore(tasks, documents, fractions)}%`,
      detail: `${countFlaggedPatients(patients)} patient records currently carry operational flags.`,
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
          {["Daily census", "Carepath exceptions", "Audit export"].map((item) => (
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
