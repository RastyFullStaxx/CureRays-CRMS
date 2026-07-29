import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import {
  PILOT_SESSION_COOKIE,
  pilotSessionFromCookieValue
} from "@/lib/server/pilot-session";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CureRays CWS",
  description: "Clinical workflow dashboard for CureRays treatment operations.",
  icons: {
    icon: "/System_Logo.svg",
  },
};

const themeScript = `
try {
  var storedTheme = window.localStorage.getItem('curerays_theme_mode');
  var legacyTheme = window.localStorage.getItem('curerays_darkmode');
  if (storedTheme === null && legacyTheme === 'true') {
    window.localStorage.setItem('curerays_theme_mode', 'light');
    window.localStorage.removeItem('curerays_darkmode');
  }
  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch (error) {}
`;

export default async function RootLayout({
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

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell identity={shellIdentity}>{children}</AppShell>
      </body>
    </html>
  );
}
