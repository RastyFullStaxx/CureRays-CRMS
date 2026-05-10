"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen xl:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar pathname={pathname} />
        <div className="min-w-0">
          <Topbar pathname={pathname} />
          <main key={pathname} className="page-transition min-w-0 bg-white p-4 sm:p-5 xl:p-5">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
