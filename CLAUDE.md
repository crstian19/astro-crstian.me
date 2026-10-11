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

Astro 7 static site with SolidJS and Svelte 5 island components, styled after the blog (blog.crstian.me) and laid out full screen over a three.js sky. Tailwind CSS 4 (`@tailwindcss/vite`, configured in `src/styles/global.css`: there is no tailwind.config) with the blog's oklch tokens and class-based dark mode. Fonts through the Astro Fonts API (`fonts` in `astro.config.mjs`). The full picture is in [docs/architecture.md](docs/architecture.md); adding content in [docs/content.md](docs/content.md); hosting and archiving in [docs/deployment.md](docs/deployment.md).

### Key Directories

- `src/pages/` — File-based routing (index, work, projects, search, legal/[slug], projects/[slug], 404)
- `src/content/` — Content collections: `work/` (flat .md), `projects/` (nested `{slug}/index.md`), `legal/`
- `src/components/` — Mix of `.astro`, `.tsx` (SolidJS), and `.svelte` components
- `src/layouts/` — `PageLayout.astro` (base), `ArticleTopLayout`/`ArticleBottomLayout` (content pages)
- `src/components/space/` — three.js sky (`SpaceBackground.astro`, `space.ts`)
- `src/styles/global.css` — design tokens and shared classes (`.frame`, `.panel`, `.eyebrow`, `.pill`, `.tag`, `.project-logo`)
- `src/lib/` — `utils.ts` (`cn()`, `formatDate()`, `formatMonth()`, `readingTime()`), `portrait.ts` (ASCII frames for the matrix portraits), `github.ts` (stars, forks, GHCR pulls at build time), `blog.ts` (latest posts from the blog RSS)
- `src/consts.ts` — Site metadata, nav links, socials, `STACK` catalog (names and links of the logos in `public/stack.svg`)
- `public/js/animate.js` — staggered entrance (deferred); `src/scripts/theme.js` — theme switcher, inlined in the `<head>`
- `scripts/project-logo.ts` — builds a project's card logo (`bun run logo <slug>`)

### Path Aliases (tsconfig.json)

`@components/*`, `@layouts/*`, `@lib/*`, `@consts`, `@types` all map to `src/`.

### Astro Content Layer

Astro 7 content collections use the Content Layer API (import `z` from `astro/zod`): each collection has a `loader` (`glob()`), and entries expose `id` (no file extension, slugified, trailing `/index` removed) — `optare.md` is `optare`, `aceplay/index.md` is `aceplay`. That `id` is directly usable as the URL segment. `entry.Slug`/`entry.slug` and `entry.render()` no longer exist — use `render(entry)` from `astro:content`.

### Content Collections

Defined in `src/content.config.ts`. Work entries have `company`, `role`, `dateStart`, `dateEnd`. Projects have `title`, `summary`, `date`, `tags[]`, optional `draft`, `demoUrl`, `repoUrl`, `logo`, `icon` (Iconify class, used when there is no logo), and fallback `stars`/`forks` (the real counts come from the GitHub API at build time, `src/lib/github.ts`). Projects that publish a container image set `dockerImage: ghcr.io/<owner>/<name>` and a fallback `pulls`; the real total downloads are read from the GHCR package page at build time (GHCR has no public API for it, and the page can't be fetched from the browser).

### Project logos

Every project card shows the project's own logo, grayscale at rest and in colour on hover. Build it with:

- `bun run logo <slug>`: takes the first image in `src/content/projects/<slug>/index.md` (the README logo), removes its background, trims it, writes `logo.webp` next to it and adds `logo: ./logo.webp` to the frontmatter.
- `bun run logo <slug> <url|path>`: same, from a specific image.
- `--disc` for a coloured disc on a light background (Storage Box exporter), `--keep-bg` for logos that need their own background to be readable (Tesdash: white lettering on black).

Check the result on both themes before committing. The script is `scripts/project-logo.ts`.

The `blog` collection is declared but has no `src/content/blog/` directory (the blog lives at blog.crstian.me), so the build prints a non-fatal "collection blog does not exist or is empty" message for `/rss.xml` and `/search/`.

### Interactive Components

- SolidJS (`.tsx`): `ArrowCard` (project card), `Search` (Fuse.js fuzzy search)
- Svelte: `CKADCard` (certification card with CSS effects, in `src/components/ckad-card/`)
- Plain Astro + client scripts: `MatrixPortrait` (matrix-rain ASCII portrait with a Glyph Matrix halo), `TechCloud` (icon cloud) and `TechOrbit` (3D orbit + legend), `GithubCounts`, `ScrollProgress`, the `/projects` sort

### Theme System

Class-based dark mode on `<html>`, three states (light / dark / system) persisted in `localStorage.theme` by `src/scripts/theme.js` (the blog's script, with its wipe transition). The three.js sky is the background on both themes: OLED black in dark mode, near-white in light mode.

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
