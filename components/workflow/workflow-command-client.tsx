'use client';

import { useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, FileText, Pencil, ShieldCheck } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { phaseTone, statusTone } from '@/lib/status-utils';
import type {
  CarepathWorkflowPhase,
  OperationalTreatmentCourse,
  OperationalWorkflowStep,
  WorkflowItemStatus,
} from '@/lib/types';

type WorkflowCommandClientProps = {
  steps: OperationalWorkflowStep[];
  courses: OperationalTreatmentCourse[];
};

type StepForm = {
  status: WorkflowItemStatus;
  assignedUserId: string;
  dueDate: string;
  blockedReason: string;
  naReason: string;
  reopenReason: string;
  changeReason: string;
};

const workflowStatuses: WorkflowItemStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'IN_PROGRESS',
  'READY_FOR_REVIEW',
  'SIGNED',
  'UPLOADED',
  'COMPLETED',
  'NOT_APPLICABLE',
  'BLOCKED',
  'OVERDUE',
  'CLOSED',
];

const phaseLabels: Record<CarepathWorkflowPhase, string> = {
  CONSULTATION: 'Consultation',
  CHART_PREP: 'Chart Prep',
  SIMULATION: 'Simulation',
  PLANNING: 'Planning',
  ON_TREATMENT: 'On Treatment',
  POST_TX: 'Post-Tx',
  AUDIT: 'Audit',
  CLOSED: 'Closed',
};

