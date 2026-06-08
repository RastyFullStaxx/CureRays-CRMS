import type { Task } from '@/lib/types';
import { formatDate } from '@/lib/workflow';

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-curerays-indigo">No tasks found.</p>;
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/70 bg-white/52 p-3"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-curerays-dark-plum">{task.title}</p>
            <p className="mt-1 text-xs text-curerays-indigo">
              {task.type.replace(/_/g, ' ')} · {task.assignedRole}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold text-curerays-indigo">{formatDate(task.dueDate)}</p>
            <p className="mt-1 text-xs font-bold text-curerays-dark-plum">{task.status.replace(/_/g, ' ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
