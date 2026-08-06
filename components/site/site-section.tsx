import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Eyebrow → heading → lead. Used by every section on the public site so the
 * vertical rhythm and reading order stay identical across pages.
 */
export function SiteSection({
  id,
  eyebrow,
  heading,
  lead,
  children,
  className,
  tone = 'default'
}: {
  id?: string;
  eyebrow?: string;
  heading: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  tone?: 'default' | 'muted' | 'ink';
}) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      className={cn('site-section', className)}
      data-tone={tone}
      aria-labelledby={headingId}
    >
      <div className="site-section-inner">
        <div className="site-section-heading">
          {eyebrow ? <p className="site-eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId} className="site-headline">
            {heading}
          </h2>
          {lead ? <p className="site-lead">{lead}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
