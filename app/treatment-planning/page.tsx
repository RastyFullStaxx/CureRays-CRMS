import { Plus, Radiation } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilePreviewCard } from "@/components/file-preview-card";
import { SectionCard } from "@/components/section-card";
import { getTreatmentPlans } from "@/lib/module-data";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function TreatmentPlanningPage() {
  const plans = getTreatmentPlans();

  return (
    <AppPageShell>
      <PageHero
        eyebrow="Planning and prescription"
        title="Treatment Planning"
        description="IGSRT / skin cancer planning scaffold for parameters, depth-dose placeholders, coverage summaries, physics review, Rad Onc signature, and isodose output."
        icon={Radiation}
        stat={`${plans.length} plan`}
      />
      <SummaryCardGrid columns={5}>
        {pageMetrics.planning.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.planning} />
      <ActionToolbar
        searchPlaceholder="Search plan, patient, MRN, site, energy, applicator, or review status"
        filters={["Diagnosis", "Site", "Energy", "Physics Review", "Rad Onc", "Blocked"]}
        actions={<PrimaryAction><Plus className="mr-2 inline h-4 w-4" />New Plan</PrimaryAction>}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Planning Queue" description="Calculations remain explicit service placeholders until dose tables are mapped.">
              <DataTable
                minWidth="1280px"
                compact
                columns={[
                  { header: "Patient" },
                  { header: "Course" },
                  { header: "Site" },
                  { header: "Laterality" },
                  { header: "Energy" },
                  { header: "Applicator" },
                  { header: "DOI" },
                  { header: "Dose / Fx" },
                  { header: "Fractions" },
                  { header: "PDD" },
                  { header: "Physics" },
                  { header: "Rad Onc" }
                ]}
                rows={plans.map((plan, index) => ({
                  id: plan.id,
                  cells: [
                    `Patient #P-10${321 + index}`,
                    plan.courseId,
                    plan.site,
                    plan.laterality ?? "N/A",
                    plan.energy ?? "Pending",
                    plan.applicatorSize ?? "Pending",
                    plan.depthOfInvasion ?? "Pending",
                    plan.dosePerFraction ?? "Pending",
                    plan.totalFractions ?? "Pending",
                    plan.percentDepthDose ? `${plan.percentDepthDose}%` : "Pending",
                    plan.physicistReviewStatus.replaceAll("_", " "),
                    plan.radOncSignatureStatus.replaceAll("_", " ")
                  ]
                }))}
              />
            </SectionCard>
            <section className="grid gap-4 xl:grid-cols-3">
              <SectionCard title="Treatment Parameters" description="Energy, applicator, DOI, total dose, and sessions.">
                <FieldList items={[{ label: "Energy", value: "50 / 70 / 100 kV" }, { label: "Applicator", value: "Mapped input" }, { label: "DOI at Sim", value: "Required" }]} />
              </SectionCard>
              <SectionCard title="Dose-Depth Calculator" description="cGy x percent-depth-dose result.">
                <FieldList items={[{ label: "Depth", value: "4.0 mm" }, { label: "PDD", value: "90%" }, { label: "Dose to Depth", value: "225 cGy" }]} />
              </SectionCard>
              <SectionCard title="Visualization" description="Depth vs percent dose curve placeholder.">
                <div className="h-28 rounded-xl bg-[linear-gradient(135deg,#EAF1FF,#FFFFFF)]" />
              </SectionCard>
            </section>
            <FilePreviewCard
              title="Isodose / Planning Document"
              description="PPTX/PDF generation will use treatment parameters, images, depth-dose data, and template registry mappings once documentGenerationService is connected."
            />
          </>
        }
        rail={
          <DetailPanel title="Review & Sign" subtitle="Plan workspace right rail." actionLabel="Send to physicist">
            <FieldList
              items={[
                { label: "Patient", value: "Patient #P-10321" },
                { label: "Required Images", value: "6 / 9", tone: "warning" },
                { label: "Physics", value: "Ready for Review" },
                { label: "Rad Onc", value: "Pending" }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
