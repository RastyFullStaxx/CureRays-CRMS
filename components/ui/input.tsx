import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/workflow';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'clinical-focus w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-[var(--font-size-body)] font-semibold text-[var(--color-text)] outline-none',
        'placeholder:text-[var(--color-text-muted)]',
        'focus:border-[var(--color-primary)]',
        'transition',
        className
      )}
      style={{ height: 'var(--height-input)' }}
      {...props}
    />
  );
}
