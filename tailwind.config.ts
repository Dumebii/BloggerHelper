import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          navy: "#0A1628",      // Primary dark background
          red: "#E8320A",        // Primary accent (CTAs, highlights)
          offwhite: "#FAFAFA",   // Light background / text on dark
          slate: "#1E293B",      // Secondary dark surface
          grey: "#94A3B8",       // Muted text / secondary UI
        },
        // Keep existing background/foreground if needed
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;