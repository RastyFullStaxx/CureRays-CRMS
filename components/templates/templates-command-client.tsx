'use client';

import { useMemo, useState } from 'react';
import { Archive, CheckCircle2, FileText, GitBranch, ShieldCheck, Upload } from 'lucide-react';
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

export type TemplateSourceRow = {
  id: string;
  name: string;
  fileType: string;
  registryStatus: string;
  approval: string;
  hash: string;
  requirements: string;
  fieldMaps: string;
  disposition: string;
  sourcePath: string;
};

export type TemplateRequirementRow = {
  id: string;
  requirement: string;
  sourceId?: string;
  phase: string;
  responsible: string;
  reviewer: string;
  applicability: string;
  cpt: string;
  fieldMap: string;
  readiness: string;
};

export type TemplatePlaceholderRow = {
  id: string;
  kind: string;
  disposition: string;
  notes: string;
};

type TemplateStats = {
  active: number;
  sourceCount: number;
  pilotApproved: number;
  completeFieldMaps: number;
  fieldMapCount: number;
  hashVerified: number;
  hashMismatched: number;
  deferredOrFuture: number;
  schemaVersion: string;
  generatedAt: string;
};

type ReviewRecord = {
  id: string;
  template: string;
  disposition: string;
};

type TemplatesCommandClientProps = {
  stats: TemplateStats;
  sourceRows: TemplateSourceRow[];
  requirementRows: TemplateRequirementRow[];
  placeholders: TemplatePlaceholderRow[];
};

function toneFor(value: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  const normalized = value.toLowerCase();
  if (normalized.includes('verified') || normalized.includes('active') || normalized.includes('approved') || normalized.includes('ready')) return 'success';
  if (normalized.includes('deferred') || normalized.includes('review') || normalized.includes('draft') || normalized.includes('missing')) return 'warning';
  if (normalized.includes('mismatch') || normalized.includes('retired')) return 'error';
  if (normalized.includes('complete')) return 'info';
  return 'default';
}

