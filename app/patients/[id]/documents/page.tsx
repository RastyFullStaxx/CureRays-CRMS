import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { generatedDocuments, treatmentCourses, billingCodes } from '@/lib/clinical-store';
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
        rows={docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
          category: doc.clinicalPhase?.replace(/_/g, ' ') ?? '—',
          status: doc.status ?? '—',
          assignedTo: doc.assignedTo ?? '—',
          updatedAt: doc.lastUpdatedAt ?? '—',
        }))}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search documents by name, category, or status..." />
            </FilterField>
            <FilterField><Input placeholder="Category" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
