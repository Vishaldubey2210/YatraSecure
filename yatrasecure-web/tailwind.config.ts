import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#534AB7",
          dark:    "#3C3489",
          light:   "#EEEDFE",
          mid:     "#7F77DD",
        },
        surface: {
          white: "#FFFFFF",
          page:  "#F0EFF8",
          alt:   "#F8F7FD",
          gray:  "#F8F7FD",
        },
        brand: {
          text:   "#1A1A2E",
          muted:  "#6B6B8A",
          hint:   "#9898B0",
          border: "#E4E2F4",
        },
        success: { DEFAULT: "#1D9E75", light: "#E1F5EE" },
        warning: { DEFAULT: "#EF9F27", light: "#FAEEDA" },
        danger:  { DEFAULT: "#E24B4A", light: "#FCEBEB" },
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:    "0 8px 24px rgba(83,74,183,0.12)",
        "card-hover": "0 12px 40px rgba(83,74,183,0.18)",
        focus:   "0 0 0 3px rgba(83,74,183,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
