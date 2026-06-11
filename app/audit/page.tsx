export const dynamic = 'force-dynamic';

import { AlertTriangle, CheckCircle2, FileWarning, PenLine, PlayCircle, ShieldCheck, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { mapTone } from "@/lib/status-utils";

export default function AuditPage() {
  const blockers = moduleSnapshot.auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));
  const courses = moduleSnapshot.courses;
  const signedMissing = moduleSnapshot.generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length;

  return (
    <PageStack>
      <PageHeader
        title="Audit"
        subtitle="Closeout readiness, blockers, and compliance checks"
        actions={
          <>
            <Button variant="secondary" disabled title="Prototype placeholder"><Upload className="h-4 w-4" /> Export Audit Report</Button>
            <Button disabled title="Prototype placeholder"><PlayCircle className="h-4 w-4" /> Run Audit Check</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={ShieldCheck} label="Ready for Audit" value={courses.filter((course) => course.currentPhase === "AUDIT").length} sub="Closeout queue" />
        <StatCard icon={AlertTriangle} label="Blocked" value={blockers.length} sub="Needs remediation" tone="error" />
        <StatCard icon={PenLine} label="Missing Signatures" value={signedMissing} sub="Provider queue" tone="warning" />
        <StatCard icon={FileWarning} label="Missing Documents" value={5} sub="Evidence gaps" tone="warning" />
        <StatCard icon={CheckCircle2} label="Ready for Billing" value={9} sub="Audit aligned" tone="success" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'course', label: 'Course', render: (row) => (
            <span className="font-bold text-[var(--color-primary)]">{row.id.replace("COURSE-", "C")}</span>
          )},
          { key: 'patient', label: 'Patient', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)}</span>
          )},
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant="info">{phaseLabel(row.currentPhase)}</Badge>
          )},
          { key: 'auditPct', label: 'Audit %', render: (row) => {
            const readiness = Math.max(58, 96 - (row._index as number) * 7);
            return (
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-[var(--color-border-soft)]">
                  <div className="h-full rounded-full" style={{
                    width: `${readiness}%`,
                    background: readiness > 85 ? 'var(--color-success)' : readiness > 70 ? 'var(--color-warning)' : 'var(--color-error)',
                  }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{readiness}%</span>
              </div>
            );
          }},
          { key: 'missing', label: 'Missing Items', render: (row) => (
            row.flagsIssues.length || ((row._index as number) % 3)
          )},
          { key: 'billing', label: 'Billing', render: (row) => (
            <Badge variant={(row._index as number) % 3 ? "warning" : "success"}>{(row._index as number) % 3 ? "Review" : "Ready"}</Badge>
          )},
          { key: 'signature', label: 'Signature', render: (row) => (
            <Badge variant={(row._index as number) % 2 ? "warning" : "success"}>{(row._index as number) % 2 ? "Pending" : "Complete"}</Badge>
          )},
          { key: 'followUp', label: 'Follow-up', render: (row) => (
            (row._index as number) % 2 ? "Needed" : "Scheduled"
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
        ]}
        rows={courses.map((course, index) => ({
          ...course,
          _index: index,
        }))}
        empty="No courses are available for audit."
        emptyDescription="Audit readiness rows will appear after treatment courses are initialized."
        pageSize={10}
        search={{
          placeholder: 'Search course, patient, diagnosis, blocker, document, or audit check...',
          getText: (row) => [
            row.id,
            patientLabel(row.patientId),
            row.diagnosisType,
            phaseLabel(row.currentPhase),
            statusLabel(row.status),
            ...row.flagsIssues,
          ].join(' '),
        }}
        filters={[
          { id: 'readiness', label: 'Readiness', getValue: (row) => Math.max(58, 96 - (row._index as number) * 7) > 85 ? 'Ready' : Math.max(58, 96 - (row._index as number) * 7) > 70 ? 'Review' : 'Blocked' },
          { id: 'documents', label: 'Documents', getValue: (row) => row.flagsIssues.length || ((row._index as number) % 3) ? 'Missing Items' : 'Complete' },
          { id: 'billing', label: 'Billing', getValue: (row) => (row._index as number) % 3 ? 'Review' : 'Ready' },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
        ]}
      />
    </PageStack>
  );
}
