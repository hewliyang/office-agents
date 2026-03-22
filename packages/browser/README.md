# @office-agents/browser

Browser-native CDP (Chrome DevTools Protocol) client for cloud browser automation. **Zero Node.js dependencies** — works in any browser context including Office Add-in taskpanes.

## Architecture

The core primitive is a **CDP WebSocket URL**. Any provider that gives you one works:

```
Your browser (Office taskpane, web app, etc.)
  → WebSocket to wss://connect.browserbase.com/?signingKey=...
  → CDP JSON-RPC messages
  → Cloud Chrome instance
```

## Providers

The `BrowserProvider` interface abstracts session creation. The CDP URL is the universal handoff point — any cloud browser provider that exposes CDP works.

| Provider | Status | Notes |
|----------|--------|-------|
| [Browserbase](https://browserbase.com) | ✅ Built-in | Anti-bot stealth, CAPTCHA solving, residential proxies |
| [Browser Use](https://browser-use.com) | ✅ Built-in | Cloud browser with proxy support, session profiles |
| Any CDP URL | ✅ `Browser.connect()` | Direct WebSocket connection |
| Custom | ✅ Implement `BrowserProvider` | Just return a `cdpUrl` from `createSession()` |

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

// Get accessibility tree with element refs
const snapshot = await browser.page.snapshot();
console.log(snapshot.tree);
// [0-1] document: Example Domain
//   [0-5] heading: Example Domain
//   [0-8] paragraph: This domain is for use in...
//   [0-12] link: More information...

// Click by ref from snapshot
await browser.page.clickRef("0-12");

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

const browser = await Browser.launch({ provider });
await browser.page.goto("https://example.com");
// ... same API as Browserbase
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

const cdp = await CdpClient.connect("wss://...");

// Send any CDP command
await cdp.send("Page.navigate", { url: "https://example.com" });

// Listen for events
cdp.on("Page.loadEventFired", (params) => {
  console.log("Page loaded");
});

// Screenshot
const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });

await cdp.close();
```

## API

### Browser

- `Browser.launch({ provider, sessionOptions? })` — Create a cloud browser session via provider
- `Browser.connect({ cdpUrl })` — Connect directly to any CDP WebSocket URL
- `browser.page` — The active `Page` instance
- `browser.close()` — Close browser and release session

### Page

**Navigation:**
- `page.goto(url, { waitUntil?, timeoutMs? })` — Navigate to URL
- `page.reload()` — Reload page
- `page.goBack()` / `page.goForward()` — History navigation

**State:**
- `page.snapshot()` — Accessibility tree with element refs (preferred for agents)
- `page.screenshot({ fullPage?, format?, quality? })` — Visual screenshot as base64
- `page.getUrl()` / `page.getTitle()` / `page.getInfo()`
- `page.getText(selector?)` / `page.getHtml(selector?)`

**Interaction:**
- `page.clickRef(ref)` — Click element by ref from snapshot (e.g. `"0-5"`, `"@0-5"`)
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

This package is a direct port of the command set from [`@browserbasehq/browse-cli`](https://github.com/browserbase/stagehand/tree/main/packages/cli), rewritten to use **browser-native `WebSocket`** instead of the Node.js `ws` library.

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
