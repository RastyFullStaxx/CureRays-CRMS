import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app-shell";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import {
  PILOT_SESSION_COOKIE,
  pilotSessionFromCookieValue
} from "@/lib/server/pilot-session";

export const metadata: Metadata = {
  title: {
    default: "CureRays CWS",
    template: "%s · CureRays CWS",
  },
  description: "Clinical workflow dashboard for CureRays treatment operations.",
};

export default async function AuthenticatedLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  await hydrateClinicalStoreFromDatabase();
  const cookieStore = await cookies();
  const session = pilotSessionFromCookieValue(
    cookieStore.get(PILOT_SESSION_COOKIE)?.value
  );
  const shellIdentity = session
    ? { displayName: session.displayName, role: session.role }
    : null;

  return <AppShell identity={shellIdentity}>{children}</AppShell>;
}
