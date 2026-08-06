import { AuditLogCommandClient, type AuditLogRow } from '@/components/audit/audit-log-command-client';
import { operationalAuditEvents } from '@/lib/services/operational-page-service';

export default function AuditLogsPage() {
  const rows: AuditLogRow[] = operationalAuditEvents().map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    userName: event.userName,
    patientRef: event.patientRef ?? 'System',
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    previousValue: event.previousValue,
    newValue: event.newValue,
    redacted: event.redacted,
    reason: event.reason,
  }));

  return <AuditLogCommandClient mode="audit" rows={rows} />;
}
