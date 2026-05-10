import { History, ShieldCheck } from "lucide-react";
import { AuditTimeline } from "@/components/audit-timeline";
import { DataTable } from "@/components/data-table";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  SecondaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { operationalAuditEvents } from "@/lib/clinical-store";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function AuditLogsPage() {
  const auditEvents = operationalAuditEvents();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="HIPAA-aligned visibility"
        title="Security Logs"
        description="A focused view for sensitive patient/course changes, document generation, signatures, phase/status changes, file activity, and audit closeout events."
        icon={History}
        stat={`${auditEvents.length} events`}
        actions={<SecondaryAction>Export Logs</SecondaryAction>}
      />
      <SummaryCardGrid>
        {pageMetrics.security.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.security} />
      <ActionToolbar
        searchPlaceholder="Search user, patient ID, course, action, entity, or timestamp"
        filters={["User", "Patient", "Course", "Action Type", "Date Range", "Entity Type"]}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Audit Log Table" description="Trace sensitive patient/course/document/signature/file/audit actions.">
              <DataTable
                compact
                minWidth="1200px"
                columns={[
                  { header: "Timestamp" },
                  { header: "User" },
                  { header: "Patient/Course" },
                  { header: "Action" },
                  { header: "Entity Type" },
                  { header: "Entity ID" },
                  { header: "Old Value" },
                  { header: "New Value" }
                ]}
                rows={auditEvents.map((event) => ({
                  id: event.id,
                  cells: [
                    event.timestamp,
                    event.userName,
                    event.patientRef ?? "System",
                    event.action,
                    event.entityType,
                    event.entityId,
                    event.previousValue,
                    event.newValue
                  ]
                }))}
              />
            </SectionCard>
            <AuditTimeline events={auditEvents} />
          </>
        }
        rail={
          <>
            <DetailPanel title="Log Detail" subtitle="Selected event metadata" actionLabel="Open event detail">
              <FieldList
                items={[
                  { label: "Actor", value: auditEvents[0]?.userName ?? "System" },
                  { label: "Entity", value: auditEvents[0]?.entityType ?? "PATIENT" },
                  { label: "Redacted", value: auditEvents[0]?.redacted ? "Yes" : "No" },
                  { label: "Reason", value: auditEvents[0]?.reason ?? "Workflow event" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Audit Posture" description="Immutable storage hardening remains an integration boundary.">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#0033A0]" aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-[#3D5A80]">
                  This view highlights who changed what, previous value, new value, affected entity, timestamp, and operational reason.
                </p>
              </div>
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
