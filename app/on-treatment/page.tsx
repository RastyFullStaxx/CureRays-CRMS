import { CalendarDays, UsersRound, ClipboardList, FileText } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import {
  carepathTasks,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';

export default function OnTreatmentPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const onTreatment = patients.filter((p) => p.chartRoundsPhase === 'ON_TREATMENT');
  const rows = onTreatment.map((patient) => {
    const course = treatmentCourses.find((c) => c.patientRef === patient.patientRef);
    return {
      id: patient.id,
      name: patient.displayLabel,
      mrn: patient.patientRef,
      diagnosis: patient.diagnosisCategory,
      phase: patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '—',
      course: course ? course.id.replace('COURSE-', 'C') : '—',
      status: patient.chartRoundsPhase ?? '—',
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="On Treatment"
        subtitle="Patients actively receiving radiation therapy"
      />

      <StatGrid>
        <StatCard icon={UsersRound} label="On Treatment" value={onTreatment.length} tone="success" />
        <StatCard icon={CalendarDays} label="Total Courses" value={treatmentCourses.length} tone="primary" />
        <StatCard icon={ClipboardList} label="Carepath Tasks" value={carepathTasks.length} />
        <StatCard icon={FileText} label="Documents" value={generatedDocuments.length} tone="info" />
      </StatGrid>

      <DataTable
        keyField="id"
        columns={[
          { key: 'name', label: 'Patient' },
          { key: 'mrn', label: 'MRN' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase' },
          { key: 'course', label: 'Course' },
          { key: 'status', label: 'Status' },
        ]}
        rows={rows}
        search={{ placeholder: 'Search on-treatment patients by name, MRN, or diagnosis...', keys: ['name', 'mrn', 'diagnosis', 'course', 'status'] }}
        filters={[
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'course', label: 'Course' },
        ]}
      />
    </PageStack>
  );
}
