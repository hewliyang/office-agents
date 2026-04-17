import type { Protocol } from "devtools-protocol/types/protocol.js";
import { type CdpClient, CdpSession } from "./cdp.js";
import {
  htmlFragmentToMarkdown,
  htmlToMarkdown,
  type MarkdownContentResult,
} from "./markdown.js";
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

export interface BoxResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UploadedFile {
  name: string;
  type?: string;
  base64: string;
}

export interface PageInfo {
  url: string;
  title: string;
}

export interface MarkdownResult extends MarkdownContentResult {
  url: string;
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

type WaitSelectorState = "visible" | "hidden" | "attached" | "detached";

type FindLocator =
  | {
      kind:
        | "role"
        | "text"
        | "label"
        | "placeholder"
        | "alt"
        | "title"
        | "testid";
      value: string;
      exact?: boolean;
      name?: string;
    }
  | {
      kind: "nth";
      selector: string;
      index: number;
    };

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

const DEVICE_DESCRIPTORS: Record<
  string,
  {
    width: number;
    height: number;
    deviceScaleFactor: number;
    mobile: boolean;
    userAgent: string;
    hasTouch?: boolean;
  }
> = {
  "iphone 14": {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  },
  "iphone 15": {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  "iphone 15 pro": {
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    mobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  ipad: {
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    mobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  "pixel 7": {
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    mobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  },
};

export class Page {
  private session: CdpSender;
  private currentUrl = "";
  private snapshotData: Snapshot | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private extraHeaders: Record<string, string> = {};

  constructor(
    session: CdpSender,
    readonly targetId?: string,
  ) {
    this.session = session;
  }

  get sessionId(): string | undefined {
    return this.session instanceof CdpSession ? this.session.id : undefined;
  }

  get cdpSession(): CdpSession | undefined {
    return this.session instanceof CdpSession ? this.session : undefined;
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

    return Page.attachToTarget(cdp, pageTarget.targetId);
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

  private locatorExpression(locator: FindLocator): string {
    return `(() => {
      const locator = ${JSON.stringify(locator)};
      const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
      const matchesText = (actual, expected, exact) => {
        const a = normalize(actual);
        const e = normalize(expected);
        if (!e) return false;
        return exact ? a === e : a.toLowerCase().includes(e.toLowerCase());
      };
      const isVisible = (node) => {
        if (!(node instanceof Element)) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity || "1") !== 0 && rect.width > 0 && rect.height > 0;
      };
      const implicitRole = (el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === "a" && el.hasAttribute("href")) return "link";
        if (tag === "button") return "button";
        if (tag === "select") return "combobox";
        if (tag === "textarea") return "textbox";
        if (tag === "img") return "img";
        if (tag === "summary") return "button";
        if (tag === "option") return "option";
        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();
          if (["button", "submit", "reset"].includes(type)) return "button";
          if (type === "checkbox") return "checkbox";
          if (type === "radio") return "radio";
          if (["email", "search", "tel", "text", "url", "password", "number"].includes(type)) return "textbox";
        }
        return null;
      };
      const getRole = (el) => normalize(el.getAttribute("role") || implicitRole(el) || "").toLowerCase();
      const getName = (el) => {
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel) return ariaLabel;
        const labelledBy = el.getAttribute("aria-labelledby");
        if (labelledBy) {
          const text = labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent || "")
            .join(" ")
            .trim();
          if (text) return text;
        }
        if (el instanceof HTMLInputElement && ["button", "submit", "reset"].includes((el.type || "").toLowerCase())) {
          return el.value || el.getAttribute("value") || "";
        }
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
          const labels = Array.from(el.labels || []).map((label) => label.textContent || "").join(" ").trim();
          if (labels) return labels;
        }
        return el.innerText || el.textContent || el.getAttribute("title") || el.getAttribute("alt") || "";
      };
      const candidates = Array.from(document.querySelectorAll("*"));
      const visible = candidates.filter((node) => isVisible(node));
      const byRole = () => visible.find((node) => {
        if (getRole(node) !== locator.value.toLowerCase()) return false;
        if (locator.kind !== "role") return false;
        if (!locator.name) return true;
        return matchesText(getName(node), locator.name, !!locator.exact);
      }) || null;
      const byText = () => visible.find((node) => matchesText(node.innerText || node.textContent || "", locator.value, !!locator.exact)) || null;
      const byLabel = () => {
        const labels = Array.from(document.querySelectorAll("label"));
        for (const label of labels) {
          if (!matchesText(label.innerText || label.textContent || "", locator.value, !!locator.exact)) continue;
          const control = label.control || label.querySelector("input,textarea,select,button");
          if (control instanceof Element) return control;
        }
        return null;
      };
      const byPlaceholder = () => visible.find((node) => (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) && matchesText(node.getAttribute("placeholder") || "", locator.value, !!locator.exact)) || null;
      const byAlt = () => visible.find((node) => matchesText(node.getAttribute("alt") || "", locator.value, !!locator.exact)) || null;
      const byTitle = () => visible.find((node) => matchesText(node.getAttribute("title") || "", locator.value, !!locator.exact)) || null;
      const byTestId = () => visible.find((node) => matchesText(node.getAttribute("data-testid") || "", locator.value, !!locator.exact)) || null;
      const byNth = () => {
        if (locator.kind !== "nth") return null;
        const nodes = Array.from(document.querySelectorAll(locator.selector));
        if (!nodes.length) return null;
        const index = locator.index < 0 ? nodes.length + locator.index : locator.index;
        return (nodes[index] instanceof Element ? nodes[index] : null) || null;
      };
      switch (locator.kind) {
        case "role":
          return byRole();
        case "text":
          return byText();
        case "label":
          return byLabel();
        case "placeholder":
          return byPlaceholder();
        case "alt":
          return byAlt();
        case "title":
          return byTitle();
        case "testid":
          return byTestId();
        case "nth":
          return byNth();
        default:
          return null;
      }
    })()`;
  }

  private async getLocatorCenter(
    locator: FindLocator,
  ): Promise<BoxResult | null> {
    return this.evaluateInPage(`(() => {
      const node = ${this.locatorExpression(locator)};
      if (!(node instanceof Element)) return null;
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);
  }

  private async locatorText(locator: FindLocator): Promise<string> {
    return this.evaluateInPage(`(() => {
      const node = ${this.locatorExpression(locator)};
      if (!(node instanceof Element)) throw new Error("Element not found");
      return node.innerText || node.textContent || "";
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

  async getMarkdown(selectorOrRef?: string): Promise<MarkdownResult> {
    const url = await this.getUrl();
    if (selectorOrRef) {
      const html = await this.getHtml(selectorOrRef);
      const text = htmlFragmentToMarkdown(html);
      return {
        url,
        title: await this.getTitle(),
        text,
        metadata: { URL: url, Scope: selectorOrRef },
      };
    }

    const html = await this.getHtml();
    return { url, ...htmlToMarkdown(url, html) };
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
    this.mouseX = x;
    this.mouseY = y;

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
    this.mouseX = x;
    this.mouseY = y;
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
    this.mouseX = x;
    this.mouseY = y;
    await this.session.send("Input.dispatchMouseEvent", {
      type: "mouseWheel",
      x,
      y,
      deltaX,
      deltaY,
    });
  }

  async mouseDown(button: Protocol.Input.MouseButton = "left"): Promise<void> {
    await this.session.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: this.mouseX,
      y: this.mouseY,
      button,
      clickCount: 1,
    });
  }

  async mouseUp(button: Protocol.Input.MouseButton = "left"): Promise<void> {
    await this.session.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: this.mouseX,
      y: this.mouseY,
      button,
      clickCount: 1,
    });
  }

  async mouseWheel(deltaY: number, deltaX = 0): Promise<void> {
    await this.scroll(this.mouseX, this.mouseY, deltaX, deltaY);
  }

  async scrollDirection(
    direction: "up" | "down" | "left" | "right",
    amount = 300,
    selector?: string,
  ): Promise<void> {
    const delta = Math.abs(amount);
    const deltaX =
      direction === "left" ? -delta : direction === "right" ? delta : 0;
    const deltaY =
      direction === "up" ? -delta : direction === "down" ? delta : 0;
    if (selector) {
      await this.evaluateInPage(`(() => {
        const node = ${this.elementLookupExpression(selector)};
        if (!(node instanceof Element)) throw new Error("Scrollable element not found");
        node.scrollBy({ left: ${deltaX}, top: ${deltaY}, behavior: "auto" });
        return true;
      })()`);
      return;
    }

    await this.evaluateInPage(
      `window.scrollBy({ left: ${deltaX}, top: ${deltaY}, behavior: "auto" })`,
    );
  }

  async scrollIntoView(selectorOrRef: string): Promise<void> {
    await this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) throw new Error("Element not found");
      node.scrollIntoView({ block: "center", inline: "center", behavior: "auto" });
      return true;
    })()`);
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

    if (!delay) {
      return this.insertText(text);
    }

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

  async keyDown(key: string): Promise<void> {
    const mapped = KEY_MAP[key] ?? MODIFIER_MAP[key];
    if (mapped) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key: mapped.key,
        code: mapped.code,
        windowsVirtualKeyCode: mapped.keyCode,
      });
      return;
    }
    if (key.length === 1) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key,
        text: key,
        unmodifiedText: key,
      });
      return;
    }
    throw new Error(`Unknown key: ${key}`);
  }

  async keyUp(key: string): Promise<void> {
    const mapped = KEY_MAP[key] ?? MODIFIER_MAP[key];
    if (mapped) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: mapped.key,
        code: mapped.code,
        windowsVirtualKeyCode: mapped.keyCode,
      });
      return;
    }
    if (key.length === 1) {
      await this.session.send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
      });
      return;
    }
    throw new Error(`Unknown key: ${key}`);
  }

  async insertText(text: string): Promise<TypeResult> {
    await this.session.send("Input.insertText", { text });
    return { typed: true };
  }

  private async tryFastInsertInto(
    selectorOrRef: string,
    text: string,
  ): Promise<boolean> {
    await this.focus(selectorOrRef);
    const inserted = await this.evaluateInPage<boolean>(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node) return false;
      const active = document.activeElement;
      if (active !== node) return false;
      const isTextInput = node instanceof HTMLTextAreaElement ||
        (node instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes((node.type || "text").toLowerCase()));
      const isEditable = node instanceof HTMLElement && node.isContentEditable;
      return isTextInput || isEditable;
    })()`);
    if (!inserted) return false;
    await this.insertText(text);
    return true;
  }

  async typeInto(
    selectorOrRef: string,
    text: string,
    options?: { delay?: number },
  ): Promise<TypeResult> {
    if (
      !options?.delay &&
      (await this.tryFastInsertInto(selectorOrRef, text))
    ) {
      return { typed: true };
    }
    await this.focus(selectorOrRef);
    return this.type(text, options);
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
    const fastFilled = await this.evaluateInPage<boolean>(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!node) return false;
      const assign = (target, nextValue) => {
        const proto = target instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        descriptor?.set?.call(target, nextValue);
      };
      if (node instanceof HTMLTextAreaElement) {
        assign(node, ${JSON.stringify(value)});
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      if (node instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "reset", "file", "range", "color"].includes((node.type || "text").toLowerCase())) {
        assign(node, ${JSON.stringify(value)});
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      if (node instanceof HTMLElement && node.isContentEditable) {
        node.textContent = ${JSON.stringify(value)};
        node.dispatchEvent(new InputEvent("input", { bubbles: true, data: ${JSON.stringify(value)}, inputType: "insertText" }));
        return true;
      }
      return false;
    })()`);

    if (!fastFilled) {
      await this.focus(selectorOrRef);
      await this.pressKey("Ctrl+A");
      await this.type(value);
    }

    if (options?.pressEnter !== false) {
      await this.pressKey("Enter");
    }
  }

  async dragAndDrop(source: string, target: string): Promise<void> {
    await this.evaluateInPage(`(() => {
      const sourceNode = ${this.elementLookupExpression(source)};
      const targetNode = ${this.elementLookupExpression(target)};
      if (!(sourceNode instanceof Element) || !(targetNode instanceof Element)) {
        throw new Error("Could not locate drag source or target");
      }
      const dataTransfer = new DataTransfer();
      sourceNode.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
      targetNode.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
      sourceNode.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer }));
      return true;
    })()`);
  }

  async uploadFiles(
    selectorOrRef: string,
    files: UploadedFile[],
  ): Promise<void> {
    await this.evaluateInPage(`(() => {
      const input = ${this.elementLookupExpression(selectorOrRef)};
      if (!(input instanceof HTMLInputElement) || input.type !== "file") {
        throw new Error("Target is not a file input");
      }
      const transfer = new DataTransfer();
      for (const file of ${JSON.stringify(files)}) {
        const binary = atob(file.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        transfer.items.add(new File([bytes], file.name, { type: file.type || "application/octet-stream" }));
      }
      input.files = transfer.files;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return input.files?.length || 0;
    })()`);
  }

  async getBox(selectorOrRef: string): Promise<BoxResult | null> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) return null;
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    })()`);
  }

  async getStyles(selectorOrRef: string): Promise<Record<string, string>> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) throw new Error("Element not found");
      const style = getComputedStyle(node);
      const out = {};
      for (const name of Array.from(style)) out[name] = style.getPropertyValue(name);
      return out;
    })()`);
  }

  async getDownloadUrl(selectorOrRef: string): Promise<string | null> {
    return this.evaluateInPage(`(() => {
      const node = ${this.elementLookupExpression(selectorOrRef)};
      if (!(node instanceof Element)) return null;
      if (node instanceof HTMLAnchorElement || node instanceof HTMLAreaElement) return node.href;
      if (node instanceof HTMLImageElement || node instanceof HTMLSourceElement) return node.src;
      return node.getAttribute("href") || node.getAttribute("src") || node.getAttribute("data-url");
    })()`);
  }

  async performFindAction(
    locator: FindLocator,
    action:
      | "click"
      | "fill"
      | "type"
      | "hover"
      | "focus"
      | "check"
      | "uncheck"
      | "text",
    value?: string,
  ): Promise<unknown> {
    if (action === "text") {
      return this.locatorText(locator);
    }

    if (action === "focus") {
      await this.evaluateInPage(`(() => {
        const node = ${this.locatorExpression(locator)};
        if (!(node instanceof HTMLElement || node instanceof SVGElement)) throw new Error("Element not found");
        node.focus();
        return true;
      })()`);
      return { focused: true };
    }

    if (action === "fill" || action === "type") {
      await this.evaluateInPage(`(() => {
        const node = ${this.locatorExpression(locator)};
        if (!(node instanceof HTMLElement || node instanceof SVGElement)) throw new Error("Element not found");
        node.focus();
        return true;
      })()`);
      if (action === "fill") {
        await this.pressKey("Ctrl+A");
      }
      await this.type(value ?? "");
      return { typed: true };
    }

    if (action === "check" || action === "uncheck") {
      await this.evaluateInPage(`(() => {
        const node = ${this.locatorExpression(locator)};
        if (!(node instanceof Element)) throw new Error("Element not found");
        if ("checked" in node) node.checked = ${action === "check" ? "true" : "false"};
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      })()`);
      return { checked: action === "check" };
    }

    const box = await this.getLocatorCenter(locator);
    if (!box) throw new Error("Element not found");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    if (action === "hover") {
      await this.hover(x, y);
      return { hovered: true };
    }
    if (action === "click") {
      return this.click(x, y);
    }

    throw new Error(`Unsupported locator action: ${action}`);
  }

  async screenshot(options?: {
    fullPage?: boolean;
    format?: "png" | "jpeg";
    quality?: number;
    selectorOrRef?: string;
  }): Promise<ScreenshotResult> {
    const format = options?.format ?? "png";
    const params: Protocol.Page.CaptureScreenshotRequest = {
      format,
      fromSurface: true,
      captureBeyondViewport: options?.fullPage ?? false,
    };

    if (options?.selectorOrRef) {
      const box = await this.getBox(options.selectorOrRef);
      if (!box) {
        throw new Error(`Could not locate element: ${options.selectorOrRef}`);
      }
      params.clip = {
        x: box.x,
        y: box.y,
        width: Math.max(1, box.width),
        height: Math.max(1, box.height),
        scale: 1,
      };
      params.captureBeyondViewport = false;
    }

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
    options?: { deviceScaleFactor?: number; mobile?: boolean },
  ): Promise<void> {
    await this.session.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: options?.deviceScaleFactor ?? 1,
      mobile: options?.mobile ?? false,
    });
  }

  async setHeaders(headers: Record<string, string>): Promise<void> {
    this.extraHeaders = { ...headers };
    await this.session.send("Network.setExtraHTTPHeaders", {
      headers: this.extraHeaders,
    });
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
    reducedMotion: "reduce" | "no-preference" = "no-preference",
  ): Promise<void> {
    await this.session.send("Emulation.setEmulatedMedia", {
      media: "",
      features: [
        { name: "prefers-color-scheme", value: colorScheme },
        { name: "prefers-reduced-motion", value: reducedMotion },
      ],
    });
  }

  async setCredentials(username: string, password: string): Promise<void> {
    const authorization = `Basic ${btoa(`${username}:${password}`)}`;
    await this.setHeaders({
      ...this.extraHeaders,
      Authorization: authorization,
    });
  }

  async setDevice(name: string): Promise<void> {
    const descriptor = DEVICE_DESCRIPTORS[name.trim().toLowerCase()];
    if (!descriptor) {
      throw new Error(`Unsupported device: ${name}`);
    }
    await this.setViewport(descriptor.width, descriptor.height, {
      deviceScaleFactor: descriptor.deviceScaleFactor,
      mobile: descriptor.mobile,
    });
    await this.session.send("Emulation.setUserAgentOverride", {
      userAgent: descriptor.userAgent,
      platform: descriptor.mobile ? "iPhone" : "Linux armv8l",
    });
    await this.session.send("Emulation.setTouchEmulationEnabled", {
      enabled: descriptor.hasTouch ?? descriptor.mobile,
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
        if (${JSON.stringify(state)} === "detached") return !node;
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
