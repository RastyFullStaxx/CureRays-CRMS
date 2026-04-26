import { CheckCircle2, CircleDashed } from "lucide-react";
import type { FractionLogEntry } from "@/lib/types";
import { formatDate } from "@/lib/workflow";

function Approval({ approved, label }: { approved: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-1 text-xs font-bold text-curerays-indigo">
      {approved ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
      ) : (
        <CircleDashed className="h-3.5 w-3.5 text-curerays-orange" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

export function FractionLogTable({ entries }: { entries: FractionLogEntry[] }) {
  return (
    <section className="glass-panel overflow-hidden rounded-glass">
      <div className="border-b border-white/70 px-5 py-4">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">Fraction log</h3>
        <p className="mt-1 text-sm text-curerays-indigo">
          Structured treatment logging placeholder prepared for later calculated fields.
        </p>
      </div>

      <div className="scrollbar-soft overflow-x-auto">
        <table className="min-w-[1180px] w-full border-collapse">
          <thead>
            <tr className="bg-white/42 text-left text-xs font-bold uppercase text-curerays-indigo">
              <th className="px-5 py-3" scope="col">Fx</th>
              <th className="px-5 py-3" scope="col">Date</th>
              <th className="px-5 py-3" scope="col">Phase</th>
              <th className="px-5 py-3" scope="col">Energy</th>
              <th className="px-5 py-3" scope="col">SSD</th>
              <th className="px-5 py-3" scope="col">Dose</th>
              <th className="px-5 py-3" scope="col">Cumulative</th>
              <th className="px-5 py-3" scope="col">Depth</th>
              <th className="px-5 py-3" scope="col">Isodose</th>
              <th className="px-5 py-3" scope="col">Dose to Depth</th>
              <th className="px-5 py-3" scope="col">Approvals</th>
              <th className="px-5 py-3" scope="col">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/70">
            {entries.map((entry) => (
              <tr key={entry.id} className="bg-white/28">
                <td className="px-5 py-4 font-semibold text-curerays-dark-plum">{entry.fractionNumber}</td>
                <td className="px-5 py-4 text-sm font-semibold text-curerays-indigo">{formatDate(entry.date)}</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.phase}</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.energy}</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.ssd}</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.dosePerFraction} cGy</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.cumulativeDose} cGy</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.depthOfTarget}</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">{entry.isodosePercent}%</td>
                <td className="px-5 py-4 text-sm text-curerays-dark-plum/76">
                  {entry.doseToDepth} / {entry.cumulativeDoseToDepth} cGy
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    <Approval approved={entry.mdApproval} label="MD" />
                    <Approval approved={entry.dotApproval} label="DOT" />
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-curerays-indigo">{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
