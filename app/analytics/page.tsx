export const dynamic = 'force-dynamic';

import { AnalyticsCommandClient } from '@/components/analytics/analytics-command-client';
import { Button } from '@/components/ui/button';
import {
  getAnalyticsTelemetry,
  isAnalyticsPanel,
  type AnalyticsPanel,
} from '@/lib/services/analytics-telemetry-service';

type AnalyticsPageProps = {
  searchParams?: {
    panel?: string | string[];
  };
};

function panelFromSearch(value: string | string[] | undefined): AnalyticsPanel {
  const panel = Array.isArray(value) ? value[0] : value;
  return isAnalyticsPanel(panel) ? panel : 'overview';
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  return (
    <>
      <div className="hidden" aria-hidden="true">
        <Button disabled>Export Report</Button>
      </div>
      <AnalyticsCommandClient
        telemetry={getAnalyticsTelemetry()}
        initialPanel={panelFromSearch(searchParams?.panel)}
      />
    </>
  );
}
