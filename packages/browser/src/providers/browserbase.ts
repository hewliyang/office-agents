import type {
  BrowserProvider,
  BrowserSession,
  CreateSessionOptions,
} from "./types.js";

const BROWSERBASE_API = "https://api.browserbase.com";

export interface BrowserbaseConfig {
  apiKey: string;
  projectId: string;
  baseUrl?: string;
  timeoutSeconds?: number;
}

interface BrowserbaseSessionBody {
  projectId: string;
  browserSettings: {
    viewport: { width: number; height: number };
    context?: { id: string };
  };
  proxies?: boolean;
  timeout?: number;
}

interface BrowserbaseSessionResponse {
  id: string;
  connectUrl: string;
}

export class BrowserbaseProvider implements BrowserProvider {
  readonly name = "browserbase";
  private config: BrowserbaseConfig;

  constructor(config: BrowserbaseConfig) {
    this.config = config;
  }

  async createSession(options?: CreateSessionOptions): Promise<BrowserSession> {
    const baseUrl = this.config.baseUrl ?? BROWSERBASE_API;
    const body: BrowserbaseSessionBody = {
      projectId: this.config.projectId,
      browserSettings: {
        viewport: options?.viewport ?? { width: 1288, height: 711 },
      },
      timeout: this.config.timeoutSeconds ?? 300,
    };

    if (options?.contextId) {
      body.browserSettings.context = { id: options.contextId };
    }
    if (options?.proxy) {
      body.proxies = true;
    }

    const response = await fetch(`${baseUrl}/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": this.config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Browserbase session creation failed (${response.status}): ${text}`,
      );
    }

    const data: BrowserbaseSessionResponse = await response.json();
    if (!data.connectUrl || !data.id) {
      throw new Error("Browserbase session response missing connectUrl or id");
    }

    return {
      cdpUrl: data.connectUrl,
      sessionId: data.id,
      metadata: { ...data },
    };
  }

  async closeSession(sessionId: string): Promise<void> {
    const baseUrl = this.config.baseUrl ?? BROWSERBASE_API;
    await fetch(`${baseUrl}/v1/sessions/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bb-api-key": this.config.apiKey,
      },
      body: JSON.stringify({ status: "REQUEST_RELEASE" }),
    });
  }
}
