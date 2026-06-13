export const dynamic = 'force-dynamic';

import { ReportsCommandClient, type ReportKpiRow, type ReportPackRow } from '@/components/reports/reports-command-client';
import { getAnalyticsTelemetry } from '@/lib/services/analytics-telemetry-service';

function toneForReport(tone: string): ReportKpiRow['tone'] {
  if (tone === 'success' || tone === 'warning' || tone === 'error' || tone === 'info' || tone === 'primary') {
    return tone;
  }
  return 'default';
}

export default async function ReportsPage() {
  const telemetry = await getAnalyticsTelemetry();
  const kpis: ReportKpiRow[] = telemetry.overview.kpis.map((kpi) => ({
    label: kpi.label,
    value: kpi.value,
    detail: kpi.detail,
    tone: toneForReport(kpi.tone),
  }));
  const workflowInsight = telemetry.workflow.insights[0] ?? telemetry.overview.insights[0];
  const treatmentInsight = telemetry.treatment.insights[0] ?? telemetry.overview.insights[0];
  const documentInsight = telemetry.documents.insights[0] ?? telemetry.overview.insights[0];
  const billingInsight = telemetry.billingRisk.insights[0] ?? telemetry.overview.insights[0];
  const reportPacks: ReportPackRow[] = [
    {
      id: 'workflow',
      title: 'Workflow Performance',
      detail: 'Carepath flow, owner pressure, and tokenized inspection queues.',
      href: '/analytics?panel=workflow',
      domain: 'Carepath Operations',
      cadence: 'Daily huddle',
      output: 'PDF summary + exception rows',
      readiness: workflowInsight?.severity === 'HIGH' ? 'Needs Review' : 'Ready',
      source: 'Tasks, workflow steps, signatures',
      metric: `${telemetry.workflow.courseDrilldown.length} course queue rows`,
      risk: workflowInsight?.title ?? 'No active workflow insight',
      insight: workflowInsight?.summary ?? 'No workflow insight available.',
    },
    {
      id: 'treatment',
      title: 'Treatment Analytics',
      detail: 'Fraction throughput, approvals, held courses, and course progress.',
      href: '/analytics?panel=treatment',
      domain: 'Treatment Delivery',
      cadence: 'Start/end of day',
      output: 'Treatment ops packet',
      readiness: treatmentInsight?.severity === 'HIGH' ? 'Needs Review' : 'Ready',
      source: 'Fraction logs and course progress',
      metric: `${telemetry.treatment.courseProgress.length} course progress rows`,
      risk: treatmentInsight?.title ?? 'No active treatment insight',
      insight: treatmentInsight?.summary ?? 'No treatment insight available.',
    },
    {
      id: 'documents',
      title: 'Document Intelligence',
      detail: 'Lifecycle funnel, signature aging, template coverage, and evidence gaps.',
      href: '/analytics?panel=documents',
      domain: 'Documents & Templates',
      cadence: 'Twice weekly',
      output: 'Evidence gap packet',
      readiness: documentInsight?.severity === 'HIGH' ? 'Needs Review' : 'Ready',
      source: 'Generated documents and template registry',
      metric: `${telemetry.documents.signatureAging.reduce((total, bucket) => total + bucket.count, 0)} aging items`,
      risk: documentInsight?.title ?? 'No active document insight',
      insight: documentInsight?.summary ?? 'No document insight available.',
    },
    {
      id: 'billing',
      title: 'Billing & Risk',
      detail: 'Audit closeout readiness, billing state, risk graph, and PHI boundary assurance.',
      href: '/analytics?panel=billing-risk',
      domain: 'Billing, Audit, PHI',
      cadence: 'Weekly closeout',
      output: 'Audit evidence export',
      readiness: billingInsight?.severity === 'HIGH' ? 'Needs Review' : 'Ready',
      source: 'Billing readiness, audit checks, PHI signals',
      metric: `${telemetry.billingRisk.billingReadiness.length} billing readiness bands`,
      risk: billingInsight?.title ?? 'No active billing/risk insight',
      insight: billingInsight?.summary ?? 'No billing/risk insight available.',
    },
  ];

  return (
    <ReportsCommandClient
      asOfLabel={telemetry.asOfLabel}
      sampleNotice={telemetry.sampleNotice}
      kpis={kpis}
      reportPacks={reportPacks}
    />
  );
}
