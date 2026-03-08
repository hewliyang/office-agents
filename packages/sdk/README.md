# @office-agents/sdk

Headless SDK for building AI-powered Microsoft Office Add-ins. Provides an agent runtime, tool system, virtual filesystem, session storage, and multi-provider LLM integration — all running in the browser.

> **Browser-only** — this package targets browser environments (Office Add-ins, SPAs). It uses IndexedDB, localStorage, and the DOM.

## Install

```bash
npm install @office-agents/sdk
```

## Overview

The SDK is organized into several modules:

| Module | Description |
| --- | --- |
| **Runtime** | `AgentRuntime` — manages agent lifecycle, streaming, model resolution, sessions |
| **Tools** | `defineTool`, `bashTool`, `readTool` — define and register tools for the agent |
| **VFS** | Virtual filesystem with bash shell (`just-bash`) — file uploads, custom commands |
| **Storage** | IndexedDB-backed session persistence, VFS file storage |
| **Provider Config** | Multi-provider LLM configuration (OpenAI, Anthropic, Google, etc.) |
| **OAuth** | PKCE OAuth flow helpers for provider authentication |
| **Skills** | Installable skill system (prompt snippets + files) |
| **Web** | Web search and fetch with pluggable providers |
| **Sandbox** | `SES`-based sandboxed JavaScript evaluation |

## Quick Start

### 1. Define a tool

```typescript
import { defineTool, toolSuccess, toolError } from "@office-agents/sdk";
import { Type } from "@sinclair/typebox";

const greetTool = defineTool({
  name: "greet",
  label: "Greet",
  description: "Greet someone by name",
  parameters: Type.Object({
    name: Type.String({ description: "Name to greet" }),
  }),
  execute: async (toolCallId, params) => {
    return toolSuccess({ message: `Hello, ${params.name}!` });
  },
});
```

### 2. Create a RuntimeAdapter

The `RuntimeAdapter` interface connects your app to the agent runtime:

```typescript
import type { RuntimeAdapter } from "@office-agents/sdk";

const adapter: RuntimeAdapter = {
  tools: [greetTool],

  buildSystemPrompt: (skills) => {
    return "You are a helpful assistant. Use tools when appropriate.";
  },

  getDocumentId: async () => {
    return "my-document-id"; // unique ID for session scoping
  },

  // Optional: inject context into each message
  getDocumentMetadata: async () => ({
    metadata: { title: "My Document", sheets: ["Sheet1"] },
  }),

  // Optional: react to tool results (e.g., navigate to a cell)
  onToolResult: (toolCallId, result, isError) => {
    console.log("Tool result:", result);
  },
};
```

### 3. Initialize the runtime

```typescript
import { AgentRuntime } from "@office-agents/sdk";

const runtime = new AgentRuntime(adapter);

// Subscribe to state changes
runtime.subscribe((state) => {
  console.log("Messages:", state.messages.length);
  console.log("Streaming:", state.isStreaming);
});

// Initialize (loads saved config, restores session)
await runtime.init();

// Send a message
await runtime.sendMessage("Hello, who are you?");
```

### 4. Virtual filesystem & bash

The SDK includes an in-memory virtual filesystem with a bash shell:

```typescript
import { writeFile, readFile, getBash, setCustomCommands } from "@office-agents/sdk";

// Write files to VFS
writeFile("/home/user/data.csv", "name,age\nAlice,30\nBob,25");

// Read files
const content = readFile("/home/user/data.csv"); // string | null

// Execute bash commands
const bash = getBash();
const result = bash.exec("ls /home/user/");

// Register custom commands (e.g., csv-to-sheet, pdf-to-text)
setCustomCommands(() => [
  {
    name: "my-command",
    execute: async (args, vfs) => {
      return { stdout: "done", stderr: "", exitCode: 0 };
    },
  },
]);
```

### 5. Provider configuration

