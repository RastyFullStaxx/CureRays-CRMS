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
import { carepathPhaseLabels, responsiblePartyLabels } from '@/lib/workflow';

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
      sourceId: requirement.templateSourceId,
      phase: carepathPhaseLabels[requirement.workflowPhase],
      responsible: responsiblePartyLabels[requirement.responsibleParty],
      reviewer: requirement.reviewerRole ? responsiblePartyLabels[requirement.reviewerRole] : 'Pending',
      applicability,
      cpt: requirement.cptCode ?? label(requirement.cptRelevance),
      fieldMap: fieldMap ? label(fieldMap.status) : 'Missing',
      readiness: readiness.readyForPilot ? 'Ready for pilot' : label(readiness.generationReadiness),
    };
  });

  const placeholders: TemplatePlaceholderRow[] = templateRegistryPlaceholders.map((placeholder) => ({
    id: placeholder.id,
    kind: label(placeholder.kind),
    disposition: label(placeholder.disposition),
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
