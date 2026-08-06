import {
  TemplatesCommandClient,
  type TemplatePlaceholderRow,
  type TemplateRequirementRow,
  type TemplateSourceRow,
} from '@/components/templates/templates-command-client';
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
import { formatUiLabel } from '@/lib/ui-copy';
import { carepathPhaseLabels, responsiblePartyLabels } from '@/lib/workflow';

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
      registryStatus: formatUiLabel(source.status),
      approval: formatUiLabel(source.approvalStatus),
      hash: hash?.status ? formatUiLabel(hash.status) : 'Pending',
      requirements: `${linkedRequirements.length}`,
      fieldMaps: `${linkedFieldMaps.length}`,
      disposition: placeholder ? formatUiLabel(placeholder.disposition) : source.approvedForPilot ? 'Pilot Approved' : 'Mapping Review',
      sourcePath: source.sourceFileName,
    };
  });

  const requirementRows: TemplateRequirementRow[] = documentRequirements.map((requirement) => {
    const readiness = readinessForRequirement(requirement);
    const fieldMap = fieldMapForRequirement(requirement);
    const applicability = [
      formatUiLabel(requirement.applicability.diagnosis),
      requirement.applicability.protocol,
      requirement.applicability.bodyRegion,
      requirement.applicability.laterality ? `Laterality ${formatUiLabel(requirement.applicability.laterality)}` : undefined,
    ].filter(Boolean).join(' / ');

    return {
      id: requirement.id,
      requirement: requirement.name,
      sourceId: requirement.templateSourceId,
      phase: carepathPhaseLabels[requirement.workflowPhase],
      responsible: responsiblePartyLabels[requirement.responsibleParty],
      reviewer: requirement.reviewerRole ? responsiblePartyLabels[requirement.reviewerRole] : 'Pending',
      applicability,
      cpt: requirement.cptCode ?? formatUiLabel(requirement.cptRelevance),
      fieldMap: fieldMap ? formatUiLabel(fieldMap.status) : 'Missing',
      readiness: readiness.readyForPilot ? 'Ready for Pilot' : formatUiLabel(readiness.generationReadiness),
    };
  });

  const placeholders: TemplatePlaceholderRow[] = templateRegistryPlaceholders.map((placeholder) => ({
    id: placeholder.id,
    kind: formatUiLabel(placeholder.kind),
    disposition: formatUiLabel(placeholder.disposition),
    notes: placeholder.notes,
  }));

  return (
    <TemplatesCommandClient
      stats={{
        active: templateSources.filter((source) => source.status === 'ACTIVE').length,
        sourceCount: templateSources.length,
        pilotApproved: templateSources.filter((source) => source.approvalStatus === 'PILOT_APPROVED').length,
        completeFieldMaps: templateFieldMaps.filter((fieldMap) => fieldMap.status === 'COMPLETE').length,
        fieldMapCount: templateFieldMaps.length,
        hashVerified: hashVerification.verified,
        hashMismatched: hashVerification.mismatched,
        deferredOrFuture: templateRegistryPlaceholders.length + documentRequirements.filter((item) => item.pilotScope === 'DEFERRED').length,
        schemaVersion: templateRegistrySchemaVersion,
        generatedAt: templateRegistryGeneratedAt,
      }}
      sourceRows={sourceRows}
      requirementRows={requirementRows}
      placeholders={placeholders}
    />
  );
}
