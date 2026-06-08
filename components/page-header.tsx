import type { LucideIcon } from 'lucide-react';

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  stat,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  stat?: string;
}) {
  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold text-curerays-orange">{eyebrow}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-3">
            {Icon ? <Icon className="h-6 w-6 text-curerays-blue" aria-hidden="true" /> : null}
            <h2 className="text-2xl font-semibold text-curerays-dark-plum">{title}</h2>
          </div>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">{description}</p>
          ) : null}
        </div>
        {stat ? (
          <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
            {stat}
          </span>
        ) : null}
      </div>
    </section>
  );
}
