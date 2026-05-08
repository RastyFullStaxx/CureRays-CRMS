import { CheckCircle2, FileText } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { ResponsiblePartyBadge } from "@/components/badges";
import type { WorkflowStep } from "@/lib/types";
import { carepathPhaseLabels } from "@/lib/workflow";

function statusPill(status: WorkflowStep["status"]) {
  const tone = ["COMPLETED", "SIGNED", "UPLOADED", "CLOSED"].includes(status)
    ? "bg-emerald-500/10 text-emerald-700"
    : ["BLOCKED", "OVERDUE"].includes(status)
      ? "bg-rose-500/10 text-rose-700"
      : "bg-curerays-blue/10 text-curerays-blue";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{status.replaceAll("_", " ")}</span>;
}

export function WorkflowStepTable({ steps }: { steps: WorkflowStep[] }) {
  return (
    <DataTable
      minWidth="1380px"
      columns={[
        { header: "Step" },
        { header: "Phase" },
        { header: "Document / Action" },
        { header: "Status" },
        { header: "Role" },
        { header: "Due / Trigger" },
        { header: "Signature" },
        { header: "Linked Doc" },
        { header: "Audit / Blockers" }
      ]}
      rows={steps.map((step) => ({
        id: step.id,
        cells: [
          <span key="number" className="font-semibold">{step.stepNumber}</span>,
          carepathPhaseLabels[step.phase],
          <span key="name" className="font-semibold">{step.stepName}</span>,
          statusPill(step.status),
          <ResponsiblePartyBadge key="role" party={step.responsibleRole} />,
          <div key="trigger" className="max-w-64">
            <p className="font-semibold">{step.dueDate ?? "No due date"}</p>
            <p className="mt-1 text-xs text-curerays-indigo">{step.triggerEvent}</p>
          </div>,
          <span key="signature" className="inline-flex items-center gap-2 text-sm font-semibold text-curerays-indigo">
            <CheckCircle2 className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
            {step.requiresSignature ? step.signedAt ? "Signed" : "Required" : "Not required"}
          </span>,
          <span key="document" className="inline-flex items-center gap-2 text-sm font-semibold text-curerays-indigo">
            <FileText className="h-4 w-4 text-curerays-plum" aria-hidden="true" />
            {step.linkedDocumentId ?? "Pending"}
          </span>,
          <div key="audit" className="max-w-72 text-xs leading-5 text-curerays-indigo">
            <p>{step.auditChecklist.join(", ")}</p>
            {step.blockers.length ? <p className="mt-1 font-semibold text-rose-700">{step.blockers.join(", ")}</p> : null}
            {step.status === "NOT_APPLICABLE" ? <p className="mt-1 font-semibold">N/A reason: {step.naReason ?? "Required before save"}</p> : null}
          </div>
        ]
      }))}
    />
  );
}
