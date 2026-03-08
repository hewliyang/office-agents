# AGENTS.md

## Project Overview

**Office Agents** is a pnpm monorepo containing Microsoft Office Add-ins with integrated AI chat interfaces. Users can chat with LLM providers (OpenAI, Anthropic, Google, etc.) directly within Office apps using their own API keys (BYOK). The agent has Office read/write tools, a sandboxed bash shell, and a virtual filesystem for file uploads.

- **@office-agents/sdk** (`packages/sdk/`) — Headless SDK: agent runtime, tools (bash, read), storage, VFS, skills, OAuth, web search/fetch, provider config
- **@office-agents/core** (`packages/core/`) — React chat UI layer: re-exports SDK + ChatInterface, settings panel, sessions, message rendering
- **@office-agents/excel** (`packages/excel/`) — Excel Add-in: spreadsheet tools, Office.js wrappers, system prompt, cell-range follow mode
- **@office-agents/powerpoint** (`packages/powerpoint/`) — PowerPoint Add-in: slide/OOXML tools, JSZip-based PPTX editing, system prompt

### Key Paths

- `packages/sdk/src/runtime.ts` — `AgentRuntime` class (agent lifecycle, streaming, model resolution)
- `packages/sdk/src/tools/` — Shared tools (`bash.ts`, `read-file.ts`, `types.ts` with `defineTool`)
- `packages/sdk/src/vfs/` — Virtual filesystem + custom commands (`setCustomCommands`)
- `packages/sdk/src/storage/` — IndexedDB sessions, VFS file persistence, skills
- `packages/core/src/chat/` — React chat components (`chat-interface.tsx`, `chat-context.tsx`, `app-adapter.ts`, `settings-panel.tsx`)
- `packages/excel/src/lib/adapter.ts` — Excel `AppAdapter` (tools, prompt, metadata, follow mode)
- `packages/excel/src/lib/tools/` — Excel-specific tools (`set-cell-range`, `get-cell-ranges`, `eval-officejs`, etc.)
- `packages/powerpoint/src/lib/adapter.tsx` — PowerPoint `AppAdapter` (tools, prompt, metadata)
- `packages/powerpoint/src/lib/tools/` — PPT tools (`edit-slide-xml`, `screenshot-slide`, `edit-slide-chart`, etc.)
- `packages/powerpoint/src/lib/pptx/` — OOXML/PPTX helpers (`slide-zip.ts`, `xml-utils.ts`)

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

### VFS Custom Commands

App-specific VFS commands are registered via `setCustomCommands()` from SDK. Excel registers: `csv-to-sheet`, `sheet-to-csv`, `pdf-to-text`, `docx-to-text`, `xlsx-to-csv`, `image-to-sheet`, `web-search`, `web-fetch`. PowerPoint registers: `pdf-to-text`, `pdf-to-images`, `docx-to-text`, `xlsx-to-csv`, `web-search`, `web-fetch`.

## Development Commands

```bash
pnpm install             # Install all dependencies
pnpm dev-server:excel    # Start Excel dev server (https://localhost:3000)
pnpm dev-server:ppt      # Start PowerPoint dev server (https://localhost:3001)
pnpm start:excel         # Launch Excel with add-in sideloaded
pnpm start:ppt           # Launch PowerPoint with add-in sideloaded
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

Each app is released independently with its own version tag, changelog, and Cloudflare Pages project.

| Package    | Tag prefix  | Changelog                          | Deploy target    |
| ---------- | ----------- | ---------------------------------- | ---------------- |
| Excel      | `excel-v*`  | `packages/excel/CHANGELOG.md`      | CF Pages `openexcel` |
| PowerPoint | `ppt-v*`    | `packages/powerpoint/CHANGELOG.md` | CF Pages `openppt`   |
| SDK        | `sdk-v*`    | `packages/sdk/CHANGELOG.md`        | npm `@office-agents/sdk` |

### Steps (per app)

1. Add changes under `## [Unreleased]` in the app's `CHANGELOG.md`
2. Run the release script:
   ```bash
   pnpm release:excel patch   # or minor/major
   pnpm release:ppt patch     # or minor/major
   pnpm release:sdk patch     # or minor/major
   ```
3. The script bumps the version, stamps the changelog, commits, tags (`excel-v*` / `ppt-v*`), and pushes
4. CI builds, deploys to Cloudflare Pages, and creates a GitHub release

## Configuration Storage

User settings stored in browser localStorage (legacy `openexcel-` prefix):

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
