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
} from '@/lib/services/operational-page-service';

export default function PostPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const postPatients = patients.filter((p) => p.chartRoundsPhase === 'POST');
  const rows = postPatients.map((patient) => {
    const course = treatmentCourses.find((c) => c.patientRef === patient.patientRef);
    return {
      id: patient.id,
      name: patient.displayLabel,
      mrn: patient.patientRef,
      diagnosis: patient.diagnosisCategory ?? '—',
      phase: patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '—',
      course: course ? course.id.replace('COURSE-', 'C') : '—',
      status: patient.chartRoundsPhase ?? '—',
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="Post-Treatment"
        subtitle="Patients who have completed their radiation therapy course"
      />

      <StatGrid>
        <StatCard icon={UsersRound} label="Post-Treatment" value={postPatients.length} tone="primary" />
        <StatCard icon={CalendarDays} label="Total Courses" value={treatmentCourses.length} />
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
        empty="No post-treatment patients are available."
        emptyDescription="Patients will appear here after their chart-rounds phase moves to post-treatment."
        search={{ placeholder: 'Search post-treatment patients by name, MRN, or diagnosis...', keys: ['name', 'mrn', 'diagnosis', 'course', 'status'] }}
        filters={[
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'course', label: 'Course' },
        ]}
      />
    </PageStack>
  );
}
