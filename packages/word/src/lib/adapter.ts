import type { AppAdapter } from "@office-agents/core";
import { getOrCreateDocumentId } from "@office-agents/core";
import SelectionIndicator from "./components/selection-indicator.svelte";
import TrackChangesIndicator from "./components/track-changes-indicator.svelte";
import wordApiFullDts from "./docs/word-officejs-api.d.ts?raw";
import wordApiOnlineDts from "./docs/word-officejs-api-online.d.ts?raw";
import { buildWordSystemPrompt } from "./system-prompt";
import { createWordTools } from "./tools";
import { getCustomCommands } from "./vfs/custom-commands";

/* global Word */

const TRACKING_MODE_CHANGED_EVENT = "word-tracking-mode-maybe-changed";

const STORAGE_NAMESPACE = {
  dbName: "OpenWordDB_v1",
  dbVersion: 1,
  localStoragePrefix: "openword",
  documentSettingsPrefix: "openword",
  documentIdSettingsKey: "openword-document-id",
};

export function createWordAdapter(): AppAdapter {
  return {
    tools: (ctx) => createWordTools(ctx),
    customCommands: getCustomCommands,
    hasImageSearch: true,
    showFollowModeToggle: false,
    staticFiles: {
      "/home/user/docs/word-officejs-api-online.d.ts": wordApiOnlineDts,
      "/home/user/docs/word-officejs-api.d.ts": wordApiFullDts,
    },

    appName: "OpenWord",
    metadataTag: "doc_context",
    storageNamespace: STORAGE_NAMESPACE,
    appVersion: __APP_VERSION__,
    emptyStateMessage: "Start a conversation to create or edit your document",
    HeaderExtras: TrackChangesIndicator,
    SelectionIndicator,
    buildSystemPrompt: buildWordSystemPrompt,

    getDocumentId: async () => {
      return getOrCreateDocumentId(STORAGE_NAMESPACE);
    },

    getDocumentMetadata: async () => {
      try {
        const metadata = await getDocumentMetadata();
        return { metadata };
      } catch {
        return null;
      }
    },

    onToolResult: () => {
      window.dispatchEvent(new Event(TRACKING_MODE_CHANGED_EVENT));
    },
  };
}

const KEY_STYLES = [
  "Normal",
  "Heading1",
  "Heading2",
  "Heading3",
  "ListBullet",
  "ListNumber",
  "Title",
  "Subtitle",
] as const;

