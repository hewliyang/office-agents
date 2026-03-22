import type { ProtocolMapping } from "devtools-protocol/types/protocol-mapping.js";
import type { ProtocolProxyApi } from "devtools-protocol/types/protocol-proxy-api.js";
import { Page } from "./page.js";

export type CdpCommands = ProtocolMapping.Commands;
export type CdpEvents = ProtocolMapping.Events;
export type CdpProtocolApi = ProtocolProxyApi.ProtocolApi;

export interface CdpClientOptions {
  requestTimeoutMs?: number;
}

type CommandMethod = keyof CdpCommands;
type EventMethod = keyof CdpEvents;

type CommandReturn<M extends CommandMethod> = CdpCommands[M]["returnType"];

type SendArgs<M extends CommandMethod> = CdpCommands[M]["paramsType"] extends []
  ? []
  : CdpCommands[M]["paramsType"] extends [(infer P)?]
    ? [params?: P]
    : CdpCommands[M]["paramsType"] extends [infer P]
      ? [params: P]
      : [params?: Record<string, unknown>];

type EventParams<E extends EventMethod> = CdpEvents[E] extends [
  infer P,
  ...unknown[],
]
  ? P
  : undefined;

export type CdpEventHandler<E extends EventMethod = EventMethod> = (
  params: EventParams<E>,
) => void;

interface CdpResponseMessage {
  id: number;
  sessionId?: string;
  result?: unknown;
  error?: { code: number; message: string; data?: string };
}

interface CdpEventMessage {
  method: string;
  params?: unknown;
  sessionId?: string;
}

interface InflightRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  method: string;
}

interface CdpCommandTarget {
  send<M extends CommandMethod>(
    method: M,
    ...args: SendArgs<M>
  ): Promise<CommandReturn<M>>;
  on<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void;
  off<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeError(error: unknown, prefix: string): Error {
  if (error instanceof Error) {
    return new Error(`${prefix}: ${error.message}`);
  }
  return new Error(`${prefix}: ${String(error)}`);
}

function formatCdpError(
  method: string,
  error: { code: number; message: string; data?: string },
): Error {
  const suffix = error.data ? ` (${error.data})` : "";
  return new Error(
    `CDP ${method} failed (${error.code}): ${error.message}${suffix}`,
  );
}

function sendDynamic(
  target: CdpCommandTarget,
  method: string,
  params?: unknown,
): Promise<unknown> {
  if (params === undefined) {
    return target.send(method as CommandMethod) as Promise<unknown>;
  }
  return target.send(
    method as CommandMethod,
    params as SendArgs<CommandMethod>[0],
  ) as Promise<unknown>;
}

function createProtocolApi(target: CdpCommandTarget): CdpProtocolApi {
  const domainCache = new Map<string, object>();

  return new Proxy({} as CdpProtocolApi, {
    get(_protocol, domainName) {
      if (typeof domainName !== "string") return undefined;

      let domain = domainCache.get(domainName);
      if (!domain) {
        domain = new Proxy(
          {},
          {
            get(_domain, memberName) {
              if (typeof memberName !== "string") return undefined;
              if (memberName === "on") {
                return (event: string, listener: (params: unknown) => void) => {
                  target.on(
                    `${domainName}.${event}` as EventMethod,
                    listener as CdpEventHandler<never>,
                  );
                };
              }
              if (memberName === "off") {
                return (event: string, listener: (params: unknown) => void) => {
                  target.off(
                    `${domainName}.${event}` as EventMethod,
                    listener as CdpEventHandler<never>,
                  );
                };
              }
              return (params?: unknown) =>
                sendDynamic(target, `${domainName}.${memberName}`, params);
            },
          },
        );
        domainCache.set(domainName, domain);
      }

      return domain;
    },
  });
}

function sendRequest<M extends CommandMethod>(options: {
  id: number;
  method: M;
  params: SendArgs<M>[0] | undefined;
  sessionId?: string;
  store: Map<number, InflightRequest>;
  timeoutMs?: number;
  sendRaw: (payload: Record<string, unknown>) => void;
}): Promise<CommandReturn<M>> {
  const payload: Record<string, unknown> = {
    id: options.id,
    method: options.method,
  };
  if (options.params !== undefined) payload.params = options.params;
  if (options.sessionId) payload.sessionId = options.sessionId;

  return new Promise((resolve, reject) => {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
        timeoutHandle = undefined;
      }
    };

    const inflight: InflightRequest = {
      method: options.method,
      resolve: (result) => {
        cleanup();
        resolve(result as CommandReturn<M>);
      },
      reject: (error) => {
        cleanup();
        reject(error);
      },
    };

    options.store.set(options.id, inflight);

    if (options.timeoutMs && options.timeoutMs > 0) {
      timeoutHandle = setTimeout(() => {
        if (options.store.get(options.id) !== inflight) return;
        options.store.delete(options.id);
        inflight.reject(
          new Error(
            `CDP ${options.method} timed out after ${options.timeoutMs}ms`,
          ),
        );
      }, options.timeoutMs);
    }

    try {
      options.sendRaw(payload);
    } catch (error) {
      options.store.delete(options.id);
      inflight.reject(
        normalizeError(error, `Failed to send CDP ${options.method}`),
      );
    }
  });
}

