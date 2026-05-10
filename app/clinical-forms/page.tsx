import { NotebookTabs, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilePreviewCard } from "@/components/file-preview-card";
import { SectionCard } from "@/components/section-card";
import { clinicalFormTemplates } from "@/lib/module-data";
import {
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { handJointRows, pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function ClinicalFormsPage() {
  const template = clinicalFormTemplates[0];

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Structured clinical forms"
        title="Clinical Forms"
        description="Template-backed form engine for clinical mapping records. Initial scaffold: Hand Arthritis X-ray Mapping."
        icon={NotebookTabs}
        stat={`${clinicalFormTemplates.length} form`}
        actions={<PrimaryAction><Plus className="mr-2 inline h-4 w-4" />Start Form</PrimaryAction>}
      />
      <SummaryCardGrid>
        {pageMetrics.forms.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.forms} />
      <WorkspaceGrid
        main={
          <>
            <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <SectionCard title="Forms Library" description="Template cards for structured clinical documentation.">
                <DataTable
                  compact
                  columns={[{ header: "Form" }, { header: "Diagnosis" }, { header: "Fields" }, { header: "Status" }]}
                  rows={clinicalFormTemplates.map((form) => ({
                    id: form.id,
                    cells: [form.name, form.diagnosisType, form.schema.flatMap((section) => section.fields).length, form.active ? "Active" : "Inactive"]
                  }))}
                />
              </SectionCard>
              <SectionCard title={template.name} description="Multi-section mapping form structure.">
                <DataTable
                  compact
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
            </section>
            <SectionCard title="Hand Arthritis Joint Grading Table" description="Rows grouped by digit for structured field design decisions.">
              <DataTable
                minWidth="1100px"
                compact
                columns={[
                  { header: "Zone" },
                  { header: "Joint Space Narrowing" },
                  { header: "Osteophytes" },
                  { header: "Sclerosis" },
                  { header: "Overall Grade" },
                  { header: "Include / Exclude" },
                  { header: "Photo / Comments" }
                ]}
                rows={handJointRows.map((joint) => ({
                  id: joint,
                  cells: [joint, "Dropdown", "Dropdown", "Dropdown", "0-4", "Include / Exclude", "Attach / Comment"]
                }))}
              />
            </SectionCard>
            <FilePreviewCard
              title="Generated Mapping Note"
              description="Structured fields generate the mapping note, route it for signature, and store the generated document/version on the course."
            />
          </>
        }
        rail={
          <DetailPanel title="Review Panel" subtitle="Sticky completion and generated note preview." actionLabel="Send for review">
            <FieldList
              items={[
                { label: "Completion", value: "72%" },
                { label: "Missing Fields", value: 4, tone: "warning" },
                { label: "Attachments", value: "2 / 3" },
                { label: "Signature", value: "Not sent" }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
