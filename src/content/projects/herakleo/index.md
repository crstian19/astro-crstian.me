---
title: "Herakleo"
summary: "Fast IPTV player for Linux, Windows and macOS that opens M3U and Xtream Codes lists and plays them in mpv or VLC"
date: "Oct 28 2026"
draft: false
tags:
- Go
- Wails
- Svelte
- TypeScript
- IPTV
- Desktop
- Linux
repoUrl: https://github.com/crstian19/herakleo
icon: 'icon-[simple-icons--go]'
# Fallback GitHub counts, refreshed from the API at build time and in the browser.
stars: 0
forks: 0
logo: ./logo.webp
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/herakleo/main/assets/herakleo-wails.png" alt="Herakleo logo: a gopher dressed as a pharaoh holding a TV" width="160">
</p>

A fast, free and open source **IPTV player** for Linux, Windows and macOS. Open an **M3U / M3U8 playlist** or an **Xtream Codes** account, find a channel among tens of thousands, and watch it in mpv or VLC.

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/herakleo/main/docs/images/herakleo-channels.png" alt="Herakleo channel grid with the group list on the left and the search box at the top" width="800">
</p>

## Key Features

- **M3U and Xtream Codes**: by URL, from a local file or with an Xtream account. Several lists at once, each one can be refreshed or turned off without deleting it
- **Built for big lists**: 65,000 channels search, filter and scroll smoothly, with a precomputed search index and a grid that only renders what is on screen
- **Plays in your player**: mpv by default, VLC everywhere, Celluloid and Haruna on Linux, IINA on macOS
- **Favourites, history and hiding**: hide channels or whole groups, keep recent channels, back up favourites
- **Keyboard first**: every view works with arrows, Enter and Esc, so a TV remote is enough
- **Six languages** and six accent colours
- **Private**: everything stays on your machine. No accounts, no telemetry

## Install

Packages for Arch Linux (AUR: `herakleo-bin`), Ubuntu/Debian (`.deb`), Fedora (`.rpm`), Flatpak, Windows and macOS are on the [latest release](https://github.com/crstian19/herakleo/releases/latest). Install a player too: [mpv](https://mpv.io) is the default.

## How it is built

The UI is **Svelte 5 + Tailwind 4**, rendered by the system WebKit, on a **Go** backend with **Wails v3** (GTK 4).

Herakleo was first written twice, on Tauri 2 and on Wails, to compare both frameworks on a real app. Wails won: on Linux, Tauri still uses the GTK 3 WebKit, which caps scrolling at 60 fps, and Wails v3 on GTK 4 does not.

## License

GPL-3.0-or-later - Open Source
