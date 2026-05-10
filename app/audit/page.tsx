import { ShieldCheck } from "lucide-react";
import { AuditChecklist } from "@/components/audit-checklist";
import { DataTable } from "@/components/data-table";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SecondaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { auditChecks, getCourses } from "@/lib/module-data";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function AuditPage() {
  const blockers = auditChecks.filter((check) => ["BLOCKED", "OVERDUE", "READY_FOR_REVIEW"].includes(check.status));
  const courses = getCourses();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Final course gate"
        title="Audit & QA"
        description="Final readiness validation for required documents, signatures, N/A reasons, images, treatment logs, summary, follow-up, billing, and final Carepath audit signature."
        icon={ShieldCheck}
        stat={blockers.length ? `${blockers.length} blockers` : "Ready"}
        actions={
          <>
            <SecondaryAction>Export Audit Report</SecondaryAction>
            <PrimaryAction>Run Audit Check</PrimaryAction>
          </>
        }
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.audit.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.audit} />
      <ActionToolbar
        searchPlaceholder="Search patient ID, course, blocker, document, or audit check"
        filters={["Readiness", "Documents", "Signatures", "Images", "Billing", "Follow-Up"]}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Audit Course Table" description="Course closeout readiness across documents, signatures, images, fractions, billing, and follow-up.">
              <DataTable
                compact
                minWidth="1180px"
                columns={[
                  { header: "Patient" },
                  { header: "Course" },
                  { header: "Diagnosis" },
                  { header: "Phase" },
                  { header: "Documents" },
                  { header: "Signatures" },
                  { header: "Images" },
                  { header: "Billing" },
                  { header: "Audit Status" },
                  { header: "Last Update" }
                ]}
                rows={courses.map((course, index) => ({
                  id: course.id,
                  cells: [
                    `Patient #P-${10321 + index}`,
                    course.courseNumber,
                    course.diagnosisType,
                    course.currentPhase.replaceAll("_", " "),
                    index % 2 === 0 ? "Complete" : "Missing",
                    index % 3 === 0 ? "Pending" : "Complete",
                    index % 2 === 0 ? "Complete" : "Missing",
                    index % 3 === 0 ? "Pending" : "Ready",
                    course.status.replaceAll("_", " "),
                    course.updatedAt
                  ]
                }))}
              />
            </SectionCard>
            <SectionCard title="Audit Checklist" description="Courses close only after required evidence and final signatures are complete.">
              <AuditChecklist checks={auditChecks} />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Audit Readiness" subtitle="Selected course detail" actionLabel="Open audit detail">
              <FieldList
                items={[
                  { label: "Readiness", value: "78%" },
                  { label: "Blockers", value: blockers.length, tone: blockers.length ? "warning" : "default" },
                  { label: "N/A Reasons", value: "Required when used" },
                  { label: "Final Sign", value: "Pending", tone: "warning" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Blockers & Evidence" description="Issue drawer placeholder for missing evidence and owner actions.">
              <div className="space-y-3">
                {blockers.slice(0, 4).map((check) => (
                  <div key={check.id} className="rounded-xl border border-[#FFD7C2] bg-[#FFF8F4] p-3">
                    <p className="text-sm font-bold text-[#061A55]">{check.label}</p>
                    <p className="mt-1 text-xs font-semibold text-[#FF6620]">{check.status.replaceAll("_", " ")}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
