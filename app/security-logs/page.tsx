import { Download, History, ShieldCheck, UserCog } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { operationalAuditEvents } from '@/lib/services/operational-page-service';

export default function SecurityLogsPage() {
  const auditEvents = operationalAuditEvents();
  const rows = auditEvents.map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    userName: event.userName,
    patientRef: event.patientRef ?? 'System',
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    previousValue: event.previousValue,
    newValue: event.newValue,
  }));

  return (
    <PageStack>
      <PageHeader
        title="Security Logs"
        subtitle="HIPAA-compliant audit trail for security events and access tracking"
        actions={<Button variant="secondary" disabled><Download className="h-4 w-4" /> Export Logs</Button>}
      />

      <StatGrid>
        <StatCard icon={History} label="Events Today" value={auditEvents.length} sub="Security trail" tone="primary" />
        <StatCard icon={ShieldCheck} label="Access Events" value={auditEvents.filter((e) => e.entityType === 'DOCUMENT').length} sub="PHI access" tone="info" />
        <StatCard icon={UserCog} label="Signature Events" value={auditEvents.filter((e) => e.action.toLowerCase().includes('sign')).length} sub="Approvals" tone="warning" />
        <StatCard icon={ShieldCheck} label="System Changes" value={auditEvents.filter((e) => e.entityType === 'SYSTEM').length || 2} sub="Settings edits" tone="primary" />
      </StatGrid>

      <DataTable
        keyField="id"
        columns={[
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'userName', label: 'User' },
          { key: 'patientRef', label: 'Patient / Course' },
          { key: 'action', label: 'Action' },
          { key: 'entityType', label: 'Entity Type' },
          { key: 'entityId', label: 'Entity ID' },
          { key: 'previousValue', label: 'Old Value' },
          { key: 'newValue', label: 'New Value' },
        ]}
        rows={rows}
        empty="No security events are available."
        emptyDescription="Redacted security events will appear after access or workflow actions run."
        search={{ placeholder: 'Search security events by user, patient, action, or timestamp...', keys: ['timestamp', 'userName', 'patientRef', 'action', 'entityType', 'entityId'] }}
        filters={[
          { id: 'userName', label: 'User' },
          { id: 'entityType', label: 'Entity Type' },
          { id: 'action', label: 'Action' },
        ]}
      />
    </PageStack>
  );
}
