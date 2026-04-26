import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { OperationalSnapshot } from "@/components/operational-snapshot";
import { PatientTable } from "@/components/patient-table";
import { RightRail } from "@/components/right-rail";
import { activities, appointments, patients, priorityFlags } from "@/lib/mock-data";
import { averageChecklistPercent, countFlaggedPatients, phaseCounts } from "@/lib/workflow";

export default function DashboardPage() {
  const counts = phaseCounts(patients);
  const flagged = countFlaggedPatients(patients);
  const checklist = averageChecklistPercent(patients);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total Patients"
          value={patients.length}
          detail="Centralized records in the current workflow preview."
          icon={Users}
          tone="blue"
        />
        <KpiCard
          label="Upcoming"
          value={counts.Upcoming}
          detail="Visible by phase field, not copied sheet rows."
          icon={CalendarDays}
          tone="plum"
        />
        <KpiCard
          label="On Treatment"
          value={counts["On Treatment"]}
          detail="Active coordination with next actions attached."
          icon={Activity}
          tone="orange"
        />
        <KpiCard
          label="Post"
          value={counts.Post}
          detail="Follow-up, summaries, and billing closure."
          icon={CheckCircle2}
          tone="blue"
        />
        <KpiCard
          label="Flags"
          value={flagged}
          detail={`${checklist}% average checklist readiness today.`}
          icon={AlertTriangle}
          tone="amber"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PatientTable
          patients={patients}
          title="Clinical workflow command center"
          description="One patient list, filtered into operational views by phase and status."
        />
        <RightRail appointments={appointments} flags={priorityFlags} activities={activities} />
      </section>

      <OperationalSnapshot patients={patients} />
    </div>
  );
}
