import { ActivityTrendCard } from "@/components/dashboard/activity-trend-card";
import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";
import { PatientPipelineCard } from "@/components/dashboard/patient-pipeline-card";
import { PhaseDistributionCard } from "@/components/dashboard/phase-distribution-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { TaskSummaryCard } from "@/components/dashboard/task-summary-card";
import { TodayScheduleCard } from "@/components/dashboard/today-schedule-card";
import { TreatmentProgressCard } from "@/components/dashboard/treatment-progress-card";
import { UrgentAttentionCard } from "@/components/dashboard/urgent-attention-card";
import { dashboardKpis } from "@/lib/dashboard-data";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12">
      <section className="grid gap-4 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <DashboardKpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <PatientPipelineCard />
      <UrgentAttentionCard />
      <ActivityTrendCard />
      <PhaseDistributionCard />
      <TodayScheduleCard />
      <RecentActivityCard />
      <TreatmentProgressCard />
      <TaskSummaryCard />
    </div>
  );
}
