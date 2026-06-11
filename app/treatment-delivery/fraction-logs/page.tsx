import { AlertTriangle, CheckCircle2, ClipboardCheck, FileSpreadsheet } from "lucide-react";
import { FractionLogRegistryTable } from "@/components/treatment-delivery/fraction-log-registry-table";
import { TreatmentDeliveryTabs } from "@/components/treatment-delivery/treatment-delivery-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { PageStack } from "@/components/shared/page-stack";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { getFractionLogRegistryRows } from "@/lib/services/fraction-log-registry-service";

export default function TreatmentDeliveryFractionLogsPage() {
  const rows = getFractionLogRegistryRows();
  const reviewNeeded = rows.filter((row) => row.review !== "Clear").length;
  const approved = rows.filter((row) => row.status === "APPROVED").length;
  const documentReady = rows.filter((row) => row.document === "READY_FOR_REVIEW" || row.document === "SIGNED" || row.document === "EXPORTED").length;

  return (
    <PageStack>
      <PageHeader title="Fraction Logs" actions={<TreatmentDeliveryTabs active="fraction-logs" />} />

      <StatGrid>
        <StatCard icon={FileSpreadsheet} label="Active Rows" value={rows.length} tone="primary" />
        <StatCard icon={AlertTriangle} label="Review" value={reviewNeeded} tone={reviewNeeded > 0 ? "warning" : "success"} />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} tone="success" />
        <StatCard icon={ClipboardCheck} label="Documents" value={documentReady} tone="info" />
      </StatGrid>

      <FractionLogRegistryTable rows={rows} />
    </PageStack>
  );
}
