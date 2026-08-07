import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Eyebrow → heading → lead. Used by every section on the public site so the
 * vertical rhythm and reading order stay identical across pages.
 *
 * `action` exists because a section-level link passed as a child does the wrong
 * thing. `.site-section-inner` is a two-column grid at desktop; the heading
 * occupies (1,1) and the content (1,2), so a second child auto-places into
 * (2,1) — the left column, far below the copy it belongs to, beside nothing.
 * Passing it here puts it under the lead, which is also where the eye returns
 * after scanning the content.
 */
export function SiteSection({
  id,
  eyebrow,
  heading,
  lead,
  action,
  children,
  className,
  tone = 'default',
  layout = 'split',
  level = 'h2'
}: {
  id?: string;
  eyebrow?: string;
  heading: string;
  lead?: string;
  /** Section-level link. Never pass one as a child — see above. */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: 'default' | 'muted' | 'brand';
  /** `stack` drops the desktop two-column split so wide content gets the row. */
  layout?: 'split' | 'stack';
  /**
   * Heading level. Sections default to `h2`, but the first section on a page is
   * that page's `h1` — every sub-page shipped without one because they all lead
   * with a section, and a document with no `h1` costs both screen-reader
   * navigation and search ranking.
   */
  level?: 'h1' | 'h2';
}) {
  const headingId = id ? `${id}-heading` : undefined;
  const Heading = level;

  return (
    <section
      id={id}
      className={cn('site-section', className)}
      data-tone={tone}
      data-layout={layout}
      aria-labelledby={headingId}
    >
      <div className="site-section-inner">
        <div className="site-section-heading">
          {eyebrow ? <p className="site-eyebrow">{eyebrow}</p> : null}
          <Heading id={headingId} className="site-headline">
            {heading}
          </Heading>
          {lead ? <p className="site-lead">{lead}</p> : null}
          {action ? <div className="site-section-action">{action}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
