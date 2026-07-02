'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileText, FolderKanban, NotebookTabs, PenLine, RefreshCw, Route } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { phaseTone, statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';

export type ClinicalFormCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  title: string;
  formType: string;
  phase: string;
  status: string;
  rawStatus: string;
  lastUpdated: string;
  assignedStaff: string;
  requiredAction: string;
  signReviewState: string;
  auditReady: boolean;
  mappedFields: number;
  missingFields: number;
  route: string;
};

type ClinicalFormsCommandClientProps = {
  rows: ClinicalFormCommandRow[];
  handJointRows: string[];
  stats: {
    drafts: number;
    review: number;
    signed: number;
    missingFields: number;
    total: number;
  };
};

type FormLedgerEntry = {
  id: string;
  title: string;
  action: string;
  note: string;
};

function readinessLabel(row: ClinicalFormCommandRow) {
  if (row.missingFields > 0) return 'Needs fields';
  if (row.signReviewState !== 'SIGNED') return 'Needs signature';
  if (!row.auditReady) return 'Audit review';
  return 'Ready';
}

export function ClinicalFormsCommandClient({ rows, handJointRows, stats }: ClinicalFormsCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [formAction, setFormAction] = useState('Mapped field review staged');
  const [note, setNote] = useState('Demo form note: checked mapped fields, signature state, and document regeneration readiness.');
  const [ledger, setLedger] = useState<FormLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  function stageFormDecision() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `FORM-ACT-${Date.now().toString(36).toUpperCase()}`,
        title: selected.title,
        action: formAction,
        note: note.trim() || 'No PHI-free clinical form note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Clinical Forms"
        subtitle="Structured documentation review, field mapping, and regeneration readiness"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Form Worklist"
              icon="download"
              kind="export"
              description="Prepare a tokenized clinical form worklist for review."
            />
            <PrototypeActionButton
              label="New Clinical Form"
              icon="plus"
              kind="create"
              variant="primary"
              description="Stage a structured clinical form from the active template registry."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={NotebookTabs} label="Drafts" value={stats.drafts} sub="Structured forms" />
        <StatCard icon={PenLine} label="Ready Review" value={stats.review} sub="Provider queue" tone="intermediate" />
        <StatCard icon={CheckCircle2} label="Signed" value={stats.signed} sub="Completed" tone="positive" />
        <StatCard icon={FileText} label="Field Gaps" value={stats.missingFields} sub="Need completion" tone="negative" />
        <StatCard icon={RefreshCw} label="Documents" value={stats.total} sub="Editable through fields" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'title',
            label: 'Document Name',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 type-body text-[var(--color-primary)]">
                  {row.title}
                  {row.id === selected?.id ? <Badge variant="neutral">Selected</Badge> : null}
                </span>
                <span className="type-supporting text-[var(--color-text-muted)]">{row.course}</span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'patientRef', label: 'Patient Ref' },
          { key: 'formType', label: 'Form Type' },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{row.phase}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.rawStatus)}>{row.status}</Badge> },
          { key: 'missingFields', label: 'Missing Fields' },
          { key: 'assignedStaff', label: 'Reviewer' },
          { key: 'lastUpdated', label: 'Last Updated' },
        ]}
        rows={rows}
        empty="No clinical forms are available."
        emptyDescription="Structured forms will appear after document instances are generated."
        pageSize={10}
        search={{
          placeholder: 'Search form, document, patient token, status, reviewer, or required action...',
          keys: ['title', 'patient', 'patientRef', 'formType', 'phase', 'status', 'assignedStaff', 'requiredAction', 'route'],
        }}
        filters={[
          { id: 'formType', label: 'Form Type' },
          { id: 'status', label: 'Status' },
          { id: 'phase', label: 'Phase' },
          { id: 'assignedStaff', label: 'Reviewer' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Form Review</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">
              {selected ? selected.title : 'Select a form'}
            </h2>
            {selected ? (
              <p className="mt-1 type-body text-[var(--color-text-muted)]">
                {selected.patient} / {selected.phase} / {selected.requiredAction}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={statusTone(selected.rawStatus)}>{readinessLabel(selected)}</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Mapped Fields</p>
                <p className="mt-1 type-body text-[var(--color-text)]">
                  {selected.mappedFields - selected.missingFields}/{selected.mappedFields} ready
                </p>
                <Badge variant={selected.missingFields ? 'intermediate' : 'positive'}>{selected.missingFields} missing</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Signature</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{formatUiLabel(selected.signReviewState)}</p>
                <Badge variant={selected.signReviewState === 'SIGNED' ? 'positive' : 'intermediate'}>Provider review</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Regeneration</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.auditReady ? 'Audit ready' : 'Review first'}</p>
                <Badge variant={selected.auditReady ? 'positive' : 'neutral'}>{selected.formType}</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Workflow Route</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.route}</p>
                <Badge variant="neutral">Structured form</Badge>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href={`/patients/${selected.patientId}`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FolderKanban size={14} />
                    Workspace
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}/carepath`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <ClipboardCheck size={14} />
                    Carepath
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}/documents`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FileText size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <Route size={14} />
                    Templates
                  </Button>
                </Link>
              </div>
              <Select value={formAction} onChange={(event) => setFormAction(event.target.value)} aria-label="Clinical Form Action">
                <option>Mapped field review staged</option>
                <option>Missing fields assigned</option>
                <option>Provider signature requested</option>
                <option>Document regeneration staged</option>
                <option>Template mapping reviewed</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free clinical form review note."
              />
              <Button type="button" size="sm" onClick={stageFormDecision}>
                <PenLine size={14} />
                Stage form update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
          <p className="clinical-label">Structured Field Editor</p>
          <h2 className="mt-1 type-heading text-[var(--color-text)]">Mapped Values Before Regeneration</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Patient token', 'Date of service', 'Laterality', 'Exam type', 'Performed by', 'Narrative note'].map((field, index) => (
              <label key={field} className={index === 5 ? 'sm:col-span-2' : ''}>
                <span className="clinical-label">{field}</span>
                <span className="mt-1 block rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 type-supporting text-[var(--color-text)]">
                  {selected
                    ? index === 0
                      ? selected.patientRef
                      : index === 5
                        ? selected.requiredAction
                        : 'Mapped field value'
                    : 'Select a form'}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
          <p className="clinical-label">Hand Joint X-ray Data Table</p>
          <h2 className="mt-1 type-heading text-[var(--color-text)]">Structured Mapping Capture</h2>
          <ScrollArea axis="x" className="mt-3">
            <table className="min-w-[620px] w-full type-supporting">
              <thead>
                <tr className="border-b border-[var(--color-border-soft)]">
                  <th className="px-2 py-1.5 text-left type-medium text-[var(--color-text-muted)]">Zone</th>
                  <th className="px-2 py-1.5 text-left type-medium text-[var(--color-text-muted)]">JS Narrowing</th>
                  <th className="px-2 py-1.5 text-left type-medium text-[var(--color-text-muted)]">Osteophytes</th>
                  <th className="px-2 py-1.5 text-left type-medium text-[var(--color-text-muted)]">Sclerosis</th>
                  <th className="px-2 py-1.5 text-left type-medium text-[var(--color-text-muted)]">Decision</th>
                </tr>
              </thead>
              <tbody>
                {handJointRows.map((zone, index) => (
                  <tr key={zone} className="border-b border-[var(--color-border-soft)]">
                    <td className="px-2 py-1.5 type-medium text-[var(--color-text)]">{zone}</td>
                    <td className="px-2 py-1.5 text-[var(--color-text-muted)]">{index % 3 === 0 ? 'Mild' : 'Mapped'}</td>
                    <td className="px-2 py-1.5 text-[var(--color-text-muted)]">{index % 2 === 0 ? 'Present' : 'None'}</td>
                    <td className="px-2 py-1.5 text-[var(--color-text-muted)]">{index % 4 === 0 ? 'Review' : 'None'}</td>
                    <td className="px-2 py-1.5 text-[var(--color-text-muted)]">{index % 5 === 0 ? 'Provider review' : 'Included'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </section>
      </div>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Form Ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Local Staged Form Decisions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={stats.missingFields ? 'intermediate' : 'positive'}>{stats.missingFields} field gaps</Badge>
            <Badge variant={ledger.length ? 'neutral' : 'neutral'}>{ledger.length} staged</Badge>
          </div>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{entry.title}</p>
                  <Badge variant="neutral">{entry.action}</Badge>
                </div>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 type-body text-[var(--color-text-muted)]">
            Select a form above and stage a PHI-free structured documentation decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
