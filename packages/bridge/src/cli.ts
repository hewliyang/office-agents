#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import path from "node:path";
import process from "node:process";
import {
  type BridgeInvokeMethod,
  type BridgeSessionSnapshot,
  type BridgeStoredEvent,
  type BridgeVfsEntry,
  type BridgeVfsReadResult,
  DEFAULT_BRIDGE_HTTP_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  getDefaultRawExecutionTool,
  normalizeBridgeUrl,
  serializeForJson,
} from "./protocol.js";
import {
  type BridgeServerHandle,
  type BridgeSessionRecord,
  createBridgeServer,
  findMatchingSession,
  summarizeExecutionError,
} from "./server.js";

interface ParsedArgs {
  command: string | undefined;
  rest: string[];
  flags: Map<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const flags = new Map<string, string | boolean>();
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i];

    if (current === "--") {
      positionals.push(...argv.slice(i + 1));
      break;
    }

    if (current.startsWith("--")) {
      const eqIdx = current.indexOf("=");
      if (eqIdx !== -1) {
        flags.set(current.slice(2, eqIdx), current.slice(eqIdx + 1));
        continue;
      }
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags.set(current.slice(2), true);
        continue;
      }
      flags.set(current.slice(2), next);
      i++;
      continue;
    }
    positionals.push(current);
  }

  return {
    command: positionals[0],
    rest: positionals.slice(1),
    flags,
  };
}

function getFlag(args: ParsedArgs, name: string): string | undefined {
  const value = args.flags.get(name);
  return typeof value === "string" ? value : undefined;
}

function hasFlag(args: ParsedArgs, name: string): boolean {
  return args.flags.get(name) === true;
}

function printUsage() {
  console.log(`office-bridge

Commands:
  serve [--host HOST] [--port PORT]
  stop [--url URL]
  list [--json]
  wait [selector] [--app APP] [--document DOCUMENT] [--timeout MS] [--json]
  inspect [session]
  metadata [session]
  events [session] [--limit N]
  tool [session] <toolName> [--input JSON | --file PATH | --stdin]
  exec [session] [--code JS | --file PATH | --stdin] [--sandbox]
  rpc [session] <method> [--input JSON | --file PATH | --stdin]
  screenshot [session] [--pages PAGES | --sheet-id ID --range A1:B2 | --slide-index N] [--out PATH]
  vfs ls [session] [prefix]
  vfs pull [session] <remotePath> [localPath]
  vfs push [session] <localPath> <remotePath>
  vfs rm [session] <remotePath>

Examples:
  office-bridge serve
  office-bridge stop
  office-bridge list
  office-bridge inspect word
  office-bridge exec word --code "return { href: window.location.href, title: document.title }"
  office-bridge exec word --sandbox --code "const body = context.document.body; body.load('text'); await context.sync(); return body.text;"
  office-bridge tool excel screenshot_range --input '{"sheetId":1,"range":"A1:F20"}' --out range.png
  office-bridge screenshot word --pages 1 --out page1.png
  office-bridge vfs ls word /home/user
  office-bridge vfs pull word /home/user/uploads/report.docx ./report.docx
`);
}

function getBaseUrl(args: ParsedArgs): string {
  return normalizeBridgeUrl(
    getFlag(args, "url") || DEFAULT_BRIDGE_HTTP_URL,
    "http",
  );
}

