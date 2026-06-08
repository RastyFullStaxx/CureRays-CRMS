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
    blue: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
    orange: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]',
    amber: 'bg-amber-50 text-amber-700',
    indigo: 'bg-slate-50 text-slate-600',
  };

  return (
    <Card compact>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {label}
          </p>
          <p className="mt-2 font-heading font-bold" style={{ fontSize: 21, lineHeight: 1.1, color: 'var(--color-text)' }}>
            {value}
          </p>
          <p className="mt-2 truncate" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
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
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ height: 'var(--height-input)', fontSize: 'var(--font-size-body)', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="min-w-fit rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs font-semibold"
            style={{ height: 'var(--height-btn-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
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
            'min-w-fit rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors duration-0',
            index === active
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]'
          )}
          style={{ height: 'var(--height-btn-sm)', fontFamily: 'var(--font-body)' }}
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
      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
      style={{ height: 'var(--height-btn)', fontFamily: 'var(--font-body)' }}
    >
      {children}
    </button>
  );
}

export function SecondaryAction({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-4 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-hover)]"
      style={{ height: 'var(--height-btn)', fontFamily: 'var(--font-body)' }}
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
          <dt style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0, color: 'var(--color-text-muted)' }}>
            {item.label}
          </dt>
          <dd
            className={cn('text-right font-semibold', item.tone === 'warning' && 'text-[var(--color-accent)]')}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', color: item.tone === 'warning' ? 'var(--color-accent)' : 'var(--color-text)' }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
