'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, GitBranch, Layers3, ShieldCheck, Workflow } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export type WorkflowTemplateRow = {
  id: string;
  name: string;
  diagnosis: string;
  protocol: string;
  status: string;
  phases: string[];
  totalRequirements: number;
  pilotReady: number;
  completeFieldMaps: number;
  taskCreatingRequirements: number;
  deferredRequirements: number;
  sourceCoverage: string;
  description: string;
};

export type WorkflowTemplateRequirementRow = {
  id: string;
  workflowIds: string[];
  requirement: string;
  phase: string;
  owner: string;
  reviewer: string;
  source: string;
  sourceStatus: string;
  fieldMap: string;
  readiness: string;
  action: string;
  outputs: string;
  cpt: string;
  task: string;
  auditSteps: number;
};

export type WorkflowTemplateStats = {
  workflowCount: number;
  activeWorkflows: number;
  mappingWorkflows: number;
  requirementCount: number;
  pilotReadyRequirements: number;
  completeFieldMaps: number;
  deferredRequirements: number;
};

type StagedWorkflowDecision = {
  id: string;
  workflow: string;
  disposition: string;
  requirements: number;
};

type WorkflowTemplateCommandClientProps = {
  stats: WorkflowTemplateStats;
  workflows: WorkflowTemplateRow[];
  requirements: WorkflowTemplateRequirementRow[];
};

function toneFor(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('ready') || normalized.includes('complete') || normalized.includes('approved')) return 'positive' as const;
  if (normalized.includes('mapping') || normalized.includes('review') || normalized.includes('partial') || normalized.includes('deferred')) return 'intermediate' as const;
  if (normalized.includes('missing') || normalized.includes('retired')) return 'negative' as const;
  return 'neutral' as const;
}

