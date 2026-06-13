import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
      <div className="flex max-w-2xl items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase text-[var(--color-accent)]">Not found</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--color-text)]">Page not found</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
            This workspace route is not available. Return to the command center or use the module navigation.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex">
            <Button type="button">Dashboard</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
