---
title: "Tesdash"
summary: "Self-hosted static dashboard for Tesla's in-car browser — launch streaming, music, sports and more in fullscreen with a single tap"
date: "Mar 12 2026"
draft: false
tags:
- Astro
- Svelte
- TypeScript
- Tesla
- Self-hosted
- Docker
- Tailwind
- Dashboard
repoUrl: https://github.com/crstian19/tesdash
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/tesdash/main/public/logos/tesdash-black.webp" alt="Tesdash Logo" width="400">
</p>

A self-hosted static dashboard designed for the **Tesla in-car browser** — launch all your apps in fullscreen with a single tap, with a glassmorphism dark UI built for the touchscreen.

## The problem it solves

Tesla's browser is fully capable but navigating to apps manually is tedious while driving. Tesdash gives you a one-tap launcher where every app opens fullscreen using a YouTube redirect trick built into Tesla's browser.

All configuration lives in a single YAML file — no code changes needed to add or reorganize apps.

## Key Features

- **Fullscreen launcher** — every app opens fullscreen via the Tesla YouTube redirect
- **Per-app accent color** — extracted automatically from each app's logo
- **Spotlight effect** — radial gradient follows cursor/finger across each card
- **Category drag & drop** — reorder categories with persistent order via localStorage
- **Add custom apps** at runtime without touching the config
- **Language & Region support** — 13 interface languages, country filter to hide unavailable apps
- **EV charging calculator** — charge time, cost and energy for all Tesla models
- **Live clock** and **PWA ready** — installable to home screen
- **Zero JS for static content** — Svelte islands only where needed

## Technology Stack

- **Astro 6** - Static site generation
- **Svelte 5** - Interactive islands (clock, URL launcher)
- **Tailwind CSS 4 + DaisyUI 5** - Styling
- **Bun** - Runtime and package manager
- **Docker + nginx** - Self-hosting

## License

MIT License - Open Source
