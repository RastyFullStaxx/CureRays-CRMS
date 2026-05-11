import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, Clock3, Download, PenLine, UsersRound } from "lucide-react";
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
import { Badge, DonutChart, FilterBar, ListItem, MetricGrid, MetricTile, MiniBars, ModuleActions, ModulePage, RightRailCard, SecondaryButton, WorkGrid } from "@/components/module-ui";

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
  const onTreatment = patients.filter((patient) => patient.chartRoundsPhase === "ON_TREATMENT").length;
  const auditReady = auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries);

  return (
    <ModulePage>
      <ModuleActions><SecondaryButton><Download className="h-4 w-4" />Export Report</SecondaryButton></ModuleActions>
      <FilterBar search="Filter by date range, location, physician, diagnosis, or phase..." filters={["Date Range", "Location", "Physician", "Diagnosis", "Phase"]} />
      <MetricGrid columns={6}>
        <MetricTile label="Active Courses" value={treatmentCourses.length} detail="All locations" icon={UsersRound} />
        <MetricTile label="On Treatment" value={onTreatment} detail="Active courses" icon={CalendarDays} tone="green" />
        <MetricTile label="Pending Signatures" value={generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length} detail="Documents" icon={PenLine} tone="orange" />
        <MetricTile label="Overdue Tasks" value={overdueTaskCount(carepathTasks)} detail="Role queues" icon={Clock3} tone="red" />
        <MetricTile label="Audit Ready" value={`${auditReady}%`} detail="Closeout" icon={CheckCircle2} tone="green" />
        <MetricTile label="Billing Ready" value={14} detail="Courses" icon={BarChart3} />
      </MetricGrid>
      <WorkGrid
        main={
          <>
            <section className="grid gap-4 xl:grid-cols-2">
              <RightRailCard title="Patient/Course Volume Trend">
                <div className="flex h-52 items-end gap-3 px-3 pb-4">
                  {[62, 78, 84, 93, 82, 88, 79].map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t bg-[#0033A0]" style={{ height: `${value}%` }} />
                      <span className="text-[10px] font-bold text-[#3D5A80]">W{index + 1}</span>
                    </div>
                  ))}
                </div>
              </RightRailCard>
              <RightRailCard title="Phase Distribution">
                <DonutChart total={patients.length} label="patients" segments={[
                  { label: "Upcoming", value: patients.filter((patient) => patient.chartRoundsPhase === "UPCOMING").length, color: "#2563EB" },
                  { label: "On Treatment", value: onTreatment, color: "#059669" },
                  { label: "Post", value: patients.filter((patient) => patient.chartRoundsPhase === "POST").length, color: "#8B5CF6" }
                ]} />
              </RightRailCard>
            </section>
            <section className="grid gap-4 xl:grid-cols-3">
              <RightRailCard title="Workflow Funnel">
                <MiniBars rows={[{ label: "Consult", value: 238 }, { label: "Chart Prep", value: 212 }, { label: "Simulation", value: 176 }, { label: "Planning", value: 128 }, { label: "Treatment", value: 52 }, { label: "Audit", value: 18 }]} />
              </RightRailCard>
              <RightRailCard title="Overdue Tasks by Role">
                <MiniBars rows={bottlenecks.slice(0, 6).map((item) => ({ label: item.responsibleParty, value: item.overdueActions + item.reviewItems, color: "#FF6620" }))} />
              </RightRailCard>
              <RightRailCard title="Documentation Readiness">
                <DonutChart total={generatedDocuments.length} label="docs" segments={[
                  { label: "Ready", value: documentCounts.SIGNED + documentCounts.UPLOADED + documentCounts.COMPLETED, color: "#059669" },
                  { label: "Review", value: documentCounts.READY_FOR_REVIEW + documentCounts.NEEDS_REVIEW, color: "#2563EB" },
                  { label: "Missing", value: documentCounts.MISSING_FIELDS + documentCounts.PENDING_NEEDED, color: "#FF6620" }
                ]} />
              </RightRailCard>
            </section>
          </>
        }
        rail={
          <>
            <RightRailCard title="Key Insights">
              <div className="space-y-2">
                {insights.slice(0, 5).map((insight) => <ListItem key={insight.id} title={insight.title} meta={insight.evidence} badge={<Badge tone={insight.severity === "HIGH" ? "red" : insight.severity === "MEDIUM" ? "orange" : "blue"}>{insight.severity}</Badge>} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Export Options">
              <div className="space-y-2"><ListItem title="Workflow snapshot" meta="CSV / PDF" /><ListItem title="Audit readiness" meta="PDF packet" /><ListItem title="Documentation report" meta="CSV export" /></div>
            </RightRailCard>
            <RightRailCard title="Operational Alerts">
              <div className="space-y-2"><ListItem title="Open blockers" meta={`${blockers.total} active blockers`} badge={<Badge tone="red">Alert</Badge>} icon={<AlertTriangle className="h-4 w-4" />} /><ListItem title="Courses to watch" meta={`${coursesNeedingAttention.length} attention signals`} /></div>
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
