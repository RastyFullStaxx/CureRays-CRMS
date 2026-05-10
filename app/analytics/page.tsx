import { BarChart3 } from "lucide-react";
import { DiagnosisMixPanel } from "@/components/diagnosis-mix-panel";
import { InsightCard } from "@/components/insight-card";
import { InsightPriorityMatrix } from "@/components/insight-priority-matrix";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  SecondaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { OpportunityBacklog } from "@/components/opportunity-backlog";
import { SectionCard } from "@/components/section-card";
import { WorkflowBottleneckPanel } from "@/components/workflow-bottleneck-panel";
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/clinical-store";
import {
  auditBlockers,
  auditReadinessScore,
  courseAttentionSignals,
  documentStatusCounts,
  generateAnalyticsInsights,
  overdueTaskCount,
  workflowBottlenecksByParty
} from "@/lib/workflow";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function AnalyticsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
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
    <AppPageShell>
      <PageHero
        eyebrow="Strategic analytics"
        title="Analytics"
        description="Insight layer for bottlenecks, audit blockers, role load, diagnosis patterns, and future solution opportunities."
        icon={BarChart3}
        stat={`${insights.length} insights`}
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.analytics.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.analytics} />
      <ActionToolbar
        searchPlaceholder="Filter reports by date, location, physician, diagnosis, or phase"
        filters={["Date Range", "Location", "Physician", "Diagnosis", "Phase"]}
        actions={<SecondaryAction>Export Report</SecondaryAction>}
      />
      <WorkspaceGrid
        main={
          <>
            <section className="grid gap-4 xl:grid-cols-2">
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
            <OpportunityBacklog insights={insights} />
          </>
        }
        rail={
          <>
            <DetailPanel title="Report Drilldown" subtitle="Operational readiness metrics" actionLabel="Open report detail">
              <FieldList
                items={[
                  { label: "Audit Readiness", value: `${auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries)}%` },
                  { label: "Open Blockers", value: blockers.total, tone: blockers.total ? "warning" : "default" },
                  { label: "Document Risk", value: documentCounts.PENDING_NEEDED + documentCounts.MISSING_FIELDS + documentCounts.NEEDS_REVIEW },
                  { label: "Overdue Tasks", value: overdueTaskCount(carepathTasks), tone: overdueTaskCount(carepathTasks) ? "warning" : "default" },
                  { label: "Courses To Watch", value: coursesNeedingAttention.length }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Analytics Stance" description="Operational reporting, not clinical decision support.">
              <p className="text-sm font-semibold leading-6 text-[#3D5A80]">
                The workspace reads from the API-oriented clinical store and is ready for persistent backend analytics.
              </p>
              {bottlenecks[0] ? (
                <p className="mt-4 text-sm font-bold text-[#061A55]">
                  Highest pressure: {bottlenecks[0].unresolved} unresolved items in one role queue.
                </p>
              ) : null}
            </SectionCard>
            <section className="space-y-4">
              {insights.slice(3, 5).map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </section>
          </>
        }
      />
    </AppPageShell>
  );
}
