import { operationalAuditEvents } from "@/lib/clinical-store";

export const auditLogService = {
  listLogs() {
    return operationalAuditEvents();
  },
  recordSensitiveAction(entityType: string, entityId: string, action: string) {
    // TODO: Store immutable audit events with authenticated user and device/IP metadata.
    return { entityType, entityId, action, status: "AUDIT_STUB" as const };
  }
};
