# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Style

When asked to implement something, write code first — don't spend entire sessions planning. Only create plan documents when explicitly asked. Bias toward small, iterative implementations over exhaustive exploration.

## Build & Development Commands

- `bun dev` — Start dev server (localhost:4321)
- `bun dev:network` — Dev server accessible on local network
- `bun run build` — Type-check (`astro check`) then build for production
- `bun preview` — Preview production build locally
- `bun lint` — Lint with oxlint
- `bun lint:fix` — Auto-fix with eslint

Package manager is **Bun**. Always use `bun` instead of `npm`/`yarn`/`pnpm`.

## Languages & Testing

TypeScript, Astro, Svelte and Markdown. There is no test runner in this repo — verify changes with `bun run build` (which runs `astro check` first) and by previewing the page you touched with `bun preview`.

## CSS & Visual Work

When fixing CSS visual effects (3D transforms, masks, filters, holographic effects), make ONE small change at a time and describe what it does before proceeding. Never apply mask, canvas, or filter approaches that could cause black screens without confirming the approach first. If a visual fix doesn't work after 2 attempts, stop and ask the user how to proceed rather than continuing to iterate.

## Architecture

Astro 6 static site with SolidJS and Svelte 5 island components. Tailwind CSS for styling with class-based dark mode.

### Key Directories

- `src/pages/` — File-based routing (index, work, projects, search, legal/[slug], projects/[slug], 404)
- `src/content/` — Content collections: `work/` (flat .md), `projects/` (nested `{slug}/index.md`), `legal/`
- `src/components/` — Mix of `.astro`, `.tsx` (SolidJS), and `.svelte` components
- `src/layouts/` — `PageLayout.astro` (base), `ArticleTopLayout`/`ArticleBottomLayout` (content pages)
- `src/styles/` — `global.css` (main styles), `404.css`
- `src/lib/` — `utils.ts` with `cn()`, `formatDate()`, `readingTime()`
- `src/consts.ts` — Site metadata, nav links, social links
- `public/js/` — Client-side scripts: `animate.js`, `bg.js`, `theme.js`, `scroll.js`

### Path Aliases (tsconfig.json)

`@components/*`, `@layouts/*`, `@lib/*`, `@consts`, `@types` all map to `src/`.

### Astro Content Layer

Astro 6 content collections use the Content Layer API: each collection has a `loader` (`glob()`), and entries expose `id` (no file extension, slugified, trailing `/index` removed) — `optare.md` is `optare`, `aceplay/index.md` is `aceplay`. That `id` is directly usable as the URL segment. `entry.Slug`/`entry.slug` and `entry.render()` no longer exist — use `render(entry)` from `astro:content`.

### Content Collections

Defined in `src/content.config.ts`. Work entries have `company`, `role`, `dateStart`, `dateEnd`. Projects have `title`, `summary`, `date`, `tags[]`, optional `draft`, `demoUrl`, `repoUrl`. The `blog` collection is declared but has no `src/content/blog/` directory (the blog lives at blog.crstian.me), so the build prints a non-fatal "collection blog does not exist or is empty" message for `/rss.xml` and `/search/`.

### Interactive Components

- SolidJS (`.tsx`): `ArrowCard`, `Projects` (filterable grid), `Search` (Fuse.js fuzzy search)
- Svelte: `CKADCard` (certification card with CSS effects, in `src/components/ckad-card/`)

### Theme System

Class-based dark mode on `<html>`. Persisted in localStorage. Light mode uses particle background (`bg.js`), dark mode uses `TwinklingStars.astro` + `MeteorShower.astro`.

### External Services

- Blog is external at `https://blog.crstian.me/` (not in this repo)
- Analytics: Umami (umami.crstian.me) and Rybbit.io
- CDN: `cdn.crstian.me` for some assets

### TypeScript

Strict mode (`astro/tsconfigs/strict`). JSX import source is `solid-js`.

## Common Mistakes to Avoid

Before making changes to SVG icons or logos, confirm with the user exactly what's wrong. Don't assume icons need theming (currentColor) when the user says they need fixing.

## CI/CD

For CI/CD workflows, always check: Node.js version compatibility (use 20+), workflow permissions configuration, secrets vs variables distinction, and pin GitHub Action versions to specific releases.
