import type {
  AppAdapter,
  LinkProps,
  ToolExtrasProps,
} from "@office-agents/core";
import { getOrCreateDocumentId, useChat } from "@office-agents/core";
import { Edit3 } from "lucide-react";
import { useMemo } from "react";
import { SelectionIndicator } from "./components/selection-indicator";
import { type DirtyRange, mergeRanges } from "./dirty-tracker";
import excelApiDts from "./docs/excel-officejs-api.d.ts?raw";
import { getWorkbookMetadata, navigateTo } from "./excel/api";
import { buildExcelSystemPrompt } from "./system-prompt";
import { EXCEL_TOOLS } from "./tools";
import { getCustomCommands } from "./vfs/custom-commands";

function parseDirtyRanges(result: string | undefined): DirtyRange[] | null {
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

export function createExcelAdapter(): AppAdapter {
  return {
    tools: EXCEL_TOOLS,
    customCommands: getCustomCommands,
    staticFiles: {
      "/home/user/docs/excel-officejs-api.d.ts": excelApiDts,
    },

    appName: "OpenExcel",
    metadataTag: "wb_context",
    storageNamespace: {
      dbName: "OpenExcelDB_v3",
      dbVersion: 30,
      localStoragePrefix: "openexcel",
      documentSettingsPrefix: "openexcel",
      documentIdSettingsKey: "openexcel-workbook-id",
    },
    appVersion: __APP_VERSION__,
    emptyStateMessage: "Start a conversation to interact with your Excel data",
    SelectionIndicator,
    buildSystemPrompt: buildExcelSystemPrompt,

    getDocumentId: async () => {
      return getOrCreateDocumentId();
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

    Link: CitationLink,
    ToolExtras: DirtyRangeExtras,
  };
}

function CitationLink({ href, children }: LinkProps) {
  const citation = parseCitationUri(href);

  if (citation) {
    return (
      <button
        type="button"
        className="text-(--chat-accent) hover:underline cursor-pointer"
        onClick={() =>
          navigateTo(citation.sheetId, citation.range).catch(console.error)
        }
      >
        {children}
      </button>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function DirtyRangeExtras({ result, expanded }: ToolExtrasProps) {
  const { getName } = useChat();
  const ranges = useMemo(() => parseDirtyRanges(result), [result]);
  const merged = useMemo(() => (ranges ? mergeRanges(ranges) : []), [ranges]);
  const valid = useMemo(
    () => merged.filter((r) => r.sheetId < 0 || getName(r.sheetId)),
    [merged, getName],
  );

  if (valid.length === 0) return null;

  if (expanded) {
    return (
      <>
        <Edit3 size={9} className="shrink-0" />
        <span className="shrink-0">Modified:</span>
        {valid.map((r, i) => (
          <span key={`${r.sheetId}-${r.range}`}>
            {i > 0 && <span className="text-(--chat-warning-muted)">, </span>}
            <DirtyRangeLink range={r} />
          </span>
        ))}
      </>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-(--chat-warning) shrink-0">
      <Edit3 size={9} />
      <DirtyRangeSummary ranges={valid} />
    </span>
  );
}

function DirtyRangeLink({ range }: { range: DirtyRange }) {
  const { getName } = useChat();
  const sheetName = getName(range.sheetId);

  if (range.sheetId < 0) {
    const label =
      range.range === "*" ? "Unknown sheet" : `Unknown!${range.range}`;
    return <span className="text-(--chat-warning-muted)">{label}</span>;
  }

  if (!sheetName) return null;

  const label =
    range.range === "*" ? `${sheetName} (all)` : `${sheetName}!${range.range}`;

  return (
    <button
      type="button"
      className="text-(--chat-warning) hover:underline cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        const navRange = range.range === "*" ? undefined : range.range;
        navigateTo(range.sheetId, navRange).catch(console.error);
      }}
    >
      {label}
    </button>
  );
}

function DirtyRangeSummary({ ranges }: { ranges: DirtyRange[] }) {
  const { getName } = useChat();

  if (ranges.length === 1) {
    const r = ranges[0];
    if (r.sheetId < 0) {
      const brief = r.range === "*" ? "unknown" : r.range;
      return (
        <span className="text-[10px] text-(--chat-warning) truncate">
          → {brief}
        </span>
      );
    }
    const sheetName = getName(r.sheetId);
    if (!sheetName) return null;
    const brief = r.range === "*" ? sheetName : r.range;
    return (
      <span className="text-[10px] text-(--chat-warning) truncate">
        → {brief}
      </span>
    );
  }

  return (
    <span className="text-[10px] text-(--chat-warning)">
      → {ranges.length} ranges
    </span>
  );
}
