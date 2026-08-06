import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CureRays Radiation Medicine",
    template: "%s · CureRays",
  },
  description:
    "CureRays Radiation Medicine provides non-invasive x-ray therapy for skin cancer, arthritis, keloids, and other conditions in Grass Valley, California.",
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

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
