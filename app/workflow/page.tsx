import { ClipboardList } from "lucide-react";
import { CarepathTaskCard } from "@/components/carepath-task-card";
import { PageHeader } from "@/components/page-header";
import { carepathTasks } from "@/lib/mock-data";
import { carepathPhaseLabels } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";

const phases: CarepathWorkflowPhase[] = ["CONSULTATION", "CHART_PREP", "PLANNING", "ON_TREATMENT", "POST_TX"];

export default function WorkflowPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Diagnosis workflow engine"
        title="Carepath Workflow"
        description="Carepath tasks are modeled as diagnosis-aware workflow steps, not spreadsheet rows."
        icon={ClipboardList}
        stat="Preview"
      />
      {phases.map((phase) => {
        const tasks = carepathTasks.filter((task) => task.workflowPhase === phase);

        return (
          <section key={phase} className="space-y-3">
            <h2 className="text-sm font-bold uppercase text-curerays-indigo">{carepathPhaseLabels[phase]}</h2>
            {tasks.length ? (
              tasks.map((task) => <CarepathTaskCard key={task.id} task={task} />)
            ) : (
              <div className="glass-panel rounded-glass p-5 text-sm font-semibold text-curerays-indigo">
                No active mock tasks in this phase.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
