import { ClipboardCheck, Clock, FileWarning, UserRoundCheck } from "lucide-react";
import type { RoleQueueItem } from "@/lib/types";
import { responsiblePartyLabels } from "@/lib/workflow";
import { ResponsiblePartyBadge } from "@/components/badges";

export function ResponsiblePartyWorkQueue({ queues }: { queues: RoleQueueItem[] }) {
  const activeQueues = queues.filter(
    (queue) => queue.assignedTasks || queue.pendingDocuments || queue.reviewItems || queue.overdueActions
  );

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Responsible-party work queue</h3>
          <p className="mt-1 text-sm text-curerays-indigo">
            The system should tell each role what needs action next.
          </p>
        </div>
        <UserRoundCheck className="h-5 w-5 text-curerays-blue" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {activeQueues.map((queue) => (
          <article key={queue.responsibleParty} className="rounded-lg border border-white/70 bg-white/52 p-4">
            <ResponsiblePartyBadge party={queue.responsibleParty} />
            <p className="mt-3 text-sm font-semibold text-curerays-dark-plum">
              {responsiblePartyLabels[queue.responsibleParty]}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-curerays-indigo">
              <span className="rounded-lg bg-white/58 p-2">
                <ClipboardCheck className="mb-1 h-3.5 w-3.5" aria-hidden="true" />
                {queue.assignedTasks} tasks
              </span>
              <span className="rounded-lg bg-white/58 p-2">
                <FileWarning className="mb-1 h-3.5 w-3.5" aria-hidden="true" />
                {queue.pendingDocuments} docs
              </span>
              <span className="rounded-lg bg-white/58 p-2">{queue.reviewItems} reviews</span>
              <span className="rounded-lg bg-white/58 p-2">
                <Clock className="mb-1 h-3.5 w-3.5" aria-hidden="true" />
                {queue.overdueActions} overdue
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
