'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, FileText, Play, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import type { CarepathTask, ResponsibleParty, WorkflowItemStatus, WorkflowStep } from '@/lib/types';
import { carepathPhaseLabels, cn, formatDate, responsiblePartyLabels } from '@/lib/workflow';
import { phaseTone, statusTone } from '@/lib/status-utils';

type CarepathCommandClientProps = {
  courseRef: string;
  steps: WorkflowStep[];
  tasks: CarepathTask[];
};

type FilterValue = 'all' | 'open' | 'blocked' | 'review' | 'signed';

const statusOptions: WorkflowItemStatus[] = [
  'NOT_STARTED',
  'PENDING',
  'IN_PROGRESS',
  'READY_FOR_REVIEW',
  'SIGNED',
  'COMPLETED',
  'NOT_APPLICABLE',
  'BLOCKED',
];

function statusLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nextActionForStep(step: WorkflowStep) {
  if (step.status === 'BLOCKED') return step.blockers[0] ?? 'Resolve blocker before advancing.';
  if (step.status === 'READY_FOR_REVIEW') return step.requiresSignature ? 'Review content and capture required signature.' : 'Review content and mark complete.';
  if (step.status === 'SIGNED') return 'Confirm downstream document or task handoff.';
  if (step.status === 'COMPLETED') return 'No action required unless a correction is opened.';
  if (step.applicability === 'REMOVED') return step.systemReason ?? 'Removed from this carepath template.';
  if (step.applicability === 'OPTIONAL') return 'Decide whether this optional step applies and document the reason.';
  return step.notes ?? step.triggerEvent;
}

function matchesFilter(step: WorkflowStep, filter: FilterValue) {
  if (filter === 'all') return true;
  if (filter === 'open') return !['COMPLETED', 'SIGNED', 'CLOSED'].includes(step.status);
  if (filter === 'blocked') return step.status === 'BLOCKED' || step.blockers.length > 0;
  if (filter === 'review') return step.status === 'READY_FOR_REVIEW' || step.requiresSignature && !step.signedAt;
  return step.status === 'SIGNED' || step.signedAt;
}

