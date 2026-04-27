import type { GeneratedDocument, CarepathTask } from "@/lib/types";
import { responsiblePartyLabels, workflowBottlenecksByParty } from "@/lib/workflow";
import { ProgressBar } from "@/components/progress-bar";

export function WorkflowBottleneckPanel({
  tasks,
  documents
}: {
  tasks: CarepathTask[];
  documents: GeneratedDocument[];
}) {
  const bottlenecks = workflowBottlenecksByParty(tasks, documents);
  const max = Math.max(...bottlenecks.map((item) => item.unresolved), 1);

  return (
    <section className="glass-panel rounded-glass p-5">
      <h3 className="text-lg font-semibold text-curerays-dark-plum">Workflow bottlenecks</h3>
      <p className="mt-1 text-sm text-curerays-indigo">Unresolved work by responsible party.</p>
      <div className="mt-5 space-y-4">
        {bottlenecks.slice(0, 6).map((item) => (
          <div key={item.responsibleParty} className="rounded-lg bg-white/52 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-curerays-dark-plum">
                {responsiblePartyLabels[item.responsibleParty]}
              </p>
              <span className="text-xs font-bold text-curerays-indigo">{item.unresolved} open</span>
            </div>
            <ProgressBar value={Math.round((item.unresolved / max) * 100)} />
            <p className="mt-2 text-xs text-curerays-indigo">
              {item.reviewItems} reviews - {item.pendingDocuments} docs - {item.overdueActions} overdue
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
