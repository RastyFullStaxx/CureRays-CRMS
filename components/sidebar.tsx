"use client";

import Link from "next/link";
import NextImage from "next/image";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Image,
  LineChart,
  LayoutDashboard,
  ListChecks,
  NotebookTabs,
  Radiation,
  Settings,
  ShieldCheck,
  TableProperties,
  UserCog,
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
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Patient Management",
    items: [
      { label: "Patients", href: "/patients", icon: TableProperties },
      { label: "Courses", href: "/courses", icon: NotebookTabs }
    ]
  },
  {
    label: "Clinical Operations",
    items: [
      { label: "Workflow", href: "/workflow", icon: ClipboardList },
      { label: "Tasks", href: "/tasks", icon: ListChecks },
      { label: "Schedule", href: "/schedule", icon: CalendarDays },
      { label: "Treatment Delivery", href: "/treatment-delivery", icon: Radiation }
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
      { label: "Billing", href: "/billing", icon: WalletCards },
      { label: "Audit & QA", href: "/audit", icon: ShieldCheck }
    ]
  },
  {
    label: "Intelligence",
    items: [
      { label: "Analytics & Reports", href: "/analytics", icon: LineChart }
    ]
  },
  {
    label: "Administration",
    items: [
      { label: "Users & Roles", href: "/users-roles", icon: UserCog },
      { label: "Templates", href: "/templates", icon: FileText },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Security Logs", href: "/security-logs", icon: ShieldCheck }
    ]
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/workflow") {
    return pathname === "/workflow";
  }

  if (href === "/settings") {
    return pathname === "/settings";
  }

  if (href === "/users-roles") {
    return pathname === "/users-roles" || pathname === "/settings/users";
  }

  if (href === "/templates") {
    return pathname === "/templates" || pathname === "/settings/templates" || pathname === "/workflow/templates";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 z-30 max-h-screen overflow-hidden bg-[#0033A0] p-4 text-white shadow-[18px_0_50px_rgba(0,51,160,0.18)] xl:min-h-screen">
      <div className="flex h-full flex-col gap-6">
        <div className="rounded-lg bg-white px-4 py-5">
          <Link href="/dashboard" className="block">
            <NextImage
              src="/System_Logo.svg"
              alt="CureRays"
              width={220}
              height={52}
              priority
              className="h-auto w-full max-w-[210px]"
            />
          </Link>
        </div>

        <nav className="scrollbar-soft min-w-0 flex-1 space-y-6 overflow-y-auto pr-1" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wide text-white/58">
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
                        "nav-item flex min-w-0 items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-bold",
                        active
                          ? "nav-item-active bg-[#084BC5] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]"
                          : "text-white/86 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "nav-icon h-5 w-5 shrink-0",
                          active ? "text-white" : "text-white/86"
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

        <div className="rounded-lg border border-white/18 bg-white/8 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10">
              <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <p className="text-sm font-bold leading-5 text-white">
              Precision care.
              <span className="block">Powered by clarity.</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
