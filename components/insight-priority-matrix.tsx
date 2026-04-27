import type { AnalyticsInsight } from "@/lib/types";

const severityOrder: Record<AnalyticsInsight["severity"], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2
};

export function InsightPriorityMatrix({ insights }: { insights: AnalyticsInsight[] }) {
  const sorted = [...insights].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Insight priority matrix</h3>
          <p className="mt-1 text-sm text-curerays-indigo">What deserves attention first.</p>
        </div>
        <span className="rounded-full bg-white/58 px-3 py-2 text-xs font-bold text-curerays-indigo">
          {insights.length} insights
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {sorted.slice(0, 5).map((insight, index) => (
          <div key={insight.id} className="grid gap-3 rounded-lg bg-white/52 p-3 md:grid-cols-[44px_120px_1fr] md:items-center">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-curerays-dark-plum text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="text-xs font-bold text-curerays-orange">{insight.severity}</span>
            <div>
              <p className="text-sm font-semibold text-curerays-dark-plum">{insight.title}</p>
              <p className="mt-1 text-xs text-curerays-indigo">{insight.solutionOpportunity}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
