import { AlertCircle, Lightbulb, ShieldCheck } from "lucide-react";
import type { AnalyticsInsight } from "@/lib/types";

const severityStyles: Record<AnalyticsInsight["severity"], string> = {
  HIGH: "bg-curerays-orange text-white",
  MEDIUM: "bg-curerays-amber/70 text-curerays-dark-plum",
  LOW: "bg-curerays-blue/10 text-curerays-blue"
};

const categoryLabels: Record<AnalyticsInsight["category"], string> = {
  WORKFLOW_BOTTLENECK: "Workflow Bottleneck",
  DOCUMENT_LIFECYCLE: "Document Lifecycle",
  AUDIT_RISK: "Audit Risk",
  ROLE_CAPACITY: "Role Capacity",
  DIAGNOSIS_PATTERN: "Diagnosis Pattern",
  AUTOMATION_OPPORTUNITY: "Automation Opportunity"
};

export function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  return (
    <article className="glass-panel rounded-glass p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-curerays-indigo">
            {categoryLabels[insight.category]}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-6 text-curerays-dark-plum">
            {insight.title}
          </h3>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${severityStyles[insight.severity]}`}>
          {insight.severity}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-curerays-dark-plum/76">{insight.summary}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-white/54 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-indigo">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Evidence
          </p>
          <p className="mt-2 text-sm leading-5 text-curerays-dark-plum/76">{insight.evidence}</p>
        </div>
        <div className="rounded-lg bg-white/54 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-indigo">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Recommendation
          </p>
          <p className="mt-2 text-sm leading-5 text-curerays-dark-plum/76">{insight.recommendation}</p>
        </div>
        <div className="rounded-lg bg-curerays-blue/5 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-blue">
            <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
            Solution Opportunity
          </p>
          <p className="mt-2 text-sm font-semibold leading-5 text-curerays-dark-plum">
            {insight.solutionOpportunity}
          </p>
        </div>
      </div>
    </article>
  );
}
