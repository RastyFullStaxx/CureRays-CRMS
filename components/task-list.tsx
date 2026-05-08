import Link from "next/link";
import { DataTable } from "@/components/data-table";
import { ResponsiblePartyBadge } from "@/components/badges";
import type { Task } from "@/lib/types";

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <DataTable
      minWidth="1160px"
      columns={[
        { header: "Task" },
        { header: "Priority" },
        { header: "Status" },
        { header: "Role" },
        { header: "Due" },
        { header: "Linked Record" },
        { header: "Last Update" }
      ]}
      rows={tasks.map((task) => ({
        id: task.id,
        cells: [
          <div key="task" className="max-w-72">
            <p className="font-semibold">{task.title}</p>
            <p className="mt-1 text-xs leading-5 text-curerays-indigo">{task.description}</p>
          </div>,
          <span key="priority" className="font-semibold">{task.priority}</span>,
          <span key="status" className="font-semibold">{task.status.replaceAll("_", " ")}</span>,
          <ResponsiblePartyBadge key="role" party={task.assignedRole} />,
          task.dueDate ?? "Unscheduled",
          <Link key="linked" href={`/patients/${task.patientId}`} className="font-semibold text-curerays-blue">
            Open patient
          </Link>,
          task.updatedAt
        ]
      }))}
    />
  );
}
