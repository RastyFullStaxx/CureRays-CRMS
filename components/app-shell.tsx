"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-5">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row">
        <Sidebar pathname={pathname} />
        <div className="min-w-0 flex-1 space-y-4">
          <Topbar />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
