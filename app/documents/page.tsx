'use client';
import { CheckCircle2, Eye, FileCheck2, FileText, PenLine, Plus, RefreshCw, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";
import { mapTone } from "@/lib/status-utils";

export default function DocumentsPage() {
  const documents = moduleSnapshot.documents;
  const generated = moduleSnapshot.generatedDocuments;
  const pending = documents.filter((document) => ["READY_FOR_REVIEW", "PENDING"].includes(document.status)).length;
  const signed = documents.filter((document) => document.signedAt).length;
  const uploaded = documents.filter((document) => document.uploadedToEcwAt).length;

  return (
    <PageStack>
      <PageHeader
        title="Documents"
        subtitle="Document management, signatures, and eCW uploads"
        actions={
          <>
            <Button variant="secondary" disabled title="Prototype placeholder"><Upload className="h-4 w-4" /> Upload Document</Button>
            <Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> Create from Template</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={FileText} label="Total Documents" value={documents.length} sub="All records" />
        <StatCard icon={Eye} label="Ready for Review" value={pending} sub="Needs check" tone="primary" />
        <StatCard icon={PenLine} label="Pending Signatures" value={generated.filter((document) => document.signReviewState === "READY_FOR_SIGNATURE").length} sub="Signature queue" tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed/Signed" value={signed} sub="Locked evidence" tone="success" />
        <StatCard icon={Upload} label="Uploaded/eCW" value={uploaded} sub="External upload" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'doc', label: 'Document', render: (row) => (
            <span className="block truncate font-bold text-[var(--color-primary)]">{row.title}</span>
          )},
          { key: 'patientCourse', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)} / {row.courseId.replace("COURSE-", "C")}</span>
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
          { key: 'version', label: 'Version', render: (row) => `v${row.version}` },
          { key: 'updated', label: 'Updated', render: (row) => row.generatedAt ?? "Pending" },
          { key: 'signature', label: 'Signature', render: (row) => (
            row.signedAt ? <Badge variant="success">Signed</Badge> : <Badge variant="warning">Pending</Badge>
          )},
          { key: 'ecw', label: 'eCW', render: (row) => (
            row.uploadedToEcwAt ? <Badge variant="success">Uploaded</Badge> : <Badge variant="default">Not Sent</Badge>
          )},
        ]}
        rows={documents}
        pageSize={10}
        search={{
          placeholder: 'Search document, patient, course, category, signature, or eCW status...',
          getText: (row) => [
            row.title,
            patientLabel(row.patientId),
            row.courseId,
            row.category,
            statusLabel(row.status),
            row.signedAt ? 'Signed' : 'Pending',
            row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent',
          ].join(' '),
        }}
        filters={[
          { id: 'category', label: 'Category' },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabel(row.category) },
          { id: 'signature', label: 'Signature', getValue: (row) => row.signedAt ? 'Signed' : 'Pending' },
          { id: 'ecw', label: 'eCW', getValue: (row) => row.uploadedToEcwAt ? 'Uploaded' : 'Not Sent' },
        ]}
      />
    </PageStack>
  );
}
