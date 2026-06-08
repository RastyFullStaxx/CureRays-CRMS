import { UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { patients, treatmentCourses, carepathTasks } from '@/lib/clinical-store';

export default function PatientsPage() {
  const activeCount = patients.filter((p) => p.chartRoundsPhase === 'ON_TREATMENT').length;
  const upcomingCount = patients.filter((p) => p.chartRoundsPhase === 'UPCOMING').length;
  const postCount = patients.filter((p) => p.chartRoundsPhase === 'POST').length;
  const totalTasks = carepathTasks.length;

  return (
    <PageStack>
      <PageHeader
        title="Patients"
        subtitle="Clinical patient registry and course tracking"
        actions={<Button><UsersRound className="h-4 w-4" /> Add Patient</Button>}
      />

      <StatGrid>
        <StatCard icon={UsersRound} label="Total Patients" value={patients.length} tone="primary" />
        <StatCard icon={UsersRound} label="On Treatment" value={activeCount} tone="success" />
        <StatCard icon={UsersRound} label="Upcoming" value={upcomingCount} tone="info" />
        <StatCard icon={UsersRound} label="Post-Treatment" value={postCount} sub={`${totalTasks} carepath tasks`} />
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
        rows={patients.map((patient) => {
          const course = treatmentCourses.find((c) => c.patientId === patient.id);
          return {
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`,
            mrn: patient.mrn,
            diagnosis: patient.diagnosisSummary ?? patient.diagnosis ?? '—',
            phase: patient.chartRoundsPhase?.replace(/_/g, ' ') ?? '—',
            course: course ? course.id.replace('COURSE-', 'C') : '—',
            status: patient.chartRoundsPhase ?? '—',
          };
        })}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search patients by name, MRN, or diagnosis..." />
            </FilterField>
            <FilterField><Input placeholder="Phase" /></FilterField>
            <FilterField><Input placeholder="Diagnosis" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
