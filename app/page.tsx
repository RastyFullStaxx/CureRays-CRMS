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
    <div className="space-y-5">
      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <DashboardKpiCard key={kpi.label} kpi={kpi} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)_minmax(340px,1.1fr)]">
        <PatientPipelineCard />
        <UrgentAttentionCard />
        <TodayScheduleCard />
        <ActivityTrendCard />
        <PhaseDistributionCard />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)_minmax(420px,1.4fr)]">
        <RecentActivityCard />
        <TaskSummaryCard />
        <TreatmentProgressCard />
      </section>
    </div>
  );
}
