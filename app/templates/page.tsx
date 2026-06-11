import { FileText, Copy, Eye, Archive, Plus, Upload } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { templateRows } from '@/lib/global-page-data';

export default function TemplatesPage() {
  const rows = templateRows;
  const active = templateRows.filter((t) => t.status === 'Active').length;
  const documentTemplates = templateRows.filter((t) => t.fileType === 'DOCX').length;
  const workflowTemplates = templateRows.filter((t) => t.type.includes('Order') || t.type.includes('Log')).length;
  const clinicalForms = templateRows.filter((t) => t.type.includes('Mapping') || t.type.includes('Intake')).length;
  const needsReview = templateRows.filter((t) => t.status !== 'Active').length;

  return (
    <PageStack>
      <PageHeader
        title="Templates"
        subtitle="Manage document, workflow, and clinical form templates"
        actions={
          <>
            <Button variant="secondary"><Upload className="h-4 w-4" /> Upload Template</Button>
            <Button><Plus className="h-4 w-4" /> Create Template</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard icon={FileText} label="Active Templates" value={active} sub="Published" tone="success" />
        <StatCard icon={FileText} label="Document Templates" value={documentTemplates} sub="Generated outputs" />
        <StatCard icon={Copy} label="Workflow Templates" value={workflowTemplates} sub="Carepath logic" tone="info" />
        <StatCard icon={Eye} label="Clinical Forms" value={clinicalForms} sub="Structured forms" tone="primary" />
        <StatCard icon={Archive} label="Needs Review" value={needsReview} sub="Draft or mapping" tone="warning" />
      </StatGrid>

      <DataTable
        keyField="id"
        columns={[
          { key: 'name', label: 'Template Name' },
          { key: 'type', label: 'Type' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'workflowStep', label: 'Workflow Step' },
          { key: 'fileType', label: 'File Type' },
          { key: 'status', label: 'Status' },
          { key: 'updated', label: 'Last Updated' },
          { key: 'owner', label: 'Owner' },
        ]}
        rows={rows}
        search={{ placeholder: 'Search templates by name, type, diagnosis, status, or owner...', keys: ['name', 'type', 'diagnosis', 'workflowStep', 'fileType', 'status', 'owner', 'sourcePath'] }}
        filters={[
          { id: 'type', label: 'Type' },
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'fileType', label: 'File Type' },
          { id: 'status', label: 'Status' },
        ]}
      />
    </PageStack>
  );
}
