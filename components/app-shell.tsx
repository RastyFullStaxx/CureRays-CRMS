"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1900px] flex-col gap-4">
        <Sidebar pathname={pathname} />
        <Topbar />
        <main key={pathname} className="page-transition min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
