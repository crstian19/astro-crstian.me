import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import svelte from "@astrojs/svelte"

// https://astro.build/config
export default defineConfig({
  site: "https://crstian.me",
  // Astro 7 changed the default; keep 6.x's HTML-aware whitespace handling so inline spacing doesn't shift.
  compressHTML: true,
  integrations: [sitemap(), solidJs(), svelte(), tailwind({ applyBaseStyles: false })],
})