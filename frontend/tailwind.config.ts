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
        "void":       "#020408",
        "dark":       "#070d14",
        "card":       "#0d1520",
        "elevated":   "#111e2e",
        "neon-blue":  "#00d4ff",
        "neon-cyan":  "#00ffcc",
        "neon-green": "#00ff88",
        "neon-red":   "#ff2052",
        "neon-orange":"#ff6b35",
        "neon-purple":"#b44fff",
        "slate-primary":   "#e8f4fd",
        "slate-secondary": "#6b8fa8",
        "slate-muted":     "#3a5568",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'Inter'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-in":   "slideIn 0.4s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "scan":       "scan 2s ease-in-out infinite",
        "matrix":     "matrixFall 10s linear infinite",
      },
      keyframes: {
        slideIn: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,212,255,0.3)" },
          "50%":       { boxShadow: "0 0 30px rgba(0,212,255,0.7)" },
        },
        scan: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        matrixFall: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
