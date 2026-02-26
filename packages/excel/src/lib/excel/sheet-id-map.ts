/* global Office */

const SETTINGS_KEY_MAP = "openexcel-sheet-id-map";
const SETTINGS_KEY_COUNTER = "openexcel-sheet-id-counter";

interface SheetIdMap {
  [guid: string]: number;
}

let cachedMap: SheetIdMap | null = null;
let cachedCounter: number | null = null;
let isDirty = false;

async function loadFromSettings(): Promise<void> {
  return new Promise((resolve) => {
    Office.context.document.settings.refreshAsync(() => {
      cachedMap = Office.context.document.settings.get(SETTINGS_KEY_MAP) || {};
      cachedCounter =
        Office.context.document.settings.get(SETTINGS_KEY_COUNTER) || 0;
      resolve();
    });
  });
}

async function saveToSettings(): Promise<void> {
  if (!isDirty) return;

  return new Promise((resolve) => {
    Office.context.document.settings.set(SETTINGS_KEY_MAP, cachedMap);
    Office.context.document.settings.set(SETTINGS_KEY_COUNTER, cachedCounter);
    Office.context.document.settings.saveAsync(() => {
      isDirty = false;
      resolve();
    });
  });
}

export async function getStableSheetId(guid: string): Promise<number> {
  if (cachedMap === null) {
    await loadFromSettings();
  }

  if (cachedMap![guid]) {
    return cachedMap![guid];
  }

  cachedCounter = (cachedCounter || 0) + 1;
  cachedMap![guid] = cachedCounter;
  isDirty = true;
  await saveToSettings();

  return cachedCounter;
}

export function getExistingSheetId(guid: string): number | null {
  if (cachedMap === null) return null;
  return cachedMap[guid] || null;
}

export async function getAllSheetIds(): Promise<SheetIdMap> {
  if (cachedMap === null) {
    await loadFromSettings();
  }
  return { ...cachedMap! };
}

export async function clearSheetIds(): Promise<void> {
  cachedMap = {};
  cachedCounter = 0;
  isDirty = true;
  await saveToSettings();
}

export async function preloadSheetIds(
  worksheets: Excel.Worksheet[],
): Promise<Map<string, number>> {
  if (cachedMap === null) {
    await loadFromSettings();
  }

  const result = new Map<string, number>();
  let needsSave = false;

  for (const sheet of worksheets) {
    const guid = sheet.id;

    if (cachedMap![guid]) {
      result.set(guid, cachedMap![guid]);
    } else {
      cachedCounter = (cachedCounter || 0) + 1;
      cachedMap![guid] = cachedCounter;
      result.set(guid, cachedCounter);
      needsSave = true;
    }
  }

  if (needsSave) {
    isDirty = true;
    await saveToSettings();
  }

  return result;
}
