import type { Protocol } from "devtools-protocol/types/protocol.js";
import { CdpSession, type CdpClient } from "./cdp.js";
import {
  captureSnapshot,
  type Snapshot,
  type SnapshotOptions,
} from "./snapshot.js";

export interface NavigateResult {
  url: string;
}

export interface ClickResult {
  clicked: boolean;
}

export interface TypeResult {
  typed: boolean;
}

export interface ScreenshotResult {
  base64: string;
  format: "png" | "jpeg";
}

export interface PdfResult {
  base64: string;
}

export interface PageInfo {
  url: string;
  title: string;
}

export interface CookieInput {
  name: string;
  value: string;
  url?: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;
}

type CdpSender = CdpClient | CdpSession;

type WaitSelectorState = "visible" | "hidden" | "attached";

const KEY_MAP: Record<string, { key: string; code: string; keyCode: number }> =
  {
    Enter: { key: "Enter", code: "Enter", keyCode: 13 },
    Tab: { key: "Tab", code: "Tab", keyCode: 9 },
    Escape: { key: "Escape", code: "Escape", keyCode: 27 },
    Backspace: { key: "Backspace", code: "Backspace", keyCode: 8 },
    Delete: { key: "Delete", code: "Delete", keyCode: 46 },
    ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
    ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
    ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
    ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
    Home: { key: "Home", code: "Home", keyCode: 36 },
    End: { key: "End", code: "End", keyCode: 35 },
    PageUp: { key: "PageUp", code: "PageUp", keyCode: 33 },
    PageDown: { key: "PageDown", code: "PageDown", keyCode: 34 },
    Space: { key: " ", code: "Space", keyCode: 32 },
  };

const MODIFIER_MAP: Record<
  string,
  { key: string; code: string; keyCode: number; bit: number }
> = {
  Shift: { key: "Shift", code: "ShiftLeft", keyCode: 16, bit: 8 },
  Control: { key: "Control", code: "ControlLeft", keyCode: 17, bit: 4 },
  Ctrl: { key: "Control", code: "ControlLeft", keyCode: 17, bit: 4 },
  Alt: { key: "Alt", code: "AltLeft", keyCode: 18, bit: 1 },
  Meta: { key: "Meta", code: "MetaLeft", keyCode: 91, bit: 2 },
  Cmd: { key: "Meta", code: "MetaLeft", keyCode: 91, bit: 2 },
  Command: { key: "Meta", code: "MetaLeft", keyCode: 91, bit: 2 },
};

function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regex = `^${escaped
    .replace(/\*\*/g, "::DOUBLE_STAR::")
    .replace(/\*/g, "[^/]*")
    .replace(/::DOUBLE_STAR::/g, ".*")}$`;
  return new RegExp(regex);
}

export class Page {
  private session: CdpSender;
  private currentUrl = "";
  private snapshotData: Snapshot | null = null;

  constructor(
    session: CdpSender,
    readonly targetId?: string,
  ) {
    this.session = session;
  }

  get sessionId(): string | undefined {
    return this.session instanceof CdpSession ? this.session.id : undefined;
  }

  async enableDomains(): Promise<void> {
    await Promise.all([
      this.session.send("Page.enable"),
      this.session.send("Page.setLifecycleEventsEnabled", { enabled: true }),
      this.session.send("DOM.enable"),
      this.session.send("Runtime.enable"),
      this.session.send("Network.enable"),
    ]);
  }

  static async attachToFirstPage(cdp: CdpClient): Promise<Page> {
    const { targetInfos } = await cdp.send("Target.getTargets");
    let pageTarget = targetInfos.find(
      (t) => t.type === "page" && t.attached !== true,
    );

    if (!pageTarget) {
      const { targetId } = await cdp.send("Target.createTarget", {
        url: "about:blank",
      });
      const { targetInfos: updated } = await cdp.send("Target.getTargets");
      pageTarget = updated.find((t) => t.targetId === targetId);
    }

    if (!pageTarget) {
      throw new Error("Could not find or create a page target");
    }

    return this.attachToTarget(cdp, pageTarget.targetId);
  }

