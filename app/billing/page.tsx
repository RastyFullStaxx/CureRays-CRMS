export const dynamic = 'force-dynamic';

import { BillingCommandClient, type BillingCommandRow } from '@/components/billing/billing-command-client';
import {
  billingItems,
  moduleSnapshot,
  patientLabel,
  patientMrn,
} from '@/lib/services/operational-page-service';

function auditStatus(courseId: string) {
  const checks = moduleSnapshot.auditChecks.filter((check) => check.courseId === courseId);
  const blocked = checks.filter((check) => ['BLOCKED', 'OVERDUE', 'READY_FOR_REVIEW'].includes(check.status)).length;

  if (blocked > 0) {
    return `${blocked} audit blockers`;
  }

  return checks.length ? 'Audit ready' : 'Audit pending';
}

export default function BillingPage() {
  const rows: BillingCommandRow[] = billingItems.map((item) => {
    const course = moduleSnapshot.treatmentCourses.find((candidate) => candidate.id === item.courseId);
    const document = moduleSnapshot.documents.find((candidate) => candidate.id === item.linkedDocumentId);
    const fractions = moduleSnapshot.fractions.filter((fraction) => fraction.courseId === item.courseId);
    const patientId = course?.patientId ?? 'UNKNOWN';

    return {
      id: item.id,
      patientId,
      patient: patientLabel(patientId),
      patientRef: patientMrn(patientId),
      courseId: item.courseId,
      course: item.courseId.replace('COURSE-', 'C'),
      code: item.code,
      description: item.description,
      planned: item.plannedQuantity,
      completed: item.completedQuantity,
      billed: item.billedQuantity,
      status: item.status,
      linkedDoc: item.linkedDocumentId ?? 'Pending',
      linkedDocTitle: document?.title ?? item.linkedDocumentId ?? 'Pending evidence',
      documentStatus: document?.status ?? 'PENDING',
      fractions: fractions.length,
      auditStatus: auditStatus(item.courseId),
      notes: item.notes ?? 'No billing note recorded',
    };
  });

  return (
    <BillingCommandClient
      rows={rows}
      stats={{
        total: billingItems.length,
        ready: billingItems.filter((item) => item.status === 'READY_FOR_REVIEW').length,
        review: billingItems.filter((item) => item.status === 'IN_PROGRESS').length,
        billed: billingItems.filter((item) => item.status === 'COMPLETED').length,
        blocked: billingItems.filter((item) => item.status === 'BLOCKED').length,
      }}
    />
  );
}
