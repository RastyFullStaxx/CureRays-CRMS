import { CalendarDays, CheckCircle2, Clock3, Plus, RotateCcw, UsersRound } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel } from "@/lib/global-page-data";

export default function SchedulePage() {
  const appointments = moduleSnapshot.appointments;
  const treatments = appointments.filter((appointment) => appointment.appointmentType === "TREATMENT_FRACTION").length;
  const simulations = appointments.filter((appointment) => appointment.appointmentType === "SIMULATION" || appointment.appointmentType === "MAPPING").length;
  const days = ["Mon 5/4", "Tue 5/5", "Wed 5/6", "Thu 5/7", "Fri 5/8", "Sat 5/9", "Sun 5/10"];
  const hours = ["7 AM", "9 AM", "11 AM", "1 PM", "3 PM", "5 PM"];

  return (
    <PageStack>
      <PageHeader
        title="Schedule"
        subtitle="Appointment calendar and provider scheduling"
        actions={
          <>
            <Button variant="secondary"><CalendarDays className="h-4 w-4" /> Today</Button>
            <Button variant="secondary">May 6, 2026</Button>
            <Button><Plus className="h-4 w-4" /> New Appointment</Button>
          </>
        }
      />
      <FilterStrip>
        <FilterField grow>
          <Input placeholder="Search schedule, patient, MRN, appointment, or provider..." />
        </FilterField>
        <FilterField><Input placeholder="Date" /></FilterField>
        <FilterField><Input placeholder="Site" /></FilterField>
        <FilterField><Input placeholder="Provider" /></FilterField>
      </FilterStrip>
      <StatGrid>
        <StatCard icon={CalendarDays} label="Total" value={appointments.length} sub="Appointments" />
        <StatCard icon={CheckCircle2} label="Treatments" value={treatments} sub="Fractions" tone="success" />
        <StatCard icon={Clock3} label="Simulations" value={simulations} sub="Mapping/sim" tone="warning" />
        <StatCard icon={UsersRound} label="Providers" value={4} sub="On schedule" tone="primary" />
      </StatGrid>
      <div
        className="rounded-[var(--radius-lg)] overflow-hidden"
        style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="p-4">
          <h2 className="mb-4 text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>May 4 - May 10, 2026</h2>
        </div>
        <div className="grid grid-cols-[56px_repeat(7,minmax(120px,1fr))] overflow-hidden border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
          <div className="p-2 font-bold text-xs" style={{ background: 'var(--color-hover)', color: 'var(--color-text-muted)' }}>PDT</div>
          {days.map((day) => (
            <div key={day} className="border-l p-2 text-center font-bold text-xs" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)', color: 'var(--color-text)' }}>{day}</div>
          ))}
          {hours.map((hour, row) => (
            <div key={hour} className="contents">
              <div className="border-t p-2 font-bold text-xs" style={{ borderColor: 'var(--color-border-soft)', color: 'var(--color-text-muted)' }}>{hour}</div>
              {days.map((day, col) => {
                const appointment = appointments[(row + col) % appointments.length];
                const treatment = appointment.appointmentType === "TREATMENT_FRACTION";
                return (
                  <div key={`${day}-${hour}`} className="min-h-[86px] border-l border-t p-2" style={{ borderColor: 'var(--color-border-soft)' }}>
                    {(row + col) % 2 === 0 ? (
                      <div className={`rounded-lg border p-2 ${treatment ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
                        <p className="truncate font-bold text-xs" style={{ color: 'var(--color-text)' }}>{appointment.patientName}</p>
                        <p className="mt-1 truncate font-bold text-xs" style={{ color: 'var(--color-primary)' }}>{appointment.title}</p>
                        <p className="mt-1 truncate text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{appointment.time}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div
        className="rounded-[var(--radius-lg)] p-4"
        style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Upcoming Appointments (Next 7 Days)</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {appointments.slice(0, 6).map((appointment) => (
            <div key={appointment.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
              <p className="text-[11px] font-bold" style={{ color: 'var(--color-primary)' }}>{appointment.time}</p>
              <p className="mt-2 truncate text-xs font-bold" style={{ color: 'var(--color-text)' }}>{appointment.patientName}</p>
              <p className="truncate text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{appointment.title}</p>
            </div>
          ))}
        </div>
      </div>
    </PageStack>
  );
}
