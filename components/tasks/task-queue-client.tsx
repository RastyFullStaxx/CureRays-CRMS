'use client';

import { useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, ClipboardCheck, ListChecks, PenLine, RefreshCcw, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { phaseTone, statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';
import type {
  CarepathTaskStatus,
  OperationalTask,
  WorkflowQueueName,
  WorkflowQueueSnapshot,
} from '@/lib/types';

type TaskQueueClientProps = {
  snapshot: WorkflowQueueSnapshot;
};

type TaskForm = {
  status: CarepathTaskStatus;
  assignedUser: string;
  dueDate: string;
  blockedReason: string;
  naReason: string;
  reopenReason: string;
  changeReason: string;
};

const queueLabels: Record<WorkflowQueueName, string> = {
  ALL: 'All Tasks',
  MY_TASKS: 'My Tasks',
  TEAM_TASKS: 'Role Queue',
  UNASSIGNED: 'Unassigned',
  SIGNATURES: 'Signatures',
  OVERDUE: 'Overdue',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
};

const queueOptions = Object.keys(queueLabels) as WorkflowQueueName[];

const taskStatuses: CarepathTaskStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'IN_PROGRESS',
  'NEEDS_REVIEW',
  'READY_FOR_REVIEW',
  'SIGNED',
  'UPLOADED',
  'COMPLETED',
  'BLOCKED',
  'OVERDUE',
  'CLOSED',
  'NOT_APPLICABLE',
];

function formFromTask(task: OperationalTask): TaskForm {
  return {
    status: task.status,
    assignedUser: task.assignedUser,
    dueDate: task.dueDate ?? '',
    blockedReason: task.blockedReason ?? '',
    naReason: task.naReason ?? '',
    reopenReason: '',
    changeReason: 'Phase 3 task queue command update.',
  };
}

export function TaskQueueClient({ snapshot: initialSnapshot }: TaskQueueClientProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [queue, setQueue] = useState<WorkflowQueueName>(initialSnapshot.queue);
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null);
  const [form, setForm] = useState<TaskForm | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  const metrics = useMemo(() => ({
    all: snapshot.counts.ALL,
    mine: snapshot.counts.MY_TASKS,
    signatures: snapshot.counts.SIGNATURES,
    overdue: snapshot.counts.OVERDUE,
    blocked: snapshot.counts.BLOCKED,
    completed: snapshot.counts.COMPLETED,
  }), [snapshot]);

  const updateForm = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const closeModal = () => {
    if (pending) return;
    setSelectedTask(null);
    setForm(null);
  };

  const openTask = (task: OperationalTask) => {
    setSelectedTask(task);
    setForm(formFromTask(task));
    setError(null);
    setBlockers([]);
  };

  const loadQueue = async (nextQueue: WorkflowQueueName) => {
    setPending(true);
    setError(null);
    setMessage(null);
    setBlockers([]);

    try {
      const response = await fetch(`/api/tasks?queue=${nextQueue}`);
      const result = (await response.json()) as WorkflowQueueSnapshot & { message?: string };
      if (!response.ok || !result.tasks) {
        throw new Error(result.message ?? 'Task queue could not be loaded.');
      }

      setQueue(nextQueue);
      setSnapshot(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Task queue could not be loaded.');
    } finally {
      setPending(false);
    }
  };

  const submitTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask || !form) return;

    setPending(true);
    setError(null);
    setBlockers([]);

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          assignedUser: form.assignedUser,
          dueDate: form.dueDate || undefined,
          blockedReason: form.blockedReason || undefined,
          naReason: form.naReason || undefined,
          reopenReason: form.reopenReason || undefined,
          expectedLastUpdatedAt: selectedTask.lastUpdatedAt,
          changeReason: form.changeReason,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        blockers?: string[];
        task?: OperationalTask;
      };

      if (!response.ok || !result.task) {
        setBlockers(result.blockers ?? []);
        throw new Error(result.message ?? 'Task could not be updated.');
      }

      setSnapshot((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === result.task?.id ? result.task : task),
      }));
      setMessage('Task updated with redacted audit evidence.');
      closeModal();
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Task could not be updated.');
    } finally {
      setPending(false);
    }
  };

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Tasks"
        subtitle="Role-aware Carepath queues with guarded assignment, status, blocked, N/A, and reopen commands."
        actions={
          <>
            <Select
              value={queue}
              onChange={(event) => void loadQueue(event.target.value as WorkflowQueueName)}
              disabled={pending}
              className="min-w-[190px]"
            >
              {queueOptions.map((item) => (
                <option key={item} value={item}>{queueLabels[item]}</option>
              ))}
            </Select>
            <Button type="button" variant="secondary" disabled={pending} onClick={() => void loadQueue(queue)}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </>
        }
      />

      {message ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--status-positive-border)] bg-[var(--status-positive-surface)] px-3 py-2 type-body text-[var(--status-positive-text)]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--status-negative-border)] bg-[var(--status-negative-surface)] px-3 py-2 type-body text-[var(--status-negative-text)]">
          {error}
        </div>
      ) : null}

      <StatGrid>
        <StatCard icon={ClipboardCheck} label="All Tasks" value={metrics.all} sub="Stored queue items" />
        <StatCard icon={UsersRound} label="My Role" value={metrics.mine} sub="Session role lane" tone="neutral" />
        <StatCard icon={PenLine} label="Signatures" value={metrics.signatures} sub="Review path" tone="intermediate" />
        <StatCard icon={AlertTriangle} label="Overdue" value={metrics.overdue} sub="Date-derived" tone="negative" />
        <StatCard icon={ListChecks} label="Blocked" value={metrics.blocked} sub="Reason required" tone="negative" />
        <StatCard icon={CheckCircle2} label="Completed" value={metrics.completed} sub="Closed work" tone="positive" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        columns={[
          { key: 'task', label: 'Task', render: (row) => (
            <div className="min-w-0">
              <p className="truncate type-medium text-[var(--color-text)]">{row.title}</p>
              <p className="truncate type-supporting text-[var(--color-text-muted)]">{row.documentName}</p>
            </div>
          ) },
          { key: 'course', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{row.displayLabel} / {row.courseRef}</span>
          ) },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.workflowPhase)}>{formatUiLabel(row.workflowPhase)}</Badge> },
          { key: 'role', label: 'Role', render: (row) => formatUiLabel(row.responsibleParty) },
          { key: 'assigned', label: 'Assigned', render: (row) => row.assignedUser },
          { key: 'dueDate', label: 'Due', render: (row) => row.dueDate ?? '—' },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{formatUiLabel(row.status)}</Badge> },
          { key: 'reason', label: 'Reason', render: (row) => row.blockedReason ?? row.naReason ?? row.reopenReason ?? '—' },
          { key: 'action', label: '', render: (row) => (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                openTask(row);
              }}
            >
              <PenLine className="h-3.5 w-3.5" />
              Update
            </Button>
          ) },
        ]}
        rows={snapshot.tasks}
        pageSize={10}
        search={{
          placeholder: 'Search task, token, course, owner, document, status, or reason...',
          getText: (row) => [
            row.title,
            row.documentName,
            row.displayLabel,
            row.courseRef,
            row.workflowPhase,
            row.status,
            row.responsibleParty,
            row.assignedUser,
            row.blockedReason,
            row.naReason,
          ].join(' '),
        }}
        filters={[
          { id: 'status', label: 'Status', getValue: (row) => formatUiLabel(row.status) },
          { id: 'role', label: 'Role', getValue: (row) => formatUiLabel(row.responsibleParty) },
          { id: 'assigned', label: 'Assigned', getValue: (row) => row.assignedUser },
        ]}
        empty="No tasks are available for this queue."
        emptyDescription="Try another queue or create a patient-course bundle to generate tasks."
      />

      <Modal open={Boolean(selectedTask && form)} onClose={closeModal} title="Update Task" width={620}>
        {selectedTask && form ? (
          <form className="grid gap-3" onSubmit={submitTask}>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 type-supporting text-[var(--color-text-muted)]">
              {selectedTask.title} / {selectedTask.courseRef}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                Status
                <Select value={form.status} onChange={(event) => updateForm('status', event.target.value as CarepathTaskStatus)}>
                  {taskStatuses.map((status) => (
                    <option key={status} value={status}>{formatUiLabel(status)}</option>
                  ))}
                </Select>
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                Due date
                <Input type="date" value={form.dueDate} onChange={(event) => updateForm('dueDate', event.target.value)} />
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                Assigned user
                <Input value={form.assignedUser} onChange={(event) => updateForm('assignedUser', event.target.value)} />
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                Blocked reason
                <Input value={form.blockedReason} onChange={(event) => updateForm('blockedReason', event.target.value)} />
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                N/A reason
                <Input value={form.naReason} onChange={(event) => updateForm('naReason', event.target.value)} />
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                Reopen reason
                <Input value={form.reopenReason} onChange={(event) => updateForm('reopenReason', event.target.value)} />
              </label>
              <label className="grid gap-1 type-supporting text-[var(--color-text-muted)] sm:col-span-2">
                Change reason
                <Input value={form.changeReason} onChange={(event) => updateForm('changeReason', event.target.value)} required />
              </label>
            </div>
            {blockers.length > 0 ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--status-negative-surface)] p-3 type-supporting text-[var(--status-negative-text)]">
                {blockers.map((item) => <p key={item}>{item}</p>)}
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" disabled={pending} onClick={closeModal}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending ? 'Saving' : 'Save'}</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </PageStack>
  );
}
