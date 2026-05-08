import { ShieldCheck } from "lucide-react";
import { AuditChecklist } from "@/components/audit-checklist";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { auditChecks } from "@/lib/module-data";

export default function AuditPage() {
  const blockers = auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Final course gate"
        title="Audit & QA"
        description="Final readiness validation for required documents, signatures, N/A reasons, images, treatment logs, summary, follow-up, billing, and final Carepath audit signature."
        icon={ShieldCheck}
        stat={blockers.length ? `${blockers.length} blockers` : "Ready"}
      />
      <SectionCard title="Audit Checklist" description="Courses close only after required evidence and final signatures are complete.">
        <AuditChecklist checks={auditChecks} />
      </SectionCard>
    </div>
  );
}
