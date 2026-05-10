import Link from "next/link";
import { Plus, Upload, UsersRound } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import { patients } from "@/lib/clinical-store";
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
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function PatientsPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Chart rounds registry"
        title="Patients"
        description="Master patient and course registry replacing manual movement between spreadsheet tabs."
        icon={UsersRound}
        stat={`${patients.length} patients`}
        actions={
          <>
            <SecondaryAction><Upload className="mr-2 inline h-4 w-4" />Import / Sync</SecondaryAction>
            <PrimaryAction><Plus className="mr-2 inline h-4 w-4" />Add Patient</PrimaryAction>
          </>
        }
      />
      <SummaryCardGrid columns={3}>
        {pageMetrics.patients.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ActionToolbar
        searchPlaceholder="Search patient, MRN, diagnosis, staff, or next action"
        filters={["Diagnosis", "Phase", "Detailed Phase", "Status", "MD", "Assigned Staff", "Date Range", "Has Flags"]}
      />
      <ViewTabs tabs={viewTabs.patients} />
      <WorkspaceGrid
        main={
          <DataTable
            minWidth="1800px"
            compact
            columns={[
              { header: "Patient ID" },
              { header: "MRN" },
              { header: "Last Name" },
              { header: "First Name" },
              { header: "Diagnosis" },
              { header: "Location / Site" },
              { header: "MD" },
              { header: "Phase" },
              { header: "Status" },
              { header: "Start Date" },
              { header: "End Date" },
              { header: "Assigned Staff" },
              { header: "Next Action" },
              { header: "Flags / Issues" },
              { header: "Notes" },
              { header: "TX Summary" },
              { header: "Follow-Up" },
              { header: "Billing" }
            ]}
            rows={patients.map((patient) => ({
              id: patient.id,
              cells: [
                <Link key="id" href={`/patients/${patient.id}`} className="font-bold text-[#0033A0]">
                  {patient.id}
                </Link>,
                patient.mrn,
                patient.lastName,
                patient.firstName,
                patient.diagnosis,
                patient.location,
                patient.physician,
                <PhaseBadge key="phase" phase={patient.chartRoundsPhase} />,
                <StatusBadge key="status" status={patient.status} />,
                "From course",
                patient.checklist.txSummaryComplete ? "Summary complete" : "Pending",
                patient.assignedStaff,
                patient.nextAction,
                patient.flags.length ? <span key="flags" className="font-bold text-[#FF6620]">{patient.flags[0].summary}</span> : "None",
                patient.notes,
                patient.checklist.txSummaryComplete ? "Complete" : "Pending",
                patient.checklist.followUpScheduled ? "Scheduled" : "Missing",
                patient.checklist.billingComplete ? "Complete" : "Review"
              ]
            }))}
          />
        }
        rail={
          <DetailPanel title="Patient Quick View" subtitle="Drawer-ready preview for the selected registry row." actionLabel="Open workspace">
            <FieldList
              items={[
                { label: "Selected", value: "Patient #P-10321" },
                { label: "Active Course", value: "Course 2401" },
                { label: "Current Phase", value: "On Treatment" },
                { label: "Next Action", value: "Signature needed", tone: "warning" },
                { label: "Open Tasks", value: 3 }
              ]}
            />
          </DetailPanel>
        }
      />
    </AppPageShell>
  );
}
