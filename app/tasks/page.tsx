import { TaskQueueClient } from '@/components/tasks/task-queue-client';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import {
  getTaskQueueSnapshot,
  taskDueBucketFromValue,
  taskQueueFromValue,
} from '@/lib/server/workflow-command-service';

export const dynamic = 'force-dynamic';

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ bucket?: string; queue?: string }>;
}) {
  const query = await searchParams;
  const persistenceMode = (process.env.CURERAYS_WORKFLOW_REPOSITORY ?? '').trim().toLowerCase();

  await hydrateClinicalStoreFromDatabase({
    force: persistenceMode === 'prisma' || persistenceMode === 'prisma-ready',
  });

  const snapshot = await getTaskQueueSnapshot(
    taskQueueFromValue(query?.queue),
    taskDueBucketFromValue(query?.bucket),
  );

  return <TaskQueueClient snapshot={snapshot} />;
}
