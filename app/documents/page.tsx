import { FileText } from "lucide-react";
import { BillingCodePanel } from "@/components/billing-code-panel";
import { DocumentLifecycleTable } from "@/components/document-lifecycle-table";
import { PageHeader } from "@/components/page-header";
import { billingCodes, generatedDocuments } from "@/lib/clinical-store";

export default function DocumentsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Document lifecycle"
        title="Documents"
        description="Generated patient documents, template applicability, signature state, review state, and audit readiness."
        icon={FileText}
        stat={`${generatedDocuments.length} docs`}
      />
      <DocumentLifecycleTable documents={generatedDocuments} />
      <BillingCodePanel codes={billingCodes} />
    </div>
  );
}
