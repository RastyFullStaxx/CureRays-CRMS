import { PhaseCohortCommandClient } from '@/components/status/phase-cohort-command-client';
import { getPhaseCohort } from '@/lib/services/phase-cohort-service';

export default function PostPage() {
  const cohort = getPhaseCohort('post');

  return (
    <PhaseCohortCommandClient
      mode="post"
      title={cohort.title}
      subtitle={cohort.subtitle}
      rows={cohort.rows}
      stats={cohort.stats}
    />
  );
}
