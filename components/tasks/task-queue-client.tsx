'use client';

import { useMemo, useState, useTransition, type MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, CalendarDays, RotateCcw, Search } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { FilterField, FilterStrip } from '@/components/shared/filter-strip';
import { PageHeader } from '@/components/shared/page-header';
import { PageStack } from '@/components/shared/page-stack';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';
import type {
  OperationalTask,
  TaskDueBucket,
  WorkflowQueueName,
  WorkflowQueueSnapshot,
} from '@/lib/types';

type TaskQueueClientProps = {
  snapshot: WorkflowQueueSnapshot;
};

const bucketLabels: Record<TaskDueBucket, string> = {
  OVERDUE: 'Overdue',
  TODAY: 'Today',
  UPCOMING: 'Upcoming',
  ALL_OPEN: 'All Open',
};

const queueLabels: Partial<Record<WorkflowQueueName, string>> = {
  ALL: 'All Tasks',
  MY_TASKS: 'My Tasks',
  TEAM_TASKS: 'Role Queue',
  UNASSIGNED: 'Unassigned',
};

const queueOptions = Object.keys(queueLabels) as WorkflowQueueName[];
const buckets = Object.keys(bucketLabels) as TaskDueBucket[];

const emptyCopy: Record<TaskDueBucket, { title: string; description: string }> = {
  OVERDUE: {
    title: 'No overdue tasks',
    description: 'No open work in this assignment scope is past its due date.',
  },
  TODAY: {
    title: 'No tasks due today',
    description: 'Review Upcoming for later work or All Open for tasks without a due date.',
  },
  UPCOMING: {
    title: 'No upcoming tasks',
    description: 'No open work in this assignment scope is due after today.',
  },
  ALL_OPEN: {
    title: 'No open tasks',
    description: 'Completed work remains available in the patient record and audit history.',
  },
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatAppointment(dateTime: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  }).format(new Date(dateTime));
}

function taskHref(task: OperationalTask) {
  const params = new URLSearchParams();
  if (task.workspaceTarget) {
    params.set('tab', task.workspaceTarget.tab);
    params.set('targetKind', task.workspaceTarget.targetKind);
    params.set('targetId', task.workspaceTarget.targetId);
  }
  const query = params.toString();
  return `/patients/${encodeURIComponent(task.patientRef)}${query ? `?${query}` : ''}`;
}

