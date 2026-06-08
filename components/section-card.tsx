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
    <section className="glass-panel rounded-glass p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-curerays-indigo">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
