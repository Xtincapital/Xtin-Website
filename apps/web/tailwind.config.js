import defaultTheme from "tailwindcss/defaultTheme";
import { tailwindHues } from "./src/styles/palette.js";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // shadcn utilities (bg-background, border-border, text-primary, ...)
      // read the CSS custom properties defined once for the whole site in
      // src/index.css (:root / html.dark), so every app shares one palette.

      // One site-wide type system: Plus Jakarta Sans for letters, Inter Tight
      // for numbers. "Inter Tight" is loaded as a digits-only subset (see
      // index.html), so listing it first only affects 0-9 and ₹ $ % + − . ,
      // `font-display` (page titles) uses the same pair at a heavier weight.
      fontFamily: {
        sans: ['"Inter Tight"', '"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        display: ['"Inter Tight"', '"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
      },
      // One type scale for the whole site: 12 · 14 · 16 · 18 · 24 · 32 · 40 · 48.
      // Tailwind's in-between steps snap onto it (xl = lg, 6xl/7xl = 5xl), so
      // every page draws from the same eight sizes.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.125rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.015em" }],
        "3xl": ["2rem", { lineHeight: "2.5rem", letterSpacing: "-0.02em" }],
        "4xl": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "6xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "7xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
      },
      // Three weights only: regular 400, medium 500, semibold 600.
      fontWeight: {
        thin: "400", extralight: "400", light: "400", normal: "400",
        medium: "500", semibold: "600", bold: "600", extrabold: "600", black: "600",
      },
      colors: {
        // Every Tailwind hue now resolves to one of 8 palette families
        // (src/styles/palette.js).
        ...tailwindHues,
        // The one site green, by role (values per theme live in index.css).
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          fill: "rgb(var(--brand-fill) / <alpha-value>)",
          hover: "rgb(var(--brand-fill-hover) / <alpha-value>)",
          soft: "var(--brand-soft)",
          line: "var(--brand-line)",
        },
        // Receipt printer (features/billing): a 12-step neutral scale that
        // inverts in dark mode (1 = background end, 12 = ink end). Channels
        // live in index.css as --gs-1 … --gs-12.
        grayscale: Object.fromEntries(
          Array.from({ length: 12 }, (_, i) => [i + 1, `rgb(var(--gs-${i + 1}) / <alpha-value>)`]),
        ),
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          positive: "hsl(var(--chart-positive))",
          negative: "hsl(var(--chart-negative))",
          neutral: "hsl(var(--chart-neutral))",
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      // The fallbacks are Tailwind's defaults: these vars are only defined
      // inside the scoped features, so without them rounded-*/shadow-* resolve
      // to nothing (square corners, no shadow) everywhere else on the site.
      borderRadius: {
        lg: "var(--radius, 0.5rem)",
        md: "calc(var(--radius, 0.5rem) - 2px)",
        sm: "calc(var(--radius, 0.375rem) - 4px)",
      },
      boxShadow: {
        'sm': 'var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
        'md': 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))',
        'lg': 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))',
        'glow': 'var(--shadow-glow)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          from: { opacity: "0", transform: "translateX(10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "counter": {
          from: { "--num": "0" },
          to: { "--num": "var(--target)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-left": "fade-in-left 0.5s ease-out forwards",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