function requestJson<T>(
  args: ParsedArgs,
  method: string,
  pathname: string,
  body?: unknown,
): Promise<T> {
  const baseUrl = new URL(getBaseUrl(args));
  const timeoutMs = Number.parseInt(
    getFlag(args, "timeout") || String(DEFAULT_REQUEST_TIMEOUT_MS),
    10,
  );

  return new Promise<T>((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = httpsRequest(
      {
        protocol: baseUrl.protocol,
        hostname: baseUrl.hostname,
        port: baseUrl.port,
        path: pathname,
        method,
        rejectUnauthorized: false,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          try {
            const parsed = text
              ? (JSON.parse(text) as T & {
                  ok?: boolean;
                  error?: { message?: string };
                })
              : ({} as T & { ok?: boolean; error?: { message?: string } });
            if ((parsed as { ok?: boolean }).ok === false) {
              reject(
                new Error(
                  (parsed as { error?: { message?: string } }).error?.message ||
                    "Bridge request failed",
                ),
              );
              return;
            }
            resolve(parsed as T);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });
    req.on("error", (error) => reject(error));
    if (payload) req.write(payload);
    req.end();
  });
}

function probeBridge(baseUrlValue: string): Promise<unknown> {
  const baseUrl = new URL(normalizeBridgeUrl(baseUrlValue, "http"));

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        protocol: baseUrl.protocol,
        hostname: baseUrl.hostname,
        port: baseUrl.port,
        path: "/health",
        method: "GET",
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.setTimeout(3_000, () => {
      req.destroy(new Error("Timed out probing bridge health"));
    });
    req.on("error", (error) => reject(error));
    req.end();
  });
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function loadJsonPayload(args: ParsedArgs): Promise<unknown> {
  const inline = getFlag(args, "input");
  if (inline) return JSON.parse(inline);

  const file = getFlag(args, "file");
  if (file) {
    const content = await readFile(file, "utf8");
    return JSON.parse(content);
  }

  if (hasFlag(args, "stdin") || !process.stdin.isTTY) {
    const content = (await readStdin()).trim();
    if (!content) return {};
    return JSON.parse(content);
  }

  return {};
}

async function loadCode(args: ParsedArgs): Promise<string> {
  const inline = getFlag(args, "code");
  if (inline) return inline;

  const file = getFlag(args, "file");
  if (file) return readFile(file, "utf8");

  if (hasFlag(args, "stdin") || !process.stdin.isTTY) {
    return readStdin();
  }

  throw new Error("Missing code. Use --code, --file, or --stdin.");
}

async function fetchSessions(args: ParsedArgs): Promise<BridgeSessionRecord[]> {
  const response = await requestJson<{
    ok: true;
    sessions: BridgeSessionRecord[];
  }>(args, "GET", "/sessions");
  return response.sessions;
}

function filterSessions(
  sessions: BridgeSessionRecord[],
  args: ParsedArgs,
): BridgeSessionRecord[] {
  const app = getFlag(args, "app")?.toLowerCase();
  const documentId = getFlag(args, "document")?.toLowerCase();

  return sessions.filter((session) => {
    const appMatches = app ? session.snapshot.app.toLowerCase() === app : true;
    const documentMatches = documentId
      ? session.snapshot.documentId.toLowerCase().includes(documentId)
      : true;
    return appMatches && documentMatches;
  });
}

async function resolveSession(
  args: ParsedArgs,
  selector: string | undefined,
): Promise<BridgeSessionRecord> {
  const filtered = filterSessions(await fetchSessions(args), args);
  if (filtered.length === 0) {
    throw new Error(
      "No bridge sessions available. Start the server and open an add-in.",
    );
  }

  if (!selector) {
    if (filtered.length === 1) return filtered[0];
    throw new Error("Multiple sessions available. Pass a session selector.");
  }

  const matches = findMatchingSession(filtered, selector);
  if (matches.length === 1) return matches[0];
  if (matches.length === 0) throw new Error(`No session matches "${selector}"`);
  throw new Error(
    `Session selector "${selector}" is ambiguous: ${matches.map((session) => session.snapshot.sessionId).join(", ")}`,
  );
}

function sanitizeImagesForOutput(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeImagesForOutput(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [key, current] of Object.entries(record)) {
    sanitized[key] = sanitizeImagesForOutput(current);
  }

  const mimeType = typeof record.mimeType === "string" ? record.mimeType : null;
  const imageType = typeof record.type === "string" ? record.type : null;
  const data = typeof record.data === "string" ? record.data : null;
  const isImagePayload =
    data !== null && (mimeType?.startsWith("image/") || imageType === "image");

  if (isImagePayload) {
    sanitized.data = "[omitted image base64]";
    sanitized.base64Length = data.length;
  }

  return sanitized;
}

function printJson(value: unknown) {
  console.log(
    JSON.stringify(serializeForJson(sanitizeImagesForOutput(value)), null, 2),
  );
}

