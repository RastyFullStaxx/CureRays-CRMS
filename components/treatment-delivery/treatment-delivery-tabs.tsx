"use client";

import Link from "next/link";

type TreatmentDeliveryTab = "queue" | "fraction-logs";

const tabs: Array<{ id: TreatmentDeliveryTab; label: string; href: string }> = [
  { id: "queue", label: "Today's Queue", href: "/treatment-delivery" },
  { id: "fraction-logs", label: "Fraction Logs", href: "/treatment-delivery/fraction-logs" }
];

export function TreatmentDeliveryTabs({ active }: { active: TreatmentDeliveryTab }) {
  return (
    <div
      className="scrollbar-soft max-w-full overflow-x-auto"
    >
      <div
        className="flex w-max min-w-fit items-center"
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          background: "var(--color-card)",
          padding: 3,
          gap: 2
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className="clinical-focus inline-flex h-8 min-w-fit items-center rounded-[var(--radius-md)] px-3 text-xs font-bold transition"
            style={{
              background: active === tab.id ? "var(--color-bg-elevated)" : "transparent",
              color: active === tab.id ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: active === tab.id ? "0 1px 2px rgba(15, 23, 42, 0.08)" : "none",
              textDecoration: "none"
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
