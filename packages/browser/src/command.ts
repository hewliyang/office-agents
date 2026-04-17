import {
  Browser,
  type BrowserOptions,
  type BrowserPreviewState,
} from "./browser.js";
import type { BrowserProvider } from "./providers/types.js";

export interface BrowseSessionEvent {
  active: boolean;
  sessionId?: string;
}

export interface BrowsePreviewEvent extends BrowserPreviewState {
  active: boolean;
  sessionId?: string;
}

type BrowseSessionListener = (event: BrowseSessionEvent) => void;
type BrowsePreviewListener = (event: BrowsePreviewEvent) => void;

export interface BrowseCommandConfig {
  getProvider: () => BrowserProvider | null;
  writeFile?: (path: string, data: Uint8Array) => Promise<void>;
  readFile?: (path: string) => Promise<Uint8Array>;
  launchBrowser?: (options: BrowserOptions) => Promise<Browser>;
  connectBrowser?: (options: { cdpUrl: string }) => Promise<Browser>;
}

export class BrowseCli {
  private activeBrowser: Browser | null = null;
  private readonly sessionListeners = new Set<BrowseSessionListener>();
  private readonly previewListeners = new Set<BrowsePreviewListener>();
  private previewBridgeCleanup: (() => void) | null = null;
  private previewState: BrowsePreviewEvent = {
    active: false,
    connected: false,
    live: false,
    frameBase64: null,
    tabs: [],
    url: "",
    title: "",
  };
  private lifecycleCleanupInstalled = false;
  private config: BrowseCommandConfig | null = null;

  constructor(config?: BrowseCommandConfig) {
    if (config) this.configure(config);
  }

  onSessionChange(listener: BrowseSessionListener): () => void {
    this.sessionListeners.add(listener);
    return () => this.sessionListeners.delete(listener);
  }

  onPreviewChange(listener: BrowsePreviewListener): () => void {
    this.previewListeners.add(listener);
    if (this.previewListeners.size === 1 && this.activeBrowser) {
      this.attachPreviewBridge();
    } else {
      listener(this.getPreviewState());
    }
    return () => {
      this.previewListeners.delete(listener);
      if (this.previewListeners.size === 0) {
        this.detachPreviewBridge();
        this.previewState = this.getCurrentPreviewEvent();
      }
    };
  }

  getSessionState(): BrowseSessionEvent {
    if (!this.activeBrowser) return { active: false };
    return {
      active: true,
      sessionId: this.activeBrowser.sessionId,
    };
  }

  getPreviewState(): BrowsePreviewEvent {
    if (!this.previewBridgeCleanup) {
      return this.getCurrentPreviewEvent();
    }
    return this.previewState;
  }

  getActiveBrowser(): Browser | null {
    return this.activeBrowser;
  }

  getProvider(): BrowserProvider {
    const provider = this.config?.getProvider();
    if (!provider) {
      throw new Error(
        "No browser provider configured. Set a browser provider in settings.",
      );
    }
    return provider;
  }

  getBrowserOrThrow(): Browser {
    if (!this.activeBrowser) {
      throw new Error("No browser session. Run 'browse open <url>' first.");
    }
    return this.activeBrowser;
  }

  setBrowser(browser: Browser | null): void {
    this.setActiveBrowser(browser);
  }

  getLaunchBrowser(): (options: BrowserOptions) => Promise<Browser> {
    return this.config?.launchBrowser ?? Browser.launch;
  }

  getConnectBrowser(): (options: { cdpUrl: string }) => Promise<Browser> {
    return (
      this.config?.connectBrowser ?? ((options) => Browser.connect(options))
    );
  }

  getReadFile(): ((path: string) => Promise<Uint8Array>) | undefined {
    return this.config?.readFile;
  }

  getWriteFile():
    | ((path: string, data: Uint8Array) => Promise<void>)
    | undefined {
    return this.config?.writeFile;
  }

  configure(config: BrowseCommandConfig): void {
    this.config = config;
    this.installLifecycleCleanup();
  }

  async switchTab(index: number): Promise<void> {
    if (!this.activeBrowser) {
      throw new Error("No browser session. Run 'browse open <url>' first.");
    }
    await this.activeBrowser.switchTab(index);
  }

  async closeActiveBrowser(): Promise<void> {
    const browser = this.activeBrowser;
    if (!browser) return;
    this.setActiveBrowser(null);
    await browser.close().catch(() => {});
  }

  async dispose(): Promise<void> {
    this.config = null;
    await this.closeActiveBrowser();
  }

  private emitSessionChange(): void {
    const event = this.getSessionState();
    for (const listener of this.sessionListeners) {
      try {
        listener(event);
      } catch {}
    }
  }

  private getCurrentPreviewEvent(
    browser: Browser | null = this.activeBrowser,
  ): BrowsePreviewEvent {
    if (!browser) {
      return {
        active: false,
        connected: false,
        live: false,
        frameBase64: null,
        tabs: [],
        url: "",
        title: "",
      };
    }

    return {
      active: true,
      sessionId: browser.sessionId,
      ...browser.getPreviewStateSnapshot(),
    };
  }

  private emitPreviewChange(event = this.getPreviewState()): void {
    this.previewState = event;
    for (const listener of this.previewListeners) {
      try {
        listener(event);
      } catch {}
    }
  }

  private attachPreviewBridge(): void {
    if (
      this.previewBridgeCleanup ||
      this.previewListeners.size === 0 ||
      !this.activeBrowser
    ) {
      return;
    }

    this.previewBridgeCleanup = this.activeBrowser.subscribePreview((state) => {
      this.emitPreviewChange({
        active: true,
        sessionId: this.activeBrowser?.sessionId,
        ...state,
      });
    });
  }

  private detachPreviewBridge(): void {
    if (!this.previewBridgeCleanup) return;
    this.previewBridgeCleanup();
    this.previewBridgeCleanup = null;
  }

  private setActiveBrowser(browser: Browser | null): void {
    this.detachPreviewBridge();
    this.activeBrowser = browser;
    this.emitSessionChange();
    if (this.activeBrowser && this.previewListeners.size > 0) {
      this.attachPreviewBridge();
    } else {
      this.emitPreviewChange(this.getCurrentPreviewEvent(browser));
    }
  }

