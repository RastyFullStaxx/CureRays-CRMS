import { WalletCards } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { billingItems } from "@/lib/module-data";

export default function BillingPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Documentation readiness"
        title="Billing / Coding"
        description="Track planned codes, quantities, related documentation, pre-auth status, billing completion, and audit readiness signals."
        icon={WalletCards}
        stat={`${billingItems.length} items`}
      />
      <SectionCard title="Billing Worklist" description="Billing status feeds audit readiness and closeout gating.">
        <DataTable
          minWidth="1120px"
          columns={[
            { header: "Code" },
            { header: "Description" },
            { header: "Planned" },
            { header: "Completed" },
            { header: "Billed" },
            { header: "Status" },
            { header: "Linked Document" },
            { header: "Notes" }
          ]}
          rows={billingItems.map((item) => ({
            id: item.id,
            cells: [
              <span key="code" className="font-semibold">{item.code}</span>,
              item.description,
              item.plannedQuantity,
              item.completedQuantity,
              item.billedQuantity,
              item.status.replaceAll("_", " "),
              item.linkedDocumentId ?? "Pending",
              item.notes ?? ""
            ]
          }))}
        />
      </SectionCard>
    </div>
  );
}
