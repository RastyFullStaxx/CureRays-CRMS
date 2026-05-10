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
    <section className={`rounded-lg border border-[#DDE6F5] bg-white shadow-[0_16px_40px_rgba(43,47,95,0.08)] ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-5 py-4">
          <h2 className="text-base font-bold text-[#061A55]">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
