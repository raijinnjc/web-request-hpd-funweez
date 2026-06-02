import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)","system-ui","sans-serif"],
        mono: ["var(--font-mono)","monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8f9fb",
          tertiary: "#f1f3f7",
        },
        brand:   { DEFAULT:"#6366f1", light:"#eef2ff", dark:"#4338ca" },
        accent:  {
          blue:"#3b82f6", purple:"#8b5cf6", green:"#10b981",
          amber:"#f59e0b", red:"#ef4444", pink:"#ec4899", teal:"#14b8a6",
        },
      },
      boxShadow: {
        bento:    "0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.04)",
        "bento-md":"0 2px 8px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.06)",
        "bento-lg":"0 4px 20px rgba(0,0,0,0.08),0 16px 40px rgba(0,0,0,0.06)",
        "glow-brand":"0 0 0 3px rgba(99,102,241,0.15)",
      },
      animation: { "pulse-soft":"pulseSoft 2s ease-in-out infinite" },
      keyframes: { pulseSoft: { "0%,100%":{opacity:"1"},"50%":{opacity:"0.5"} } },
    },
  },
  plugins: [],
};
export default config;
