import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
};

export function EmptyState({ title = 'No records found.', description, icon: Icon, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)]"
          style={{ background: 'var(--color-hover)' }}
        >
          <Icon size={20} />
        </div>
      )}
      <p className="font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 15 }}>
        {title}
      </p>
      {description && (
        <p className="mt-1 text-[var(--font-size-small)] text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
