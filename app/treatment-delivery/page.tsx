import { Activity } from "lucide-react";
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
import { getTreatmentFractions } from "@/lib/module-data";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function TreatmentDeliveryPage() {
  const fractions = getTreatmentFractions();
  const activeFractions = fractions.slice(0, 5);

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Daily treatment"
        title="Treatment Delivery"
        description="Active treatment queue and fractionation tracking. Final fraction triggers Post-Tx summary, follow-up, billing, and audit readiness checks."
        icon={Activity}
        stat={`${fractions.length} fractions`}
        actions={
          <>
            <SecondaryAction>Start Today&apos;s Queue</SecondaryAction>
            <PrimaryAction>Record Fraction</PrimaryAction>
          </>
        }
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.delivery.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.delivery} />
      <ActionToolbar
        searchPlaceholder="Search patient ID, MRN, course, therapist, or fraction"
        filters={["Date", "Status", "Therapist", "Image Guidance", "Review Needed"]}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Active Treatment Queue" description="Compact queue cards for today&apos;s delivery workflow.">
              <div className="grid gap-3 lg:grid-cols-2">
                {activeFractions.map((fraction) => (
                  <div key={fraction.id} className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#061A55]">Patient #{fraction.courseId.slice(-5)}</p>
                        <p className="mt-1 text-xs font-semibold text-[#3D5A80]">{fraction.courseId} · Fx {fraction.fractionNumber}</p>
                      </div>
                      <span className="rounded-full bg-[#EAF1FF] px-2.5 py-1 text-xs font-bold text-[#0033A0]">
                        {fraction.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-[#3D5A80]">
                      <span>Planned {fraction.plannedDose}</span>
                      <span>Cumulative {fraction.cumulativeDose}</span>
                      <span>{fraction.imageGuidanceCompleted ? "IG complete" : "IG pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Fractionation Log" description="Daily entries update dose, reminders, and final treatment triggers.">
              <DataTable
                compact
                minWidth="1280px"
                columns={[
                  { header: "Course" },
                  { header: "Fx" },
                  { header: "Date" },
                  { header: "Phase" },
                  { header: "Planned" },
                  { header: "Delivered" },
                  { header: "Cumulative" },
                  { header: "Energy" },
                  { header: "Applicator" },
                  { header: "Image Guidance" },
                  { header: "Therapist" },
                  { header: "Physician Review" },
                  { header: "Status" }
                ]}
                rows={fractions.map((fraction) => ({
                  id: fraction.id,
                  cells: [
                    fraction.courseId,
                    `${fraction.fractionNumber}`,
                    fraction.treatmentDate,
                    fraction.phase,
                    fraction.plannedDose,
                    fraction.deliveredDose ?? "Held",
                    fraction.cumulativeDose,
                    fraction.energy ?? "Pending",
                    fraction.applicator ?? "Pending",
                    fraction.imageGuidanceCompleted ? "Complete" : "Pending",
                    fraction.therapistId ?? "Unassigned",
                    fraction.physicianReviewedAt ?? "Pending",
                    fraction.status.replaceAll("_", " ")
                  ]
                }))}
              />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Today&apos;s Progress" subtitle="Operational delivery snapshot" actionLabel="Open delivery detail">
              <FieldList
                items={[
                  { label: "Completed", value: "11 / 18" },
                  { label: "Held", value: 2, tone: "warning" },
                  { label: "OTV Due", value: 3 },
                  { label: "Physics Due", value: 3 }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Record Fraction Drawer" description="Future action surface for therapist workflow.">
              <FieldList
                items={[
                  { label: "Dose", value: "Delivered dose" },
                  { label: "Machine", value: "Energy/applicator" },
                  { label: "Checklist", value: "Image guidance" },
                  { label: "Submit", value: "Audit logged" }
                ]}
              />
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
