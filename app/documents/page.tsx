export const dynamic = 'force-dynamic';

import { CheckCircle2, Eye, FileText, LockKeyhole, PenLine, Plus, RefreshCw, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { mapTone } from "@/lib/status-utils";

export default function DocumentsPage() {
  const documents = moduleSnapshot.documents;
  const generated = moduleSnapshot.generatedDocuments;
  const pending = documents.filter((document) => ["READY_FOR_REVIEW", "PENDING"].includes(document.status)).length;
  const signed = documents.filter((document) => document.signedAt).length;
  const uploaded = documents.filter((document) => document.uploadedToEcwAt).length;
  const locked = documents.filter((document) => document.lockedAt).length;
  const documentRows = documents.map(({ patientId, ...document }) => ({
    ...document,
    patientToken: patientLabel(patientId),
    courseToken: document.courseId.replace("COURSE-", "C"),
    lifecycle: document.manualEditExceptionAt
      ? "Manual edit exception"
      : document.voidedAt
        ? "Voided"
        : document.uploadedToEcwAt
          ? "Uploaded to eCW"
          : document.lockedAt
            ? "Locked"
            : document.latestOutputStatus ?? "No output"
  }));

  return (
    <PageStack>
      <PageHeader
        title="Documents"
        subtitle="Document management, signatures, and eCW uploads"
        actions={
          <>
            <Button variant="secondary" disabled><Upload className="h-4 w-4" /> Upload Document</Button>
            <Button disabled><Plus className="h-4 w-4" /> Create from Template</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={FileText} label="Total Documents" value={documents.length} sub="All records" />
        <StatCard icon={Eye} label="Ready for Review" value={pending} sub="Needs check" tone="primary" />
        <StatCard icon={PenLine} label="Pending Signatures" value={generated.filter((document) => document.signReviewState === "READY_FOR_SIGNATURE").length} sub="Signature queue" tone="warning" />
        <StatCard icon={LockKeyhole} label="Locked Evidence" value={locked} sub={`${signed} signed`} tone="success" />
        <StatCard icon={Upload} label="Uploaded/eCW" value={uploaded} sub="External upload" />
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
            <Badge variant="info">{phaseLabel(row.category)}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
          { key: 'version', label: 'Output', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-bold">{`v${row.version}`}</span>
              <Badge variant={row.latestOutputStatus === "VOIDED" ? "error" : row.latestOutputStatus ? "info" : "default"}>
                {row.latestOutputStatus ?? "Pending"}
              </Badge>
            </span>
          )},
          { key: 'storage', label: 'Storage', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <Badge variant={row.storageProvider === "APP_STORAGE" ? "primary" : "default"}>{row.storageProvider}</Badge>
              <span className="truncate text-xs font-semibold text-[var(--color-text-muted)]">{row.storageKey ?? "Pending"}</span>
            </span>
          )},
          { key: 'updated', label: 'Updated', render: (row) => row.renderedAt ?? row.generatedAt ?? "Pending" },
          { key: 'lifecycle', label: 'Lifecycle', render: (row) => (
            <span className="flex min-w-0 flex-col gap-1">
              <Badge variant={row.lockedAt ? "success" : row.manualEditExceptionAt || row.voidedAt ? "warning" : "default"}>
                {row.lifecycle}
              </Badge>
              <span className="truncate text-xs font-semibold text-[var(--color-text-muted)]">
                {row.ecwUploadReference ?? row.manualEditReason ?? row.voidReason ?? "App-owned state"}
              </span>
            </span>
          )},
          { key: 'actions', label: 'Actions', render: () => (
            <span className="flex min-w-0 gap-2">
              <Button size="sm" variant="secondary" disabled><RefreshCw className="h-3.5 w-3.5" /> Render</Button>
              <Button size="sm" variant="ghost" disabled><CheckCircle2 className="h-3.5 w-3.5" /> Sign</Button>
            </span>
          )},
        ]}
        rows={documentRows}
        empty="No documents are available."
        emptyDescription="Generated, signed, and uploaded document records will appear after course document requirements are initialized."
        pageSize={10}
        search={{
          placeholder: 'Search document, patient, course, category, signature, or eCW status...',
          getText: (row) => [
            row.title,
            row.patientToken,
            row.courseId,
            row.category,
            statusLabel(row.status),
            row.signedAt ? 'Signed' : 'Pending',
            row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent',
            row.latestOutputStatus ?? 'No output',
            row.storageProvider,
            row.lifecycle,
          ].join(' '),
        }}
        filters={[
          { id: 'category', label: 'Category' },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabel(row.category) },
          { id: 'signature', label: 'Signature', getValue: (row) => row.signedAt ? 'Signed' : 'Pending' },
          { id: 'ecw', label: 'eCW', getValue: (row) => row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent' },
          { id: 'storage', label: 'Storage', getValue: (row) => row.storageProvider },
          { id: 'lifecycle', label: 'Lifecycle', getValue: (row) => row.lifecycle },
        ]}
      />
    </PageStack>
  );
}
