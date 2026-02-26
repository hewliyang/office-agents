# AGENTS.md

## Project Overview

**Office Agents** is a pnpm monorepo containing Microsoft Office Add-ins with integrated AI chat interfaces. Users can chat with LLM providers (OpenAI, Anthropic, Google, etc.) directly within Office apps using their own API keys (BYOK). The agent has Office read/write tools, a sandboxed bash shell, and a virtual filesystem for file uploads.

Currently contains:
- **@office-agents/core** — Shared chat UI, BYOK auth, storage, VFS, skills, and agent lifecycle
- **@office-agents/excel** — Excel-specific tools, Office.js wrappers, and system prompt

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS variables for theming
- **Icons**: Lucide React (`lucide-react`)
- **Build Tool**: Vite 6
- **Office Integration**: Office.js API (`@types/office-js`)
- **LLM Integration**: `@mariozechner/pi-ai` + `@mariozechner/pi-agent-core` (unified LLM & agent API)
- **Virtual Filesystem / Bash**: `just-bash` (in-memory VFS + shell)
- **Dev Server**: Vite dev server with HTTPS
- **Monorepo**: pnpm workspaces

## Project Structure

```
office-agents/
├── pnpm-workspace.yaml
├── package.json                     # Root scripts (typecheck, lint, build)
├── biome.json                       # Shared linter/formatter config
├── tsconfig.json                    # Root tsconfig with project references
├── packages/
│   ├── core/                        # @office-agents/core — shared library
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts             # Main exports
│   │       ├── index.css            # CSS variables + markdown styles
│   │       ├── lockdown.ts          # SES lockdown for Office.js
│   │       ├── sandbox.ts           # Sandboxed eval via SES Compartment
│   │       ├── message-utils.ts     # AgentMessage → ChatMessage, stats
│   │       ├── provider-config.ts   # Provider config load/save, custom endpoints
│   │       ├── truncate.ts          # Output truncation (head/tail)
│   │       ├── chat/                # Chat UI components (React)
│   │       │   ├── index.ts
│   │       │   ├── app-adapter.ts   # AppAdapter interface (tools, prompt, hooks)
│   │       │   ├── chat-context.tsx # State, agent lifecycle, streaming
│   │       │   ├── chat-interface.tsx # Tabs, sessions, drag-and-drop
│   │       │   ├── chat-input.tsx   # Input with file upload
│   │       │   ├── message-list.tsx # Message renderer with tool calls
│   │       │   ├── settings-panel.tsx # Provider/model/auth/skills config
│   │       │   ├── error-boundary.tsx
│   │       │   └── types.ts
│   │       ├── oauth/index.ts       # OAuth PKCE (Anthropic, OpenAI Codex)
│   │       ├── storage/             # IndexedDB (sessions, VFS files, skills)
│   │       │   ├── db.ts
│   │       │   └── index.ts
│   │       ├── vfs/index.ts         # Virtual filesystem (just-bash)
│   │       ├── skills/index.ts      # Skill install/uninstall/prompt injection
│   │       ├── tools/               # Shared tools
│   │       │   ├── types.ts         # defineTool, ToolResult helpers
│   │       │   ├── bash.ts          # Sandboxed bash execution
│   │       │   └── read-file.ts     # VFS file reader (text + images)
│   │       └── web/                 # Web search & fetch providers
│   │           ├── types.ts
│   │           ├── config.ts
│   │           ├── search.ts
│   │           └── fetch.ts
│   │
│   └── excel/                       # @office-agents/excel — Excel add-in
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── manifest.xml             # Office Add-in manifest (dev)
│       ├── manifest.prod.xml        # Office Add-in manifest (prod)
│       ├── manifest.json            # Unified manifest
│       └── src/
│           ├── taskpane.html
│           ├── taskpane/
│           │   ├── index.tsx        # React entry point
│           │   ├── index.css        # Tailwind config
│           │   └── components/
│           │       └── app.tsx      # Wires core ChatInterface with Excel adapter
│           ├── lib/
│           │   ├── adapter.ts       # Excel AppAdapter (tools, prompt, follow mode)
│           │   ├── dirty-tracker.ts # Track modified cell ranges
│           │   ├── tools/           # Excel-specific tools
│           │   │   ├── index.ts     # EXCEL_TOOLS array
│           │   │   ├── types.ts     # defineTool with DirtyRange tracking
│           │   │   ├── eval-officejs.ts
│           │   │   ├── get-cell-ranges.ts
│           │   │   ├── set-cell-range.ts
│           │   │   └── ...          # Other Excel tools
│           │   ├── excel/           # Excel API wrappers
│           │   │   ├── api.ts
│           │   │   ├── sheet-id-map.ts
│           │   │   └── tracked-context.ts
│           │   └── vfs/
│           │       └── custom-commands.ts  # csv-to-sheet, sheet-to-csv, etc.
│           ├── commands/
│           │   └── commands.ts
│           └── shims/
│               └── util-types-shim.js
├── .plan/                           # Development plans
├── CHANGELOG.md
└── .github/workflows/
    ├── ci.yml
    └── release.yml
```

