import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stat?: string;
};

export function PageHeader({ eyebrow, title, description, icon: Icon, stat }: PageHeaderProps) {
  return (
    <section className="glass-panel rounded-glass p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase text-curerays-orange">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-curerays-dark-plum">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-curerays-indigo sm:text-base">{description}</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/80 bg-white/60 p-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-curerays-blue text-white">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {stat ? (
            <span>
              <span className="block text-xs font-semibold text-curerays-indigo">Live view</span>
              <span className="block text-2xl font-semibold text-curerays-dark-plum">{stat}</span>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
