import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/workflow';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'clinical-focus type-body w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-text)] outline-none',
        'placeholder:text-[var(--color-text-muted)]',
        'focus:border-[var(--color-primary)]',
        'transition',
        className
      )}
      {...props}
    />
  );
}
