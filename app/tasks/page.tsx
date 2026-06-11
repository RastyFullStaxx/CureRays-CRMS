import { TaskQueueClient } from '@/components/tasks/task-queue-client';
import { selectWorkflowTaskRepository } from '@/lib/server/workflow-command-service';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const repository = selectWorkflowTaskRepository();
  const snapshot = await repository.listQueue('ALL', 'RAD_ONC');

  return <TaskQueueClient snapshot={snapshot} />;
}
