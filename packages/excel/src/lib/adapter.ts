import type { AppAdapter } from "@office-agents/core";
import { getOrCreateDocumentId } from "@office-agents/core";
import DirtyRangeExtras from "./components/dirty-range-extras.svelte";
import SelectionIndicator from "./components/selection-indicator.svelte";
import excelApiDts from "./docs/excel-officejs-api.d.ts?raw";
import { getWorkbookMetadata, navigateTo } from "./excel/api";
import { buildExcelSystemPrompt } from "./system-prompt";
import { createExcelTools } from "./tools";
import { getCustomCommands } from "./vfs/custom-commands";

function parseCitationUri(
  href: string,
): { sheetId: number; range?: string } | null {
  if (!href.startsWith("#cite:")) return null;
  const path = href.slice("#cite:".length);
  const bangIdx = path.indexOf("!");
  if (bangIdx === -1) {
    const sheetId = Number.parseInt(path, 10);
    return Number.isNaN(sheetId) ? null : { sheetId };
  }
  const sheetId = Number.parseInt(path.slice(0, bangIdx), 10);
  const range = path.slice(bangIdx + 1);
  return Number.isNaN(sheetId) ? null : { sheetId, range };
}

const STORAGE_NAMESPACE = {
  dbName: "OpenExcelDB_v3",
  dbVersion: 30,
  localStoragePrefix: "openexcel",
  documentSettingsPrefix: "openexcel",
  documentIdSettingsKey: "openexcel-workbook-id",
};

export function createExcelAdapter(): AppAdapter {
  return {
    tools: (ctx) => createExcelTools(ctx),
    customCommands: getCustomCommands,
    staticFiles: {
      "/home/user/docs/excel-officejs-api.d.ts": excelApiDts,
    },

    appName: "OpenExcel",
    metadataTag: "wb_context",
    storageNamespace: STORAGE_NAMESPACE,
    appVersion: __APP_VERSION__,
    emptyStateMessage: "Start a conversation to interact with your Excel data",
    SelectionIndicator,
    buildSystemPrompt: buildExcelSystemPrompt,

    getDocumentId: async () => {
      return getOrCreateDocumentId(STORAGE_NAMESPACE);
    },

    getDocumentMetadata: async () => {
      try {
        const metadata = await getWorkbookMetadata();
        const nameMap: Record<number, string> = {};
        if (metadata.sheetsMetadata) {
          for (const sheet of metadata.sheetsMetadata) {
            nameMap[sheet.id] = sheet.name;
          }
        }
        return { metadata, nameMap };
      } catch {
        return null;
      }
    },

    onToolResult: (_toolCallId, result, isError) => {
      if (isError) return;
      const dirtyRanges = parseDirtyRanges(result);
      if (dirtyRanges && dirtyRanges.length > 0) {
        const first = dirtyRanges[0];
        if (first.sheetId >= 0 && first.range !== "*") {
          navigateTo(first.sheetId, first.range).catch(console.error);
        } else if (first.sheetId >= 0) {
          navigateTo(first.sheetId).catch(console.error);
        }
      }
    },

    handleLinkClick: async ({ href }) => {
      const citation = parseCitationUri(href);
      if (!citation) return "default";

      await navigateTo(citation.sheetId, citation.range).catch(console.error);
      return "handled";
    },
    ToolExtras: DirtyRangeExtras,
  };
}

function parseDirtyRanges(
  result: string | undefined,
): Array<{ sheetId: number; range: string }> | null {
  if (!result) return null;
  try {
    const parsed = JSON.parse(result);
    if (parsed._dirtyRanges && Array.isArray(parsed._dirtyRanges)) {
      return parsed._dirtyRanges;
    }
  } catch {
    // Not valid JSON or no dirty ranges
  }
  return null;
}
