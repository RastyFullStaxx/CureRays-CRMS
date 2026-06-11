import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, Clock3, Download, PenLine, UsersRound } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/services/operational-page-service";
import {
  auditBlockers,
  auditReadinessScore,
  documentStatusCounts,
  overdueTaskCount,
  workflowBottlenecksByParty
} from "@/lib/workflow";
import { mapTone } from "@/lib/status-utils";

export default function AnalyticsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();
  const blockers = auditBlockers(carepathTasks, generatedDocuments, fractionLogEntries);
  const documentCounts = documentStatusCounts(generatedDocuments);
  const bottlenecks = workflowBottlenecksByParty(carepathTasks, generatedDocuments);
  const onTreatment = patients.filter((patient) => patient.chartRoundsPhase === "ON_TREATMENT").length;
  const auditReady = auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries);

  return (
    <PageStack>
      <PageHeader
        title="Analytics"
        subtitle="Operational insights, workflow metrics, and audit readiness"
        actions={<Button variant="secondary" disabled><Download className="h-4 w-4" /> Export Report</Button>}
      />
      <StatGrid>
        <StatCard icon={UsersRound} label="Active Courses" value={treatmentCourses.length} sub="All locations" />
        <StatCard icon={CalendarDays} label="On Treatment" value={onTreatment} sub="Active courses" tone="success" />
        <StatCard icon={PenLine} label="Pending Signatures" value={generatedDocuments.filter((document) => document.signReviewState !== "SIGNED").length} sub="Documents" tone="warning" />
        <StatCard icon={Clock3} label="Overdue Tasks" value={overdueTaskCount(carepathTasks)} sub="Role queues" tone="error" />
        <StatCard icon={CheckCircle2} label="Audit Ready" value={`${auditReady}%`} sub="Closeout" tone="success" />
        <StatCard icon={BarChart3} label="Billing Ready" value={14} sub="Courses" />
      </StatGrid>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: 'var(--color-text)' }}>Patient/Course Volume Trend</h2>
          <div className="flex h-52 items-end gap-3 px-3 pb-4">
            {[62, 78, 84, 93, 82, 88, 79].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t" style={{ height: `${value}%`, background: 'var(--color-primary)' }} />
                <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>W{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: 'var(--color-text)' }}>Phase Distribution</h2>
          <div className="space-y-2">
            {[
              { label: "Upcoming", value: patients.filter((p) => p.chartRoundsPhase === "UPCOMING").length, color: "var(--color-info)" },
              { label: "On Treatment", value: onTreatment, color: "var(--color-success)" },
              { label: "Post", value: patients.filter((p) => p.chartRoundsPhase === "POST").length, color: "var(--color-primary)" },
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
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: 'var(--color-text)' }}>Workflow Funnel</h2>
          <div className="space-y-3">
            {[{ label: "Consult", value: 238 }, { label: "Chart Prep", value: 212 }, { label: "Simulation", value: 176 }, { label: "Planning", value: 128 }, { label: "Treatment", value: 52 }, { label: "Audit", value: 18 }].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-20 text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-border-soft)' }}>
                  <div className="h-full rounded" style={{ width: `${(item.value / 238) * 100}%`, background: 'var(--color-primary)' }} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: 'var(--color-text)' }}>Overdue Tasks by Role</h2>
          <div className="space-y-3">
            {bottlenecks.slice(0, 6).map((item) => (
              <div key={item.responsibleParty} className="flex items-center gap-3">
                <span className="w-20 text-[11px] font-semibold truncate" style={{ color: 'var(--color-text-muted)' }}>{item.responsibleParty}</span>
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-border-soft)' }}>
                  <div className="h-full rounded" style={{ width: `${Math.min(100, ((item.overdueActions + item.reviewItems) / 20) * 100)}%`, background: 'var(--color-warning)' }} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>{item.overdueActions + item.reviewItems}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: 'var(--color-text)' }}>Documentation Readiness</h2>
          <div className="space-y-2">
            {[
              { label: "Ready", value: documentCounts.SIGNED + documentCounts.UPLOADED + documentCounts.COMPLETED, color: "var(--color-success)" },
              { label: "Review", value: documentCounts.READY_FOR_REVIEW + documentCounts.NEEDS_REVIEW, color: "var(--color-info)" },
              { label: "Missing", value: documentCounts.MISSING_FIELDS + documentCounts.PENDING_NEEDED, color: "var(--color-warning)" },
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
        </div>
      </div>
    </PageStack>
  );
}
