import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { generatedDocuments, treatmentCourses } from '@/lib/services/operational-page-service';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseDocuments, patientActiveCourse } from '@/lib/workflow';

export default function PatientDocumentsPage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess('Render patient documents page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const docs = courseDocuments(course.id, generatedDocuments);
  const rows = docs.map((doc) => ({
    id: doc.id,
    name: doc.name,
    category: doc.clinicalPhase?.replace(/_/g, ' ') ?? '—',
    status: doc.status ?? '—',
    assignedTo: doc.assignedTo ?? '—',
    updatedAt: doc.lastUpdatedAt ?? '—',
  }));

  return (
    <PageStack>
      <PageHeader
        title="Documents"
        subtitle={`${patient.firstName} ${patient.lastName} | ${course.id.replace('COURSE-', 'C')}`}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: patient.firstName + ' ' + patient.lastName, href: `/patients/${patient.id}` },
          { label: 'Documents', href: `/patients/${patient.id}/documents` },
        ]}
      />

      <DataTable
        keyField="id"
        columns={[
          { key: 'name', label: 'Document' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status' },
          { key: 'assignedTo', label: 'Assigned To' },
          { key: 'updatedAt', label: 'Last Updated' },
        ]}
        rows={rows}
        empty="No documents are available for this patient course."
        emptyDescription="Course documents will appear after document requirements are generated."
        search={{ placeholder: 'Search documents by name, category, or status...', keys: ['name', 'category', 'status', 'assignedTo'] }}
        filters={[
          { id: 'category', label: 'Category' },
          { id: 'status', label: 'Status' },
          { id: 'assignedTo', label: 'Assigned To' },
        ]}
      />
    </PageStack>
  );
}
