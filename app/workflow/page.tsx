import { ClipboardList, Plus, Settings } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { WorkflowStepTable } from "@/components/workflow-step-table";
import { canonicalWorkflowSteps, getWorkflowSteps } from "@/lib/module-data";
import {
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
import { carepathPhaseLabels, orderedCarepathPhases } from "@/lib/workflow";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function WorkflowPage() {
  const steps = getWorkflowSteps();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Carepath engine"
        title="Workflow"
        description="Carepath rows 0-14 are modeled as structured workflow steps with status, role ownership, triggers, signatures, linked documents, blockers, and audit checklist state."
        icon={ClipboardList}
        stat="15 steps"
        actions={
          <>
            <SecondaryAction><Settings className="mr-2 inline h-4 w-4" />Configure Template</SecondaryAction>
            <PrimaryAction><Plus className="mr-2 inline h-4 w-4" />Create Workflow</PrimaryAction>
          </>
        }
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.workflow.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.workflow} />
      <WorkspaceGrid
        main={
          <>
            <section className="grid gap-4 xl:grid-cols-3">
              {orderedCarepathPhases.slice(1, 7).map((phase) => (
                <SectionCard key={phase} title={carepathPhaseLabels[phase]} description="Phase board lane">
                  <div className="space-y-3">
                    {steps.filter((step) => step.phase === phase).slice(0, 3).map((step) => (
                      <div key={step.id} className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-3">
                        <p className="text-sm font-bold text-[#061A55]">{step.stepName}</p>
                        <p className="mt-1 text-xs font-semibold text-[#3D5A80]">Owner: {step.responsibleRole} · {step.status.replaceAll("_", " ")}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </section>
            <SectionCard title="Workflow Table" description="Course-specific preview using current mock state. N/A rows require a reason before save.">
              <WorkflowStepTable steps={steps} />
            </SectionCard>
            <SectionCard title="Canonical Template" description="Reference Carepath template copied when a course is created.">
              <WorkflowStepTable steps={canonicalWorkflowSteps} />
            </SectionCard>
          </>
        }
        rail={
          <DetailPanel title="Step Detail" subtitle="Drawer-ready workflow step controls." actionLabel="Generate document">
            <FieldList
              items={[
                { label: "Step", value: "Simulation Order" },
                { label: "Status", value: "Ready for Review" },
                { label: "Responsible", value: "RAD ONC" },
                { label: "Signature", value: "Required", tone: "warning" },
                { label: "Actions", value: "Reassign / N/A / Block" }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
