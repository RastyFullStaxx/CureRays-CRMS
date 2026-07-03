'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, FolderKanban, History, PenLine, ShieldCheck, WalletCards } from 'lucide-react';
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
import { statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';

export type BillingCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  code: string;
  description: string;
  planned: number;
  completed: number;
  billed: number;
  status: string;
  linkedDoc: string;
  linkedDocTitle: string;
  documentStatus: string;
  fractions: number;
  auditStatus: string;
  notes: string;
};

type BillingCommandClientProps = {
  rows: BillingCommandRow[];
  stats: {
    total: number;
    ready: number;
    review: number;
    billed: number;
    blocked: number;
  };
};

type BillingLedgerEntry = {
  id: string;
  code: string;
  action: string;
  note: string;
};

function quantityProgress(row: BillingCommandRow) {
  if (!row.planned) return 0;
  return Math.min(100, Math.round((row.completed / row.planned) * 100));
}

export function BillingCommandClient({ rows, stats }: BillingCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [billingAction, setBillingAction] = useState('Billing evidence reviewed');
  const [note, setNote] = useState('Demo billing note: checked linked document, fraction evidence, and audit readiness.');
  const [ledger, setLedger] = useState<BillingLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  const documentationGaps = rows.filter((row) => row.linkedDoc === 'Pending' || ['BLOCKED', 'MISSING_FIELDS', 'PENDING'].includes(row.documentStatus)).length;
  const quantityGaps = rows.filter((row) => row.completed < row.planned).length;

  function stageBillingAction() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `BILL-ACT-${Date.now().toString(36).toUpperCase()}`,
        code: selected.code,
        action: billingAction,
        note: note.trim() || 'No PHI-free billing note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Billing / Coding"
        subtitle="Evidence-first billing readiness, charge review, and closeout handoff"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Billing Report"
              icon="wallet"
              kind="export"
              description="Prepare a tokenized billing readiness report."
            />
            <PrototypeActionButton
              label="Add Billing Item"
              icon="wallet"
              kind="create"
              variant="primary"
              description="Stage a billing item linked to document and fraction evidence."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={WalletCards} label="Total Items" value={stats.total} sub="All billing items" />
        <StatCard icon={FileText} label="Ready Review" value={stats.ready} sub="Documentation queue" tone="intermediate" />
        <StatCard icon={History} label="Under Review" value={stats.review} sub="Pending checks" tone="intermediate" />
        <StatCard icon={CheckCircle2} label="Billed" value={stats.billed} sub="Completed" tone="positive" />
        <StatCard icon={ShieldCheck} label="Audit Issues" value={stats.blocked} sub="Needs remediation" tone="negative" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[540px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'code',
            label: 'Code',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 type-body text-[var(--color-primary)]">
                  {row.code}
                  {row.id === selected?.id ? <Badge variant="neutral">Selected</Badge> : null}
                </span>
                <span className="type-supporting text-[var(--color-text-muted)]">{row.course}</span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'description', label: 'Description' },
          { key: 'planned', label: 'Planned' },
          { key: 'completed', label: 'Completed' },
          { key: 'billed', label: 'Billed' },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{formatUiLabel(row.status)}</Badge> },
          { key: 'linkedDocTitle', label: 'Evidence Document' },
          { key: 'auditStatus', label: 'Audit' },
        ]}
        rows={rows}
        empty="No billing items are available."
        emptyDescription="Billing evidence rows will appear after course charges or fraction evidence are generated."
        pageSize={10}
        search={{
          placeholder: 'Search code, patient token, course, document, status, or billing note...',
          keys: ['code', 'description', 'patient', 'patientRef', 'course', 'linkedDoc', 'linkedDocTitle', 'status', 'auditStatus', 'notes'],
        }}
        filters={[
          { id: 'code', label: 'Code' },
          { id: 'status', label: 'Status' },
          { id: 'documentStatus', label: 'Document' },
          { id: 'auditStatus', label: 'Audit' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Billing Item</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">
              {selected ? `${selected.code} evidence review` : 'Select a billing item'}
            </h2>
            {selected ? (
              <p className="mt-1 type-body text-[var(--color-text-muted)]">
                {selected.patient} / {selected.course} / {selected.description}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={statusTone(selected.status)}>{formatUiLabel(selected.status)}</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Quantity</p>
                <p className="mt-1 type-body text-[var(--color-text)]">
                  {selected.completed}/{selected.planned} complete
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${quantityProgress(selected)}%` }} />
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Document Evidence</p>
                <p className="mt-1 line-clamp-2 type-body text-[var(--color-text)]">{selected.linkedDocTitle}</p>
                <Badge variant={statusTone(selected.documentStatus)}>{formatUiLabel(selected.documentStatus)}</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Fractions</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.fractions} logged</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">Treatment evidence</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Closeout</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.auditStatus}</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{selected.notes}</p>
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
                <Link href={`/patients/${selected.patientId}/documents`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FileText size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}?tab=fractions`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <History size={14} />
                    Fractions
                  </Button>
                </Link>
                <Link href="/audit">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <ShieldCheck size={14} />
                    Audit
                  </Button>
                </Link>
              </div>
              <Select value={billingAction} onChange={(event) => setBillingAction(event.target.value)} aria-label="Billing Action">
                <option>Billing evidence reviewed</option>
                <option>Document follow-up assigned</option>
                <option>Charge quantity checked</option>
                <option>Ready for billing packet</option>
                <option>Closeout blocker staged</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free billing review note."
              />
              <Button type="button" size="sm" onClick={stageBillingAction}>
                <PenLine size={14} />
                Stage billing update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Billing Ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Staged Billing Decisions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={documentationGaps ? 'intermediate' : 'positive'}>{documentationGaps} documentation gaps</Badge>
            <Badge variant={quantityGaps ? 'intermediate' : 'positive'}>{quantityGaps} quantity gaps</Badge>
            <Badge variant={ledger.length ? 'neutral' : 'neutral'}>{ledger.length} staged</Badge>
          </div>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{entry.code}</p>
                  <Badge variant="neutral">{entry.action}</Badge>
                </div>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 type-body text-[var(--color-text-muted)]">
            Select a billing item above and stage a PHI-free decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
