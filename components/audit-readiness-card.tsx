import { AlertCircle, CheckCircle2, FileWarning, ShieldCheck } from "lucide-react";
import type { CarepathTask, FractionLogEntry, GeneratedDocument } from "@/lib/types";
import { auditReadinessScore, documentStatusCounts, overdueTaskCount } from "@/lib/workflow";
import { ProgressBar } from "@/components/progress-bar";

export function AuditReadinessCard({
  tasks,
  documents,
  fractions
}: {
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
  fractions: FractionLogEntry[];
}) {
  const score = auditReadinessScore(tasks, documents, fractions);
  const docCounts = documentStatusCounts(documents);
  const missingApprovals = fractions.filter((entry) => !entry.mdApproval || !entry.dotApproval).length;
  const overdue = overdueTaskCount(tasks);

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-curerays-indigo">Audit readiness</p>
          <p className="mt-2 text-4xl font-semibold text-curerays-dark-plum">{score}%</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-curerays-blue/10 text-curerays-blue">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5">
        <ProgressBar value={score} label="Readiness score" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-white/54 p-3">
          <FileWarning className="h-4 w-4 text-curerays-orange" aria-hidden="true" />
          <p className="mt-2 text-xl font-semibold text-curerays-dark-plum">{docCounts.PENDING_NEEDED}</p>
          <p className="text-xs font-semibold text-curerays-indigo">Pending docs</p>
        </div>
        <div className="rounded-lg bg-white/54 p-3">
          <AlertCircle className="h-4 w-4 text-curerays-plum" aria-hidden="true" />
          <p className="mt-2 text-xl font-semibold text-curerays-dark-plum">{overdue}</p>
          <p className="text-xs font-semibold text-curerays-indigo">Overdue tasks</p>
        </div>
        <div className="rounded-lg bg-white/54 p-3">
          <CheckCircle2 className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
          <p className="mt-2 text-xl font-semibold text-curerays-dark-plum">{missingApprovals}</p>
          <p className="text-xs font-semibold text-curerays-indigo">Log approvals</p>
        </div>
      </div>
    </section>
  );
}
