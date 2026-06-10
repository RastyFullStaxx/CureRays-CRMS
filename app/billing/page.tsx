'use client';
import { WalletCards } from "lucide-react";
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
import { billingItems } from "@/lib/module-data";

export default function BillingPage() {
  const totalItems = billingItems.length;
  const ready = billingItems.filter((item) => item.status === "COMPLETED").length;
  const pending = billingItems.filter((item) => item.status === "READY_FOR_REVIEW").length;
  const review = billingItems.filter((item) => item.status === "IN_PROGRESS").length;
  const blocked = billingItems.filter((item) => item.status === "BLOCKED").length;

  return (
    <PageStack>
      <PageHeader
        title="Billing / Coding"
        subtitle="Track planned codes, quantities, documentation, pre-auth status, and audit readiness"
        actions={
          <>
            <Button variant="secondary"><WalletCards className="h-4 w-4" /> Export Billing Report</Button>
            <Button><WalletCards className="h-4 w-4" /> Add Billing Item</Button>
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
      <DataTable
        columns={[
          { key: 'code', label: 'Code', render: (row) => (
            <span className="font-bold text-[var(--color-primary)]">{row.code}</span>
          )},
          { key: 'description', label: 'Description', render: (row) => (
            <span className="block truncate">{row.description}</span>
          )},
          { key: 'planned', label: 'Planned', render: (row) => (
            <span className="font-semibold">{row.plannedQuantity}</span>
          )},
          { key: 'completed', label: 'Completed', render: (row) => (
            <span className="font-semibold">{row.completedQuantity}</span>
          )},
          { key: 'billed', label: 'Billed', render: (row) => (
            <span className="font-semibold">{row.billedQuantity}</span>
          )},
          { key: 'status', label: 'Status', render: (row) => {
            const variant = row.status === "COMPLETED" ? "success" : row.status === "IN_PROGRESS" ? "warning" : row.status === "BLOCKED" ? "error" : "info";
            return <Badge variant={variant}>{row.status.replaceAll("_", " ")}</Badge>;
          }},
          { key: 'linkedDoc', label: 'Linked Document', render: (row) => row.linkedDocumentId ? (
            <span className="text-[var(--color-primary)] font-medium">{row.linkedDocumentId}</span>
          ) : (
            <span className="text-[var(--color-text-muted)]">Pending</span>
          )},
          { key: 'notes', label: 'Notes', render: (row) => row.notes ? (
            <span className="line-clamp-2 text-[var(--color-text-muted)]">{row.notes}</span>
          ) : "-"},
        ]}
        rows={billingItems.map((item) => ({
          ...item,
        }))}
        pageSize={10}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search code, patient ID, course, document, or billing note..." />
            </FilterField>
            <FilterField><Input placeholder="Code" /></FilterField>
            <FilterField><Input placeholder="Documentation" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
      <div className="grid gap-3 md:grid-cols-3">
        {["Consultation", "Simulation", "Treatment", "Follow-up", "Audit"].map((phase) => (
          <div key={phase} className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{phase}</p>
            <p className="mt-2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Evidence and quantity tracking placeholder.</p>
          </div>
        ))}
      </div>
    </PageStack>
  );
}
