import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { OperationalSnapshot } from "@/components/operational-snapshot";
import { PageHeader } from "@/components/page-header";
import { ReportsOverview } from "@/components/reports-overview";
import { carepathTasks, fractionLogEntries, generatedDocuments, operationalPatients } from "@/lib/clinical-store";

export default function ReportsPage() {
  const patients = operationalPatients();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Operational intelligence"
        title="Reports"
        description="Early reporting modules translate workflow state into clinical operations signals without exposing unnecessary patient detail."
        icon={BarChart3}
        stat="Preview"
      />
      <ReportsOverview
        patients={patients}
        tasks={carepathTasks}
        documents={generatedDocuments}
        fractions={fractionLogEntries}
      />
      <section className="glass-panel rounded-glass p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-curerays-dark-plum">Need deeper patterns?</h2>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              Reports show current state. Analytics explains bottlenecks, risks, and solution opportunities.
            </p>
          </div>
          <Link
            href="/analytics"
            className="w-fit rounded-lg bg-curerays-dark-plum px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-curerays-blue"
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
    </div>
  );
}
