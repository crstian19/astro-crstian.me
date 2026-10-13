---
title: "nanoleaf-claude-usage"
summary: "Your Claude Code usage, on a wall of Nanoleaf panels. Each panel lights up as you spend the session, and the whole shape turns into a rainbow while Claude works"
date: "Sep 09 2026"
draft: false
tags:
- Go
- CLI
- Nanoleaf
- Claude Code
- Home Assistant
- IoT
repoUrl: https://github.com/crstian19/nanoleaf-claude-usage
icon: 'icon-[ph--lightbulb-filament-duotone]'
# Fallback GitHub counts, refreshed from the API at build time and in the browser.
stars: 0
forks: 0
logo: ./logo.webp
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/nanoleaf-claude-usage/main/assets/logo.png" alt="nanoleaf-claude-usage Logo" width="200">
</p>

Your Claude Code usage, on a wall of Nanoleaf panels. Each panel owns an equal share of the session allowance and lights up when you spend it, green at the bottom of the shape through to coral at the top. You read the display by counting the lit panels. While Claude works, the whole shape turns into a rainbow.

The display follows the shape you mounted.

## Key Features

- **One command setup**: `nanoclaude setup` finds the panels, pairs, writes the config, calibrates and installs the Claude Code hooks
- **Starts on its own**: Claude Code hooks bring the display up and it shuts down after 20 minutes with no session
- **Any shape**: the gauge fills from the bottom of whatever you mounted, with no dependency on panel order or count
- **Every Nanoleaf line**: Light Panels, Canvas, Shapes, Elements, Lines, the 4D lightstrip and Skylight, each at its published size
- **Calibration page**: draws your own panels and follows your mouse until the shape matches the wall
- **Wall designer**: fifteen sample walls plus an empty one where panels snap to the edge you drop them on
- **Pause and Home Assistant gate**: keep the wall dark for a while, or from an automation at bedtime
- **Leaves things as they were**: restores the effect and power state on exit and never touches global brightness

## How it works

The usage figure comes from the status line cache that [claude-pulse](https://github.com/NoobyGains/claude-pulse) already writes, so the program needs no credentials and never gets the account throttled. Between readings it adds the cost `ccusage` reports from the local transcripts.

The device reports where every panel sits. The gauge fills along the shape's vertical axis and the rainbow runs along its long axis, found with a principal component analysis of the panel positions.

Both colour scales are arcs in OKLCH. The gauge moves only the hue so no band reads as more urgent than its neighbour, and the rainbow takes all the chroma each hue can carry, measured per hue at startup.

## Technology Stack

- **Go** - Daemon and single binary for Linux and macOS
- **Charm** - Terminal previews and calibration TUI
- **Nanoleaf OpenAPI** - Panel layout and external control streaming
- **Home Assistant** - Optional gate for the display
- **GoReleaser** - Release binaries from tags

## License

MIT License - Open Source
