import Link from 'next/link';
import {
  AlertOctagon,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileCheck2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PageStack } from '@/components/shared/page-stack';
import { StatCard } from '@/components/shared/stat-card';
import { StatGrid } from '@/components/shared/stat-grid';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type {
  DashboardOperationsItem,
  DashboardOperationsSnapshot,
} from '@/lib/services/dashboard-telemetry-service';

type DashboardTelemetryClientProps = {
  snapshot: DashboardOperationsSnapshot;
};

type OperationsCardProps = {
  id: string;
  title: string;
  items: DashboardOperationsItem[];
  empty: string;
  viewAllHref: string;
};

function OperationsCard({
  id,
  title,
  items,
  empty,
  viewAllHref,
}: OperationsCardProps) {
  return (
    <Card as="section" className="dashboard-operations-card" aria-labelledby={id}>
      <div className="dashboard-operations-card-header">
        <h2 id={id} className="type-heading text-[var(--color-text)]">{title}</h2>
        <Link href={viewAllHref} className="clinical-focus type-button text-[var(--color-primary)] no-underline">
          View All
        </Link>
      </div>

      {items.length > 0 ? (
        <ul className="dashboard-operations-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="clinical-focus dashboard-operations-item"
                aria-label={`Open ${item.title}`}
              >
                <div className="min-w-0">
                  <p className="truncate type-body-strong text-[var(--color-text)]">{item.title}</p>
                  <p className="truncate type-supporting text-[var(--color-text-muted)]">{item.detail}</p>
                </div>
                <div className="dashboard-operations-item-meta">
                  <Badge variant={item.tone}>{item.status}</Badge>
                  <p className="truncate type-supporting text-[var(--color-text-muted)]">{item.meta}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-operations-empty type-supporting text-[var(--color-text-muted)]">{empty}</p>
      )}
    </Card>
  );
}

export function DashboardTelemetryClient({ snapshot }: DashboardTelemetryClientProps) {
  return (
    <PageStack className="dashboard-operations scrollbar-soft">
      <PageHeader
        title="Daily Operations"
        subtitle="Current appointments, actionable work, and exceptions requiring staff attention."
      />

      <StatGrid>
        <Link href="/schedule" className="clinical-focus no-underline">
          <StatCard
            icon={CalendarDays}
            label="Appointments Today"
            value={snapshot.metrics.appointmentsToday}
            sub="Open Schedule"
            className="h-full"
          />
        </Link>
        <Link href="/tasks?bucket=ALL_OPEN" className="clinical-focus no-underline">
          <StatCard
            icon={ClipboardList}
            label="Actionable Tasks"
            value={snapshot.metrics.actionableTasks}
            sub="Open Task Queue"
            className="h-full"
          />
        </Link>
        <Link href="/tasks?queue=BLOCKED&bucket=ALL_OPEN" className="clinical-focus no-underline">
          <StatCard
            icon={AlertOctagon}
            label="Blocked Work"
            value={snapshot.metrics.blockedWork}
            sub="Resolve Blockers"
            tone={snapshot.metrics.blockedWork > 0 ? 'negative' : 'neutral'}
            className="h-full"
          />
        </Link>
        <Link href="/tasks?queue=SIGNATURES&bucket=ALL_OPEN" className="clinical-focus no-underline">
          <StatCard
            icon={FileCheck2}
            label="Documents Awaiting Review"
            value={snapshot.metrics.documentsAwaitingReview}
            sub="Open Review Queue"
            tone={snapshot.metrics.documentsAwaitingReview > 0 ? 'intermediate' : 'neutral'}
            className="h-full"
          />
        </Link>
      </StatGrid>

      <div className="dashboard-operations-body">
        <OperationsCard
          id="dashboard-priority-queue"
          title="Priority Queue"
          items={snapshot.priorityQueue}
          empty="No actionable priority work is available."
          viewAllHref="/tasks?bucket=ALL_OPEN"
        />
        <div className="dashboard-operations-side">
          <OperationsCard
            id="dashboard-today-schedule"
            title="Today Schedule"
            items={snapshot.todaySchedule}
            empty="No route-backed appointments are scheduled today."
            viewAllHref="/schedule"
          />
          <OperationsCard
            id="dashboard-exceptions"
            title="Exceptions"
            items={snapshot.exceptions}
            empty="No actionable workflow exceptions are open."
            viewAllHref="/tasks?bucket=ALL_OPEN"
          />
        </div>
      </div>
    </PageStack>
  );
}
