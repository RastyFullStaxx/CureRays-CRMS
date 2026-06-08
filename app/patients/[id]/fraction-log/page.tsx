import { notFound } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { fractionLogEntries, treatmentCourses } from '@/lib/clinical-store';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseFractions, patientActiveCourse } from '@/lib/workflow';

export default function PatientFractionLogPage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess('Render patient fraction log page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const entries = courseFractions(course.id, fractionLogEntries);

  return (
    <PageStack>
      <PageHeader
        title="Fraction Log"
        subtitle={`${patient.firstName} ${patient.lastName} | ${course.id.replace('COURSE-', 'C')}`}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: patient.firstName + ' ' + patient.lastName, href: `/patients/${patient.id}` },
          { label: 'Fraction Log', href: `/patients/${patient.id}/fraction-log` },
        ]}
      />

      <DataTable
        keyField="id"
        columns={[
          { key: 'fraction', label: 'Fraction #' },
          { key: 'date', label: 'Date' },
          { key: 'site', label: 'Treatment Site' },
          { key: 'dose', label: 'Dose (Gy)' },
          { key: 'status', label: 'Status' },
          { key: 'notes', label: 'Notes' },
        ]}
        rows={entries.map((entry, index) => ({
          id: entry.id,
          fraction: `${index + 1}`,
          date: entry.date ?? '—',
          site: entry.phase ?? '—',
          dose: entry.dosePerFraction ?? '—',
          status: entry.mdApproval && entry.dotApproval ? 'APPROVED' : entry.mdApproval ? 'MD APPROVED' : 'PENDING',
          notes: entry.notes ?? '—',
        }))}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search fraction log entries..." />
            </FilterField>
            <FilterField><Input placeholder="Date Range" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
