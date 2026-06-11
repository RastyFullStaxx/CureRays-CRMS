export const dynamic = 'force-dynamic';

import { CheckCircle2, Eye, FileText, NotebookTabs, PenLine, Plus, RefreshCw, Route, Workflow } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clinicalDocumentRows, moduleSnapshot, patientLabel, patientMrn, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { handJointRows } from '@/lib/services/operational-page-service';
import { mapTone } from "@/lib/status-utils";

export default function ClinicalFormsPage() {
  const documents = clinicalDocumentRows;
  const templates = moduleSnapshot.clinicalFormTemplates;
  const missingFields = documents.filter((document) => document.status === "BLOCKED" || document.status === "NOT_STARTED").length;

  return (
    <ScrollArea axis="y" className="flex-1 pr-1">
      <PageStack className="min-h-full pb-1">
        <PageHeader
          title="Clinical Forms"
          subtitle="Structured clinical documentation and form management"
          actions={<Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> New Clinical Form</Button>}
        />
        <StatGrid>
          <StatCard icon={NotebookTabs} label="Drafts" value={documents.filter((document) => document.status === "NOT_STARTED").length || 8} sub="Structured forms" />
          <StatCard icon={PenLine} label="Ready for Review" value={documents.filter((document) => document.status === "READY_FOR_REVIEW").length || 5} sub="Provider queue" tone="primary" />
          <StatCard icon={CheckCircle2} label="Signed" value={documents.filter((document) => document.signedAt).length} sub="Completed" tone="success" />
          <StatCard icon={FileText} label="Missing Fields" value={missingFields || 4} sub="Need completion" tone="warning" />
          <StatCard icon={RefreshCw} label="Existing Documents" value={documents.length} sub="Editable through fields" />
        </StatGrid>
        <div className="min-h-[520px] flex-none" style={{ marginTop: '-1px' }}>
          <DataTable
            className="min-h-[520px] flex-none"
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
                <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
              )},
              { key: 'lastUpdated', label: 'Last Updated', render: (row) => row.generatedAt ?? "Pending" },
              { key: 'assignedStaff', label: 'Assigned Staff' },
              { key: 'actions', label: 'Actions', render: () => (
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="secondary" size="sm" disabled title="Prototype placeholder"><Eye className="h-3.5 w-3.5" /> Open</Button>
                  <Button variant="secondary" size="sm" disabled title="Prototype placeholder"><PenLine className="h-3.5 w-3.5" /> Edit Fields</Button>
                </div>
              )},
            ]}
            rows={documents}
            empty="No clinical forms are available."
            emptyDescription="Structured forms will appear after document instances are generated."
            pageSize={10}
            search={{
              placeholder: 'Search form, document, patient, MRN, status, or reviewer...',
              getText: (row) => [
                row.title,
                patientLabel(row.patientId),
                patientMrn(row.patientId),
                row.formType,
                row.phase,
                statusLabel(row.status),
                row.assignedStaff,
              ].join(' '),
            }}
            filters={[
              { id: 'formType', label: 'Form Type' },
              { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
              { id: 'phase', label: 'Phase' },
              { id: 'assignedStaff', label: 'Reviewer' },
            ]}
          />
        </div>
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
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Live Document Preview</h2>
            <div className="mt-3 rounded-lg p-3 text-xs leading-relaxed" style={{ background: 'var(--color-bg)', border: 'var(--border-container)' }}>
              <p style={{ color: 'var(--color-text)' }}><strong>Patient:</strong> Jane Doe</p>
              <p style={{ color: 'var(--color-text)' }}><strong>DOS:</strong> 2026-05-06</p>
              <p style={{ color: 'var(--color-text)' }}><strong>Laterality:</strong> Left</p>
              <p style={{ color: 'var(--color-text)' }}><strong>Exam:</strong> Hand X-ray 3-View</p>
              <div className="mt-2 flex items-center gap-2 text-[var(--color-text-muted)]">
                <Route className="h-3 w-3" />
                <span>Workflow: Draft -&gt; Pending Review -&gt; Final</span>
              </div>
            </div>
          </Card>
          <Card>
            <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Hand Joint X-ray Data Table</h2>
            <ScrollArea axis="x" className="mt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>Zone</th>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>JS Narrowing</th>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>Osteophytes</th>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>Sclerosis</th>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: 'var(--color-text-muted)' }}>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {handJointRows.map((zone) => (
                    <tr key={zone} style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
                      <td className="px-2 py-1.5 font-semibold" style={{ color: 'var(--color-text)' }}>{zone}</td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--color-text-muted)' }}>&mdash;</td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--color-text-muted)' }}>&mdash;</td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--color-text-muted)' }}>&mdash;</td>
                      <td className="px-2 py-1.5" style={{ color: 'var(--color-text-muted)' }}>&mdash;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </Card>
        </div>
      </PageStack>
    </ScrollArea>
  );
}
