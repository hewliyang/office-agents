<script lang="ts">
  import { Pencil } from "lucide-svelte";
  import { onMount } from "svelte";

  /* global Word, Office */

  type ChangeTrackingMode = "Off" | "TrackAll" | "TrackMineOnly" | "Unknown";

  const TRACKING_MODE_CHANGED_EVENT = "word-tracking-mode-maybe-changed";

  let mode = $state<ChangeTrackingMode | null>(null);
  let isUpdating = $state(false);

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

  function getTitle(value: ChangeTrackingMode | null): string {
    switch (value) {
      case "TrackAll":
        return "Track Changes: ON (all edits) - Click to turn off";
      case "TrackMineOnly":
        return "Track Changes: ON (my edits only) - Click to turn off";
      case "Off":
        return "Track Changes: OFF - Click to turn on";
      case "Unknown":
        return "Track Changes: Unknown";
      default:
        return "Track Changes";
    }
  }

  function getTooltip(value: ChangeTrackingMode | null): string {
    switch (value) {
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

  async function refresh() {
    try {
      mode = await getChangeTrackingMode();
    } catch {
      mode = "Unknown";
    }
  }

  async function handleToggle() {
    if (isUpdating || mode === "Unknown") return;

    isUpdating = true;
    try {
      mode = await toggleChangeTracking();
    } catch {
      await refresh();
    } finally {
      isUpdating = false;
    }
  }

  onMount(() => {
    void refresh();

    const handleFocus = () => {
      void refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener(TRACKING_MODE_CHANGED_EVENT, handleFocus);

    Office.context.document.addHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      () => {
        void refresh();
      },
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener(TRACKING_MODE_CHANGED_EVENT, handleFocus);
    };
  });

  const trackingOn = $derived(mode === "TrackAll" || mode === "TrackMineOnly");
  const buttonClass = $derived(
    trackingOn
      ? "text-(--chat-accent) hover:text-(--chat-text-primary)"
      : "text-(--chat-text-muted) hover:text-(--chat-text-primary)",
  );
</script>

<button
  type="button"
  onclick={handleToggle}
  disabled={isUpdating || mode === "Unknown"}
  class={`p-1.5 transition-colors ${buttonClass} ${isUpdating || mode === "Unknown" ? "opacity-70" : ""}`}
  data-tooltip={getTooltip(mode)}
  aria-label={getTitle(mode)}
>
  <Pencil size={14} />
</button>
