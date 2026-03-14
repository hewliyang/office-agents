import { Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* global Word, Office */

type ChangeTrackingMode = "Off" | "TrackAll" | "TrackMineOnly" | "Unknown";
const TRACKING_MODE_CHANGED_EVENT = "word-tracking-mode-maybe-changed";

async function getChangeTrackingMode(): Promise<ChangeTrackingMode> {
  return Word.run(async (context) => {
    context.document.load("changeTrackingMode");
    await context.sync();
    return context.document.changeTrackingMode as ChangeTrackingMode;
  });
}

async function toggleChangeTracking(): Promise<ChangeTrackingMode> {
  return Word.run(async (context) => {
    context.document.load("changeTrackingMode");
    await context.sync();

    const current = context.document.changeTrackingMode as ChangeTrackingMode;
    context.document.changeTrackingMode =
      current === "Off" ? "TrackAll" : "Off";
    await context.sync();

    return context.document.changeTrackingMode as ChangeTrackingMode;
  });
}

function getTitle(mode: ChangeTrackingMode | null): string {
  switch (mode) {
    case "TrackAll":
      return "Track Changes: ON (all edits) — Click to turn off";
    case "TrackMineOnly":
      return "Track Changes: ON (my edits only) — Click to turn off";
    case "Off":
      return "Track Changes: OFF — Click to turn on";
    case "Unknown":
      return "Track Changes: Unknown";
    default:
      return "Track Changes";
  }
}

function getTooltip(mode: ChangeTrackingMode | null): string {
  switch (mode) {
    case "TrackAll":
      return "Track Changes: ON";
    case "TrackMineOnly":
      return "Track Changes: ON (mine)";
    case "Off":
      return "Track Changes: OFF";
    default:
      return "Track Changes";
  }
}

export function TrackChangesIndicator() {
  const [mode, setMode] = useState<ChangeTrackingMode | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const handlerAdded = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setMode(await getChangeTrackingMode());
    } catch {
      setMode("Unknown");
    }
  }, []);

  const handleToggle = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      setMode(await toggleChangeTracking());
    } catch {
      await refresh();
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, refresh]);

  useEffect(() => {
    refresh();

    const handleFocus = () => {
      refresh();
    };

    const handleTrackingModeMaybeChanged = () => {
      refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener(
      TRACKING_MODE_CHANGED_EVENT,
      handleTrackingModeMaybeChanged,
    );

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
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener(
        TRACKING_MODE_CHANGED_EVENT,
        handleTrackingModeMaybeChanged,
      );
    };
  }, [refresh]);

  const trackingOn = mode === "TrackAll" || mode === "TrackMineOnly";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isUpdating || mode === "Unknown"}
      className={`p-1.5 transition-colors ${
        trackingOn
          ? "text-(--chat-accent) hover:text-(--chat-text-primary)"
          : "text-(--chat-text-muted) hover:text-(--chat-text-primary)"
      } ${isUpdating || mode === "Unknown" ? "opacity-70" : ""}`}
      data-tooltip={getTooltip(mode)}
      aria-label={getTitle(mode)}
    >
      <Pencil size={14} />
    </button>
  );
}
