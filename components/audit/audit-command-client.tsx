'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FolderKanban,
  History,
  PenLine,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
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
import { phaseTone, statusTone } from '@/lib/status-utils';

export type AuditCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  diagnosis: string;
  phase: string;
  status: string;
  readiness: string;
  readinessPct: number;
  requiredChecks: number;
  openChecks: number;
  blockedChecks: number;
  missingDocuments: number;
  unsignedDocuments: number;
  billingOpen: number;
  fractionGaps: number;
  openTasks: number;
  followUp: string;
  nextAction: string;
  flags: string[];
};

type AuditCommandClientProps = {
  rows: AuditCommandRow[];
  stats: {
    total: number;
    closeoutQueue: number;
    blockedChecks: number;
    missingDocuments: number;
    unsignedDocuments: number;
    billingOpen: number;
    averageReadiness: number;
  };
};

type AuditLedgerEntry = {
  id: string;
  course: string;
  action: string;
  note: string;
};

function scoreTone(value: number): 'success' | 'warning' | 'error' | 'info' {
  if (value >= 86) return 'success';
  if (value >= 72) return 'info';
  if (value >= 58) return 'warning';
  return 'error';
}

function evidenceTone(count: number): 'success' | 'warning' {
  return count > 0 ? 'warning' : 'success';
}

export function AuditCommandClient({ rows, stats }: AuditCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [auditAction, setAuditAction] = useState('Closeout readiness reviewed');
  const [note, setNote] = useState('Demo audit note: checked documents, signatures, billing evidence, fractions, and follow-up tasks.');
  const [ledger, setLedger] = useState<AuditLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  function stageAuditDecision() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `AUDIT-ACT-${Date.now().toString(36).toUpperCase()}`,
        course: selected.course,
        action: auditAction,
        note: note.trim() || 'No PHI-free audit note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Audit"
        subtitle="Closeout readiness, blockers, and compliance checks"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Audit Report"
              icon="upload"
              kind="export"
              description="Prepare a tokenized audit packet for closeout review."
            />
            <PrototypeActionButton
              label="Run Audit Check"
              icon="play"
              kind="review"
              variant="primary"
              description="Run a simulated closeout readiness check against the visible course rows."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={ShieldCheck} label="Audit Rows" value={stats.total} sub="Course closeout review" />
        <StatCard icon={ClipboardCheck} label="Closeout Queue" value={stats.closeoutQueue} sub="Audit/post treatment" tone="info" />
        <StatCard icon={AlertTriangle} label="Blocked Checks" value={stats.blockedChecks} sub="Needs remediation" tone="error" />
        <StatCard icon={FileText} label="Doc Gaps" value={stats.missingDocuments} sub="Missing evidence" tone="warning" />
        <StatCard icon={PenLine} label="Signatures" value={stats.unsignedDocuments} sub="Provider queue" tone="warning" />
        <StatCard icon={CheckCircle2} label="Avg Readiness" value={`${stats.averageReadiness}%`} sub="Evidence score" tone="success" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'course',
            label: 'Course',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                  {row.course}
                  {row.id === selected?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{row.patientRef}</span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{row.phase}</Badge> },
          {
            key: 'readinessPct',
            label: 'Readiness',
            render: (row) => (
              <div className="min-w-[140px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[var(--color-text)]">{row.readinessPct}%</span>
                  <Badge variant={scoreTone(row.readinessPct)}>{row.readiness}</Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${row.readinessPct}%` }} />
                </div>
              </div>
            ),
          },
          { key: 'openChecks', label: 'Open Checks' },
          { key: 'missingDocuments', label: 'Missing Docs' },
          { key: 'unsignedDocuments', label: 'Unsigned' },
          { key: 'billingOpen', label: 'Billing' },
          { key: 'followUp', label: 'Follow-up' },
        ]}
        rows={rows}
        empty="No courses are available for audit."
        emptyDescription="Audit readiness rows will appear after treatment courses are initialized."
        pageSize={10}
        search={{
          placeholder: 'Search course, patient token, diagnosis, blocker, document, or next action...',
          keys: ['course', 'patient', 'patientRef', 'diagnosis', 'phase', 'status', 'readiness', 'followUp', 'nextAction', 'flags'],
        }}
        filters={[
          { id: 'readiness', label: 'Readiness' },
          { id: 'phase', label: 'Phase' },
          { id: 'status', label: 'Status' },
          { id: 'followUp', label: 'Follow-up' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Audit Review</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
              {selected ? `${selected.course} closeout evidence` : 'Select a course'}
            </h2>
            {selected ? (
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {selected.patient} / {selected.diagnosis} / {selected.nextAction}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={scoreTone(selected.readinessPct)}>{selected.readinessPct}% ready</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Checklist</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                  {selected.requiredChecks - selected.openChecks}/{selected.requiredChecks} complete
                </p>
                <Badge variant={selected.blockedChecks ? 'error' : evidenceTone(selected.openChecks)}>
                  {selected.blockedChecks} blocked
                </Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Documents</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.missingDocuments} missing</p>
                <Badge variant={evidenceTone(selected.unsignedDocuments)}>{selected.unsignedDocuments} unsigned</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Billing</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.billingOpen} open</p>
                <Badge variant={evidenceTone(selected.billingOpen)}>Closeout evidence</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Treatment</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.fractionGaps} fraction gaps</p>
                <Badge variant={evidenceTone(selected.fractionGaps)}>Fraction log</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Tasks</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.openTasks} open</p>
                <Badge variant={statusTone(selected.followUp)}>{selected.followUp}</Badge>
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
                <Link href={`/patients/${selected.patientId}?tab=fractions`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <History size={14} />
                    Fractions
                  </Button>
                </Link>
                <Link href="/billing">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <WalletCards size={14} />
                    Billing
                  </Button>
                </Link>
                <Link href="/security-logs">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <ShieldCheck size={14} />
                    Security Logs
                  </Button>
                </Link>
              </div>
              <Select value={auditAction} onChange={(event) => setAuditAction(event.target.value)} aria-label="Audit action">
                <option>Closeout readiness reviewed</option>
                <option>Document follow-up assigned</option>
                <option>Billing evidence reviewed</option>
                <option>Carepath audit sign staged</option>
                <option>Follow-up closeout staged</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free audit review note."
              />
              <Button type="button" size="sm" onClick={stageAuditDecision}>
                <PenLine size={14} />
                Stage audit decision
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Audit Ledger</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Local staged closeout decisions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={stats.blockedChecks ? 'warning' : 'success'}>{stats.blockedChecks} blocked checks</Badge>
            <Badge variant={stats.billingOpen ? 'warning' : 'success'}>{stats.billingOpen} billing open</Badge>
            <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} staged</Badge>
          </div>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.course}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">
            Select a course above and stage a PHI-free closeout decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