function describeSession(session: BridgeSessionRecord): string {
  const updatedAgoSeconds = Math.round(
    (Date.now() - session.lastSeenAt) / 1000,
  );
  return `${session.snapshot.sessionId}  app=${session.snapshot.app}  document=${session.snapshot.documentId}  tools=${session.snapshot.tools.length}  lastSeen=${updatedAgoSeconds}s ago`;
}

function decodeBase64ToBuffer(dataBase64: string): Buffer {
  return Buffer.from(dataBase64, "base64");
}

function imageExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/bmp":
      return ".bmp";
    default:
      return ".bin";
  }
}

function extractImages(
  value: unknown,
): Array<{ data: string; mimeType: string }> {
  if (!value || typeof value !== "object") return [];
  const images = (value as { images?: unknown }).images;
  if (!Array.isArray(images)) return [];
  return images.filter((image): image is { data: string; mimeType: string } =>
    Boolean(
      image &&
        typeof image === "object" &&
        typeof (image as { data?: unknown }).data === "string" &&
        typeof (image as { mimeType?: unknown }).mimeType === "string",
    ),
  );
}

function buildImageOutputPath(
  basePath: string,
  imageIndex: number,
  imageCount: number,
  mimeType: string,
): string {
  if (basePath.includes("{n}")) {
    return basePath.replaceAll("{n}", String(imageIndex + 1));
  }

  const extension = path.extname(basePath);
  const fallbackExtension = imageExtensionFromMimeType(mimeType);
  if (imageCount === 1) {
    return extension ? basePath : `${basePath}${fallbackExtension}`;
  }

  const withoutExtension = extension
    ? basePath.slice(0, -extension.length)
    : basePath;
  const finalExtension = extension || fallbackExtension;
  return `${withoutExtension}-${imageIndex + 1}${finalExtension}`;
}

async function saveImagesToPaths(
  images: Array<{ data: string; mimeType: string }>,
  outputPath: string,
): Promise<string[]> {
  const savedPaths: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const finalPath = buildImageOutputPath(
      outputPath,
      i,
      images.length,
      image.mimeType,
    );
    await saveLocalFile(finalPath, decodeBase64ToBuffer(image.data));
    savedPaths.push(finalPath);
  }
  return savedPaths;
}

async function maybeSaveToolImages(
  value: unknown,
  outputPath: string | undefined,
): Promise<string[]> {
  if (!outputPath) return [];
  const images = extractImages(value);
  if (images.length === 0) {
    throw new Error("No images were returned by this command");
  }
  return saveImagesToPaths(images, outputPath);
}

async function saveLocalFile(localPath: string, data: Buffer): Promise<void> {
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, data);
}

async function commandServe(args: ParsedArgs) {
  const host = getFlag(args, "host");
  const port = getFlag(args, "port")
    ? Number.parseInt(getFlag(args, "port") as string, 10)
    : undefined;
  const baseUrl = normalizeBridgeUrl(
    `https://${host || "localhost"}:${port || 4017}`,
    "http",
  );

  let server: BridgeServerHandle | null = null;
  try {
    server = await createBridgeServer({ host, port });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Error & { code?: string }).code === "EADDRINUSE"
    ) {
      try {
        await probeBridge(baseUrl);
        console.log(`Bridge server already running at ${baseUrl}`);
        return;
      } catch {
        throw error;
      }
    }
    throw error;
  }

  const shutdown = async () => {
    if (server) {
      await server.close();
    }
    process.exit(0);
  };

  process.on("SIGINT", () => {
    shutdown().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  });
  process.on("SIGTERM", () => {
    shutdown().catch((error) => {
      console.error(error);
      process.exit(1);
    });
  });

  console.log(`Bridge server running at ${server.httpUrl}`);
  await new Promise(() => undefined);
}

async function commandStop(args: ParsedArgs) {
  try {
    const response = await requestJson<{ ok: true; message: string }>(
      args,
      "POST",
      "/shutdown",
      {},
    );
    console.log(response.message);
  } catch (error) {
    try {
      await probeBridge(getBaseUrl(args));
      throw error;
    } catch {
      console.log("Bridge server is not running.");
    }
  }
}

