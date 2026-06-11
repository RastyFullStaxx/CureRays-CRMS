import { Archive, CheckCircle2, FileText, Plus, ShieldCheck, Upload } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  documentRequirements,
  fieldMapForRequirement,
  readinessForRequirement,
  templateFieldMaps,
  templateRegistryGeneratedAt,
  templateRegistryPlaceholders,
  templateRegistrySchemaVersion,
  templateSources,
} from '@/lib/services/operational-page-service';
import { verifyTemplateSourceHashes } from '@/lib/server/template-registry-verification';
import { carepathPhaseLabels, responsiblePartyLabels } from '@/lib/workflow';

type TemplateSourceRow = {
  id: string;
  name: string;
  fileType: string;
  registryStatus: string;
  approval: string;
  hash: string;
  requirements: string;
  fieldMaps: string;
  disposition: string;
  sourcePath: string;
};

type TemplateRequirementRow = {
  id: string;
  requirement: string;
  phase: string;
  responsible: string;
  reviewer: string;
  applicability: string;
  cpt: string;
  fieldMap: string;
  readiness: string;
};

function label(value: string | undefined) {
  return value ? value.replaceAll('_', ' ') : 'Pending';
}

export default function TemplatesPage() {
  const hashVerification = verifyTemplateSourceHashes();
  const hashBySource = new Map(hashVerification.results.map((result) => [result.sourceId, result]));
  const requirementsBySource = new Map<string, typeof documentRequirements>();

  documentRequirements.forEach((requirement) => {
    if (!requirement.templateSourceId) {
      return;
    }

    const current = requirementsBySource.get(requirement.templateSourceId) ?? [];
    requirementsBySource.set(requirement.templateSourceId, [...current, requirement]);
  });

  const active = templateSources.filter((source) => source.status === 'ACTIVE').length;
  const pilotApproved = templateSources.filter((source) => source.approvalStatus === 'PILOT_APPROVED').length;
  const completeFieldMaps = templateFieldMaps.filter((fieldMap) => fieldMap.status === 'COMPLETE').length;
  const deferredOrFuture = templateRegistryPlaceholders.length + documentRequirements.filter((item) => item.pilotScope === 'DEFERRED').length;

  const sourceRows: TemplateSourceRow[] = templateSources.map((source) => {
    const linkedRequirements = requirementsBySource.get(source.id) ?? [];
    const linkedFieldMaps = linkedRequirements
      .map((requirement) => fieldMapForRequirement(requirement))
      .filter(Boolean);
    const placeholder = templateRegistryPlaceholders.find((item) => item.sourceId === source.id);
    const hash = hashBySource.get(source.id);

    return {
      id: source.id,
      name: source.name,
      fileType: source.mimeType,
      registryStatus: label(source.status),
      approval: label(source.approvalStatus),
      hash: label(hash?.status),
      requirements: `${linkedRequirements.length}`,
      fieldMaps: `${linkedFieldMaps.length}`,
      disposition: placeholder ? label(placeholder.disposition) : source.approvedForPilot ? 'Pilot approved' : 'Mapping review',
      sourcePath: source.sourceFileName,
    };
  });

  const requirementRows: TemplateRequirementRow[] = documentRequirements.map((requirement) => {
    const readiness = readinessForRequirement(requirement);
    const fieldMap = fieldMapForRequirement(requirement);
    const applicability = [
      label(requirement.applicability.diagnosis),
      requirement.applicability.protocol,
      requirement.applicability.bodyRegion,
      requirement.applicability.laterality ? `Laterality ${label(requirement.applicability.laterality)}` : undefined,
    ].filter(Boolean).join(' / ');

    return {
      id: requirement.id,
      requirement: requirement.name,
      phase: carepathPhaseLabels[requirement.workflowPhase],
      responsible: responsiblePartyLabels[requirement.responsibleParty],
      reviewer: requirement.reviewerRole ? responsiblePartyLabels[requirement.reviewerRole] : 'Pending',
      applicability,
      cpt: requirement.cptCode ?? label(requirement.cptRelevance),
      fieldMap: fieldMap ? label(fieldMap.status) : 'Missing',
      readiness: readiness.readyForPilot ? 'Ready for pilot' : label(readiness.generationReadiness),
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="Templates"
        subtitle="Phase 4 registry, field-map, approval, placeholder, and source-hash control"
        actions={
          <>
            <Button variant="secondary" disabled><Upload className="h-4 w-4" /> Upload Template</Button>
            <Button disabled><Plus className="h-4 w-4" /> Create Template</Button>
          </>
        }
      />

      <StatGrid>
        <StatCard icon={FileText} label="Active Sources" value={active} sub={`${templateSources.length} cataloged`} tone="success" />
        <StatCard icon={ShieldCheck} label="Pilot Approved" value={pilotApproved} sub={templateRegistrySchemaVersion} tone="primary" />
        <StatCard icon={CheckCircle2} label="Field Maps" value={completeFieldMaps} sub={`${templateFieldMaps.length} tracked`} tone="info" />
        <StatCard icon={CheckCircle2} label="Hash Verified" value={hashVerification.verified} sub={`${hashVerification.mismatched} mismatches`} tone="success" />
        <StatCard icon={Archive} label="Deferred/Future" value={deferredOrFuture} sub="Explicitly visible" tone="warning" />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <DataTable
          keyField="id"
          columns={[
            { key: 'name', label: 'Template Source' },
            { key: 'fileType', label: 'File' },
            { key: 'registryStatus', label: 'Status' },
            { key: 'approval', label: 'Approval' },
            { key: 'hash', label: 'Hash' },
            { key: 'requirements', label: 'Reqs' },
            { key: 'fieldMaps', label: 'Maps' },
            { key: 'disposition', label: 'Disposition' },
          ]}
          rows={sourceRows}
          empty="No template sources are available."
          emptyDescription="Template registry rows will appear after local template sources are indexed."
          search={{ placeholder: 'Search sources, status, approval, hash, or path...', keys: ['name', 'fileType', 'registryStatus', 'approval', 'hash', 'disposition', 'sourcePath'] }}
          filters={[
            { id: 'fileType', label: 'File Type' },
            { id: 'registryStatus', label: 'Status' },
            { id: 'approval', label: 'Approval' },
            { id: 'hash', label: 'Hash' },
          ]}
          pageSize={12}
        />

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-accent)]">Registry Snapshot</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">Pilot readiness controls</h2>
            </div>
            <Badge variant="primary">{templateRegistryGeneratedAt.slice(0, 10)}</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {templateRegistryPlaceholders.map((placeholder) => (
              <div
                key={placeholder.id}
                className="rounded-[var(--radius-md)] p-3"
                style={{ border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{label(placeholder.kind)}</p>
                  <Badge variant={placeholder.disposition === 'DEFERRED' ? 'warning' : 'info'}>
                    {label(placeholder.disposition)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-5 text-[var(--color-text-muted)]">{placeholder.notes}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <DataTable
        keyField="id"
        columns={[
          { key: 'requirement', label: 'Document Requirement' },
          { key: 'phase', label: 'Phase' },
          { key: 'responsible', label: 'Owner' },
          { key: 'reviewer', label: 'Reviewer' },
          { key: 'applicability', label: 'Applicability' },
          { key: 'cpt', label: 'CPT' },
          { key: 'fieldMap', label: 'Field Map' },
          { key: 'readiness', label: 'Readiness' },
        ]}
        rows={requirementRows}
        empty="No document requirements are available."
        emptyDescription="Requirement rows will appear after the registry metadata source is loaded."
        search={{ placeholder: 'Search requirements, phase, owner, reviewer, applicability, CPT, or readiness...', keys: ['requirement', 'phase', 'responsible', 'reviewer', 'applicability', 'cpt', 'fieldMap', 'readiness'] }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'responsible', label: 'Owner' },
          { id: 'reviewer', label: 'Reviewer' },
          { id: 'fieldMap', label: 'Field Map' },
          { id: 'readiness', label: 'Readiness' },
        ]}
        pageSize={12}
      />
    </PageStack>
  );
}
