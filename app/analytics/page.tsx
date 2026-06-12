export const dynamic = 'force-dynamic';

import { AnalyticsCommandClient } from '@/components/analytics/analytics-command-client';
import { Button } from '@/components/ui/button';
import {
  getAnalyticsTelemetry,
  isAnalyticsPanel,
  type AnalyticsPanel,
} from '@/lib/services/analytics-telemetry-service';

function panelFromSearch(value: string | string[] | undefined): AnalyticsPanel {
  const panel = Array.isArray(value) ? value[0] : value;
  return isAnalyticsPanel(panel) ? panel : 'overview';
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ panel?: string | string[] }> }) {
  const { panel } = await searchParams;
  return (
    <>
      <div className="hidden" aria-hidden="true">
        <Button disabled>Export Report</Button>
      </div>
      <AnalyticsCommandClient
        telemetry={getAnalyticsTelemetry()}
        initialPanel={panelFromSearch(panel)}
      />
    </>
  );
}
