'use client';
import { AlertTriangle, CheckCircle2, FileWarning, PenLine, PlayCircle, ShieldCheck, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function AuditPage() {
  const blockers = moduleSnapshot.auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));
  const courses = moduleSnapshot.courses;
  const signedMissing = moduleSnapshot.generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length;

  const mapTone = (t: string) => {
    if (t === "green" || t === "emerald") return "success";
    if (t === "orange") return "warning";
    if (t === "red") return "error";
    if (t === "purple") return "primary";
    if (t === "blue") return "info";
    return "default";
  };

  return (
    <PageStack>
      <PageHeader
        title="Audit"
        subtitle="Closeout readiness, blockers, and compliance checks"
        actions={
          <>
            <Button variant="secondary"><Upload className="h-4 w-4" /> Export Audit Report</Button>
            <Button><PlayCircle className="h-4 w-4" /> Run Audit Check</Button>
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
            <Badge variant={mapTone(statusTone(row.status)) as any}>{statusLabel(row.status)}</Badge>
          )},
        ]}
        rows={courses.map((course, index) => ({
          ...course,
          _index: index,
        }))}
        pageSize={10}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search course, patient, diagnosis, blocker, document, or audit check..." />
            </FilterField>
            <FilterField><Input placeholder="Readiness" /></FilterField>
            <FilterField><Input placeholder="Documents" /></FilterField>
            <FilterField><Input placeholder="Billing" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
