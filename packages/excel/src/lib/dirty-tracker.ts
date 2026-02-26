/**
 * Dirty range tracking for Excel mutations.
 * Tracks which cells/ranges have been modified by tools.
 */

export interface DirtyRange {
  sheetId: number;
  range: string; // A1 notation or '*' for entire sheet
}

/**
 * Normalize and merge overlapping ranges (simple implementation).
 * For now, just deduplicates exact matches. A full implementation
 * would merge A1:B5 + A3:C10 into a bounding box.
 */
export function mergeRanges(ranges: DirtyRange[]): DirtyRange[] {
  const seen = new Map<string, DirtyRange>();

  for (const r of ranges) {
    // If any range is '*' for this sheet, it encompasses everything
    const sheetKey = String(r.sheetId);
    const fullKey = `${r.sheetId}:${r.range}`;

    if (r.range === "*") {
      // Remove all other ranges for this sheet, replace with '*'
      const keysToDelete = Array.from(seen.keys()).filter((key) =>
        key.startsWith(`${sheetKey}:`),
      );
      for (const key of keysToDelete) {
        seen.delete(key);
      }
      seen.set(`${sheetKey}:*`, r);
    } else if (!seen.has(`${sheetKey}:*`)) {
      // Only add if we don't already have a wildcard for this sheet
      seen.set(fullKey, r);
    }
  }

  return Array.from(seen.values());
}

/**
 * Parse a range address to extract bounding box info.
 * Returns { startCol, startRow, endCol, endRow } as 0-indexed numbers.
 */
export function parseRange(range: string): {
  startCol: number;
  startRow: number;
  endCol: number;
  endRow: number;
} | null {
  if (range === "*") return null;

  // Handle single cell like "A1" or range like "A1:B5"
  const parts = range.split(":");
  const start = parseCellAddress(parts[0]);
  const end = parts[1] ? parseCellAddress(parts[1]) : start;

  if (!start || !end) return null;

  return {
    startCol: Math.min(start.col, end.col),
    startRow: Math.min(start.row, end.row),
    endCol: Math.max(start.col, end.col),
    endRow: Math.max(start.row, end.row),
  };
}

function parseCellAddress(addr: string): { col: number; row: number } | null {
  const match = addr.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;

  const colStr = match[1].toUpperCase();
  const row = parseInt(match[2], 10) - 1;

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  col -= 1;

  return { col, row };
}

/**
 * Format dirty ranges for display in tool results.
 */
export function formatDirtyRanges(
  ranges: DirtyRange[],
  sheetNameLookup?: (sheetId: number) => string | undefined,
): string {
  if (ranges.length === 0) return "";

  const merged = mergeRanges(ranges);

  return merged
    .map((r) => {
      const sheetName = sheetNameLookup?.(r.sheetId);
      const sheetDisplay = sheetName || `Sheet ${r.sheetId}`;
      if (r.range === "*") {
        return `${sheetDisplay} (all)`;
      }
      return `${sheetDisplay}!${r.range}`;
    })
    .join(", ");
}
