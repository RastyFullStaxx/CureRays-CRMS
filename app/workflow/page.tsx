'use client';
import { AlertTriangle, CalendarDays, ClipboardList, FileText, PenLine, Settings, ShieldCheck } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel, responsiblePartyName, statusLabel, statusTone } from "@/lib/global-page-data";
import { mapTone } from "@/lib/status-utils";

export default function WorkflowPage() {
  const steps = moduleSnapshot.workflowSteps;
  const ready = steps.filter((step) => step.status === "READY_FOR_REVIEW").length;
  const pending = steps.filter((step) => ["PENDING", "IN_PROGRESS"].includes(step.status)).length;
  const signed = steps.filter((step) => step.signedAt).length;
  const blocked = steps.filter((step) => step.status === "BLOCKED").length;
  const overdue = steps.filter((step) => step.blockers.length).length;

  return (
    <PageStack>
      <PageHeader
        title="Workflow"
        subtitle="Manage clinical workflow steps and approvals"
        actions={
          <>
            <Button variant="secondary"><ClipboardList className="h-4 w-4" /> Export</Button>
            <Button><Settings className="h-4 w-4" /> Customize</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={CalendarDays} label="Active Steps" value={steps.length} sub="Across all courses" />
        <StatCard icon={PenLine} label="Ready for Review" value={ready} sub="Awaiting check" tone="primary" />
        <StatCard icon={FileText} label="Pending Signatures" value={signed} sub="Signed steps" tone="success" />
        <StatCard icon={AlertTriangle} label="Blocked" value={blocked} sub="Needs escalation" tone="error" />
        <StatCard icon={ShieldCheck} label="Overdue" value={overdue} sub="Past due or blocked" tone="warning" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'step', label: 'Step', render: (row) => (
            <span className="font-bold text-[var(--color-primary)]">{row.stepNumber}. {row.stepName}</span>
          )},
          { key: 'course', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === row.courseId)?.patientId ?? "")} / {row.courseId.replace("COURSE-", "C")}</span>
          )},
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant={mapTone(statusTone(row.phase))}>{phaseLabel(row.phase)}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
          { key: 'role', label: 'Role', render: (row) => responsiblePartyName(row.responsibleRole) },
          { key: 'assigned', label: 'Assigned', render: (row) => row.assignedUserId ?? responsiblePartyName(row.responsibleRole) },
          { key: 'due', label: 'Due', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-" },
          { key: 'signature', label: 'Signature', render: (row) => (
            row.requiresSignature ? (row.signedAt ? <Badge variant="success">Signed</Badge> : <Badge variant="warning">Required</Badge>) : "-"
          )},
          { key: 'trigger', label: 'Trigger', render: (row) => (
            <span className="text-[var(--color-text-muted)] text-[11px]">{row.triggerEvent}</span>
          )},
          { key: 'linkedDoc', label: 'Linked Doc', render: (row) => row.linkedDocumentId ?? "Pending" },
          { key: 'blocker', label: 'Blocker', render: (row) => (
            row.blockers[0] ? <span className="line-clamp-2 text-[var(--color-warning)]">{row.blockers[0]}</span> : "-"
          )},
        ]}
        rows={steps}
        pageSize={15}
        search={{
          placeholder: 'Search workflow steps, patients, courses, or blockers...',
          getText: (row) => [
            row.stepName,
            row.courseId,
            patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === row.courseId)?.patientId ?? ''),
            phaseLabel(row.phase),
            statusLabel(row.status),
            responsiblePartyName(row.responsibleRole),
            row.assignedUserId,
            row.linkedDocumentId,
            ...row.blockers,
          ].join(' '),
        }}
        filters={[
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabel(row.phase) },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
          { id: 'assignee', label: 'Assignee', getValue: (row) => row.assignedUserId ?? responsiblePartyName(row.responsibleRole) },
        ]}
      />
    </PageStack>
  );
}
