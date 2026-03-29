<script lang="ts">
  import {
    closeActiveBrowser,
    onBrowseSessionChange,
    getBrowseSessionState,
  } from "@office-agents/sdk";
  import { Globe, Square } from "lucide-svelte";
  import { onDestroy } from "svelte";

  let active = $state(getBrowseSessionState().active);
  let stopping = $state(false);

  const unsub = onBrowseSessionChange((event) => {
    active = event.active;
    if (!event.active) stopping = false;
  });

  onDestroy(unsub);

  async function stopBrowser() {
    stopping = true;
    await closeActiveBrowser();
  }
</script>

{#if active}
  <div
    class="relative z-50 flex items-center justify-between px-3 py-2 border-b border-(--chat-border) bg-(--chat-bg) shrink-0"
  >
    <div
      class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-(--chat-accent)"
    >
      <Globe size={12} />
      <span>Browser session active</span>
    </div>
    <button
      onclick={stopBrowser}
      disabled={stopping}
      class={[
        "flex items-center gap-1 px-2 py-1 text-xs transition-colors",
        stopping
          ? "text-(--chat-text-muted) opacity-50 cursor-not-allowed"
          : "text-(--chat-text-muted) hover:text-red-500",
      ]}
      data-tooltip="Stop browser session"
    >
      <Square size={10} />
      <span>{stopping ? "Stopping…" : "Stop"}</span>
    </button>
  </div>
{/if}
