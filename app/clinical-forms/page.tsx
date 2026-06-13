export const dynamic = 'force-dynamic';

import { CheckCircle2, FileText, NotebookTabs, PenLine, RefreshCw, Route } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clinicalDocumentRows, patientLabel, patientMrn, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { handJointRows } from '@/lib/services/operational-page-service';

export default function ClinicalFormsPage() {
  const documents = clinicalDocumentRows;
  const missingFields = documents.filter((document) => document.status === "BLOCKED" || document.status === "NOT_STARTED").length;
  const rows: SerializedTableRow[] = documents.map((document) => ({
    id: document.id,
    title: document.title,
    patient: patientLabel(document.patientId),
    mrn: patientMrn(document.patientId),
    formType: document.formType,
    phase: document.phase,
    status: statusLabel(document.status),
    statusTone: statusTone(document.status),
    lastUpdated: document.generatedAt ?? "Pending",
    assignedStaff: document.assignedStaff,
  }));

  return (
    <ScrollArea axis="y" className="flex-1 pr-1">
      <PageStack className="min-h-full pb-1">
        <PageHeader
          title="Clinical Forms"
          subtitle="Structured clinical documentation and form management"
          actions={<PrototypeActionButton label="New Clinical Form" icon="plus" kind="create" variant="primary" description="Stage a structured clinical form from the active template registry." />}
        />
        <StatGrid>
          <StatCard icon={NotebookTabs} label="Drafts" value={documents.filter((document) => document.status === "NOT_STARTED").length || 8} sub="Structured forms" />
          <StatCard icon={PenLine} label="Ready for Review" value={documents.filter((document) => document.status === "READY_FOR_REVIEW").length || 5} sub="Provider queue" tone="primary" />
          <StatCard icon={CheckCircle2} label="Signed" value={documents.filter((document) => document.signedAt).length} sub="Completed" tone="success" />
          <StatCard icon={FileText} label="Missing Fields" value={missingFields || 4} sub="Need completion" tone="warning" />
          <StatCard icon={RefreshCw} label="Existing Documents" value={documents.length} sub="Editable through fields" />
        </StatGrid>
        <div className="min-h-[520px] flex-none" style={{ marginTop: '-1px' }}>
          <SerializedDataTable
            className="min-h-[520px] flex-none"
            columns={[
              { key: 'title', label: 'Document Name', kind: 'primary' },
              { key: 'patient', label: 'Patient' },
              { key: 'mrn', label: 'MRN' },
              { key: 'formType', label: 'Form Type' },
              { key: 'phase', label: 'Phase', kind: 'badge', variant: 'info' },
              { key: 'status', label: 'Status', kind: 'status' },
              { key: 'lastUpdated', label: 'Last Updated' },
              { key: 'assignedStaff', label: 'Assigned Staff' },
              { key: 'actions', label: 'Actions', kind: 'actions', actions: [
                { label: 'Open', icon: 'eye', kind: 'review', description: 'Open a PHI-safe form review panel for this demo row.' },
                { label: 'Edit Fields', icon: 'pen', kind: 'review', description: 'Stage structured field edits before document regeneration.' },
              ]},
            ]}
            rows={rows}
            empty="No clinical forms are available."
            emptyDescription="Structured forms will appear after document instances are generated."
            pageSize={10}
            search={{
              placeholder: 'Search form, document, patient, MRN, status, or reviewer...',
              keys: ['title', 'patient', 'mrn', 'formType', 'phase', 'status', 'assignedStaff'],
            }}
            filters={[
              { id: 'formType', label: 'Form Type' },
              { id: 'status', label: 'Status' },
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
