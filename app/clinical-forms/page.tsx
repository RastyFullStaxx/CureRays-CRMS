'use client';
import { CheckCircle2, Eye, FileText, NotebookTabs, PenLine, Plus, RefreshCw, Route, Workflow } from "lucide-react";
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
import { clinicalDocumentRows, moduleSnapshot, patientLabel, patientMrn, statusLabel, statusTone } from "@/lib/global-page-data";

export default function ClinicalFormsPage() {
  const documents = clinicalDocumentRows;
  const templates = moduleSnapshot.clinicalFormTemplates;
  const missingFields = documents.filter((document) => document.status === "BLOCKED" || document.status === "NOT_STARTED").length;

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
        title="Clinical Forms"
        subtitle="Structured clinical documentation and form management"
        actions={<Button><Plus className="h-4 w-4" /> New Clinical Form</Button>}
      />
      <StatGrid>
        <StatCard icon={NotebookTabs} label="Drafts" value={documents.filter((document) => document.status === "NOT_STARTED").length || 8} sub="Structured forms" />
        <StatCard icon={PenLine} label="Ready for Review" value={documents.filter((document) => document.status === "READY_FOR_REVIEW").length || 5} sub="Provider queue" tone="primary" />
        <StatCard icon={CheckCircle2} label="Signed" value={documents.filter((document) => document.signedAt).length} sub="Completed" tone="success" />
        <StatCard icon={FileText} label="Missing Fields" value={missingFields || 4} sub="Need completion" tone="warning" />
        <StatCard icon={RefreshCw} label="Existing Documents" value={documents.length} sub="Editable through fields" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'title', label: 'Document Name', render: (row) => (
            <span className="block truncate font-bold text-[var(--color-primary)]">{row.title}</span>
          )},
          { key: 'patient', label: 'Patient', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)}</span>
          )},
          { key: 'mrn', label: 'MRN', render: (row) => patientMrn(row.patientId) },
          { key: 'formType', label: 'Form Type' },
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant="info">{row.phase}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status)) as any}>{statusLabel(row.status)}</Badge>
          )},
          { key: 'lastUpdated', label: 'Last Updated', render: (row) => row.generatedAt ?? "Pending" },
          { key: 'assignedStaff', label: 'Assigned Staff' },
          { key: 'actions', label: 'Actions', render: () => (
            <div className="flex flex-wrap gap-1.5">
              <Button variant="secondary" size="sm"><Eye className="h-3.5 w-3.5" /> Open</Button>
              <Button variant="secondary" size="sm"><PenLine className="h-3.5 w-3.5" /> Edit Fields</Button>
            </div>
          )},
        ]}
        rows={documents.map((document) => ({
          ...document,
        }))}
        pageSize={10}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search form, document, patient, MRN, status, or reviewer..." />
            </FilterField>
            <FilterField><Input placeholder="Form Type" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
            <FilterField><Input placeholder="Phase" /></FilterField>
          </FilterStrip>
        }
      />
      <div
        className="rounded-[var(--radius-lg)] p-4"
        style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Structured Field Editor</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {["Patient Name", "DOS", "Laterality", "Exam Type", "Performed By", "Narrative Note"].map((field, index) => (
            <label key={field} className={index === 5 ? "sm:col-span-2" : ""}>
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{field}</span>
              <span className="mt-1 block rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--color-border)', background: 'var(--color-hover)', color: 'var(--color-text)' }}>
                {index === 5 ? "Structured note content updates the preview before document regeneration." : "Mapped field value"}
              </span>
            </label>
          ))}
        </div>
      </div>
    </PageStack>
  );
}
