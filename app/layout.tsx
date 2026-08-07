import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Absolute base for canonical URLs and social cards. Without it Next emits
 * relative og:url/og:image, which every crawler and social scraper ignores.
 * Overridable so preview deployments do not claim the production host.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.curerays.com";

const description =
  "CureRays Radiation Medicine provides non-invasive x-ray therapy for skin cancer, arthritis, keloids, and other conditions in Grass Valley, California.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CureRays Radiation Medicine",
    template: "%s · CureRays",
  },
  description,
  icons: {
    icon: "/System_Logo.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "CureRays Radiation Medicine",
    locale: "en_US",
    title: "CureRays Radiation Medicine",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "CureRays Radiation Medicine",
    description,
  },
  robots: {
    index: true,
    follow: true,
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
