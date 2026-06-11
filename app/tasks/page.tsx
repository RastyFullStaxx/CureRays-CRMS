export const dynamic = 'force-dynamic';

import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, ListChecks, PenLine, Plus } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { moduleSnapshot, patientLabel, phaseLabel, responsiblePartyName, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { mapTone } from "@/lib/status-utils";

export default function TasksPage() {
  const tasks = moduleSnapshot.tasks;
  const signatures = tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
  const overdue = tasks.filter((task) => task.priority === "URGENT" || task.status === "OVERDUE" || task.status === "BLOCKED");
  const completed = tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));
  const review = tasks.filter((task) => task.status === "READY_FOR_REVIEW").length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "PENDING").length;

  return (
    <PageStack>
      <PageHeader
        title="Tasks"
        subtitle="Track and manage clinical and administrative tasks"
        actions={
          <>
            <Button variant="secondary" disabled title="Prototype placeholder"><ClipboardCheck className="h-4 w-4" /> Export</Button>
            <Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> Add Task</Button>
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
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
        ]}
        rows={tasks.slice(0, 8)}
        empty="No tasks are available."
        emptyDescription="Open work queues will appear after workflow tasks are generated."
        pageSize={8}
        search={{
          placeholder: 'Search tasks, patient, course, assignee, or linked record...',
          getText: (row) => [
            row.title,
            row.description,
            patientLabel(row.patientId),
            row.courseId,
            row.workflowStepId,
            responsiblePartyName(row.assignedRole),
            row.assignedUserId,
            row.priority,
            statusLabel(row.status),
          ].join(' '),
        }}
        filters={[
          { id: 'assigned', label: 'Assigned To', getValue: (row) => row.assignedUserId ?? responsiblePartyName(row.assignedRole) },
          { id: 'priority', label: 'Priority' },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
          { id: 'type', label: 'Type', getValue: (row) => statusLabel(row.type) },
        ]}
      />
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Upcoming Due (Next 7 Days)</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {tasks.slice(0, 6).map((task, index) => (
            <div key={task.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
              <p className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>May {6 + index}</p>
              <p className="mt-2 truncate text-xs font-bold" style={{ color: 'var(--color-text)' }}>{task.title}</p>
              <p className="truncate text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{patientLabel(task.patientId)}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageStack>
  );
}
