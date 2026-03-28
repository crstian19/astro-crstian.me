---
title: "Aceplay"
summary: "Modern Go reimplementation of acestream-launcher — play Ace Stream links directly from your browser or terminal with an elegant TUI"
date: "Feb 18 2026"
draft: false
tags:
- Go
- CLI
- Linux
- Streaming
- AUR
repoUrl: https://github.com/crstian19/aceplay
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/aceplay/main/logo.png" alt="Aceplay Logo" width="200">
</p>

A modern reimplementation of `acestream-launcher` in **Go** with an elegant visual interface using the Charm ecosystem. Available on Arch Linux via the AUR.

> **Note**: Aceplay is **Linux only**.

## What it does

Aceplay handles the full lifecycle of playing an Ace Stream link: it starts `acestream-engine` automatically if it's not running, connects to the stream, and launches your media player — all with a polished TUI showing spinners and progress feedback.

The real convenience is **browser integration**: register it as the `acestream://` protocol handler and links open directly without any manual URL copying.

## Key Features

- **Auto engine management** — starts `acestream-engine` if not running, no manual daemon handling
- **Multiple players** — mpv, vlc, ffplay, and more; configurable via CLI flags or config file
- **HLS mode** — alternative streaming mode for compatible sources
- **Desktop notifications** — integration with libnotify
- **Single compiled binary** — no runtime dependencies

## Technology Stack

- **Go** - Performance and single binary distribution
- **Charm / Lipgloss** - Elegant terminal UI

## License

MIT License - Open Source
