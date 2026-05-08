import { Activity } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { getTreatmentFractions } from "@/lib/module-data";

export default function TreatmentDeliveryPage() {
  const fractions = getTreatmentFractions();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Daily treatment"
        title="Treatment Delivery"
        description="Active treatment queue and fractionation tracking. Final fraction triggers Post-Tx summary, follow-up, billing, and audit readiness checks."
        icon={Activity}
        stat={`${fractions.length} fractions`}
      />
      <SectionCard title="Active Fractionation" description="Daily entries update cumulative dose, OTV reminders, weekly physics checks, and final summary triggers.">
        <DataTable
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
    </div>
  );
}
