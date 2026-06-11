import { FileStack } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  documentRequirements,
  documentTemplates,
  internalFormTemplates,
  templateSources,
  workflowDefinitions,
} from '@/lib/services/operational-page-service';
import { carepathPhaseLabels } from '@/lib/workflow';

export default function WorkflowTemplatesPage() {
  return (
    <PageStack>
      <PageHeader
        title="Workflow Templates"
        subtitle="Registry-first tracking for universal, diagnosis-specific, mapped, missing, and evolving Drive templates"
      />

      <StatGrid>
        <StatCard icon={FileStack} label="Workflow Definitions" value={workflowDefinitions.length} tone="primary" />
        <StatCard icon={FileStack} label="Template Sources" value={templateSources.length} tone="info" />
        <StatCard icon={FileStack} label="Document Requirements" value={documentRequirements.length} tone="warning" />
        <StatCard icon={FileStack} label="Document Templates" value={documentTemplates.length} tone="success" />
        <StatCard icon={FileStack} label="Internal Forms" value={internalFormTemplates.length} />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Workflow Definitions</p>
              <h2 className="mt-1 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Flexible workflow catalog</h2>
            </div>
            <Badge variant="primary">{workflowDefinitions.length} workflows</Badge>
          </div>
          <div className="space-y-3">
            {workflowDefinitions.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-lg p-4"
                style={{ border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{workflow.name}</h3>
                  <Badge variant="info">{workflow.status.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="mt-2 text-sm leading-5" style={{ color: 'var(--color-text-muted)' }}>{workflow.description}</p>
                <p className="mt-3 text-xs font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>
                  {workflow.documentRequirementIds.length} document requirements
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Drive Source Map</p>
              <h2 className="mt-1 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Template source status</h2>
            </div>
            <Badge variant="primary">{templateSources.length} sources</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {templateSources.map((source) => (
              <div
                key={source.id}
                className="rounded-lg p-4"
                style={{ border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-5" style={{ color: 'var(--color-text)' }}>{source.name}</h3>
                  <Badge variant="info">{source.status.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5" style={{ color: 'var(--color-text-muted)' }}>{source.sourceFileName}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Document Requirements</p>
            <h2 className="mt-1 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Universal and diagnosis-specific tracking</h2>
          </div>
          <Badge variant="primary">Intake + AVS included</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documentRequirements.map((requirement) => (
            <div
              key={requirement.id}
              className="rounded-lg p-4"
              style={{ border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {requirement.applicability.universal ? 'Universal' : requirement.applicability.diagnosis.replace(/_/g, ' ')}
              </p>
              <h3 className="mt-2 text-base font-semibold" style={{ color: 'var(--color-text)' }}>{requirement.name}</h3>
              <p className="mt-2 text-sm leading-5" style={{ color: 'var(--color-text-muted)' }}>{requirement.requiredAction}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="info">{carepathPhaseLabels[requirement.workflowPhase]}</Badge>
                <Badge variant="default">{requirement.defaultStatus.replace(/_/g, ' ')}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {documentTemplates.map((template) => (
          <Card key={template.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{template.version}</p>
                <h2 className="mt-2 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>{template.name}</h2>
              </div>
              <Badge variant="success">{template.status}</Badge>
            </div>
            <div className="mt-4 grid gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <p><span className="font-semibold" style={{ color: 'var(--color-text)' }}>Diagnosis:</span> {template.diagnosis.replace(/_/g, ' ')}</p>
              <p><span className="font-semibold" style={{ color: 'var(--color-text)' }}>Protocol:</span> {template.protocol}</p>
              <p><span className="font-semibold" style={{ color: 'var(--color-text)' }}>Phase:</span> {carepathPhaseLabels[template.category]}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.requiredFields.map((field) => (
                <Badge key={field} variant="default">{field}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Internal Form Engine</p>
            <h2 className="mt-1 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Drive templates converted to CRUD forms</h2>
          </div>
          <Badge variant="primary">{internalFormTemplates.length} form definitions</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {internalFormTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg p-4"
              style={{ border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}
            >
              <p className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>{template.protocol}</p>
              <h3 className="mt-2 text-base font-semibold" style={{ color: 'var(--color-text)' }}>{template.name}</h3>
              <p className="mt-2 text-sm leading-5" style={{ color: 'var(--color-text-muted)' }}>{template.sourceFileName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.outputFormats.map((format) => (
                  <Badge key={format} variant="info">{format}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageStack>
  );
}
