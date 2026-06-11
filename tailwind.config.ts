import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        curerays: {
          orange: "var(--color-accent)",
          blue: "var(--color-primary)",
          amber: "var(--color-warning)",
          plum: "var(--color-text-soft)",
          yellow: "var(--color-warning)",
          air: "var(--color-bg-elevated)",
          "dark-plum": "var(--color-text)",
          black: "var(--color-text)",
          "indigo-dark": "var(--color-text)",
          indigo: "var(--color-text-soft)",
          "light-indigo": "var(--color-text-muted)",
          "plum-light": "var(--color-text-muted)"
        }
      },
      boxShadow: {
        glass: "var(--shadow-card)",
        soft: "var(--shadow-card)"
      }
    }
  },
  plugins: []
};

export default config;
