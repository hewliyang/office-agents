import { loadOAuthCredentials, OAUTH_PROVIDERS } from "./oauth";
import { loadSavedConfig } from "./provider-config";
import { getNamespace } from "./storage/namespace";

function storageKey(): string {
  return `${getNamespace().localStoragePrefix}-provider-keys`;
}

export const HIDDEN_PROVIDERS = new Set([
  "amazon-bedrock",
  "azure-openai-responses",
  "github-copilot",
  "google-antigravity",
  "google-vertex",
  "google-gemini-cli",
  "opencode",
  "opencode-go",
  "kimi-coding",
  "vercel-ai-gateway",
  "zai",
]);

export interface CustomEndpointConfig {
  apiType: string;
  baseUrl: string;
  modelId: string;
  apiKey: string;
}

function customEndpointKey(): string {
  return `${getNamespace().localStoragePrefix}-custom-endpoint`;
}

let migrated = false;

function ensureMigrated(): void {
  if (migrated) return;
  migrated = true;

  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) return;

    const legacy = loadSavedConfig();
    if (
      legacy?.provider &&
      legacy.provider !== "custom" &&
      legacy.apiKey &&
      legacy.authMethod !== "oauth"
    ) {
      const keys: Record<string, string> = {};
      keys[legacy.provider] = legacy.apiKey;
      localStorage.setItem(storageKey(), JSON.stringify(keys));
    }

    if (legacy?.provider === "custom" && legacy.customBaseUrl && legacy.model) {
      const endpoint: CustomEndpointConfig = {
        apiType: legacy.apiType || "openai-completions",
        baseUrl: legacy.customBaseUrl,
        modelId: legacy.model,
        apiKey: legacy.apiKey || "",
      };
      localStorage.setItem(customEndpointKey(), JSON.stringify(endpoint));
    }
  } catch {
    /* ignore migration errors */
  }
}

export function loadProviderKeys(): Record<string, string> {
  ensureMigrated();
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveProviderKey(provider: string, key: string): void {
  const keys = loadProviderKeys();
  if (key) {
    keys[provider] = key;
  } else {
    delete keys[provider];
  }
  localStorage.setItem(storageKey(), JSON.stringify(keys));
}

export function removeProviderKey(provider: string): void {
  const keys = loadProviderKeys();
  delete keys[provider];
  localStorage.setItem(storageKey(), JSON.stringify(keys));
}

export function loadCustomEndpoint(): CustomEndpointConfig | null {
  ensureMigrated();
  try {
    const raw = localStorage.getItem(customEndpointKey());
    if (!raw) return null;
    return JSON.parse(raw) as CustomEndpointConfig;
  } catch {
    return null;
  }
}

export function saveCustomEndpoint(config: CustomEndpointConfig | null): void {
  if (config) {
    localStorage.setItem(customEndpointKey(), JSON.stringify(config));
  } else {
    localStorage.removeItem(customEndpointKey());
  }
}

export function getConfiguredProviders(): string[] {
  const keys = loadProviderKeys();
  const result = new Set<string>();

  for (const [provider, key] of Object.entries(keys)) {
    if (key) result.add(provider);
  }

  for (const provider of Object.keys(OAUTH_PROVIDERS)) {
    const creds = loadOAuthCredentials(provider);
    if (creds) result.add(provider);
  }

  return [...result];
}

export function hasProviderAuth(provider: string): boolean {
  const keys = loadProviderKeys();
  if (keys[provider]) return true;
  const creds = loadOAuthCredentials(provider);
  return !!creds;
}

export function getApiKeyForProvider(provider: string): string {
  const keys = loadProviderKeys();
  if (keys[provider]) return keys[provider];
  const creds = loadOAuthCredentials(provider);
  if (creds) return creds.access;
  return "";
}

export function getAuthMethodForProvider(provider: string): "apikey" | "oauth" {
  const creds = loadOAuthCredentials(provider);
  if (creds) return "oauth";
  return "apikey";
}
