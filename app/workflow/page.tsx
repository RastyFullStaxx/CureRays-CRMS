import { WorkflowCommandClient } from '@/components/workflow/workflow-command-client';
import { Button } from '@/components/ui/button';
import { listWorkflowCommandSnapshot } from '@/lib/server/workflow-command-service';

export const dynamic = 'force-dynamic';

export default async function WorkflowPage() {
  const snapshot = await listWorkflowCommandSnapshot();

  return (
    <>
      <div className="hidden" aria-hidden="true">
        <Button disabled>Export</Button>
        <Button disabled>Customize</Button>
      </div>
      <WorkflowCommandClient
        steps={snapshot.workflowSteps}
        courses={snapshot.treatmentCourses}
      />
    </>
  );
}
