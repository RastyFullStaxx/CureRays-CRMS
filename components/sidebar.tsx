"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  ContactRound,
  FileText,
  Files,
  Gauge,
  Image,
  LineChart,
  LayoutDashboard,
  ListChecks,
  NotebookTabs,
  Radiation,
  Settings,
  ShieldCheck,
  Stethoscope,
  TableProperties,
  Users,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/workflow";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }]
  },
  {
    label: "Patient Management",
    items: [
      { label: "Patients", href: "/patients", icon: TableProperties },
      { label: "Courses", href: "/courses", icon: ContactRound }
    ]
  },
  {
    label: "Clinical Operations",
    items: [
      { label: "Workflow", href: "/workflow", icon: ClipboardList },
      { label: "Tasks", href: "/tasks", icon: ListChecks },
      { label: "Schedule", href: "/schedule", icon: CalendarDays },
      { label: "Treatment Delivery", href: "/treatment-delivery", icon: Stethoscope }
    ]
  },
  {
    label: "Clinical Tools",
    items: [
      { label: "Clinical Forms", href: "/clinical-forms", icon: NotebookTabs },
      { label: "Treatment Planning", href: "/treatment-planning", icon: Radiation },
      { label: "Imaging", href: "/imaging", icon: Image }
    ]
  },
  {
    label: "Documentation",
    items: [
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Billing / Coding", href: "/billing", icon: WalletCards },
      { label: "Audit & QA", href: "/audit", icon: ShieldCheck }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: LineChart },
      { label: "Reports", href: "/reports", icon: BarChart3 }
    ]
  },
  {
    label: "Administration",
    items: [
      { label: "Users & Roles", href: "/settings/users", icon: Users },
      { label: "Templates", href: "/settings/templates", icon: Files },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Security Logs", href: "/security-logs", icon: ShieldCheck }
    ]
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/" && pathname === "/dashboard") {
    return true;
  }

  if (href === "/workflow") {
    return pathname === "/workflow";
  }

  if (href === "/settings") {
    return pathname === "/settings";
  }

  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="glass-panel sticky top-3 z-30 max-h-[calc(100vh-24px)] overflow-hidden rounded-glass p-3 sm:p-4 lg:top-5">
      <div className="flex h-full flex-col gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex min-w-fit items-center gap-3 rounded-lg px-1 py-1">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-curerays-blue text-white shadow-soft">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-curerays-dark-plum">CureRays</span>
              <span className="block text-xs font-medium text-curerays-indigo">Workflow Command</span>
            </span>
          </Link>
        </div>

        <div className="rounded-lg border border-white/70 bg-white/46 px-3 py-2">
          <p className="truncate text-xs font-semibold uppercase text-curerays-plum">Patient-course workflow</p>
          <p className="truncate text-xs text-curerays-indigo">
            Dashboard is summary. Modules are the working surfaces.
          </p>
        </div>

        <nav className="scrollbar-soft min-w-0 flex-1 space-y-4 overflow-y-auto pr-1" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2 text-[11px] font-bold uppercase tracking-wide text-curerays-indigo/72">
                {group.label}
              </p>
              <div className="mt-2 grid gap-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "nav-item flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
                        active
                          ? "nav-item-active bg-curerays-dark-plum text-white shadow-soft"
                          : "text-curerays-dark-plum/72 hover:bg-white/72 hover:text-curerays-dark-plum"
                      )}
                    >
                      <Icon
                        className={cn(
                          "nav-icon h-4 w-4 shrink-0",
                          active ? "text-curerays-yellow" : "text-curerays-plum"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
