import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/workflow';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-[var(--font-size-body)] text-[var(--color-text)] outline-none',
        'focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
        'transition-colors duration-0',
        className
      )}
      style={{ height: 'var(--height-input)' }}
      {...props}
    >
      {children}
    </select>
  );
}
