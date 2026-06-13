'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Filter, MapPin, UserRound, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mapTone } from '@/lib/status-utils';
import type { OperationalAppointment } from '@/lib/types';

type ScheduleCommandClientProps = {
  appointments: OperationalAppointment[];
};

const days = [
  { key: 'all', label: 'All week' },
  { key: 'mon', label: 'Mon 5/4' },
  { key: 'tue', label: 'Tue 5/5' },
  { key: 'wed', label: 'Wed 5/6' },
  { key: 'thu', label: 'Thu 5/7' },
  { key: 'fri', label: 'Fri 5/8' },
  { key: 'sat', label: 'Sat 5/9' },
  { key: 'sun', label: 'Sun 5/10' },
];

const gridDays = days.slice(1);
const hours = ['7 AM', '9 AM', '11 AM', '1 PM', '3 PM', '5 PM'];

function statusLabel(value: string | undefined) {
  return value ? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Scheduled';
}

function appointmentTypeLabel(value: string | undefined) {
  return value ? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Carepath visit';
}

function statusTone(value: string | undefined) {
  if (value === 'COMPLETED') return 'green';
  if (value === 'MISSED' || value === 'CANCELLED') return 'red';
  if (value === 'RESCHEDULED') return 'orange';
  return 'blue';
}

function dayForIndex(index: number) {
  return gridDays[index % gridDays.length]?.key ?? 'mon';
}

function hourIndex(time: string) {
  const hour = Number(time.split(':')[0] ?? 9);
  if (hour < 9) return 0;
  if (hour < 11) return 1;
  if (hour < 13) return 2;
  if (hour < 15) return 3;
  if (hour < 17) return 4;
  return 5;
}

