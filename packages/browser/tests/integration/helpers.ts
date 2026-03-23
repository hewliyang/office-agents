import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const CHROMIUM_EXECUTABLE_ENV = "CHROMIUM_EXECUTABLE_PATH";

export function findChromiumExecutable(): string | null {
  const configured = process.env[CHROMIUM_EXECUTABLE_ENV];
  if (configured) return configured;
  const executablePath = chromium.executablePath();
  return existsSync(executablePath) ? executablePath : null;
}

export const chromiumExecutable = findChromiumExecutable();

export interface LaunchedChromium {
  cdpUrl: string;
  close: () => Promise<void>;
}

async function waitForCdpUrl(
  userDataDir: string,
  timeoutMs = 15000,
): Promise<string> {
  const devToolsFile = path.join(userDataDir, "DevToolsActivePort");
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const file = await readFile(devToolsFile, "utf8");
      const [portLine] = file.trim().split("\n");
      const port = Number.parseInt(portLine, 10);
      if (!Number.isNaN(port) && port > 0) {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (!response.ok) {
          throw new Error(`CDP version endpoint failed (${response.status})`);
        }
        const data = (await response.json()) as {
          webSocketDebuggerUrl?: string;
        };
        if (data.webSocketDebuggerUrl) {
          return data.webSocketDebuggerUrl;
        }
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Timed out waiting for Chromium CDP endpoint");
}

async function closeChromium(process: ReturnType<typeof spawn>): Promise<void> {
  if (process.exitCode !== null) return;
  process.kill("SIGTERM");
  const exited = await Promise.race([
    once(process, "exit").then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
  ]);
  if (!exited && process.exitCode === null) {
    process.kill("SIGKILL");
    await once(process, "exit");
  }
}

export async function launchChromium(): Promise<LaunchedChromium> {
  if (!chromiumExecutable) {
    throw new Error("No Chromium executable found");
  }

  const userDataDir = await mkdtemp(path.join(os.tmpdir(), "office-browser-"));
  const proc = spawn(
    chromiumExecutable,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--no-first-run",
      "--no-default-browser-check",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  let stderr = "";
  proc.stderr?.on("data", (chunk: Buffer | string) => {
    stderr += chunk.toString();
  });

  try {
    const cdpUrl = await waitForCdpUrl(userDataDir);
    return {
      cdpUrl,
      close: async () => {
        await closeChromium(proc);
        await rm(userDataDir, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await closeChromium(proc).catch(() => {});
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to launch Chromium: ${message}${stderr ? `\n${stderr.trim()}` : ""}`,
    );
  }
}

export interface FixtureServer {
  server: http.Server;
  baseUrl: string;
}

export async function startFixtureServer(): Promise<FixtureServer> {
  const server = http.createServer((req, res) => {
    const url = req.url ?? "/";
    const handler = fixtureRoutes[url];
    if (handler) {
      handler(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not found");
    }
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to determine fixture server address");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

export async function stopServer(server: http.Server): Promise<void> {
  server.close();
  await once(server, "close");
}

function html(res: http.ServerResponse, body: string) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

const fixtureRoutes: Record<string, (res: http.ServerResponse) => void> = {
  "/interactive": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Interactive Test</title></head>
<body>
  <main>
    <h1>Interactive Test</h1>
    <a id="nav" href="/destination">Go next</a>
    <label>Name <input id="name" value="" /></label>
    <button id="submit" type="button">Submit</button>
    <button id="increment" type="button">Increment</button>
    <div id="count">0</div>
    <div id="output"></div>
    <div id="delayed" hidden>Waiting</div>
  </main>
  <script>
    const count = document.querySelector("#count");
    const output = document.querySelector("#output");
    const delayed = document.querySelector("#delayed");
    const input = document.querySelector("#name");
    document.querySelector("#submit").addEventListener("click", () => {
      output.textContent = input.value;
    });
    document.querySelector("#increment").addEventListener("click", () => {
      count.textContent = String(Number(count.textContent || "0") + 1);
    });
    setTimeout(() => {
      delayed.hidden = false;
      delayed.textContent = "Ready";
    }, 350);
  </script>
</body>
</html>`,
    ),

  "/destination": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Destination Page</title></head>
<body>
  <h1>Destination Page</h1>
  <p id="message">Arrived successfully.</p>
</body>
</html>`,
    ),

  "/form": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Form Page</title></head>
<body>
  <h1>Form Page</h1>
  <form id="form">
    <label>Email <input id="email" type="email" value="" /></label>
    <label>Password <input id="password" type="password" value="" /></label>
    <label>Bio <textarea id="bio"></textarea></label>
    <label>
      Color
      <select id="color">
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="blue">Blue</option>
      </select>
    </label>
    <label><input id="agree" type="checkbox" /> I agree</label>
    <label><input name="plan" type="radio" value="free" checked /> Free</label>
    <label><input name="plan" type="radio" value="pro" /> Pro</label>
    <button id="submit-form" type="button">Submit</button>
    <div id="form-output"></div>
  </form>
  <script>
    document.querySelector("#submit-form").addEventListener("click", () => {
      const email = document.querySelector("#email").value;
      const color = document.querySelector("#color").value;
      const agree = document.querySelector("#agree").checked;
      document.querySelector("#form-output").textContent =
        JSON.stringify({ email, color, agree });
    });
  </script>
</body>
</html>`,
    ),

  "/visibility": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Visibility Test</title></head>
<body>
  <div id="visible-el">Visible</div>
  <div id="hidden-display" style="display:none">Hidden display</div>
  <div id="hidden-visibility" style="visibility:hidden">Hidden visibility</div>
  <div id="hidden-opacity" style="opacity:0">Hidden opacity</div>
  <div id="zero-size" style="width:0;height:0;overflow:hidden">Zero</div>
  <button id="enabled-btn">Enabled</button>
  <button id="disabled-btn" disabled>Disabled</button>
  <input id="checked-cb" type="checkbox" checked />
  <input id="unchecked-cb" type="checkbox" />
</body>
</html>`,
    ),

  "/scroll": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Scroll Test</title></head>
<body style="height:5000px">
  <div id="top">Top of page</div>
  <div id="middle" style="position:absolute;top:2500px">Middle of page</div>
  <div id="bottom" style="position:absolute;top:4900px">Bottom of page</div>
  <div id="hover-target" style="padding:20px;background:#eee">Hover me</div>
  <div id="hover-output"></div>
  <script>
    document.querySelector("#hover-target").addEventListener("mouseenter", () => {
      document.querySelector("#hover-output").textContent = "hovered";
    });
  </script>
</body>
</html>`,
    ),

  "/waiting": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Waiting Test</title></head>
<body>
  <div id="appears-later" style="display:none">Appeared</div>
  <div id="text-later"></div>
  <div id="condition-val" data-ready="false">Not ready</div>
  <script>
    setTimeout(() => {
      document.querySelector("#appears-later").style.display = "block";
    }, 200);
    setTimeout(() => {
      document.querySelector("#text-later").textContent = "Dynamic text loaded";
    }, 200);
    setTimeout(() => {
      const el = document.querySelector("#condition-val");
      el.dataset.ready = "true";
      el.textContent = "Ready";
    }, 200);
  </script>
</body>
</html>`,
    ),

  "/storage": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Storage Test</title></head>
<body>
  <h1>Storage Test</h1>
  <script>
    localStorage.setItem("existing-key", "existing-value");
    sessionStorage.setItem("session-key", "session-value");
  </script>
</body>
</html>`,
    ),

  "/evaluate": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Evaluate Test</title></head>
<body>
  <div id="data" data-value="42">Content</div>
  <script>
    window.customFunction = function(a, b) { return a + b; };
    window.asyncFunction = function() {
      return new Promise(resolve => setTimeout(() => resolve("async-result"), 50));
    };
  </script>
</body>
</html>`,
    ),

  "/empty": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>Empty Page</title></head>
<body></body>
</html>`,
    ),

  "/history-a": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>History A</title></head>
<body><h1>Page A</h1><a href="/history-b">Go to B</a></body>
</html>`,
    ),

  "/history-b": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>History B</title></head>
<body><h1>Page B</h1><a href="/history-c">Go to C</a></body>
</html>`,
    ),

  "/history-c": (res) =>
    html(
      res,
      `<!doctype html>
<html>
<head><meta charset="utf-8" /><title>History C</title></head>
<body><h1>Page C</h1></body>
</html>`,
    ),
};
