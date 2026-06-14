'use client';

import { Eye, FileText, LockKeyhole, PenLine, Upload } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { mapTone } from '@/lib/status-utils';

export type DocumentCommandRow = {
  id: string;
  title: string;
  patientToken: string;
  courseId: string;
  courseToken: string;
  category: string;
  phase: string;
  status: string;
  statusLabel: string;
  statusTone: string;
  version: number;
  latestOutputStatus?: string;
  storageProvider: string;
  storageKey?: string;
  renderedAt?: string;
  generatedAt?: string;
  signedAt?: string;
  uploadedToEcwAt?: string;
  lockedAt?: string;
  manualEditExceptionAt?: string;
  voidedAt?: string;
  ecwUploadReference?: string;
  manualEditReason?: string;
  voidReason?: string;
  lifecycle: string;
};

type DocumentsCommandClientProps = {
  rows: DocumentCommandRow[];
  metrics: {
    total: number;
    pending: number;
    pendingSignatures: number;
    signed: number;
    uploaded: number;
    locked: number;
  };
};

export function DocumentsCommandClient({ rows, metrics }: DocumentsCommandClientProps) {
  return (
    <PageStack>
      <PageHeader
        title="Documents"
        subtitle="Document management, signatures, and eCW uploads"
        actions={
          <>
            <PrototypeActionButton label="Upload Document" icon="upload" kind="upload" description="Stage a course document attachment without retaining uploaded contents in prototype mode." />
            <PrototypeActionButton label="Create from Template" icon="plus" kind="document" variant="primary" description="Queue a generated document from mapped template fields." />
          </>
        }
      />
      <StatGrid>
        <StatCard icon={FileText} label="Total Documents" value={metrics.total} sub="All records" />
        <StatCard icon={Eye} label="Ready for Review" value={metrics.pending} sub="Needs check" tone="primary" />
        <StatCard icon={PenLine} label="Pending Signatures" value={metrics.pendingSignatures} sub="Signature queue" tone="warning" />
        <StatCard icon={LockKeyhole} label="Locked Evidence" value={metrics.locked} sub={`${metrics.signed} signed`} tone="success" />
        <StatCard icon={Upload} label="Uploaded/eCW" value={metrics.uploaded} sub="External upload" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'doc', label: 'Document', render: (row) => (
            <span className="block truncate font-bold text-[var(--color-primary)]">{row.title}</span>
          )},
          { key: 'patientCourse', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{row.patientToken} / {row.courseToken}</span>
          )},
          { key: 'category', label: 'Category', render: (row) => (
            <Badge variant="info">{row.category}</Badge>
          )},
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant="info">{row.phase}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(row.statusTone)}>{row.statusLabel}</Badge>
          )},
          { key: 'version', label: 'Output', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-bold">{`v${row.version}`}</span>
              <Badge variant={row.latestOutputStatus === 'VOIDED' ? 'error' : row.latestOutputStatus ? 'info' : 'default'}>
                {row.latestOutputStatus ?? 'Pending'}
              </Badge>
            </span>
          )},
          { key: 'storage', label: 'Storage', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <Badge variant={row.storageProvider === 'APP_STORAGE' ? 'primary' : 'default'}>{row.storageProvider}</Badge>
              <span className="truncate text-xs font-semibold text-[var(--color-text-muted)]">{row.storageKey ?? 'Pending'}</span>
            </span>
          )},
          { key: 'updated', label: 'Updated', render: (row) => row.renderedAt ?? row.generatedAt ?? 'Pending' },
          { key: 'lifecycle', label: 'Lifecycle', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <Badge variant={row.lockedAt ? 'success' : row.manualEditExceptionAt || row.voidedAt ? 'warning' : 'default'}>
                {row.lifecycle}
              </Badge>
              <span className="truncate text-xs font-semibold text-[var(--color-text-muted)]">
                {row.ecwUploadReference ?? row.manualEditReason ?? row.voidReason ?? 'App-owned state'}
              </span>
            </span>
          )},
          { key: 'actions', label: 'Actions', render: () => (
            <span className="flex min-w-0 gap-2">
              <PrototypeActionButton label="Render" icon="refresh" kind="document" size="sm" description="Render a simulated document output for this demo row." />
              <PrototypeActionButton label="Sign" icon="check" kind="review" size="sm" variant="ghost" description="Record a simulated signature review action." />
            </span>
          )},
        ]}
        rows={rows}
        empty="No documents are available."
        emptyDescription="Generated, signed, and uploaded document records will appear after course document requirements are initialized."
        pageSize={17}
        search={{
          placeholder: 'Search document, patient, course, category, signature, or eCW status...',
          getText: (row) => [
            row.title,
            row.patientToken,
            row.courseId,
            row.category,
            row.statusLabel,
            row.signedAt ? 'Signed' : 'Pending',
            row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent',
            row.latestOutputStatus ?? 'No output',
            row.storageProvider,
            row.lifecycle,
          ].join(' '),
        }}
        filters={[
          { id: 'category', label: 'Category' },
          { id: 'status', label: 'Status', getValue: (row) => row.statusLabel },
          { id: 'phase', label: 'Phase', getValue: (row) => row.phase },
          { id: 'signature', label: 'Signature', getValue: (row) => row.signedAt ? 'Signed' : 'Pending' },
          { id: 'ecw', label: 'eCW', getValue: (row) => row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent' },
          { id: 'storage', label: 'Storage', getValue: (row) => row.storageProvider },
          { id: 'lifecycle', label: 'Lifecycle', getValue: (row) => row.lifecycle },
        ]}
      />
    </PageStack>
  );
}
