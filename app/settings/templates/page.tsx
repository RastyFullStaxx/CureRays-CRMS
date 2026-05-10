import { Files } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  ActionToolbar,
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
import { SectionCard } from "@/components/section-card";
import { documentRequirements, templateSources, workflowDefinitions } from "@/lib/clinical-store";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function TemplatesSettingsPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Template administration"
        title="Templates"
        description="Workflow, document, and clinical form template configuration by diagnosis, protocol, required fields, due dates, and responsible roles."
        icon={Files}
        stat={`${templateSources.length} sources`}
      />
      <SummaryCardGrid>
        {pageMetrics.settings.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.settings} active={5} />
      <ActionToolbar
        searchPlaceholder="Search template, diagnosis, protocol, role, or source file"
        filters={["Diagnosis", "Category", "File Type", "Active", "Signature Required"]}
        actions={<PrimaryAction>Replace Template</PrimaryAction>}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Workflow Templates" description="Diagnosis/protocol workflow definitions determine course step creation.">
              <DataTable
                compact
                columns={[{ header: "Workflow" }, { header: "Diagnosis" }, { header: "Protocol" }, { header: "Status" }]}
                rows={workflowDefinitions.map((workflow) => ({
                  id: workflow.id,
                  cells: [workflow.name, workflow.diagnosis, workflow.protocol, workflow.status.replaceAll("_", " ")]
                }))}
              />
            </SectionCard>
            <SectionCard title="Document Requirements" description="Document requirements create tasks and generated document placeholders.">
              <DataTable
                compact
                minWidth="1100px"
                columns={[{ header: "Requirement" }, { header: "Phase" }, { header: "Role" }, { header: "Template" }, { header: "Action" }]}
                rows={documentRequirements.map((requirement) => ({
                  id: requirement.id,
                  cells: [
                    <span key="name" className="font-semibold">{requirement.name}</span>,
                    requirement.workflowPhase.replaceAll("_", " "),
                    requirement.responsibleParty,
                    requirement.templateSourceId ?? "Unmapped",
                    requirement.requiredAction
                  ]
                }))}
              />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Template Detail" subtitle="Registry-backed source mapping" actionLabel="Open template settings">
              <FieldList
                items={[
                  { label: "Source", value: templateSources[0]?.name ?? "Template" },
                  { label: "File Type", value: templateSources[0]?.mimeType ?? "DOCX" },
                  { label: "Status", value: templateSources[0]?.status.replaceAll("_", " ") ?? "Active" },
                  { label: "Drive Sync", value: "Pending", tone: "warning" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Template Sources" description="Configurable references; no credentials are hardcoded.">
              <DataTable
                compact
                columns={[{ header: "Template" }, { header: "Type" }, { header: "Status" }]}
                rows={templateSources.slice(0, 5).map((template) => ({
                  id: template.id,
                  cells: [template.name, template.mimeType, template.status.replaceAll("_", " ")]
                }))}
              />
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
