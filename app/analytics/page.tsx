import { AlertTriangle, BarChart3, FileWarning, Route, ShieldCheck } from "lucide-react";
import { AnalyticsMetricCard } from "@/components/analytics-metric-card";
import { DiagnosisMixPanel } from "@/components/diagnosis-mix-panel";
import { InsightCard } from "@/components/insight-card";
import { InsightPriorityMatrix } from "@/components/insight-priority-matrix";
import { OpportunityBacklog } from "@/components/opportunity-backlog";
import { PageHeader } from "@/components/page-header";
import { WorkflowBottleneckPanel } from "@/components/workflow-bottleneck-panel";
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  patients,
  treatmentCourses
} from "@/lib/mock-data";
import {
  auditBlockers,
  auditReadinessScore,
  courseAttentionSignals,
  documentStatusCounts,
  generateAnalyticsInsights,
  overdueTaskCount,
  workflowBottlenecksByParty
} from "@/lib/workflow";

export default function AnalyticsPage() {
  const blockers = auditBlockers(carepathTasks, generatedDocuments, fractionLogEntries);
  const documentCounts = documentStatusCounts(generatedDocuments);
  const bottlenecks = workflowBottlenecksByParty(carepathTasks, generatedDocuments);
  const insights = generateAnalyticsInsights({
    patients,
    courses: treatmentCourses,
    tasks: carepathTasks,
    documents: generatedDocuments,
    fractions: fractionLogEntries
  });
  const coursesNeedingAttention = courseAttentionSignals(treatmentCourses);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Strategic analytics"
        title="Analytics"
        description="Insight layer for bottlenecks, audit blockers, role load, diagnosis patterns, and future solution opportunities."
        icon={BarChart3}
        stat={`${insights.length} insights`}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AnalyticsMetricCard
          label="Audit Readiness"
          value={`${auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries)}%`}
          detail="Composite task, document, and fraction readiness."
          icon={ShieldCheck}
        />
        <AnalyticsMetricCard
          label="Open Blockers"
          value={blockers.total}
          detail="Tasks, documents, and fraction entries reducing readiness."
          icon={AlertTriangle}
        />
        <AnalyticsMetricCard
          label="Document Risk"
          value={documentCounts.PENDING_NEEDED + documentCounts.NEEDS_REVIEW}
          detail="Pending or review-needed generated documents."
          icon={FileWarning}
        />
        <AnalyticsMetricCard
          label="Overdue Tasks"
          value={overdueTaskCount(carepathTasks)}
          detail="Responsible-party tasks past due in the mock workflow."
          icon={Route}
        />
        <AnalyticsMetricCard
          label="Courses To Watch"
          value={coursesNeedingAttention.length}
          detail="Courses not started or currently on hold."
          icon={BarChart3}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <WorkflowBottleneckPanel tasks={carepathTasks} documents={generatedDocuments} />
        <DiagnosisMixPanel patients={patients} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <InsightPriorityMatrix insights={insights} />
        <div className="space-y-4">
          {insights.slice(0, 3).map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {insights.slice(3).map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </section>

      <OpportunityBacklog insights={insights} />

      <section className="glass-panel rounded-glass p-5">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">Analytics stance</h3>
        <p className="mt-2 text-sm leading-6 text-curerays-indigo">
          These insights are operational and strategic, not clinical decision support. The prototype
          uses anonymized mock data and is prepared for later API-backed analytics.
        </p>
        {bottlenecks[0] ? (
          <p className="mt-4 text-sm font-semibold text-curerays-dark-plum">
            Highest current pressure: {bottlenecks[0].unresolved} unresolved items in one role queue.
          </p>
        ) : null}
      </section>
    </div>
  );
}