export class CdpClient {
  private ws: WebSocket;
  private nextId = 1;
  private inflight = new Map<number, InflightRequest>();
  private eventHandlers = new Map<string, Set<CdpEventHandler<never>>>();
  private sessions = new Map<string, CdpSession>();
  private closeHandlers = new Set<(reason: string) => void>();
  private requestTimeoutMs?: number;

  readonly api: CdpProtocolApi;

  private constructor(ws: WebSocket, options?: CdpClientOptions) {
    this.ws = ws;
    this.requestTimeoutMs = options?.requestTimeoutMs;
    this.api = createProtocolApi(this);

    ws.onmessage = (event) => this.onMessage(event);
    ws.onclose = (event) => {
      const reason = `close code=${event.code} reason=${event.reason || ""}`;
      this.rejectAllInflight(reason);
      for (const handler of this.closeHandlers) {
        try {
          handler(reason);
        } catch {}
      }
    };
    ws.onerror = () => {
      this.rejectAllInflight("websocket error");
    };
  }

  static connect(
    wsUrl: string,
    options?: CdpClientOptions,
  ): Promise<CdpClient> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => resolve(new CdpClient(ws, options));
      ws.onerror = (event) => {
        reject(normalizeError(event, "CDP WebSocket connection failed"));
      };
    });
  }

  send<M extends CommandMethod>(
    method: M,
    ...args: SendArgs<M>
  ): Promise<CommandReturn<M>> {
    const id = this.nextId++;
    return sendRequest({
      id,
      method,
      params: args[0],
      store: this.inflight,
      timeoutMs: this.requestTimeoutMs,
      sendRaw: (payload) => this.sendRaw(payload),
    });
  }

  on<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event) ?? new Set();
    set.add(handler as CdpEventHandler<never>);
    this.eventHandlers.set(event, set);
  }

  off<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event);
    if (!set) return;
    set.delete(handler as CdpEventHandler<never>);
    if (set.size === 0) {
      this.eventHandlers.delete(event);
    }
  }

  onClose(handler: (reason: string) => void): void {
    this.closeHandlers.add(handler);
  }

  offClose(handler: (reason: string) => void): void {
    this.closeHandlers.delete(handler);
  }

  session(sessionId: string): CdpSession {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = new CdpSession(this, sessionId);
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  async attachToFirstPage(): Promise<Page> {
    return Page.attachToFirstPage(this);
  }

  async attachToTarget(targetId: string): Promise<Page> {
    return Page.attachToTarget(this, targetId);
  }

  releaseSession(sessionId: string, reason = "session released"): void {
    this.detachSession(sessionId, reason);
  }

  setRequestTimeout(timeoutMs?: number): void {
    this.requestTimeoutMs = timeoutMs;
  }

  get defaultRequestTimeoutMs(): number | undefined {
    return this.requestTimeoutMs;
  }

  async close(): Promise<void> {
    if (
      this.ws.readyState === WebSocket.CLOSING ||
      this.ws.readyState === WebSocket.CLOSED
    ) {
      return;
    }
    this.ws.close();
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  sendRaw(payload: Record<string, unknown>): void {
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("CDP WebSocket is not open");
    }
    this.ws.send(JSON.stringify(payload));
  }

  private onMessage(event: MessageEvent): void {
    let data: Partial<CdpResponseMessage & CdpEventMessage>;
    try {
      data = JSON.parse(typeof event.data === "string" ? event.data : "");
    } catch {
      return;
    }

    if (typeof data.id === "number") {
      const inflight = data.sessionId
        ? this.sessions.get(data.sessionId)?.consumeInflight(data.id)
        : this.inflight.get(data.id);

      if (inflight) {
        if (!data.sessionId) this.inflight.delete(data.id);
        if (data.error) {
          inflight.reject(formatCdpError(inflight.method, data.error));
        } else {
          inflight.resolve(data.result);
        }
      }
      return;
    }

    if (typeof data.method !== "string") {
      return;
    }

    if (data.method === "Target.detachedFromTarget") {
      const sessionId =
        isRecord(data.params) && typeof data.params.sessionId === "string"
          ? data.params.sessionId
          : undefined;
      if (sessionId) {
        this.detachSession(sessionId, "target detached");
      }
    }

    if (data.sessionId) {
      this.sessions
        .get(data.sessionId)
        ?.dispatchEvent(data.method, data.params);
    }

    const handlers = this.eventHandlers.get(data.method);
    if (handlers) {
      for (const handler of handlers) {
        try {
          (handler as (params: unknown) => void)(data.params);
        } catch {}
      }
    }
  }

  private detachSession(sessionId: string, reason: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    this.sessions.delete(sessionId);
    session.markDetached(reason);
  }

  private rejectAllInflight(reason: string): void {
    for (const request of this.inflight.values()) {
      request.reject(
        new Error(
          `CDP connection closed (${reason}), pending: ${request.method}`,
        ),
      );
    }
    this.inflight.clear();

    for (const [sessionId, session] of this.sessions) {
      session.markDetached(reason);
      this.sessions.delete(sessionId);
    }
  }
}