export function ScheduleCommandClient({ appointments }: ScheduleCommandClientProps) {
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointments[0]?.id ?? '');

  const appointmentRows = useMemo(
    () => appointments.map((appointment, index) => ({ ...appointment, scheduleDay: dayForIndex(index) })),
    [appointments],
  );

  const typeOptions = useMemo(() => {
    return Array.from(new Set(appointmentRows.map((appointment) => appointment.appointmentType ?? 'CAREPATH_VISIT'))).sort();
  }, [appointmentRows]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(appointmentRows.map((appointment) => appointment.location))).sort();
  }, [appointmentRows]);

  const filteredAppointments = useMemo(() => {
    return appointmentRows.filter((appointment) => {
      const dayMatches = selectedDay === 'all' || appointment.scheduleDay === selectedDay;
      const typeMatches = selectedType === 'all' || (appointment.appointmentType ?? 'CAREPATH_VISIT') === selectedType;
      const locationMatches = selectedLocation === 'all' || appointment.location === selectedLocation;
      return dayMatches && typeMatches && locationMatches;
    });
  }, [appointmentRows, selectedDay, selectedLocation, selectedType]);

  const selectedAppointment = appointmentRows.find((appointment) => appointment.id === selectedAppointmentId) ?? filteredAppointments[0] ?? appointmentRows[0];
  const treatments = appointmentRows.filter((appointment) => appointment.appointmentType === 'TREATMENT_FRACTION').length;
  const simulations = appointmentRows.filter((appointment) => appointment.appointmentType === 'SIMULATION' || appointment.appointmentType === 'MAPPING').length;
  const providers = new Set(appointmentRows.map((appointment) => appointment.staff)).size;

  return (
    <PageStack>
      <PageHeader
        title="Schedule"
        subtitle="Appointment calendar, staff lanes, and workflow-linked timing"
        actions={
          <>
            <PrototypeActionButton label="Today" icon="calendar" kind="schedule" description="Jump the demo schedule back to the current clinical day." />
            <PrototypeActionButton label="May 6, 2026" icon="calendar" kind="schedule" description="Review or stage the visible schedule date." />
            <PrototypeActionButton label="New Appointment" icon="plus" kind="schedule" variant="primary" description="Stage an appointment linked to workflow timing." />
          </>
        }
      />

      <StatGrid>
        <StatCard icon={CalendarDays} label="Total" value={appointmentRows.length} sub="Appointments" />
        <StatCard icon={CheckCircle2} label="Treatments" value={treatments} sub="Fractions" tone="success" />
        <StatCard icon={Clock3} label="Simulations" value={simulations} sub="Mapping/sim" tone="warning" />
        <StatCard icon={UsersRound} label="Providers" value={providers} sub="On schedule" tone="primary" />
      </StatGrid>

      <Card compact>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[180px] items-center gap-2 text-xs font-bold uppercase text-[var(--color-text-muted)]">
            <Filter className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
            Schedule Controls
          </div>
          <div className="min-w-[150px] flex-1">
            <Select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} aria-label="Schedule day">
              {days.map((day) => (
                <option key={day.key} value={day.key}>{day.label}</option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px] flex-1">
            <Select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} aria-label="Appointment type">
              <option value="all">All visit types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{appointmentTypeLabel(type)}</option>
              ))}
            </Select>
          </div>
          <div className="min-w-[180px] flex-1">
            <Select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} aria-label="Location">
              <option value="all">All locations</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <Card className="min-h-[280px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-[var(--color-text)]">Upcoming Appointments</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                {filteredAppointments.length} visible after filters
              </p>
            </div>
            <Badge variant="primary">Next 7 days</Badge>
          </div>
          <ScrollArea axis="x" className="-mx-1 px-1 pb-1">
            <div className="flex min-w-max gap-3">
              {filteredAppointments.length === 0 ? (
                <div className="min-w-[260px] rounded-[var(--radius-md)] border p-4 text-sm font-semibold text-[var(--color-text-muted)]" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
                  No appointments match the active filters.
                </div>
              ) : filteredAppointments.map((appointment) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() => setSelectedAppointmentId(appointment.id)}
                  className="clinical-focus min-w-[210px] rounded-[var(--radius-md)] border p-3 text-left transition hover:bg-[var(--color-bg-elevated)]"
                  style={{
                    borderColor: appointment.id === selectedAppointment?.id ? 'var(--color-primary)' : 'var(--color-border-soft)',
                    background: appointment.id === selectedAppointment?.id ? 'var(--color-primary-soft)' : 'var(--color-hover)',
                  }}
                >
                  <p className="text-[11px] font-bold text-[var(--color-primary)]">{appointment.time}</p>
                  <p className="mt-2 truncate text-sm font-bold text-[var(--color-text)]">{appointment.displayLabel}</p>
                  <p className="truncate text-xs font-semibold text-[var(--color-text-muted)]">{appointment.title}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant={mapTone(statusTone(appointment.status))}>{statusLabel(appointment.status)}</Badge>
                    <Badge variant="default">{appointmentTypeLabel(appointment.appointmentType)}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="clinical-label">Selected Visit</p>
              <h2 className="mt-1 truncate font-heading text-lg font-bold text-[var(--color-text)]">
                {selectedAppointment?.title ?? 'No appointment selected'}
              </h2>
            </div>
            {selectedAppointment ? <Badge variant={mapTone(statusTone(selectedAppointment.status))}>{statusLabel(selectedAppointment.status)}</Badge> : null}
          </div>
          {selectedAppointment ? (
            <div className="mt-4 grid gap-3">
              {[
                { icon: UserRound, label: 'Patient / course', value: selectedAppointment.displayLabel },
                { icon: CalendarDays, label: 'Time', value: selectedAppointment.time },
                { icon: MapPin, label: 'Location', value: selectedAppointment.location },
                { icon: UsersRound, label: 'Staff', value: selectedAppointment.staff },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="clinical-muted-surface flex items-center gap-3 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-card)] text-[var(--color-primary)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="clinical-label block">{item.label}</span>
                      <span className="mt-1 block truncate text-sm font-bold text-[var(--color-text)]">{item.value}</span>
                    </span>
                  </div>
                );
              })}
              <PrototypeActionButton
                label="Update Visit"
                icon="pen"
                kind="schedule"
                variant="primary"
                description="Stage a visit update, reschedule reason, or workflow timing note."
                context={`${selectedAppointment.displayLabel} / ${selectedAppointment.time}`}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">Select a visible appointment to review details.</p>
          )}
        </Card>
      </div>

      <Card className="overflow-hidden" style={{ padding: '0' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
          <h2 className="font-heading text-base font-bold text-[var(--color-text)]">May 4 - May 10, 2026</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            Filtered weekly calendar with workflow-linked appointment blocks.
          </p>
        </div>
        <div className="grid grid-cols-[56px_repeat(7,minmax(120px,1fr))] overflow-hidden border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
          <div className="p-2 text-xs font-bold text-[var(--color-text-muted)]" style={{ background: 'var(--color-hover)' }}>PDT</div>
          {gridDays.map((day) => (
            <div key={day.key} className="border-l p-2 text-center text-xs font-bold text-[var(--color-text)]" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
              {day.label}
            </div>
          ))}
          {hours.map((hour, row) => (
            <div key={hour} className="contents">
              <div className="border-t p-2 text-xs font-bold text-[var(--color-text-muted)]" style={{ borderColor: 'var(--color-border-soft)' }}>{hour}</div>
              {gridDays.map((day) => {
                const dayAppointments = filteredAppointments.filter((appointment) => appointment.scheduleDay === day.key && hourIndex(appointment.time) === row);
                return (
                  <div key={`${day.key}-${hour}`} className="min-h-[92px] border-l border-t p-2" style={{ borderColor: 'var(--color-border-soft)' }}>
                    <div className="grid gap-2">
                      {dayAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelectedAppointmentId(appointment.id)}
                          className="clinical-focus rounded-[var(--radius-md)] border p-2 text-left"
                          style={{
                            background: appointment.appointmentType === 'TREATMENT_FRACTION'
                              ? 'color-mix(in srgb, var(--color-success) 8%, var(--color-card))'
                              : 'color-mix(in srgb, var(--color-info) 8%, var(--color-card))',
                            borderColor: appointment.id === selectedAppointment?.id ? 'var(--color-primary)' : 'var(--color-border-soft)',
                          }}
                        >
                          <p className="truncate text-xs font-bold text-[var(--color-text)]">{appointment.displayLabel}</p>
                          <p className="mt-1 truncate text-[11px] font-bold text-[var(--color-primary)]">{appointment.title}</p>
                          <p className="mt-1 truncate text-[11px] font-semibold text-[var(--color-text-muted)]">{appointment.time}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </PageStack>
  );
}
