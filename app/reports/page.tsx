import { BarChart3 } from "lucide-react";
import { OperationalSnapshot } from "@/components/operational-snapshot";
import { PageHeader } from "@/components/page-header";
import { ReportsOverview } from "@/components/reports-overview";
import { patients } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Operational intelligence"
        title="Reports"
        description="Early reporting modules translate workflow state into clinical operations signals without exposing unnecessary patient detail."
        icon={BarChart3}
        stat="Preview"
      />
      <ReportsOverview patients={patients} />
      <OperationalSnapshot patients={patients} />
    </div>
  );
}