  static async attachToTarget(cdp: CdpClient, targetId: string): Promise<Page> {
    const { sessionId } = await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });

    const session = cdp.session(sessionId);
    const page = new Page(session, targetId);
    await page.enableDomains();
    return page;
  }

  private ensureLookupTarget(selectorOrRef: string): string {
    if (!selectorOrRef) {
      throw new Error("Missing selector or ref");
    }
    return selectorOrRef;
  }

  resolveRef(ref: string): string | null {
    if (!this.snapshotData) return null;

    let normalized = ref.trim();
    if (normalized.startsWith("@")) normalized = normalized.slice(1);
    if (normalized.startsWith("[") && normalized.endsWith("]")) {
      normalized = normalized.slice(1, -1);
    }
    if (normalized.startsWith("ref=")) normalized = normalized.slice(4);

    return (
      this.snapshotData.xpathMap[normalized] ??
      this.snapshotData.legacyXPathMap[normalized] ??
      null
    );
  }

  private elementLookupExpression(selectorOrRef: string): string {
    const target = this.ensureLookupTarget(selectorOrRef);
    const xpath = this.resolveRef(target);
    if (xpath) {
      return `document.evaluate(${JSON.stringify(
        xpath,
      )}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`;
    }
    if (target.startsWith("xpath=")) {
      const rawXpath = target.slice("xpath=".length);
      return `document.evaluate(${JSON.stringify(
        rawXpath,
      )}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`;
    }
    return `document.querySelector(${JSON.stringify(target)})`;
  }

  private async evaluateInPage<T = unknown>(expression: string): Promise<T> {
    const result = await this.session.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(
        `Evaluation failed: ${result.exceptionDetails.text ?? result.exceptionDetails.exception?.description ?? "unknown error"}`,
      );
    }
    return result.result?.value as T;
  }

  private async getElementCenter(selectorOrRef: string): Promise<{
    x: number;
    y: number;
  } | null> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node || !(node instanceof Element)) return null;
      const rect = node.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    })()`);
  }

  async goto(
    url: string,
    options?: { waitUntil?: string; timeoutMs?: number },
  ): Promise<NavigateResult> {
    const timeout = options?.timeoutMs ?? 30000;
    await this.session.send("Page.navigate", { url });
    this.currentUrl = url;
    await this.waitForLoad(options?.waitUntil ?? "load", timeout);
    return { url: await this.getUrl() };
  }

  async reload(): Promise<NavigateResult> {
    await this.session.send("Page.reload");
    await this.waitForLoad("load", 30000);
    return { url: await this.getUrl() };
  }

  async goBack(): Promise<NavigateResult> {
    const { currentIndex, entries } = await this.session.send(
      "Page.getNavigationHistory",
    );
    if (currentIndex > 0) {
      await this.session.send("Page.navigateToHistoryEntry", {
        entryId: entries[currentIndex - 1].id,
      });
      await this.waitForLoad("load", 30000);
    }
    return { url: await this.getUrl() };
  }

  async goForward(): Promise<NavigateResult> {
    const { currentIndex, entries } = await this.session.send(
      "Page.getNavigationHistory",
    );
    if (currentIndex < entries.length - 1) {
      await this.session.send("Page.navigateToHistoryEntry", {
        entryId: entries[currentIndex + 1].id,
      });
      await this.waitForLoad("load", 30000);
    }
    return { url: await this.getUrl() };
  }

  async getUrl(): Promise<string> {
    const result = await this.session.send("Runtime.evaluate", {
      expression: "window.location.href",
      returnByValue: true,
    });
    this.currentUrl = result.result?.value ?? this.currentUrl;
    return this.currentUrl;
  }

  async getTitle(): Promise<string> {
    const result = await this.session.send("Runtime.evaluate", {
      expression: "document.title",
      returnByValue: true,
    });
    return result.result?.value ?? "";
  }

  async getInfo(): Promise<PageInfo> {
    return { url: await this.getUrl(), title: await this.getTitle() };
  }

  async getText(selectorOrRef?: string): Promise<string> {
    return this.evaluateInPage(
      selectorOrRef && selectorOrRef !== "body"
        ? `(() => {
            const node = ${this.elementLookupExpression(selectorOrRef)};
            return node?.innerText ?? node?.textContent ?? "";
          })()`
        : "document.body.innerText",
    );
  }

  async getHtml(selectorOrRef?: string): Promise<string> {
    return this.evaluateInPage(
      selectorOrRef
        ? `(() => {
            const node = ${this.elementLookupExpression(selectorOrRef)};
            if (!node) return "";
            return node instanceof Element ? node.innerHTML : "";
          })()`
        : "document.documentElement.outerHTML",
    );
  }

  async getValue(selectorOrRef: string): Promise<string> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node) return "";
      return "value" in node ? String(node.value ?? "") : "";
    })()`);
  }

  async getAttribute(
    selectorOrRef: string,
    attribute: string,
  ): Promise<string | null> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) return null;
      return node.getAttribute(${JSON.stringify(attribute)});
    })()`);
  }

  async getCount(selectorOrRef: string): Promise<number> {
    const xpath = this.resolveRef(selectorOrRef);
    if (xpath) return 1;
    if (selectorOrRef.startsWith("xpath=")) {
      return this.evaluateInPage(
        `document.evaluate(${JSON.stringify(
          selectorOrRef.slice("xpath=".length),
        )}, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength`,
      );
    }
    return this.evaluateInPage(
      `document.querySelectorAll(${JSON.stringify(selectorOrRef)}).length`,
    );
  }

  async isVisible(selectorOrRef: string): Promise<boolean> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) return false;
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity || "1") !== 0 && rect.width > 0 && rect.height > 0;
    })()`);
  }

  async isEnabled(selectorOrRef: string): Promise<boolean> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node || !(node instanceof Element)) return false;
      return !("disabled" in node && !!node.disabled) && node.getAttribute("aria-disabled") !== "true";
    })()`);
  }

  async isChecked(selectorOrRef: string): Promise<boolean> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node || !(node instanceof Element)) return false;
      if ("checked" in node) return !!node.checked;
      return node.getAttribute("aria-checked") === "true";
    })()`);
  }

  async snapshot(options?: SnapshotOptions): Promise<Snapshot> {
    this.snapshotData = await captureSnapshot(
      this.session,
      0,
      undefined,
      options,
    );
    return this.snapshotData;
  }

  get lastSnapshot(): Snapshot | null {
    return this.snapshotData;
  }

  async click(
    x: number,
    y: number,
    options?: { button?: string; clickCount?: number },
  ): Promise<ClickResult> {
    const button = (options?.button ?? "left") as Protocol.Input.MouseButton;
    const clickCount = options?.clickCount ?? 1;

    await this.session.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none",
    });

    for (let i = 1; i <= clickCount; i++) {
      await this.session.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x,
        y,
        button,
        clickCount: i,
      });
      await this.session.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x,
        y,
        button,
        clickCount: i,
      });
    }

    return { clicked: true };
  }

  async clickRef(ref: string): Promise<ClickResult> {
    const xpath = this.resolveRef(ref);
    if (!xpath) {
      throw new Error(
        `Unknown ref "${ref}" — run snapshot first to populate refs`,
      );
    }
    const coords = await this.getElementCenter(ref);
    if (!coords) {
      throw new Error(
        `Could not locate element for ref "${ref}" (xpath: ${xpath})`,
      );
    }
    return this.click(coords.x, coords.y);
  }

  async clickSelector(selector: string): Promise<ClickResult> {
    const coords = await this.getElementCenter(selector);
    if (!coords) {
      throw new Error(`Could not locate element for selector "${selector}"`);
    }
    return this.click(coords.x, coords.y);
  }

  async dblclick(selectorOrRef: string): Promise<ClickResult> {
    const coords = await this.getElementCenter(selectorOrRef);
    if (!coords) {
      throw new Error(`Could not locate element: ${selectorOrRef}`);
    }
    return this.click(coords.x, coords.y, { clickCount: 2 });
  }

  async hover(x: number, y: number): Promise<void> {
    await this.session.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none",
    });
  }

  async hoverTarget(selectorOrRef: string): Promise<void> {
    const coords = await this.getElementCenter(selectorOrRef);
    if (!coords) throw new Error(`Could not locate element: ${selectorOrRef}`);
    await this.hover(coords.x, coords.y);
  }

  async scroll(
    x: number,
    y: number,
    deltaX: number,
    deltaY: number,
  ): Promise<void> {
    await this.session.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x,
      y,
      deltaX,
      deltaY,
    });
  }

  async focus(selectorOrRef: string): Promise<void> {
    await this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (node instanceof HTMLElement || node instanceof SVGElement) node.focus();
      return true;
    })()`);
  }

  async check(selectorOrRef: string, checked = true): Promise<void> {
    await this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node || !(node instanceof Element)) throw new Error("Element not found");
      if ("checked" in node) {
        node.checked = ${checked ? "true" : "false"};
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      node.setAttribute("aria-checked", ${JSON.stringify(checked ? "true" : "false")});
      return true;
    })()`);
  }

  async select(selectorOrRef: string, values: string[]): Promise<void> {
    await this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof HTMLSelectElement)) {
        throw new Error("Target is not a <select> element");
      }
      const wanted = new Set(${JSON.stringify(values)});
      for (const option of Array.from(node.options)) {
        option.selected = wanted.has(option.value) || wanted.has(option.text);
      }
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
  }

  async type(text: string, options?: { delay?: number }): Promise<TypeResult> {
    const delay = options?.delay ?? 0;
    const sleep = (ms: number) =>
      ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve();

    for (const ch of text) {
      if (ch === "\n" || ch === "\r") {
        await this.pressKey("Enter");
      } else if (ch === "\t") {
        await this.pressKey("Tab");
      } else {
        const isLetter = /^[a-zA-Z]$/.test(ch);
        const isDigit = /^[0-9]$/.test(ch);
        let key = ch;
        let code: string | undefined;
        let keyCode: number | undefined;

        if (isLetter) {
          code = `Key${ch.toUpperCase()}`;
          keyCode = ch.toUpperCase().charCodeAt(0);
        } else if (isDigit) {
          code = `Digit${ch}`;
          keyCode = ch.charCodeAt(0);
        } else if (ch === " ") {
          key = " ";
          code = "Space";
          keyCode = 32;
        }

        await this.session.send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key,
          code,
          text: ch,
          unmodifiedText: ch,
          windowsVirtualKeyCode: keyCode,
        });
        await this.session.send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key,
          code,
          windowsVirtualKeyCode: keyCode,
        });
      }

      if (delay) await sleep(delay);
    }

    return { typed: true };
  }

  async pressKey(key: string): Promise<void> {
    const tokens = key === "+" ? ["+"] : key.split("+");
    const mainKeyName = tokens[tokens.length - 1];
    const modifierNames = tokens.slice(0, -1);

    let modifiers = 0;

    for (const mod of modifierNames) {
      const info = MODIFIER_MAP[mod];
      if (!info) throw new Error(`Unknown modifier: ${mod}`);
      modifiers |= info.bit;
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: info.key,
        code: info.code,
        windowsVirtualKeyCode: info.keyCode,
        modifiers,
      });
    }

    const mapped = KEY_MAP[mainKeyName];
    if (mapped) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: mapped.key,
        code: mapped.code,
        windowsVirtualKeyCode: mapped.keyCode,
        modifiers,
      });
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: mapped.key,
        code: mapped.code,
        windowsVirtualKeyCode: mapped.keyCode,
        modifiers,
      });
    } else if (mainKeyName.length === 1) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyDown",
        key: mainKeyName,
        text: mainKeyName,
        unmodifiedText: mainKeyName,
        modifiers,
      });
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: mainKeyName,
        modifiers,
      });
    } else {
      throw new Error(`Unknown key: ${mainKeyName}`);
    }

    for (let i = modifierNames.length - 1; i >= 0; i--) {
      const info = MODIFIER_MAP[modifierNames[i]];
      if (!info) continue;
      modifiers &= ~info.bit;
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: info.key,
        code: info.code,
        windowsVirtualKeyCode: info.keyCode,
        modifiers,
      });
    }
  }

  async fill(
    selectorOrRef: string,
    value: string,
    options?: { pressEnter?: boolean },
  ): Promise<void> {
    await this.focus(selectorOrRef);
    await this.pressKey("Ctrl+A");
    await this.type(value);

    if (options?.pressEnter !== false) {
      await this.pressKey("Enter");
    }
  }

  async screenshot(options?: {
    fullPage?: boolean;
    format?: "png" | "jpeg";
    quality?: number;
  }): Promise<ScreenshotResult> {
    const format = options?.format ?? "png";
    const params: Protocol.Page.CaptureScreenshotRequest = {
      format,
      fromSurface: true,
      captureBeyondViewport: options?.fullPage ?? false,
    };

    if (format === "jpeg" && options?.quality !== undefined) {
      params.quality = Math.min(100, Math.max(0, Math.round(options.quality)));
    }

    const { data } = await this.session.send("Page.captureScreenshot", params);
    return { base64: data, format };
  }

  async pdf(): Promise<PdfResult> {
    const { data } = await this.session.send("Page.printToPDF", {
      printBackground: true,
    });
    return { base64: data };
  }

  async evaluate(expression: string): Promise<unknown> {
    return this.evaluateInPage(expression);
  }

  async setViewport(
    width: number,
    height: number,
    options?: { deviceScaleFactor?: number },
  ): Promise<void> {
    await this.session.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: options?.deviceScaleFactor ?? 1,
      mobile: false,
    });
  }

  async setHeaders(headers: Record<string, string>): Promise<void> {
    await this.session.send("Network.setExtraHTTPHeaders", { headers });
  }

  async setOffline(offline: boolean): Promise<void> {
    await this.session.send("Network.emulateNetworkConditions", {
      offline,
      latency: 0,
      downloadThroughput: offline ? 0 : -1,
      uploadThroughput: offline ? 0 : -1,
    });
  }

  async setMedia(
    colorScheme: "dark" | "light" | "no-preference",
  ): Promise<void> {
    await this.session.send("Emulation.setEmulatedMedia", {
      media: "",
      features: [{ name: "prefers-color-scheme", value: colorScheme }],
    });
  }

  async setGeolocation(latitude: number, longitude: number): Promise<void> {
    await this.session.send("Emulation.setGeolocationOverride", {
      latitude,
      longitude,
      accuracy: 1,
    });
  }

  async getCookies(): Promise<Protocol.Network.Cookie[]> {
    const { cookies } = await this.session.send("Network.getCookies");
    return cookies;
  }

  async setCookie(cookie: CookieInput): Promise<boolean> {
    const result = await this.session.send("Network.setCookie", cookie);
    return result.success;
  }

  async clearCookies(): Promise<void> {
    await this.session.send("Network.clearBrowserCookies");
  }

  async getStorage(kind: "local" | "session", key?: string): Promise<unknown> {
    return this.evaluateInPage(`(() => {
      const storage = window.${kind}Storage;
      if (${key ? "true" : "false"}) {
        return storage.getItem(${JSON.stringify(key ?? "")});
      }
      const out = {};
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k != null) out[k] = storage.getItem(k);
      }
      return out;
    })()`);
  }

  async setStorage(
    kind: "local" | "session",
    key: string,
    value: string,
  ): Promise<void> {
    await this.evaluateInPage(
      `window.${kind}Storage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})`,
    );
  }

  async clearStorage(kind: "local" | "session"): Promise<void> {
    await this.evaluateInPage(`window.${kind}Storage.clear()`);
  }

  async waitForLoad(state = "load", timeoutMs = 30000): Promise<void> {
    const target = state.toLowerCase();
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const readyState = await this.evaluateInPage<string>(
        "document.readyState",
      );
      if (
        target === "domcontentloaded" &&
        (readyState === "interactive" || readyState === "complete")
      ) {
        return;
      }
      if (target === "load" && readyState === "complete") return;
      if (target === "networkidle" && readyState === "complete") {
        await new Promise((r) => setTimeout(r, 500));
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for load state: ${state}`);
  }

  async waitForSelector(
    selectorOrRef: string,
    timeoutMs = 30000,
    state: WaitSelectorState = "visible",
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const matched = await this.evaluateInPage<boolean>(`(() => {
        const node = ${this.elementLookupExpression(selectorOrRef)};
        if (${JSON.stringify(state)} === "attached") return !!node;
        if (${JSON.stringify(state)} === "hidden") {
          if (!node || !(node instanceof Element)) return true;
          const style = getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return style.visibility === "hidden" || style.display === "none" || rect.width === 0 || rect.height === 0;
        }
        if (!(node instanceof Element)) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      })()`);
      if (matched) return;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout waiting for selector: ${selectorOrRef}`);
  }

  async waitForText(text: string, timeoutMs = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const bodyText = await this.getText();
      if (bodyText.includes(text)) return;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout waiting for text: ${text}`);
  }

  async waitForUrl(pattern: string, timeoutMs = 30000): Promise<void> {
    const regex = globToRegExp(pattern);
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const url = await this.getUrl();
      if (regex.test(url)) return;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout waiting for URL: ${pattern}`);
  }

  async waitForFunction(expression: string, timeoutMs = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const result = await this.evaluateInPage<boolean>(`!!(${expression})`);
      if (result) return;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error("Timeout waiting for function condition");
  }

  async waitForTimeout(ms: number): Promise<void> {
    await new Promise((r) => setTimeout(r, ms));
  }
}
