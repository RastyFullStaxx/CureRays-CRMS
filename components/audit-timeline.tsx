import { Fingerprint, History, LockKeyhole } from "lucide-react";
import type { AuditEvent } from "@/lib/types";

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Audit timeline</h3>
          <p className="mt-1 text-sm text-curerays-indigo">
            Sensitive workflow changes should be visible, attributable, and reviewable.
          </p>
        </div>
        <History className="h-5 w-5 text-curerays-plum" aria-hidden="true" />
      </div>

      <div className="mt-6 space-y-4">
        {events.map((event) => (
          <article key={event.id} className="grid gap-3 rounded-lg border border-white/72 bg-white/52 p-4 md:grid-cols-[180px_1fr_140px]">
            <div>
              <p className="text-xs font-bold uppercase text-curerays-indigo">
                {event.timestamp}
              </p>
              <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">{event.actor}</p>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-curerays-blue/8 px-3 py-1 text-xs font-bold text-curerays-blue">
                  <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
                  {event.action}
                </span>
                <span className="text-xs font-semibold text-curerays-indigo">{event.entity}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-curerays-dark-plum/76">{event.summary}</p>
            </div>
            <div className="flex items-start justify-start md:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-curerays-plum/10 px-3 py-1 text-xs font-bold text-curerays-plum">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                {event.accessLevel}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
