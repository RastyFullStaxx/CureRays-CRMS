import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-curerays-plum/24 bg-white/46 p-6 text-center">
      <Icon className="mx-auto h-8 w-8 text-curerays-plum" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-curerays-dark-plum">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-curerays-indigo">{description}</p>
    </div>
  );
}
