import { PhaseCohortCommandClient } from '@/components/status/phase-cohort-command-client';
import { getPhaseCohort } from '@/lib/services/phase-cohort-service';

export default function UpcomingPage() {
  const cohort = getPhaseCohort('upcoming');

  return (
    <PhaseCohortCommandClient
      mode="upcoming"
      title={cohort.title}
      subtitle={cohort.subtitle}
      rows={cohort.rows}
      stats={cohort.stats}
    />
  );
}
