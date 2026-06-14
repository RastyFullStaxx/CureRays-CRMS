export const dynamic = 'force-dynamic';

import { ClinicalFormsCommandClient, type ClinicalFormCommandRow } from '@/components/clinical-forms/clinical-forms-command-client';
import {
  clinicalDocumentRows,
  generatedDocuments,
  handJointRows,
  patientLabel,
  patientMrn,
  statusLabel,
} from '@/lib/services/operational-page-service';

function missingFieldCount(status: string, auditReady: boolean) {
  if (['BLOCKED', 'MISSING_FIELDS', 'NOT_STARTED'].includes(status)) return 3;
  if (['PENDING', 'PENDING_NEEDED', 'NEEDS_REVIEW'].includes(status)) return auditReady ? 0 : 1;
  return 0;
}

export default function ClinicalFormsPage() {
  const rows: ClinicalFormCommandRow[] = clinicalDocumentRows.map((document) => {
    const generatedDocument = generatedDocuments.find((candidate) => candidate.id === document.id);
    const auditReady = generatedDocument?.auditReady ?? false;
    const signReviewState = generatedDocument?.signReviewState ?? 'NOT_STARTED';
    const requiredAction = generatedDocument?.requiredAction ?? document.naReason ?? 'Review structured fields';
    const missingFields = missingFieldCount(document.status, auditReady);

    return {
      id: document.id,
      patientId: document.patientId,
      patient: patientLabel(document.patientId),
      patientRef: patientMrn(document.patientId),
      courseId: document.courseId,
      course: document.courseId.replace('COURSE-', 'C'),
      title: document.title,
      formType: document.formType,
      phase: document.phase,
      status: statusLabel(document.status),
      rawStatus: document.status,
      lastUpdated: document.generatedAt ?? 'Pending',
      assignedStaff: document.assignedStaff,
      requiredAction,
      signReviewState,
      auditReady,
      mappedFields: 6,
      missingFields,
      route: `${document.phase} -> ${statusLabel(document.status)}`,
    };
  });

  return (
    <ClinicalFormsCommandClient
      rows={rows}
      handJointRows={handJointRows}
      stats={{
        drafts: rows.filter((row) => ['NOT_STARTED', 'PENDING', 'PENDING_NEEDED'].includes(row.rawStatus)).length,
        review: rows.filter((row) => ['READY_FOR_REVIEW', 'NEEDS_REVIEW'].includes(row.rawStatus)).length,
        signed: rows.filter((row) => row.signReviewState === 'SIGNED').length,
        missingFields: rows.reduce((total, row) => total + row.missingFields, 0),
        total: rows.length,
      }}
    />
  );
}