export function TaskQueueClient({ snapshot }: TaskQueueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [pending, startTransition] = useTransition();
  const activeStatus = searchParams.get('status') ?? 'ALL';
  const activePhase = searchParams.get('phase') ?? 'ALL';

  const navigateWith = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'ALL') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    startTransition(() => router.replace(`/tasks${params.size ? `?${params.toString()}` : ''}`));
  };

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return snapshot.tasks.filter((task) => {
      const statusMatches = activeStatus === 'ALL' || task.status === activeStatus;
      const phaseMatches = activePhase === 'ALL' || task.workflowPhase === activePhase;
      const searchMatches = !normalizedQuery || [
        task.actionLabel,
        task.title,
        task.documentName,
        task.displayLabel,
        task.patientRef,
        task.courseRef,
        task.assignedUser,
        task.responsibleParty,
        task.status,
      ].join(' ').toLowerCase().includes(normalizedQuery);
      return statusMatches && phaseMatches && searchMatches;
    });
  }, [activePhase, activeStatus, query, snapshot.tasks]);

  const clearFilters = () => {
    setQuery('');
    startTransition(() => router.replace(`/tasks?bucket=${snapshot.bucket}`));
  };

  const openTask = (task: OperationalTask) => router.push(taskHref(task));

  return (
    <PageStack>
      <PageHeader
        title="Tasks"
        subtitle="Prioritized clinical and administrative work. Open an action to complete it in the patient record."
      />

      <nav className="task-bucket-strip" aria-label="Task Due Date Buckets">
        <div role="tablist" aria-label="Task Due Date Buckets" className="task-bucket-list">
          {buckets.map((bucket) => {
            const active = snapshot.bucket === bucket;
            return (
              <button
                key={bucket}
                type="button"
                role="tab"
                aria-selected={active}
                className={`clinical-focus task-bucket-button${active ? ' is-active' : ''}${bucket === 'OVERDUE' && snapshot.bucketCounts[bucket] > 0 ? ' has-risk' : ''}`}
                onClick={() => navigateWith({ bucket })}
                disabled={pending}
              >
                <span>{bucketLabels[bucket]}</span>
                <span className="task-bucket-count">{snapshot.bucketCounts[bucket]}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        minTableWidth="960px"
        loading={pending}
        loadingLabel="Updating task worklist..."
        columns={[
          {
            key: 'action',
            label: 'Action',
            width: '31%',
            render: (task) => (
              <div className="min-w-0">
                <p className="truncate type-body-strong text-[var(--color-text)]">{task.actionLabel}</p>
                <p className="truncate type-supporting text-[var(--color-text-muted)]">
                  {formatUiLabel(task.workflowPhase)} · {task.documentName}
                </p>
              </div>
            ),
          },
          {
            key: 'patient',
            label: 'Patient / Course',
            width: '18%',
            render: (task) => (
              <div className="min-w-0">
                <p className="truncate type-body text-[var(--color-text)]">{task.displayLabel}</p>
                <p className="truncate type-supporting text-[var(--color-text-muted)]">{task.courseRef}</p>
              </div>
            ),
          },
          {
            key: 'owner',
            label: 'Owner',
            width: '15%',
            render: (task) => (
              <div className="min-w-0">
                <p className="truncate type-body text-[var(--color-text)]">{task.assignedUser || 'Unassigned'}</p>
                <p className="truncate type-supporting text-[var(--color-text-muted)]">{formatUiLabel(task.responsibleParty)}</p>
              </div>
            ),
          },
          {
            key: 'due',
            label: 'Due',
            width: '15%',
            render: (task) => (
              <div className="min-w-0">
                <p className={`type-body ${snapshot.bucket === 'OVERDUE' ? 'text-[var(--status-negative-text)]' : 'text-[var(--color-text)]'}`}>
                  {task.dueDate ? formatDate(task.dueDate) : 'No Due Date'}
                </p>
                {task.linkedAppointment ? (
                  <p className="truncate type-supporting text-[var(--color-text-muted)]">
                    <CalendarDays className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    {formatAppointment(task.linkedAppointment.dateTime)}
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            width: '11%',
            render: (task) => <Badge variant={statusTone(task.status)}>{formatUiLabel(task.status)}</Badge>,
          },
          {
            key: 'open',
            label: '',
            width: '10%',
            render: (task) => (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.stopPropagation();
                  openTask(task);
                }}
              >
                Open Action
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            ),
          },
        ]}
        rows={filteredTasks}
        onRowClick={openTask}
        getRowLabel={(task) => `Open ${task.actionLabel} for ${task.displayLabel}`}
        toolbar={(
          <FilterStrip>
            <FilterField grow>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search action, patient token, course, owner, or document..."
                  aria-label="Search Tasks"
                  className="pl-9"
                />
              </label>
            </FilterField>
            <FilterField width={170}>
              <Select
                value={snapshot.queue}
                onChange={(event) => navigateWith({ queue: event.target.value })}
                aria-label="Assignment Scope"
                disabled={pending}
              >
                {queueOptions.map((queue) => <option key={queue} value={queue}>{queueLabels[queue]}</option>)}
              </Select>
            </FilterField>
            <FilterField width={170}>
              <Select value={activePhase} onChange={(event) => navigateWith({ phase: event.target.value })} aria-label="Workflow Context">
                <option value="ALL">All Workflow Context</option>
                {Array.from(new Set(snapshot.tasks.map((task) => task.workflowPhase))).map((phase) => (
                  <option key={phase} value={phase}>{formatUiLabel(phase)}</option>
                ))}
              </Select>
            </FilterField>
            <FilterField width={160}>
              <Select value={activeStatus} onChange={(event) => navigateWith({ status: event.target.value })} aria-label="Task Status">
                <option value="ALL">All Status</option>
                {Array.from(new Set(snapshot.tasks.map((task) => task.status))).map((status) => (
                  <option key={status} value={status}>{formatUiLabel(status)}</option>
                ))}
              </Select>
            </FilterField>
            <Button type="button" variant="ghost" onClick={clearFilters} disabled={pending && !query}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Clear Filters
            </Button>
          </FilterStrip>
        )}
        empty={emptyCopy[snapshot.bucket].title}
        emptyDescription={emptyCopy[snapshot.bucket].description}
      />

      <p className="sr-only" aria-live="polite">
        {pending ? 'Updating task worklist.' : `${filteredTasks.length} tasks shown in ${bucketLabels[snapshot.bucket]}.`}
      </p>
    </PageStack>
  );
}
