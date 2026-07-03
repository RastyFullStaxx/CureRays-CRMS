'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Filter, Link2, MapPin, UserRound, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PROTOTYPE_OPERATIONAL_DATE } from '@/lib/operational-date';
import { statusTone } from '@/lib/status-utils';
import type { OperationalAppointment, WorkflowStep } from '@/lib/types';
import { formatUiLabel } from '@/lib/ui-copy';

type ScheduleCommandClientProps = {
  appointments: OperationalAppointment[];
  workflowSteps: WorkflowStep[];
};

const hours = ['7 AM', '9 AM', '11 AM', '1 PM', '3 PM', '5 PM'];

function parseDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfWeek(date: string) {
  const parsed = parseDate(date);
  const day = parsed.getUTCDay();
  return addDays(parsed, day === 0 ? -6 : 1 - day);
}

function dayLabel(date: Date, includeYear = false) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

function rangeLabel(start: Date) {
  const end = addDays(start, 6);
  const startLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(start);
  const endLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(end);
  return `${startLabel} - ${endLabel}`;
}

function appointmentDate(appointment: OperationalAppointment) {
  return appointment.dateTime?.slice(0, 10) ?? PROTOTYPE_OPERATIONAL_DATE;
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

export function ScheduleCommandClient({ appointments, workflowSteps }: ScheduleCommandClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(PROTOTYPE_OPERATIONAL_DATE);
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointments[0]?.id ?? '');

  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const gridDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return { key: dateKey(date), label: dayLabel(date) };
  }), [weekStart]);
  const weekEnd = gridDays.at(-1)?.key ?? selectedDate;
  const appointmentRows = useMemo(() => appointments.map((appointment) => ({
    ...appointment,
    scheduleDay: appointmentDate(appointment),
  })), [appointments]);
  const weekAppointments = useMemo(() => appointmentRows.filter((appointment) => (
    appointment.scheduleDay >= gridDays[0].key && appointment.scheduleDay <= weekEnd
  )), [appointmentRows, gridDays, weekEnd]);
  const typeOptions = useMemo(() => Array.from(new Set(weekAppointments.map((appointment) => appointment.appointmentType ?? 'CONSULT'))).sort(), [weekAppointments]);
  const locationOptions = useMemo(() => Array.from(new Set(weekAppointments.map((appointment) => appointment.location))).sort(), [weekAppointments]);
  const filteredAppointments = useMemo(() => weekAppointments.filter((appointment) => {
    const dayMatches = selectedDay === 'all' || appointment.scheduleDay === selectedDay;
    const typeMatches = selectedType === 'all' || (appointment.appointmentType ?? 'CONSULT') === selectedType;
    const locationMatches = selectedLocation === 'all' || appointment.location === selectedLocation;
    return dayMatches && typeMatches && locationMatches;
  }), [selectedDay, selectedLocation, selectedType, weekAppointments]);
  const selectedAppointment = filteredAppointments.find((appointment) => appointment.id === selectedAppointmentId) ?? filteredAppointments[0];
  const selectedWorkflowStep = workflowSteps.find((step) => step.id === selectedAppointment?.linkedWorkflowStepId);
  const treatments = weekAppointments.filter((appointment) => appointment.appointmentType === 'TREATMENT_FRACTION').length;
  const simulations = weekAppointments.filter((appointment) => appointment.appointmentType === 'SIMULATION' || appointment.appointmentType === 'MAPPING').length;
  const providers = new Set(weekAppointments.map((appointment) => appointment.staff)).size;

  const selectOperationalToday = () => {
    setSelectedDate(PROTOTYPE_OPERATIONAL_DATE);
    setSelectedDay(PROTOTYPE_OPERATIONAL_DATE);
  };

  const openLinkedWork = () => {
    if (!selectedAppointment?.linkedWorkflowStepId) return;
    const params = new URLSearchParams({
      tab: 'prepare',
      targetKind: 'step',
      targetId: selectedAppointment.linkedWorkflowStepId,
    });
    router.push(`/patients/${encodeURIComponent(selectedAppointment.patientRef)}?${params.toString()}`);
  };

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Schedule"
        subtitle="Appointments, staff lanes, and workflow-linked timing"
        actions={(
          <>
            <Button type="button" variant="secondary" onClick={selectOperationalToday}>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Go to Today
            </Button>
            <label className="min-w-[150px]">
              <span className="sr-only">Schedule Date</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value || PROTOTYPE_OPERATIONAL_DATE);
                  setSelectedDay('all');
                }}
                aria-label="Schedule Date"
              />
            </label>
            <PrototypeActionButton label="New Appointment" icon="plus" kind="schedule" variant="primary" description="Stage an appointment linked to workflow timing." />
          </>
        )}
      />

      <StatGrid>
        <StatCard icon={CalendarDays} label="Total" value={weekAppointments.length} sub="Appointments" />
        <StatCard icon={CheckCircle2} label="Treatments" value={treatments} sub="Fractions" tone="neutral" />
        <StatCard icon={Clock3} label="Simulations" value={simulations} sub="Mapping/sim" tone="neutral" />
        <StatCard icon={UsersRound} label="Providers" value={providers} sub="On schedule" tone="neutral" />
      </StatGrid>

      <Card compact>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-[180px] items-center gap-2 type-label text-[var(--color-text-muted)]">
            <Filter className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
            Schedule Controls
          </div>
          <div className="min-w-[150px] flex-1">
            <Select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)} aria-label="Schedule Day">
              <option value="all">All Week</option>
              {gridDays.map((day) => <option key={day.key} value={day.key}>{day.label}</option>)}
            </Select>
          </div>
          <div className="min-w-[180px] flex-1">
            <Select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} aria-label="Appointment Type">
              <option value="all">All Visit Types</option>
              {typeOptions.map((type) => <option key={type} value={type}>{formatUiLabel(type)}</option>)}
            </Select>
          </div>
          <div className="min-w-[180px] flex-1">
            <Select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} aria-label="Location">
              <option value="all">All Locations</option>
              {locationOptions.map((location) => <option key={location} value={location}>{location}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,360px)]">
        <Card className="min-h-[280px]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="type-heading text-[var(--color-text)]">Upcoming Appointments</h2>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{filteredAppointments.length} visible after filters</p>
            </div>
            <Badge variant="neutral">Visible Week</Badge>
          </div>
          <ScrollArea axis="x" className="-mx-1 px-1 pb-1">
            <div className="flex min-w-max gap-3">
              {filteredAppointments.length === 0 ? (
                <div className="min-w-[260px] rounded-[var(--radius-md)] border p-4 type-body text-[var(--color-text-muted)]" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
                  No appointments match the active week and filters.
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
                  <p className="type-supporting text-[var(--color-primary)]">{dayLabel(parseDate(appointment.scheduleDay))} · {appointment.time}</p>
                  <p className="mt-2 truncate type-body text-[var(--color-text)]">{appointment.displayLabel}</p>
                  <p className="truncate type-supporting text-[var(--color-text-muted)]">{appointment.title}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant={statusTone(appointment.status ?? 'SCHEDULED')}>{formatUiLabel(appointment.status ?? 'SCHEDULED')}</Badge>
                    <Badge variant="neutral">{formatUiLabel(appointment.appointmentType ?? 'CONSULT')}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="min-w-0 self-start">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="clinical-label">Selected Visit</p>
              <h2 className="mt-1 truncate type-heading text-[var(--color-text)]">{selectedAppointment?.title ?? 'No appointment selected'}</h2>
            </div>
            {selectedAppointment ? <Badge variant={statusTone(selectedAppointment.status ?? 'SCHEDULED')}>{formatUiLabel(selectedAppointment.status ?? 'SCHEDULED')}</Badge> : null}
          </div>
          {selectedAppointment ? (
            <div className="mt-4 grid gap-3">
              {[
                { icon: UserRound, label: 'Patient / Course', value: `${selectedAppointment.displayLabel}${selectedAppointment.courseId ? ` / ${selectedAppointment.courseId}` : ''}` },
                { icon: CalendarDays, label: 'Date and Time', value: `${dayLabel(parseDate(selectedAppointment.scheduleDay), true)} at ${selectedAppointment.time}` },
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
                      <span className="mt-1 block truncate type-body text-[var(--color-text)]">{item.value}</span>
                    </span>
                  </div>
                );
              })}
              {selectedWorkflowStep ? (
                <div className="clinical-muted-surface flex items-center justify-between gap-3 p-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-card)] text-[var(--color-primary)]">
                      <Link2 className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="clinical-label block">Linked Work</span>
                      <span className="mt-1 block truncate type-body text-[var(--color-text)]">{selectedWorkflowStep.stepName}</span>
                    </span>
                  </span>
                  <Badge variant={statusTone(selectedWorkflowStep.status)}>{formatUiLabel(selectedWorkflowStep.status)}</Badge>
                </div>
              ) : null}
              {selectedWorkflowStep ? (
                <Button type="button" variant="primary" onClick={openLinkedWork}>
                  Open Linked Work
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 type-body text-[var(--color-text-muted)]">Select a visible appointment to review details.</p>
          )}
        </Card>
      </div>

      <Card className="min-h-[720px] min-w-0 overflow-hidden" style={{ padding: '0' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--color-border-soft)' }}>
          <h2 className="type-heading text-[var(--color-text)]">{rangeLabel(weekStart)}</h2>
          <p className="mt-1 type-body text-[var(--color-text-muted)]">Weekly calendar with workflow-linked appointment blocks.</p>
        </div>
        <ScrollArea axis="both" className="max-h-[calc(100dvh-96px)]">
          <div className="grid min-w-[1080px] grid-cols-[64px_repeat(7,minmax(144px,1fr))] border-t" style={{ borderColor: 'var(--color-border-soft)' }}>
            <div className="p-2 type-supporting text-[var(--color-text-muted)]" style={{ background: 'var(--color-hover)' }}>PDT</div>
            {gridDays.map((day) => (
              <div key={day.key} className="border-l p-2 text-center type-supporting text-[var(--color-text)]" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-hover)' }}>
                {day.label}
              </div>
            ))}
            {hours.map((hour, row) => (
              <div key={hour} className="contents">
                <div className="border-t p-2 type-supporting text-[var(--color-text-muted)]" style={{ borderColor: 'var(--color-border-soft)' }}>{hour}</div>
                {gridDays.map((day) => {
                  const dayAppointments = filteredAppointments.filter((appointment) => appointment.scheduleDay === day.key && hourIndex(appointment.time) === row);
                  return (
                    <div key={`${day.key}-${hour}`} className="min-h-[104px] border-l border-t p-2" style={{ borderColor: 'var(--color-border-soft)' }}>
                      <div className="grid gap-2">
                        {dayAppointments.map((appointment) => (
                          <button
                            key={appointment.id}
                            type="button"
                            onClick={() => setSelectedAppointmentId(appointment.id)}
                            className="clinical-focus rounded-[var(--radius-md)] border p-2 text-left"
                            style={{
                              background: appointment.appointmentType === 'TREATMENT_FRACTION' ? 'var(--status-positive-surface)' : 'var(--status-neutral-surface)',
                              borderColor: appointment.id === selectedAppointment?.id ? 'var(--color-primary)' : 'var(--color-border-soft)',
                            }}
                          >
                            <p className="truncate type-supporting text-[var(--color-text)]">{appointment.displayLabel}</p>
                            <p className="mt-1 truncate type-supporting text-[var(--color-primary)]">{appointment.title}</p>
                            <p className="mt-1 truncate type-supporting text-[var(--color-text-muted)]">{appointment.time}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </PageStack>
  );
}
