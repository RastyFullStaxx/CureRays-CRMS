import type { Checklist } from "@/lib/types";
import { checklistScore } from "@/lib/workflow";

export function ChecklistProgress({ checklist }: { checklist: Checklist }) {
  const score = checklistScore(checklist);

  return (
    <div className="min-w-36">
      <div className="flex items-center justify-between text-xs font-semibold text-curerays-indigo">
        <span>{score.completed}/3 complete</span>
        <span>{score.percent}%</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-curerays-light-indigo/18">
        <div
          className="h-full rounded-full bg-gradient-to-r from-curerays-orange via-curerays-amber to-curerays-blue"
          style={{ width: `${score.percent}%` }}
        />
      </div>
    </div>
  );
}
