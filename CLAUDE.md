# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains TypeScript source code reconstructed from the `@anthropic-ai/claude-code` npm package (v2.1.88) via source map analysis. It is for research purposes only and does not represent the official internal development repository structure.

## Build/Lint/Test Commands

```bash
bun run lint                          # Lint code
npx tsc --noEmit                      # Type check
bun test                              # Run all tests
bun test path/to/test.test.ts         # Run single test
bun run restored-src/src/main.tsx     # Run CLI locally
```

## Key Directories

- `restored-src/src/` - Reconstructed TypeScript source
  - `main.tsx` - CLI entry point
  - `tools/` - 30+ tool implementations (Bash, Read, Edit, Grep, MCP, Agent, etc.)
  - `commands/` - 40+ slash commands (commit, review, config, mcp, etc.)
  - `services/` - API, MCP, analytics, plugins, policy limits
  - `utils/` - Core utilities (auth, settings, permissions, git, model)
  - `state/` - React state management (AppState store pattern)
  - `context/` - React contexts (notifications, modals, voice)
  - `components/` - Ink terminal UI components
  - `coordinator/` - Multi-agent coordination mode
  - `assistant/` - KAIROS assistant mode
  - `skills/` - Skill system
  - `plugins/` - Plugin system
- `package/` - Modified npm package for local installation
  - `cli.js` - Bundled CLI with patches applied
  - `patch.cjs` / `patch-env.cjs` - Patch scripts for custom API support

## Architecture

### Tool Pattern
All tools implement the `Tool` interface and use `buildTool()`:
- `inputSchema`: Zod schema for validation
- `call()`: Main execution logic
- `description()`: Dynamic description generation
- `isReadOnly()`, `isConcurrencySafe()`, `isEnabled()`: Capability flags

### State Management
- Central `AppState` store with selector pattern: `useAppState(s => s.field)`
- File-based settings with hot-reload via change detectors

### MCP Integration
- MCP tools named as `mcp__${serverName}__${toolName}`
- MCP servers configured in settings, resources prefetched at startup

### Feature Flags
Compile-time feature elimination via `feature('FEATURE_NAME')` from `bun:bundle`.

## Code Conventions

See `AGENTS.md` for detailed code style guidelines including:
- Import ordering (side-effects first, external, internal with `.js` extension)
- TypeScript patterns (branded types, const assertions, type imports)
- Naming conventions
- Tool definition patterns

## Custom API Configuration

This project has been modified to support third-party API endpoints. Key modifications:

1. **Preflight checks bypassed** - `patch.cjs` modifies `checkEndpoints()` to always succeed
2. **Environment variable priority** - `patch-env.cjs` makes env vars take precedence over config file
3. **Model list extension** - `additionalModelOptionsCache` in settings for custom models

### Configuration Methods

**Environment variables** (highest priority):
```bash
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_BASE_URL=https://api.example.com
ANTHROPIC_MODEL=glm-5
CLAUDE_CODE_GIT_BASH_PATH=/path/to/bash.exe  # Windows only
```

**Config file** (`~/.claude.json`):
```json
{
  "hasCompletedOnboarding": true,
  "env": {
    "ANTHROPIC_API_KEY": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.example.com"
  },
  "additionalModelOptionsCache": [
    { "value": "glm-5", "label": "GLM-5", "description": "Zhipu GLM-5" }
  ]
}
```

## Applying Patches and Local Installation

```bash
cd package
node patch.cjs
node patch-env.cjs
npm link
claude --version  # Verify: 2.1.88 (Claude Code)
```

## Source Extraction

The `extract-sources.js` script extracts TypeScript sources from `cli.js.map`:
```bash
node extract-sources.js
```
