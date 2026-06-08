import { notFound } from 'next/navigation';
import { ClipboardList, FileText, CalendarDays, Radiation } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  treatmentCourses,
  auditEvents,
} from '@/lib/clinical-store';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseTasks, courseDocuments, courseFractions, patientActiveCourse } from '@/lib/workflow';

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess('Render patient profile page'));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const tasks = courseTasks(course.id, carepathTasks);
  const docs = courseDocuments(course.id, generatedDocuments);
  const fractions = courseFractions(course.id, fractionLogEntries);

  return (
    <PageStack>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        subtitle={`MRN: ${patient.mrn} | Course: ${course.id.replace('COURSE-', 'C')} | Phase: ${patient.chartRoundsPhase?.replace(/_/g, ' ')}`}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}`, href: `/patients/${patient.id}` },
        ]}
      />

      <StatGrid>
        <StatCard icon={ClipboardList} label="Tasks" value={tasks.length} tone="primary" />
        <StatCard icon={FileText} label="Documents" value={docs.length} tone="info" />
        <StatCard icon={CalendarDays} label="Fractions" value={fractions.length} tone="success" />
        <StatCard icon={Radiation} label="Audit Events" value={auditEvents.length} sub="System-wide" />
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Patient Information
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{patient.firstName} {patient.lastName}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>MRN</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{patient.mrn}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Diagnosis</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{patient.diagnosisSummary ?? patient.diagnosis ?? '—'}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Phase</span>
              <Badge variant="primary">{patient.chartRoundsPhase?.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Course Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Course ID</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{course.id}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Fractions</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{fractions.length}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Documents</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{docs.length}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: 'var(--font-size-small)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tasks</span>
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{tasks.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
          Recent Tasks
        </h2>
        {tasks.length === 0 ? (
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>No tasks for this course.</p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 6).map((task) => (
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
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{task.workflowPhase?.replace(/_/g, ' ')}</p>
                </div>
                <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'BLOCKED' ? 'error' : 'info'}>
                  {task.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageStack>
  );
}
