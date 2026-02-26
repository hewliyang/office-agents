export interface OAuthCredentials {
  refresh: string;
  access: string;
  expires: number;
}

export type OAuthFlowState =
  | { step: "idle" }
  | { step: "awaiting-code"; verifier: string; oauthState?: string }
  | { step: "exchanging" }
  | { step: "connected" }
  | { step: "error"; message: string };

export const OAUTH_PROVIDERS: Record<
  string,
  { label: string; buttonText: string }
> = {
  anthropic: {
    label: "OAuth (Pro/Max)",
    buttonText: "Login with Claude Pro/Max",
  },
  "openai-codex": {
    label: "OAuth (Plus/Pro)",
    buttonText: "Login with ChatGPT Plus/Pro",
  },
};

// --- Credential Storage ---

const OAUTH_STORAGE_KEY = "openexcel-oauth-credentials";

export function loadOAuthCredentials(
  provider: string,
): OAuthCredentials | null {
  try {
    const store = JSON.parse(localStorage.getItem(OAUTH_STORAGE_KEY) || "{}");
    return store[provider] || null;
  } catch {
    return null;
  }
}

export function saveOAuthCredentials(
  provider: string,
  creds: OAuthCredentials,
) {
  try {
    const store = JSON.parse(localStorage.getItem(OAUTH_STORAGE_KEY) || "{}");
    store[provider] = creds;
    localStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function removeOAuthCredentials(provider: string) {
  try {
    const store = JSON.parse(localStorage.getItem(OAUTH_STORAGE_KEY) || "{}");
    delete store[provider];
    localStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

// --- PKCE (Web Crypto, browser-safe) ---

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generatePKCE(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = base64urlEncode(verifierBytes);
  const data = new TextEncoder().encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const challenge = base64urlEncode(new Uint8Array(hashBuffer));
  return { verifier, challenge };
}

function createRandomState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// --- Provider Constants ---

const ANTHROPIC_CLIENT_ID = atob(
  "OWQxYzI1MGEtZTYxYi00NGQ5LTg4ZWQtNTk0NGQxOTYyZjVl",
);
const ANTHROPIC_AUTHORIZE_URL = "https://claude.ai/oauth/authorize";
const ANTHROPIC_TOKEN_URL = "https://console.anthropic.com/v1/oauth/token";
const ANTHROPIC_REDIRECT_URI =
  "https://console.anthropic.com/oauth/code/callback";
const ANTHROPIC_SCOPES = "org:create_api_key user:profile user:inference";

const OPENAI_CODEX_CLIENT_ID = atob("YXBwX0VNb2FtRUVaNzNmMENrWGFYcDdocmFubg==");
const OPENAI_CODEX_AUTHORIZE_URL = "https://auth.openai.com/oauth/authorize";
const OPENAI_CODEX_TOKEN_URL = "https://auth.openai.com/oauth/token";
const OPENAI_CODEX_REDIRECT_URI = "http://localhost:1455/auth/callback";
const OPENAI_CODEX_SCOPE = "openid profile email offline_access";

// --- Authorization URL ---

export function buildAuthorizationUrl(
  provider: string,
  challenge: string,
  verifier: string,
): { url: string; oauthState?: string } {
  if (provider === "openai-codex") {
    const oauthState = createRandomState();
    const params = new URLSearchParams({
      response_type: "code",
      client_id: OPENAI_CODEX_CLIENT_ID,
      redirect_uri: OPENAI_CODEX_REDIRECT_URI,
      scope: OPENAI_CODEX_SCOPE,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: oauthState,
      id_token_add_organizations: "true",
      codex_cli_simplified_flow: "true",
      originator: "pi",
    });
    return { url: `${OPENAI_CODEX_AUTHORIZE_URL}?${params}`, oauthState };
  }
  const params = new URLSearchParams({
    code: "true",
    client_id: ANTHROPIC_CLIENT_ID,
    response_type: "code",
    redirect_uri: ANTHROPIC_REDIRECT_URI,
    scope: ANTHROPIC_SCOPES,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: verifier,
  });
  return { url: `${ANTHROPIC_AUTHORIZE_URL}?${params}` };
}

// --- Input Parsing ---

function parseAuthorizationInput(input: string): {
  code?: string;
  state?: string;
} {
  const value = input.trim();
  if (!value) return {};
  try {
    const url = new URL(value);
    return {
      code: url.searchParams.get("code") ?? undefined,
      state: url.searchParams.get("state") ?? undefined,
    };
  } catch {
    /* not a URL */
  }
  if (value.includes("#")) {
    const [code, state] = value.split("#", 2);
    return { code, state };
  }
  if (value.includes("code=")) {
    const params = new URLSearchParams(value);
    return {
      code: params.get("code") ?? undefined,
      state: params.get("state") ?? undefined,
    };
  }
  return { code: value };
}

// --- Proxy URL helper ---

function buildProxiedUrl(
  baseUrl: string,
  useProxy: boolean,
  proxyUrl: string,
): string {
  return useProxy && proxyUrl
    ? `${proxyUrl}/?url=${encodeURIComponent(baseUrl)}`
    : baseUrl;
}

// --- Token Refresh ---

async function refreshAnthropicOAuth(
  refreshToken: string,
  proxyUrl: string,
  useProxy: boolean,
): Promise<OAuthCredentials> {
  const url = buildProxiedUrl(ANTHROPIC_TOKEN_URL, useProxy, proxyUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: ANTHROPIC_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok)
    throw new Error(`Anthropic token refresh failed: ${response.status}`);
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    refresh: data.refresh_token,
    access: data.access_token,
    expires: Date.now() + data.expires_in * 1000 - 5 * 60 * 1000,
  };
}

async function refreshOpenAICodexOAuth(
  refreshToken: string,
  proxyUrl: string,
  useProxy: boolean,
): Promise<OAuthCredentials> {
  const url = buildProxiedUrl(OPENAI_CODEX_TOKEN_URL, useProxy, proxyUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: OPENAI_CODEX_CLIENT_ID,
    }),
  });
  if (!response.ok)
    throw new Error(`OpenAI Codex token refresh failed: ${response.status}`);
  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (
    !data.access_token ||
    !data.refresh_token ||
    typeof data.expires_in !== "number"
  ) {
    throw new Error("OpenAI Codex token refresh: missing fields in response");
  }
  return {
    refresh: data.refresh_token,
    access: data.access_token,
    expires: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshOAuthToken(
  provider: string,
  refreshToken: string,
  proxyUrl: string,
  useProxy: boolean,
): Promise<OAuthCredentials> {
  if (provider === "openai-codex") {
    return refreshOpenAICodexOAuth(refreshToken, proxyUrl, useProxy);
  }
  return refreshAnthropicOAuth(refreshToken, proxyUrl, useProxy);
}

// --- Token Exchange ---

export async function exchangeOAuthCode(params: {
  provider: string;
  rawInput: string;
  verifier: string;
  expectedState?: string;
  useProxy: boolean;
  proxyUrl: string;
}): Promise<OAuthCredentials> {
  const { provider, rawInput, verifier, expectedState, useProxy, proxyUrl } =
    params;
  const parsed = parseAuthorizationInput(rawInput);
  if (!parsed.code)
    throw new Error("Could not extract authorization code from input");
  if (expectedState && parsed.state && parsed.state !== expectedState) {
    throw new Error("State mismatch — possible CSRF. Please try again.");
  }

  if (provider === "openai-codex") {
    const url = buildProxiedUrl(OPENAI_CODEX_TOKEN_URL, useProxy, proxyUrl);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: OPENAI_CODEX_CLIENT_ID,
        code: parsed.code,
        code_verifier: verifier,
        redirect_uri: OPENAI_CODEX_REDIRECT_URI,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Token exchange failed (${response.status}): ${text}`);
    }
    const data = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    if (
      !data.access_token ||
      !data.refresh_token ||
      typeof data.expires_in !== "number"
    ) {
      throw new Error("Token response missing required fields");
    }
    return {
      refresh: data.refresh_token,
      access: data.access_token,
      expires: Date.now() + data.expires_in * 1000,
    };
  }

  // Anthropic
  const url = buildProxiedUrl(ANTHROPIC_TOKEN_URL, useProxy, proxyUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: ANTHROPIC_CLIENT_ID,
      code: parsed.code,
      state: parsed.state,
      redirect_uri: ANTHROPIC_REDIRECT_URI,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    refresh: data.refresh_token,
    access: data.access_token,
    expires: Date.now() + data.expires_in * 1000 - 5 * 60 * 1000,
  };
}
