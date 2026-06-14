export const dynamic = 'force-dynamic';

import {
  TreatmentDeliveryCommandClient,
  type TreatmentDeliveryCommandRow,
} from '@/components/treatment-delivery/treatment-delivery-command-client';
import {
  moduleSnapshot,
  patientLabel,
  patientMrn,
  statusLabel,
} from '@/lib/services/operational-page-service';

function gateLabel(status?: string) {
  if (!status) return 'Not Required';
  return statusLabel(status);
}

export default function TreatmentDeliveryPage() {
  const rows: TreatmentDeliveryCommandRow[] = moduleSnapshot.fractions.map((fraction, index) => {
    const course = moduleSnapshot.treatmentCourses.find((item) => item.id === fraction.courseId);
    const patientId = course?.patientId ?? 'UNKNOWN';
    const totalFractions = course?.totalFractions ?? Math.max(fraction.fractionNumber, 1);
    const alerts = [
      fraction.imageGuidanceStatus === 'MISSING' ? 'Image' : null,
      fraction.otvRequired && !fraction.otvCompletedAt ? 'OTV' : null,
      fraction.physicsCheckRequired && !fraction.physicsCheckCompletedAt ? 'Physics' : null,
    ].filter(Boolean).join(', ') || 'Clear';

    return {
      id: fraction.id,
      patientId,
      patient: patientLabel(patientId),
      patientRef: patientMrn(patientId),
      courseId: fraction.courseId,
      course: fraction.courseId.replace('COURSE-', 'C'),
      fractionNumber: fraction.fractionNumber,
      fractionLabel: `${fraction.fractionNumber} of ${totalFractions}`,
      phase: fraction.phase,
      treatmentDate: fraction.treatmentDate,
      apptTime: `${8 + index}:00 AM`,
      room: index % 2 ? 'Room 2' : 'Room 1',
      therapist: fraction.therapistId ?? 'Unassigned',
      plannedDose: fraction.plannedDose,
      deliveredDose: fraction.deliveredDose ?? null,
      cumulativeDose: fraction.cumulativeDose,
      totalFractions,
      progressPct: Math.min(Math.round((fraction.fractionNumber / totalFractions) * 100), 100),
      imageGuidanceStatus: gateLabel(fraction.imageGuidanceStatus),
      imageGuidanceCompleted: fraction.imageGuidanceCompleted,
      imageEvidence: fraction.imageAssetIds?.length ?? 0,
      otvRequired: Boolean(fraction.otvRequired),
      otvComplete: Boolean(fraction.otvCompletedAt),
      physicsRequired: Boolean(fraction.physicsCheckRequired),
      physicsComplete: Boolean(fraction.physicsCheckCompletedAt),
      status: statusLabel(fraction.status),
      alerts,
      notes: fraction.notes ?? 'No treatment delivery note recorded',
    };
  });

  return (
    <TreatmentDeliveryCommandClient
      rows={rows}
      stats={{
        scheduled: rows.length,
        inProgress: rows.filter((row) => row.status === 'In Progress').length,
        completed: rows.filter((row) => row.status === 'Completed').length,
        held: rows.filter((row) => ['Blocked', 'Overdue'].includes(row.status)).length,
        otvDue: rows.filter((row) => row.otvRequired && !row.otvComplete).length,
        physicsDue: rows.filter((row) => row.physicsRequired && !row.physicsComplete).length,
      }}
    />
  );
}
