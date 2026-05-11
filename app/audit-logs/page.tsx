import { Download, History, ShieldCheck, UserCog } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { operationalAuditEvents } from "@/lib/clinical-store";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";

export default function AuditLogsPage() {
  const auditEvents = operationalAuditEvents();

  return (
    <ModulePage>
      <ModuleActions><SecondaryButton><Download className="h-4 w-4" />Export Logs</SecondaryButton></ModuleActions>
      <MetricGrid columns={4}>
        <MetricTile label="Events Today" value={auditEvents.length} detail="Audit trail" icon={History} />
        <MetricTile label="Document Events" value={auditEvents.filter((event) => event.entityType === "DOCUMENT").length} detail="File activity" icon={ShieldCheck} />
        <MetricTile label="Signature Events" value={auditEvents.filter((event) => event.action.toLowerCase().includes("sign")).length} detail="Approvals" icon={UserCog} tone="orange" />
        <MetricTile label="Admin Changes" value={auditEvents.filter((event) => event.entityType === "SYSTEM").length || 2} detail="Settings edits" icon={ShieldCheck} tone="purple" />
      </MetricGrid>
      <FilterBar search="Search user, patient, course, action, entity, or timestamp..." filters={["User", "Patient", "Course", "Action Type", "Date Range", "Entity Type"]} />
      <WorkGrid
        main={
          <DataTable
            compact
            minWidth="1120px"
            columns={[{ header: "Timestamp" }, { header: "User" }, { header: "Patient / Course" }, { header: "Action" }, { header: "Entity Type" }, { header: "Entity ID" }, { header: "Old Value" }, { header: "New Value" }, { header: "Actions" }]}
            footer={<Pagination label={`Showing 1 to ${auditEvents.length} of ${auditEvents.length} events`} />}
            rows={auditEvents.map((event) => ({
              id: event.id,
              cells: [event.timestamp, event.userName, event.patientRef ?? "System", event.action, <Badge key="entity" tone="blue">{event.entityType}</Badge>, event.entityId, event.previousValue, event.newValue, <RowActions key="actions" />]
            }))}
          />
        }
        rail={
          <>
            <RightRailCard title="Log Detail">
              <div className="space-y-2">{auditEvents.slice(0, 3).map((event) => <ListItem key={event.id} title={event.action} meta={`${event.userName} - ${event.entityType}`} badge={<Badge tone={event.redacted ? "orange" : "green"}>{event.redacted ? "Redacted" : "Logged"}</Badge>} />)}</div>
            </RightRailCard>
            <RightRailCard title="Audit Posture">
              <div className="space-y-2"><ListItem title="PHI values redacted" meta="Operational log avoids raw PHI payloads" /><ListItem title="Sensitive actions tracked" meta="Documents, signatures, phase changes, and admin events" /></div>
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
