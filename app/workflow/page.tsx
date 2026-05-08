import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { WorkflowStepTable } from "@/components/workflow-step-table";
import { canonicalWorkflowSteps, getWorkflowSteps } from "@/lib/module-data";

export default function WorkflowPage() {
  const steps = getWorkflowSteps();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Carepath engine"
        title="Course Workflow"
        description="Carepath rows 0-14 are modeled as structured workflow steps with status, role ownership, triggers, signatures, linked documents, blockers, and audit checklist state."
        icon={ClipboardList}
        stat="15 steps"
      />
      <SectionCard
        title="Canonical Carepath Template"
        description="This template is selected on course creation based on diagnosis/protocol and then copied into course-specific steps."
      >
        <WorkflowStepTable steps={canonicalWorkflowSteps} />
      </SectionCard>
      <SectionCard
        title="Active Course Workflow"
        description="Course-specific preview using current mock state. N/A rows require a reason before save."
      >
        <WorkflowStepTable steps={steps} />
      </SectionCard>
    </div>
  );
}
