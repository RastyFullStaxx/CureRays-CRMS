import { BarChart3, UsersRound, CalendarDays, ClipboardList, FileText, PenLine } from 'lucide-react';
import Link from 'next/link';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';

export default function ReportsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const onTreatment = patients.filter((p) => p.chartRoundsPhase === 'ON_TREATMENT').length;
  const overdueTasks = carepathTasks.filter((t) => t.status === 'BLOCKED').length;

  return (
    <PageStack>
      <PageHeader
        title="Reports"
        subtitle="Operational intelligence and clinical workflow signals"
      />

      <FilterStrip>
        <FilterField grow>
          <Input placeholder="Search report, diagnosis, phase, staff workload, or audit signal" />
        </FilterField>
        <FilterField><Input placeholder="Date Range" /></FilterField>
        <FilterField><Input placeholder="Location" /></FilterField>
        <FilterField><Input placeholder="Phase" /></FilterField>
      </FilterStrip>

      <StatGrid>
        <StatCard icon={UsersRound} label="Active Patients" value={patients.length} tone="primary" />
        <StatCard icon={CalendarDays} label="On Treatment" value={onTreatment} tone="success" />
        <StatCard icon={ClipboardList} label="Pending Tasks" value={carepathTasks.length} tone="warning" />
        <StatCard icon={FileText} label="Documents Ready" value={generatedDocuments.length} tone="info" />
        <StatCard icon={PenLine} label="Overdue Tasks" value={overdueTasks} tone="error" />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Patient Phase Distribution
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Upcoming', value: patients.filter((p) => p.chartRoundsPhase === 'UPCOMING').length, color: 'var(--color-info)' },
              { label: 'On Treatment', value: onTreatment, color: 'var(--color-success)' },
              { label: 'Post', value: patients.filter((p) => p.chartRoundsPhase === 'POST').length, color: 'var(--color-primary)' },
            ].map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ background: segment.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{segment.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{segment.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Documentation Readiness
          </h2>
          <div className="space-y-2">
            {[
              { label: 'Signed', value: generatedDocuments.filter((d) => d.signReviewState === 'SIGNED').length, color: 'var(--color-success)' },
              { label: 'Pending Review', value: generatedDocuments.filter((d) => d.signReviewState === 'READY_FOR_SIGNATURE').length, color: 'var(--color-info)' },
              { label: 'Needs Action', value: generatedDocuments.filter((d) => d.signReviewState === 'REVIEW_REQUIRED').length, color: 'var(--color-warning)' },
            ].map((segment) => (
              <div key={segment.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded" style={{ background: segment.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{segment.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{segment.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>Need deeper patterns?</h2>
            <p className="mt-2" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
              Reports show current state. Analytics explains bottlenecks, risks, and solution opportunities.
            </p>
          </div>
          <Link href="/analytics">
            <Button>Open Analytics</Button>
          </Link>
        </div>
      </Card>
    </PageStack>
  );
}
