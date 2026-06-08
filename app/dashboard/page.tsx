import { LayoutDashboard, UsersRound, ShieldCheck, Building2, ClipboardList, CalendarDays, FileText, AlertTriangle } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';

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
