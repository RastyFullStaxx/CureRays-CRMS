import { CheckCircle2, CircleDashed, ClipboardCheck, Radiation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { FractionLogEntry } from '@/lib/types';
import { formatDate } from '@/lib/workflow';

function Approval({ approved, label }: { approved: boolean; label: string }) {
  return (
    <Badge variant={approved ? 'success' : 'warning'} className="gap-1">
      {approved ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label}
    </Badge>
  );
}

function SummaryTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="clinical-muted-surface p-3">
      <p className="clinical-label truncate">{label}</p>
      <p className="mt-1 truncate font-heading text-xl font-bold leading-none text-[var(--color-text)]">{value}</p>
      {detail ? <p className="mt-1 truncate text-xs font-semibold text-[var(--color-text-muted)]">{detail}</p> : null}
    </div>
  );
}

export function FractionLogTable({ entries }: { entries: FractionLogEntry[] }) {
  const approved = entries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const cumulativeDose = entries.at(-1)?.cumulativeDose ?? 0;
  const nextReview = entries.find((entry) => !entry.mdApproval || !entry.dotApproval);
  const phaseOne = entries.filter((entry) => entry.phase.toLowerCase().includes('phase i')).length;
  const phaseTwo = entries.length - phaseOne;
  const progress = entries.length ? Math.round((approved / entries.length) * 100) : 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--color-border-soft)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Radiation className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-heading text-lg font-bold text-[var(--color-text)]">Fractionation Record</h3>
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">Daily treatment, dose, depth, isodose, and approval tracking.</p>
              </div>
            </div>
          </div>
          <Badge variant={progress === 100 ? 'success' : 'warning'}>{progress}% approved</Badge>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryTile label="Approved Fractions" value={`${approved}/${entries.length}`} detail="MD + DOT complete" />
          <SummaryTile label="Cumulative Dose" value={`${cumulativeDose} cGy`} detail="Latest logged dose" />
          <SummaryTile label="Phase I" value={phaseOne} detail="Fractions logged" />
          <SummaryTile label="Phase II" value={phaseTwo} detail="Fractions logged" />
          <SummaryTile label="Next Review" value={nextReview ? `Fx ${nextReview.fractionNumber}` : 'Complete'} detail={nextReview ? formatDate(nextReview.date) : 'No open approvals'} />
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
          <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="scrollbar-soft overflow-x-auto">
        <table className="w-full min-w-[1220px] border-collapse">
          <thead>
            <tr className="bg-[var(--color-table-header-bg)] text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
              <th className="px-4 py-3" scope="col">Fx</th>
              <th className="px-4 py-3" scope="col">Date</th>
              <th className="px-4 py-3" scope="col">Phase</th>
              <th className="px-4 py-3" scope="col">Energy</th>
              <th className="px-4 py-3" scope="col">SSD / Applicator</th>
              <th className="px-4 py-3" scope="col">Dose</th>
              <th className="px-4 py-3" scope="col">Cumulative</th>
              <th className="px-4 py-3" scope="col">Depth</th>
              <th className="px-4 py-3" scope="col">Isodose</th>
              <th className="px-4 py-3" scope="col">Dose to Depth</th>
              <th className="px-4 py-3" scope="col">Approvals</th>
              <th className="px-4 py-3" scope="col">Review</th>
              <th className="px-4 py-3" scope="col">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-soft)]">
            {entries.map((entry) => (
              <tr key={entry.id} className="bg-[var(--color-card)] transition hover:bg-[var(--color-table-row-hover)]">
                <td className="px-4 py-3 font-bold text-[var(--color-primary)]">{entry.fractionNumber}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text)]">{formatDate(entry.date)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text)]">{entry.phase}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{entry.energy}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{entry.ssd}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text)]">{entry.dosePerFraction} cGy</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text)]">{entry.cumulativeDose} cGy</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{entry.depthOfTarget}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{entry.isodosePercent}%</td>
                <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  {entry.doseToDepth} / {entry.cumulativeDoseToDepth} cGy
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Approval approved={entry.mdApproval} label="MD" />
                    <Approval approved={entry.dotApproval} label="DOT" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={entry.mdApproval && entry.dotApproval ? 'success' : 'warning'}>
                    <ClipboardCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    {entry.mdApproval && entry.dotApproval ? 'Complete' : 'Review'}
                  </Badge>
                </td>
                <td className="max-w-[260px] px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  <span className="line-clamp-2">{entry.notes}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
