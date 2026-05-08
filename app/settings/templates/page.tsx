import { Files } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { documentRequirements, templateSources, workflowDefinitions } from "@/lib/clinical-store";

export default function TemplatesSettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Template administration"
        title="Templates"
        description="Workflow, document, and clinical form template configuration by diagnosis, protocol, required fields, due dates, and responsible roles."
        icon={Files}
        stat={`${templateSources.length} sources`}
      />
      <SectionCard title="Workflow Templates" description="Diagnosis/protocol workflow definitions determine course step creation.">
        <DataTable
          columns={[{ header: "Workflow" }, { header: "Diagnosis" }, { header: "Protocol" }, { header: "Status" }]}
          rows={workflowDefinitions.map((workflow) => ({
            id: workflow.id,
            cells: [workflow.name, workflow.diagnosis, workflow.protocol, workflow.status.replaceAll("_", " ")]
          }))}
        />
      </SectionCard>
      <SectionCard title="Document Requirements" description="Document requirements create tasks and generated document placeholders.">
        <DataTable
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
    </div>
  );
}
