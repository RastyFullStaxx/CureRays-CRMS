"use client";

import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Gauge,
  LineChart,
  LayoutDashboard,
  ListChecks,
  Radiation,
  Settings,
  ShieldCheck,
  TableProperties
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/workflow";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: TableProperties },
  { label: "Carepath", href: "/workflow", icon: ClipboardList },
  { label: "IGSRT Tools", href: "/workflow/igsrt", icon: Radiation },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Audit", href: "/audit", icon: ShieldCheck },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "Settings", href: "/settings/users", icon: Settings }
];

function isActive(pathname: string, href: string) {
  if (href === "/" && pathname === "/dashboard") {
    return true;
  }

  if (href === "/workflow") {
    return pathname === "/workflow" || pathname.startsWith("/workflow/templates");
  }

  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <header className="glass-panel sticky top-3 z-30 rounded-glass p-3 sm:p-4 lg:top-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

          <div className="hidden min-w-0 rounded-lg border border-white/70 bg-white/46 px-3 py-2 lg:block">
            <p className="truncate text-xs font-semibold uppercase text-curerays-plum">Secure workspace</p>
            <p className="truncate text-xs text-curerays-indigo">
              Centralized patient, document, task, and audit state
            </p>
          </div>
        </div>

        <nav
          className="scrollbar-soft flex min-w-0 gap-2 overflow-x-auto rounded-lg bg-white/36 p-1.5"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm",
                  active
                    ? "nav-item-active bg-curerays-dark-plum text-white shadow-soft"
                    : "text-curerays-dark-plum/70 hover:bg-white/72 hover:text-curerays-dark-plum"
                )}
              >
                <Icon
                  className={cn("nav-icon h-4 w-4 shrink-0", active ? "text-curerays-yellow" : "text-curerays-plum")}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden min-w-fit rounded-lg border border-curerays-blue/10 bg-curerays-blue/5 px-3 py-2 text-right 2xl:block">
          <p className="text-xs font-semibold text-curerays-dark-plum">Phase-driven model</p>
          <p className="text-xs text-curerays-indigo">Views derive from workflow state</p>
        </div>
      </div>
    </header>
  );
}
