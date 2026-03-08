import { Table } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* global Excel */

interface SelectionState {
  activeSheetName: string;
  selectedRange: string;
}

function getSelectionState(): Promise<SelectionState> {
  return Excel.run(async (context) => {
    const activeSheet = context.workbook.worksheets.getActiveWorksheet();
    activeSheet.load("name");

    const selectedRange = context.workbook.getSelectedRange();
    selectedRange.load("address");

    await context.sync();

    const rangeAddress = selectedRange.address.includes("!")
      ? selectedRange.address.split("!")[1]
      : selectedRange.address;

    return {
      activeSheetName: activeSheet.name,
      selectedRange: rangeAddress,
    };
  });
}

export function SelectionIndicator() {
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const refresh = useCallback(async () => {
    try {
      setSelection(await getSelectionState());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();

    let selectionHandler:
      | ((args: Excel.SelectionChangedEventArgs) => Promise<void>)
      | null = null;
    let activatedHandler:
      | ((args: Excel.WorksheetActivatedEventArgs) => Promise<void>)
      | null = null;

    Excel.run(async (context) => {
      selectionHandler = async () => {
        refresh();
      };
      activatedHandler = async () => {
        refresh();
      };

      context.workbook.onSelectionChanged.add(selectionHandler);
      context.workbook.worksheets.onActivated.add(activatedHandler);
      await context.sync();
    }).catch(() => {
      // fallback: events not supported
    });

    return () => {
      if (selectionHandler || activatedHandler) {
        Excel.run(async (context) => {
          if (selectionHandler) {
            context.workbook.onSelectionChanged.remove(selectionHandler);
          }
          if (activatedHandler) {
            context.workbook.worksheets.onActivated.remove(activatedHandler);
          }
          await context.sync();
        }).catch(() => {});
      }
    };
  }, [refresh]);

  if (!selection) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 text-[10px] text-(--chat-text-muted) border-t border-(--chat-border) bg-(--chat-bg-secondary)"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      <Table size={10} className="shrink-0 opacity-60" />
      <span className="truncate">{selection.activeSheetName}</span>
      <span className="opacity-40">·</span>
      <span className="truncate">{selection.selectedRange}</span>
    </div>
  );
}
