import { PageStack } from '@/components/shared/page-stack';
import { FractionWorksheetPanel } from '@/components/fraction-worksheet-panel';
import {
  IgsrtCommandClient,
  type IgsrtCommandSummary,
  type IgsrtDocumentRow,
  type IgsrtGateRow,
} from '@/components/workflow/igsrt-command-client';
import { courseRef, patientRef } from '@/lib/hipaa';
import { getIgsrtWorkspace } from '@/lib/services/operational-page-service';
import { formatUiLabel } from '@/lib/ui-copy';
import { carepathPhaseLabels } from '@/lib/workflow';

function yesNo(value: boolean) {
  return value ? 'Yes' : 'No';
}

function signedLabel(value: string | undefined) {
  return value ? `Signed ${value.slice(0, 10)}` : 'Signature pending';
}

function gateRow(gate: IgsrtGateRow): IgsrtGateRow {
  return gate;
}

export default function IgsrtWorkflowPage() {
  const workspace = getIgsrtWorkspace('COURSE-2401');
  const summary: IgsrtCommandSummary = {
    patientRef: patientRef(workspace.patient.id),
    courseRef: courseRef(workspace.course.id),
    diagnosis: workspace.course.diagnosis,
    site: workspace.prescription.site,
    laterality: workspace.prescription.laterality,
    protocol: workspace.course.protocolName,
    courseStatus: formatUiLabel(workspace.course.status),
    currentFraction: workspace.course.currentFraction,
    totalFractions: workspace.course.totalFractions,
    simulationStatus: formatUiLabel(workspace.simulationOrder.status),
    simulationSigned: signedLabel(workspace.simulationOrder.signedAt),
    prescriptionStatus: formatUiLabel(workspace.prescription.status),
    prescriptionSigned: signedLabel(workspace.prescription.signedAt),
    sensusVerified: yesNo(workspace.prescription.verifiedInSensus),
    preAuthorized: yesNo(workspace.prescription.preAuthorized),
    scheduleStatus: formatUiLabel(workspace.planningReadiness.status),
    scheduledFractions: workspace.planningReadiness.scheduledFractions,
    plannedFractions: workspace.planningReadiness.plannedFractions,
    recordedFractions: workspace.courseFractions.length,
    clinicalValidationStatus: workspace.planningReadiness.clinicianSignoffStatus,
    missingInputs: workspace.planningReadiness.missingInputs,
  };
  const documents: IgsrtDocumentRow[] = workspace.courseDocuments.map((document) => ({
    id: document.id,
    name: document.name,
    phase: carepathPhaseLabels[document.clinicalPhase],
    owner: formatUiLabel(document.responsibleParty),
    status: formatUiLabel(document.status),
    signature: formatUiLabel(document.signReviewState),
    auditReady: document.auditReady ? 'Audit Ready' : 'Audit Pending',
    requiredAction: document.requiredAction,
  }));
  const gates: IgsrtGateRow[] = [
    gateRow({
      id: workspace.imagingGateStatus.label,
      gate: workspace.imagingGateStatus.label,
      status: workspace.imagingGateStatus.status,
      detail: workspace.imagingGateStatus.detail,
      dueFractions: workspace.imagingGateStatus.dueFractions.length
        ? workspace.imagingGateStatus.dueFractions.map((fraction) => `Fx ${fraction}`).join(', ')
        : 'None',
      evidence: workspace.imagingGateStatus.evidenceIds.length.toString(),
    }),
    gateRow({
      id: workspace.otvDueStatus.label,
      gate: workspace.otvDueStatus.label,
      status: workspace.otvDueStatus.status,
      detail: workspace.otvDueStatus.detail,
      dueFractions: workspace.otvDueStatus.dueFractions.length
        ? workspace.otvDueStatus.dueFractions.map((fraction) => `Fx ${fraction}`).join(', ')
        : 'None',
      evidence: workspace.otvDueStatus.evidenceIds.length.toString(),
    }),
    gateRow({
      id: workspace.physicsCheckDueStatus.label,
      gate: workspace.physicsCheckDueStatus.label,
      status: workspace.physicsCheckDueStatus.status,
      detail: workspace.physicsCheckDueStatus.detail,
      dueFractions: workspace.physicsCheckDueStatus.dueFractions.length
        ? workspace.physicsCheckDueStatus.dueFractions.map((fraction) => `Fx ${fraction}`).join(', ')
        : 'None',
      evidence: workspace.physicsCheckDueStatus.evidenceIds.length.toString(),
    }),
  ];

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <IgsrtCommandClient summary={summary} documents={documents} gates={gates} />

      <FractionWorksheetPanel
        initialEntries={workspace.courseFractions}
        course={workspace.course}
        phases={workspace.prescription.phases}
        title="IGSRT Fractionation Worksheet"
      />
    </PageStack>
  );
}
