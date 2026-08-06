export const dynamic = 'force-dynamic';

import { AnalyticsCommandClient } from '@/components/analytics/analytics-command-client';
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
    <AnalyticsCommandClient
      telemetry={await getAnalyticsTelemetry()}
      initialPanel={panelFromSearch(panel)}
    />
  );
}
