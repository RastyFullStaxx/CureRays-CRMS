import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * The colour names below exist so vendored shadcn/ui components resolve to the
 * project's CSS custom properties instead of the Tailwind palette, which
 * `scripts/color-system-guardrails.mjs` bans outright.
 *
 * Deliberately absent: `accent`. The accent token was retired with the
 * three-colour brand system, and a `bg-accent` class would resurrect it.
 *
 * Note: opacity modifiers (`bg-primary/90`) do not work against opaque `var()`
 * values. Use a token or `color-mix()` instead.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text)"
        },
        popover: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-text)"
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--color-card-muted)",
          foreground: "var(--color-text)"
        },
        muted: {
          DEFAULT: "var(--color-card-muted)",
          foreground: "var(--color-text-muted)"
        },
        destructive: {
          DEFAULT: "var(--status-negative-solid)",
          foreground: "var(--color-text-inverse)"
        },
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)"
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-md)"
      }
    }
  },
  plugins: [animate]
};

export default config;
