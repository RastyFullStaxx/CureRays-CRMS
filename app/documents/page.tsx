export const dynamic = 'force-dynamic';

import { DocumentsCommandClient, type DocumentCommandRow } from '@/components/documents/documents-command-client';
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from '@/lib/services/operational-page-service';

export default function DocumentsPage() {
  const documents = moduleSnapshot.documents;
  const generated = moduleSnapshot.generatedDocuments;
  const metrics = {
    total: documents.length,
    pending: documents.filter((document) => ['READY_FOR_REVIEW', 'PENDING'].includes(document.status)).length,
    pendingSignatures: generated.filter((document) => document.signReviewState === 'READY_FOR_SIGNATURE').length,
    signed: documents.filter((document) => document.signedAt).length,
    uploaded: documents.filter((document) => document.uploadedToEcwAt).length,
    locked: documents.filter((document) => document.lockedAt).length,
  };
  const rows: DocumentCommandRow[] = documents.map(({ patientId, ...document }) => ({
    ...document,
    patientToken: patientLabel(patientId),
    courseToken: document.courseId.replace('COURSE-', 'C'),
    phase: phaseLabel(document.category),
    statusLabel: statusLabel(document.status),
    statusTone: statusTone(document.status),
    lifecycle: document.manualEditExceptionAt
      ? 'Manual edit exception'
      : document.voidedAt
        ? 'Voided'
        : document.uploadedToEcwAt
          ? 'Uploaded to eCW'
          : document.lockedAt
            ? 'Locked'
            : document.latestOutputStatus ?? 'No output',
  }));

  return <DocumentsCommandClient rows={rows} metrics={metrics} />;
}
