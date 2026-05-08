import Link from "next/link";
import { UsersRound } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { PhaseBadge, StatusBadge } from "@/components/badges";
import { patients } from "@/lib/clinical-store";

export default function PatientsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Chart rounds registry"
        title="Patients"
        description="Master patient/course registry replacing manual movement between spreadsheet tabs. Upcoming, On Treatment, and Post are filtered views of the same records."
        icon={UsersRound}
        stat={`${patients.length} patients`}
      />
      <FilterBar
        searchPlaceholder="Search patient, MRN, diagnosis, staff, or next action"
        filters={["Phase", "Status", "Diagnosis", "MD", "Assigned Staff", "Date Range", "Flags"]}
      />
      <DataTable
        minWidth="1500px"
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
          { header: "Notes" }
        ]}
        rows={patients.map((patient) => ({
          id: patient.id,
          cells: [
            <Link key="id" href={`/patients/${patient.id}`} className="font-semibold text-curerays-blue">
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
            patient.flags.length ? patient.flags.map((flag) => flag.summary).join("; ") : "None",
            patient.notes
          ]
        }))}
      />
    </div>
  );
}
