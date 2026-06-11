import { DashboardTelemetryClient } from '@/components/dashboard/dashboard-telemetry-client';
import { getDashboardTelemetry } from '@/lib/services/dashboard-telemetry-service';

export default function DashboardPage() {
  return <DashboardTelemetryClient telemetry={getDashboardTelemetry()} />;
}
