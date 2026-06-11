import type { ReactNode } from 'react';

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="clinical-surface p-5">
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-[var(--color-text)]">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
