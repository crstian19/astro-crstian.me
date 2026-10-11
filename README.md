# crstian.me

Personal site of Cristian Gutiérrez, SRE / AI Platform Engineer. It sits next to the blog at [blog.crstian.me](https://blog.crstian.me) and shares its design system, so both read as one place.

**Live:** [crstian.me](https://crstian.me) · **Past versions:** [old.crstian.me](https://old.crstian.me)

## What's on it

- **Home**: hero with a matrix-rain portrait (the rain prints the photo as ASCII, a glyph halo surrounds it, hover shows the photo), the latest projects, the latest blog posts, the tech stack and a contact section with an animated scene that gets the same treatment.
- **Work**: the career log, one entry per role with its tools.
- **Projects**: one card per project with its own logo, GitHub stars and forks, and container pulls for the ones on GHCR. Sortable by newest or most stars.
- **Search** over the projects, and the legal pages.

Everything floats over a three.js sky (nebula, Milky Way band, twinkling stars, shooting stars) that is the page background on both themes.

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro](https://astro.build) 7, static output |
| Islands | SolidJS (cards, search), Svelte 5 (CKAD card) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`, configured in `src/styles/global.css`) with the blog's oklch tokens; Iconify icons through `@iconify/tailwind4` |
| Fonts | Geist, Lexend and Geist Mono, self-hosted through the Astro Fonts API (same as the blog) |
| Background | three.js (`src/components/space/`) |
| Images | sharp, at build time (ASCII portraits, project logos) |
| Package manager | Bun |
| Hosting | Cloudflare Pages, deployed from `main` |

## Run it locally

```sh
bun install
bun dev              # http://localhost:4321
bun dev:network      # reachable from other devices on the network
bun run build        # astro check + build to dist/
bun preview          # serve dist/
```

There is no test runner: `bun run build` type-checks with `astro check` first, so a clean build is the check.

## Project structure

```
src/
├── pages/            index, work, projects (+ [slug]), search, legal/[slug], 404, rss.xml
├── layouts/          PageLayout (header, sky, footer) and the article layouts
├── components/
│   ├── space/        three.js sky
│   ├── base/         header links, theme toggle, avatar, section heading, scroll progress, GitHub counters
│   ├── MatrixPortrait.astro   matrix-rain ASCII portrait with the glyph halo
│   ├── TechCloud.astro        icon cloud of the stack
│   ├── TechOrbit.astro        3D orbit of the stack, with the legend
│   └── ArrowCard.tsx          project card
├── content/          work/, projects/<slug>/index.md, legal/
├── lib/              portrait.ts (ASCII frames), github.ts (stars, forks, pulls), blog.ts (blog RSS)
├── assets/fonts/     the three variable fonts (Fonts API)
├── scripts/theme.js  theme switcher, inlined in the <head>
├── consts.ts         site metadata, nav, socials, stack catalog
└── styles/global.css Tailwind setup, design tokens and shared classes
public/               stack.svg (tech logos), favicons, _headers (cache), js/animate.js
scripts/project-logo.ts   builds a project's card logo (bun run logo <slug>)
```

## Docs

- [Architecture](./docs/architecture.md): how the pieces fit together and why.
- [Content](./docs/content.md): adding a project, a job or a legal page.
- [Deployment](./docs/deployment.md): Cloudflare Pages, previews and archiving a version on old.crstian.me.
