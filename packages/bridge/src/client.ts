import {
  BRIDGE_PROTOCOL_VERSION,
  type BridgeEventMessage,
  type BridgeHostInfo,
  type BridgeSessionSnapshot,
  type BridgeToolDefinition,
  type BridgeToolExecutionResult,
  type BridgeWireMessage,
  createBridgeId,
  extractToolError,
  extractToolImages,
  extractToolText,
  isBridgeInvokeMessage,
  normalizeBridgeUrl,
  serializeForJson,
  toBridgeError,
} from "./protocol.js";

declare const Office: any;
declare const Excel: any;
declare const PowerPoint: any;
declare const Word: any;

interface BridgeExecutableTool {
  name: string;
  label?: string;
  description?: string;
  parameters?: unknown;
  execute: (
    toolCallId: string,
    params: unknown,
    signal?: AbortSignal,
  ) => Promise<unknown>;
}

interface BridgeAdapter {
  tools: BridgeExecutableTool[];
  appName?: string;
  appVersion?: string;
  metadataTag?: string;
  getDocumentId: () => Promise<string>;
  getDocumentMetadata?: () => Promise<{
    metadata: object;
    nameMap?: Record<number, string>;
  } | null>;
  onToolResult?: (toolCallId: string, result: string, isError: boolean) => void;
}

export interface OfficeBridgeClientOptions {
  app: string;
  adapter: BridgeAdapter;
  enabled?: boolean;
  serverUrl?: string;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  forwardConsole?: boolean;
  exposeGlobal?: boolean;
}

export interface OfficeBridgeController {
  readonly enabled: boolean;
  readonly instanceId: string;
  refresh: () => Promise<BridgeSessionSnapshot | null>;
  stop: () => void;
}

interface PendingState {
  socket: WebSocket | null;
  stopped: boolean;
  reconnectTimer: number | null;
  reconnectDelayMs: number;
  snapshot: BridgeSessionSnapshot | null;
}

const BRIDGE_ENABLE_QUERY_KEY = "office_bridge";
const BRIDGE_URL_QUERY_KEY = "office_bridge_url";
const BRIDGE_ENABLE_STORAGE_KEY = "office-agents-bridge-enabled";
const BRIDGE_URL_STORAGE_KEY = "office-agents-bridge-url";
const BRIDGE_INSTANCE_PREFIX = "office-agents-bridge-instance";

