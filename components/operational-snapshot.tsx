import { ClipboardCheck, Layers3, ShieldCheck, TrendingUp } from "lucide-react";
import type { CarepathTask, FractionLogEntry, GeneratedDocument, OperationalPatient, Patient } from "@/lib/types";
import {
  auditReadinessScore,
  averageChecklistPercent,
  chartRoundsPhaseLabels,
  documentStatusCounts,
  phaseCounts,
  responsiblePartyQueue,
  statusCounts
} from "@/lib/workflow";

export function OperationalSnapshot({
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
  const statuses = statusCounts(patients);
  const checklist = averageChecklistPercent(patients);
  const audit = auditReadinessScore(tasks, documents, fractions);
  const docCounts = documentStatusCounts(documents);
  const queueLoad = responsiblePartyQueue(tasks, documents).reduce(
    (sum, queue) => sum + queue.assignedTasks + queue.pendingDocuments + queue.reviewItems,
    0
  );

  const phaseBars = [
    { label: chartRoundsPhaseLabels.UPCOMING, value: phases.UPCOMING, color: "bg-curerays-blue" },
    { label: chartRoundsPhaseLabels.ON_TREATMENT, value: phases.ON_TREATMENT, color: "bg-curerays-orange" },
    { label: chartRoundsPhaseLabels.POST, value: phases.POST, color: "bg-curerays-plum" }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel rounded-glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-curerays-dark-plum">Workflow Completion Overview</h3>
            <p className="mt-1 text-sm text-curerays-indigo">
              Carepath, documents, checklist, and audit readiness are tracked as one workflow.
            </p>
          </div>
          <ClipboardCheck className="h-5 w-5 text-curerays-blue" aria-hidden="true" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Audit Ready", value: audit, detail: "score" },
            { label: "Checklist", value: checklist, detail: "average" },
            { label: "Pending Docs", value: docCounts.PENDING_NEEDED + docCounts.NEEDS_REVIEW, detail: "need work" },
            { label: "Role Queue", value: queueLoad, detail: "open items" }
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-white/70 bg-white/50 p-4">
              <p className="text-sm font-semibold text-curerays-indigo">{item.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-3xl font-semibold text-curerays-dark-plum">
                  {item.label.includes("Docs") || item.label.includes("Queue") ? item.value : `${item.value}%`}
                </span>
                <span className="text-xs font-bold text-curerays-indigo">{item.detail}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-curerays-light-indigo/18">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-curerays-orange to-curerays-blue"
                  style={{
                    width: `${item.label.includes("Docs") || item.label.includes("Queue") ? Math.min(100, item.value * 12) : item.value}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-curerays-dark-plum">Operational Snapshot</h3>
            <p className="mt-1 text-sm text-curerays-indigo">State, access, and readiness signals.</p>
          </div>
          <TrendingUp className="h-5 w-5 text-curerays-orange" aria-hidden="true" />
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-white/70 bg-white/50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-curerays-dark-plum">
              <Layers3 className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
              Chart-rounds distribution
            </div>
            <div className="mt-4 space-y-3">
              {phaseBars.map((bar) => {
                const percent = patients.length ? Math.round((bar.value / patients.length) * 100) : 0;

                return (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs font-semibold text-curerays-indigo">
                      <span>{bar.label}</span>
                      <span>{bar.value}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-curerays-light-indigo/16">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(statuses).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/54 p-3 text-center">
                <p className="text-xl font-semibold text-curerays-dark-plum">{value}</p>
                <p className="mt-1 text-[11px] font-bold uppercase text-curerays-indigo">
                  {label.replaceAll("_", " ")}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-curerays-blue/10 bg-curerays-blue/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-curerays-blue" aria-hidden="true" />
            <p className="text-sm leading-5 text-curerays-dark-plum/76">
              Dashboard detail is intentionally operational. Backend RBAC will decide deeper document and
              patient-note visibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
