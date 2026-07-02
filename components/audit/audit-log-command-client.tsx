'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Eye, FileDown, History, ShieldCheck, UserCog } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/workflow';

export type AuditLogRow = {
  id: string;
  timestamp: string;
  userName: string;
  patientRef: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  redacted: boolean;
  reason?: string;
};

type AuditLogCommandClientProps = {
  mode: 'audit' | 'security';
  rows: AuditLogRow[];
};

function titleForMode(mode: AuditLogCommandClientProps['mode']) {
  return mode === 'security' ? 'Security Logs' : 'Audit Logs';
}

function subtitleForMode(mode: AuditLogCommandClientProps['mode']) {
  return mode === 'security'
    ? 'HIPAA-aware security event review, access inspection, and export staging'
    : 'System events, document changes, workflow updates, and administrative action review';
}

function severityFor(row: AuditLogRow): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  const action = row.action.toLowerCase();
  if (row.entityType === 'SYSTEM' || action.includes('void') || action.includes('delete')) return 'error';
  if (action.includes('sign') || action.includes('approve')) return 'warning';
  if (row.redacted) return 'info';
  if (action.includes('seed') || action.includes('create')) return 'success';
  return 'default';
}

function domainFor(row: AuditLogRow) {
  if (row.entityType === 'DOCUMENT') return 'Document';
  if (row.entityType === 'PATIENT' || row.patientRef !== 'System') return 'Patient Course';
  if (row.entityType === 'SYSTEM') return 'System';
  if (row.entityType.includes('FRACTION')) return 'Treatment';
  return row.entityType.replaceAll('_', ' ');
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AuditLogCommandClient({ mode, rows }: AuditLogCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [reviewNote, setReviewNote] = useState('Reviewed for demo audit trail. No PHI values exposed.');
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  const documentEvents = rows.filter((row) => row.entityType === 'DOCUMENT').length;
  const signatureEvents = rows.filter((row) => row.action.toLowerCase().includes('sign')).length;
  const systemEvents = rows.filter((row) => row.entityType === 'SYSTEM').length;
  const redactedEvents = rows.filter((row) => row.redacted || row.previousValue === 'PHI_REDACTED' || row.newValue === 'PHI_REDACTED').length;
  const eventDomains = useMemo(() => Array.from(new Set(rows.map(domainFor))), [rows]);

  function markReviewed() {
    if (!selected) return;
    setReviewedIds((current) => current.includes(selected.id) ? current : [selected.id, ...current].slice(0, 10));
  }

  const toolbarPrefix = (
    <div className="min-w-[240px]">
      <p className="clinical-label">{mode === 'security' ? 'Security Review' : 'Audit Review'}</p>
      <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
        {reviewedIds.length} event(s) reviewed in this demo session
      </p>
    </div>
  );

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title={titleForMode(mode)}
        subtitle={subtitleForMode(mode)}
        actions={
          <PrototypeActionButton
            label="Export Logs"
            icon="download"
            kind="export"
            description={`Prepare a tokenized ${mode === 'security' ? 'security' : 'audit'} event export.`}
          />
        }
      />

      <StatGrid>
        <StatCard icon={History} label="Events" value={rows.length} sub="Redacted stream" tone="primary" />
        <StatCard icon={ShieldCheck} label="Redacted" value={redactedEvents} sub="PHI-safe values" tone="success" />
        <StatCard icon={FileDown} label="Document Events" value={documentEvents} sub="File lifecycle" tone="info" />
        <StatCard icon={UserCog} label="Signatures" value={signatureEvents} sub="Approvals" tone="warning" />
        <StatCard icon={AlertTriangle} label="System Changes" value={systemEvents || 2} sub="Admin-sensitive" tone={systemEvents ? 'error' : 'info'} />
      </StatGrid>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <DataTable
          keyField="id"
          className="min-h-[740px] min-w-0"
          columns={[
            { key: 'timestamp', label: 'Timestamp', render: (row) => formatDateTime(row.timestamp) },
            { key: 'userName', label: 'User', render: (row) => <span className="type-medium text-[var(--color-text)]">{row.userName}</span> },
            { key: 'patientRef', label: 'Patient / Course' },
            { key: 'action', label: 'Action', render: (row) => <Badge variant={severityFor(row)}>{row.action}</Badge> },
            { key: 'domain', label: 'Domain', render: (row) => domainFor(row) },
            { key: 'entityId', label: 'Entity ID' },
            { key: 'redacted', label: 'PHI', render: (row) => <Badge variant={row.redacted ? 'success' : 'default'}>{row.redacted ? 'Redacted' : 'Clear'}</Badge> },
          ]}
          rows={rows}
          empty="No audit events are available."
          emptyDescription="Redacted audit events will appear after workflow, security, or admin actions run."
          toolbarPrefix={toolbarPrefix}
          toolbarActions={
            <PrototypeActionButton
              label="Export"
              icon="download"
              kind="export"
              size="sm"
              description="Prepare the filtered audit event view with PHI-safe values."
            />
          }
          search={{ placeholder: 'Search user, patient, action, entity, or timestamp...', keys: ['timestamp', 'userName', 'patientRef', 'action', 'entityType', 'entityId', 'reason'] }}
          filters={[
            { id: 'userName', label: 'User' },
            { id: 'entityType', label: 'Entity Type' },
            { id: 'action', label: 'Action' },
            { id: 'domain', label: 'Domain', options: eventDomains.map((domain) => ({ label: domain, value: domain })), getValue: domainFor },
          ]}
          pageSize={15}
          onRowClick={(row) => setSelectedId(row.id)}
        />

        <Card className="min-h-[740px] min-w-0">
          {selected ? (
            <div className="grid min-w-0 gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="clinical-label">Selected Event</p>
                  <h2 className="mt-1 truncate type-heading text-[var(--color-text)]">{selected.action}</h2>
                  <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{formatDateTime(selected.timestamp)}</p>
                </div>
                <Badge variant={severityFor(selected)}>{domainFor(selected)}</Badge>
              </div>

              <div className="grid gap-3">
                {[
                  ['Actor', selected.userName],
                  ['Patient / Course', selected.patientRef],
                  ['Entity', `${selected.entityType} / ${selected.entityId}`],
                  ['Reason', selected.reason ?? 'No reason recorded'],
                ].map(([label, value]) => (
                  <div key={label} className="clinical-muted-surface p-3">
                    <p className="clinical-label">{label}</p>
                    <p className="mt-2 break-words type-body text-[var(--color-text)]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="clinical-label">Redaction Preview</p>
                  <Badge variant={selected.redacted ? 'success' : 'default'}>{selected.redacted ? 'PHI Redacted' : 'No PHI Delta'}</Badge>
                </div>
                <div className="grid gap-2 type-body text-[var(--color-text)]">
                  <div className="grid gap-1">
                    <span className="type-supporting uppercase text-[var(--color-text-muted)]">Previous</span>
                    <span className={cn('rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-2', selected.previousValue === 'PHI_REDACTED' ? 'text-[var(--color-success)]' : '')}>
                      {selected.previousValue}
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <span className="type-supporting uppercase text-[var(--color-text-muted)]">New</span>
                    <span className={cn('rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-2', selected.newValue === 'PHI_REDACTED' ? 'text-[var(--color-success)]' : '')}>
                      {selected.newValue}
                    </span>
                  </div>
                </div>
              </div>

              <label className="grid min-w-0 gap-1">
                <span className="clinical-label">Review Note</span>
                <Textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="max-w-full resize-none" />
              </label>

              <div className="flex min-w-0 flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setReviewNote('Reviewed for demo audit trail. No PHI values exposed.')}>
                  Reset Note
                </Button>
                <Button type="button" onClick={markReviewed}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Mark Reviewed
                </Button>
              </div>

              <div className="min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <p className="clinical-label">Reviewed Events</p>
                <p className="mt-2 break-words type-body text-[var(--color-text)]">
                  {reviewedIds.length ? reviewedIds.join(', ') : 'No events reviewed yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="type-body text-[var(--color-text-muted)]">No audit event is selected.</div>
          )}
        </Card>
      </div>

      <Card compact>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Export Boundary</p>
            <p className="mt-1 type-body text-[var(--color-text)]">
              Audit exports are staged with tokenized patient/course references and redacted value deltas.
            </p>
          </div>
          <Button type="button" variant="secondary">
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Prepare Evidence Packet
          </Button>
        </div>
      </Card>
    </PageStack>
  );
}
