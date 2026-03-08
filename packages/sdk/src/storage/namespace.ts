export interface StorageNamespace {
  dbName: string;
  dbVersion: number;
  localStoragePrefix: string;
  documentSettingsPrefix: string;
  documentIdSettingsKey?: string;
}

const defaults: StorageNamespace = {
  dbName: "OfficeAgentsDB",
  dbVersion: 1,
  localStoragePrefix: "office-agents",
  documentSettingsPrefix: "office-agents",
};

let current: StorageNamespace = { ...defaults };

export function configureNamespace(config: Partial<StorageNamespace>) {
  current = { ...current, ...config };
}

export function getNamespace(): Readonly<StorageNamespace> {
  return current;
}
