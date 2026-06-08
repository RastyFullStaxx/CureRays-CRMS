import { CalendarDays, UsersRound, ClipboardList, FileText } from 'lucide-react';
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
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';

export default function UpcomingPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const upcoming = patients.filter((p) => p.chartRoundsPhase === 'UPCOMING');

  return (
    <PageStack>
      <PageHeader
        title="Upcoming"
        subtitle="Patients awaiting treatment initiation and planning"
      />

      <StatGrid>
        <StatCard icon={UsersRound} label="Upcoming Patients" value={upcoming.length} tone="info" />
        <StatCard icon={CalendarDays} label="Total Courses" value={treatmentCourses.length} tone="primary" />
        <StatCard icon={ClipboardList} label="Carepath Tasks" value={carepathTasks.length} />
        <StatCard icon={FileText} label="Documents" value={generatedDocuments.length} tone="success" />
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
        rows={upcoming.map((patient) => {
          const course = treatmentCourses.find((c) => c.patientRef === patient.id);
          return {
            id: patient.id,
            name: patient.displayLabel,
            mrn: patient.patientRef,
            diagnosis: patient.diagnosisCategory ?? '—',
            phase: patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '—',
            course: course ? course.id.replace('COURSE-', 'C') : '—',
            status: patient.chartRoundsPhase ?? '—',
          };
        })}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search upcoming patients by name, MRN, or diagnosis..." />
            </FilterField>
            <FilterField><Input placeholder="Diagnosis" /></FilterField>
            <FilterField><Input placeholder="Course" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
