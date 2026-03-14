import { FileText } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* global Word, Office */

interface SelectionState {
  selectedText: string;
}

function getSelectionState(): Promise<SelectionState> {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    selection.load("text");
    await context.sync();

    return {
      selectedText:
        selection.text.length > 60
          ? `${selection.text.substring(0, 60)}…`
          : selection.text,
    };
  });
}

export function SelectionIndicator() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const handlerAdded = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const state = await getSelectionState();
      setSelection(state);
    } catch {
      // ignore errors
    }
  }, []);

  useEffect(() => {
    refresh();

    if (!handlerAdded.current) {
      handlerAdded.current = true;
      Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        () => {
          refresh();
        },
      );
    }

    return () => {
      // Note: removeHandlerAsync would remove ALL handlers for this event
      // so we only add once via the ref guard
    };
  }, [refresh]);

  if (!selection) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 text-[10px] text-(--chat-text-muted) border-t border-(--chat-border) bg-(--chat-bg-secondary)"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      <FileText size={10} className="shrink-0 opacity-60" />
      {selection.selectedText ? (
        <span className="truncate max-w-[200px]">
          &ldquo;{selection.selectedText}&rdquo;
        </span>
      ) : (
        <span>No selection</span>
      )}
    </div>
  );
}
