import defaultTheme from "tailwindcss/defaultTheme"

// Colours are oklch "L C H" triplets defined in global.css, the same tokens
// as blog.crstian.me, so both sites share one palette.
const token = (name) => `oklch(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", ...defaultTheme.fontFamily.sans],
        serif: ["Lexend", ...defaultTheme.fontFamily.sans],
        mono: ["Geist Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        border: token("border"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        tag: { bg: token("tag-bg"), "bg-hover": token("tag-bg-hover"), border: token("tag-border"), text: token("tag-text") },
        brand: { DEFAULT: token("brand"), 2: token("brand-2"), 3: token("brand-3") },
      },
      maxWidth: {
        layout: "var(--layout-width)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "full",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
