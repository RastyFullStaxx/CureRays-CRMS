import { Database } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';

export default function RecordsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();

  return (
    <PageStack>
      <PageHeader
        title="Master Records"
        subtitle="The controlled operational index for CureRays patients. Every workflow page should derive from these records."
      />

      <StatGrid>
        <StatCard icon={Database} label="Total Records" value={patients.length} tone="primary" />
        <StatCard icon={Database} label="Active Courses" value={treatmentCourses.length} tone="success" />
        <StatCard icon={Database} label="Carepath Tasks" value={carepathTasks.length} />
        <StatCard icon={Database} label="Documents" value={generatedDocuments.length} tone="info" />
        <StatCard icon={Database} label="Fractions" value={fractionLogEntries.length} />
      </StatGrid>

      <DataTable
        keyField="id"
        columns={[
          { key: 'name', label: 'Patient' },
          { key: 'mrn', label: 'MRN' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase' },
          { key: 'course', label: 'Active Course' },
          { key: 'fractions', label: 'Fractions' },
          { key: 'documents', label: 'Documents' },
          { key: 'status', label: 'Status' },
        ]}
        rows={patients.map((patient) => {
          const course = treatmentCourses.find((c) => c.patientRef === patient.id);
          return {
            id: patient.id,
            name: patient.displayLabel,
            mrn: patient.patientRef,
            diagnosis: patient.diagnosisCategory ?? '—',
            phase: patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '—',
            course: course ? course.id.replace('COURSE-', 'C') : '—',
            fractions: fractionLogEntries.filter((f) => f.courseId === course?.id).length || '—',
            documents: generatedDocuments.filter((d) => d.courseId === course?.id).length || '—',
            status: patient.chartRoundsPhase ?? '—',
          };
        })}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search master records by name, MRN, diagnosis, or phase..." />
            </FilterField>
            <FilterField><Input placeholder="Phase" /></FilterField>
            <FilterField><Input placeholder="Diagnosis" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
