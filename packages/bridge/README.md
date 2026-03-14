# @office-agents/bridge

Local development bridge for Office add-ins.

It lets a running add-in connect back to a local HTTPS/WebSocket server so external tools and CLIs can invoke real Office.js operations inside Excel, PowerPoint, or Word.

## What it does

- keeps a live registry of connected add-in sessions
- exposes session metadata and recent bridge events
- lets you invoke any registered add-in tool remotely
- supports raw Office.js execution through each app's escape-hatch tool
- forwards console messages, window errors, and unhandled promise rejections

## Start the bridge

```bash
pnpm bridge:serve
```

Or run the bridge CLI through the root script:

```bash
pnpm bridge -- list
pnpm bridge -- exec word --code "const body = context.document.body; body.load('text'); await context.sync(); return body.text;"
```

Package-local equivalents:

```bash
pnpm --filter @office-agents/bridge start
pnpm --filter @office-agents/bridge run cli -- list
```

The server defaults to:

- HTTPS API: `https://localhost:4017`
- WebSocket: `wss://localhost:4017/ws`

It expects the Office Add-in dev cert files at:

- `~/.office-addin-dev-certs/localhost.crt`
- `~/.office-addin-dev-certs/localhost.key`

Override with:

- `OFFICE_BRIDGE_CERT`
- `OFFICE_BRIDGE_KEY`

## CLI usage

```bash
office-bridge list
office-bridge inspect word
office-bridge metadata excel
office-bridge events word --limit 20
office-bridge exec word --code "return { href: window.location.href, title: document.title }"
office-bridge exec word --sandbox --code "const body = context.document.body; body.load('text'); await context.sync(); return body.text;"
office-bridge tool excel screenshot_range --input '{"sheetId":1,"range":"A1:F20"}'
```

## Exec modes

`office-bridge exec` uses unsafe direct evaluation by default so development agents can access the full taskpane runtime, browser globals, and Office host objects without going through `sandboxedEval()`.

Use `--sandbox` if you explicitly want to run through the app's existing raw Office.js tool (`eval_officejs` / `execute_office_js`).

## Browser integration

Apps import `startOfficeBridge()` from `@office-agents/bridge/client` and pass the current `AppAdapter`.

The client auto-enables on `localhost` by default. You can override with:

- query: `?office_bridge=1`
- query URL override: `?office_bridge_url=wss://localhost:4017/ws`
- localStorage: `office-agents-bridge-enabled`
- localStorage URL: `office-agents-bridge-url`
