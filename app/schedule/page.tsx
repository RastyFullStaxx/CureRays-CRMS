import { CalendarDays, CheckCircle2, Clock3, Plus, RotateCcw, UsersRound } from "lucide-react";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, PrimaryButton, QuickActions, RightRailCard, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel } from "@/lib/global-page-data";

export default function SchedulePage() {
  const appointments = moduleSnapshot.appointments;
  const treatments = appointments.filter((appointment) => appointment.appointmentType === "TREATMENT_FRACTION").length;
  const simulations = appointments.filter((appointment) => appointment.appointmentType === "SIMULATION" || appointment.appointmentType === "MAPPING").length;
  const days = ["Mon 5/4", "Tue 5/5", "Wed 5/6", "Thu 5/7", "Fri 5/8", "Sat 5/9", "Sun 5/10"];
  const hours = ["7 AM", "9 AM", "11 AM", "1 PM", "3 PM", "5 PM"];

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><CalendarDays className="h-4 w-4" />Today</SecondaryButton>
        <SecondaryButton>May 6, 2026</SecondaryButton>
        <SecondaryButton>Day</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />New Appointment</PrimaryButton>
      </ModuleActions>
      <FilterBar search="Search schedule, patient, MRN, appointment, or provider..." filters={["Date", "Site", "Provider", "Appt Type", "Status", "Phase"]} />
      <WorkGrid
        main={
          <>
            <section className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
              <h2 className="mb-4 text-base font-bold text-[#061A55]">May 4 - May 10, 2026</h2>
              <div className="grid grid-cols-[56px_repeat(7,minmax(120px,1fr))] overflow-hidden rounded-lg border border-[#E7EEF8] text-xs">
                <div className="bg-[#F8FBFF] p-2 font-bold text-[#3D5A80]">PDT</div>
                {days.map((day) => <div key={day} className="border-l border-[#E7EEF8] bg-[#F8FBFF] p-2 text-center font-bold text-[#061A55]">{day}</div>)}
                {hours.map((hour, row) => (
                  <>
                    <div key={`${hour}-label`} className="border-t border-[#E7EEF8] p-2 font-bold text-[#3D5A80]">{hour}</div>
                    {days.map((day, col) => {
                      const appointment = appointments[(row + col) % appointments.length];
                      const treatment = appointment.appointmentType === "TREATMENT_FRACTION";
                      return (
                        <div key={`${day}-${hour}`} className="min-h-[86px] border-l border-t border-[#E7EEF8] p-2">
                          {(row + col) % 2 === 0 ? (
                            <div className={`rounded-lg border p-2 ${treatment ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
                              <p className="truncate font-bold text-[#061A55]">{appointment.patientName}</p>
                              <p className="mt-1 truncate font-bold text-[#0033A0]">{appointment.title}</p>
                              <p className="mt-1 truncate text-[11px] font-semibold text-[#3D5A80]">{appointment.time}</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#061A55]">Upcoming Appointments (Next 7 Days)</h2>
                <button className="text-xs font-bold text-[#0033A0]" type="button">View All</button>
              </div>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                {appointments.slice(0, 6).map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border border-[#E7EEF8] bg-[#F8FBFF] p-3">
                    <p className="text-[11px] font-bold text-[#0033A0]">{appointment.time}</p>
                    <p className="mt-2 truncate text-xs font-bold text-[#061A55]">{appointment.patientName}</p>
                    <p className="truncate text-[11px] font-semibold text-[#3D5A80]">{appointment.title}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        }
        rail={
          <>
            <RightRailCard title="Appointment Details">
              <div className="space-y-3 text-xs font-semibold text-[#3D5A80]">
                <h3 className="text-lg font-bold text-[#061A55]">{appointments[0]?.patientName}</h3>
                <Badge tone="green">On Treatment</Badge>
                <p>{appointments[0]?.title} - {appointments[0]?.time}</p>
                <p>{appointments[0]?.location}</p>
                <p>Provider: {appointments[0]?.staff}</p>
                <PrimaryButton>View Appointment</PrimaryButton>
              </div>
            </RightRailCard>
            <RightRailCard title="Today's Schedule Summary">
              <MetricGrid columns={4}>
                <MetricTile label="Total" value={appointments.length} icon={CalendarDays} detail="Appointments" />
                <MetricTile label="Treatments" value={treatments} icon={CheckCircle2} detail="Fractions" tone="green" />
                <MetricTile label="Simulations" value={simulations} icon={Clock3} detail="Mapping/sim" tone="orange" />
                <MetricTile label="Providers" value={4} icon={UsersRound} detail="On schedule" tone="purple" />
              </MetricGrid>
            </RightRailCard>
            <RightRailCard title="Provider Queue">
              <div className="space-y-2">
                {appointments.slice(0, 4).map((appointment) => <ListItem key={appointment.id} title={appointment.staff} meta={`${appointment.title} - ${patientLabel(appointment.patientId)}`} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Schedule Appointment", icon: <Plus className="h-4 w-4" /> }, { label: "Mark Complete", icon: <CheckCircle2 className="h-4 w-4" /> }, { label: "Reschedule", icon: <RotateCcw className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
