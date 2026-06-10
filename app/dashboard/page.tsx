import { LayoutDashboard, UsersRound, ShieldCheck, Building2, ClipboardList, CalendarDays, FileText, AlertTriangle, User } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  appointments,
  activities,
  priorityFlags,
  treatmentCourses,
} from '@/lib/clinical-store';

const mockData = {
  user: { name: 'Dr. Sarah Johnson', role: 'Physician', branch: 'QC Main' },
  kpis: [
    { label: 'Active Patients', value: '48', icon: UsersRound, tone: 'primary' as const },
    { label: 'Today\'s Treatments', value: '12', icon: CalendarDays, tone: 'info' as const },
    { label: 'Pending Tasks', value: '7', icon: ClipboardList, tone: 'warning' as const },
    { label: ' Documents Ready', value: '23', icon: FileText, tone: 'success' as const },
  ],
  attention: [
    { label: 'Overdue treatment plans', value: '3', variant: 'error' as const },
    { label: 'Missing consent forms', value: '2', variant: 'warning' as const },
    { label: 'Billing codes pending review', value: '5', variant: 'warning' as const },
  ],
  weeklyTrend: [
    { day: 'Mon', count: 8 },
    { day: 'Tue', count: 12 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 14 },
    { day: 'Fri', count: 9 },
  ],
};

function ContextTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <Card compact>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center"
          style={{
            borderRadius: 'var(--radius-md)',
            border: '1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border))',
            background: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-card))',
            color: 'var(--color-primary)',
          }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-body font-bold uppercase" style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
            {label}
          </div>
          <div className="truncate font-heading font-bold" style={{ fontSize: 18, marginTop: 4, color: 'var(--color-text)' }}>
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

function PatientPipelineCard() {
  const courses = treatmentCourses;
  const upcoming = courses.filter(c => c.chartRoundsPhase === 'UPCOMING').length;
  const onTreatment = courses.filter(c => c.chartRoundsPhase === 'ON_TREATMENT').length;
  const post = courses.filter(c => c.chartRoundsPhase === 'POST').length;
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Patient Pipeline
      </h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--color-info) 10%, var(--color-card))', border: '1px solid color-mix(in srgb, var(--color-info) 20%, var(--color-border-soft))' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-info)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginTop: 4 }}>{upcoming}</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--color-warning) 10%, var(--color-card))', border: '1px solid color-mix(in srgb, var(--color-warning) 20%, var(--color-border-soft))' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-warning)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>On Treatment</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginTop: 4 }}>{onTreatment}</div>
        </div>
        <div style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-card))', border: '1px solid color-mix(in srgb, var(--color-success) 20%, var(--color-border-soft))' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-success)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Post</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginTop: 4 }}>{post}</div>
        </div>
      </div>
    </Card>
  );
}

function UrgentAttentionCard() {
  const highFlags = priorityFlags.filter(f => f.severity === 'HIGH');
  const mediumFlags = priorityFlags.filter(f => f.severity === 'MEDIUM');
  const blockedTasks = carepathTasks.filter(t => t.status === 'BLOCKED');
  const pendingDocs = generatedDocuments.filter(d => d.status === 'PENDING_NEEDED' || d.status === 'NEEDS_REVIEW');
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Urgent Attention
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>High priority flags</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-error)', background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{highFlags.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Medium priority flags</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{mediumFlags.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Blocked tasks</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-error)', background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{blockedTasks.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Documents needing review</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{pendingDocs.length}</span>
        </div>
      </div>
    </Card>
  );
}