export function TemplatesCommandClient({
  stats,
  sourceRows,
  requirementRows,
  placeholders,
}: TemplatesCommandClientProps) {
  const [selectedId, setSelectedId] = useState(sourceRows[0]?.id ?? '');
  const [reviewDisposition, setReviewDisposition] = useState(sourceRows[0]?.disposition ?? 'Mapping review');
  const [reviewNote, setReviewNote] = useState('Reviewed source, hash status, linked requirements, and field-map coverage for demo readiness.');
  const [reviewLedger, setReviewLedger] = useState<ReviewRecord[]>([]);
  const selected = sourceRows.find((row) => row.id === selectedId) ?? sourceRows[0];
  const linkedRequirements = selected ? requirementRows.filter((row) => row.sourceId === selected.id) : [];
  const readyRequirements = linkedRequirements.filter((row) => row.readiness.toLowerCase().includes('ready')).length;
  const missingMaps = requirementRows.filter((row) => row.fieldMap.toLowerCase().includes('missing')).length;

  const placeholderSummary = useMemo(
    () => placeholders.reduce<Record<string, number>>((summary, placeholder) => {
      summary[placeholder.disposition] = (summary[placeholder.disposition] ?? 0) + 1;
      return summary;
    }, {}),
    [placeholders],
  );

  function selectSource(row: TemplateSourceRow) {
    setSelectedId(row.id);
    setReviewDisposition(row.disposition);
    setReviewNote('Reviewed source, hash status, linked requirements, and field-map coverage for demo readiness.');
  }

  function stageReview() {
    if (!selected) return;
    setReviewLedger((current) => [
      {
        id: `TPL-${Date.now().toString(36).toUpperCase()}`,
        template: selected.name,
        disposition: reviewDisposition,
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Templates"
        subtitle="Phase 4 registry, field-map, approval, placeholder, and source-hash control"
        actions={
          <>
            <PrototypeActionButton label="Upload Template" icon="upload" kind="upload" description="Stage a template source for registry review without syncing external storage." />
            <PrototypeActionButton label="Create Template" icon="plus" kind="document" variant="primary" description="Create a prototype template requirement and field-map review item." />
          </>
        }
      />

      <StatGrid>
        <StatCard icon={FileText} label="Active Sources" value={stats.active} sub={`${stats.sourceCount} cataloged`} tone="success" />
        <StatCard icon={ShieldCheck} label="Pilot Approved" value={stats.pilotApproved} sub={stats.schemaVersion} tone="primary" />
        <StatCard icon={GitBranch} label="Field Maps" value={stats.completeFieldMaps} sub={`${stats.fieldMapCount} tracked`} tone="info" />
        <StatCard icon={CheckCircle2} label="Hash Verified" value={stats.hashVerified} sub={`${stats.hashMismatched} mismatches`} tone="success" />
        <StatCard icon={Archive} label="Deferred/Future" value={stats.deferredOrFuture} sub="Explicitly visible" tone="warning" />
      </StatGrid>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <DataTable
          keyField="id"
          className="min-h-[640px] min-w-0"
          columns={[
            { key: 'name', label: 'Template Source', render: (row) => <span className="type-medium text-[var(--color-text)]">{row.name}</span> },
            { key: 'fileType', label: 'File' },
            { key: 'registryStatus', label: 'Status', render: (row) => <Badge variant={toneFor(row.registryStatus)}>{row.registryStatus}</Badge> },
            { key: 'approval', label: 'Approval', render: (row) => <Badge variant={toneFor(row.approval)}>{row.approval}</Badge> },
            { key: 'hash', label: 'Hash', render: (row) => <Badge variant={toneFor(row.hash)}>{row.hash}</Badge> },
            { key: 'requirements', label: 'Reqs' },
            { key: 'fieldMaps', label: 'Maps' },
            { key: 'disposition', label: 'Disposition' },
          ]}
          rows={sourceRows}
          empty="No template sources are available."
          emptyDescription="Template registry rows will appear after local template sources are indexed."
          toolbarPrefix={
            <div className="min-w-[240px]">
              <p className="clinical-label">Template Registry</p>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                Generated {stats.generatedAt.slice(0, 10)}
              </p>
            </div>
          }
          toolbarActions={<PrototypeActionButton label="Export" icon="download" kind="export" size="sm" description="Prepare a PHI-free template registry export." />}
          search={{ placeholder: 'Search sources, status, approval, hash, or path...', keys: ['name', 'fileType', 'registryStatus', 'approval', 'hash', 'disposition', 'sourcePath'] }}
          filters={[
            { id: 'fileType', label: 'File Type' },
            { id: 'registryStatus', label: 'Status' },
            { id: 'approval', label: 'Approval' },
            { id: 'hash', label: 'Hash' },
          ]}
          pageSize={12}
          onRowClick={selectSource}
        />

        <Card className="flex min-h-[640px] min-w-0 flex-col">
          {selected ? (
            <div className="flex h-full min-h-0 flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="clinical-label">Selected Source</p>
                  <h2 className="mt-1 line-clamp-2 type-heading text-[var(--color-text)]">{selected.name}</h2>
                  <p className="mt-1 break-all type-supporting text-[var(--color-text-muted)]">{selected.sourcePath}</p>
                </div>
                <Badge variant={toneFor(selected.hash)}>{selected.hash}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Requirements</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">
                    {linkedRequirements.length} linked / {readyRequirements} ready
                  </p>
                </div>
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Field Maps</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">{selected.fieldMaps} mapped</p>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="clinical-label">Linked Requirements</p>
                {linkedRequirements.length ? linkedRequirements.slice(0, 4).map((requirement) => (
                  <div key={requirement.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="type-body text-[var(--color-text)]">{requirement.requirement}</p>
                      <Badge variant={toneFor(requirement.readiness)}>{requirement.readiness}</Badge>
                    </div>
                    <p className="mt-2 type-supporting text-[var(--color-text-muted)]">
                      {requirement.phase} / {requirement.responsible} / {requirement.fieldMap}
                    </p>
                  </div>
                )) : (
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 type-body text-[var(--color-text-muted)]">
                    No active document requirement is linked to this source.
                  </div>
                )}
              </div>

              <div className="mt-auto grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <label className="grid gap-1">
                  <span className="clinical-label">Review Disposition</span>
                  <Select value={reviewDisposition} onChange={(event) => setReviewDisposition(event.target.value)}>
                    <option>Pilot approved</option>
                    <option>Mapping review</option>
                    <option>Deferred</option>
                    <option>Future placeholder</option>
                    <option>Needs hash review</option>
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className="clinical-label">Registry Review Note</span>
                  <Textarea rows={8} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="min-h-[152px] resize-none" />
                </label>
                <div className="flex justify-end">
                  <Button type="button" onClick={stageReview}>
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Stage Review
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="type-body text-[var(--color-text-muted)]">No template source is selected.</div>
          )}
        </Card>
      </div>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <DataTable
          keyField="id"
          className="min-h-[600px] min-w-0"
          columns={[
            { key: 'requirement', label: 'Document Requirement' },
            { key: 'phase', label: 'Phase' },
            { key: 'responsible', label: 'Owner' },
            { key: 'reviewer', label: 'Reviewer' },
            { key: 'applicability', label: 'Applicability' },
            { key: 'fieldMap', label: 'Field Map', render: (row) => <Badge variant={toneFor(row.fieldMap)}>{row.fieldMap}</Badge> },
            { key: 'readiness', label: 'Readiness', render: (row) => <Badge variant={toneFor(row.readiness)}>{row.readiness}</Badge> },
          ]}
          rows={requirementRows}
          empty="No document requirements are available."
          emptyDescription="Requirement rows will appear after the registry metadata source is loaded."
          search={{ placeholder: 'Search requirements, phase, owner, reviewer, applicability, CPT, or readiness...', keys: ['requirement', 'phase', 'responsible', 'reviewer', 'applicability', 'cpt', 'fieldMap', 'readiness'] }}
          filters={[
            { id: 'phase', label: 'Phase' },
            { id: 'responsible', label: 'Owner' },
            { id: 'reviewer', label: 'Reviewer' },
            { id: 'fieldMap', label: 'Field Map' },
            { id: 'readiness', label: 'Readiness' },
          ]}
          pageSize={10}
        />

        <Card className="min-h-[600px] min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Registry Snapshot</p>
              <h2 className="mt-1 type-heading text-[var(--color-text)]">Pilot readiness controls</h2>
            </div>
            <Badge variant="primary">{stats.generatedAt.slice(0, 10)}</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="clinical-muted-surface p-3">
              <p className="clinical-label">Missing Field Maps</p>
              <p className="mt-2 type-body text-[var(--color-text)]">{missingMaps}</p>
            </div>
            {Object.entries(placeholderSummary).map(([disposition, count]) => (
              <div key={disposition} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{disposition}</p>
                  <Badge variant={toneFor(disposition)}>{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Template Review Ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Local staged review decisions</h2>
          </div>
          <Badge variant="info">No external sync</Badge>
        </div>
        <div className="grid gap-2">
          {reviewLedger.length ? reviewLedger.map((record) => (
            <div key={record.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-[150px_minmax(0,1fr)_160px]">
              <span className="type-supporting text-[var(--color-primary)]">{record.id}</span>
              <span className="truncate type-body text-[var(--color-text)]">{record.template}</span>
              <Badge variant={toneFor(record.disposition)}>{record.disposition}</Badge>
            </div>
          )) : (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 type-body text-[var(--color-text-muted)]">
              No template review decisions have been staged in this demo session.
            </div>
          )}
        </div>
      </Card>
    </PageStack>
  );
}
