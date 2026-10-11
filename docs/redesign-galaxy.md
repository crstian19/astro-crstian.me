# Galaxy redesign (POC)

Branch: `feat/galaxy-redesign` · Approved checkpoint tag: `poc/galaxy-v1`

To get back to the approved version at any point:

```sh
git checkout poc/galaxy-v1          # look at it
git diff poc/galaxy-v1 -- src/      # see what changed since
```

## What v1 is

**Background** — `src/components/galaxy/`

- `GalaxyBackground.astro`: fixed full-screen container mounted in `PageLayout`, `transition:persist` so it survives view transitions. Lazy-loads `galaxy.ts`, watches the `dark` class on `<html>` to switch theme. Light mode renders the canvas at 40% opacity.
- `galaxy.ts`: two full-screen shader passes with [ogl](https://github.com/oframe/ogl):
  1. **Starfield**: vanilla port of the React Bits [Galaxy](https://reactbits.dev/backgrounds/galaxy) background (layered parallax stars, twinkle, pointer repulsion). Tuned via `OPTIONS`.
  2. **Galaxies + satellites** (`galaxyFragment`): log-spiral galaxy with fbm gas/dust (main one top-right, bottom-right on mobile, drifts with scroll), two small distant galaxies, three satellites crossing the sky with a trail and blinking beacon. Additive blend on dark, alpha blend on light.
- Pauses on hidden tab, single frame under `prefers-reduced-motion`, DPR capped at 1.5.

**UI** — same structure and content, restyled:

- Tokens in `global.css`: `--space-bg`, `--accent-1/2/3`; utilities `.glass`, `.glass-hover`, `.gradient-text`, `.eyebrow`, `.btn-primary`, `.btn-ghost`, `.nav-pill`.
- Fonts: Space Grotesk (headings), JetBrains Mono (labels) via Fontsource.
- Home: big gradient headline, orbit rings around the profile card, numbered glass sections.
- Work: vertical timeline, current role tagged "In orbit".

## Discarded

- A hand-made three.js scene (particle spiral, planet with atmosphere and ring, 3D satellites). Rejected as ugly; `three` was removed.
- The old background (`TwinklingStars.astro`, `MeteorShower.astro`, `public/js/bg.js`) is no longer used but still in the repo.

## Open

- Projects, Search and Legal only inherit the shared pieces; no dedicated redesign yet.
- Light mode was not reviewed after the galaxy pass was added.