function ActivityTrendCard() {
  const { weeklyTrend } = mockData;
  const maxCount = Math.max(...weeklyTrend.map(d => d.count));
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Weekly Activity Trend
      </h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120, paddingTop: 8 }}>
        {weeklyTrend.map(d => {
          const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
          return (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: '100%', height: `${pct}%`, minHeight: 8, background: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-border-soft))', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {d.count}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)' }}>{d.day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PhaseDistributionCard() {
  const courses = treatmentCourses;
  const phases = {
    UPCOMING: courses.filter(c => c.chartRoundsPhase === 'UPCOMING').length,
    ON_TREATMENT: courses.filter(c => c.chartRoundsPhase === 'ON_TREATMENT').length,
    POST: courses.filter(c => c.chartRoundsPhase === 'POST').length,
  };
  const total = courses.length;
  const items: { label: string; count: number; color: string }[] = [
    { label: 'Upcoming', count: phases.UPCOMING, color: 'var(--color-info)' },
    { label: 'On Treatment', count: phases.ON_TREATMENT, color: 'var(--color-warning)' },
    { label: 'Post', count: phases.POST, color: 'var(--color-success)' },
  ];
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Phase Distribution
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <div key={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>{item.label}</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{item.count}</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 'var(--radius-md)', background: 'var(--color-border-soft)' }}>
              <div style={{ height: '100%', borderRadius: 'var(--radius-md)', background: item.color, width: `${total > 0 ? (item.count / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TodayScheduleCard() {
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Today{"'"}s Schedule
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {appointments.map(apt => (
          <div key={apt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{apt.time}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{apt.patientName}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{apt.title}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'right', flexShrink: 0 }}>
              {apt.location}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No appointments scheduled today
          </div>
        )}
      </div>
    </Card>
  );
}

function RecentActivityCard() {
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Recent Activity
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activities.map(a => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-border-soft)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-border-soft))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={14} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>
                <span style={{ fontWeight: 600 }}>{a.actor}</span>
                {' '}{a.action}{' '}
                <span style={{ color: 'var(--color-primary)' }}>{a.target}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{a.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TreatmentProgressCard() {
  const activeCourses = treatmentCourses.filter(c => c.chartRoundsPhase === 'ON_TREATMENT' || c.status === 'ACTIVE');
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Treatment Progress
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeCourses.map(course => {
          const pct = course.totalFractions > 0 ? Math.round((course.currentFraction / course.totalFractions) * 100) : 0;
          return (
            <div key={course.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>{course.protocolName}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)' }}>{course.currentFraction}/{course.totalFractions}</span>
              </div>
              <div style={{ height: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-border-soft)' }}>
                <div style={{ height: '100%', borderRadius: 'var(--radius-md)', background: pct >= 100 ? 'var(--color-success)' : 'var(--color-primary)', width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {activeCourses.length === 0 && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No active treatments
          </div>
        )}
      </div>
    </Card>
  );
}

function TaskSummaryCard() {
  const totalTasks = carepathTasks.length;
  const needsReview = carepathTasks.filter(t => t.status === 'NEEDS_REVIEW').length;
  const inProgress = carepathTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = carepathTasks.filter(t => t.status === 'PENDING').length;
  const completed = carepathTasks.filter(t => t.status === 'COMPLETED').length;
  const blocked = carepathTasks.filter(t => t.status === 'BLOCKED').length;
  return (
    <Card>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', marginBottom: 16 }}>
        Task Summary
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Total Tasks</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{totalTasks}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Needs Review</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{needsReview}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>In Progress</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-info)', background: 'color-mix(in srgb, var(--color-info) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{inProgress}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Pending</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', background: 'color-mix(in srgb, var(--color-text-muted) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{pending}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Blocked</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-error)', background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{blocked}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-soft)', background: 'var(--color-bg)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-text)' }}>Completed</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 10%, transparent)', padding: '2px 10px', borderRadius: '9999px' }}>{completed}</span>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, kpis, attention } = mockData;

  return (
    <PageStack>
      <PageHeader title="Dashboard" subtitle="Clinical workflow at a glance" />

      <div className="grid gap-3 md:grid-cols-3">
        <ContextTile label="Signed in" value={user.name} icon={UsersRound} />
        <ContextTile label="Role" value={user.role} icon={ShieldCheck} />
        <ContextTile label="Branch" value={user.branch} icon={Building2} />
      </div>

      <StatGrid>
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} tone={kpi.tone} />
        ))}
      </StatGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ gap: 'var(--space-section)' }}>
        <PatientPipelineCard />
        <UrgentAttentionCard />
        <ActivityTrendCard />
        <TodayScheduleCard />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-section)' }}>
        <PhaseDistributionCard />
        <RecentActivityCard />
        <TreatmentProgressCard />
        <TaskSummaryCard />
      </div>

      <Card>
        <h2 className="font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18, marginBottom: 12 }}>
          Attention Required
        </h2>
        <div className="flex flex-col" style={{ gap: 'var(--space-1)' }}>
          {attention.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3"
              style={{
                padding: '10px 12px',
                border: '1px solid var(--color-border-soft)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
              }}
            >
              <span className="font-body font-semibold" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text)' }}>
                {item.label}
              </span>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: item.variant === 'error' ? 'var(--color-error)/10' : 'var(--color-warning)/10',
                  color: item.variant === 'error' ? 'var(--color-error)' : 'var(--color-warning)',
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </PageStack>
  );
}
