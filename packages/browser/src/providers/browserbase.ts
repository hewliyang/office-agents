import type {
  BrowserProvider,
  BrowserSession,
  CreateSessionOptions,
} from "./types.js";

const BROWSERBASE_API = "https://api.browserbase.com";

export interface BrowserbaseConfig {
  apiKey: string;
  projectId?: string;
  baseUrl?: string;
  corsProxyUrl?: string;
  region?: "us-west-2" | "us-east-1" | "eu-central-1" | "ap-southeast-1";
  keepAlive?: boolean;
  timeoutSeconds?: number;
  proxy?: boolean;
}

interface BrowserbaseCreateBody {
  projectId?: string;
  region?: string;
  keepAlive?: boolean;
  timeout?: number;
  proxies?: boolean;
  browserSettings?: {
    viewport?: { width: number; height: number };
    context?: { id: string };
  };
}

interface BrowserbaseCreateResponse {
  id: string;
  connectUrl: string;
  signingKey: string;
  seleniumRemoteUrl: string;
  createdAt: string;
  expiresAt: string;
  projectId: string;
  status: string;
  region: string;
}

export class BrowserbaseProvider implements BrowserProvider {
  readonly name = "browserbase";
  private config: BrowserbaseConfig;

  constructor(config: BrowserbaseConfig) {
    this.config = config;
  }

  private proxyFetch(url: string, init: RequestInit): Promise<Response> {
    if (this.config.corsProxyUrl) {
      return fetch(
        `${this.config.corsProxyUrl}/?url=${encodeURIComponent(url)}`,
        init,
      );
    }
    return fetch(url, init);
  }

  async createSession(options?: CreateSessionOptions): Promise<BrowserSession> {
    const baseUrl = this.config.baseUrl ?? BROWSERBASE_API;
    const body: BrowserbaseCreateBody = {};

    if (this.config.projectId) {
      body.projectId = this.config.projectId;
    }
    if (this.config.region) {
      body.region = this.config.region;
    }
    if (this.config.keepAlive !== undefined) {
      body.keepAlive = this.config.keepAlive;
    }
    if (this.config.timeoutSeconds !== undefined) {
      body.timeout = this.config.timeoutSeconds;
    }
    if (this.config.proxy ?? options?.proxy) {
      body.proxies = true;
    }

    const browserSettings: BrowserbaseCreateBody["browserSettings"] = {};
    if (options?.viewport) {
      browserSettings.viewport = options.viewport;
    }
    if (options?.contextId) {
      browserSettings.context = { id: options.contextId };
    }
    if (Object.keys(browserSettings).length > 0) {
      body.browserSettings = browserSettings;
    }

    const response = await this.proxyFetch(`${baseUrl}/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BB-API-Key": this.config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Browserbase authentication failed (${response.status}). Check your BROWSERBASE_API_KEY.`,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Browserbase session creation failed (${response.status}): ${text}`,
      );
    }

    const data: BrowserbaseCreateResponse = await response.json();
    if (!data.connectUrl || !data.id) {
      throw new Error("Browserbase response missing connectUrl or id");
    }

    return {
      cdpUrl: data.connectUrl,
      sessionId: data.id,
    };
  }

  async closeSession(sessionId: string): Promise<void> {
    const baseUrl = this.config.baseUrl ?? BROWSERBASE_API;
    await this.proxyFetch(`${baseUrl}/v1/sessions/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BB-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({ status: "REQUEST_RELEASE" }),
    }).catch(() => {});
  }
}
