import { readFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:https";
import { homedir } from "node:os";
import path from "node:path";
import { type WebSocket, WebSocketServer } from "ws";
import {
  type BridgeError,
  type BridgeEventMessage,
  type BridgeInvokeRequest,
  type BridgeResponseMessage,
  type BridgeSessionSnapshot,
  type BridgeStoredEvent,
  type BridgeVfsDeleteParams,
  type BridgeVfsListParams,
  type BridgeVfsReadParams,
  type BridgeVfsWriteParams,
  type BridgeWireMessage,
  createBridgeId,
  DEFAULT_BRIDGE_HOST,
  DEFAULT_BRIDGE_PORT,
  DEFAULT_BRIDGE_WS_PATH,
  DEFAULT_EVENT_LIMIT,
  DEFAULT_REQUEST_TIMEOUT_MS,
  extractToolError,
  getDefaultRawExecutionTool,
  isBridgeEventMessage,
  isBridgeHelloMessage,
  isBridgeResponseMessage,
  normalizeBridgeUrl,
  serializeForJson,
  toBridgeError,
} from "./protocol.js";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export interface BridgeSessionRecord {
  snapshot: BridgeSessionSnapshot;
  connectedAt: number;
  lastSeenAt: number;
  recentEvents: BridgeStoredEvent[];
  pendingCount: number;
}

interface SessionState extends BridgeSessionRecord {
  socket: WebSocket;
  pending: Map<string, PendingRequest>;
}

export interface BridgeServerOptions {
  host?: string;
  port?: number;
  certPath?: string;
  keyPath?: string;
  eventLimit?: number;
  requestTimeoutMs?: number;
  logger?: Pick<Console, "log" | "warn" | "error">;
}

export interface BridgeServerHandle {
  readonly host: string;
  readonly port: number;
  readonly httpUrl: string;
  readonly wsUrl: string;
  listSessions: () => BridgeSessionRecord[];
  getSession: (sessionId: string) => BridgeSessionRecord | undefined;
  getEvents: (sessionId: string, limit?: number) => BridgeStoredEvent[];
  invokeSession: <T = unknown>(request: BridgeInvokeRequest) => Promise<T>;
  close: () => Promise<void>;
}

const DEFAULT_CERT_DIR = path.join(homedir(), ".office-addin-dev-certs");

function jsonResponse(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return undefined;
  const body = Buffer.concat(chunks).toString("utf8").trim();
  if (!body) return undefined;
  return JSON.parse(body);
}

async function loadTlsMaterial(options: BridgeServerOptions) {
  const certPath =
    options.certPath ||
    process.env.OFFICE_BRIDGE_CERT ||
    path.join(DEFAULT_CERT_DIR, "localhost.crt");
  const keyPath =
    options.keyPath ||
    process.env.OFFICE_BRIDGE_KEY ||
    path.join(DEFAULT_CERT_DIR, "localhost.key");

  const [cert, key] = await Promise.all([
    readFile(certPath, "utf8"),
    readFile(keyPath, "utf8"),
  ]);

  return { cert, key, certPath, keyPath };
}

function routeMatch(
  pathname: string,
  pattern: RegExp,
): RegExpMatchArray | null {
  return pathname.match(pattern);
}

function publicSessionRecord(session: SessionState): BridgeSessionRecord {
  return {
    snapshot: session.snapshot,
    connectedAt: session.connectedAt,
    lastSeenAt: session.lastSeenAt,
    recentEvents: [...session.recentEvents],
    pendingCount: session.pending.size,
  };
}

function parseSocketMessage(raw: unknown): BridgeWireMessage | null {
  try {
    const text =
      typeof raw === "string"
        ? raw
        : raw instanceof Buffer
          ? raw.toString("utf8")
          : String(raw);
    return JSON.parse(text) as BridgeWireMessage;
  } catch {
    return null;
  }
}

function addStoredEvent(
  session: SessionState,
  eventLimit: number,
  event: string,
  payload?: unknown,
) {
  session.recentEvents.push({
    id: createBridgeId("event"),
    event,
    ts: Date.now(),
    payload: serializeForJson(payload),
  });
  if (session.recentEvents.length > eventLimit) {
    session.recentEvents.splice(0, session.recentEvents.length - eventLimit);
  }
}

function normalizeSessionSelector(value: string): string {
  return value.trim().toLowerCase();
}

export async function createBridgeServer(
  options: BridgeServerOptions = {},
): Promise<BridgeServerHandle> {
  const host = options.host ?? DEFAULT_BRIDGE_HOST;
  const port = options.port ?? DEFAULT_BRIDGE_PORT;
  const eventLimit = options.eventLimit ?? DEFAULT_EVENT_LIMIT;
  const requestTimeoutMs =
    options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const logger = options.logger ?? console;

  const tls = await loadTlsMaterial(options);
  const sessions = new Map<string, SessionState>();

  const server = createServer(
    { key: tls.key, cert: tls.cert },
    async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (!req.url) {
        jsonResponse(res, 400, {
          ok: false,
          error: { message: "Missing URL" },
        });
        return;
      }

      const url = new URL(req.url, `https://${host}:${port}`);
      const pathname = url.pathname;

      try {
        if (req.method === "GET" && pathname === "/health") {
          jsonResponse(res, 200, {
            ok: true,
            protocolVersion: 1,
            sessions: sessions.size,
            host,
            port,
          });
          return;
        }

        if (req.method === "POST" && pathname === "/shutdown") {
          jsonResponse(res, 200, {
            ok: true,
            message: "Bridge server shutting down",
          });
          setTimeout(() => {
            handle.close().catch((error) => {
              logger.error(`[bridge] failed to shut down: ${error}`);
            });
          }, 0);
          return;
        }

        if (req.method === "GET" && pathname === "/sessions") {
          const payload = [...sessions.values()].map(publicSessionRecord);
          jsonResponse(res, 200, { ok: true, sessions: payload });
          return;
        }

        const sessionMatch = routeMatch(pathname, /^\/sessions\/([^/]+)$/);
        if (req.method === "GET" && sessionMatch) {
          const sessionId = decodeURIComponent(sessionMatch[1]);
          const session = sessions.get(sessionId);
          if (!session) {
            jsonResponse(res, 404, {
              ok: false,
              error: { message: `Unknown session: ${sessionId}` },
            });
            return;
          }
          jsonResponse(res, 200, {
            ok: true,
            session: publicSessionRecord(session),
          });
          return;
        }

        const eventsMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/events$/,
        );
        if (req.method === "GET" && eventsMatch) {
          const sessionId = decodeURIComponent(eventsMatch[1]);
          const session = sessions.get(sessionId);
          if (!session) {
            jsonResponse(res, 404, {
              ok: false,
              error: { message: `Unknown session: ${sessionId}` },
            });
            return;
          }
          const limit = Number.parseInt(
            url.searchParams.get("limit") || "50",
            10,
          );
          jsonResponse(res, 200, {
            ok: true,
            events: session.recentEvents.slice(-Math.max(1, limit)),
          });
          return;
        }

        const refreshMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/refresh$/,
        );
        if (req.method === "POST" && refreshMatch) {
          const sessionId = decodeURIComponent(refreshMatch[1]);
          const snapshot = await invokeSessionInternal({
            sessionId,
            method: "refresh_session",
          });
          jsonResponse(res, 200, { ok: true, snapshot });
          return;
        }

        const metadataMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/metadata$/,
        );
        if (req.method === "POST" && metadataMatch) {
          const sessionId = decodeURIComponent(metadataMatch[1]);
          const snapshot = (await invokeSessionInternal({
            sessionId,
            method: "refresh_session",
          })) as BridgeSessionSnapshot;
          jsonResponse(res, 200, {
            ok: true,
            metadata: snapshot.documentMetadata ?? null,
            snapshot,
          });
          return;
        }

        const vfsListMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/vfs\/list$/,
        );
        if (req.method === "POST" && vfsListMatch) {
          const sessionId = decodeURIComponent(vfsListMatch[1]);
          const body = (await readJsonBody(req)) as
            | BridgeVfsListParams
            | undefined;
          const result = await invokeSessionInternal({
            sessionId,
            method: "vfs_list",
            params: body ?? {},
          });
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        const vfsReadMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/vfs\/read$/,
        );
        if (req.method === "POST" && vfsReadMatch) {
          const sessionId = decodeURIComponent(vfsReadMatch[1]);
          const body = (await readJsonBody(req)) as
            | BridgeVfsReadParams
            | undefined;
          const result = await invokeSessionInternal({
            sessionId,
            method: "vfs_read",
            params: body ?? {},
          });
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        const vfsWriteMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/vfs\/write$/,
        );
        if (req.method === "POST" && vfsWriteMatch) {
          const sessionId = decodeURIComponent(vfsWriteMatch[1]);
          const body = (await readJsonBody(req)) as
            | BridgeVfsWriteParams
            | undefined;
          const result = await invokeSessionInternal({
            sessionId,
            method: "vfs_write",
            params: body ?? {},
          });
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        const vfsDeleteMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/vfs\/delete$/,
        );
        if (req.method === "POST" && vfsDeleteMatch) {
          const sessionId = decodeURIComponent(vfsDeleteMatch[1]);
          const body = (await readJsonBody(req)) as
            | BridgeVfsDeleteParams
            | undefined;
          const result = await invokeSessionInternal({
            sessionId,
            method: "vfs_delete",
            params: body ?? {},
          });
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        const toolMatch = routeMatch(
          pathname,
          /^\/sessions\/([^/]+)\/tools\/([^/]+)$/,
        );
        if (req.method === "POST" && toolMatch) {
          const sessionId = decodeURIComponent(toolMatch[1]);
          const toolName = decodeURIComponent(toolMatch[2]);
          const body = (await readJsonBody(req)) as
            | { args?: unknown }
            | undefined;
          const result = await invokeSessionInternal({
            sessionId,
            method: "execute_tool",
            params: {
              toolName,
              args: body?.args ?? body ?? {},
            },
          });
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        const execMatch = routeMatch(pathname, /^\/sessions\/([^/]+)\/exec$/);
        if (req.method === "POST" && execMatch) {
          const sessionId = decodeURIComponent(execMatch[1]);
          const body = (await readJsonBody(req)) as {
            code?: string;
            explanation?: string;
            unsafe?: boolean;
          };
          const session = sessions.get(sessionId);
          if (!session) {
            jsonResponse(res, 404, {
              ok: false,
              error: { message: `Unknown session: ${sessionId}` },
            });
            return;
          }

          if (body?.unsafe !== false) {
            const result = await invokeSessionInternal({
              sessionId,
              method: "execute_unsafe_office_js",
              params: {
                code: body?.code ?? "",
                explanation: body?.explanation,
              },
            });
            jsonResponse(res, 200, { ok: true, result, mode: "unsafe" });
            return;
          }

          const toolName = getDefaultRawExecutionTool(session.snapshot.app);
          if (!toolName) {
            jsonResponse(res, 400, {
              ok: false,
              error: {
                message: `No default raw execution tool for app ${session.snapshot.app}`,
              },
            });
            return;
          }
          const result = await invokeSessionInternal({
            sessionId,
            method: "execute_tool",
            params: {
              toolName,
              args: {
                code: body?.code ?? "",
                explanation: body?.explanation,
              },
            },
          });
          jsonResponse(res, 200, {
            ok: true,
            result,
            toolName,
            mode: "sandbox",
          });
          return;
        }

        if (req.method === "POST" && pathname === "/rpc") {
          const body = (await readJsonBody(req)) as BridgeInvokeRequest;
          const result = await invokeSessionInternal(body);
          jsonResponse(res, 200, { ok: true, result });
          return;
        }

        jsonResponse(res, 404, {
          ok: false,
          error: { message: `Route not found: ${req.method} ${pathname}` },
        });
      } catch (error) {
        jsonResponse(res, 500, {
          ok: false,
          error: toBridgeError(error),
        });
      }
    },
  );

  const wsServer = new WebSocketServer({ noServer: true });

  function removeSession(sessionId: string, reason: string) {
    const session = sessions.get(sessionId);
    if (!session) return;
    for (const [requestId, pending] of session.pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(`Bridge session disconnected: ${reason}`));
      session.pending.delete(requestId);
    }
    sessions.delete(sessionId);
    logger.log(`[bridge] disconnected ${sessionId} (${reason})`);
  }

  function updateSessionEvent(sessionId: string, message: BridgeEventMessage) {
    const session = sessions.get(sessionId);
    if (!session) return;
    session.lastSeenAt = Date.now();

    if (message.event === "session_updated") {
      const snapshot = message.payload as BridgeSessionSnapshot;
      session.snapshot = snapshot;
      addStoredEvent(session, eventLimit, message.event, snapshot);
      return;
    }

    addStoredEvent(session, eventLimit, message.event, message.payload);
  }

  function handleSessionResponse(
    sessionId: string,
    response: BridgeResponseMessage,
  ) {
    const session = sessions.get(sessionId);
    if (!session) return;
    const pending = session.pending.get(response.requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    session.pending.delete(response.requestId);
    session.lastSeenAt = Date.now();

    if (response.ok) {
      pending.resolve(response.result);
      return;
    }

    const error = new Error(
      response.error?.message || "Bridge request failed",
    ) as Error & {
      code?: string;
      bridgeError?: BridgeError;
    };
    error.code = response.error?.code;
    error.bridgeError = response.error;
    pending.reject(error);
  }

  wsServer.on("connection", (socket) => {
    let sessionId: string | null = null;

    socket.on("message", (raw) => {
      const message = parseSocketMessage(raw);
      if (!message) return;

      if (isBridgeHelloMessage(message)) {
        sessionId = message.snapshot.sessionId;
        const existing = sessions.get(sessionId);
        if (existing) {
          try {
            existing.socket.close(1012, "replaced by new bridge connection");
          } catch {
            // Ignore close failure.
          }
          removeSession(sessionId, "replaced");
        }

        const next: SessionState = {
          socket,
          snapshot: message.snapshot,
          connectedAt: Date.now(),
          lastSeenAt: Date.now(),
          recentEvents: [],
          pending: new Map(),
          pendingCount: 0,
        };

        addStoredEvent(next, eventLimit, "bridge_connected", {
          sessionId,
          app: message.snapshot.app,
          documentId: message.snapshot.documentId,
        });

        sessions.set(sessionId, next);
        socket.send(
          JSON.stringify({
            type: "welcome",
            protocolVersion: 1,
            serverTime: Date.now(),
          }),
        );
        logger.log(
          `[bridge] connected ${sessionId} (${message.snapshot.app} ${message.snapshot.documentId})`,
        );
        return;
      }

      if (!sessionId) return;

      if (isBridgeEventMessage(message)) {
        updateSessionEvent(sessionId, message);
        return;
      }

      if (isBridgeResponseMessage(message)) {
        handleSessionResponse(sessionId, message);
      }
    });

    socket.on("close", (_code, reason) => {
      if (sessionId) {
        removeSession(sessionId, reason.toString() || "socket closed");
      }
    });

    socket.on("error", (error) => {
      logger.warn(`[bridge] websocket error: ${error.message}`);
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (session) {
          addStoredEvent(session, eventLimit, "socket_error", {
            message: error.message,
          });
        }
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const requestUrl = request.url || DEFAULT_BRIDGE_WS_PATH;
    const url = new URL(requestUrl, `https://${host}:${port}`);
    if (url.pathname !== DEFAULT_BRIDGE_WS_PATH) {
      socket.destroy();
      return;
    }

    wsServer.handleUpgrade(request, socket, head, (ws) => {
      wsServer.emit("connection", ws, request);
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const httpUrl = normalizeBridgeUrl(`https://${host}:${port}`, "http");
  const wsUrl = normalizeBridgeUrl(
    `wss://${host}:${port}${DEFAULT_BRIDGE_WS_PATH}`,
    "ws",
  );

  logger.log(
    `[bridge] listening on ${httpUrl} (${wsUrl}), cert=${tls.certPath}, key=${tls.keyPath}`,
  );

  async function invokeSessionInternal<T = unknown>(
    request: BridgeInvokeRequest,
  ): Promise<T> {
    const session = sessions.get(request.sessionId);
    if (!session) {
      throw new Error(`Unknown session: ${request.sessionId}`);
    }

    const requestId = createBridgeId("req");
    const timeoutMs = request.timeoutMs ?? requestTimeoutMs;

    const promise = new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        session.pending.delete(requestId);
        reject(
          new Error(
            `Bridge request timed out after ${timeoutMs}ms (${request.method})`,
          ),
        );
      }, timeoutMs);

      session.pending.set(requestId, { resolve, reject, timeout });
      session.pendingCount = session.pending.size;
    });

    socketSend(session.socket, {
      type: "invoke",
      requestId,
      method: request.method,
      params: request.params,
    });

    try {
      const result = await promise;
      session.pendingCount = session.pending.size;
      return result;
    } catch (error) {
      session.pendingCount = session.pending.size;
      throw error;
    }
  }

  function socketSend(socket: WebSocket, message: BridgeWireMessage) {
    socket.send(JSON.stringify(message));
  }

  const handle: BridgeServerHandle = {
    host,
    port,
    httpUrl,
    wsUrl,
    listSessions: () => [...sessions.values()].map(publicSessionRecord),
    getSession: (sessionId) => {
      const session = sessions.get(sessionId);
      return session ? publicSessionRecord(session) : undefined;
    },
    getEvents: (sessionId, limit = 50) => {
      const session = sessions.get(sessionId);
      if (!session) return [];
      return session.recentEvents.slice(-Math.max(1, limit));
    },
    invokeSession: invokeSessionInternal,
    close: async () => {
      for (const session of sessions.values()) {
        try {
          session.socket.close(1001, "bridge server shutting down");
        } catch {
          // Ignore close failure.
        }
      }
      sessions.clear();
      await new Promise<void>((resolve, reject) => {
        wsServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          server.close((closeError) => {
            if (closeError) {
              reject(closeError);
              return;
            }
            resolve();
          });
        });
      });
    },
  };

  return handle;
}

export function summarizeExecutionError(result: unknown): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  return extractToolError((result as { result?: unknown }).result);
}

export function findMatchingSession(
  sessions: BridgeSessionRecord[],
  selector: string,
): BridgeSessionRecord[] {
  const normalized = normalizeSessionSelector(selector);
  return sessions.filter((session) => {
    const haystacks = [
      session.snapshot.sessionId,
      session.snapshot.instanceId,
      session.snapshot.app,
      session.snapshot.appName,
      session.snapshot.documentId,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    return haystacks.some(
      (value) =>
        value === normalized ||
        value.startsWith(normalized) ||
        value.includes(normalized),
    );
  });
}
