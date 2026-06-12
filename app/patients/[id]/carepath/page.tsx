import { notFound } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { carepathTasks, treatmentCourses } from '@/lib/services/operational-page-service';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { carepathPhaseLabels, courseTasks, orderedCarepathPhases, patientActiveCourse } from '@/lib/workflow';

export default async function PatientCarepathPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = findPatientPhi(id, systemPhiAccess('Render patient carepath page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const tasks = courseTasks(course.id, carepathTasks);
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'BLOCKED').length;
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;

  return (
    <PageStack>
      <PageHeader
        title="Carepath"
        subtitle={`${patient.firstName} ${patient.lastName} | ${course.id.replace('COURSE-', 'C')}`}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: patient.firstName + ' ' + patient.lastName, href: `/patients/${patient.id}` },
          { label: 'Carepath', href: `/patients/${patient.id}/carepath` },
        ]}
      />

      <StatGrid>
        <StatCard icon={ClipboardList} label="Total Tasks" value={tasks.length} tone="primary" />
        <StatCard icon={ClipboardList} label="Completed" value={completedCount} tone="success" />
        <StatCard icon={ClipboardList} label="Pending" value={pendingCount} tone="info" />
        <StatCard icon={ClipboardList} label="Blocked" value={blockedCount} tone="error" />
      </StatGrid>

      {orderedCarepathPhases.map((phase) => {
        const phaseTasks = tasks.filter((task) => task.workflowPhase === phase);
        if (!phaseTasks.length) return null;

        return (
          <Card key={phase}>
            <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 15 }}>
              {carepathPhaseLabels[phase]}
            </h2>
            <div className="space-y-2">
              {phaseTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3"
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-soft)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text)' }}>
                      {task.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {task.responsibleParty?.replace(/_/g, ' ')} &middot; {task.documentName}
                    </p>
                  </div>
                  <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'BLOCKED' ? 'error' : 'info'}>
                    {task.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </PageStack>
  );
}
