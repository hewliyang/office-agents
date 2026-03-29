import type {
  BrowserProvider,
  BrowserSession,
  CreateSessionOptions,
} from "./types.js";

const BROWSER_USE_API = "https://api.browser-use.com";

export interface BrowserUseConfig {
  apiKey: string;
  baseUrl?: string;
  proxyCountryCode?: string;
  timeoutMinutes?: number;
  profileId?: string;
}

interface BrowserUseSessionBody {
  profile_id?: string;
  proxy_country_code?: string;
  timeout?: number;
}

interface BrowserUseSessionResponse {
  id: string;
  cdpUrl: string;
}

interface CdpVersionResponse {
  webSocketDebuggerUrl?: string;
}

export class BrowserUseProvider implements BrowserProvider {
  readonly name = "browser-use";
  private config: BrowserUseConfig;

  constructor(config: BrowserUseConfig) {
    this.config = config;
  }

  async createSession(
    _options?: CreateSessionOptions,
  ): Promise<BrowserSession> {
    const baseUrl = this.config.baseUrl ?? BROWSER_USE_API;
    const body: BrowserUseSessionBody = {};

    if (this.config.profileId) {
      body.profile_id = this.config.profileId;
    }
    if (this.config.proxyCountryCode) {
      body.proxy_country_code = this.config.proxyCountryCode;
    }
    body.timeout = this.config.timeoutMinutes ?? 5;

    const response = await fetch(`${baseUrl}/api/v2/browsers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Browser-Use-API-Key": this.config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Browser Use authentication failed (${response.status}). Check your BROWSER_USE_API_KEY.`,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Browser Use session creation failed (${response.status}): ${text}`,
      );
    }

    const data: BrowserUseSessionResponse = await response.json();
    if (!data.cdpUrl || !data.id) {
      throw new Error("Browser Use response missing cdpUrl or id");
    }

    // Browser Use returns a base URL — resolve the actual WebSocket debugger URL
    const cdpUrl = await this.resolveWebSocketUrl(data.cdpUrl);

    return {
      cdpUrl,
      sessionId: data.id,
    };
  }

  private async resolveWebSocketUrl(baseUrl: string): Promise<string> {
    const versionResp = await fetch(`${baseUrl}/json/version`);
    if (!versionResp.ok) {
      throw new Error(
        `Failed to fetch CDP version info (${versionResp.status})`,
      );
    }
    const version: CdpVersionResponse = await versionResp.json();
    const wsUrl = version.webSocketDebuggerUrl;
    if (!wsUrl) {
      throw new Error("Browser Use CDP endpoint missing webSocketDebuggerUrl");
    }
    return wsUrl;
  }

  async closeSession(sessionId: string): Promise<void> {
    const baseUrl = this.config.baseUrl ?? BROWSER_USE_API;
    await fetch(`${baseUrl}/api/v2/browsers/${sessionId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Browser-Use-API-Key": this.config.apiKey,
      },
      body: JSON.stringify({ action: "stop" }),
    }).catch(() => {});
  }
}
