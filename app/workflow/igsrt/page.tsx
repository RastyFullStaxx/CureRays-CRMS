import { Radiation } from "lucide-react";
import { IgsrtCrudWorkspace } from "@/components/igsrt-crud-workspace";
import { PageHeader } from "@/components/page-header";
import { getIgsrtWorkspace } from "@/lib/clinical-store";

export default function IgsrtWorkflowPage() {
  const workspace = getIgsrtWorkspace("COURSE-2401");

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Workflow automation"
        title="IGSRT Tools"
        description="Skin cancer workflow CRUD for simulation order, prescription, fraction log, generated documents, and audit state."
        icon={Radiation}
        stat="System source"
      />
      <IgsrtCrudWorkspace initialWorkspace={workspace} />
    </div>
  );
}
