import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] ring-[var(--color-border-soft)]',
  success: 'bg-[color-mix(in_srgb,var(--color-success)_12%,white)] text-[var(--color-success)] ring-[color-mix(in_srgb,var(--color-success)_22%,transparent)]',
  warning: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] ring-[color-mix(in_srgb,var(--color-accent)_24%,transparent)]',
  error: 'bg-[color-mix(in_srgb,var(--color-error)_10%,white)] text-[var(--color-error)] ring-[color-mix(in_srgb,var(--color-error)_22%,transparent)]',
  info: 'bg-[color-mix(in_srgb,var(--color-info)_10%,white)] text-[var(--color-info)] ring-[color-mix(in_srgb,var(--color-info)_22%,transparent)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ring-1',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
