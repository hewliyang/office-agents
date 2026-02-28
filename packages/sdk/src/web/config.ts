export interface WebConfig {
  searchProvider: string;
  fetchProvider: string;
  apiKeys: {
    exa?: string;
    brave?: string;
    serper?: string;
  };
}

import { getNamespace } from "../storage/namespace";

function webConfigKey(): string {
  return `${getNamespace().localStoragePrefix}-web-config`;
}

const DEFAULT_WEB_CONFIG: WebConfig = {
  searchProvider: "ddgs",
  fetchProvider: "basic",
  apiKeys: {},
};

export function loadWebConfig(): WebConfig {
  try {
    const raw = localStorage.getItem(webConfigKey());
    if (!raw) return { ...DEFAULT_WEB_CONFIG };
    const parsed = JSON.parse(raw) as Partial<WebConfig>;
    return {
      searchProvider:
        parsed.searchProvider || DEFAULT_WEB_CONFIG.searchProvider,
      fetchProvider: parsed.fetchProvider || DEFAULT_WEB_CONFIG.fetchProvider,
      apiKeys: {
        ...DEFAULT_WEB_CONFIG.apiKeys,
        ...(parsed.apiKeys || {}),
      },
    };
  } catch {
    return { ...DEFAULT_WEB_CONFIG };
  }
}

export function saveWebConfig(config: Partial<WebConfig>) {
  const current = loadWebConfig();
  const next: WebConfig = {
    searchProvider: config.searchProvider || current.searchProvider,
    fetchProvider: config.fetchProvider || current.fetchProvider,
    apiKeys: {
      ...current.apiKeys,
      ...(config.apiKeys || {}),
    },
  };
  localStorage.setItem(webConfigKey(), JSON.stringify(next));
}
