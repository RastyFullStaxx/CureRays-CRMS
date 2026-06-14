export const dynamic = 'force-dynamic';

import { AuditCommandClient, type AuditCommandRow } from '@/components/audit/audit-command-client';
import {
  billingItems,
  moduleSnapshot,
  patientLabel,
  patientMrn,
  phaseLabel,
  statusLabel,
} from '@/lib/services/operational-page-service';

function readinessLabel(score: number) {
  if (score >= 86) return 'Ready';
  if (score >= 72) return 'Review';
  return 'Blocked';
}

function readinessScore(input: {
  blockedChecks: number;
  missingDocuments: number;
  unsignedDocuments: number;
  billingOpen: number;
  openTasks: number;
  fractionGaps: number;
}) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100
          - input.blockedChecks * 14
          - input.missingDocuments * 10
          - input.unsignedDocuments * 8
          - input.billingOpen * 8
          - input.openTasks * 4
          - input.fractionGaps * 5,
      ),
    ),
  );
}

export default function AuditPage() {
  const rows: AuditCommandRow[] = moduleSnapshot.courses.map((course) => {
    const checks = moduleSnapshot.auditChecks.filter((check) => check.courseId === course.id);
    const documents = moduleSnapshot.generatedDocuments.filter((document) => document.courseId === course.id);
    const billing = billingItems.filter((item) => item.courseId === course.id);
    const fractions = moduleSnapshot.fractions.filter((fraction) => fraction.courseId === course.id);
    const tasks = moduleSnapshot.tasks.filter((task) => task.courseId === course.id);

    const requiredChecks = checks.filter((check) => check.required).length;
    const openChecks = checks.filter((check) => !['COMPLETED', 'SIGNED', 'UPLOADED', 'NOT_APPLICABLE'].includes(check.status)).length;
    const blockedChecks = checks.filter((check) => ['BLOCKED', 'OVERDUE', 'MISSING_FIELDS'].includes(check.status)).length;
    const missingDocuments = documents.filter((document) => !document.auditReady).length;
    const unsignedDocuments = documents.filter((document) => document.signReviewState !== 'SIGNED').length;
    const billingOpen = billing.filter((item) => !['COMPLETED', 'NOT_APPLICABLE'].includes(item.status) || item.completedQuantity < item.plannedQuantity).length;
    const fractionGaps = fractions.filter((fraction) => !['COMPLETED', 'SIGNED', 'NOT_APPLICABLE'].includes(fraction.status)).length;
    const openTasks = tasks.filter((task) => !['COMPLETED', 'SIGNED', 'NOT_APPLICABLE'].includes(task.status)).length;
    const readinessPct = readinessScore({
      blockedChecks,
      missingDocuments,
      unsignedDocuments,
      billingOpen,
      openTasks,
      fractionGaps,
    });

    return {
      id: course.id,
      patientId: course.patientId,
      patient: patientLabel(course.patientId),
      patientRef: patientMrn(course.patientId),
      courseId: course.id,
      course: course.id.replace('COURSE-', 'C'),
      diagnosis: course.diagnosisType,
      phase: phaseLabel(course.currentPhase),
      status: statusLabel(course.status),
      readiness: readinessLabel(readinessPct),
      readinessPct,
      requiredChecks,
      openChecks,
      blockedChecks,
      missingDocuments,
      unsignedDocuments,
      billingOpen,
      fractionGaps,
      openTasks,
      followUp: openTasks > 0 ? 'Needed' : 'Scheduled',
      nextAction: course.nextAction,
      flags: course.flagsIssues,
    };
  });

  const averageReadiness = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.readinessPct, 0) / rows.length)
    : 0;

  return (
    <AuditCommandClient
      rows={rows}
      stats={{
        total: rows.length,
        closeoutQueue: rows.filter((row) => ['Audit', 'Post Tx'].includes(row.phase)).length,
        blockedChecks: rows.reduce((total, row) => total + row.blockedChecks, 0),
        missingDocuments: rows.reduce((total, row) => total + row.missingDocuments, 0),
        unsignedDocuments: rows.reduce((total, row) => total + row.unsignedDocuments, 0),
        billingOpen: rows.reduce((total, row) => total + row.billingOpen, 0),
        averageReadiness,
      }}
    />
  );
}
