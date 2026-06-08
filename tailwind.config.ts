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
          orange: "#FF671F",
          blue: "#0033A0",
          amber: "#FFC701",
          plum: "#725784",
          yellow: "#FFD54F",
          air: "#F5F5F5",
          "dark-plum": "#2E1A47",
          black: "#000000",
          "indigo-dark": "#2B2F5F",
          indigo: "#3D5A80",
          "light-indigo": "#7DA0CA",
          "plum-light": "#A295A4"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(46, 26, 71, 0.12)",
        soft: "0 18px 45px rgba(61, 90, 128, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
