import { DataTable } from "@/components/data-table";
import type { AuditCheck } from "@/lib/types";

export function AuditChecklist({ checks }: { checks: AuditCheck[] }) {
  return (
    <DataTable
      columns={[
        { header: "Check" },
        { header: "Category" },
        { header: "Status" },
        { header: "Required" },
        { header: "Evidence" },
        { header: "Notes / N/A" }
      ]}
      rows={checks.map((check) => ({
        id: check.id,
        cells: [
          <span key="label" className="font-semibold">{check.label}</span>,
          check.category,
          <span key="status" className="font-semibold">{check.status.replaceAll("_", " ")}</span>,
          check.required ? "Required" : "Optional",
          check.evidenceDocumentId ?? "Pending",
          check.status === "NOT_APPLICABLE" ? check.naReason ?? "Reason required" : check.notes ?? "Tracked"
        ]
      }))}
    />
  );
}
