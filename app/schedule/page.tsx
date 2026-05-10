import { CalendarDays, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { SectionCard } from "@/components/section-card";
import { appointments } from "@/lib/clinical-store";
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

export default function SchedulePage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Clinical timing"
        title="Schedule"
        description="Calendar, daily schedule, treatment schedule, provider/location filtering, and workflow-linked appointment placeholders."
        icon={CalendarDays}
        stat={`${appointments.length} appts`}
      />
      <SummaryCardGrid>
        {pageMetrics.schedule.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.schedule} />
      <ActionToolbar
        searchPlaceholder="Search appointment, patient, staff, or location"
        filters={["Date", "Location", "Provider", "Type", "Status"]}
        actions={<PrimaryAction><Plus className="mr-2 inline h-4 w-4" />New Appointment</PrimaryAction>}
      />
      <WorkspaceGrid
        main={
          <SectionCard title="Day View Timeline" description="Appointments are grouped by time and linked to workflow triggers.">
            <DataTable
              compact
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
        }
        rail={
          <>
            <DetailPanel title="Today Summary" subtitle="Conflicts, follow-ups, and unscheduled tasks." actionLabel="Create treatment series">
              <FieldList
                items={[
                  { label: "Appointments", value: appointments.length },
                  { label: "Treatments", value: 18 },
                  { label: "Conflicts", value: 2, tone: "warning" },
                  { label: "Follow-ups Due", value: 4 }
                ]}
              />
            </DetailPanel>
            <DetailPanel title="Appointment Detail" subtitle="Selected appointment drawer placeholder." actionLabel="Mark completed">
              <FieldList
                items={[
                  { label: "Patient", value: "Patient #P-10321" },
                  { label: "Workflow Step", value: "Simulation Order" },
                  { label: "Required Docs", value: "2 pending", tone: "warning" }
                ]}
              />
            </DetailPanel>
          </>
        }
      />
    </AppPageShell>
  );
}
