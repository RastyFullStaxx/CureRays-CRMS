import { ClipboardCheck, Layers3, ShieldCheck, TrendingUp } from "lucide-react";
import type { Patient } from "@/lib/types";
import { averageChecklistPercent, phaseCounts, statusCounts } from "@/lib/workflow";

export function OperationalSnapshot({ patients }: { patients: Patient[] }) {
  const phases = phaseCounts(patients);
  const statuses = statusCounts(patients);
  const checklist = averageChecklistPercent(patients);

  const phaseBars = [
    { label: "Upcoming", value: phases.Upcoming, color: "bg-curerays-blue" },
    { label: "On Treatment", value: phases["On Treatment"], color: "bg-curerays-orange" },
    { label: "Post", value: phases.Post, color: "bg-curerays-plum" }
  ];

  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="glass-panel rounded-glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-curerays-dark-plum">Checklist Progress Overview</h3>
            <p className="mt-1 text-sm text-curerays-indigo">
              Completion is tracked by patient state, not by spreadsheet position.
            </p>
          </div>
          <ClipboardCheck className="h-5 w-5 text-curerays-blue" aria-hidden="true" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "TX Summary", value: patients.filter((p) => p.checklist.txSummaryComplete).length },
            { label: "Follow-Up", value: patients.filter((p) => p.checklist.followUpScheduled).length },
            { label: "Billing", value: patients.filter((p) => p.checklist.billingComplete).length }
          ].map((item) => {
            const percent = Math.round((item.value / patients.length) * 100);

            return (
              <div key={item.label} className="rounded-lg border border-white/70 bg-white/50 p-4">
                <p className="text-sm font-semibold text-curerays-indigo">{item.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="text-3xl font-semibold text-curerays-dark-plum">{percent}%</span>
                  <span className="text-xs font-bold text-curerays-indigo">
                    {item.value}/{patients.length}
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-curerays-light-indigo/18">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-curerays-orange to-curerays-blue"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
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
              Phase distribution
            </div>
            <div className="mt-4 space-y-3">
              {phaseBars.map((bar) => {
                const percent = Math.round((bar.value / patients.length) * 100);

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
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-curerays-blue/10 bg-curerays-blue/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-curerays-blue" aria-hidden="true" />
            <p className="text-sm leading-5 text-curerays-dark-plum/76">
              Average checklist readiness is <span className="font-semibold">{checklist}%</span>. Role-aware
              access cues stay visible before deeper patient details.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
