---
title: "herdr-focus-resume"
summary: "Herdr plugin that resumes each coding agent pane when you focus it, not all at once after a server restart"
date: "Nov 23 2026"
draft: false
tags:
- Go
- Herdr
- Plugin
- Coding Agents
- Linux
repoUrl: https://github.com/crstian19/herdr-focus-resume
icon: 'icon-[simple-icons--go]'
# Fallback GitHub counts, refreshed from the API at build time and in the browser.
stars: 0
forks: 0
logo: ./logo.webp
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/herdr-focus-resume/main/assets/logo.png" alt="A Go gopher in a nightcap waking up inside a focused terminal window, next to two dimmed windows with sleeping gophers" width="200">
</p>

A [Herdr](https://herdr.dev) plugin that resumes coding agent panes **when you focus them**, instead of all at once when the server starts.

After a restart, Herdr brings back every agent pane it knows about as soon as you attach. With a dozen panes across workspaces that is a dozen agents booting together, each taking 400-800 MB of RAM, most of which you will not open that day. With this plugin only the focused pane resumes. The rest stay as idle shells of about 7 MB until you select them.

## Key Features

- **Resume on focus**: the pane you land on resumes at startup, every other agent pane resumes the first time you select it
- **Every agent Herdr can resume**: Codex, omp, Pi, OpenCode and the rest of Herdr's native integrations, plus any agent that reports its own resume command
- **Safe by default**: it only types into a pane whose shell is idle and whose directory has not changed, and it does nothing while Herdr's own agent restore is on
- **Once per restart**: concurrent focus events are serialised with a file lock, so a pane is never resumed twice
- **No dependencies**: a single Go binary, built on install

## Install

```bash
herdr plugin install crstian19/herdr-focus-resume
```

Then turn off Herdr's built-in agent restore in `~/.config/herdr/config.toml`:

```toml
[session]
resume_agents_on_restore = false
```

## How it works

With native restore off, Herdr still keeps each pane's agent session reference in `session.json`. A startup hook reads those references and resumes the focused pane, and a `pane.focused` hook resumes the others with the same command Herdr would have run.

## License

MIT - Open Source. The logo is based on the Go gopher by Renée French, licensed under CC BY 4.0.
