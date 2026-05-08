import { NotebookTabs } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilePreviewCard } from "@/components/file-preview-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { clinicalFormTemplates } from "@/lib/module-data";

const joints = ["CMC", "MCP", "PIP", "DIP", "Radiocarpal", "Intercarpal"];

export default function ClinicalFormsPage() {
  const template = clinicalFormTemplates[0];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Structured clinical forms"
        title="Clinical Forms"
        description="Template-backed form engine for clinical mapping records. Initial scaffold: Hand Arthritis X-ray Mapping."
        icon={NotebookTabs}
        stat={`${clinicalFormTemplates.length} form`}
      />
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title={template.name} description="Patient context, DOS, laterality, grading, field decision, photos, and signature routing.">
          <DataTable
            columns={[{ header: "Section" }, { header: "Required Fields" }, { header: "Status" }]}
            rows={template.schema.map((section) => ({
              id: section.id,
              cells: [
                <span key="title" className="font-semibold">{section.title}</span>,
                section.fields.filter((field) => field.required).map((field) => field.label).join(", "),
                "Draft placeholder"
              ]
            }))}
          />
        </SectionCard>
        <SectionCard title="Joint Grading Table" description="Rows can be generated from the clinical form template schema.">
          <DataTable
            columns={[
              { header: "Joint" },
              { header: "Joint Space Narrowing" },
              { header: "Osteophytes" },
              { header: "Sclerosis" },
              { header: "Overall Grade" },
              { header: "Include / Exclude" }
            ]}
            rows={joints.map((joint) => ({
              id: joint,
              cells: [joint, "Dropdown", "Dropdown", "Dropdown", "0-4", "Field design decision"]
            }))}
          />
        </SectionCard>
      </section>
      <FilePreviewCard
        title="Generated Mapping Note"
        description="Structured fields will generate the mapping note, route it for signature, and store the generated document/version on the course."
      />
    </div>
  );
}
