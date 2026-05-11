import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, Download, ListChecks, PenLine, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, DonutChart, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, TabBar, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, phaseLabel, responsiblePartyName, statusLabel, statusTone } from "@/lib/global-page-data";

export default function TasksPage() {
  const tasks = moduleSnapshot.tasks;
  const signatures = tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
  const overdue = tasks.filter((task) => task.priority === "URGENT" || task.status === "OVERDUE" || task.status === "BLOCKED");
  const completed = tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));
  const review = tasks.filter((task) => task.status === "READY_FOR_REVIEW").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "PENDING").length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Download className="h-4 w-4" />Export</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />Add Task</PrimaryButton>
      </ModuleActions>
      <FilterBar search="Search tasks, patient, course, assignee, or linked record..." filters={["Assigned To", "Priority", "Status", "Task Type", "Due"]} />
      <MetricGrid columns={6}>
        <MetricTile label="To Do" value={tasks.length - completed.length - inProgress} detail="Open tasks" icon={ClipboardCheck} />
        <MetricTile label="In Progress" value={inProgress} detail="Being worked" icon={CalendarDays} tone="orange" />
        <MetricTile label="Review" value={review} detail="Ready for check" icon={ListChecks} />
        <MetricTile label="Pending Signature" value={signatures.length} detail="Provider queue" icon={PenLine} tone="purple" />
        <MetricTile label="Completed" value={completed.length} detail="Closed work" icon={CheckCircle2} tone="green" />
        <MetricTile label="Overdue" value={overdue.length} detail="Needs escalation" icon={AlertTriangle} tone="red" />
      </MetricGrid>
      <TabBar tabs={["My Tasks", "Team Tasks", "Unassigned", "Signatures", "Overdue", "Completed"]} />
      <WorkGrid
        main={
          <>
            <DataTable
              compact
              minWidth="1040px"
              columns={[
                { header: "Task" },
                { header: "Patient / Course" },
                { header: "Step / Phase" },
                { header: "Type" },
                { header: "Assigned To" },
                { header: "Priority" },
                { header: "Due Date" },
                { header: "Status" },
                { header: "Actions" }
              ]}
              footer={<Pagination label={`Showing 1 to ${Math.min(8, tasks.length)} of ${tasks.length} tasks`} />}
              rows={tasks.slice(0, 8).map((task) => {
                const step = moduleSnapshot.workflowSteps.find((item) => item.id === task.workflowStepId);
                return {
                  id: task.id,
                  cells: [
                    <div key="task" className="min-w-0"><p className="truncate font-bold">{task.title}</p><p className="truncate text-[11px] text-[#3D5A80]">{task.description}</p></div>,
                    <span key="course" className="block truncate">{patientLabel(task.patientId)} / {task.courseId.replace("COURSE-", "C")}</span>,
                    <div key="step"><p className="truncate">{step?.stepName ?? task.workflowStepId}</p><Badge tone="blue">{step ? phaseLabel(step.phase) : "Workflow"}</Badge></div>,
                    <Badge key="type" tone="blue">{statusLabel(task.type)}</Badge>,
                    <span key="assigned" className="block truncate">{task.assignedUserId ?? responsiblePartyName(task.assignedRole)}</span>,
                    <Badge key="priority" tone={task.priority === "URGENT" || task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "orange" : "green"}>{task.priority}</Badge>,
                    task.dueDate ?? "Ongoing",
                    <Badge key="status" tone={statusTone(task.status)}>{statusLabel(task.status)}</Badge>,
                    <RowActions key="actions" />
                  ]
                };
              })}
            />
            <div className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.05)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#061A55]">Upcoming Due (Next 7 Days)</h2>
                <button className="text-xs font-bold text-[#0033A0]" type="button">View Calendar</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {tasks.slice(0, 6).map((task, index) => (
                  <div key={task.id} className="rounded-lg border border-[#E7EEF8] bg-[#F8FBFF] p-3">
                    <p className="text-[11px] font-bold text-[#0033A0]">May {6 + index}</p>
                    <p className="mt-2 line-clamp-2 text-xs font-bold text-[#061A55]">{task.title}</p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-[#3D5A80]">{patientLabel(task.patientId)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        }
        rail={
          <>
            <RightRailCard title="My Tasks" action={<button className="text-xs font-bold text-[#0033A0]">View All</button>}>
              <div className="space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <ListItem key={task.id} title={task.title} meta={task.dueDate ? `Due ${task.dueDate}` : "No due date"} badge={<Badge tone={task.priority === "HIGH" || task.priority === "URGENT" ? "red" : "orange"}>{task.priority}</Badge>} />
                ))}
              </div>
            </RightRailCard>
            <RightRailCard title="Tasks by Priority">
              <DonutChart total={tasks.length} label="total" segments={[
                { label: "High", value: tasks.filter((task) => task.priority === "HIGH" || task.priority === "URGENT").length, color: "#F43F5E" },
                { label: "Medium", value: tasks.filter((task) => task.priority === "MEDIUM").length, color: "#F59E0B" },
                { label: "Low", value: tasks.filter((task) => task.priority === "LOW").length, color: "#10B981" }
              ]} />
            </RightRailCard>
            <RightRailCard title="Overdue Tasks">
              <div className="space-y-2">
                {(overdue.length ? overdue : tasks.slice(0, 3)).slice(0, 3).map((task) => (
                  <ListItem key={task.id} title={task.title} meta={`${patientLabel(task.patientId)} - ${task.courseId.replace("COURSE-", "C")}`} badge={<Badge tone="red">Due</Badge>} />
                ))}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Create Task", icon: <Plus className="h-4 w-4" /> }, { label: "Assign Unowned", icon: <ListChecks className="h-4 w-4" /> }, { label: "Route Signatures", icon: <PenLine className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
