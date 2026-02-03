---
title: "Prometheus Storage Box Exporter"
summary: "Prometheus exporter for Hetzner Storage Box with comprehensive storage, access, and snapshot metrics"
date: "Dec 07 2025"
draft: false
tags:
- Go
- Prometheus
- Monitoring
- Docker
- Kubernetes
- Hetzner
- DevOps
repoUrl: https://github.com/crstian19/prometheus-storagebox-exporter
---

<p align="center">
  <img src="https://cdn.crstian.me/storage-box-exporter-logo.png" alt="Storage Box Exporter Logo" width="200">
</p>

A modern Prometheus exporter specifically designed for Hetzner Storage Box that collects comprehensive infrastructure and storage metrics.

## Key Features

### Comprehensive Metrics
- **15+ metrics** covering disk quota, usage (data vs snapshots), access configuration (SSH, Samba, WebDAV, ZFS), snapshot plans, and delete protection
- Real-time monitoring of Storage Box status
- Detailed usage and capacity metrics

### Multi-Platform Architecture
- **Docker images** optimized for multiple architectures (amd64, arm64)
- Automatic platform detection
- Lightweight image (less than 50MB memory usage)

### Kubernetes Integration
- Pre-configured manifests ready for production
- Integrated health checks
- Configuration via ConfigMaps and Secrets

### Grafana Visualization
- **Pre-built dashboard** with 21 panels
- Complete visualization of Storage Box status
- Trend metrics and alerts

### Production-Ready Features
- Bearer token authentication
- Optional caching with TTL and size limits
- Structured logging
- Comprehensive error handling
- Health checks for orchestrators

## Endpoints

- **Metrics**: `http://localhost:9509/metrics`
- **Health Check**: `http://localhost:9509/health`

## Technology Stack

- **Go** - Performance and efficiency
- **Prometheus** - Metrics system
- **Docker** - Containerization
- **Grafana** - Data visualization
- **Kubernetes** - Orchestration

## License

MIT License - Open Source
