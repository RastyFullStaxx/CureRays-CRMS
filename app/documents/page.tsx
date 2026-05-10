import { FileText } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { DocumentList } from "@/components/document-list";
import { FilePreviewCard } from "@/components/file-preview-card";
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
import { getDocumentInstances, templateSources } from "@/lib/module-data";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function DocumentsPage() {
  const documents = getDocumentInstances();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Document generator"
        title="Documents"
        description="Template library, generated patient/course documents, version history, preview/open actions, signature status, export, and eCW upload placeholders."
        icon={FileText}
        stat={`${documents.length} docs`}
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.documents.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.documents} />
      <ActionToolbar
        searchPlaceholder="Search document, patient ID, MRN, course, category, or signer"
        filters={["Category", "Status", "Signature", "eCW Upload", "Generated Date"]}
        actions={
          <>
            <SecondaryAction>Upload External</SecondaryAction>
            <PrimaryAction>Generate Document</PrimaryAction>
          </>
        }
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Generated Patient/Course Documents" description="The app database is source of truth; files are generated and synced outputs.">
              <DocumentList documents={documents} />
            </SectionCard>
            <SectionCard title="Template Library" description="Master templates stay read-only except for admins and remain configurable through the registry.">
              <DataTable
                compact
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
          </>
        }
        rail={
          <>
            <FilePreviewCard
              title="Preview / Version Placeholder"
              description="DOCX, Google Doc, Sheet, PDF, and PPTX previews will load here after Drive and document generation integrations are configured."
            />
            <DetailPanel title="Document Detail" subtitle="Version, signature, export, and eCW state" actionLabel="Open document drawer">
              <FieldList
                items={[
                  { label: "Selected", value: documents[0]?.title ?? "Carepath packet" },
                  { label: "Version", value: documents[0]?.version ?? "v1" },
                  { label: "Signature", value: documents[0]?.signedAt ? "Signed" : "Pending" },
                  { label: "eCW Upload", value: documents[0]?.uploadedToEcwAt ? "Uploaded" : "Pending" }
                ]}
              />
            </DetailPanel>
          </>
        }
      />
    </AppPageShell>
  );
}
