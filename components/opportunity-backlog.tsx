import { Lightbulb } from "lucide-react";
import type { AnalyticsInsight } from "@/lib/types";

export function OpportunityBacklog({ insights }: { insights: AnalyticsInsight[] }) {
  const opportunities = Array.from(new Set(insights.map((insight) => insight.solutionOpportunity)));

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Solution opportunity backlog</h3>
          <p className="mt-1 text-sm text-curerays-indigo">Ideas emerging from workflow patterns.</p>
        </div>
        <Lightbulb className="h-5 w-5 text-curerays-orange" aria-hidden="true" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {opportunities.map((opportunity, index) => (
          <article key={opportunity} className="rounded-lg border border-white/70 bg-white/52 p-4">
            <p className="text-xs font-bold text-curerays-orange">Opportunity {index + 1}</p>
            <h4 className="mt-2 text-base font-semibold text-curerays-dark-plum">{opportunity}</h4>
            <p className="mt-2 text-sm leading-5 text-curerays-indigo">
              Candidate module for future backend rules, automation, or productized workflow support.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
