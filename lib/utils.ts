import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names, resolving Tailwind conflicts by prefix group.
 *
 * The previous implementation joined classes verbatim, so `cn('bg-[var(--color-card)]',
 * className)` emitted both and the winner depended on CSS source order. `twMerge`
 * resolves that, including arbitrary values. Project classes (`type-*`, `clinical-*`,
 * `site-*`) are unknown to twMerge and pass through untouched.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
