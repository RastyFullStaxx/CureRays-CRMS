import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";

export const metadata: Metadata = {
  title: "CureRays CWS",
  description: "Clinical workflow dashboard for CureRays treatment operations."
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
