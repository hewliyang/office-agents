import type { StorageNamespace } from "../context";

export interface WebConfig {
  searchProvider: string;
  imageSearchProvider: string;
  fetchProvider: string;
  apiKeys: {
    exa?: string;
    brave?: string;
    serper?: string;
  };
}

function webConfigKey(ns: StorageNamespace): string {
  return `${ns.localStoragePrefix}-web-config`;
}

const DEFAULT_WEB_CONFIG: WebConfig = {
  searchProvider: "ddgs",
  imageSearchProvider: "serper",
  fetchProvider: "basic",
  apiKeys: {},
};

export function loadWebConfig(ns: StorageNamespace): WebConfig {
  try {
    const raw = localStorage.getItem(webConfigKey(ns));
    if (!raw) return { ...DEFAULT_WEB_CONFIG };
    const parsed = JSON.parse(raw) as Partial<WebConfig>;
    return {
      searchProvider:
        parsed.searchProvider || DEFAULT_WEB_CONFIG.searchProvider,
      imageSearchProvider:
        parsed.imageSearchProvider || DEFAULT_WEB_CONFIG.imageSearchProvider,
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

export function saveWebConfig(
  ns: StorageNamespace,
  config: Partial<WebConfig>,
) {
  const current = loadWebConfig(ns);
  const next: WebConfig = {
    searchProvider: config.searchProvider || current.searchProvider,
    imageSearchProvider:
      config.imageSearchProvider || current.imageSearchProvider,
    fetchProvider: config.fetchProvider || current.fetchProvider,
    apiKeys: {
      ...current.apiKeys,
      ...(config.apiKeys || {}),
    },
  };
  localStorage.setItem(webConfigKey(ns), JSON.stringify(next));
}