  private installLifecycleCleanup(): void {
    if (this.lifecycleCleanupInstalled || typeof window === "undefined") {
      return;
    }
    this.lifecycleCleanupInstalled = true;

    const cleanup = () => {
      void this.closeActiveBrowser();
    };

    window.addEventListener("pagehide", cleanup);
    window.addEventListener("beforeunload", cleanup);
  }

  async executeCommand(
    args: string[],
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return executeBrowseCommandWith(this, args);
  }
}

const HELP = `Usage: browse <command> [options]

Tips:
  The browse session stays alive across commands in the same shell/runtime.
  Chain commands in one bash call when possible, e.g.:
    browse open hewliyang.com && browse markdown hewliyang.md
  For harvesting multiple URLs, prefer tabs in one shell call, e.g.:
    browse open site1.com && browse tab new site2.com && browse tab 0 && browse markdown site1.md && browse tab 1 && browse markdown site2.md
  Do not chain snapshot refs blindly; read the snapshot output first, then use refs like @e2.

Core:
  open <url> [--wait=load|domcontentloaded|networkidle] [--timeout=ms]
  goto <url>
  navigate <url>
  connect <port|url>
  snapshot [-i|--interactive] [-c|--compact] [-d N|--depth=N]
  click <ref|selector> [--new-tab]
  dblclick <ref|selector>
  focus <ref|selector>
  type <selector> <text>
  type <text>                        Type into the currently focused element
  fill <ref|selector> <value> [--no-enter]
  press <key>
  key <key>
  keydown <key>
  keyup <key>
  keyboard type <text>
  keyboard inserttext <text>
  hover <ref|selector> | hover <x> <y>
  check <ref|selector>
  uncheck <ref|selector>
  select <ref|selector> <value...>
  drag <src> <tgt>
  upload <sel> <files...>
  eval <expression>

Get:
  get url
  get title
  get text [ref|selector]
  get html [ref|selector]
  get value <ref|selector>
  get attr <ref|selector> <attr>
  get count <selector>
  get box <ref|selector>
  get styles <ref|selector>
  get cdp-url

State:
  is visible <ref|selector>
  is enabled <ref|selector>
  is checked <ref|selector>

Find:
  find role <role> <action> [value] [--name <name>] [--exact]
  find text <text> <action>
  find label <label> <action> [value]
  find placeholder <text> <action> [value]
  find alt <text> <action>
  find title <text> <action>
  find testid <id> <action> [value]
  find first <selector> <action> [value]
  find last <selector> <action> [value]
  find nth <n> <selector> <action> [value]

Wait:
  wait <selector>
  wait <ms>
  wait --text <text> [--timeout=ms]
  wait --url <pattern> [--timeout=ms]
  wait --load <state> [--timeout=ms]
  wait --fn <expression> [--timeout=ms]
  wait selector <sel> [--timeout=ms] [--state=visible|hidden|attached|detached]
  wait timeout <ms>

Mouse:
  mouse move <x> <y>
  mouse down [button]
  mouse up [button]
  mouse wheel <dy> [dx]
  scroll <dir> [px] [--selector <sel>]
  scroll <x> <y> <deltaX> <deltaY>
  scrollintoview <sel>
  scrollinto <sel>

Tabs:
  tab
  tab new [url]
  tab <n>
  tab close [n]

Cookies & storage:
  cookies
  cookies set <name> <value> [--url=...] [--domain=...] [--path=...] [--httpOnly] [--secure] [--sameSite=Strict|Lax|None] [--expires=ts]
  cookies clear
  storage local [key]
  storage local set <key> <value>
  storage local clear
  storage session [key]
  storage session set <key> <value>
  storage session clear

Settings:
  viewport <width> <height> [--scale=N]
  set viewport <width> <height> [scale]
  set device <name>
  set headers <json>
  set offline [on|off]
  set credentials <user> <pass>
  set media [dark|light|no-preference] [reduced-motion]
  set geo <lat> <lng>

Artifacts:
  screenshot [selector] [outfile] [--format=png|jpeg] [--quality=N] [--full-page]
  pdf [outfile]
  markdown [outfile] [--selector=<sel>]
  download <url|selector> <outfile>

Nav/session:
  reload
  back
  forward
  status
  stop
  close
  quit
  exit

Options:
  --json
  --help`;

function parseArgs(args: string[]): {
  flags: Record<string, string>;
  positional: string[];
} {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  const booleanFlags = new Set([
    "--full-page",
    "--full",
    "-f",
    "--no-enter",
    "--interactive",
    "--compact",
    "-i",
    "-c",
    "--httpOnly",
    "--secure",
  ]);
  const valueFlags = new Set([
    "--depth",
    "-d",
    "--timeout",
    "--wait",
    "--format",
    "--quality",
    "--scale",
    "--url",
    "--domain",
    "--path",
    "--sameSite",
    "--expires",
    "--button",
    "--count",
    "--state",
    "--selector",
    "-s",
  ]);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--json") {
      flags.json = "true";
    } else if (arg === "--help" || arg === "-h") {
      flags.help = "true";
    } else if (booleanFlags.has(arg)) {
      flags[arg.replace(/^--?/, "")] = "true";
      positional.push(arg);
    } else if (valueFlags.has(arg) && args[i + 1]) {
      flags[arg.replace(/^--?/, "")] = args[i + 1];
      positional.push(arg, args[i + 1]);
      i += 1;
    } else if (arg.startsWith("--") && arg.includes("=")) {
      const eqIdx = arg.indexOf("=");
      flags[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      positional.push(arg);
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

function output(data: unknown, json: boolean): string {
  if (json) return JSON.stringify(data, null, 2);
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
}

function parseSnapshotOptions(args: string[]): {
  interactive?: boolean;
  compact?: boolean;
  depth?: number;
} {
  const options: { interactive?: boolean; compact?: boolean; depth?: number } =
    {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-i" || arg === "--interactive") {
      options.interactive = true;
    } else if (arg === "-c" || arg === "--compact") {
      options.compact = true;
    } else if (arg === "-d" || arg === "--depth") {
      const value = args[i + 1];
      const depth = value ? parseInt(value, 10) : NaN;
      if (!Number.isNaN(depth)) {
        options.depth = depth;
        i += 1;
      }
    } else if (arg.startsWith("--depth=")) {
      const depth = parseInt(arg.slice("--depth=".length), 10);
      if (!Number.isNaN(depth)) options.depth = depth;
    }
  }

  return options;
}

function looksLikeSnapshotRef(value: string): boolean {
  return /^@?e\d+$/.test(value) || /^\d+-\d+$/.test(value);
}

function parseJsonObject(text: string): Record<string, string> {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object");
  }
  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, String(value)]),
  );
}

