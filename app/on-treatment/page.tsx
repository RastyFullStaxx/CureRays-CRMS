import { PhaseCohortCommandClient } from '@/components/status/phase-cohort-command-client';
import { getPhaseCohort } from '@/lib/services/phase-cohort-service';

export default function OnTreatmentPage() {
  const cohort = getPhaseCohort('on-treatment');

  return (
    <PhaseCohortCommandClient
      mode="on-treatment"
      title={cohort.title}
      subtitle={cohort.subtitle}
      rows={cohort.rows}
      stats={cohort.stats}
    />
  );
}
