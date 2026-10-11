import { defineConfig } from "astro/config"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"
import svelte from "@astrojs/svelte"

// https://astro.build/config
export default defineConfig({
  site: "https://crstian.me",
  integrations: [sitemap(), solidJs(), svelte(), tailwind({ applyBaseStyles: false })],
})