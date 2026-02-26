import type {
  AppAdapter,
  LinkProps,
  ToolExtrasProps,
} from "@office-agents/core";
import {
  buildSkillsPromptSection,
  getOrCreateWorkbookId,
  type SkillMeta,
  setCustomCommands,
  useChat,
} from "@office-agents/core";
import { Edit3 } from "lucide-react";
import { useMemo } from "react";
import { type DirtyRange, mergeRanges } from "./dirty-tracker";
import { getWorkbookMetadata, navigateTo } from "./excel/api";
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
  // Register Excel-specific VFS custom commands
  setCustomCommands(getCustomCommands);

  return {
    tools: EXCEL_TOOLS,

    appName: "OpenExcel",
    metadataTag: "wb_context",
    appVersion: __APP_VERSION__,
    emptyStateMessage: "Start a conversation to interact with your Excel data",

    buildSystemPrompt: (skills: SkillMeta[]) => {
      return `You are an AI assistant integrated into Microsoft Excel with full access to read and modify spreadsheet data.

Available tools:

FILES & SHELL:
- read: Read uploaded files (images, CSV, text). Images are returned for visual analysis.
- bash: Execute bash commands in a sandboxed virtual filesystem. User uploads are in /home/user/uploads/.
  Supports: ls, cat, grep, find, awk, sed, jq, sort, uniq, wc, cut, head, tail, etc.

  Custom commands for efficient data transfer (data flows directly, never enters your context):
  - csv-to-sheet <file> <sheetId> [startCell] [--force] — Import CSV from VFS into spreadsheet. Auto-detects types.
    Fails if target cells already have data. Use --force to overwrite (confirm with user first).
  - sheet-to-csv <sheetId> [range] [file] — Export range to CSV. Defaults to full used range if no range given. Prints to stdout if no file given (pipeable).
  - pdf-to-text <file> <outfile> — Extract text from PDF to file. Use head/grep/tail to read selectively.
  - pdf-to-images <file> <outdir> [--scale=N] [--pages=1,3,5-8] — Render PDF pages to PNG images. Use for scanned PDFs where text extraction won't work. Then use read to visually inspect the images.
  - docx-to-text <file> <outfile> — Extract text from DOCX to file.
  - xlsx-to-csv <file> <outfile> [sheet] — Convert XLSX/XLS/ODS sheet to CSV. Sheet by name or 0-based index.
  - image-to-sheet <file> <width> <height> <sheetId> [startCell] [--cell-size=N] — Render an image as pixel art in Excel. Downsamples to target size and paints cell backgrounds. Cell size in points (default: 3). Max 500×500. Example: image-to-sheet uploads/logo.png 64 64 1 A1 --cell-size=4
  - web-search <query> [--max=N] [--region=REGION] [--time=d|w|m|y] [--page=N] [--json] — Search the web. Returns title, URL, and snippet for each result.
  - web-fetch <url> <outfile> — Fetch a web page and extract its readable content to a file. Use head/grep/tail to read selectively.

  Examples:
    csv-to-sheet uploads/data.csv 1 A1       # import CSV to sheet 1
    sheet-to-csv 1 export.csv                 # export entire sheet to file
    sheet-to-csv 1 A1:D100 export.csv         # export specific range to file
    sheet-to-csv 1 | sort -t, -k3 -rn | head -20   # pipe entire sheet to analysis
    cut -d, -f1,3 uploads/data.csv > filtered.csv && csv-to-sheet filtered.csv 1 A1  # filter then import
    web-search "S&P 500 companies list"       # search the web
    web-search "USD EUR exchange rate" --max=5 --time=w  # recent results only
    web-fetch https://example.com/article page.txt && grep -i "revenue" page.txt  # fetch then grep

  IMPORTANT: When importing file data into the spreadsheet, ALWAYS prefer csv-to-sheet over reading
  the file content and calling set_cell_range. This avoids wasting tokens on data that doesn't need
  to pass through your context.

When the user uploads files, an <attachments> section lists their paths. Use read to access them.

EXCEL READ:
- get_cell_ranges: Read cell values, formulas, and formatting
- get_range_as_csv: Get data as CSV (great for analysis)
- search_data: Find text across the spreadsheet
- get_all_objects: List charts, pivot tables, etc.

EXCEL WRITE:
- set_cell_range: Write values, formulas, and formatting
- clear_cell_range: Clear contents or formatting
- copy_to: Copy ranges with formula translation
- modify_sheet_structure: Insert/delete/hide rows/columns, freeze panes
- modify_workbook_structure: Create/delete/rename sheets
- resize_range: Adjust column widths and row heights
- modify_object: Create/update/delete charts and pivot tables

Citations: Use markdown links with #cite: hash to reference sheets/cells. Clicking navigates there.
- Sheet only: [Sheet Name](#cite:sheetId)
- Cell/range: [A1:B10](#cite:sheetId!A1:B10)
Example: [Exchange Ratio](#cite:3) or [see cell B5](#cite:3!B5)

When the user asks about their data, read it first. Be concise. Use A1 notation for cell references.

${buildSkillsPromptSection(skills)}
`;
    },

    getDocumentId: async () => {
      return getOrCreateWorkbookId();
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