function bytesToBase64(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function guessMimeType(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

function looksLikeUrl(value: string): boolean {
  return /^(https?:|data:|file:|about:|chrome:|chrome-extension:)/i.test(value);
}

function looksLikePath(value: string): boolean {
  return (
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("/") ||
    /\.[a-z0-9]{2,5}$/i.test(value)
  );
}

function parseFindArgs(args: string[]): {
  locator:
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
    | { kind: "nth"; selector: string; index: number };
  action:
    | "click"
    | "fill"
    | "type"
    | "hover"
    | "focus"
    | "check"
    | "uncheck"
    | "text";
  value?: string;
} {
  const kind = args[0];
  if (!kind) throw new Error("Usage: browse find <locator> ...");

  if (kind === "nth") {
    const index = parseInt(args[1] ?? "", 10);
    const selector = args[2];
    const action = (args[3] ?? "click") as
      | "click"
      | "fill"
      | "type"
      | "hover"
      | "focus"
      | "check"
      | "uncheck"
      | "text";
    if (Number.isNaN(index) || !selector) {
      throw new Error("Usage: browse find nth <n> <selector> <action> [value]");
    }
    return {
      locator: { kind: "nth", index, selector },
      action,
      value: args.slice(4).join(" ") || undefined,
    };
  }

  if (kind === "first" || kind === "last") {
    const selector = args[1];
    const action = (args[2] ?? "click") as
      | "click"
      | "fill"
      | "type"
      | "hover"
      | "focus"
      | "check"
      | "uncheck"
      | "text";
    if (!selector) {
      throw new Error(`Usage: browse find ${kind} <selector> <action> [value]`);
    }
    return {
      locator: { kind: "nth", selector, index: kind === "first" ? 0 : -1 },
      action,
      value: args.slice(3).join(" ") || undefined,
    };
  }

  const supportedKinds = [
    "role",
    "text",
    "label",
    "placeholder",
    "alt",
    "title",
    "testid",
  ];
  if (!supportedKinds.includes(kind)) {
    throw new Error(`Unknown find locator: ${kind}`);
  }

  const rawValue = args[1];
  if (!rawValue) {
    throw new Error(`Usage: browse find ${kind} <value> <action> [value]`);
  }

  const action = (args[2] ?? "click") as
    | "click"
    | "fill"
    | "type"
    | "hover"
    | "focus"
    | "check"
    | "uncheck"
    | "text";

  let exact = false;
  let name: string | undefined;
  const remainder: string[] = [];
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--exact") {
      exact = true;
    } else if (arg === "--name") {
      name = args[i + 1];
      i += 1;
    } else {
      remainder.push(arg);
    }
  }

  return {
    locator: {
      kind: kind as
        | "role"
        | "text"
        | "label"
        | "placeholder"
        | "alt"
        | "title"
        | "testid",
      value: rawValue,
      exact,
      name,
    },
    action,
    value: remainder.join(" ") || undefined,
  };
}

