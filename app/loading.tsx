import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <div className="clinical-surface flex w-full max-w-md flex-col items-center gap-3 p-6 text-center">
        <LoadingSpinner size="lg" />
        <div>
          <p className="font-heading text-base font-bold text-[var(--color-text)]">
            Loading prototype workspace
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
            Preparing operational demo data.
          </p>
        </div>
      </div>
    </div>
  );
}
