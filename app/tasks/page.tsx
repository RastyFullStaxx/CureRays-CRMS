'use client';
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, ListChecks, PenLine, Plus } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, responsiblePartyName, statusLabel, statusTone } from "@/lib/global-page-data";

export default function TasksPage() {
  const tasks = moduleSnapshot.tasks;
  const signatures = tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
  const overdue = tasks.filter((task) => task.priority === "URGENT" || task.status === "OVERDUE" || task.status === "BLOCKED");
  const completed = tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));
  const review = tasks.filter((task) => task.status === "READY_FOR_REVIEW").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "PENDING").length;

  const mapTone = (t: string) => {
    if (t === "green" || t === "emerald") return "success";
    if (t === "orange") return "warning";
    if (t === "red") return "error";
    if (t === "purple") return "primary";
    if (t === "blue") return "info";
    return "default";
  };

  return (
    <PageStack>
      <PageHeader
        title="Tasks"
        subtitle="Track and manage clinical and administrative tasks"
        actions={
          <>
            <Button variant="secondary"><ClipboardCheck className="h-4 w-4" /> Export</Button>
            <Button><Plus className="h-4 w-4" /> Add Task</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={ClipboardCheck} label="To Do" value={tasks.length - completed.length - inProgress} sub="Open tasks" />
        <StatCard icon={CalendarDays} label="In Progress" value={inProgress} sub="Being worked" tone="warning" />
        <StatCard icon={ListChecks} label="Review" value={review} sub="Ready for check" tone="info" />
        <StatCard icon={PenLine} label="Pending Signature" value={signatures.length} sub="Provider queue" tone="primary" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed.length} sub="Closed work" tone="success" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdue.length} sub="Needs escalation" tone="error" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'task', label: 'Task', render: (row) => (
            <div className="min-w-0">
              <p className="truncate font-bold">{row.title}</p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">{row.description}</p>
            </div>
          )},
          { key: 'course', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)} / {row.courseId.replace("COURSE-", "C")}</span>
          )},
          { key: 'step', label: 'Step / Phase', render: (row) => {
            const step = moduleSnapshot.workflowSteps.find((item) => item.id === row.workflowStepId);
            return (
              <div>
                <p className="truncate">{step?.stepName ?? row.workflowStepId}</p>
                <Badge variant="info">{step ? phaseLabel(step.phase) : "Workflow"}</Badge>
              </div>
            );
          }},
          { key: 'type', label: 'Type', render: (row) => (
            <Badge variant="info">{statusLabel(row.type)}</Badge>
          )},
          { key: 'assigned', label: 'Assigned To', render: (row) => (
            <span className="block truncate">{row.assignedUserId ?? responsiblePartyName(row.assignedRole)}</span>
          )},
          { key: 'priority', label: 'Priority', render: (row) => (
            <Badge variant={row.priority === "URGENT" || row.priority === "HIGH" ? "error" : row.priority === "MEDIUM" ? "warning" : "success"}>{row.priority}</Badge>
          )},
          { key: 'dueDate', label: 'Due Date' },
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status)) as any}>{statusLabel(row.status)}</Badge>
          )},
        ]}
        rows={tasks.slice(0, 8).map((task) => ({
          ...task,
        }))}
        pageSize={8}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search tasks, patient, course, assignee, or linked record..." />
            </FilterField>
            <FilterField><Input placeholder="Assigned To" /></FilterField>
            <FilterField><Input placeholder="Priority" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
