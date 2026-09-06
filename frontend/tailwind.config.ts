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
          100: "#d9e5ff",
          500: "#3b6cf7",
          600: "#2f57d1",
          700: "#2545a6",
        },
        ink: {
          900: "#0b1220",
          800: "#111a2e",
          700: "#1a2440",
          400: "#8091b3",
          300: "#a7b4d1",
          200: "#c8d0e4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
