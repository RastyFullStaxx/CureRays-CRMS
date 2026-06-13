export const dynamic = 'force-dynamic';

import { AlertTriangle, CheckCircle2, FileWarning, PenLine, ShieldCheck } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/services/operational-page-service";

export default function AuditPage() {
  const blockers = moduleSnapshot.auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));
  const courses = moduleSnapshot.courses;
  const signedMissing = moduleSnapshot.generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length;
  const rows: SerializedTableRow[] = courses.map((course, index) => {
    const auditPct = Math.max(58, 96 - index * 7);
    return {
      id: course.id,
      course: course.id.replace("COURSE-", "C"),
      patient: patientLabel(course.patientId),
      diagnosis: course.diagnosisType,
      phase: phaseLabel(course.currentPhase),
      auditPct,
      readiness: auditPct > 85 ? "Ready" : auditPct > 70 ? "Review" : "Blocked",
      documents: course.flagsIssues.length || index % 3 ? "Missing Items" : "Complete",
      missing: course.flagsIssues.length || (index % 3),
      billing: index % 3 ? "Review" : "Ready",
      billingTone: index % 3 ? "orange" : "green",
      signature: index % 2 ? "Pending" : "Complete",
      signatureTone: index % 2 ? "orange" : "green",
      followUp: index % 2 ? "Needed" : "Scheduled",
      status: statusLabel(course.status),
      statusTone: statusTone(course.status),
      flags: course.flagsIssues.join(" "),
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="Audit"
        subtitle="Closeout readiness, blockers, and compliance checks"
        actions={
          <>
            <PrototypeActionButton label="Export Audit Report" icon="upload" kind="export" description="Prepare a tokenized audit packet for closeout review." />
            <PrototypeActionButton label="Run Audit Check" icon="play" kind="review" variant="primary" description="Run a simulated closeout readiness check against the visible course rows." />
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
      <SerializedDataTable
        columns={[
          { key: 'course', label: 'Course', kind: 'primary' },
          { key: 'patient', label: 'Patient' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase', kind: 'badge', variant: 'info' },
          { key: 'auditPct', label: 'Audit %', kind: 'progress' },
          { key: 'missing', label: 'Missing Items' },
          { key: 'billing', label: 'Billing', kind: 'status', toneKey: 'billingTone' },
          { key: 'signature', label: 'Signature', kind: 'status', toneKey: 'signatureTone' },
          { key: 'followUp', label: 'Follow-up' },
          { key: 'status', label: 'Status', kind: 'status' },
        ]}
        rows={rows}
        empty="No courses are available for audit."
        emptyDescription="Audit readiness rows will appear after treatment courses are initialized."
        pageSize={10}
        search={{
          placeholder: 'Search course, patient, diagnosis, blocker, document, or audit check...',
          keys: ['course', 'patient', 'diagnosis', 'phase', 'status', 'flags'],
        }}
        filters={[
          { id: 'readiness', label: 'Readiness' },
          { id: 'documents', label: 'Documents' },
          { id: 'billing', label: 'Billing' },
          { id: 'status', label: 'Status' },
        ]}
      />
    </PageStack>
  );
}
