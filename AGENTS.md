# AGENTS.md

Guidance for AI coding agents working in this codebase.

## Project Overview

TypeScript/React CLI application (Claude Code) reconstructed from source maps. Terminal-based AI assistant using Bun as runtime/bundler.

- **Language**: TypeScript (ES modules)
- **Runtime**: Bun (Node.js compatible)
- **UI**: React with Ink (terminal UI)
- **Schema**: Zod v4

## Build/Lint/Test Commands

```bash
bun run lint                          # Lint
npx tsc --noEmit                      # Type check
bun test                              # Run tests
bun test path/to/test.test.ts         # Run single test
bun run restored-src/src/main.tsx     # Run CLI
```

## Directory Structure

`restored-src/src/` contains: main.tsx (CLI entry), tools/, commands/, services/, utils/, context/, components/, state/, hooks/, types/, constants/, entrypoints/, migrations/, coordinator/, assistant/, plugins/, skills/

## Code Style Guidelines

### Imports

```typescript
// 1. Side-effect imports FIRST
import { profileCheckpoint } from './utils/startupProfiler.js';
profileCheckpoint('marker_name');

// 2. External imports (alphabetically)
import chalk from 'chalk';
import React, { useState } from 'react';
import { z } from 'zod';

// 3. Internal imports with .js extension (REQUIRED for ES modules)
import { getTools } from './tools.js';
import type { Tool } from './Tool.js';

// 4. Lazy requires for circular dependencies
/* eslint-disable @typescript-eslint/no-require-imports */
const getModule = () => require('./module.js') as typeof import('./module.js');
/* eslint-enable @typescript-eslint/no-require-imports */
```

**Important**: Always use `.js` extensions in import paths, even for `.ts`/`.tsx` files. Files may have `// biome-ignore-all assist/source/organizeImports` - DO NOT reorganize these imports.

### TypeScript Conventions

```typescript
import type { Tool } from './Tool.js';           // Type imports for types only
export type SessionId = string & { readonly __brand: 'SessionId' }; // Branded types
const TOOLS = ['bash', 'read', 'edit'] as const; // Const assertions
const schema = z.object({ name: z.string() });   // Zod for runtime validation
```

### Naming Conventions

- **Functions**: `camelCase` - `getTools()`, `fetchBootstrapData()`
- **Classes**: `PascalCase` - `ClaudeError`, `ShellError`
- **Constants**: `SCREAMING_SNAKE_CASE` global, `camelCase` local
- **Types/Interfaces/React components**: `PascalCase`
- **Hooks**: `use` prefix - `useSettings()`, `useAppState()`

### Error Handling

```typescript
export class ShellError extends Error {
  constructor(
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly code: number,
    public readonly interrupted: boolean,
  ) {
    super('Shell command failed');
    this.name = 'ShellError';
  }
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}
```

### React Components

```typescript
export default function TextInput(props: Props): React.ReactNode {
  const settings = useSettings();
  const textInputState = useTextInput({ ... });
  return <Box>...</Box>;
}
```

### Tool Definitions

```typescript
export const MyTool = buildTool({
  name: 'my_tool',
  inputSchema: z.object({ path: z.string() }),
  async call(input, context, canUseTool, parentMessage, onProgress) {
    return { data: result };
  },
  async description(input, options) { return 'Description'; },
  isConcurrencySafe: (input) => true,
  isReadOnly: (input) => false,
  isEnabled: () => true,
  userFacingName: (input) => 'My Tool',
});
```

### Async Patterns

```typescript
void prefetchData(); // Fire-and-forget
const [isGit, worktreeCount] = await Promise.all([getIsGit(), getWorktreeCount()]); // Parallel
```

### Linting

```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
// biome-ignore lint/suspicious/noConsole: intentional console output
```

Custom ESLint rules: `no-top-level-side-effects`, `no-process-env-top-level`, `no-sync-fs`, `no-process-exit`

### Feature Flags, MCP Tools, State Management

```typescript
import { feature } from 'bun:bundle';
if (feature('COORDINATOR_MODE')) { /* Feature-specific code */ }

const mcpToolName = `mcp__${serverName}__${toolName}`;  // MCP tools prefixed with mcp__

const settings = useAppState(s => s.settings);          // Selector pattern
setAppState(prev => ({ ...prev, count: prev.count + 1 }));
```

## Key Patterns

1. **Dead Code Elimination**: Use `feature()` for compile-time feature flags
2. **Lazy Loading**: Use `require()` for breaking circular dependencies
3. **Tool Pattern**: All tools implement `Tool` interface
4. **Permission System**: Tools check via `checkPermissions()` and `canUseTool()`
5. **Progress Reporting**: Tools report via `onProgress` callback
6. **Settings**: File-based with hot-reload via change detectors
