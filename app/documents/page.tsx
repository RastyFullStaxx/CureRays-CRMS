import { FileText } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { DocumentList } from "@/components/document-list";
import { FilePreviewCard } from "@/components/file-preview-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { getDocumentInstances, templateSources } from "@/lib/module-data";

export default function DocumentsPage() {
  const documents = getDocumentInstances();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Document generator"
        title="Documents"
        description="Template library, generated patient/course documents, version history, preview/open actions, signature status, export, and eCW upload placeholders."
        icon={FileText}
        stat={`${documents.length} docs`}
      />
      <SectionCard title="Template Library" description="Master templates stay read-only except for admins and remain configurable through the registry.">
        <DataTable
          minWidth="1100px"
          columns={[
            { header: "Template" },
            { header: "Source File" },
            { header: "Type" },
            { header: "Status" },
            { header: "Notes" }
          ]}
          rows={templateSources.map((template) => ({
            id: template.id,
            cells: [
              <span key="name" className="font-semibold">{template.name}</span>,
              template.sourceFileName,
              template.mimeType,
              template.status.replaceAll("_", " "),
              template.notes ?? "Mapped through template registry"
            ]
          }))}
        />
      </SectionCard>
      <SectionCard title="Generated Patient/Course Documents" description="The app database is source of truth; files are generated/synced outputs.">
        <DocumentList documents={documents} />
      </SectionCard>
      <FilePreviewCard
        title="Preview / Version Placeholder"
        description="DOCX, Google Doc, Sheet, PDF, and PPTX previews will load here after Drive and document generation integrations are configured."
      />
    </div>
  );
}
