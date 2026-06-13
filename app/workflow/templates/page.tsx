import {
  WorkflowTemplateCommandClient,
  type WorkflowTemplateRequirementRow,
  type WorkflowTemplateRow,
  type WorkflowTemplateStats,
} from '@/components/workflow/workflow-template-command-client';
import {
  documentRequirements,
  fieldMapForRequirement,
  readinessForRequirement,
  templateSources,
  workflowDefinitions,
} from '@/lib/services/operational-page-service';
import { carepathPhaseLabels } from '@/lib/workflow';

function label(value: string | undefined) {
  return value ? value.replace(/_/g, ' ') : 'Not set';
}

function sourceCoverageLabel(requirements: WorkflowTemplateRequirementRow[]) {
  const missing = requirements.filter((requirement) => requirement.sourceStatus === 'Missing source').length;
  if (missing === 0) return 'Complete source coverage';
  if (missing === requirements.length) return 'Missing sources';
  return `${requirements.length - missing}/${requirements.length} sources`;
}

export default function WorkflowTemplatesPage() {
  const requirementRows: WorkflowTemplateRequirementRow[] = documentRequirements.map((requirement) => {
    const source = requirement.templateSourceId
      ? templateSources.find((item) => item.id === requirement.templateSourceId)
      : undefined;
    const fieldMap = fieldMapForRequirement(requirement);
    const readiness = readinessForRequirement(requirement);

    return {
      id: requirement.id,
      workflowIds: workflowDefinitions
        .filter((workflow) => workflow.documentRequirementIds.includes(requirement.id))
        .map((workflow) => workflow.id),
      requirement: requirement.name,
      phase: carepathPhaseLabels[requirement.workflowPhase],
      owner: label(requirement.responsibleParty),
      reviewer: label(requirement.reviewerRole),
      source: source?.name ?? 'No mapped source',
      sourceStatus: source ? label(source.status) : 'Missing source',
      fieldMap: fieldMap ? label(fieldMap.status) : 'Missing field map',
      readiness: readiness.readyForPilot ? 'Pilot ready' : label(requirement.generationReadiness ?? requirement.pilotScope),
      action: requirement.requiredAction,
      outputs: requirement.outputFormats.join(', '),
      cpt: requirement.cptCode ?? 'Not CPT linked',
      task: requirement.createsTask ? 'Creates task' : 'Document only',
      auditSteps: requirement.auditSteps?.length ?? 0,
    };
  });

  const workflows: WorkflowTemplateRow[] = workflowDefinitions.map((workflow) => {
    const linkedRequirements = requirementRows.filter((requirement) => requirement.workflowIds.includes(workflow.id));

    return {
      id: workflow.id,
      name: workflow.name,
      diagnosis: label(workflow.diagnosis),
      protocol: workflow.protocol,
      status: label(workflow.status),
      phases: workflow.phases.map((phase) => carepathPhaseLabels[phase]),
      totalRequirements: linkedRequirements.length,
      pilotReady: linkedRequirements.filter((requirement) => requirement.readiness === 'Pilot ready').length,
      completeFieldMaps: linkedRequirements.filter((requirement) => requirement.fieldMap === 'COMPLETE').length,
      taskCreatingRequirements: linkedRequirements.filter((requirement) => requirement.task === 'Creates task').length,
      deferredRequirements: linkedRequirements.filter((requirement) => requirement.readiness.includes('DEFERRED')).length,
      sourceCoverage: sourceCoverageLabel(linkedRequirements),
      description: workflow.description,
    };
  });

  const stats: WorkflowTemplateStats = {
    workflowCount: workflows.length,
    activeWorkflows: workflows.filter((workflow) => workflow.status === 'ACTIVE').length,
    mappingWorkflows: workflows.filter((workflow) => workflow.status.includes('MAPPING')).length,
    requirementCount: requirementRows.length,
    pilotReadyRequirements: requirementRows.filter((requirement) => requirement.readiness === 'Pilot ready').length,
    completeFieldMaps: requirementRows.filter((requirement) => requirement.fieldMap === 'COMPLETE').length,
    deferredRequirements: requirementRows.filter((requirement) => requirement.readiness.includes('DEFERRED')).length,
  };

  return (
    <WorkflowTemplateCommandClient
      stats={stats}
      workflows={workflows}
      requirements={requirementRows}
    />
  );
}
