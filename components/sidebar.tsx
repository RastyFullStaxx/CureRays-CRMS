"use client";

import Link from "next/link";
import {
  Activity,
  ClipboardList,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Radiation,
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
  { label: "Master Records", href: "/records", icon: TableProperties },
  { label: "Upcoming", href: "/upcoming", icon: ClipboardList },
  { label: "On Treatment", href: "/on-treatment", icon: Radiation },
  { label: "Post", href: "/post", icon: Activity },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Audit Logs", href: "/audit-logs", icon: History }
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <>
      <aside className="glass-panel hidden h-[calc(100vh-2.5rem)] w-72 shrink-0 flex-col rounded-glass p-4 lg:sticky lg:top-5 lg:flex">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-curerays-blue text-white shadow-soft">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-curerays-dark-plum">
              CureRays
            </span>
            <span className="block text-xs font-medium text-curerays-indigo">Clinical Workflow</span>
          </span>
        </Link>

        <div className="mt-6 rounded-lg border border-white/70 bg-white/46 p-3">
          <p className="text-xs font-semibold uppercase text-curerays-plum">
            Secure workspace
          </p>
          <p className="mt-2 text-sm leading-5 text-curerays-dark-plum/76">
            Role-aware preview for operations and clinical coordination.
          </p>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-curerays-dark-plum text-white shadow-soft"
                    : "text-curerays-dark-plum/68 hover:bg-white/72 hover:text-curerays-dark-plum"
                )}
              >
                <Icon
                  className={cn("h-4 w-4", active ? "text-curerays-yellow" : "text-curerays-plum")}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-lg border border-curerays-blue/10 bg-curerays-blue/5 p-4">
          <p className="text-sm font-semibold text-curerays-dark-plum">Phase-driven model</p>
          <p className="mt-2 text-xs leading-5 text-curerays-indigo">
            Views are filtered from patient state. No duplicate rows, no manual sheet movement.
          </p>
        </div>
      </aside>

      <nav
        className="glass-panel scrollbar-soft flex gap-2 overflow-x-auto rounded-glass p-2 lg:hidden"
        aria-label="Mobile primary navigation"
      >
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
                active
                  ? "bg-curerays-dark-plum text-white"
                  : "bg-white/55 text-curerays-dark-plum/70"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