```typescript
import { loadSavedConfig, saveConfig, type ProviderConfig } from "@office-agents/sdk";

// Load saved config from localStorage
const config = loadSavedConfig();

// Save a new config
saveConfig({
  provider: "openai",
  apiKey: "sk-...",
  model: "gpt-4o",
  useProxy: false,
  proxyUrl: "",
  thinking: "none",
  followMode: true,
  apiType: "key",
  customBaseUrl: "",
  authMethod: "key",
});
```

### 6. Sessions

```typescript
import {
  createSession,
  listSessions,
  getSession,
  saveSession,
  deleteSession,
  configureNamespace,
} from "@office-agents/sdk";

// Set namespace (scopes storage to a document)
configureNamespace({
  dbName: "MyOfficeAppDB",
  dbVersion: 1,
  localStoragePrefix: "my-office-app",
  documentSettingsPrefix: "my-office-app",
});

// Create and manage sessions
const session = await createSession("My Chat");
const sessions = await listSessions();
await deleteSession(session.id);
```

### 7. Skills

Skills are installable prompt snippets with optional files:

```typescript
import { addSkill, getInstalledSkills, removeSkill, buildSkillsPromptSection } from "@office-agents/sdk";

// Install a skill
await addSkill({
  name: "data-analysis",
  content: "When analyzing data, always start by summarizing the dataset...",
  description: "Data analysis best practices",
});

// Build the skills section for the system prompt
const skills = await getInstalledSkills();
const promptSection = buildSkillsPromptSection(skills);
```

## API Reference

### Runtime

- **`AgentRuntime`** — Main class. Manages agent lifecycle, streaming, config, sessions, file uploads, and skills.
- **`RuntimeAdapter`** — Interface your app implements to provide tools, system prompt, document ID, and metadata.
- **`RuntimeState`** — Observable state object (messages, streaming status, sessions, uploads, etc.).

### Tools

- **`defineTool(config)`** — Create a typed tool with name, description, parameters (TypeBox schema), and execute function.
- **`toolSuccess(data)`** / **`toolError(message)`** / **`toolText(text)`** — Helper functions to build tool results.
- **`bashTool`** — Built-in tool: execute bash commands in the VFS.
- **`readTool`** — Built-in tool: read files from the VFS with offset/limit support.

### VFS

- **`writeFile(path, content)`** / **`readFile(path)`** / **`deleteFile(path)`** — File operations.
- **`getBash()`** — Get the bash shell instance.
- **`setCustomCommands(fn)`** — Register custom bash commands.
- **`snapshotVfs()`** / **`restoreVfs(snapshot)`** — Snapshot and restore VFS state.
- **`setStaticFiles(files)`** — Mount read-only files (e.g., API docs).

### Storage

- **`configureNamespace(config)`** — Configure storage namespacing before creating the runtime.
  Available fields:
  `dbName`, `dbVersion`, `localStoragePrefix`, `documentSettingsPrefix`, `documentIdSettingsKey`.
- **`createSession(title)`** / **`saveSession(session)`** / **`deleteSession(id)`** — Session CRUD.
- **`loadVfsFiles(sessionId)`** / **`saveVfsFiles(sessionId, files)`** — Persist VFS files per session.

### Provider Config

- **`loadSavedConfig()`** / **`saveConfig(config)`** — Read/write provider settings from localStorage.
- **`buildCustomModel(config)`** — Build a model instance from a custom base URL config.
- **`applyProxyToModel(model, config)`** — Apply proxy URL to a model.

### OAuth

- **`generatePKCE()`** — Generate PKCE code verifier + challenge.
- **`buildAuthorizationUrl(provider, ...)`** / **`exchangeOAuthCode(...)`** / **`refreshOAuthToken(...)`** — Full OAuth flow.

### Web

- **`searchWeb(query, options)`** / **`searchImages(query, options)`** — Web search with pluggable providers.
- **`fetchWeb(url, options)`** — Fetch and extract web page content.

## Used By

- **[@office-agents/excel](https://github.com/hewliyang/open-excel/tree/main/packages/excel)** — Excel Add-in with AI chat
- **[@office-agents/powerpoint](https://github.com/hewliyang/open-excel/tree/main/packages/powerpoint)** — PowerPoint Add-in with AI chat

## License

MIT
