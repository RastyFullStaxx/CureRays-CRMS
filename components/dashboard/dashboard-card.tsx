import type { ReactNode } from "react";

export function DashboardCard({
  title,
  action,
  children,
  className = ""
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-h-0 overflow-hidden rounded-xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.08)] ${className}`}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-4 py-3">
          <h2 className="truncate text-[15px] font-bold text-[#061A55]">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
