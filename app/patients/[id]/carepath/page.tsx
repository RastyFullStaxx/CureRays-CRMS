import { notFound } from 'next/navigation';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { CarepathCommandClient } from '@/components/patients/carepath-command-client';
import { carepathTasks, getWorkflowSteps, treatmentCourses } from '@/lib/services/operational-page-service';
import { findPatientPhi, systemPhiAccess } from '@/lib/server/phi-store';
import { courseTasks, patientActiveCourse } from '@/lib/workflow';

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
  const workflowSteps = getWorkflowSteps(course.id);

  return (
    <PageStack>
      <PageHeader
        title="Carepath"
        subtitle={`${patient.firstName} ${patient.lastName} | ${course.id.replace('COURSE-', 'C')}`}
        actions={<PrototypeActionButton label="Advance Carepath" icon="play" kind="review" variant="primary" description="Stage a carepath advancement after reviewing task blockers and required signatures." />}
        breadcrumb={[
          { label: 'Patients', href: '/patients' },
          { label: patient.firstName + ' ' + patient.lastName, href: `/patients/${patient.id}` },
          { label: 'Carepath', href: `/patients/${patient.id}/carepath` },
        ]}
      />

      <CarepathCommandClient
        courseRef={course.id.replace('COURSE-', 'C')}
        steps={workflowSteps}
        tasks={tasks}
      />
    </PageStack>
  );
}
