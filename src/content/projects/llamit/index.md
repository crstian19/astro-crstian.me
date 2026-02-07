---
title: "Llamit"
summary: "AI-powered VS Code extension for generating semantic commit messages using local Ollama LLM"
date: "Feb 07 2026"
draft: false
tags:
- TypeScript
- Go
- VS Code
- AI
- Ollama
- Git
- DevOps
repoUrl: https://github.com/crstian19/llamit
---

<p align="center">
  <img src="https://cdn.crstian.me/llamit.jpg" alt="Llamit Logo" width="200">
</p>

A VS Code extension that generates semantic commit messages by analyzing your staged changes through a local language model, eliminating the need for cloud services or API keys.

## Key Features

### Local AI-Powered Commits
- **100% local processing** using Ollama - no cloud dependencies or API keys required
- Analyzes staged Git changes to generate meaningful commit messages
- Privacy-focused approach keeping your code on your machine

### Multiple Commit Formats
- **6 commit styles supported**: Conventional, Angular, Gitmoji, Karma, Semantic, and Google
- Custom template support for team-specific conventions
- Consistent formatting across your entire codebase

### Dual-Component Architecture
- **Go CLI** - Lightweight command-line interface with Ollama communication and retry logic
- **TypeScript VS Code Extension** - Seamless integration with VS Code's source control interface
- Clean separation of concerns for maintainability

### Developer Experience
- Direct integration with VS Code's native source control panel
- Fast generation with local LLM inference
- Comprehensive testing with automated CI/CD
- Multi-platform releases (Windows, macOS, Linux)

### Vibecoded Development
- **Fully developed with AI assistance** - a testament to modern AI-augmented development
- Production-ready code quality with comprehensive test coverage
- Automated testing across both CLI and extension components

## How It Works

1. Stage your changes in Git
2. Trigger commit message generation from VS Code
3. The Go CLI communicates with your local Ollama instance
4. AI analyzes the diff and generates a semantic commit message
5. Review and commit with one click

## Technology Stack

- **TypeScript** - VS Code extension development
- **Go** - High-performance CLI component
- **Ollama** - Local LLM inference
- **Git** - Version control integration
- **VS Code API** - Editor integration

## License

MIT License - Open Source
