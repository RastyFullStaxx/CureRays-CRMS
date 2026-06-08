import { FileText, Copy, Eye, Archive, Plus, Upload } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { templateRows } from '@/lib/global-page-data';

export default function TemplatesPage() {
  const active = templateRows.filter((t) => t.status === 'Active').length;
  const documentTemplates = templateRows.filter((t) => t.type.includes('Document')).length;
  const workflowTemplates = templateRows.filter((t) => t.type.includes('Workflow')).length;
  const clinicalForms = templateRows.filter((t) => t.type.includes('Clinical')).length;
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
        keyField="name"
        columns={[
          { key: 'name', label: 'Template Name' },
          { key: 'type', label: 'Type' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'version', label: 'Version' },
          { key: 'status', label: 'Status' },
          { key: 'updated', label: 'Last Updated' },
          { key: 'owner', label: 'Owner' },
        ]}
        rows={templateRows.map((template) => ({
          id: template.name,
          name: template.name,
          type: template.type,
          diagnosis: template.diagnosis,
          version: template.version,
          status: template.status,
          updated: template.updated,
          owner: template.owner,
        }))}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search templates by name, type, diagnosis, status, or owner..." />
            </FilterField>
            <FilterField><Input placeholder="Type" /></FilterField>
            <FilterField><Input placeholder="Diagnosis" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
