import { History, ShieldCheck } from "lucide-react";
import { AuditTimeline } from "@/components/audit-timeline";
import { PageHeader } from "@/components/page-header";
import { auditEvents } from "@/lib/mock-data";

export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="HIPAA-aligned visibility"
        title="Audit Logs"
        description="A focused view for sensitive workflow changes, role-aware actions, and phase updates that previously disappeared inside manual spreadsheet work."
        icon={History}
        stat={`${auditEvents.length} events`}
      />

      <section className="glass-panel rounded-glass p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-curerays-blue" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-curerays-dark-plum">Audit posture</h3>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              This preview highlights the expected audit shape: who changed what, which record was
              affected, when it happened, and which access tier was involved. Backend enforcement
              and immutable logging are planned for the API phase.
            </p>
          </div>
        </div>
      </section>

      <AuditTimeline events={auditEvents} />
    </div>
  );
}
