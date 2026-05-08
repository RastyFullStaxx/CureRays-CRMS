import { Radiation } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilePreviewCard } from "@/components/file-preview-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { getTreatmentPlans } from "@/lib/module-data";

export default function TreatmentPlanningPage() {
  const plans = getTreatmentPlans();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Planning and prescription"
        title="Treatment Planning"
        description="IGSRT / skin cancer planning scaffold for parameters, depth-dose placeholders, coverage summaries, physics review, Rad Onc signature, and isodose output."
        icon={Radiation}
        stat={`${plans.length} plan`}
      />
      <SectionCard title="IGSRT Planning Worklist" description="Calculations remain explicit service placeholders until dose tables are mapped.">
        <DataTable
          minWidth="1280px"
          columns={[
            { header: "Course" },
            { header: "Site" },
            { header: "Laterality" },
            { header: "Energy" },
            { header: "Applicator" },
            { header: "DOI" },
            { header: "Dose / Fx" },
            { header: "Fractions" },
            { header: "PDD" },
            { header: "Coverage" },
            { header: "Physics" },
            { header: "Rad Onc" }
          ]}
          rows={plans.map((plan) => ({
            id: plan.id,
            cells: [
              plan.courseId,
              plan.site,
              plan.laterality ?? "N/A",
              plan.energy ?? "Pending",
              plan.applicatorSize ?? "Pending",
              plan.depthOfInvasion ?? "Pending",
              plan.dosePerFraction ?? "Pending",
              plan.totalFractions ?? "Pending",
              plan.percentDepthDose ? `${plan.percentDepthDose}%` : "Pending",
              plan.coverage ?? "Pending",
              plan.physicistReviewStatus.replaceAll("_", " "),
              plan.radOncSignatureStatus.replaceAll("_", " ")
            ]
          }))}
        />
      </SectionCard>
      <FilePreviewCard
        title="Isodose / Planning Document"
        description="PPTX/PDF generation will use treatment parameters, images, depth-dose data, and template registry mappings once documentGenerationService is connected."
      />
    </div>
  );
}
