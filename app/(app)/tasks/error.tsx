'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { PageStack } from '@/components/shared/page-stack';
import { Button } from '@/components/ui/button';

export default function TasksError({ reset }: { reset: () => void }) {
  return (
    <PageStack>
      <PageHeader title="Tasks" subtitle="Cross-patient clinical and administrative work" />
      <div className="clinical-surface flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
        <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--status-negative-surface)] text-[var(--status-negative-text)]">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="type-heading text-[var(--color-text)]">Task worklist could not be loaded</h2>
        <p className="type-supporting max-w-[65ch] text-[var(--color-text-muted)]">
          Retry the worklist. Your patient records and task state were not changed.
        </p>
        <Button type="button" variant="secondary" onClick={reset}>
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </Button>
      </div>
    </PageStack>
  );
}
