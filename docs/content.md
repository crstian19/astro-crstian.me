# Content

<!-- In-repo doc. English. Relative Markdown links only. -->

How to add or change what the site shows: projects, jobs, the stack and the legal pages. Collections are defined in `src/content.config.ts` (Astro 6 Content Layer: the entry `id` is the file path without extension or trailing `/index`, and it is used as the URL segment).

---

## Projects

Each project is a folder: `src/content/projects/<slug>/index.md`, plus its `logo.webp`. The `<slug>` is the URL (`/projects/<slug>`).

### Frontmatter

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Card and page title |
| `summary` | yes | One sentence for the card |
| `date` | yes | Release date, e.g. `"Mar 12 2026"`; the cards sort by it |
| `tags` | yes | List of strings, shown as tags |
| `draft` | no | `true` hides it everywhere |
| `repoUrl` | no | GitHub repo; enables stars and forks and the GitHub link |
| `demoUrl` | no | Website link, shown as "Website" |
| `logo` | no | `./logo.webp`, written by the logo script below |
| `icon` | no | Iconify class used when there is no logo, e.g. `icon-[simple-icons--grafana]` |
| `stars`, `forks` | no | Fallback counts if the GitHub API can't be reached at build time |
| `dockerImage` | no | `ghcr.io/<owner>/<name>`; shows the image's total pulls |
| `pulls` | no | Fallback pull count for `dockerImage` |

The body is the project's page, in Markdown. Its first image is usually the README logo.

```yaml
---
title: "Tesdash"
summary: "Self-hosted static dashboard for Tesla's in-car browser"
date: "Mar 12 2026"
tags: [Astro, Svelte, Docker]
repoUrl: https://github.com/crstian19/tesdash
demoUrl: https://tesda.sh
icon: 'icon-[simple-icons--tesla]'
stars: 6
forks: 5
dockerImage: ghcr.io/crstian19/tesdash
pulls: 1027
logo: ./logo.webp
---
```

### The card logo

Cards show the project's own logo, grayscale at rest and in colour on hover. Build it from the README logo:

```sh
bun run logo <slug>                 # first image in the project's index.md
bun run logo <slug> <url|path>      # a specific image
bun run logo <slug> --disc          # coloured disc on a light background
bun run logo <slug> --keep-bg       # keep the logo's own background, rounded corners
```

The script (`scripts/project-logo.ts`) removes the background (flood fill from the corners), trims and centres the logo on a 192 px square, writes `logo.webp` and adds `logo: ./logo.webp` to the frontmatter if it is missing. Use `--keep-bg` when the logo needs its background to stay readable (white lettering on black, like Tesdash). Check the card in both themes before committing.

### Stars, forks and pulls

Real counts are fetched at build time (`src/lib/github.ts`); the frontmatter values are only fallbacks, so they don't need to be kept exact. Stars and forks are also refreshed in the browser. Pulls are read from the GHCR package page and update on each deploy.

## Work

One file per role in `src/content/work/<name>.md`:

| Field | Notes |
|---|---|
| `company`, `role` | Shown in the section heading |
| `dateStart` | e.g. `"04/01/2026"` (MM/DD/YYYY) |
| `dateEnd` | A date or `"Present"` |
| `skills` | Keys of `STACK` in `src/consts.ts`; each one must exist as a symbol in `public/stack.svg` |

The body is a bullet list of what the job involved. The newest role is marked "Current".

## Stack and socials

- **Tech & tools** groups and their tools: `rings` in `src/components/TechOrbit.astro`. Names and links come from `STACK` in `src/consts.ts`; logos from `public/stack.svg`. Both follow the blog: when the blog's stack changes, copy its sprite and update `STACK`.
- **Socials**: `SOCIALS` in `src/consts.ts`, with Remix icons (`icon-[ri--…]`), in the blog's order.

## Legal pages

`src/content/legal/<slug>.md` with `title` and `date`; served at `/legal/<slug>`.

## Writing style

English, no em dashes (use a colon, comma or full stop; en dash only in date ranges).
