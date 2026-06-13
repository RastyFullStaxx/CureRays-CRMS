export const dynamic = 'force-dynamic';

import { ScheduleCommandClient } from '@/components/schedule/schedule-command-client';
import { moduleSnapshot } from '@/lib/services/operational-page-service';

export default function SchedulePage() {
  return <ScheduleCommandClient appointments={moduleSnapshot.appointments} />;
}
