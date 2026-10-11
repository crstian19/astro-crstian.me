import { defineConfig, fontProviders } from "astro/config"
import sitemap from "@astrojs/sitemap"
import tailwindcss from "@tailwindcss/vite"
import solidJs from "@astrojs/solid-js"
import svelte from "@astrojs/svelte"

// https://astro.build/config
export default defineConfig({
  site: "https://crstian.me",
  // Astro 7 changed the default; keep 6.x's HTML-aware whitespace handling so inline spacing doesn't shift.
  compressHTML: true,
  integrations: [sitemap(), solidJs(), svelte()],
  // Self-hosted variable fonts through the Fonts API, as on the blog: Astro
  // emits the @font-face rules with size-adjusted fallbacks (less layout shift)
  // and preloads only what <Font preload /> asks for.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Geist",
      cssVariable: "--font-geist",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      options: { variants: [{ src: ["./src/assets/fonts/GeistVF.woff2"], weight: "100 900", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Lexend",
      cssVariable: "--font-lexend",
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      options: { variants: [{ src: ["./src/assets/fonts/Lexend-VariableFont_wght.woff2"], weight: "100 900", style: "normal" }] },
    },
    {
      provider: fontProviders.local(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      fallbacks: ["ui-monospace", "monospace"],
      options: { variants: [{ src: ["./src/assets/fonts/GeistMono.woff2"], weight: "100 900", style: "normal" }] },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})