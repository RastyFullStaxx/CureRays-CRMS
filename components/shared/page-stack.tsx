import type { ReactNode } from 'react';

type PageStackProps = {
  children: ReactNode;
  className?: string;
  gap?: string;
};

export function PageStack({ children, className = '', gap = 'var(--space-section)' }: PageStackProps) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${className}`}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
