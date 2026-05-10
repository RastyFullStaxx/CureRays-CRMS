import { Download, ListChecks, Plus } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { TaskList } from "@/components/task-list";
import { carepathTasks, generatedDocuments } from "@/lib/clinical-store";
import { getTasks } from "@/lib/module-data";
import { responsiblePartyQueue } from "@/lib/workflow";
import { ResponsiblePartyWorkQueue } from "@/components/responsible-party-work-queue";
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
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function TasksPage() {
  const tasks = getTasks();
  const signatures = tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
  const overdue = tasks.filter((task) => task.priority === "URGENT" || task.status === "OVERDUE");
  const completed = tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Role-based work"
        title="Tasks"
        description="Work queues for role-based execution: document launches, forms, images, plan review, signatures, daily treatment, physics checks, follow-up, and audit."
        icon={ListChecks}
        stat={`${tasks.length} tasks`}
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.tasks.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.tasks} />
      <ActionToolbar
        searchPlaceholder="Search task, patient, MRN, assignee, workflow step, or due date"
        filters={["Priority", "Status", "Role", "Assignee", "Due Date", "Linked Record"]}
        actions={
          <>
            <SecondaryAction><Download className="mr-2 inline h-4 w-4" />Export</SecondaryAction>
            <PrimaryAction><Plus className="mr-2 inline h-4 w-4" />New Task</PrimaryAction>
          </>
        }
      />
      <WorkspaceGrid
        main={
          <>
            <ResponsiblePartyWorkQueue queues={responsiblePartyQueue(carepathTasks, generatedDocuments)} />
            <SectionCard title="Team Tasks" description="All role-owned work across active courses.">
              <TaskList tasks={tasks} />
            </SectionCard>
            <section className="grid gap-4 xl:grid-cols-3">
              <SectionCard title="Unassigned" description="Tasks without a named assignee.">
                <TaskList tasks={tasks.filter((task) => !task.assignedUserId)} />
              </SectionCard>
              <SectionCard title="Signatures Needed" description="Documents or steps ready for clinical signature.">
                <TaskList tasks={signatures.length ? signatures : tasks.slice(0, 2)} />
              </SectionCard>
              <SectionCard title="Completed" description="Recently completed or signed tasks.">
                <TaskList tasks={completed} />
              </SectionCard>
            </section>
          </>
        }
        rail={
          <DetailPanel title="Selected Task" subtitle="Drawer-ready task detail panel." actionLabel="Open patient workspace">
            <FieldList
              items={[
                { label: "Task", value: tasks[0]?.title ?? "Task" },
                { label: "Priority", value: tasks[0]?.priority ?? "High", tone: "warning" },
                { label: "Assignee", value: tasks[0]?.assignedUserId ?? "Unassigned" },
                { label: "Linked Step", value: tasks[0]?.workflowStepId ?? "Pending" },
                { label: "Status", value: tasks[0]?.status.replaceAll("_", " ") ?? "Open" }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
