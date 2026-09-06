import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8ccff",
          300: "#8fa9ff",
          400: "#6285ff",
          500: "#3b6cf7",
          600: "#2f57d1",
          700: "#2545a6",
          800: "#1f3a85",
          900: "#1a2f68",
        },
        accent: {
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
        },
        ink: {
          950: "#050914",
          900: "#0a0f1e",
          800: "#111a2e",
          700: "#1a2440",
          600: "#243258",
          500: "#3a4a75",
          400: "#8091b3",
          300: "#a7b4d1",
          200: "#c8d0e4",
          100: "#e6ecfa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(59, 108, 247, 0.5)",
        "glow-purple": "0 0 40px -8px rgba(168, 85, 247, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
