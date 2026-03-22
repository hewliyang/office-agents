export interface BrowserSession {
  cdpUrl: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface BrowserProvider {
  name: string;
  createSession(options?: CreateSessionOptions): Promise<BrowserSession>;
  closeSession(sessionId: string): Promise<void>;
}

export interface CreateSessionOptions {
  viewport?: { width: number; height: number };
  contextId?: string;
  proxy?: boolean;
}
