# Office Agents

Office Agents is a monorepo of Microsoft Office Add-ins with integrated AI chat panels. Each add-in connects to major LLM providers using your own credentials (BYOK) and can read/write documents through built-in tools, a sandboxed shell, and a virtual filesystem.

https://github.com/user-attachments/assets/50f3ba42-4daa-49d8-b31e-bae9be6e225b

## Packages

| Package                                              | Description                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`@office-agents/sdk`](./packages/sdk)               | Headless SDK — agent runtime, tools, storage, VFS, skills, OAuth, web search         |
| [`@office-agents/core`](./packages/core)             | Chat UI (Svelte 5) — re-exports SDK + chat components, settings, sessions            |
| [`@office-agents/bridge`](./packages/bridge)         | Local HTTPS/WebSocket RPC bridge + CLI for inspecting a live Office add-in runtime   |
| [`@office-agents/excel`](./packages/excel)           | Excel Add-in — spreadsheet tools, Office.js wrappers, system prompt                  |
| [`@office-agents/powerpoint`](./packages/powerpoint) | PowerPoint Add-in — slide/OOXML tools, Office.js wrappers, system prompt             |
| [`@office-agents/word`](./packages/word)             | Word Add-in — document text/structure/OOXML tools, Office.js wrappers, system prompt |

See each package's README for install instructions and tool documentation.

## Skills

You can install skills from:

- a single `SKILL.md` file, or
- a folder that contains `SKILL.md`.

Manage skills from the Settings tab.

## Providers

- API key (BYOK): OpenAI, Anthropic, Google, Azure, OpenRouter, Groq, xAI, Cerebras, Mistral, etc.
- OAuth: Anthropic (Claude Pro/Max), OpenAI Codex (ChatGPT Plus/Pro)
- Custom endpoint: OpenAI-compatible APIs (Ollama, vLLM, LMStudio, ...)

## Configuration

In **Settings** you can configure:

- Provider, model, and auth method
- CORS proxy
- Thinking level
- Skills
- Web search/fetch providers and API keys

### Web search/fetch credentials

Configure web provider credentials in the Settings UI.

Supported providers:

- DuckDuckGo; search (free, but will rate limit easily)
- Brave; search
- Serper; search
- Exa; search, fetch

More often than not, `basic` fetch is good enough but requires a CORS proxy configured.

## Development

> [!NOTE]
> This project is **not production-ready** and is not intended for publication to the Microsoft Add-in Store. Think of it as a framework and reference for building your own Office-based agents. That said, I'm happy to squash bugs — feel free to report them in [Issues](https://github.com/hewliyang/office-agents/issues).

```bash
pnpm install                # Install all dependencies
pnpm dev-server:excel       # Start Excel dev server (https://localhost:3000)
pnpm dev-server:ppt         # Start PowerPoint dev server (https://localhost:3001)
pnpm dev-server:word        # Start Word dev server (https://localhost:3002)
pnpm start:excel            # Launch Excel with add-in sideloaded
pnpm start:ppt              # Launch PowerPoint with add-in sideloaded
pnpm start:word             # Launch Word with add-in sideloaded
pnpm build                  # Build all packages
pnpm typecheck              # TypeScript type checking (all packages)
pnpm lint                   # Run Biome linter
pnpm format                 # Format code with Biome
pnpm check                  # Typecheck + lint
pnpm validate               # Validate Office manifests
```

### Office Bridge

During development, the Office taskpane auto-connects to a local bridge server. Use the bridge CLI to inspect the live add-in runtime, run tools, and manage VFS files:

```bash
pnpm bridge:serve                                    # Start the bridge server (https://localhost:4017)
pnpm bridge:stop                                     # Stop the bridge server
pnpm exec office-bridge list                         # List connected sessions
pnpm exec office-bridge inspect word                 # Inspect a session's tools & metadata
pnpm exec office-bridge tool word get_document_text  # Run a tool against the live add-in
pnpm exec office-bridge screenshot word --out p.png  # Screenshot a document page
pnpm exec office-bridge vfs ls word /home/user       # Browse the VFS
```

`exec` can run arbitrary JavaScript directly inside the Office taskpane — useful for debugging and closing the agentic dev loop

```bash
# Read the active Word document body text
pnpm exec office-bridge exec word --code \
  "const body = context.document.body; body.load('text'); await context.sync(); return body.text;"

# Poke at taskpane globals / DOM
pnpm exec office-bridge exec word --code "return { href: window.location.href, title: document.title }"
```

See [`packages/bridge/README.md`](./packages/bridge/README.md) for full CLI documentation.

## License

MIT
