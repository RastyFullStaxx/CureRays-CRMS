import { CalendarClock, CircleAlert, Clock3, History } from "lucide-react";
import type { Activity, Appointment, OperationalAppointment, OperationalPriorityFlag, PriorityFlag } from "@/lib/types";
import { PhaseBadge, ResponsiblePartyBadge } from "@/components/badges";

const severityStyles: Record<PriorityFlag["severity"], string> = {
  HIGH: "bg-curerays-orange text-white",
  MEDIUM: "bg-curerays-amber/70 text-curerays-dark-plum",
  LOW: "bg-curerays-light-indigo/40 text-curerays-blue"
};

type RightRailProps = {
  appointments: Array<Appointment | OperationalAppointment>;
  flags: Array<PriorityFlag | OperationalPriorityFlag>;
  activities: Activity[];
};

export function RightRail({ appointments, flags, activities }: RightRailProps) {
  return (
    <aside className="glass-panel space-y-5 rounded-glass p-5">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-curerays-dark-plum">Treatment Activity</h3>
          <CalendarClock className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-lg border border-white/72 bg-white/52 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-curerays-dark-plum">{appointment.time}</p>
                <PhaseBadge phase={appointment.chartRoundsPhase} />
              </div>
              <p className="mt-2 text-sm font-semibold text-curerays-dark-plum/82">
                {appointment.title}
              </p>
              <p className="mt-1 text-xs text-curerays-indigo">
                {"displayLabel" in appointment ? appointment.displayLabel : appointment.patientName} - {appointment.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-curerays-dark-plum">Priority Issues</h3>
          <CircleAlert className="h-4 w-4 text-curerays-orange" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          {flags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-curerays-orange/10 bg-white/52 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${severityStyles[flag.severity]}`}>
                  {flag.severity}
                </span>
                <span className="text-xs font-semibold text-curerays-indigo">{flag.dueAt}</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-5 text-curerays-dark-plum">
                {flag.summary}
              </p>
              <div className="mt-2">
                <ResponsiblePartyBadge party={flag.owner} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-curerays-dark-plum">Recent Activity</h3>
          <History className="h-4 w-4 text-curerays-plum" aria-hidden="true" />
        </div>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-curerays-plum/10 text-curerays-plum">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <p className="text-sm leading-5 text-curerays-dark-plum/78">
                <span className="font-semibold text-curerays-dark-plum">{activity.actor}</span>{" "}
                {activity.action}{" "}
                <span className="font-semibold text-curerays-indigo">{activity.target}</span>
                <span className="block text-xs font-semibold text-curerays-indigo/70">
                  {activity.timestamp}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