async function commandList(args: ParsedArgs) {
  const sessions = filterSessions(await fetchSessions(args), args);
  if (hasFlag(args, "json")) {
    printJson(sessions);
    return;
  }

  if (sessions.length === 0) {
    console.log("No sessions connected.");
    return;
  }

  for (const session of sessions) {
    console.log(describeSession(session));
  }
}

async function commandWait(args: ParsedArgs) {
  const selector = args.rest[0];
  const timeoutMs = Number.parseInt(
    getFlag(args, "timeout") || String(DEFAULT_REQUEST_TIMEOUT_MS),
    10,
  );
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const sessions = filterSessions(await fetchSessions(args), args);
    const matches = selector
      ? findMatchingSession(sessions, selector)
      : sessions;
    if (matches.length > 0) {
      const session = matches[0];
      if (hasFlag(args, "json")) {
        printJson(session);
      } else {
        console.log(describeSession(session));
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for bridge session after ${timeoutMs}ms`);
}

async function commandInspect(args: ParsedArgs) {
  const session = await resolveSession(args, args.rest[0]);
  const response = await requestJson<{
    ok: true;
    session: BridgeSessionRecord;
  }>(
    args,
    "GET",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}`,
  );
  printJson(response.session);
}

async function commandMetadata(args: ParsedArgs) {
  const session = await resolveSession(args, args.rest[0]);
  const response = await requestJson<{
    ok: true;
    metadata: unknown;
    snapshot: BridgeSessionSnapshot;
  }>(
    args,
    "POST",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/metadata`,
    {},
  );
  printJson(response);
}

async function commandEvents(args: ParsedArgs) {
  const session = await resolveSession(args, args.rest[0]);
  const limit = Number.parseInt(getFlag(args, "limit") || "50", 10);
  const response = await requestJson<{ ok: true; events: BridgeStoredEvent[] }>(
    args,
    "GET",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/events?limit=${Math.max(1, limit)}`,
  );
  printJson(response.events);
}

async function commandTool(args: ParsedArgs) {
  const selector = args.rest.length > 1 ? args.rest[0] : undefined;
  const toolName = args.rest.length > 1 ? args.rest[1] : args.rest[0];
  if (!toolName) {
    throw new Error(
      "Usage: office-bridge tool [session] <toolName> [--input JSON | --file PATH] [--out PATH]",
    );
  }
  const session = await resolveSession(args, selector);
  const payload = await loadJsonPayload(args);
  const response = await requestJson<{ ok: true; result: unknown }>(
    args,
    "POST",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/tools/${encodeURIComponent(toolName)}`,
    { args: payload },
  );
  const savedPaths = await maybeSaveToolImages(
    response.result,
    getFlag(args, "out"),
  );
  if (savedPaths.length > 0 && !hasFlag(args, "json")) {
    for (const savedPath of savedPaths) {
      console.log(`Saved image: ${savedPath}`);
    }
  }
  printJson(response.result);
}

async function commandExec(args: ParsedArgs) {
  const session = await resolveSession(args, args.rest[0]);
  const code = await loadCode(args);
  const explanation = getFlag(args, "explanation");
  const sandbox = hasFlag(args, "sandbox");

  if (sandbox && !getDefaultRawExecutionTool(session.snapshot.app)) {
    throw new Error(
      `No default raw execution tool for app ${session.snapshot.app}`,
    );
  }

  const response = await requestJson<{
    ok: true;
    result: unknown;
    toolName?: string;
    mode: "unsafe" | "sandbox";
  }>(
    args,
    "POST",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/exec`,
    { code, explanation, unsafe: !sandbox },
  );
  if (response.mode === "sandbox") {
    const summaryError = summarizeExecutionError(response.result);
    if (summaryError) {
      console.error(
        `Tool ${response.toolName} reported an error: ${summaryError}`,
      );
    }
  }
  const savedPaths = await maybeSaveToolImages(
    response.result,
    getFlag(args, "out"),
  );
  if (savedPaths.length > 0 && !hasFlag(args, "json")) {
    for (const savedPath of savedPaths) {
      console.log(`Saved image: ${savedPath}`);
    }
  }
  printJson(response);
}

async function commandRpc(args: ParsedArgs) {
  const selector = args.rest.length > 1 ? args.rest[0] : undefined;
  const method = (args.rest.length > 1 ? args.rest[1] : args.rest[0]) as
    | BridgeInvokeMethod
    | undefined;
  if (!method) {
    throw new Error(
      "Usage: office-bridge rpc [session] <method> [--input JSON | --file PATH]",
    );
  }
  const session = await resolveSession(args, selector);
  const payload = await loadJsonPayload(args);
  const response = await requestJson<{ ok: true; result: unknown }>(
    args,
    "POST",
    "/rpc",
    {
      sessionId: session.snapshot.sessionId,
      method,
      params: payload,
      timeoutMs: Number.parseInt(
        getFlag(args, "timeout") || String(DEFAULT_REQUEST_TIMEOUT_MS),
        10,
      ),
    },
  );
  printJson(response.result);
}

async function commandScreenshot(args: ParsedArgs) {
  const selector = args.rest[0];
  const session = await resolveSession(args, selector);
  const explanation = getFlag(args, "explanation");

  let toolName: string;
  let payload: Record<string, unknown> = {};
  let defaultOutputBase: string;

  switch (session.snapshot.app) {
    case "word": {
      toolName = "screenshot_document";
      const pages = getFlag(args, "pages");
      if (pages) payload.pages = pages;
      if (explanation) payload.explanation = explanation;
      defaultOutputBase = "word-screenshot.png";
      break;
    }
    case "excel": {
      toolName = "screenshot_range";
      const sheetId = getFlag(args, "sheet-id");
      const range = getFlag(args, "range");
      if (!sheetId || !range) {
        throw new Error(
          "Excel screenshots require --sheet-id <id> and --range <A1:B2>",
        );
      }
      payload = {
        sheetId: Number.parseInt(sheetId, 10),
        range,
      };
      if (Number.isNaN(payload.sheetId as number)) {
        throw new Error(`Invalid --sheet-id: ${sheetId}`);
      }
      if (explanation) payload.explanation = explanation;
      defaultOutputBase = `excel-${range.replaceAll(/[^A-Za-z0-9_-]/g, "_")}.png`;
      break;
    }
    case "powerpoint": {
      toolName = "screenshot_slide";
      const slideIndex = getFlag(args, "slide-index") || getFlag(args, "slide");
      if (!slideIndex) {
        throw new Error(
          "PowerPoint screenshots require --slide-index <0-based index>",
        );
      }
      payload = {
        slide_index: Number.parseInt(slideIndex, 10),
      };
      if (Number.isNaN(payload.slide_index as number)) {
        throw new Error(`Invalid --slide-index: ${slideIndex}`);
      }
      if (explanation) payload.explanation = explanation;
      defaultOutputBase = `powerpoint-slide-${payload.slide_index}.png`;
      break;
    }
    default:
      throw new Error(
        `Screenshot is not supported for app ${session.snapshot.app}`,
      );
  }

  const response = await requestJson<{ ok: true; result: unknown }>(
    args,
    "POST",
    `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/tools/${encodeURIComponent(toolName)}`,
    { args: payload },
  );

  const outputPath = getFlag(args, "out") || defaultOutputBase;
  const savedPaths = await maybeSaveToolImages(response.result, outputPath);
  if (hasFlag(args, "json")) {
    printJson({
      toolName,
      savedPaths,
      result: response.result,
    });
    return;
  }
  for (const savedPath of savedPaths) {
    console.log(`Saved screenshot: ${savedPath}`);
  }
}

async function commandVfs(args: ParsedArgs) {
  const subcommand = args.rest[0];
  if (!subcommand) {
    throw new Error("Usage: office-bridge vfs <ls|pull|push|rm> [session] ...");
  }

  switch (subcommand) {
    case "ls": {
      const selector = args.rest.length > 2 ? args.rest[1] : undefined;
      const prefix = args.rest.length > 2 ? args.rest[2] : args.rest[1];
      const session = await resolveSession(args, selector);
      const response = await requestJson<{
        ok: true;
        result: BridgeVfsEntry[];
      }>(
        args,
        "POST",
        `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/vfs/list`,
        prefix ? { prefix } : {},
      );
      if (hasFlag(args, "json")) {
        printJson(response.result);
        return;
      }
      for (const entry of response.result) {
        console.log(`${entry.path}\t${entry.byteLength}`);
      }
      return;
    }
    case "pull": {
      const selector = args.rest.length > 3 ? args.rest[1] : undefined;
      const remotePath = args.rest.length > 3 ? args.rest[2] : args.rest[1];
      const localPathArg = args.rest.length > 3 ? args.rest[3] : args.rest[2];
      if (!remotePath) {
        throw new Error(
          "Usage: office-bridge vfs pull [session] <remotePath> [localPath]",
        );
      }
      const session = await resolveSession(args, selector);
      const response = await requestJson<{
        ok: true;
        result: BridgeVfsReadResult;
      }>(
        args,
        "POST",
        `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/vfs/read`,
        { path: remotePath, encoding: "base64" },
      );
      const result = response.result;
      const localPath = localPathArg || path.basename(remotePath);
      if (!result.dataBase64) {
        throw new Error(`No binary data returned for ${remotePath}`);
      }
      const buffer = decodeBase64ToBuffer(result.dataBase64);
      await saveLocalFile(localPath, buffer);
      if (hasFlag(args, "json")) {
        printJson({
          remotePath,
          localPath,
          byteLength: result.byteLength,
        });
        return;
      }
      console.log(
        `Pulled ${remotePath} -> ${localPath} (${result.byteLength} bytes)`,
      );
      return;
    }
    case "push": {
      const selector = args.rest.length > 3 ? args.rest[1] : undefined;
      const localPath = args.rest.length > 3 ? args.rest[2] : args.rest[1];
      const remotePath = args.rest.length > 3 ? args.rest[3] : args.rest[2];
      if (!localPath || !remotePath) {
        throw new Error(
          "Usage: office-bridge vfs push [session] <localPath> <remotePath>",
        );
      }
      const session = await resolveSession(args, selector);
      const data = await readFile(localPath);
      const response = await requestJson<{ ok: true; result: unknown }>(
        args,
        "POST",
        `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/vfs/write`,
        { path: remotePath, dataBase64: data.toString("base64") },
      );
      if (hasFlag(args, "json")) {
        printJson(response.result);
        return;
      }
      console.log(`Pushed ${localPath} -> ${remotePath}`);
      return;
    }
    case "rm": {
      const selector = args.rest.length > 2 ? args.rest[1] : undefined;
      const remotePath = args.rest.length > 2 ? args.rest[2] : args.rest[1];
      if (!remotePath) {
        throw new Error("Usage: office-bridge vfs rm [session] <remotePath>");
      }
      const session = await resolveSession(args, selector);
      const response = await requestJson<{ ok: true; result: unknown }>(
        args,
        "POST",
        `/sessions/${encodeURIComponent(session.snapshot.sessionId)}/vfs/delete`,
        { path: remotePath },
      );
      if (hasFlag(args, "json")) {
        printJson(response.result);
        return;
      }
      console.log(`Deleted ${remotePath}`);
      return;
    }
    default:
      throw new Error(`Unknown vfs subcommand: ${subcommand}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args.command;

  if (!command || command === "help" || hasFlag(args, "help")) {
    printUsage();
    return;
  }

  switch (command) {
    case "serve":
      await commandServe(args);
      return;
    case "stop":
      await commandStop(args);
      return;
    case "list":
      await commandList(args);
      return;
    case "wait":
      await commandWait(args);
      return;
    case "inspect":
      await commandInspect(args);
      return;
    case "metadata":
      await commandMetadata(args);
      return;
    case "events":
      await commandEvents(args);
      return;
    case "tool":
      await commandTool(args);
      return;
    case "exec":
      await commandExec(args);
      return;
    case "rpc":
      await commandRpc(args);
      return;
    case "screenshot":
      await commandScreenshot(args);
      return;
    case "vfs":
      await commandVfs(args);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
