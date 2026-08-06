import { DashboardTelemetryClient } from '@/components/dashboard/dashboard-telemetry-client';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import { getDashboardOperations } from '@/lib/services/dashboard-telemetry-service';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const usePrismaStore = (process.env.CURERAYS_PERSISTENCE_MODE ?? '').trim().toLowerCase() === 'prisma';
  await hydrateClinicalStoreFromDatabase({ force: usePrismaStore });

  return <DashboardTelemetryClient snapshot={getDashboardOperations()} />;
}
