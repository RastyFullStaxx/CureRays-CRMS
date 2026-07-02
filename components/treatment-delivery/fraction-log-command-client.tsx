'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, FileSpreadsheet, ShieldCheck } from 'lucide-react';
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
import { TreatmentDeliveryTabs } from '@/components/treatment-delivery/treatment-delivery-tabs';
import type { FractionLogRegistryRow } from '@/lib/services/fraction-log-registry-service';
import { formatUiLabel } from '@/lib/ui-copy';
import { formatDate } from '@/lib/workflow';

type StagedFractionReview = {
  id: string;
  row: string;
  disposition: string;
  note: string;
};

type FractionLogCommandClientProps = {
  rows: FractionLogRegistryRow[];
};

function toneFor(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('approved') || normalized.includes('signed') || normalized.includes('exported') || normalized.includes('completed') || normalized.includes('clear')) return 'positive' as const;
  if (normalized.includes('revision') || normalized.includes('missing') || normalized.includes('void')) return 'negative' as const;
  if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('approval') || normalized.includes('calculation')) return 'intermediate' as const;
  return 'neutral' as const;
}

function approvalBadge(state: string) {
  return <Badge variant={toneFor(state)}>{formatUiLabel(state)}</Badge>;
}

export function FractionLogCommandClient({ rows }: FractionLogCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [disposition, setDisposition] = useState('Ready for MD/DOT review');
  const [note, setNote] = useState('Reviewed fraction row, approvals, document status, cumulative dose, and worksheet link.');
  const [ledger, setLedger] = useState<StagedFractionReview[]>([]);

  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];
  const reviewNeeded = rows.filter((row) => row.review !== 'Clear').length;
  const approved = rows.filter((row) => row.status === 'APPROVED').length;
  const documentReady = rows.filter((row) => row.document === 'READY_FOR_REVIEW' || row.document === 'SIGNED' || row.document === 'EXPORTED').length;
  const revisionRows = rows.filter((row) => row.review === 'Revision').length;
  const courseSummary = useMemo(
    () => rows.reduce<Record<string, { total: number; review: number; approved: number }>>((summary, row) => {
      const current = summary[row.courseRef] ?? { total: 0, review: 0, approved: 0 };
      current.total += 1;
      current.review += row.review === 'Clear' ? 0 : 1;
      current.approved += row.status === 'APPROVED' ? 1 : 0;
      summary[row.courseRef] = current;
      return summary;
    }, {}),
    [rows],
  );

  function selectRow(row: FractionLogRegistryRow) {
    setSelectedId(row.id);
    setDisposition(row.review === 'Clear' ? 'Ready for closeout evidence' : `Needs ${row.review.toLowerCase()} review`);
    setNote(`Reviewed ${row.courseRef} Fx ${row.fractionNumber}: ${row.review} / ${formatUiLabel(row.status)}.`);
  }

  function stageReview() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `FXR-${Date.now().toString(36).toUpperCase()}`,
        row: `${selected.courseRef} Fx ${selected.fractionNumber}`,
        disposition,
        note,
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <>
      <PageHeader
        title="Treatment Delivery"
        subtitle="Fraction log registry, approval queue, document readiness, and worksheet access"
        actions={
          <>
            <PrototypeActionButton label="Export Fraction Registry" icon="download" kind="export" description="Prepare a tokenized fraction registry export for treatment delivery review." />
            <PrototypeActionButton label="Record Treatment" icon="plus" kind="review" variant="primary" description="Stage a treatment event or open a patient workspace Fractions tab for worksheet entry." />
          </>
        }
      />
      <TreatmentDeliveryTabs active="fraction-logs" />

      <StatGrid>
        <StatCard icon={FileSpreadsheet} label="Active Rows" value={rows.length} tone="neutral" />
        <StatCard icon={AlertTriangle} label="Review" value={reviewNeeded} tone={reviewNeeded > 0 ? 'intermediate' : 'positive'} />
        <StatCard icon={CheckCircle2} label="Approved" value={approved} tone="positive" />
        <StatCard icon={ClipboardCheck} label="Documents" value={documentReady} tone="neutral" />
        <StatCard icon={ShieldCheck} label="Revisions" value={revisionRows} tone={revisionRows > 0 ? 'negative' : 'positive'} />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <DataTable
          keyField="id"
          className="min-h-[600px]"
          columns={[
            {
              key: 'patientRef',
              label: 'Patient Ref',
              render: (row) => <span className="type-medium text-[var(--color-text)]">{row.patientRef}</span>,
            },
            {
              key: 'courseRef',
              label: 'Course Ref',
              render: (row) => <span className="type-medium text-[var(--color-primary)]">{row.courseRef}</span>,
            },
            {
              key: 'fractionNumber',
              label: 'Fx',
              width: '72px',
              render: (row) => <span className="type-medium">Fx {row.fractionNumber}</span>,
            },
            { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
            { key: 'phase', label: 'Phase' },
            { key: 'doseCgy', label: 'Dose', render: (row) => `${row.doseCgy.toLocaleString()} cGy` },
            { key: 'cumulativeDoseCgy', label: 'Cumulative', render: (row) => `${row.cumulativeDoseCgy.toLocaleString()} cGy` },
            { key: 'dotApprovalState', label: 'DOT', render: (row) => approvalBadge(row.dotApprovalState) },
            { key: 'mdApprovalState', label: 'MD', render: (row) => approvalBadge(row.mdApprovalState) },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <Badge variant={toneFor(row.status)}>{formatUiLabel(row.status)}</Badge>,
            },
            {
              key: 'document',
              label: 'Document',
              render: (row) => <Badge variant={toneFor(row.document)}>{formatUiLabel(row.document)}</Badge>,
            },
          ]}
          rows={rows}
          pageSize={12}
          empty="No active fraction rows."
          emptyDescription="Active on-treatment fraction worksheet rows will appear here after treatment entry."
          search={{
            placeholder: 'Search patient ref, course ref, fraction, tech, status...',
            getText: (row) => [
              row.patientRef,
              row.courseRef,
              row.fractionNumber,
              row.phase,
              row.technicianInitials,
              row.review,
              row.status,
              row.document,
            ].join(' '),
          }}
          filters={[
            { id: 'review', label: 'Review', getValue: (row) => row.review },
            { id: 'status', label: 'Status', getValue: (row) => formatUiLabel(row.status) },
            { id: 'courseRef', label: 'Course', getValue: (row) => row.courseRef },
            { id: 'document', label: 'Document', getValue: (row) => formatUiLabel(row.document) },
          ]}
          toolbarPrefix={
            <Badge variant={reviewNeeded > 0 ? 'intermediate' : 'positive'}>
              {reviewNeeded} Review
            </Badge>
          }
          toolbarActions={<PrototypeActionButton label="Batch Review" icon="check" kind="review" size="sm" description="Stage approval review for selected fraction registry rows." />}
          onRowClick={selectRow}
        />

        <Card className="min-h-0">
          {selected ? (
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="clinical-label">Selected Fraction</p>
                  <h2 className="mt-1 type-heading text-[var(--color-text)]">
                    {selected.courseRef} / Fx {selected.fractionNumber}
                  </h2>
                  <p className="mt-1 type-body text-[var(--color-text-muted)]">
                    {selected.patientRef} / {formatDate(selected.date)} / {selected.phase}
                  </p>
                </div>
                <Badge variant={toneFor(selected.review)}>{selected.review}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Delivered Dose</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">{selected.doseCgy.toLocaleString()} cGy</p>
                </div>
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">Cumulative</p>
                  <p className="mt-2 type-body text-[var(--color-text)]">{selected.cumulativeDoseCgy.toLocaleString()} cGy</p>
                </div>
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">DOT</p>
                  {approvalBadge(selected.dotApprovalState)}
                </div>
                <div className="clinical-muted-surface p-3">
                  <p className="clinical-label">MD</p>
                  {approvalBadge(selected.mdApprovalState)}
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="clinical-label">Document Evidence</p>
                  <Badge variant={toneFor(selected.document)}>{formatUiLabel(selected.document)}</Badge>
                </div>
                <p className="mt-2 type-body text-[var(--color-text-muted)]">
                  Technician {selected.technicianInitials || 'not recorded'} / status {formatUiLabel(selected.status)}
                </p>
              </div>

              <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <label className="grid gap-1">
                  <span className="clinical-label">Review Disposition</span>
                  <Select value={disposition} onChange={(event) => setDisposition(event.target.value)}>
                    <option>Ready for MD/DOT review</option>
                    <option>Needs revision</option>
                    <option>Calculation review required</option>
                    <option>Ready for closeout evidence</option>
                    <option>Document render required</option>
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className="clinical-label">Fraction Review Note</span>
                  <Textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
                </label>
                <div className="flex flex-wrap justify-end gap-2">
                  <Link href={selected.href}>
                    <Button type="button" variant="secondary" className="clinical-action">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open Worksheet
                    </Button>
                  </Link>
                  <Button type="button" className="clinical-action-lg" onClick={stageReview}>
                    Stage Review
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="type-body text-[var(--color-text-muted)]">No fraction row is selected.</div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Course Rollup</p>
              <h2 className="mt-1 type-heading text-[var(--color-text)]">On-Treatment Worksheet Coverage</h2>
            </div>
            <Badge variant="neutral">{Object.keys(courseSummary).length} courses</Badge>
          </div>
          <div className="grid gap-2">
            {Object.entries(courseSummary).map(([courseRef, summary]) => (
              <div key={courseRef} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{courseRef}</p>
                  <Badge variant={summary.review > 0 ? 'intermediate' : 'positive'}>{summary.review} review</Badge>
                </div>
                <p className="mt-2 type-label text-[var(--color-text-muted)]">
                  {summary.approved}/{summary.total} approved rows
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Fraction Review Ledger</p>
              <h2 className="mt-1 type-heading text-[var(--color-text)]">Local Staged Registry Decisions</h2>
            </div>
            <Badge variant="neutral">No External Sync</Badge>
          </div>
          <div className="grid gap-2">
            {ledger.length ? ledger.map((record) => (
              <div key={record.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-[140px_150px_190px_minmax(0,1fr)]">
                <span className="type-supporting text-[var(--color-text-muted)]">{record.id}</span>
                <span className="type-body text-[var(--color-text)]">{record.row}</span>
                <Badge variant={toneFor(record.disposition)}>{record.disposition}</Badge>
                <span className="truncate type-body text-[var(--color-text-muted)]">{record.note}</span>
              </div>
            )) : (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 type-body text-[var(--color-text-muted)]">
                No fraction registry decisions have been staged in this demo session.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
