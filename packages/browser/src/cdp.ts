import type { ProtocolMapping } from "devtools-protocol/types/protocol-mapping.js";

export type CdpCommands = ProtocolMapping.Commands;
export type CdpEvents = ProtocolMapping.Events;

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
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: string };
}

interface CdpEventMessage {
  method: string;
  params?: Record<string, unknown>;
  sessionId?: string;
}

interface InflightRequest {
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
  method: string;
}

export class CdpClient {
  private ws: WebSocket;
  private nextId = 1;
  private inflight = new Map<number, InflightRequest>();
  private eventHandlers = new Map<string, Set<CdpEventHandler<never>>>();
  private sessions = new Map<string, CdpSession>();
  private closeHandlers = new Set<(reason: string) => void>();

  private constructor(ws: WebSocket) {
    this.ws = ws;
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

  static connect(wsUrl: string): Promise<CdpClient> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => resolve(new CdpClient(ws));
      ws.onerror = (e) =>
        reject(new Error(`CDP WebSocket connection failed: ${e}`));
    });
  }

  send<M extends CommandMethod>(
    method: M,
    ...args: SendArgs<M>
  ): Promise<CommandReturn<M>> {
    const id = this.nextId++;
    const params = args[0];
    const payload: Record<string, unknown> = { id, method };
    if (params !== undefined) payload.params = params;

    return new Promise((resolve, reject) => {
      this.inflight.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        method,
      });
      this.ws.send(JSON.stringify(payload));
    });
  }

  on<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event) ?? new Set();
    set.add(handler as CdpEventHandler<never>);
    this.eventHandlers.set(event, set);
  }

  off<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    this.eventHandlers.get(event)?.delete(handler as CdpEventHandler<never>);
  }

  onClose(handler: (reason: string) => void): void {
    this.closeHandlers.add(handler);
  }

  offClose(handler: (reason: string) => void): void {
    this.closeHandlers.delete(handler);
  }

  session(sessionId: string): CdpSession {
    let s = this.sessions.get(sessionId);
    if (!s) {
      s = new CdpSession(this, sessionId);
      this.sessions.set(sessionId, s);
    }
    return s;
  }

  async close(): Promise<void> {
    this.ws.close();
  }

  get readyState(): number {
    return this.ws.readyState;
  }

  private onMessage(event: MessageEvent): void {
    let data: CdpResponseMessage & CdpEventMessage;
    try {
      data = JSON.parse(typeof event.data === "string" ? event.data : "");
    } catch {
      return;
    }

    // Response to a command
    if (typeof data.id === "number") {
      const { sessionId } = data;
      const inflight = sessionId
        ? this.sessions.get(sessionId)?.consumeInflight(data.id)
        : this.inflight.get(data.id);

      if (inflight) {
        if (!sessionId) this.inflight.delete(data.id);
        if (data.error) {
          inflight.reject(
            new Error(`CDP ${inflight.method}: ${data.error.message}`),
          );
        } else {
          inflight.resolve(data.result ?? {});
        }
      }
      return;
    }

    // Event
    if (data.method) {
      const { sessionId } = data;
      const params = data.params ?? {};

      if (sessionId) {
        this.sessions.get(sessionId)?.dispatchEvent(data.method, params);
      }

      const handlers = this.eventHandlers.get(data.method);
      if (handlers) {
        for (const h of handlers) {
          try {
            (h as (p: unknown) => void)(params);
          } catch {}
        }
      }
    }
  }

  private rejectAllInflight(reason: string): void {
    for (const [_, req] of this.inflight) {
      req.reject(
        new Error(`CDP connection closed (${reason}), pending: ${req.method}`),
      );
    }
    this.inflight.clear();
    for (const session of this.sessions.values()) {
      session.rejectAll(reason);
    }
  }
}

export class CdpSession {
  private nextId = 1;
  private inflight = new Map<number, InflightRequest>();
  private eventHandlers = new Map<string, Set<CdpEventHandler<never>>>();

  constructor(
    private root: CdpClient,
    readonly id: string,
  ) {}

  send<M extends CommandMethod>(
    method: M,
    ...args: SendArgs<M>
  ): Promise<CommandReturn<M>> {
    const id = this.nextId++;
    const params = args[0];
    const payload: Record<string, unknown> = { id, method, sessionId: this.id };
    if (params !== undefined) payload.params = params;

    return new Promise((resolve, reject) => {
      this.inflight.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
        method,
      });
      // Access private ws via the root client
      const ws = (this.root as unknown as { ws: WebSocket }).ws;
      ws.send(JSON.stringify(payload));
    });
  }

  on<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    const set = this.eventHandlers.get(event) ?? new Set();
    set.add(handler as CdpEventHandler<never>);
    this.eventHandlers.set(event, set);
  }

  off<E extends EventMethod>(event: E, handler: CdpEventHandler<E>): void {
    this.eventHandlers.get(event)?.delete(handler as CdpEventHandler<never>);
  }

  consumeInflight(id: number): InflightRequest | undefined {
    const req = this.inflight.get(id);
    if (req) this.inflight.delete(id);
    return req;
  }

  dispatchEvent(method: string, params: Record<string, unknown>): void {
    const handlers = this.eventHandlers.get(method);
    if (handlers) {
      for (const h of handlers) {
        try {
          (h as (p: unknown) => void)(params);
        } catch {}
      }
    }
  }

  rejectAll(reason: string): void {
    for (const [_, req] of this.inflight) {
      req.reject(
        new Error(`CDP session closed (${reason}), pending: ${req.method}`),
      );
    }
    this.inflight.clear();
  }
}
