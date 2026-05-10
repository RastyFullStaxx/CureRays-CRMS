import { BarChart3 } from "lucide-react";
import Link from "next/link";
import {
  ActionToolbar,
  AppPageShell,
  PageHero,
  SecondaryAction,
  SummaryCardGrid,
  SummaryMetricCard
} from "@/components/layout/page-layout";
import { OperationalSnapshot } from "@/components/operational-snapshot";
import { ReportsOverview } from "@/components/reports-overview";
import { carepathTasks, fractionLogEntries, generatedDocuments, operationalPatients } from "@/lib/clinical-store";
import { pageMetrics } from "@/lib/page-layout-data";

export default function ReportsPage() {
  const patients = operationalPatients();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Operational intelligence"
        title="Reports"
        description="Early reporting modules translate workflow state into clinical operations signals without exposing unnecessary patient detail."
        icon={BarChart3}
        stat="Preview"
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.analytics.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ActionToolbar
        searchPlaceholder="Search report, diagnosis, phase, staff workload, or audit signal"
        filters={["Date Range", "Location", "Physician", "Diagnosis", "Phase"]}
        actions={<SecondaryAction>Export Report</SecondaryAction>}
      />
      <ReportsOverview
        patients={patients}
        tasks={carepathTasks}
        documents={generatedDocuments}
        fractions={fractionLogEntries}
      />
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-5 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#061A55]">Need deeper patterns?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#3D5A80]">
              Reports show current state. Analytics explains bottlenecks, risks, and solution opportunities.
            </p>
          </div>
          <Link
            href="/analytics"
            className="w-fit rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)] transition hover:bg-[#00277A]"
          >
            Open Analytics
          </Link>
        </div>
      </section>
      <OperationalSnapshot
        patients={patients}
        tasks={carepathTasks}
        documents={generatedDocuments}
        fractions={fractionLogEntries}
      />
    </AppPageShell>
  );
}