function label(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formFromStep(step: OperationalWorkflowStep): StepForm {
  return {
    status: step.status,
    assignedUserId: step.assignedUserId ?? '',
    dueDate: step.dueDate ?? '',
    blockedReason: step.blockers[0] ?? '',
    naReason: step.naReason ?? '',
    reopenReason: '',
    changeReason: 'Phase 3 workflow command update.',
  };
}

export function WorkflowCommandClient({ steps: initialSteps, courses }: WorkflowCommandClientProps) {
  const router = useRouter();
  const [steps, setSteps] = useState(initialSteps);
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? '');
  const [selectedStep, setSelectedStep] = useState<OperationalWorkflowStep | null>(null);
  const [form, setForm] = useState<StepForm | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[]>([]);

  const metrics = useMemo(() => {
    const blockedRows = steps.filter((step) => step.status === 'BLOCKED' || step.status === 'OVERDUE' || step.blockers.length > 0);
    return {
      active: steps.filter((step) => step.status !== 'NOT_APPLICABLE' && step.status !== 'CLOSED').length,
      ready: steps.filter((step) => step.status === 'READY_FOR_REVIEW').length,
      signed: steps.filter((step) => step.signedAt).length,
      blocked: blockedRows.length,
      notApplicable: steps.filter((step) => step.status === 'NOT_APPLICABLE').length,
    };
  }, [steps]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  const closeModal = () => {
    if (pending) return;
    setSelectedStep(null);
    setForm(null);
  };

  const openStep = (step: OperationalWorkflowStep) => {
    setSelectedStep(step);
    setForm(formFromStep(step));
    setError(null);
    setBlockers([]);
  };

  const updateForm = <K extends keyof StepForm>(key: K, value: StepForm[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current);
  };

  const advanceCourse = async () => {
    if (!selectedCourse) return;

    setPending(true);
    setError(null);
    setMessage(null);
    setBlockers([]);

    try {
      const response = await fetch(`/api/workflow/courses/${selectedCourse.id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedCoursePhase: selectedCourse.coursePhase,
          changeReason: 'Phase 3 guarded course workflow advancement.',
        }),
      });
      const result = (await response.json()) as { message?: string; blockers?: string[] };

      if (!response.ok) {
        setBlockers(result.blockers ?? []);
        throw new Error(result.message ?? 'Course workflow could not advance.');
      }

      setMessage('Course workflow advanced through the guarded command service.');
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Course workflow could not advance.');
    } finally {
      setPending(false);
    }
  };

  const submitStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStep || !form) return;

    setPending(true);
    setError(null);
    setBlockers([]);

    try {
      const response = await fetch(`/api/workflow/steps/${selectedStep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          assignedUserId: form.assignedUserId || undefined,
          dueDate: form.dueDate || undefined,
          blockedReason: form.blockedReason || undefined,
          naReason: form.naReason || undefined,
          reopenReason: form.reopenReason || undefined,
          expectedUpdatedAt: selectedStep.updatedAt,
          changeReason: form.changeReason,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        blockers?: string[];
        step?: OperationalWorkflowStep;
      };

      if (!response.ok || !result.step) {
        setBlockers(result.blockers ?? []);
        throw new Error(result.message ?? 'Workflow step could not be updated.');
      }

      setSteps((current) => current.map((step) => step.id === result.step?.id ? result.step : step));
      setMessage('Workflow step updated with redacted audit evidence.');
      closeModal();
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Workflow step could not be updated.');
    } finally {
      setPending(false);
    }
  };

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Workflow"
        subtitle="Guarded Carepath command center for course phase advancement and step control."
        actions={
          <>
            <Select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="min-w-[220px]">
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseRef} / {phaseLabels[course.coursePhase ?? 'CONSULTATION']}
                </option>
              ))}
            </Select>
            <Button type="button" disabled={!selectedCourseId || pending} onClick={advanceCourse}>
              <ArrowRight className="h-4 w-4" />
              Advance
            </Button>
            <PrototypeActionButton label="Export" icon="file" kind="export" description="Prepare a tokenized workflow status export." />
            <PrototypeActionButton label="Customize" icon="pen" kind="settings" description="Stage workflow definition changes for admin review." />
          </>
        }
      />

      {message ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-success)]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-error)]">
          {error}
        </div>
      ) : null}
      {blockers.length > 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
          {blockers.slice(0, 4).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : null}

      <StatGrid>
        <StatCard icon={CalendarDays} label="Active Steps" value={metrics.active} sub="Stored workflow rows" />
        <StatCard icon={FileText} label="Ready" value={metrics.ready} sub="Awaiting review" tone="primary" />
        <StatCard icon={CheckCircle2} label="Signed" value={metrics.signed} sub="Signature evidence" tone="success" />
        <StatCard icon={AlertTriangle} label="Blocked" value={metrics.blocked} sub="Command blockers" tone="error" />
        <StatCard icon={ShieldCheck} label="N/A" value={metrics.notApplicable} sub="Reason required" tone="warning" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[620px]"
        columns={[
          { key: 'step', label: 'Step', render: (row) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--color-primary)]">{row.stepNumber}. {row.stepName}</p>
              <p className="truncate text-[11px] font-semibold text-[var(--color-text-muted)]">{row.courseRef} / {row.displayLabel}</p>
            </div>
          ) },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{phaseLabels[row.phase]}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{label(row.status)}</Badge> },
          { key: 'applicability', label: 'Applicability', render: (row) => <Badge variant={row.applicability === 'REQUIRED' ? 'primary' : 'default'}>{label(row.applicability ?? 'REQUIRED')}</Badge> },
          { key: 'role', label: 'Role', render: (row) => label(row.responsibleRole) },
          { key: 'assigned', label: 'Assigned', render: (row) => row.assignedUserId ?? label(row.responsibleRole) },
          { key: 'due', label: 'Due', render: (row) => row.dueDate ?? '—' },
          { key: 'requirements', label: 'Requirements', render: (row) => row.requirementIds?.length ?? 0 },
          { key: 'blocker', label: 'Blocker', render: (row) => row.blockers[0] ?? row.naReason ?? '—' },
          { key: 'action', label: '', render: (row) => (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                openStep(row);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Update
            </Button>
          ) },
        ]}
        rows={steps}
        pageSize={15}
        search={{
          placeholder: 'Search workflow step, token, course, blocker, role, or requirement...',
          getText: (row) => [
            row.stepName,
            row.courseRef,
            row.displayLabel,
            row.phase,
            row.status,
            row.responsibleRole,
            row.assignedUserId,
            row.applicability,
            row.naReason,
            ...(row.blockers ?? []),
            ...(row.requirementIds ?? []),
          ].join(' '),
        }}
        filters={[
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabels[row.phase] },
          { id: 'status', label: 'Status', getValue: (row) => label(row.status) },
          { id: 'applicability', label: 'Applicability', getValue: (row) => label(row.applicability ?? 'REQUIRED') },
          { id: 'role', label: 'Role', getValue: (row) => label(row.responsibleRole) },
        ]}
        empty="No workflow steps are available."
        emptyDescription="Workflow command rows are generated when a patient-course bundle initializes."
      />

      <Modal open={Boolean(selectedStep && form)} onClose={closeModal} title="Update Workflow Step" width={620}>
        {selectedStep && form ? (
          <form className="grid gap-3" onSubmit={submitStep}>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 text-xs font-semibold text-[var(--color-text-muted)]">
              {selectedStep.stepNumber}. {selectedStep.stepName} / {selectedStep.courseRef}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                Status
                <Select value={form.status} onChange={(event) => updateForm('status', event.target.value as WorkflowItemStatus)}>
                  {workflowStatuses.map((status) => (
                    <option key={status} value={status}>{label(status)}</option>
                  ))}
                </Select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                Due date
                <Input type="date" value={form.dueDate} onChange={(event) => updateForm('dueDate', event.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                Assigned user
                <Input value={form.assignedUserId} onChange={(event) => updateForm('assignedUserId', event.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                Blocked reason
                <Input value={form.blockedReason} onChange={(event) => updateForm('blockedReason', event.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                N/A reason
                <Input value={form.naReason} onChange={(event) => updateForm('naReason', event.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                Reopen reason
                <Input value={form.reopenReason} onChange={(event) => updateForm('reopenReason', event.target.value)} />
              </label>
              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)] sm:col-span-2">
                Change reason
                <Input value={form.changeReason} onChange={(event) => updateForm('changeReason', event.target.value)} required />
              </label>
            </div>
            {blockers.length > 0 ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-bg)] p-3 text-xs font-semibold text-[var(--color-error)]">
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
