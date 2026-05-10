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
    <div className="rounded-2xl border border-dashed border-[#BFD0EE] bg-white p-6 text-center shadow-[0_8px_24px_rgba(0,51,160,0.05)]">
      <Icon className="mx-auto h-8 w-8 text-[#0033A0]" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-bold text-[#061A55]">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#3D5A80]">{description}</p>
    </div>
  );
}
