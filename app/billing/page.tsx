import { WalletCards } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SecondaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { billingItems } from "@/lib/module-data";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function BillingPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Documentation readiness"
        title="Billing / Coding"
        description="Track planned codes, quantities, related documentation, pre-auth status, billing completion, and audit readiness signals."
        icon={WalletCards}
        stat={`${billingItems.length} items`}
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.billing.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.billing} />
      <ActionToolbar
        searchPlaceholder="Search code, patient ID, course, document, or billing note"
        filters={["Code", "Documentation", "Preauth", "Billing Status", "Audit Issues"]}
        actions={
          <>
            <SecondaryAction>Export Billing Report</SecondaryAction>
            <PrimaryAction>Add Billing Item</PrimaryAction>
          </>
        }
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Billing Worklist" description="Billing status feeds audit readiness and closeout gating.">
              <DataTable
                compact
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
            <SectionCard title="Course Billing Grouping" description="Readiness will group evidence by consultation, mapping, simulation, treatment, and follow-up.">
              <div className="grid gap-3 md:grid-cols-3">
                {["Consultation", "Simulation", "Treatment", "Follow-up", "Audit"].map((phase) => (
                  <div key={phase} className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-4">
                    <p className="text-sm font-bold text-[#061A55]">{phase}</p>
                    <p className="mt-2 text-xs font-semibold text-[#3D5A80]">Evidence and quantity tracking placeholder.</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Readiness Detail" subtitle="Selected code/document evidence" actionLabel="Open billing item">
              <FieldList
                items={[
                  { label: "Patient", value: "Patient #P-10456" },
                  { label: "Code", value: billingItems[0]?.code ?? "CPT" },
                  { label: "Evidence", value: billingItems[0]?.linkedDocumentId ?? "Pending", tone: "warning" },
                  { label: "Billing", value: billingItems[0]?.status.replaceAll("_", " ") ?? "Pending" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Codes Master Preview" description="Admin-maintained coding references and year mappings.">
              <DataTable
                compact
                columns={[{ header: "Code" }, { header: "Frequency" }, { header: "Status" }]}
                rows={billingItems.slice(0, 4).map((item) => ({
                  id: `master-${item.id}`,
                  cells: [item.code, `${item.plannedQuantity} planned`, "Active"]
                }))}
              />
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