export function CarepathCommandClient({ courseRef, steps, tasks }: CarepathCommandClientProps) {
  const [localSteps, setLocalSteps] = useState<WorkflowStep[]>(steps);
  const [selectedStepId, setSelectedStepId] = useState(steps[0]?.id ?? '');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [draftStatus, setDraftStatus] = useState<WorkflowItemStatus>(steps[0]?.status ?? 'PENDING');
  const [draftOwner, setDraftOwner] = useState<ResponsibleParty>(steps[0]?.responsibleRole ?? 'ADMIN');
  const [reason, setReason] = useState('Reviewed during prototype demo.');
  const [message, setMessage] = useState('Select a carepath step to review evidence, owner, and next action.');

  const selectedStep = localSteps.find((step) => step.id === selectedStepId) ?? localSteps[0];
  const selectedTasks = selectedStep ? tasks.filter((task) => task.taskNumber === String(selectedStep.stepNumber)) : [];
  const visibleSteps = localSteps.filter((step) => matchesFilter(step, filter));
  const completed = localSteps.filter((step) => ['COMPLETED', 'SIGNED', 'CLOSED'].includes(step.status)).length;
  const blocked = localSteps.filter((step) => step.status === 'BLOCKED' || step.blockers.length > 0).length;
  const signatureDue = localSteps.filter((step) => step.requiresSignature && !step.signedAt).length;
  const progress = Math.round((completed / Math.max(localSteps.length, 1)) * 100);

  const nextStep = useMemo(
    () => localSteps.find((step) => !['COMPLETED', 'SIGNED', 'CLOSED'].includes(step.status)),
    [localSteps],
  );

  function selectStep(step: WorkflowStep) {
    setSelectedStepId(step.id);
    setDraftStatus(step.status);
    setDraftOwner(step.responsibleRole);
    setReason(step.blockers[0] ?? step.naReason ?? step.notes ?? 'Reviewed during prototype demo.');
    setMessage(`Reviewing step ${step.stepNumber}: ${step.stepName}.`);
  }

  function applyDraft() {
    if (!selectedStep) return;

    const trimmedReason = reason.trim();
    setLocalSteps((current) =>
      current.map((step) =>
        step.id === selectedStep.id
          ? {
              ...step,
              status: draftStatus,
              responsibleRole: draftOwner,
              blockers: draftStatus === 'BLOCKED' ? [trimmedReason || 'Blocked pending documented reason.'] : [],
              naReason: draftStatus === 'NOT_APPLICABLE' ? trimmedReason || 'Marked N/A during prototype demo.' : step.naReason,
              signedAt: draftStatus === 'SIGNED' ? new Date().toISOString() : step.signedAt,
              notes: trimmedReason || step.notes,
              updatedAt: new Date().toISOString(),
            }
          : step,
      ),
    );
    setMessage(`Staged ${statusLabel(draftStatus)} for step ${selectedStep.stepNumber}.`);
  }

  function markReady() {
    if (!selectedStep) return;
    setDraftStatus(selectedStep.requiresSignature ? 'READY_FOR_REVIEW' : 'COMPLETED');
    setReason('Required evidence reviewed and staged for the next owner.');
  }

  function advanceToNextOpen() {
    if (nextStep) {
      selectStep(nextStep);
      setFilter('open');
    }
  }

  return (
    <div className="grid min-h-0 gap-4">
      <StatGrid>
        <StatCard icon={ClipboardList} label="Carepath Steps" value={localSteps.length} sub={`${progress}% complete`} tone="primary" />
        <StatCard icon={CheckCircle2} label="Complete / Signed" value={completed} sub="Closed loop items" tone="success" />
        <StatCard icon={AlertTriangle} label="Blocked" value={blocked} sub="Needs owner action" tone={blocked ? 'error' : 'success'} />
        <StatCard icon={ShieldCheck} label="Signatures Due" value={signatureDue} sub="Review queue" tone={signatureDue ? 'warning' : 'success'} />
      </StatGrid>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Card className="min-h-0">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="clinical-label">Carepath Command</p>
              <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">
                {courseRef} canonical step review
              </h2>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{message}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'open', 'blocked', 'review', 'signed'] as FilterValue[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={cn(
                    'clinical-focus h-[var(--height-btn-sm)] rounded-[var(--radius-md)] border px-3 text-xs font-bold capitalize transition',
                    filter === item
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                      : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
            <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid gap-2">
            {visibleSteps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => selectStep(step)}
                className={cn(
                  'clinical-focus grid gap-3 rounded-[var(--radius-md)] border p-3 text-left transition md:grid-cols-[72px_minmax(0,1fr)_160px_150px]',
                  selectedStep?.id === step.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                    : 'border-[var(--color-border-soft)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/35',
                )}
              >
                <div className="font-heading text-lg font-bold text-[var(--color-primary)]">
                  {String(step.stepNumber).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--color-text)]">{step.stepName}</p>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-[var(--color-text-muted)]">{nextActionForStep(step)}</p>
                </div>
                <Badge variant={phaseTone(step.phase)}>{carepathPhaseLabels[step.phase]}</Badge>
                <Badge variant={statusTone(step.status)}>{statusLabel(step.status)}</Badge>
              </button>
            ))}
          </div>
        </Card>

        <Card className="min-h-0">
          {selectedStep ? (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="clinical-label">Selected Step</p>
                  <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                    {selectedStep.stepNumber}. {selectedStep.stepName}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Due {selectedStep.dueDate ? formatDate(selectedStep.dueDate) : selectedStep.triggerEvent}
                  </p>
                </div>
                <Badge variant={statusTone(selectedStep.status)}>{statusLabel(selectedStep.status)}</Badge>
              </div>

              <div className="grid gap-3">
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Next Action</p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{nextActionForStep(selectedStep)}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="clinical-muted-surface p-3">
                    <p className="clinical-label">Owner</p>
                    <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{responsiblePartyLabels[selectedStep.responsibleRole]}</p>
                  </div>
                  <div className="clinical-muted-surface p-3">
                    <p className="clinical-label">Signature</p>
                    <p className="mt-2 text-sm font-bold text-[var(--color-text)]">
                      {selectedStep.requiresSignature ? selectedStep.signedAt ? 'Signed' : 'Required' : 'Not required'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <p className="clinical-label">Linked Tasks</p>
                {selectedTasks.length ? selectedTasks.map((task) => (
                  <div key={task.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--color-text)]">{task.title}</p>
                      <Badge variant={statusTone(task.status)}>{statusLabel(task.status)}</Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">{task.noteAction}</p>
                  </div>
                )) : (
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 text-sm font-semibold text-[var(--color-text-muted)]">
                    No linked task is required for this step in the current demo data.
                  </div>
                )}
              </div>

              <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="clinical-label">Stage Status</span>
                    <Select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as WorkflowItemStatus)}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </Select>
                  </label>
                  <label className="grid gap-1">
                    <span className="clinical-label">Owner</span>
                    <Select value={draftOwner} onChange={(event) => setDraftOwner(event.target.value as ResponsibleParty)}>
                      {Object.entries(responsiblePartyLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </label>
                </div>
                <label className="grid gap-1">
                  <span className="clinical-label">Reason / Evidence Note</span>
                  <Textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
                </label>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={markReady}>
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    Ready
                  </Button>
                  <Button type="button" size="sm" onClick={applyDraft}>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Apply
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={advanceToNextOpen}>
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Next Open Step
                </Button>
                <PrototypeActionButton label="Generate Carepath Note" icon="file" kind="document" description="Stage a carepath note from the selected workflow step and evidence note." />
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-[var(--color-text-muted)]">No carepath step is available.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
