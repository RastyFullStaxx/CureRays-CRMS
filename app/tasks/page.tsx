import { ListChecks } from "lucide-react";
import { CarepathTaskCard } from "@/components/carepath-task-card";
import { PageHeader } from "@/components/page-header";
import { ResponsiblePartyWorkQueue } from "@/components/responsible-party-work-queue";
import { carepathTasks, generatedDocuments } from "@/lib/clinical-store";
import { responsiblePartyQueue } from "@/lib/workflow";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Role-based work"
        title="Tasks"
        description="Assigned Carepath tasks, document review work, and overdue responsible-party actions."
        icon={ListChecks}
        stat={`${carepathTasks.length} tasks`}
      />
      <ResponsiblePartyWorkQueue queues={responsiblePartyQueue(carepathTasks, generatedDocuments)} />
      <section className="space-y-3">
        {carepathTasks.map((task) => (
          <CarepathTaskCard key={task.id} task={task} />
        ))}
      </section>
    </div>
  );
}
