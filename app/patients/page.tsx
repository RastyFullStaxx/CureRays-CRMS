'use client';
import Link from 'next/link';
import { UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { patients, treatmentCourses, carepathTasks } from '@/lib/clinical-store';

export default function PatientsPage() {
  const activeCount = patients.filter((p) => p.chartRoundsPhase === 'ON_TREATMENT').length;
  const upcomingCount = patients.filter((p) => p.chartRoundsPhase === 'UPCOMING').length;
  const postCount = patients.filter((p) => p.chartRoundsPhase === 'POST').length;
  const totalTasks = carepathTasks.length;
  const rows = patients.map((patient) => {
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
  });

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
          { key: 'name', label: 'Patient', render: (row) => <Link href={"/patients/" + row.id} className="hover:underline"><span className="font-bold" style={{ color: 'var(--color-text)' }}>{row.name}</span></Link> },
          { key: 'mrn', label: 'MRN', render: (row) => <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{row.mrn}</span> },
          { key: 'diagnosis', label: 'Diagnosis', render: (row) => <Badge variant="default">{row.diagnosis}</Badge> },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant="info">{row.phase}</Badge> },
          { key: 'course', label: 'Course', render: (row) => <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{row.course}</span> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'ON_TREATMENT' ? 'success' : row.status === 'POST' ? 'primary' : 'info'}>{row.status}</Badge> },
        ]}
        rows={rows}
        search={{ placeholder: 'Search patients by name, MRN, or diagnosis...', keys: ['name', 'mrn', 'diagnosis', 'course', 'status'] }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'status', label: 'Status' },
        ]}
      />
    </PageStack>
  );
}
