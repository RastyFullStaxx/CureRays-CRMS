import { Fingerprint, History, LockKeyhole } from "lucide-react";
import type { AuditEvent } from "@/lib/types";

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Audit timeline</h3>
          <p className="mt-1 text-sm text-curerays-indigo">
            Workflow changes show who changed what, previous value, new value, timestamp, and reason.
          </p>
        </div>
        <History className="h-5 w-5 text-curerays-plum" aria-hidden="true" />
      </div>

      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <article key={event.id} className="grid gap-3 rounded-lg border border-white/72 bg-white/52 p-4 lg:grid-cols-[190px_1fr_170px]">
            <div>
              <p className="text-xs font-bold uppercase text-curerays-indigo">{event.timestamp}</p>
              <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">{event.userName}</p>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-curerays-blue/8 px-3 py-1 text-xs font-bold text-curerays-blue">
                  <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.action}
                </span>
                <span className="text-xs font-semibold text-curerays-indigo">
                  {event.entityType.replaceAll("_", " ")} - {event.entityId}
                </span>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <p className="rounded-lg bg-white/58 p-3 text-sm leading-5 text-curerays-dark-plum/76">
                  <span className="block text-xs font-bold text-curerays-indigo">Previous</span>
                  {event.previousValue}
                </p>
                <p className="rounded-lg bg-white/58 p-3 text-sm leading-5 text-curerays-dark-plum/76">
                  <span className="block text-xs font-bold text-curerays-indigo">New</span>
                  {event.newValue}
                </p>
              </div>
              {event.reason ? (
                <p className="mt-3 text-sm leading-6 text-curerays-indigo">{event.reason}</p>
              ) : null}
            </div>
            <div className="flex items-start justify-start lg:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-curerays-plum/10 px-3 py-1 text-xs font-bold text-curerays-plum">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Audit logged
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
