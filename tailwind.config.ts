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
          indigo: "#3D5A80",
          "light-indigo": "#7DA0CA"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(46, 26, 71, 0.12)",
        soft: "0 18px 45px rgba(61, 90, 128, 0.12)"
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        18: "0.18",
        22: "0.22",
        24: "0.24",
        26: "0.26",
        28: "0.28",
        42: "0.42",
        46: "0.46",
        52: "0.52",
        54: "0.54",
        58: "0.58",
        62: "0.62",
        64: "0.64",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        76: "0.76",
        78: "0.78",
        82: "0.82"
      },
      borderRadius: {
        glass: "8px"
      }
    }
  },
  plugins: []
};

export default config;
