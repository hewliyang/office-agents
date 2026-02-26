/* global Excel */

import type { DirtyRange } from "../dirty-tracker";
import { getStableSheetId } from "./sheet-id-map";

/**
 * Creates a tracked Excel context that monitors mutations for dirty tracking.
 * Uses Proxies to intercept property assignments on ranges.
 */

export interface TrackedContextResult {
  trackedContext: Excel.RequestContext;
  getDirtyRanges: () => DirtyRange[];
}

// biome-ignore lint/complexity/noBannedTypes: Proxy handlers need generic function type for dynamic method interception
type AnyFunction = Function;

interface DirtyEntry {
  sheetIdRef: { id: number };
  range: string;
}

interface PendingSheetRef {
  sheet: Excel.Worksheet;
  sheetIdRef: { id: number };
}

/**
 * Create a tracked version of the Excel context that monitors mutations.
 */
export function createTrackedContext(
  context: Excel.RequestContext,
): TrackedContextResult {
  const dirtyEntries: DirtyEntry[] = [];
  const pendingSheetRefs: PendingSheetRef[] = [];

  const markDirty = (sheetIdRef: { id: number }, range: string) => {
    dirtyEntries.push({ sheetIdRef, range });
  };

  // Called after each context.sync() to resolve pending sheet IDs
  const resolvePendingSheetRefs = async () => {
    if (pendingSheetRefs.length === 0) return;

    for (const pending of pendingSheetRefs) {
      if (pending.sheetIdRef.id !== -1) continue; // Already resolved

      try {
        // Get the stable ID for this sheet (persisted in document settings)
        pending.sheet.load("id");
        await context.sync();
        pending.sheetIdRef.id = await getStableSheetId(pending.sheet.id);
      } catch {
        // Failed to resolve, will remain -1
      }
    }
  };

  // Helper to get clean address from range
  const getCleanAddr = (target: any): string => {
    const addr = target.m_address || target._address || "*";
    return typeof addr === "string" ? addr.split("!").pop() || "*" : "*";
  };

  const createTrackedRangeWithRef = (
    range: Excel.Range,
    sheetIdRef: { id: number },
    knownAddress?: string,
  ): Excel.Range => {
    // Use the known address if provided, otherwise try to get it from the range
    const getAddress = (): string => {
      if (knownAddress) return knownAddress;
      return getCleanAddr(range);
    };

    return new Proxy(range, {
      set(target, prop, value) {
        // Track mutations to values, formulas, numberFormat
        if (
          prop === "values" ||
          prop === "formulas" ||
          prop === "numberFormat"
        ) {
          markDirty(sheetIdRef, getAddress());
        }
        (target as any)[prop] = value;
        return true;
      },
      get(target, prop) {
        const value = (target as any)[prop];

        // Wrap methods that return ranges (these create new ranges, address unknown)
        if (
          prop === "getCell" ||
          prop === "getColumn" ||
          prop === "getRow" ||
          prop === "getResizedRange"
        ) {
          return (...args: any[]) => {
            const result = (value as AnyFunction).apply(target, args);
            return createTrackedRangeWithRef(result, sheetIdRef); // No known address
          };
        }

        // Track clear() calls
        if (prop === "clear") {
          return (...args: any[]) => {
            markDirty(sheetIdRef, getAddress());
            return (value as AnyFunction).apply(target, args);
          };
        }

        // Track delete() calls
        if (prop === "delete") {
          return (...args: any[]) => {
            markDirty(sheetIdRef, "*"); // Deletion affects everything below/right
            return (value as AnyFunction).apply(target, args);
          };
        }

        // Track insert() calls
        if (prop === "insert") {
          return (...args: any[]) => {
            markDirty(sheetIdRef, "*"); // Insertion affects everything below/right
            return (value as AnyFunction).apply(target, args);
          };
        }

        // Track copyFrom() calls
        if (prop === "copyFrom") {
          return (...args: any[]) => {
            markDirty(sheetIdRef, getAddress());
            return (value as AnyFunction).apply(target, args);
          };
        }

        // Wrap format property for tracking style changes
        if (prop === "format") {
          return createTrackedFormatWithRef(
            value,
            sheetIdRef,
            range,
            knownAddress,
          );
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedFormatWithRef = (
    format: Excel.RangeFormat,
    sheetIdRef: { id: number },
    range: Excel.Range,
    knownAddress?: string,
  ): Excel.RangeFormat => {
    const getAddress = (): string =>
      knownAddress ? knownAddress : getCleanAddr(range);

    return new Proxy(format, {
      set(target, prop, value) {
        markDirty(sheetIdRef, getAddress());
        (target as any)[prop] = value;
        return true;
      },
      get(target, prop) {
        const value = (target as any)[prop];

        // Track nested format properties (font, fill, borders)
        if (prop === "font" || prop === "fill" || prop === "borders") {
          return createTrackedFormatPartWithRef(
            value,
            sheetIdRef,
            range,
            knownAddress,
          );
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedFormatPartWithRef = (
    part: any,
    sheetIdRef: { id: number },
    range: Excel.Range,
    knownAddress?: string,
  ): any => {
    const getAddress = (): string =>
      knownAddress ? knownAddress : getCleanAddr(range);

    return new Proxy(part, {
      set(target, prop, value) {
        markDirty(sheetIdRef, getAddress());
        target[prop] = value;
        return true;
      },
      get(target, prop) {
        const value = target[prop];
        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedWorksheetWithRef = (
    sheet: Excel.Worksheet,
    sheetIdRef: { id: number },
  ): Excel.Worksheet => {
    return new Proxy(sheet, {
      get(target, prop) {
        const value = (target as any)[prop];

        // Wrap getRange to return tracked ranges with known address
        if (prop === "getRange") {
          return (...args: any[]) => {
            const result = (value as AnyFunction).apply(target, args);
            // args[0] is the address string like "A1:B5"
            const address = typeof args[0] === "string" ? args[0] : undefined;
            return createTrackedRangeWithRef(result, sheetIdRef, address);
          };
        }

        // getUsedRange doesn't have a known address upfront
        if (prop === "getUsedRange" || prop === "getUsedRangeOrNullObject") {
          return (...args: any[]) => {
            const result = (value as AnyFunction).apply(target, args);
            return createTrackedRangeWithRef(result, sheetIdRef);
          };
        }

        // Track sheet-level mutations
        if (prop === "delete") {
          return () => {
            markDirty(sheetIdRef, "*");
            return value.call(target);
          };
        }

        // Track notes
        if (prop === "notes") {
          return createTrackedNotesWithRef(value, sheetIdRef);
        }

        // Track charts and pivotTables
        if (prop === "charts" || prop === "pivotTables") {
          return createTrackedCollectionWithRef(value, sheetIdRef);
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedNotesWithRef = (
    notes: Excel.CommentCollection,
    sheetIdRef: { id: number },
  ): Excel.CommentCollection => {
    return new Proxy(notes, {
      get(target, prop) {
        const value = (target as any)[prop];

        if (prop === "add") {
          return (...args: any[]) => {
            const addr = args[0] || "*";
            markDirty(sheetIdRef, addr);
            return (value as AnyFunction).apply(target, args);
          };
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedCollectionWithRef = (
    collection: any,
    sheetIdRef: { id: number },
  ): any => {
    return new Proxy(collection, {
      get(target, prop) {
        const value = target[prop];

        if (prop === "add" || prop === "delete") {
          return (...args: any[]) => {
            markDirty(sheetIdRef, "*");
            return (value as AnyFunction).apply(target, args);
          };
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedWorksheets = (
    worksheets: Excel.WorksheetCollection,
  ): Excel.WorksheetCollection => {
    const worksheetProxies = new Map<
      Excel.Worksheet,
      { proxy: Excel.Worksheet; sheetIdRef: { id: number } }
    >();

    return new Proxy(worksheets, {
      get(target, prop) {
        const value = (target as any)[prop];

        // Wrap getItem, getActiveWorksheet, etc.
        if (
          prop === "getItem" ||
          prop === "getItemOrNullObject" ||
          prop === "getActiveWorksheet" ||
          prop === "getFirst" ||
          prop === "getLast"
        ) {
          return (...args: any[]) => {
            const sheet = (value as AnyFunction).apply(
              target,
              args,
            ) as Excel.Worksheet;

            // Return cached proxy or create new one
            if (!worksheetProxies.has(sheet)) {
              // Use a mutable ref object so the sheetId can be updated after sync
              const sheetIdRef = { id: -1 };
              const proxy = createTrackedWorksheetWithRef(sheet, sheetIdRef);
              worksheetProxies.set(sheet, { proxy, sheetIdRef });

              // Queue the sheet.load("id") - will be resolved when user calls context.sync()
              sheet.load("id");
              pendingSheetRefs.push({ sheet, sheetIdRef });

              return proxy;
            }
            return worksheetProxies.get(sheet)!.proxy;
          };
        }

        // Track worksheet creation/deletion
        if (prop === "add") {
          return (...args: any[]) => {
            const newSheet = (value as AnyFunction).apply(
              target,
              args,
            ) as Excel.Worksheet;
            // New sheet will get tracked when accessed
            return newSheet;
          };
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const createTrackedWorkbook = (workbook: Excel.Workbook): Excel.Workbook => {
    return new Proxy(workbook, {
      get(target, prop) {
        const value = (target as any)[prop];

        if (prop === "worksheets") {
          return createTrackedWorksheets(value);
        }

        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      },
    });
  };

  const trackedContext = new Proxy(context, {
    get(target, prop) {
      const value = (target as any)[prop];

      if (prop === "workbook") {
        return createTrackedWorkbook(value);
      }

      // Intercept sync() to resolve pending sheet IDs after each sync
      if (prop === "sync") {
        return async () => {
          const result = await value.call(target);
          await resolvePendingSheetRefs();
          return result;
        };
      }

      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });

  return {
    trackedContext: trackedContext as Excel.RequestContext,
    getDirtyRanges: () => {
      // Sheet IDs should already be resolved from sync() calls
      return dirtyEntries.map((entry) => ({
        sheetId: entry.sheetIdRef.id,
        range: entry.range,
      }));
    },
  };
}
