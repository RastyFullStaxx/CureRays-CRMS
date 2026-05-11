import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Clock3, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function TreatmentDeliveryPage() {
  const fractions = moduleSnapshot.fractions;
  const activeFractions = fractions.slice(0, 5);
  const completed = fractions.filter((fraction) => fraction.status === "COMPLETED").length;
  const held = fractions.filter((fraction) => fraction.status === "BLOCKED" || fraction.status === "OVERDUE").length || 2;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><CalendarDays className="h-4 w-4" />Today, May 6, 2026</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />Record Treatment</PrimaryButton>
      </ModuleActions>
      <FilterBar search="Search patient, MRN, appointment, therapist, or fraction..." filters={["Location", "Therapist", "Priority", "Status", "Phase"]} />
      <MetricGrid columns={6}>
        <MetricTile label="Today's Treatments" value={fractions.length} detail="Scheduled" icon={Activity} />
        <MetricTile label="In Progress" value={activeFractions.length - completed} detail="Active queue" icon={Clock3} tone="orange" />
        <MetricTile label="Completed" value={completed} detail="Today" icon={CheckCircle2} tone="green" />
        <MetricTile label="Held/Missed" value={held} detail="Needs follow-up" icon={AlertTriangle} tone="red" />
        <MetricTile label="OTV Due" value={3} detail="Patients" icon={UsersRound} tone="orange" />
        <MetricTile label="Physics Check Due" value={2} detail="Patients" icon={ShieldCheck} />
      </MetricGrid>
      <WorkGrid
        main={
          <>
            <section className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
              <h2 className="mb-4 text-base font-bold text-[#061A55]">Today&apos;s Treatment Queue ({activeFractions.length})</h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {activeFractions.map((fraction) => (
                  <div key={fraction.id} className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_6px_18px_rgba(0,51,160,0.04)]">
                    <p className="truncate text-sm font-bold text-[#061A55]">{patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === fraction.courseId)?.patientId ?? "")}</p>
                    <p className="mt-1 text-xs font-bold text-[#0033A0]">{fraction.courseId.replace("COURSE-", "C")}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-[#3D5A80]">
                      <span>Fraction <b className="block text-[#061A55]">{fraction.fractionNumber}</b></span>
                      <span>Phase <b className="block text-[#061A55]">{fraction.phase}</b></span>
                      <span>Dose <b className="block text-[#061A55]">{fraction.plannedDose} cGy</b></span>
                      <span>Total <b className="block text-[#061A55]">{fraction.cumulativeDose} cGy</b></span>
                    </div>
                    <div className="mt-4"><Badge tone={statusTone(fraction.status)}>{statusLabel(fraction.status)}</Badge></div>
                  </div>
                ))}
              </div>
            </section>
            <DataTable
              compact
              minWidth="1100px"
              columns={[
                { header: "Patient" },
                { header: "Course" },
                { header: "Fraction" },
                { header: "Cumulative Dose" },
                { header: "Appt Time" },
                { header: "Room" },
                { header: "Therapist" },
                { header: "Status" },
                { header: "Alerts" },
                { header: "Actions" }
              ]}
              footer={<Pagination label={`Showing 1 to ${fractions.length} of ${fractions.length} active treatments`} />}
              rows={fractions.map((fraction, index) => {
                const course = moduleSnapshot.treatmentCourses.find((item) => item.id === fraction.courseId);
                return {
                  id: fraction.id,
                  cells: [
                    <span key="patient" className="block truncate font-bold">{patientLabel(course?.patientId ?? "")}</span>,
                    fraction.courseId.replace("COURSE-", "C"),
                    `${fraction.fractionNumber} of ${course?.totalFractions ?? 20}`,
                    `${fraction.cumulativeDose} cGy`,
                    `${8 + index}:00 AM`,
                    index % 2 ? "Room 2" : "Room 1",
                    fraction.therapistId ?? "Unassigned",
                    <Badge key="status" tone={statusTone(fraction.status)}>{statusLabel(fraction.status)}</Badge>,
                    index % 3 === 0 ? <Badge key="alert" tone="orange">OTV</Badge> : "-",
                    <RowActions key="actions" />
                  ]
                };
              })}
            />
          </>
        }
        rail={
          <>
            <RightRailCard title="Today Summary">
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Completed" value={completed} detail="Fractions" icon={CheckCircle2} tone="green" />
                <MetricTile label="Held" value={held} detail="Review" icon={AlertTriangle} tone="red" />
              </div>
            </RightRailCard>
            <RightRailCard title="Due Checks">
              <div className="space-y-2">
                <ListItem title="OTV due today" meta="3 patients" badge={<Badge tone="orange">Due</Badge>} />
                <ListItem title="Weekly physics check" meta="2 patients" badge={<Badge tone="blue">QA</Badge>} />
                <ListItem title="Image guidance review" meta="1 missing confirmation" badge={<Badge tone="red">Gap</Badge>} />
              </div>
            </RightRailCard>
            <RightRailCard title="Treatment Alerts">
              <div className="space-y-2">
                {fractions.slice(0, 3).map((fraction) => <ListItem key={fraction.id} title={`Fraction ${fraction.fractionNumber} review`} meta={fraction.notes ?? "Daily IGRT and dose verification"} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Record This Fraction", icon: <Plus className="h-4 w-4" /> }, { label: "Mark Held", icon: <AlertTriangle className="h-4 w-4" /> }, { label: "Link Workflow Step", icon: <ShieldCheck className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