export class CdpSession {
  private nextId = 1;
  private inflight = new Map<number, InflightRequest>();
  private eventHandlers = new Map<string, Set<CdpEventHandler<never>>>();
  private detachedReason: string | null = null;

  readonly api: CdpProtocolApi;

  constructor(
    private root: CdpClient,
    readonly id: string,
  ) {
    this.api = createProtocolApi(this);
  }

  get isDetached(): boolean {
    return this.detachedReason !== null;
  }

  send<M extends CommandMethod>(
    method: M,
    ...args: SendArgs<M>
  ): Promise<CommandReturn<M>> {
    if (this.detachedReason) {
      return Promise.reject(
        new Error(
          `CDP session ${this.id} is detached (${this.detachedReason})`,
        ),
      );
    }

    const id = this.nextId++;
    return sendRequest({
      id,
      method,
      params: args[0],
      sessionId: this.id,
      store: this.inflight,
      timeoutMs: this.root.defaultRequestTimeoutMs,
      sendRaw: (payload) => this.root.sendRaw(payload),
    });
  }

  on<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event) ?? new Set();
    set.add(handler as CdpEventHandler<never>);
    this.eventHandlers.set(event, set);
  }

  off<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event);
    if (!set) return;
    set.delete(handler as CdpEventHandler<never>);
    if (set.size === 0) {
      this.eventHandlers.delete(event);
    }
  }

  consumeInflight(id: number): InflightRequest | undefined {
    const request = this.inflight.get(id);
    if (request) {
      this.inflight.delete(id);
    }
    return request;
  }

  dispatchEvent(method: string, params: unknown): void {
    const handlers = this.eventHandlers.get(method);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        (handler as (payload: unknown) => void)(params);
      } catch {}
    }
  }

  markDetached(reason: string): void {
    if (this.detachedReason) return;
    this.detachedReason = reason;
    this.rejectAll(reason);
    this.eventHandlers.clear();
  }

  rejectAll(reason: string): void {
    for (const request of this.inflight.values()) {
      request.reject(
        new Error(`CDP session closed (${reason}), pending: ${request.method}`),
      );
    }
    this.inflight.clear();
  }
}
