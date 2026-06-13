import { WorkflowCommandClient } from '@/components/workflow/workflow-command-client';
import { listWorkflowCommandSnapshot } from '@/lib/server/workflow-command-service';

export const dynamic = 'force-dynamic';

export default async function WorkflowPage() {
  const snapshot = await listWorkflowCommandSnapshot();

  return (
    <WorkflowCommandClient
      steps={snapshot.workflowSteps}
      courses={snapshot.treatmentCourses}
    />
  );
}