## Key Architecture

### AppAdapter Pattern

Each Office app implements the `AppAdapter` interface from `@office-agents/core`:

```typescript
interface AppAdapter {
  tools: AgentTool[];                               // App-specific tools
  buildSystemPrompt: (skills) => string;            // System prompt
  getDocumentId: () => Promise<string>;             // Unique doc ID for sessions
  getDocumentMetadata?: () => Promise<...>;         // Injected into each prompt
  onToolResult?: (id, result, isError) => void;     // Follow-mode, navigation
  metadataTag?: string;                             // XML tag for metadata (default: "doc_context")
  Link?: ComponentType<LinkProps>;                  // Custom markdown link component
  ToolExtras?: ComponentType<ToolExtrasProps>;      // Extra UI in tool call blocks
  appName?: string;
  appVersion?: string;
  emptyStateMessage?: string;
}
```

The core `ChatInterface` component accepts an adapter and handles all generic chat UI, agent lifecycle, sessions, settings, file uploads, and skills.

### Excel Adapter

The Excel adapter (`packages/excel/src/lib/adapter.tsx`):
- Registers `EXCEL_TOOLS` (16 Excel tools + bash + read from core)
- Builds Excel-specific system prompt with tool docs and citation syntax
- Provides workbook metadata (sheet names, used ranges) per prompt
- Handles follow-mode navigation to dirty ranges after tool execution
- Handles `#cite:sheetId!range` links in markdown

### VFS Custom Commands

App-specific VFS commands are registered via `setCustomCommands()` from core. Excel registers: `csv-to-sheet`, `sheet-to-csv`, `pdf-to-text`, `docx-to-text`, `xlsx-to-csv`, `image-to-sheet`, `web-search`, `web-fetch`.

## Development Commands

```bash
pnpm install             # Install all dependencies
pnpm dev-server          # Start Excel dev server (https://localhost:3000)
pnpm start               # Launch Excel with add-in sideloaded
pnpm build               # Build all packages
pnpm lint                # Run Biome linter
pnpm format              # Format code with Biome
pnpm typecheck           # TypeScript type checking (all packages)
pnpm check               # Typecheck + lint
pnpm validate            # Validate Office manifests
```

## Code Style

- Formatter/linter: Biome
- No JSDoc comments on functions
- Run `pnpm format` before committing

## Release Workflow

Releases are triggered by pushing a version tag. CI runs quality checks, deploys to Cloudflare Pages, and creates a GitHub release with changelog.

### Steps

1. Update `CHANGELOG.md`
2. Bump version: `pnpm version patch` (or minor/major)
3. Push: `git push && git push --tags`
4. CI deploys `packages/excel/dist` to Cloudflare Pages

## Configuration Storage

User settings stored in browser localStorage (legacy `openexcel-` prefix, see TODO.md):

| Key                            | Contents                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `openexcel-provider-config`    | `{ provider, apiKey, model, useProxy, proxyUrl, thinking, followMode, apiType, customBaseUrl, authMethod }` |
| `openexcel-oauth-credentials`  | `{ [provider]: { refresh, access, expires } }`                                                   |
| `openexcel-web-config`         | `{ searchProvider, fetchProvider, apiKeys }` |
| `office-agents-theme`          | `"light"` or `"dark"` |

Session data (messages, VFS files, skills) stored in IndexedDB via `idb` (`OpenExcelDB_v3`).

## Excel API Usage

```typescript
await Excel.run(async (context) => {
  const sheet = context.workbook.worksheets.getActiveWorksheet();
  const range = sheet.getRange("A1");
  range.values = [["value"]];
  await context.sync();
});
```

## References

- [Office Add-ins Documentation](https://learn.microsoft.com/en-us/office/dev/add-ins/)
- [Excel JavaScript API](https://learn.microsoft.com/en-us/javascript/api/excel)
- [pi-ai / pi-agent-core](https://github.com/badlogic/pi-mono)
- [just-bash](https://github.com/nickvdyck/just-bash)
