import { PageStack } from '@/components/shared/page-stack';

export default function TasksLoading() {
  return (
    <PageStack aria-busy="true" aria-label="Loading task worklist">
      <div className="h-12 w-full max-w-[520px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-hover)]" />
      <div className="h-[46px] w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-hover)]" />
      <div className="min-h-[560px] flex-1 animate-pulse rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]" />
    </PageStack>
  );
}
