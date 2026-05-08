import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { TaskList } from "@/components/task-list";
import { carepathTasks, generatedDocuments } from "@/lib/clinical-store";
import { getTasks } from "@/lib/module-data";
import { responsiblePartyQueue } from "@/lib/workflow";
import { ResponsiblePartyWorkQueue } from "@/components/responsible-party-work-queue";

export default function TasksPage() {
  const tasks = getTasks();
  const signatures = tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
  const overdue = tasks.filter((task) => task.priority === "URGENT" || task.status === "OVERDUE");
  const completed = tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Role-based work"
        title="Tasks"
        description="Work queues for role-based execution: document launches, forms, images, plan review, signatures, daily treatment, physics checks, follow-up, and audit."
        icon={ListChecks}
        stat={`${tasks.length} tasks`}
      />
      <ResponsiblePartyWorkQueue queues={responsiblePartyQueue(carepathTasks, generatedDocuments)} />
      <SectionCard title="My Tasks" description="Placeholder view until authentication assigns a real current user.">
        <TaskList tasks={tasks.slice(0, 6)} />
      </SectionCard>
      <SectionCard title="Team Tasks" description="All role-owned work across active courses.">
        <TaskList tasks={tasks} />
      </SectionCard>
      <section className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Unassigned" description="Tasks without a named assignee.">
          <TaskList tasks={tasks.filter((task) => !task.assignedUserId)} />
        </SectionCard>
        <SectionCard title="Signatures Needed" description="Documents or steps ready for clinical signature.">
          <TaskList tasks={signatures} />
        </SectionCard>
        <SectionCard title="Overdue / Escalate" description="High-risk tasks requiring escalation.">
          <TaskList tasks={overdue.length ? overdue : tasks.slice(0, 2)} />
        </SectionCard>
      </section>
      <SectionCard title="Completed" description="Recently completed or signed tasks.">
        <TaskList tasks={completed} />
      </SectionCard>
    </div>
  );
}
