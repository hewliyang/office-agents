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
pnpm bridge:stop
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
office-bridge tool excel screenshot_range --input '{"sheetId":1,"range":"A1:F20"}' --out range.png
office-bridge screenshot word --pages 1 --out page1.png
office-bridge screenshot excel --sheet-id 1 --range A1:F20 --out range.png
office-bridge screenshot powerpoint --slide-index 0 --out slide1.png
office-bridge vfs ls word /home/user
office-bridge vfs pull word /home/user/uploads/report.docx ./report.docx
office-bridge vfs push word ./local.txt /home/user/uploads/local.txt
```

If the bridge is already running, `pnpm bridge:serve` / `office-bridge serve` will report the existing healthy server instead of failing with `EADDRINUSE`.

To stop the bridge from another shell:

```bash
office-bridge stop
# or
pnpm bridge:stop
```

## Exec modes

`office-bridge exec` uses unsafe direct evaluation by default so development agents can access the full taskpane runtime, browser globals, and Office host objects without going through `sandboxedEval()`.

Use `--sandbox` if you explicitly want to run through the app's existing raw Office.js tool (`eval_officejs` / `execute_office_js`).

## Screenshot commands

Use `screenshot` for a simpler image-to-file workflow:

```bash
office-bridge screenshot word --pages 1 --out page1.png
office-bridge screenshot excel --sheet-id 1 --range A1:F20 --out range.png
office-bridge screenshot powerpoint --slide-index 0 --out slide1.png
```

The CLI strips image base64 from printed JSON output, so screenshot commands don't flood stdout or model context windows.

You can also save image-returning tool calls directly with `--out`:

```bash
office-bridge tool excel screenshot_range --input '{"sheetId":1,"range":"A1:F20"}' --out range.png
```

## VFS commands

The bridge can move files between the add-in VFS and your local filesystem:

```bash
office-bridge vfs ls word /home/user
office-bridge vfs pull word /home/user/uploads/report.docx ./report.docx
office-bridge vfs push word ./notes.txt /home/user/uploads/notes.txt
office-bridge vfs rm word /home/user/uploads/notes.txt
```

`vfs ls` currently enumerates files via a VFS snapshot in the add-in runtime, so it is meant for development/debugging rather than high-performance file browsing.

## Browser integration

Apps import `startOfficeBridge()` from `@office-agents/bridge/client` and pass the current `AppAdapter`.

The client auto-enables on `localhost` by default. You can override with:

- query: `?office_bridge=1`
- query URL override: `?office_bridge_url=wss://localhost:4017/ws`
- localStorage: `office-agents-bridge-enabled`
- localStorage URL: `office-agents-bridge-url`
