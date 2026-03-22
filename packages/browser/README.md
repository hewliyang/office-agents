# @office-agents/browser

Browser-native CDP (Chrome DevTools Protocol) client for cloud browser automation. **Zero Node.js dependencies** — works in any browser context including Office Add-in taskpanes.

## Architecture

The core primitive is a **CDP WebSocket URL**. Any provider that gives you one works:

```
Your browser (Office taskpane, web app, etc.)
  → WebSocket to wss://<provider-cdp-endpoint>
  → CDP JSON-RPC messages
  → Cloud browser instance
```

## Providers

The `BrowserProvider` interface abstracts session creation. The CDP URL is the universal handoff point — any cloud browser provider that exposes CDP works.

| Provider | Status |
|----------|--------|
| [Browserbase](https://browserbase.com) | ✅ Built-in |
| [Browser Use](https://browser-use.com) | ✅ Built-in |
| Any CDP URL | ✅ `Browser.connect()` |
| Custom | ✅ Implement `BrowserProvider` |

## Usage

### With Browserbase

```typescript
import { Browser, BrowserbaseProvider } from "@office-agents/browser";

const provider = new BrowserbaseProvider({
  apiKey: "bb-api-...",
  projectId: "proj-...",
});

const browser = await Browser.launch({ provider });

// Navigate
await browser.page.goto("https://example.com");

// Get the simplified page snapshot with stable element refs
const snapshot = await browser.page.snapshot();
console.log(snapshot.tree);
// Example output from https://example.com on 2026-03-22:
// - div
//   - heading "Example Domain" [ref=e1]
//   - paragraph
//     - StaticText "This domain is for use in documentation examples without needing permission. Avoid use in operations."
//   - paragraph
//     - link "Learn more" [ref=e2]

// Click by ref from snapshot
await browser.page.clickRef("e2");

// Screenshot
const { base64 } = await browser.page.screenshot();

// Type text
await browser.page.type("hello world");

// Press keys
await browser.page.pressKey("Enter");
await browser.page.pressKey("Cmd+A");

// Evaluate JavaScript
const title = await browser.page.evaluate("document.title");

// Clean up
await browser.close();
```

### With Browser Use

```typescript
import { Browser, BrowserUseProvider } from "@office-agents/browser";

const provider = new BrowserUseProvider({
  apiKey: "bu-api-...",
});

const browser = await Browser.launch({
  provider,
  cdpOptions: { requestTimeoutMs: 10_000 },
});

await browser.page.goto("https://example.com");
const snapshot = await browser.page.snapshot();
console.log(snapshot.tree);
await browser.close();
```

### With any CDP URL

```typescript
import { Browser } from "@office-agents/browser";

const browser = await Browser.connect({
  cdpUrl: "wss://some-provider.com/cdp?token=...",
});

await browser.page.goto("https://example.com");
await browser.close();
```

### Low-level CDP access

```typescript
import { CdpClient } from "@office-agents/browser";

const cdp = await CdpClient.connect("wss://...", {
  requestTimeoutMs: 10_000,
});

// Root/browser-scoped commands work directly on the client
const { targetInfos } = await cdp.api.Target.getTargets();
console.log(targetInfos.length);

// Attach to a page target for Page.* / Runtime.* domains
const page = await cdp.attachToFirstPage();
const session = page.cdpSession!;

await session.api.Page.navigate({ url: "https://example.com" });

session.api.Page.on("loadEventFired", () => {
  console.log("Page loaded");
});

const evalResult = await session.api.Runtime.evaluate({
  expression: "document.title",
  returnByValue: true,
});
console.log(evalResult.result?.value);

const { data } = await session.api.Page.captureScreenshot({ format: "png" });

await cdp.close();
```

## API

### Browser

- `Browser.launch({ provider, sessionOptions?, cdpOptions? })` — Create a cloud browser session via provider and auto-attach to the first page target
- `Browser.connect({ cdpUrl, cdpOptions? })` — Connect directly to any CDP WebSocket URL and auto-attach to the first page target
- `browser.page` — The active `Page` instance
- `browser.close()` — Close browser and release session

### CdpClient

- `CdpClient.connect(wsUrl, { requestTimeoutMs? })` — Connect to a CDP WebSocket
- `cdp.send("Target.getTargets")` — Send typed root/browser-scoped CDP commands using method strings from `devtools-protocol`
- `cdp.api.Target.getTargets()` — Generated domain proxy API typed from `devtools-protocol/types/protocol-proxy-api`
- `cdp.attachToFirstPage()` / `cdp.attachToTarget(targetId)` — Ergonomic helpers that attach to a page target and return a `Page`
- `cdp.releaseSession(sessionId)` — Drop a detached target session from the local session cache

### Page

**Navigation:**
- `page.goto(url, { waitUntil?, timeoutMs? })` — Navigate to URL
- `page.reload()` — Reload page
- `page.goBack()` / `page.goForward()` — History navigation

**State:**
- `page.snapshot()` — Simplified accessibility/DOM snapshot with refs like `e1`, `e2`
- `page.screenshot({ fullPage?, format?, quality? })` — Visual screenshot as base64
- `page.getUrl()` / `page.getTitle()` / `page.getInfo()`
- `page.getText(selector?)` / `page.getHtml(selector?)`

**Interaction:**
- `page.clickRef(ref)` — Click element by ref from snapshot
- `page.cdpSession` — The attached target session when the page came from `Browser` or `cdp.attachTo...()`
- `page.click(x, y, { button?, clickCount? })` — Click at coordinates
- `page.type(text, { delay? })` — Type text
- `page.pressKey(key)` — Press key or combo (`"Enter"`, `"Cmd+A"`, `"Ctrl+C"`)
- `page.fill(selector, value, { pressEnter? })` — Fill input field
- `page.hover(x, y)` — Hover at coordinates
- `page.scroll(x, y, deltaX, deltaY)` — Scroll

**Other:**
- `page.evaluate(expression)` — Execute JavaScript in page
- `page.setViewport(width, height, { deviceScaleFactor? })`
- `page.waitForSelector(selector, timeoutMs?)`
- `page.waitForTimeout(ms)`

### BrowserProvider

Implement this interface to add a new cloud browser provider:

```typescript
interface BrowserProvider {
  name: string;
  createSession(options?: CreateSessionOptions): Promise<BrowserSession>;
  closeSession(sessionId: string): Promise<void>;
}

interface BrowserSession {
  cdpUrl: string;     // The WebSocket URL — the universal primitive
  sessionId: string;
  metadata?: Record<string, any>;
}
```

## How it works

The high-level `browse` command shape and CLI ergonomics are adapted from [`vercel-labs/agent-browser`](https://github.com/vercel-labs/agent-browser), while the implementation here is rewritten around direct CDP calls and **browser-native `WebSocket`** transport instead of a Node-specific client.

A quick live sanity check on 2026-03-22 against Browser Use + `https://example.com` produced this snapshot:

```text
- div
  - heading "Example Domain" [ref=e1]
  - paragraph
    - StaticText "This domain is for use in documentation examples without needing permission. Avoid use in operations."
  - paragraph
    - link "Learn more" [ref=e2]
```

Every command maps to CDP protocol calls:

| Command | CDP Methods |
|---------|------------|
| `goto` | `Page.navigate` |
| `click` | `Input.dispatchMouseEvent` |
| `type` | `Input.dispatchKeyEvent` |
| `screenshot` | `Page.captureScreenshot` |
| `snapshot` | `Accessibility.getFullAXTree` + `DOM.getDocument` |
| `evaluate` | `Runtime.evaluate` |
| `viewport` | `Emulation.setDeviceMetricsOverride` |
| `back/forward` | `Page.getNavigationHistory` + `Page.navigateToHistoryEntry` |
