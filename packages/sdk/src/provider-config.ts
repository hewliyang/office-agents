import type { Api, Model } from "@mariozechner/pi-ai";
import { loadOAuthCredentials } from "./oauth";
import { getNamespace } from "./storage/namespace";

export type ThinkingLevel = "none" | "low" | "medium" | "high";

export interface ProviderConfig {
  provider: string;
  apiKey: string;
  model: string;
  useProxy: boolean;
  proxyUrl: string;
  thinking: ThinkingLevel;
  followMode: boolean;
  expandToolCalls: boolean;
  apiType?: string;
  customBaseUrl?: string;
  authMethod?: "apikey" | "oauth";
}

function storageKey(): string {
  return `${getNamespace().localStoragePrefix}-provider-config`;
}

export const THINKING_LEVELS: { value: ThinkingLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const API_TYPES = [
  {
    id: "openai-completions",
    name: "OpenAI Completions",
    hint: "Most compatible — Ollama, vLLM, LMStudio, etc.",
  },
  {
    id: "openai-responses",
    name: "OpenAI Responses",
    hint: "Newer OpenAI API format",
  },
  { id: "anthropic-messages", name: "Anthropic Messages", hint: "Claude API" },
  {
    id: "google-generative-ai",
    name: "Google Generative AI",
    hint: "Gemini API",
  },
  {
    id: "azure-openai-responses",
    name: "Azure OpenAI Responses",
    hint: "Azure-hosted OpenAI",
  },
  {
    id: "openai-codex-responses",
    name: "OpenAI Codex Responses",
    hint: "ChatGPT subscription models",
  },
  {
    id: "google-gemini-cli",
    name: "Google Gemini CLI",
    hint: "Cloud Code Assist",
  },
  { id: "google-vertex", name: "Google Vertex AI", hint: "Vertex AI endpoint" },
];

export function loadSavedConfig(): ProviderConfig | null {
  try {
    const saved = localStorage.getItem(storageKey());
    if (saved) {
      const config = JSON.parse(saved);
      if (config.proxyUrl === undefined) config.proxyUrl = "";
      if (config.followMode === undefined) config.followMode = true;
      if (config.expandToolCalls === undefined) config.expandToolCalls = false;
      if (config.apiType === undefined) config.apiType = "";
      if (config.customBaseUrl === undefined) config.customBaseUrl = "";
      if (config.authMethod === undefined) config.authMethod = "apikey";
      if (config.authMethod === "oauth") {
        const creds = loadOAuthCredentials(config.provider);
        if (creds) config.apiKey = creds.access;
      }
      return config;
    }
  } catch {}
  return null;
}

export function saveConfig(config: ProviderConfig) {
  localStorage.setItem(storageKey(), JSON.stringify(config));
}

export function buildCustomModel(config: ProviderConfig): Model<Api> | null {
  if (!config.apiType || !config.customBaseUrl || !config.model) return null;
  return {
    id: config.model,
    name: config.model,
    api: config.apiType as Api,
    provider: "custom",
    baseUrl: config.customBaseUrl,
    reasoning: true,
    input: ["text", "image"] as ("text" | "image")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 32000,
  };
}

export function applyProxyToModel(
  model: Model<Api>,
  config: ProviderConfig,
): Model<Api> {
  if (!config.useProxy || !config.proxyUrl || !model.baseUrl) return model;
  return {
    ...model,
    baseUrl: `${config.proxyUrl}/?url=${encodeURIComponent(model.baseUrl)}`,
  };
}
