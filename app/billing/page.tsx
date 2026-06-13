export const dynamic = 'force-dynamic';

import { WalletCards } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { billingItems } from "@/lib/services/operational-page-service";

export default function BillingPage() {
  const totalItems = billingItems.length;
  const ready = billingItems.filter((item) => item.status === "COMPLETED").length;
  const pending = billingItems.filter((item) => item.status === "READY_FOR_REVIEW").length;
  const review = billingItems.filter((item) => item.status === "IN_PROGRESS").length;
  const blocked = billingItems.filter((item) => item.status === "BLOCKED").length;
  const rows: SerializedTableRow[] = billingItems.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    planned: item.plannedQuantity,
    completed: item.completedQuantity,
    billed: item.billedQuantity,
    status: item.status.replaceAll("_", " "),
    statusTone: item.status === "COMPLETED" ? "green" : item.status === "IN_PROGRESS" ? "orange" : item.status === "BLOCKED" ? "red" : "blue",
    linkedDoc: item.linkedDocumentId ?? "Pending",
    documentation: item.linkedDocumentId ? "Linked" : "Pending",
    notes: item.notes ?? "—",
  }));

  return (
    <PageStack>
      <PageHeader
        title="Billing / Coding"
        subtitle="Track planned codes, quantities, documentation, pre-auth status, and audit readiness"
        actions={
          <>
            <PrototypeActionButton label="Export Billing Report" icon="wallet" kind="export" description="Prepare a tokenized billing readiness report." />
            <PrototypeActionButton label="Add Billing Item" icon="wallet" kind="create" variant="primary" description="Stage a billing item linked to document and fraction evidence." />
          </>
        }
      />
      <StatGrid>
        <StatCard icon={WalletCards} label="Total Items" value={totalItems} sub="All billing items" />
        <StatCard icon={WalletCards} label="Ready for Billing" value={pending} sub="Documentation complete" tone="info" />
        <StatCard icon={WalletCards} label="Under Review" value={review} sub="Pending checks" tone="warning" />
        <StatCard icon={WalletCards} label="Billed" value={ready} sub="Completed" tone="success" />
        <StatCard icon={WalletCards} label="Audit Issues" value={blocked} sub="Needs remediation" tone="error" />
      </StatGrid>
      <SerializedDataTable
        columns={[
          { key: 'code', label: 'Code', kind: 'primary' },
          { key: 'description', label: 'Description' },
          { key: 'planned', label: 'Planned' },
          { key: 'completed', label: 'Completed' },
          { key: 'billed', label: 'Billed' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'linkedDoc', label: 'Linked Document', kind: 'primary' },
          { key: 'notes', label: 'Notes', kind: 'longText' },
        ]}
        rows={rows}
        empty="No billing items are available."
        emptyDescription="Billing evidence rows will appear after course charges or fraction evidence are generated."
        pageSize={10}
        search={{ placeholder: 'Search code, patient ID, course, document, or billing note...', keys: ['code', 'description', 'linkedDoc', 'notes', 'status'] }}
        filters={[
          { id: 'code', label: 'Code' },
          { id: 'documentation', label: 'Documentation' },
          { id: 'status', label: 'Status' },
        ]}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {["Consultation", "Simulation", "Treatment", "Follow-up", "Audit"].map((phase) => (
          <div key={phase} className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{phase}</p>
            <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Evidence and quantity tracking staged for prototype review.</p>
          </div>
        ))}
      </div>
    </PageStack>
  );
}