async function executeBrowseCommandWith(
  cli: BrowseCli,
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const { flags, positional } = parseArgs(args);

  if (flags.help || positional.length === 0) {
    return { stdout: HELP, stderr: "", exitCode: flags.help ? 0 : 1 };
  }

  const command = positional[0];
  const cmdArgs = positional.slice(1);
  const json = flags.json === "true";

  try {
    switch (command) {
      case "open":
      case "goto":
      case "navigate": {
        const url = cmdArgs[0];
        if (!url) {
          return {
            stdout: "",
            stderr: "Usage: browse open <url>",
            exitCode: 1,
          };
        }
        let browser = cli.getActiveBrowser();
        if (!browser) {
          const launchBrowser = cli.getLaunchBrowser();
          browser = await launchBrowser({ provider: cli.getProvider() });
          cli.setBrowser(browser);
        }
        await browser.page.goto(url, {
          waitUntil: flags.wait ?? "load",
          timeoutMs: flags.timeout ? parseInt(flags.timeout, 10) : undefined,
        });
        const result: Record<string, unknown> = {
          url: await browser.page.getUrl(),
        };
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "connect": {
        const endpoint = cmdArgs[0];
        if (!endpoint) {
          return {
            stdout: "",
            stderr: "Usage: browse connect <port|url>",
            exitCode: 1,
          };
        }
        await cli.closeActiveBrowser();
        let cdpUrl = endpoint;
        if (/^\d+$/.test(endpoint)) {
          const version = await fetch(
            `http://127.0.0.1:${endpoint}/json/version`,
          );
          if (!version.ok) {
            throw new Error(`Failed to resolve CDP URL from port ${endpoint}`);
          }
          const data = (await version.json()) as {
            webSocketDebuggerUrl?: string;
          };
          if (!data.webSocketDebuggerUrl) {
            throw new Error(
              `CDP endpoint ${endpoint} did not expose webSocketDebuggerUrl`,
            );
          }
          cdpUrl = data.webSocketDebuggerUrl;
        } else if (/^https?:\/\//i.test(endpoint)) {
          const version = await fetch(
            `${endpoint.replace(/\/$/, "")}/json/version`,
          );
          if (!version.ok) {
            throw new Error(`Failed to resolve CDP URL from ${endpoint}`);
          }
          const data = (await version.json()) as {
            webSocketDebuggerUrl?: string;
          };
          if (!data.webSocketDebuggerUrl) {
            throw new Error(
              `CDP endpoint ${endpoint} did not expose webSocketDebuggerUrl`,
            );
          }
          cdpUrl = data.webSocketDebuggerUrl;
        }
        const connectBrowser = cli.getConnectBrowser();
        const browser = await connectBrowser({ cdpUrl });
        cli.setBrowser(browser);
        return {
          stdout: output({ connected: true, cdpUrl: browser.cdpUrl }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "status": {
        if (!cli.getActiveBrowser()) {
          return {
            stdout: output({ status: "disconnected" }, json),
            stderr: "",
            exitCode: 0,
          };
        }
        const browser = cli.getActiveBrowser()!;
        const url = await browser.page.getUrl();
        const title = await browser.page.getTitle();
        return {
          stdout: output(
            {
              status: "connected",
              sessionId: browser.sessionId,
              url,
              title,
            },
            json,
          ),
          stderr: "",
          exitCode: 0,
        };
      }

      case "stop":
      case "close":
      case "quit":
      case "exit": {
        await cli.closeActiveBrowser();
        return {
          stdout: output({ stopped: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "reload": {
        const browser = cli.getBrowserOrThrow();
        const result = await browser.page.reload();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "back": {
        const browser = cli.getBrowserOrThrow();
        const result = await browser.page.goBack();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "forward": {
        const browser = cli.getBrowserOrThrow();
        const result = await browser.page.goForward();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "snapshot": {
        const browser = cli.getBrowserOrThrow();
        const snap = await browser.page.snapshot(parseSnapshotOptions(cmdArgs));
        return {
          stdout: output(
            json
              ? { tree: snap.tree, refCount: Object.keys(snap.refs).length }
              : snap.tree,
            json,
          ),
          stderr: "",
          exitCode: 0,
        };
      }

      case "screenshot": {
        const browser = cli.getBrowserOrThrow();
        const filtered = cmdArgs.filter((arg) => !arg.startsWith("-"));
        let selectorOrRef: string | undefined;
        let outFile: string | undefined;
        if (filtered.length === 1) {
          if (looksLikePath(filtered[0])) outFile = filtered[0];
          else selectorOrRef = filtered[0];
        } else if (filtered.length >= 2) {
          selectorOrRef = filtered[0];
          outFile = filtered[1];
        }
        const result = await browser.page.screenshot({
          format: (flags.format as "png" | "jpeg") ?? "png",
          quality: flags.quality ? parseInt(flags.quality, 10) : undefined,
          fullPage:
            flags["full-page"] === "true" ||
            cmdArgs.includes("--full") ||
            cmdArgs.includes("-f"),
          selectorOrRef,
        });

        if (outFile) {
          const writeFile = cli.getWriteFile();
          if (!writeFile) {
            return {
              stdout: "",
              stderr: "File writing not available",
              exitCode: 1,
            };
          }
          const binary = Uint8Array.from(atob(result.base64), (c) =>
            c.charCodeAt(0),
          );
          await writeFile(outFile, binary);
          return {
            stdout: `Saved ${result.format ?? "screenshot"} to ${outFile} (${binary.length} bytes)`,
            stderr: "",
            exitCode: 0,
          };
        }

        return { stdout: output(result, true), stderr: "", exitCode: 0 };
      }

      case "pdf": {
        const browser = cli.getBrowserOrThrow();
        const outFile = cmdArgs[0];
        const result = await browser.page.pdf();
        if (outFile) {
          const writeFile = cli.getWriteFile();
          if (!writeFile) {
            return {
              stdout: "",
              stderr: "File writing not available",
              exitCode: 1,
            };
          }
          const binary = Uint8Array.from(atob(result.base64), (c) =>
            c.charCodeAt(0),
          );
          await writeFile(outFile, binary);
          return {
            stdout: `Saved pdf to ${outFile} (${binary.length} bytes)`,
            stderr: "",
            exitCode: 0,
          };
        }
        return { stdout: output(result, true), stderr: "", exitCode: 0 };
      }

      case "markdown": {
        const browser = cli.getBrowserOrThrow();
        const outFile =
          cmdArgs[0] && !cmdArgs[0].startsWith("--") ? cmdArgs[0] : undefined;
        const result = await browser.page.getMarkdown(flags.selector);
        const header = [
          result.title ? `Title: ${result.title}` : "",
          ...Object.entries(result.metadata || {}).map(
            ([key, value]) => `${key}: ${value}`,
          ),
        ]
          .filter(Boolean)
          .join("\n");
        const text = header ? `${header}\n\n${result.text}` : result.text;

        if (outFile) {
          const writeFile = cli.getWriteFile();
          if (!writeFile) {
            return {
              stdout: "",
              stderr: "File writing not available",
              exitCode: 1,
            };
          }
          await writeFile(outFile, new TextEncoder().encode(text));
          return {
            stdout: `Saved markdown to ${outFile} (${text.length} chars)`,
            stderr: "",
            exitCode: 0,
          };
        }

        return {
          stdout: output(
            json
              ? {
                  url: result.url,
                  title: result.title,
                  metadata: result.metadata,
                  markdown: result.text,
                }
              : text,
            json,
          ),
          stderr: "",
          exitCode: 0,
        };
      }

      case "download": {
        const browser = cli.getBrowserOrThrow();
        const source = cmdArgs[0];
        const outFile = cmdArgs[1];
        if (!source || !outFile) {
          return {
            stdout: "",
            stderr: "Usage: browse download <url|selector> <outfile>",
            exitCode: 1,
          };
        }
        const writeFile = cli.getWriteFile();
        if (!writeFile) {
          return {
            stdout: "",
            stderr: "File writing not available",
            exitCode: 1,
          };
        }

        let url = source;
        if (!looksLikeUrl(source)) {
          const resolved = await browser.page.getDownloadUrl(source);
          if (!resolved) {
            return {
              stdout: "",
              stderr: `Could not resolve download URL from ${source}`,
              exitCode: 1,
            };
          }
          url = resolved;
        }

        const b64 = await browser.page.evaluate(`
          fetch(${JSON.stringify(url)})
            .then(r => {
              if (!r.ok) throw new Error('HTTP ' + r.status);
              return r.arrayBuffer();
            })
            .then(buf => {
              const bytes = new Uint8Array(buf);
              let binary = '';
              for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
              return btoa(binary);
            })
        `);

        if (typeof b64 !== "string") {
          return {
            stdout: "",
            stderr: `Download failed: ${JSON.stringify(b64)}`,
            exitCode: 1,
          };
        }

        const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        await writeFile(outFile, binary);

        return {
          stdout: `Downloaded ${url} to ${outFile} (${binary.length} bytes)`,
          stderr: "",
          exitCode: 0,
        };
      }

      case "get": {
        const browser = cli.getBrowserOrThrow();
        const what = cmdArgs[0];
        if (!what) {
          return {
            stdout: "",
            stderr:
              "Usage: browse get <url|title|text|html|value|attr|count|box|styles|cdp-url>",
            exitCode: 1,
          };
        }
        switch (what) {
          case "url": {
            const value = await browser.page.getUrl();
            return {
              stdout: output(json ? { url: value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "title": {
            const value = await browser.page.getTitle();
            return {
              stdout: output(json ? { title: value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "text": {
            const value = await browser.page.getText(cmdArgs[1]);
            return {
              stdout: output(json ? { text: value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "html": {
            const value = await browser.page.getHtml(cmdArgs[1]);
            return {
              stdout: output(json ? { html: value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "value": {
            const target = cmdArgs[1];
            if (!target)
              return {
                stdout: "",
                stderr: "Usage: browse get value <ref|selector>",
                exitCode: 1,
              };
            const value = await browser.page.getValue(target);
            return {
              stdout: output(json ? { value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "attr": {
            const target = cmdArgs[1];
            const attr = cmdArgs[2];
            if (!target || !attr) {
              return {
                stdout: "",
                stderr: "Usage: browse get attr <ref|selector> <attr>",
                exitCode: 1,
              };
            }
            const value = await browser.page.getAttribute(target, attr);
            return {
              stdout: output(json ? { value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "count": {
            const target = cmdArgs[1];
            if (!target)
              return {
                stdout: "",
                stderr: "Usage: browse get count <selector>",
                exitCode: 1,
              };
            const count = await browser.page.getCount(target);
            return {
              stdout: output(json ? { count } : String(count), json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "box": {
            const target = cmdArgs[1];
            if (!target)
              return {
                stdout: "",
                stderr: "Usage: browse get box <ref|selector>",
                exitCode: 1,
              };
            const box = await browser.page.getBox(target);
            return {
              stdout: output(box ?? {}, true),
              stderr: "",
              exitCode: 0,
            };
          }
          case "styles": {
            const target = cmdArgs[1];
            if (!target)
              return {
                stdout: "",
                stderr: "Usage: browse get styles <ref|selector>",
                exitCode: 1,
              };
            const styles = await browser.page.getStyles(target);
            return {
              stdout: output(styles, true),
              stderr: "",
              exitCode: 0,
            };
          }
          case "cdp-url": {
            const value = browser.cdpUrl ?? "";
            return {
              stdout: output(json ? { cdpUrl: value } : value, json),
              stderr: "",
              exitCode: 0,
            };
          }
          default:
            return {
              stdout: "",
              stderr: `Unknown get target: ${what}`,
              exitCode: 1,
            };
        }
      }

      case "is": {
        const browser = cli.getBrowserOrThrow();
        const what = cmdArgs[0];
        const target = cmdArgs[1];
        if (!what || !target) {
          return {
            stdout: "",
            stderr: "Usage: browse is <visible|enabled|checked> <ref|selector>",
            exitCode: 1,
          };
        }
        let value: boolean;
        switch (what) {
          case "visible":
            value = await browser.page.isVisible(target);
            break;
          case "enabled":
            value = await browser.page.isEnabled(target);
            break;
          case "checked":
            value = await browser.page.isChecked(target);
            break;
          default:
            return {
              stdout: "",
              stderr: `Unknown state check: ${what}`,
              exitCode: 1,
            };
        }
        return {
          stdout: output(json ? { value } : String(value), json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "click": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse click <ref|selector>",
            exitCode: 1,
          };
        if (cmdArgs.includes("--new-tab")) {
          const href = await browser.page.getAttribute(target, "href");
          if (!href) {
            throw new Error(
              `Target ${target} does not expose an href for --new-tab`,
            );
          }
          const tabs = await browser.newTab(href);
          return { stdout: output(tabs, true), stderr: "", exitCode: 0 };
        }
        const result = looksLikeSnapshotRef(target)
          ? await browser.page.clickRef(target)
          : await browser.page.clickSelector(target);
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "dblclick": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse dblclick <ref|selector>",
            exitCode: 1,
          };
        const result = await browser.page.dblclick(target);
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "click-xy": {
        const browser = cli.getBrowserOrThrow();
        const x = parseFloat(cmdArgs[0]);
        const y = parseFloat(cmdArgs[1]);
        if (Number.isNaN(x) || Number.isNaN(y)) {
          return {
            stdout: "",
            stderr: "Usage: browse click-xy <x> <y>",
            exitCode: 1,
          };
        }
        const result = await browser.page.click(x, y, {
          button: flags.button,
          clickCount: flags.count ? parseInt(flags.count, 10) : undefined,
        });
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "type": {
        const browser = cli.getBrowserOrThrow();
        if (cmdArgs.length >= 2) {
          const target = cmdArgs[0];
          const text = cmdArgs.slice(1).join(" ");
          const result = await browser.page.typeInto(target, text, {
            delay: flags.delay ? parseInt(flags.delay, 10) : undefined,
          });
          return { stdout: output(result, json), stderr: "", exitCode: 0 };
        }
        const text = cmdArgs.join(" ");
        if (!text)
          return {
            stdout: "",
            stderr: "Usage: browse type <selector> <text> | browse type <text>",
            exitCode: 1,
          };
        const result = await browser.page.type(text, {
          delay: flags.delay ? parseInt(flags.delay, 10) : undefined,
        });
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "press":
      case "key": {
        const browser = cli.getBrowserOrThrow();
        const key = cmdArgs[0];
        if (!key)
          return {
            stdout: "",
            stderr: "Usage: browse press <key>",
            exitCode: 1,
          };
        await browser.page.pressKey(key);
        return {
          stdout: output({ pressed: key }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "keydown": {
        const browser = cli.getBrowserOrThrow();
        const key = cmdArgs[0];
        if (!key)
          return {
            stdout: "",
            stderr: "Usage: browse keydown <key>",
            exitCode: 1,
          };
        await browser.page.keyDown(key);
        return {
          stdout: output({ keyDown: key }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "keyup": {
        const browser = cli.getBrowserOrThrow();
        const key = cmdArgs[0];
        if (!key)
          return {
            stdout: "",
            stderr: "Usage: browse keyup <key>",
            exitCode: 1,
          };
        await browser.page.keyUp(key);
        return {
          stdout: output({ keyUp: key }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "keyboard": {
        const browser = cli.getBrowserOrThrow();
        const sub = cmdArgs[0];
        const text = cmdArgs.slice(1).join(" ");
        if (sub === "type") {
          if (!text) {
            return {
              stdout: "",
              stderr: "Usage: browse keyboard type <text>",
              exitCode: 1,
            };
          }
          const result = await browser.page.type(text, {
            delay: flags.delay ? parseInt(flags.delay, 10) : undefined,
          });
          return { stdout: output(result, json), stderr: "", exitCode: 0 };
        }
        if (sub === "inserttext" || sub === "insertText") {
          if (!text) {
            return {
              stdout: "",
              stderr: "Usage: browse keyboard inserttext <text>",
              exitCode: 1,
            };
          }
          const result = await browser.page.insertText(text);
          return { stdout: output(result, json), stderr: "", exitCode: 0 };
        }
        return {
          stdout: "",
          stderr: "Usage: browse keyboard <type|inserttext> <text>",
          exitCode: 1,
        };
      }

      case "fill": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        const value = cmdArgs.slice(1).join(" ");
        if (!target || !value) {
          return {
            stdout: "",
            stderr: "Usage: browse fill <ref|selector> <value>",
            exitCode: 1,
          };
        }
        await browser.page.fill(target, value, {
          pressEnter: flags["no-enter"] !== "true",
        });
        return {
          stdout: output({ filled: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "hover": {
        const browser = cli.getBrowserOrThrow();
        const x = parseFloat(cmdArgs[0]);
        const y = parseFloat(cmdArgs[1]);
        if (!Number.isNaN(x) && !Number.isNaN(y) && cmdArgs.length >= 2) {
          await browser.page.hover(x, y);
        } else {
          const target = cmdArgs[0];
          if (!target)
            return {
              stdout: "",
              stderr: "Usage: browse hover <ref|selector> | hover <x> <y>",
              exitCode: 1,
            };
          await browser.page.hoverTarget(target);
        }
        return {
          stdout: output({ hovered: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "focus": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse focus <ref|selector>",
            exitCode: 1,
          };
        await browser.page.focus(target);
        return {
          stdout: output({ focused: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "check": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse check <ref|selector>",
            exitCode: 1,
          };
        await browser.page.check(target, true);
        return {
          stdout: output({ checked: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "uncheck": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse uncheck <ref|selector>",
            exitCode: 1,
          };
        await browser.page.check(target, false);
        return {
          stdout: output({ checked: false }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "select": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        const values = cmdArgs.slice(1);
        if (!target || values.length === 0) {
          return {
            stdout: "",
            stderr: "Usage: browse select <ref|selector> <value...>",
            exitCode: 1,
          };
        }
        await browser.page.select(target, values);
        return {
          stdout: output({ selected: values }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "drag": {
        const browser = cli.getBrowserOrThrow();
        const source = cmdArgs[0];
        const target = cmdArgs[1];
        if (!source || !target) {
          return {
            stdout: "",
            stderr: "Usage: browse drag <src> <tgt>",
            exitCode: 1,
          };
        }
        await browser.page.dragAndDrop(source, target);
        return {
          stdout: output({ dragged: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "upload": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        const files = cmdArgs.slice(1);
        if (!target || files.length === 0) {
          return {
            stdout: "",
            stderr: "Usage: browse upload <sel> <files...>",
            exitCode: 1,
          };
        }
        const readFile = cli.getReadFile();
        if (!readFile) {
          return {
            stdout: "",
            stderr: "File reading not available",
            exitCode: 1,
          };
        }
        const uploaded = await Promise.all(
          files.map(async (path) => {
            const data = await readFile(path);
            return {
              name: path.split("/").pop() || path,
              type: guessMimeType(path),
              base64: bytesToBase64(data),
            };
          }),
        );
        await browser.page.uploadFiles(target, uploaded);
        return {
          stdout: output({ uploaded: files }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "find": {
        const browser = cli.getBrowserOrThrow();
        const parsed = parseFindArgs(cmdArgs);
        const result = await browser.page.performFindAction(
          parsed.locator,
          parsed.action,
          parsed.value,
        );
        return { stdout: output(result, true), stderr: "", exitCode: 0 };
      }

      case "mouse": {
        const browser = cli.getBrowserOrThrow();
        const sub = cmdArgs[0];
        switch (sub) {
          case "move": {
            const x = parseFloat(cmdArgs[1]);
            const y = parseFloat(cmdArgs[2]);
            if (Number.isNaN(x) || Number.isNaN(y)) {
              return {
                stdout: "",
                stderr: "Usage: browse mouse move <x> <y>",
                exitCode: 1,
              };
            }
            await browser.page.hover(x, y);
            return {
              stdout: output({ moved: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "down": {
            await browser.page.mouseDown(
              (cmdArgs[1] as "left" | "right" | "middle" | undefined) ?? "left",
            );
            return {
              stdout: output({ down: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "up": {
            await browser.page.mouseUp(
              (cmdArgs[1] as "left" | "right" | "middle" | undefined) ?? "left",
            );
            return {
              stdout: output({ up: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "wheel": {
            const dy = parseFloat(cmdArgs[1] ?? "100");
            const dx = parseFloat(cmdArgs[2] ?? "0");
            if (Number.isNaN(dy) || Number.isNaN(dx)) {
              return {
                stdout: "",
                stderr: "Usage: browse mouse wheel <dy> [dx]",
                exitCode: 1,
              };
            }
            await browser.page.mouseWheel(dy, dx);
            return {
              stdout: output({ wheeled: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          default:
            return {
              stdout: "",
              stderr: "Usage: browse mouse <move|down|up|wheel> ...",
              exitCode: 1,
            };
        }
      }

      case "scroll": {
        const browser = cli.getBrowserOrThrow();
        const numeric = cmdArgs.slice(0, 4).map((value) => parseFloat(value));
        if (
          cmdArgs.length >= 4 &&
          numeric.every((value) => !Number.isNaN(value))
        ) {
          await browser.page.scroll(
            numeric[0]!,
            numeric[1]!,
            numeric[2]!,
            numeric[3]!,
          );
          return {
            stdout: output({ scrolled: true }, json),
            stderr: "",
            exitCode: 0,
          };
        }

        const direction = (
          ["up", "down", "left", "right"].includes(cmdArgs[0] ?? "")
            ? cmdArgs[0]
            : "down"
        ) as "up" | "down" | "left" | "right";
        const amountArg = direction === cmdArgs[0] ? cmdArgs[1] : cmdArgs[0];
        const amount = amountArg ? parseInt(amountArg, 10) : 300;
        const selectorIndex = cmdArgs.findIndex(
          (arg) => arg === "--selector" || arg === "-s",
        );
        const selector =
          selectorIndex >= 0 ? cmdArgs[selectorIndex + 1] : undefined;
        if (amountArg && Number.isNaN(amount)) {
          return {
            stdout: "",
            stderr:
              "Usage: browse scroll <dir> [px] [--selector <sel>] | browse scroll <x> <y> <deltaX> <deltaY>",
            exitCode: 1,
          };
        }
        await browser.page.scrollDirection(direction, amount || 300, selector);
        return {
          stdout: output({ scrolled: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "scrollintoview":
      case "scrollinto": {
        const browser = cli.getBrowserOrThrow();
        const target = cmdArgs[0];
        if (!target) {
          return {
            stdout: "",
            stderr: "Usage: browse scrollintoview <ref|selector>",
            exitCode: 1,
          };
        }
        await browser.page.scrollIntoView(target);
        return {
          stdout: output({ scrolledIntoView: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "eval": {
        const browser = cli.getBrowserOrThrow();
        const expr = cmdArgs.join(" ");
        if (!expr)
          return {
            stdout: "",
            stderr: "Usage: browse eval <expression>",
            exitCode: 1,
          };
        const result = await browser.page.evaluate(expr);
        return { stdout: output({ result }, json), stderr: "", exitCode: 0 };
      }

      case "viewport": {
        const browser = cli.getBrowserOrThrow();
        const w = parseInt(cmdArgs[0], 10);
        const h = parseInt(cmdArgs[1], 10);
        if (Number.isNaN(w) || Number.isNaN(h)) {
          return {
            stdout: "",
            stderr: "Usage: browse viewport <width> <height>",
            exitCode: 1,
          };
        }
        await browser.page.setViewport(w, h, {
          deviceScaleFactor: flags.scale ? parseFloat(flags.scale) : undefined,
        });
        return {
          stdout: output({ viewport: { width: w, height: h } }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "set": {
        const browser = cli.getBrowserOrThrow();
        const sub = cmdArgs[0];
        switch (sub) {
          case "viewport": {
            const w = parseInt(cmdArgs[1], 10);
            const h = parseInt(cmdArgs[2], 10);
            const scale = cmdArgs[3] ? parseFloat(cmdArgs[3]) : undefined;
            if (Number.isNaN(w) || Number.isNaN(h)) {
              return {
                stdout: "",
                stderr: "Usage: browse set viewport <width> <height> [scale]",
                exitCode: 1,
              };
            }
            await browser.page.setViewport(w, h, { deviceScaleFactor: scale });
            return {
              stdout: output(
                { viewport: { width: w, height: h, scale } },
                json,
              ),
              stderr: "",
              exitCode: 0,
            };
          }
          case "device": {
            const name = cmdArgs.slice(1).join(" ");
            if (!name) {
              return {
                stdout: "",
                stderr: "Usage: browse set device <name>",
                exitCode: 1,
              };
            }
            await browser.page.setDevice(name);
            return {
              stdout: output({ device: name }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "headers": {
            const raw = cmdArgs.slice(1).join(" ");
            if (!raw)
              return {
                stdout: "",
                stderr: "Usage: browse set headers <json>",
                exitCode: 1,
              };
            await browser.page.setHeaders(parseJsonObject(raw));
            return {
              stdout: output({ headers: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "offline": {
            const mode = cmdArgs[1] ?? "on";
            await browser.page.setOffline(mode !== "off");
            return {
              stdout: output({ offline: mode !== "off" }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "credentials":
          case "auth": {
            const username = cmdArgs[1];
            const password = cmdArgs[2];
            if (!username || password === undefined) {
              return {
                stdout: "",
                stderr: "Usage: browse set credentials <user> <pass>",
                exitCode: 1,
              };
            }
            await browser.page.setCredentials(username, password);
            return {
              stdout: output({ credentials: true }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "media": {
            const scheme = (cmdArgs[1] ?? "light") as
              | "dark"
              | "light"
              | "no-preference";
            const reducedMotion = cmdArgs.includes("reduced-motion")
              ? "reduce"
              : "no-preference";
            await browser.page.setMedia(scheme, reducedMotion);
            return {
              stdout: output({ media: scheme, reducedMotion }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "geo":
          case "geolocation": {
            const lat = parseFloat(cmdArgs[1]);
            const lng = parseFloat(cmdArgs[2]);
            if (Number.isNaN(lat) || Number.isNaN(lng)) {
              return {
                stdout: "",
                stderr: "Usage: browse set geo <lat> <lng>",
                exitCode: 1,
              };
            }
            await browser.page.setGeolocation(lat, lng);
            return {
              stdout: output({ latitude: lat, longitude: lng }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          default:
            return {
              stdout: "",
              stderr: `Unknown set command: ${sub}`,
              exitCode: 1,
            };
        }
      }

      case "wait": {
        const browser = cli.getBrowserOrThrow();
        const timeout = flags.timeout ? parseInt(flags.timeout, 10) : 30000;

        if (cmdArgs[0] === "--text") {
          const text = cmdArgs[1];
          if (!text)
            return {
              stdout: "",
              stderr: "Usage: browse wait --text <text>",
              exitCode: 1,
            };
          await browser.page.waitForText(text, timeout);
        } else if (cmdArgs[0] === "--url") {
          const pattern = cmdArgs[1];
          if (!pattern)
            return {
              stdout: "",
              stderr: "Usage: browse wait --url <pattern>",
              exitCode: 1,
            };
          await browser.page.waitForUrl(pattern, timeout);
        } else if (cmdArgs[0] === "--load") {
          const state = cmdArgs[1] ?? "load";
          await browser.page.waitForLoad(state, timeout);
        } else if (cmdArgs[0] === "--fn") {
          const expression = cmdArgs.slice(1).join(" ");
          if (!expression)
            return {
              stdout: "",
              stderr: "Usage: browse wait --fn <expression>",
              exitCode: 1,
            };
          await browser.page.waitForFunction(expression, timeout);
        } else if (cmdArgs[0] === "selector") {
          const sel = cmdArgs[1];
          if (!sel)
            return {
              stdout: "",
              stderr: "Usage: browse wait selector <selector>",
              exitCode: 1,
            };
          const state =
            (flags.state as
              | "visible"
              | "hidden"
              | "attached"
              | "detached"
              | undefined) ?? "visible";
          await browser.page.waitForSelector(sel, timeout, state);
        } else if (cmdArgs[0] === "load") {
          await browser.page.waitForLoad(cmdArgs[1] ?? "load", timeout);
        } else if (cmdArgs[0] === "timeout") {
          const ms = parseInt(cmdArgs[1], 10);
          if (Number.isNaN(ms))
            return {
              stdout: "",
              stderr: "Usage: browse wait timeout <ms>",
              exitCode: 1,
            };
          await browser.page.waitForTimeout(ms);
        } else if (cmdArgs[0] && /^\d+$/.test(cmdArgs[0])) {
          await browser.page.waitForTimeout(parseInt(cmdArgs[0], 10));
        } else if (cmdArgs[0]) {
          const state =
            (flags.state as
              | "visible"
              | "hidden"
              | "attached"
              | "detached"
              | undefined) ?? "visible";
          await browser.page.waitForSelector(cmdArgs[0], timeout, state);
        } else {
          return {
            stdout: "",
            stderr: "Usage: browse wait <selector|ms|--text|--url|--load|--fn>",
            exitCode: 1,
          };
        }

        return {
          stdout: output({ waited: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "cookies": {
        const browser = cli.getBrowserOrThrow();
        const sub = cmdArgs[0] ?? "get";
        if (sub === "clear") {
          await browser.page.clearCookies();
          return {
            stdout: output({ cleared: true }, json),
            stderr: "",
            exitCode: 0,
          };
        }
        if (sub === "set") {
          const name = cmdArgs[1];
          const value = cmdArgs[2];
          if (!name || value === undefined) {
            return {
              stdout: "",
              stderr: "Usage: browse cookies set <name> <value>",
              exitCode: 1,
            };
          }
          const success = await browser.page.setCookie({
            name,
            value,
            url: flags.url,
            domain: flags.domain,
            path: flags.path,
            httpOnly: flags.httpOnly === "true",
            secure: flags.secure === "true",
            sameSite: flags.sameSite as "Strict" | "Lax" | "None" | undefined,
            expires: flags.expires ? parseInt(flags.expires, 10) : undefined,
          });
          return { stdout: output({ success }, json), stderr: "", exitCode: 0 };
        }
        const cookies = await browser.page.getCookies();
        return { stdout: output(cookies, true), stderr: "", exitCode: 0 };
      }

      case "storage": {
        const browser = cli.getBrowserOrThrow();
        const kind = cmdArgs[0];
        if (kind !== "local" && kind !== "session") {
          return {
            stdout: "",
            stderr: "Usage: browse storage <local|session> [key|set|clear]",
            exitCode: 1,
          };
        }
        const op = cmdArgs[1];
        if (op === "set") {
          const key = cmdArgs[2];
          const value = cmdArgs.slice(3).join(" ");
          if (!key || value === "") {
            return {
              stdout: "",
              stderr: `Usage: browse storage ${kind} set <key> <value>`,
              exitCode: 1,
            };
          }
          await browser.page.setStorage(kind, key, value);
          return {
            stdout: output({ stored: true }, json),
            stderr: "",
            exitCode: 0,
          };
        }
        if (op === "clear") {
          await browser.page.clearStorage(kind);
          return {
            stdout: output({ cleared: true }, json),
            stderr: "",
            exitCode: 0,
          };
        }
        const value = await browser.page.getStorage(kind, op);
        return { stdout: output(value, true), stderr: "", exitCode: 0 };
      }

      case "tab": {
        const browser = cli.getBrowserOrThrow();
        const sub = cmdArgs[0];
        if (!sub || sub === "list") {
          const tabs = await browser.listTabs();
          return { stdout: output(tabs, true), stderr: "", exitCode: 0 };
        }
        if (sub === "new") {
          const tabs = await browser.newTab(cmdArgs[1] ?? "about:blank");
          return { stdout: output(tabs, true), stderr: "", exitCode: 0 };
        }
        if (sub === "close") {
          const index =
            cmdArgs[1] !== undefined ? parseInt(cmdArgs[1], 10) : undefined;
          if (cmdArgs[1] !== undefined && Number.isNaN(index!)) {
            return {
              stdout: "",
              stderr: "Usage: browse tab close [index]",
              exitCode: 1,
            };
          }
          const tabs = await browser.closeTab(index);
          return { stdout: output(tabs, true), stderr: "", exitCode: 0 };
        }
        const index = parseInt(sub, 10);
        if (Number.isNaN(index)) {
          return {
            stdout: "",
            stderr: "Usage: browse tab [list|new|close|<index>]",
            exitCode: 1,
          };
        }
        const tabs = await browser.switchTab(index);
        return { stdout: output(tabs, true), stderr: "", exitCode: 0 };
      }

      default:
        return {
          stdout: "",
          stderr: `Unknown command: ${command}\n\nRun 'browse --help' for usage.`,
          exitCode: 1,
        };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { stdout: "", stderr: msg, exitCode: 1 };
  }
}
