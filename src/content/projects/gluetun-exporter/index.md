---
title: "Gluetun Exporter"
summary: "Prometheus exporter for Gluetun — VPN status, public IP, and network traffic metrics"
date: "Mar 22 2026"
draft: false
tags:
- Go
- Prometheus
- Monitoring
- Docker
- Gluetun
- VPN
- DevOps
repoUrl: https://github.com/crstian19/gluetun-exporter
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/gluetun-exporter/main/gluetun-exporter-logo.png" alt="Gluetun Exporter Logo" width="180">
</p>

A Prometheus exporter for [Gluetun](https://github.com/qdm12/gluetun) that exposes VPN tunnel status, public IP info, and network traffic metrics — bridging Gluetun's control API with your existing monitoring stack.

## What it exposes

- **VPN status** — connected/disconnected gauge
- **Public IP info** — current IP, country, city, and organization as labels
- **Port forwarding** — forwarded port status for OpenVPN providers
- **Network traffic** — RX/TX bytes, packets, errors, and drops from the VPN interface

It runs inside Gluetun's network namespace, so it reads traffic metrics directly from `/proc/net/dev` alongside the control API — no side-channel tricks needed.

Includes a pre-built **Grafana dashboard** to visualize all metrics out of the box.

## Technology Stack

- **Go** - Performance and efficiency
- **Prometheus** - Metrics exposition
- **Docker** - Multi-arch images (`amd64` / `arm64`)
- **Grafana** - Pre-built dashboard

## License

MIT License - Open Source
