import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        price: "#16a34a",
        insight: "#d97706",
        ink: "#111827"
      },
      boxShadow: {
        cockpit: "0 24px 80px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
