export const dynamic = 'force-dynamic';

import {
  TreatmentPlanningCommandClient,
  type TreatmentPlanningCommandRow,
} from '@/components/treatment-planning/treatment-planning-command-client';
import {
  getPhase6GateStatuses,
  getPhase6PlanningReadiness,
  moduleSnapshot,
  patientLabel,
  patientMrn,
  responsiblePartyName,
  statusLabel,
} from '@/lib/services/operational-page-service';

function readinessLabel(status: string) {
  return statusLabel(status);
}

export default function TreatmentPlanningPage() {
  const rows: TreatmentPlanningCommandRow[] = moduleSnapshot.plans.map((plan) => {
    const readiness = getPhase6PlanningReadiness(plan.courseId);
    const gates = getPhase6GateStatuses(plan.courseId);
    const checklist = readiness.clinicalValidationChecklist;

    return {
      id: plan.id,
      patientId: plan.patientId,
      patient: patientLabel(plan.patientId),
      patientRef: patientMrn(plan.patientId),
      courseId: plan.courseId,
      course: plan.courseId.replace('COURSE-', 'C'),
      diagnosis: plan.diagnosisType,
      site: plan.site,
      energy: plan.energy ?? 'Pending',
      applicator: plan.applicatorSize ?? 'Pending',
      depth: plan.depthOfInvasion ?? 'Pending',
      dose: plan.dosePerFraction ?? 'Pending',
      totalDose: plan.totalDose ?? 'Pending',
      fractions: String(plan.totalFractions ?? readiness.plannedFractions ?? 'Pending'),
      coverage: plan.percentDepthDose ? `${plan.percentDepthDose}%` : 'Pending',
      readiness: readinessLabel(readiness.status),
      missingInputs: readiness.missingInputs,
      schedule: `${readiness.scheduledFractions}/${readiness.plannedFractions || plan.totalFractions || 0}`,
      scheduledFractions: readiness.scheduledFractions,
      plannedFractions: readiness.plannedFractions || plan.totalFractions || 0,
      imagingGate: statusLabel(gates.imagingGateStatus.status),
      imagingDue: gates.imagingGateStatus.dueFractions.length,
      otvGate: statusLabel(gates.otvDueStatus.status),
      otvDue: gates.otvDueStatus.dueFractions.length,
      physicsGate: statusLabel(gates.physicsCheckDueStatus.status),
      physicsDue: gates.physicsCheckDueStatus.dueFractions.length,
      physicistReview: statusLabel(plan.physicistReviewStatus),
      radOncSignature: statusLabel(plan.radOncSignatureStatus),
      locked: Boolean(plan.lockedAt),
      clinicalValidationStatus: checklist.status,
      referenceVersion: checklist.referenceVersion,
      checklist: checklist.items.map((item) => ({
        id: item.id,
        label: item.label,
        owner: responsiblePartyName(item.ownerRole),
        status: item.status,
        evidenceRequired: item.evidenceRequired,
      })),
    };
  });

  return (
    <TreatmentPlanningCommandClient
      rows={rows}
      stats={{
        open: rows.filter((row) => !row.locked).length,
        physics: rows.filter((row) => row.physicistReview === 'Ready For Review').length,
        radOnc: rows.filter((row) => row.radOncSignature === 'Ready For Review').length,
        scheduled: rows.filter((row) => row.scheduledFractions >= row.plannedFractions && row.plannedFractions > 0).length,
        total: rows.length,
        gated: rows.filter((row) => row.imagingGate === 'Blocked' || row.otvGate === 'Blocked' || row.physicsGate === 'Blocked').length,
        clinicalGate: rows.filter((row) => row.clinicalValidationStatus === 'REQUIRED').length,
      }}
    />
  );
}