export function WorkflowTemplateCommandClient({
  stats,
  workflows,
  requirements,
}: WorkflowTemplateCommandClientProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id ?? '');
  const [disposition, setDisposition] = useState(workflows[0]?.status ?? 'MAPPING IN PROGRESS');
  const [reviewNote, setReviewNote] = useState('Reviewed phases, required documents, field maps, source status, and task creation rules for demo readiness.');
  const [ledger, setLedger] = useState<StagedWorkflowDecision[]>([]);

  const selectedWorkflow = workflows.find((workflow) => workflow.id === selectedWorkflowId) ?? workflows[0];
  const linkedRequirements = useMemo(
    () => selectedWorkflow ? requirements.filter((requirement) => requirement.workflowIds.includes(selectedWorkflow.id)) : [],
    [requirements, selectedWorkflow],
  );
  const phaseSummary = useMemo(() => {
    if (!selectedWorkflow) return [];

    return selectedWorkflow.phases.map((phase) => {
      const phaseRequirements = linkedRequirements.filter((requirement) => requirement.phase === phase);
      const ready = phaseRequirements.filter((requirement) => requirement.readiness.toLowerCase().includes('ready')).length;
      return {
        phase,
        total: phaseRequirements.length,
        ready,
        tasks: phaseRequirements.filter((requirement) => requirement.task === 'Creates task').length,
      };
    });
  }, [linkedRequirements, selectedWorkflow]);

  function selectWorkflow(row: WorkflowTemplateRow) {
    setSelectedWorkflowId(row.id);
    setDisposition(row.status);
    setReviewNote('Reviewed phases, required documents, field maps, source status, and task creation rules for demo readiness.');
  }

  function stageDecision() {
    if (!selectedWorkflow) return;

    setLedger((current) => [
      {
        id: `WFT-${Date.now().toString(36).toUpperCase()}`,
        workflow: selectedWorkflow.name,
        disposition,
        requirements: linkedRequirements.length,
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Workflow Templates"
        subtitle="Carepath workflow definitions, source templates, field maps, and course-bundle creation rules"
        actions={
          <>
            <PrototypeActionButton label="Import Definition" icon="upload" kind="upload" description="Stage a workflow definition import from a registry source." />
            <PrototypeActionButton label="New Workflow" icon="plus" kind="create" variant="primary" description="Stage a new diagnosis-specific workflow template for admin review." />
          </>
        }
      />

      <StatGrid>
        <StatCard icon={Workflow} label="Workflow Definitions" value={stats.workflowCount} sub={`${stats.activeWorkflows} active`} tone="neutral" />
        <StatCard icon={Layers3} label="Mapping Workflows" value={stats.mappingWorkflows} sub="Diagnosis-specific" tone="neutral" />
        <StatCard icon={FileText} label="Requirements" value={stats.requirementCount} sub="Document/task rules" tone="neutral" />
        <StatCard icon={ShieldCheck} label="Pilot Ready" value={stats.pilotReadyRequirements} sub="Requirements" tone="positive" />
        <StatCard icon={GitBranch} label="Complete Maps" value={stats.completeFieldMaps} sub="Field maps" tone="positive" />
        <StatCard icon={CheckCircle2} label="Deferred" value={stats.deferredRequirements} sub="Explicitly tracked" tone="neutral" />
      </StatGrid>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <DataTable
          keyField="id"
          className="min-h-[520px]"
          columns={[
            { key: 'name', label: 'Workflow', render: (row) => <span className="type-medium text-[var(--color-text)]">{row.name}</span> },
            { key: 'diagnosis', label: 'Diagnosis' },
            { key: 'protocol', label: 'Protocol' },
            { key: 'status', label: 'Status', render: (row) => <Badge variant={toneFor(row.status)}>{row.status}</Badge> },
            { key: 'totalRequirements', label: 'Reqs' },
            { key: 'pilotReady', label: 'Ready' },
            { key: 'completeFieldMaps', label: 'Maps' },
            { key: 'sourceCoverage', label: 'Sources', render: (row) => <Badge variant={toneFor(row.sourceCoverage)}>{row.sourceCoverage}</Badge> },
          ]}
          rows={workflows}
          empty="No workflow definitions are available."
          emptyDescription="Workflow definitions will appear after the template registry is loaded."
          toolbarPrefix={
            <div className="min-w-[240px]">
              <p className="clinical-label">Definition Catalog</p>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">Select a workflow to review generated carepath rules.</p>
            </div>
          }
          toolbarActions={<PrototypeActionButton label="Export Definitions" icon="download" kind="export" size="sm" description="Prepare a PHI-free workflow template export." />}
          search={{ placeholder: 'Search workflow, diagnosis, protocol, status, phase, or source coverage...', keys: ['name', 'diagnosis', 'protocol', 'status', 'sourceCoverage', 'description'] }}
          filters={[
            { id: 'diagnosis', label: 'Diagnosis' },
            { id: 'protocol', label: 'Protocol' },
            { id: 'status', label: 'Status' },
            { id: 'sourceCoverage', label: 'Sources' },
          ]}
          pageSize={8}
          onRowClick={selectWorkflow}
        />

        <Card className="min-h-0">
          {selectedWorkflow ? (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="clinical-label">Selected Definition</p>
                  <h2 className="mt-1 type-heading text-[var(--color-text)]">{selectedWorkflow.name}</h2>
                  <p className="mt-2 type-body text-[var(--color-text-muted)]">{selectedWorkflow.description}</p>
                </div>
                <Badge variant={toneFor(selectedWorkflow.status)}>{selectedWorkflow.status}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Bundle Rules</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">
                    {selectedWorkflow.totalRequirements} docs / {selectedWorkflow.taskCreatingRequirements} tasks
                  </p>
                </div>
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Readiness</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">
                    {selectedWorkflow.pilotReady} ready / {selectedWorkflow.deferredRequirements} deferred
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="clinical-label">Carepath Build Preview</p>
                <div className="grid gap-2">
                  {phaseSummary.map((phase) => (
                    <div key={phase.phase} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="type-body text-[var(--color-text)]">{phase.phase}</p>
                        <Badge variant={phase.total === phase.ready ? 'positive' : phase.ready > 0 ? 'intermediate' : 'neutral'}>
                          {phase.ready}/{phase.total} ready
                        </Badge>
                      </div>
                      <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{phase.tasks} task-creating requirements</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <label className="grid gap-1">
                  <span className="clinical-label">Review Disposition</span>
                  <Select value={disposition} onChange={(event) => setDisposition(event.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="MAPPING IN PROGRESS">Mapping in Progress</option>
                    <option value="DRAFT">Draft</option>
                    <option value="NEEDS SOURCE REVIEW">Needs Source Review</option>
                    <option value="READY FOR PILOT REVIEW">Ready for Pilot Review</option>
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className="clinical-label">Definition Review Note</span>
                  <Textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
                </label>
                <div className="flex justify-end">
                  <Button type="button" onClick={stageDecision}>
                    Stage Decision
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="type-body text-[var(--color-text-muted)]">No workflow definition is selected.</div>
          )}
        </Card>
      </div>

      <DataTable
        keyField="id"
        className="min-h-[500px]"
        columns={[
          { key: 'requirement', label: 'Generated Requirement', render: (row) => <span className="type-medium text-[var(--color-text)]">{row.requirement}</span> },
          { key: 'phase', label: 'Phase' },
          { key: 'owner', label: 'Owner' },
          { key: 'reviewer', label: 'Reviewer' },
          { key: 'sourceStatus', label: 'Source', render: (row) => <Badge variant={toneFor(row.sourceStatus)}>{row.sourceStatus}</Badge> },
          { key: 'fieldMap', label: 'Field Map', render: (row) => <Badge variant={toneFor(row.fieldMap)}>{row.fieldMap}</Badge> },
          { key: 'readiness', label: 'Readiness', render: (row) => <Badge variant={toneFor(row.readiness)}>{row.readiness}</Badge> },
          { key: 'task', label: 'Task Rule' },
          { key: 'outputs', label: 'Outputs' },
        ]}
        rows={linkedRequirements}
        empty="No requirements are linked to the selected workflow."
        emptyDescription="Select another workflow or add document requirements in the template registry."
        toolbarPrefix={
          <div className="min-w-[260px]">
            <p className="clinical-label">Selected Workflow Requirements</p>
            <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
              {selectedWorkflow ? selectedWorkflow.name : 'No workflow selected'}
            </p>
          </div>
        }
        toolbarActions={<PrototypeActionButton label="Generate Bundle Preview" icon="play" kind="review" size="sm" description="Stage a course-bundle preview from the selected workflow definition." />}
        search={{ placeholder: 'Search requirement, phase, owner, source, readiness, task, output, or CPT...', keys: ['requirement', 'phase', 'owner', 'reviewer', 'source', 'sourceStatus', 'fieldMap', 'readiness', 'task', 'outputs', 'cpt', 'action'] }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'owner', label: 'Owner' },
          { id: 'reviewer', label: 'Reviewer' },
          { id: 'sourceStatus', label: 'Source' },
          { id: 'readiness', label: 'Readiness' },
        ]}
        pageSize={10}
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Workflow Review Ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Local Staged Decisions</h2>
          </div>
          <Badge variant="neutral">Prototype Only</Badge>
        </div>
        <div className="grid gap-2">
          {ledger.length ? ledger.map((record) => (
            <div key={record.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-[140px_minmax(0,1fr)_160px_110px]">
              <span className="type-supporting text-[var(--color-text-muted)]">{record.id}</span>
              <span className="truncate type-body text-[var(--color-text)]">{record.workflow}</span>
              <Badge variant={toneFor(record.disposition)}>{record.disposition}</Badge>
              <span className="type-supporting text-[var(--color-text-muted)]">{record.requirements} reqs</span>
            </div>
          )) : (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 type-body text-[var(--color-text-muted)]">
              No workflow template decisions have been staged in this demo session.
            </div>
          )}
        </div>
      </Card>
    </PageStack>
  );
}
