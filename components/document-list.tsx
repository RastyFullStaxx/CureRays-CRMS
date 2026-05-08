import { DataTable } from "@/components/data-table";
import type { DocumentInstance } from "@/lib/types";

export function DocumentList({ documents }: { documents: DocumentInstance[] }) {
  return (
    <DataTable
      minWidth="1180px"
      columns={[
        { header: "Document" },
        { header: "Category" },
        { header: "Status" },
        { header: "Version" },
        { header: "Storage" },
        { header: "Signature" },
        { header: "eCW" },
        { header: "N/A Reason" }
      ]}
      rows={documents.map((document) => ({
        id: document.id,
        cells: [
          <span key="title" className="font-semibold">{document.title}</span>,
          document.category,
          <span key="status" className="font-semibold">{document.status.replaceAll("_", " ")}</span>,
          `v${document.version}`,
          document.storageProvider,
          document.signedAt ? "Signed" : "Pending",
          document.uploadedToEcwAt ? "Uploaded" : "Not uploaded",
          document.status === "NOT_APPLICABLE" ? document.naReason ?? "Required before save" : "Applies"
        ]
      }))}
    />
  );
}
