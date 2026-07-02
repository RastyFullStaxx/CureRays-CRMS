'use client';

import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
};

export function PageHeader({ title, subtitle, actions, breadcrumb = [], className = '' }: PageHeaderProps) {
  return (
    <div
      className={`flex shrink-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start ${className}`}
      style={{ marginBottom: '2px' }}
    >
      <div className="min-w-0">
        {breadcrumb.length > 0 && (
          <div className="type-supporting mb-1.5 flex flex-wrap items-center gap-1 text-[var(--color-text-muted)]">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center" style={{ gap: '4px' }}>
                {i > 0 && <ChevronRight size={13} style={{ color: 'var(--color-border)', flexShrink: 0 }} />}
                <a
                  href={crumb.href}
                  className="type-medium text-[var(--color-primary)] no-underline"
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  {crumb.label}
                </a>
              </span>
            ))}
            <ChevronRight size={13} style={{ color: 'var(--color-border)', flexShrink: 0 }} />
          </div>
        )}

        <h1 className="type-title truncate text-[var(--color-text)]">
          {title}
        </h1>

        {subtitle && (
          <p className="type-supporting mt-1 max-w-[920px] text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center justify-start sm:justify-end sm:shrink-0" style={{ gap: 'var(--space-1)' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
