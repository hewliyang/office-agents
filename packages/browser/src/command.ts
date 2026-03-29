import { Browser, type BrowserOptions } from "./browser.js";
import type { BrowserProvider } from "./providers/types.js";

let activeBrowser: Browser | null = null;

export interface BrowseSessionEvent {
  active: boolean;
  sessionId?: string;
}

type BrowseSessionListener = (event: BrowseSessionEvent) => void;

const sessionListeners = new Set<BrowseSessionListener>();

export function onBrowseSessionChange(
  listener: BrowseSessionListener,
): () => void {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function getBrowseSessionState(): BrowseSessionEvent {
  if (!activeBrowser) return { active: false };
  return {
    active: true,
    sessionId: activeBrowser.sessionId,
  };
}

function emitSessionChange(): void {
  const event = getBrowseSessionState();
  for (const listener of sessionListeners) {
    try {
      listener(event);
    } catch {}
  }
}

export interface BrowseCommandConfig {
  getProvider: () => BrowserProvider | null;
  writeFile?: (path: string, data: Uint8Array) => Promise<void>;
  launchBrowser?: (options: BrowserOptions) => Promise<Browser>;
}

let config: BrowseCommandConfig | null = null;
let lifecycleCleanupInstalled = false;

async function closeAndClearActiveBrowser(): Promise<void> {
  const browser = activeBrowser;
  if (!browser) return;
  activeBrowser = null;
  emitSessionChange();
  await browser.close().catch(() => {});
}

function installLifecycleCleanup(): void {
  if (lifecycleCleanupInstalled || typeof window === "undefined") {
    return;
  }
  lifecycleCleanupInstalled = true;

  const cleanup = () => {
    void closeAndClearActiveBrowser();
  };

  window.addEventListener("pagehide", cleanup);
  window.addEventListener("beforeunload", cleanup);
}

export function configureBrowseCommand(cfg: BrowseCommandConfig): void {
  config = cfg;
  installLifecycleCleanup();
}

function getProvider(): BrowserProvider {
  const provider = config?.getProvider();
  if (!provider) {
    throw new Error(
      "No browser provider configured. Set a browser provider in settings.",
    );
  }
  return provider;
}

const HELP = `Usage: browse <command> [options]

Core:
  open <url> [--wait=load|domcontentloaded|networkidle] [--timeout=ms]
  snapshot [-i|--interactive] [-c|--compact] [-d N|--depth=N]
  click <ref|selector>
  dblclick <ref|selector>
  fill <ref|selector> <value> [--no-enter]
  type <text> [--delay=ms]
  press <key>
  hover <ref|selector> | hover <x> <y>
  focus <ref|selector>
  check <ref|selector>
  uncheck <ref|selector>
  select <ref|selector> <value...>
  eval <expression>

Get:
  get url
  get title
  get text [ref|selector]
  get html [ref|selector]
  get value <ref|selector>
  get attr <ref|selector> <attr>
  get count <selector>
  get cdp-url

State:
  is visible <ref|selector>
  is enabled <ref|selector>
  is checked <ref|selector>

Wait:
  wait <selector>
  wait <ms>
  wait --text <text> [--timeout=ms]
  wait --url <pattern> [--timeout=ms]
  wait --load <state> [--timeout=ms]
  wait --fn <expression> [--timeout=ms]
  wait selector <sel> [--timeout=ms] [--state=visible|hidden|attached]
  wait timeout <ms>

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
  set headers <json>
  set offline [on|off]
  set media [dark|light|no-preference]
  set geo <lat> <lng>

Artifacts:
  screenshot [outfile] [--format=png|jpeg] [--quality=N] [--full-page]
  pdf
  download <url> <outfile>         Fetch a URL via the browser and save to VFS

Nav/session:
  reload
  back
  forward
  status
  stop

Options:
  --json
  --help`;

function parseArgs(args: string[]): {
  flags: Record<string, string>;
  positional: string[];
} {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--json") {
      flags.json = "true";
    } else if (arg === "--help" || arg === "-h") {
      flags.help = "true";
    } else if (
      arg === "--full-page" ||
      arg === "--no-enter" ||
      arg === "--interactive" ||
      arg === "--compact" ||
      arg === "-i" ||
      arg === "-c" ||
      arg === "--httpOnly" ||
      arg === "--secure"
    ) {
      flags[arg.replace(/^--?/, "")] = "true";
      positional.push(arg);
    } else if ((arg === "--depth" || arg === "-d") && args[i + 1]) {
      flags.depth = args[i + 1];
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

function requireBrowser(): Browser {
  if (!activeBrowser) {
    throw new Error("No browser session. Run 'browse open <url>' first.");
  }
  return activeBrowser;
}

export async function executeBrowseCommand(
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
      case "open": {
        const url = cmdArgs[0];
        if (!url) {
          return {
            stdout: "",
            stderr: "Usage: browse open <url>",
            exitCode: 1,
          };
        }
        await closeAndClearActiveBrowser();
        const launchBrowser = config?.launchBrowser ?? Browser.launch;
        activeBrowser = await launchBrowser({ provider: getProvider() });
        emitSessionChange();
        await activeBrowser.page.goto(url, {
          waitUntil: flags.wait ?? "load",
          timeoutMs: flags.timeout ? parseInt(flags.timeout, 10) : undefined,
        });
        emitSessionChange();
        const result: Record<string, unknown> = {
          url: await activeBrowser.page.getUrl(),
        };
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "status": {
        if (!activeBrowser) {
          return {
            stdout: output({ status: "disconnected" }, json),
            stderr: "",
            exitCode: 0,
          };
        }
        const url = await activeBrowser.page.getUrl();
        const title = await activeBrowser.page.getTitle();
        return {
          stdout: output(
            {
              status: "connected",
              sessionId: activeBrowser.sessionId,
              url,
              title,
            },
            json,
          ),
          stderr: "",
          exitCode: 0,
        };
      }

      case "stop": {
        await closeAndClearActiveBrowser();
        return {
          stdout: output({ stopped: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "reload": {
        const browser = requireBrowser();
        const result = await browser.page.reload();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "back": {
        const browser = requireBrowser();
        const result = await browser.page.goBack();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "forward": {
        const browser = requireBrowser();
        const result = await browser.page.goForward();
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "snapshot": {
        const browser = requireBrowser();
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
        const browser = requireBrowser();
        const outFile = cmdArgs[0];
        const result = await browser.page.screenshot({
          format: (flags.format as "png" | "jpeg") ?? "png",
          quality: flags.quality ? parseInt(flags.quality, 10) : undefined,
          fullPage: flags["full-page"] === "true",
        });

        if (outFile) {
          if (!config?.writeFile) {
            return {
              stdout: "",
              stderr: "File writing not available",
              exitCode: 1,
            };
          }
          const binary = Uint8Array.from(atob(result.base64), (c) =>
            c.charCodeAt(0),
          );
          await config.writeFile(outFile, binary);
          return {
            stdout: `Saved ${result.format ?? "screenshot"} to ${outFile} (${binary.length} bytes)`,
            stderr: "",
            exitCode: 0,
          };
        }

        return { stdout: output(result, true), stderr: "", exitCode: 0 };
      }

      case "pdf": {
        const browser = requireBrowser();
        const result = await browser.page.pdf();
        return { stdout: output(result, true), stderr: "", exitCode: 0 };
      }

      case "download": {
        const browser = requireBrowser();
        const url = cmdArgs[0];
        const outFile = cmdArgs[1];
        if (!url || !outFile) {
          return {
            stdout: "",
            stderr: "Usage: browse download <url> <outfile>",
            exitCode: 1,
          };
        }
        if (!config?.writeFile) {
          return {
            stdout: "",
            stderr: "File writing not available",
            exitCode: 1,
          };
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
        await config.writeFile(outFile, binary);

        return {
          stdout: `Downloaded ${url} to ${outFile} (${binary.length} bytes)`,
          stderr: "",
          exitCode: 0,
        };
      }

      case "get": {
        const browser = requireBrowser();
        const what = cmdArgs[0];
        if (!what) {
          return {
            stdout: "",
            stderr:
              "Usage: browse get <url|title|text|html|value|attr|count|cdp-url>",
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
        const target = cmdArgs[0];
        if (!target)
          return {
            stdout: "",
            stderr: "Usage: browse click <ref|selector>",
            exitCode: 1,
          };
        const result = looksLikeSnapshotRef(target)
          ? await browser.page.clickRef(target)
          : await browser.page.clickSelector(target);
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "dblclick": {
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
        const text = cmdArgs.join(" ");
        if (!text)
          return {
            stdout: "",
            stderr: "Usage: browse type <text>",
            exitCode: 1,
          };
        const result = await browser.page.type(text, {
          delay: flags.delay ? parseInt(flags.delay, 10) : undefined,
        });
        return { stdout: output(result, json), stderr: "", exitCode: 0 };
      }

      case "press": {
        const browser = requireBrowser();
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

      case "fill": {
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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

      case "scroll": {
        const browser = requireBrowser();
        const [sx, sy, dx, dy] = cmdArgs.map(parseFloat);
        if ([sx, sy, dx, dy].some(Number.isNaN)) {
          return {
            stdout: "",
            stderr: "Usage: browse scroll <x> <y> <deltaX> <deltaY>",
            exitCode: 1,
          };
        }
        await browser.page.scroll(sx, sy, dx, dy);
        return {
          stdout: output({ scrolled: true }, json),
          stderr: "",
          exitCode: 0,
        };
      }

      case "eval": {
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
          case "media": {
            const scheme = (cmdArgs[1] ?? "light") as
              | "dark"
              | "light"
              | "no-preference";
            await browser.page.setMedia(scheme);
            return {
              stdout: output({ media: scheme }, json),
              stderr: "",
              exitCode: 0,
            };
          }
          case "geo": {
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
        const browser = requireBrowser();
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
            (flags.state as "visible" | "hidden" | "attached" | undefined) ??
            "visible";
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
            (flags.state as "visible" | "hidden" | "attached" | undefined) ??
            "visible";
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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
        const browser = requireBrowser();
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

export async function closeActiveBrowser(): Promise<void> {
  await closeAndClearActiveBrowser();
}

export function disposeBrowseCommand(): void {
  config = null;
  void closeAndClearActiveBrowser();
}

export function getActiveBrowser(): Browser | null {
  return activeBrowser;
}