function getStoredInstanceId(app: string): string {
  const key = `${BRIDGE_INSTANCE_PREFIX}:${app}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const next = createBridgeId(app).replace(/[^a-zA-Z0-9_-]/g, "_");
    sessionStorage.setItem(key, next);
    return next;
  } catch {
    return createBridgeId(app).replace(/[^a-zA-Z0-9_-]/g, "_");
  }
}

function isEnabledByDefault(): boolean {
  const params = new URLSearchParams(window.location.search);
  const query = params.get(BRIDGE_ENABLE_QUERY_KEY);
  if (query === "1" || query === "true") return true;
  if (query === "0" || query === "false") return false;

  try {
    const stored = localStorage.getItem(BRIDGE_ENABLE_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // Ignore storage failures.
  }

  return window.location.hostname === "localhost";
}

function resolveServerUrl(explicitUrl?: string): string {
  if (explicitUrl) return normalizeBridgeUrl(explicitUrl, "ws");

  const params = new URLSearchParams(window.location.search);
  const query = params.get(BRIDGE_URL_QUERY_KEY);
  if (query) return normalizeBridgeUrl(query, "ws");

  try {
    const stored = localStorage.getItem(BRIDGE_URL_STORAGE_KEY);
    if (stored) return normalizeBridgeUrl(stored, "ws");
  } catch {
    // Ignore storage failures.
  }

  return normalizeBridgeUrl(undefined, "ws");
}

function getToolDefinitions(adapter: BridgeAdapter): BridgeToolDefinition[] {
  return ((adapter.tools ?? []) as BridgeExecutableTool[]).map((tool) => ({
    name: tool.name,
    label: tool.label,
    description: tool.description,
    parameters: serializeForJson(tool.parameters),
  }));
}

async function captureSessionSnapshot(
  app: string,
  adapter: BridgeAdapter,
  instanceId: string,
  previous?: BridgeSessionSnapshot | null,
): Promise<BridgeSessionSnapshot> {
  const documentId = await adapter.getDocumentId();
  const meta = adapter.getDocumentMetadata
    ? await adapter.getDocumentMetadata().catch(() => null)
    : null;

  const diagnostics = Office?.context?.diagnostics;
  const hostInfo: BridgeHostInfo = {
    host: Office?.context?.host ? String(Office.context.host) : undefined,
    platform: Office?.context?.platform
      ? String(Office.context.platform)
      : undefined,
    officeVersion: diagnostics?.version,
    userAgent: navigator.userAgent,
    href: window.location.href,
    title: document.title,
  };

  const now = Date.now();

  return {
    sessionId: `${app}:${instanceId}`,
    instanceId,
    app,
    appName: adapter.appName,
    appVersion: adapter.appVersion,
    metadataTag: adapter.metadataTag,
    documentId,
    documentMetadata: meta?.metadata,
    tools: getToolDefinitions(adapter),
    host: hostInfo,
    connectedAt: previous?.connectedAt ?? now,
    updatedAt: now,
  };
}

function parseWireMessage(
  event: MessageEvent<string>,
): BridgeWireMessage | null {
  try {
    return JSON.parse(event.data) as BridgeWireMessage;
  } catch {
    return null;
  }
}

function scheduleMicrotask(action: () => void) {
  Promise.resolve()
    .then(action)
    .catch(() => undefined);
}

export function startOfficeBridge(
  options: OfficeBridgeClientOptions,
): OfficeBridgeController {
  const enabled = options.enabled ?? isEnabledByDefault();
  const instanceId = getStoredInstanceId(options.app);

  const state: PendingState = {
    socket: null,
    stopped: !enabled,
    reconnectTimer: null,
    reconnectDelayMs: options.reconnectBaseMs ?? 1_000,
    snapshot: null,
  };

  let queue = Promise.resolve<unknown>(undefined);
  let consoleRestore: (() => void) | null = null;

  const serverUrl = resolveServerUrl(options.serverUrl);
  const reconnectBaseMs = options.reconnectBaseMs ?? 1_000;
  const reconnectMaxMs = options.reconnectMaxMs ?? 10_000;

  const send = (message: BridgeWireMessage) => {
    if (!state.socket || state.socket.readyState !== WebSocket.OPEN) return;
    state.socket.send(JSON.stringify(message));
  };

  const sendEvent = (event: string, payload?: unknown) => {
    send({
      type: "event",
      event,
      ts: Date.now(),
      payload: serializeForJson(payload),
    } satisfies BridgeEventMessage);
  };

  const refresh = async () => {
    const snapshot = await captureSessionSnapshot(
      options.app,
      options.adapter,
      instanceId,
      state.snapshot,
    );
    state.snapshot = snapshot;
    sendEvent("session_updated", snapshot);
    return snapshot;
  };

  const executeTool = async (
    toolName: string,
    args: unknown,
  ): Promise<BridgeToolExecutionResult> => {
    const tool = ((options.adapter.tools ?? []) as BridgeExecutableTool[]).find(
      (candidate) => candidate.name === toolName,
    );
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const toolCallId = createBridgeId(toolName);
    const result = await tool.execute(toolCallId, args);
    const resultText = extractToolText(result);
    const images = extractToolImages(result);
    const error = extractToolError(result);
    const isError = Boolean(error);

    if (!isError) {
      options.adapter.onToolResult?.(toolCallId, resultText, false);
    }

    const executionResult: BridgeToolExecutionResult = {
      toolCallId,
      toolName,
      isError,
      result,
      resultText,
      images,
      error,
    };

    sendEvent("tool_executed", executionResult);
    scheduleMicrotask(() => {
      refresh().catch((refreshError) => {
        sendEvent("bridge_warning", {
          message: "Failed to refresh session after tool execution",
          error: toBridgeError(refreshError),
        });
      });
    });

    return executionResult;
  };

  const executeUnsafeOfficeJs = async (params: {
    code?: string;
    explanation?: string;
  }) => {
    const code = params.code?.trim();
    if (!code) {
      throw new Error("Missing code for execute_unsafe_office_js");
    }

    const evaluate = async (context: unknown, appGlobal: unknown) => {
      const scope = {
        context,
        Office,
        app: appGlobal,
        Excel: typeof Excel === "undefined" ? undefined : Excel,
        PowerPoint: typeof PowerPoint === "undefined" ? undefined : PowerPoint,
        Word: typeof Word === "undefined" ? undefined : Word,
        window,
        document,
        console,
        fetch: window.fetch.bind(window),
        localStorage,
        sessionStorage,
        globalThis,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
      };

      const fn = new Function(
        ...Object.keys(scope),
        `"use strict"; return (async () => {\n${code}\n})();`,
      ) as (...fnArgs: unknown[]) => Promise<unknown>;
      return await fn(...Object.values(scope));
    };

    let result: unknown;
    switch (options.app) {
      case "excel":
        result = await Excel.run(async (context: unknown) => {
          return await evaluate(context, Excel);
        });
        break;
      case "powerpoint":
        result = await PowerPoint.run(async (context: unknown) => {
          return await evaluate(context, PowerPoint);
        });
        break;
      case "word":
        result = await Word.run(async (context: unknown) => {
          return await evaluate(context, Word);
        });
        break;
      default:
        throw new Error(
          `Unsafe Office.js execution is not supported for app ${options.app}`,
        );
    }

    const executionResult = {
      mode: "unsafe" as const,
      app: options.app,
      result,
    };

    sendEvent("unsafe_office_js_executed", {
      explanation: params.explanation,
      result: executionResult,
    });
    scheduleMicrotask(() => {
      refresh().catch((refreshError) => {
        sendEvent("bridge_warning", {
          message: "Failed to refresh session after unsafe Office.js execution",
          error: toBridgeError(refreshError),
        });
      });
    });

    return executionResult;
  };

  const runQueued = <T>(work: () => Promise<T>): Promise<T> => {
    const task = queue.then(work, work);
    queue = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  };

  const handleInvoke = (message: BridgeWireMessage) => {
    if (!isBridgeInvokeMessage(message)) return;

    runQueued(async () => {
      try {
        let result: unknown;
        switch (message.method) {
          case "ping":
            result = {
              pong: true,
              now: Date.now(),
              sessionId:
                state.snapshot?.sessionId ?? `${options.app}:${instanceId}`,
            };
            break;
          case "get_session_snapshot":
            result = state.snapshot ?? (await refresh());
            break;
          case "refresh_session":
            result = await refresh();
            break;
          case "execute_tool": {
            const params = (message.params ?? {}) as {
              toolName?: string;
              args?: unknown;
            };
            if (!params.toolName) {
              throw new Error("Missing toolName for execute_tool");
            }
            result = await executeTool(params.toolName, params.args ?? {});
            break;
          }
          case "execute_unsafe_office_js": {
            result = await executeUnsafeOfficeJs(
              (message.params ?? {}) as {
                code?: string;
                explanation?: string;
              },
            );
            break;
          }
          default:
            throw new Error(`Unsupported bridge method: ${message.method}`);
        }

        send({
          type: "response",
          requestId: message.requestId,
          ok: true,
          result: serializeForJson(result),
        });
      } catch (error) {
        send({
          type: "response",
          requestId: message.requestId,
          ok: false,
          error: toBridgeError(error),
        });
      }
    }).catch((error) => {
      sendEvent("bridge_error", {
        message: "Unhandled bridge queue error",
        error: toBridgeError(error),
      });
    });
  };

  const clearReconnectTimer = () => {
    if (state.reconnectTimer !== null) {
      window.clearTimeout(state.reconnectTimer);
      state.reconnectTimer = null;
    }
  };

  const connect = async () => {
    if (state.stopped) return;

    const socket = new WebSocket(serverUrl);
    state.socket = socket;

    socket.addEventListener("open", () => {
      clearReconnectTimer();
      state.reconnectDelayMs = reconnectBaseMs;
      refresh()
        .then((snapshot) => {
          send({
            type: "hello",
            role: "office-addin",
            protocolVersion: BRIDGE_PROTOCOL_VERSION,
            snapshot,
          });
          sendEvent("bridge_status", {
            status: "connected",
            serverUrl,
            sessionId: snapshot.sessionId,
          });
        })
        .catch((error) => {
          sendEvent("bridge_error", {
            message: "Failed to build bridge snapshot",
            error: toBridgeError(error),
          });
        });
    });

    socket.addEventListener("message", (event) => {
      const message = parseWireMessage(event as MessageEvent<string>);
      if (!message) return;
      handleInvoke(message);
    });

    socket.addEventListener("close", () => {
      if (state.socket === socket) {
        state.socket = null;
      }
      if (state.stopped) return;

      clearReconnectTimer();
      state.reconnectTimer = window.setTimeout(() => {
        connect().catch(() => undefined);
      }, state.reconnectDelayMs);
      state.reconnectDelayMs = Math.min(
        state.reconnectDelayMs * 2,
        reconnectMaxMs,
      );
    });

    socket.addEventListener("error", () => {
      socket.close();
    });
  };

  const setupForwarders = () => {
    const handleWindowError = (event: ErrorEvent) => {
      sendEvent("window_error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: toBridgeError(event.error),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      sendEvent("unhandled_rejection", {
        reason: serializeForJson(event.reason),
      });
    };

    const handleFocus = () => {
      refresh().catch(() => undefined);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("focus", handleFocus);

    if (options.forwardConsole !== false) {
      const methods = ["debug", "info", "log", "warn", "error"] as const;
      const originals = new Map<
        (typeof methods)[number],
        (...args: unknown[]) => void
      >();
      let forwarding = false;

      for (const method of methods) {
        const original = console[method].bind(console);
        originals.set(method, original);
        console[method] = ((...args: unknown[]) => {
          original(...args);
          if (forwarding) return;
          forwarding = true;
          try {
            sendEvent("console", {
              level: method,
              args: args.map((arg) => serializeForJson(arg)),
            });
          } finally {
            forwarding = false;
          }
        }) as (typeof console)[typeof method];
      }

      consoleRestore = () => {
        for (const method of methods) {
          const original = originals.get(method);
          if (original) {
            console[method] = original as (typeof console)[typeof method];
          }
        }
      };
    }

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("focus", handleFocus);
      consoleRestore?.();
      consoleRestore = null;
    };
  };

  let teardown = () => undefined;
  if (enabled) {
    teardown = setupForwarders();
    connect().catch(() => undefined);
  }

  const controller: OfficeBridgeController = {
    enabled,
    instanceId,
    refresh: async () => {
      if (!enabled || state.stopped) return null;
      return refresh();
    },
    stop: () => {
      state.stopped = true;
      clearReconnectTimer();
      teardown();
      if (state.socket) {
        state.socket.close();
        state.socket = null;
      }
    },
  };

  if (enabled && options.exposeGlobal !== false) {
    (
      window as typeof window & { __OFFICE_BRIDGE__?: OfficeBridgeController }
    ).__OFFICE_BRIDGE__ = controller;
  }

  return controller;
}
