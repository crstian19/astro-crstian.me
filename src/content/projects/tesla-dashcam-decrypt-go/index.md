---
title: "Tesdecrypt"
summary: "Batch-decrypt Tesla 2026.20+ encrypted dashcam and Sentry Mode clips locally, in parallel — a Go port with a Charm CLI"
date: "Jul 30 2026"
draft: false
tags:
- Go
- CLI
- Tesla
- Encryption
- FFmpeg
- DevOps
repoUrl: https://github.com/crstian19/tesla-dashcam-decrypt-go
---

<p align="center">
  <img src="https://raw.githubusercontent.com/crstian19/tesla-dashcam-decrypt-go/main/assets/tesdecrypt.png" alt="tesdecrypt Logo" width="200">
</p>

From firmware 2026.20 Tesla encrypts dashcam and Sentry Mode recordings on the USB drive. The official viewer at `dashcam.tesla.com` decrypts them one at a time in the browser; **Tesdecrypt** decrypts a whole drive in one command.

Your footage never leaves your machine. Only each clip's identifier and the ownership metadata already present in its header are sent to Tesla to retrieve that clip's key — the video is decrypted locally.

## Key Features

- **Whole-drive batch decryption** — parallel workers (CPU count by default), batched key requests
- **Mirrored output layout** — `SentryClips/…` and `SavedClips/…` keep their structure
- **Incremental runs** — `--skip-existing` resumes where the last run stopped
- **Lossless remux** — optional `--remux` pipes clips through `ffmpeg -c copy -movflags faststart`
- **Live progress view** on a terminal, plain lines when redirected — readable in a cron log
- **Wrong keys caught, not written** — AES-CBC has no integrity check, so each clip is validated by the `ftyp` box before output
- **Correlation-id collisions handled** — clips of identical byte size get an identical id, so colliding clips never share a batch
- **Private by default** — output files written `0600`, directories `0700`

## How it works

Each clip is an encrypted container: two 4096-byte header pages (plaintext size, correlation id, `key_id`, public key, VIN, timestamp, wrapped key) followed by an AES-128-CBC payload in 4096-byte pages. The payload uses an eCryptfs-style scheme where each page derives its own IV:

```text
iv = MD5( MD5(file_key) + ascii(page_number) )
```

The file key is not in the file — it is unwrapped by Tesla through `/api/1/decrypt/batch`, tied to the account.

Ported to Go from [XGxF3/tesla-dashcam-decrypt](https://github.com/XGxF3/tesla-dashcam-decrypt), whose write-up reverse-engineered the format.

## Technology Stack

- **Go** - Concurrency and single binary distribution
- **Charm / Lipgloss** - Progress TUI
- **ffmpeg** - Optional lossless remux

## License

MIT License - Open Source
