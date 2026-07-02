import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/workflow';
import { Card } from '@/components/ui/card';

export function AppPageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col', className)} style={{ gap: 'var(--space-section)' }}>{children}</div>;
}

export function SummaryCardGrid({ children, columns = 4 }: { children: ReactNode; columns?: 3 | 4 | 5 }) {
  const grid = columns === 5 ? 'xl:grid-cols-5' : columns === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4';
  return <section className={cn('grid gap-3 sm:grid-cols-2', grid)}>{children}</section>;
}

export function SummaryMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: 'blue' | 'orange' | 'amber' | 'indigo';
}) {
  const tones = {
    blue: 'bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]',
    orange: 'bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]',
    amber: 'bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]',
    indigo: 'bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]',
  };

  return (
    <Card compact>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-label truncate text-[var(--color-text-muted)]">
            {label}
          </p>
          <p className="type-title mt-2 text-[var(--color-text)]">
            {value}
          </p>
          <p className="type-supporting mt-2 truncate text-[var(--color-text-muted)]">
            {detail}
          </p>
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]', tones[tone])}>
          <Icon size={18} />
        </span>
      </div>
    </Card>
  );
}

export function ActionToolbar({
  searchPlaceholder,
  filters,
  actions,
}: {
  searchPlaceholder: string;
  filters: string[];
  actions?: ReactNode;
}) {
  return (
    <section
      className="flex flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-card)] xl:flex-row xl:items-center"
      style={{ padding: 'var(--space-2)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3">
        <Search size={16} className="shrink-0 text-[var(--color-primary)]" />
        <input
          className="type-body min-w-0 flex-1 bg-transparent text-[var(--color-text)] outline-none"
          style={{ height: 'var(--height-input)' }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="type-button min-w-fit rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-[var(--color-text)]"
            style={{ height: 'var(--height-btn-sm)' }}
          >
            {filter}
          </button>
        ))}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </section>
  );
}

export function ViewTabs({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="scrollbar-soft flex gap-2 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-card)]" style={{ padding: 'var(--space-1)', border: 'var(--border-container)' }}>
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={cn(
            'type-button min-w-fit rounded-[var(--radius-md)] px-3 transition-colors duration-0',
            index === active
              ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]'
          )}
          style={{ height: 'var(--height-btn-sm)' }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function PrimaryAction({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="type-button inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-[var(--color-primary-foreground)] transition-colors hover:bg-[var(--color-primary-dark)]"
      style={{ height: 'var(--height-btn)' }}
    >
      {children}
    </button>
  );
}

export function SecondaryAction({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="type-button inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover)]"
      style={{ height: 'var(--height-btn)' }}
    >
      {children}
    </button>
  );
}

export function FieldList({ items }: { items: Array<{ label: string; value: ReactNode; tone?: 'default' | 'warning' }> }) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-3 pb-3 last:border-0 last:pb-0"
          style={{ borderBottom: '1px solid var(--color-border-soft)' }}
        >
          <dt className="type-label uppercase text-[var(--color-text-muted)]">
            {item.label}
          </dt>
          <dd
            className={cn(
              'type-body text-right text-[var(--color-text)]',
              item.tone === 'warning' && 'text-[var(--color-accent)]',
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
