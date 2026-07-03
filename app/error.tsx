'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="clinical-surface w-full max-w-lg p-6 text-center">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--status-negative-surface)] text-[var(--status-negative-text)]"
        >
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 type-heading text-[var(--color-text)]">
          This View Could Not Load
        </h2>
        <p className="mt-2 type-body text-[var(--color-text-muted)]">
          Error details are kept out of the browser view. Try loading the route again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="clinical-focus mt-5 inline-flex h-[var(--height-btn)] items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)] px-4 type-body text-[var(--color-primary-foreground)] transition hover:bg-[var(--color-primary-dark)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      </div>
    </div>
  );
}
