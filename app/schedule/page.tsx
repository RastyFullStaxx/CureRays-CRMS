import { CalendarDays } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { appointments } from "@/lib/clinical-store";

export default function SchedulePage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Clinical timing"
        title="Schedule"
        description="Calendar, daily schedule, treatment schedule, provider/location filtering, and workflow-linked appointment placeholders."
        icon={CalendarDays}
        stat={`${appointments.length} appts`}
      />
      <FilterBar searchPlaceholder="Search appointment, patient, staff, or location" filters={["Date", "Location", "Provider", "Course", "Type", "Status"]} />
      <SectionCard title="Daily Schedule" description="Completing appointments will eventually trigger workflow updates.">
        <DataTable
          columns={[
            { header: "Time" },
            { header: "Patient" },
            { header: "Type" },
            { header: "Location" },
            { header: "Staff" },
            { header: "Status" },
            { header: "Linked Step" }
          ]}
          rows={appointments.map((appointment) => ({
            id: appointment.id,
            cells: [
              appointment.time,
              appointment.patientName,
              appointment.appointmentType?.replaceAll("_", " ") ?? appointment.title,
              appointment.location,
              appointment.staff,
              appointment.status ?? "SCHEDULED",
              appointment.linkedWorkflowStepId ?? "Pending link"
            ]
          }))}
        />
      </SectionCard>
    </div>
  );
}