async function getDocumentMetadata(): Promise<object> {
  return Word.run(async (context) => {
    const body = context.document.body;
    const tables = body.tables;
    const contentControls = body.contentControls;
    const sections = context.document.sections;
    body.load("text");
    tables.load("items");
    contentControls.load("items");
    sections.load("items");
    await context.sync();

    const hasContent = body.text.trim().length > 0;

    let changeTrackingMode = "Unknown";
    try {
      context.document.load("changeTrackingMode");
      await context.sync();
      changeTrackingMode = context.document.changeTrackingMode;
    } catch {
      // changeTrackingMode may not be available
    }

    // Try to get page count (desktop only — WordApiDesktop 1.2+)
    let pageCount: number | null = null;
    try {
      const bodyRange = body.getRange();
      const pages = bodyRange.pages;
      pages.load("items");
      await context.sync();
      pageCount = pages.items.length;
    } catch {
      // pages API not available (Word Online)
    }

    // Detect style fonts — what font/size/color the key built-in styles resolve to
    let styleInfo: Record<
      string,
      { font?: string; size?: number; color?: string }
    > | null = null;
    try {
      const styles = context.document.getStyles();
      const styleObjects: Record<string, Word.Style> = {};
      for (const name of KEY_STYLES) {
        try {
          const s = styles.getByNameOrNullObject(name);
          s.load("nameLocal,builtIn,inUse");
          s.font.load("name,size,color");
          styleObjects[name] = s;
        } catch {
          // style may not exist
        }
      }
      await context.sync();
      styleInfo = {};
      for (const name of KEY_STYLES) {
        const s = styleObjects[name];
        if (s && !s.isNullObject) {
          const entry: { font?: string; size?: number; color?: string } = {};
          if (s.font.name) entry.font = s.font.name;
          if (s.font.size && s.font.size > 0) entry.size = s.font.size;
          if (
            s.font.color &&
            s.font.color !== "Automatic" &&
            s.font.color !== "#000000"
          )
            entry.color = s.font.color;
          if (Object.keys(entry).length > 0) {
            styleInfo[name] = entry;
          }
        }
      }
      if (Object.keys(styleInfo).length === 0) styleInfo = null;
    } catch {
      // getStyles/font API may not be available (requires WordApi 1.5)
    }

    // Sample first N non-empty paragraphs to detect run-level formatting overrides
    let runFormattingSample: Array<{
      index: number;
      style: string;
      font?: string;
      size?: number;
      color?: string;
    }> | null = null;
    try {
      const paragraphs = body.paragraphs;
      paragraphs.load("items");
      await context.sync();
      const sampleSize = Math.min(paragraphs.items.length, 20);
      const sampled: typeof paragraphs.items = [];
      for (let i = 0; i < sampleSize; i++) {
        const p = paragraphs.items[i];
        p.load("text,style");
        p.font.load("name,size,color");
        sampled.push(p);
      }
      await context.sync();
      const results: typeof runFormattingSample = [];
      for (let i = 0; i < sampled.length; i++) {
        const p = sampled[i];
        if (!p.text?.trim()) continue;
        const entry: (typeof results)[0] = { index: i, style: p.style };
        if (p.font.name) entry.font = p.font.name;
        if (p.font.size && p.font.size > 0) entry.size = p.font.size;
        if (
          p.font.color &&
          p.font.color !== "Automatic" &&
          p.font.color !== "#000000"
        )
          entry.color = p.font.color;
        results.push(entry);
      }
      if (results.length > 0) runFormattingSample = results;
    } catch {
      // paragraph font loading may fail
    }

    // Determine if run-level overrides are prevalent
    let hasRunLevelOverrides = false;
    if (runFormattingSample && styleInfo) {
      for (const sample of runFormattingSample) {
        const styleDef = styleInfo[sample.style];
        if (!styleDef) {
          // Style not in our key list, but paragraph has explicit font — likely override
          if (sample.font || sample.size || sample.color) {
            hasRunLevelOverrides = true;
            break;
          }
        } else {
          // Compare against style definition
          if (
            (sample.font && styleDef.font && sample.font !== styleDef.font) ||
            (sample.size && styleDef.size && sample.size !== styleDef.size) ||
            (sample.color && styleDef.color && sample.color !== styleDef.color)
          ) {
            hasRunLevelOverrides = true;
            break;
          }
        }
      }
    }

    // Build selection info
    let selectionInfo: {
      hasSelection: boolean;
      selectedText?: string;
      selectedStyle?: string;
    } = { hasSelection: false };
    try {
      const selection = context.document.getSelection();
      selection.load("text,style");
      await context.sync();
      const selectedText = selection.text?.trim() ?? "";
      if (selectedText.length > 0) {
        selectionInfo = {
          hasSelection: true,
          selectedText:
            selectedText.length > 500
              ? `${selectedText.substring(0, 500)}…`
              : selectedText,
        };
        if (selection.style) {
          selectionInfo.selectedStyle = selection.style;
        }
      }
    } catch {
      // selection API may fail in some contexts
    }

    return {
      sectionCount: sections.items.length,
      tableCount: tables.items.length,
      contentControlCount: contentControls.items.length,
      changeTrackingMode,
      hasContent,
      pageCount,
      styleInfo,
      runFormattingSample,
      hasRunLevelOverrides,
      selection: selectionInfo,
    };
  });
}
