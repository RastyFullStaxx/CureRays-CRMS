import { CalendarClock, FileText, Hash, ShieldCheck } from "lucide-react";
import type { CarepathTask } from "@/lib/types";
import { carepathPhaseLabels, formatDate } from "@/lib/workflow";
import { CarepathTaskStatusBadge, ResponsiblePartyBadge } from "@/components/badges";

export function CarepathTaskCard({ task }: { task: CarepathTask }) {
  return (
    <article className="rounded-lg border border-white/72 bg-white/52 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-curerays-blue/8 px-3 py-1 text-xs font-bold text-curerays-blue">
              <Hash className="h-3 w-3" aria-hidden="true" />
              {task.taskNumber}
            </span>
            <CarepathTaskStatusBadge status={task.status} />
            <ResponsiblePartyBadge party={task.responsibleParty} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-curerays-dark-plum">{task.title}</h3>
          <p className="mt-1 text-sm leading-5 text-curerays-indigo">{task.noteAction}</p>
        </div>
        <div className="rounded-lg bg-white/58 px-3 py-2 text-xs font-semibold text-curerays-indigo">
          Due {formatDate(task.dueDate)}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg bg-white/44 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-indigo">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Document
          </p>
          <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">{task.documentName}</p>
        </div>
        <div className="rounded-lg bg-white/44 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-indigo">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            Phase
          </p>
          <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">
            {carepathPhaseLabels[task.workflowPhase]}
          </p>
        </div>
        <div className="rounded-lg bg-white/44 p-3">
          <p className="text-xs font-bold text-curerays-indigo">CPT reference</p>
          <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">{task.cptCodes.join(", ")}</p>
        </div>
        <div className="rounded-lg bg-white/44 p-3">
          <p className="flex items-center gap-2 text-xs font-bold text-curerays-indigo">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Audit
          </p>
          <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">
            {task.auditReady ? "Ready" : task.auditSteps.join(" + ")}
          </p>
        </div>
      </div>
    </article>
  );
}
