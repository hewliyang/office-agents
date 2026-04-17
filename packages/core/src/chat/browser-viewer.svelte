<script lang="ts">
  import {
    closeActiveBrowser,
    getBrowsePreviewState,
    onBrowsePreviewChange,
    switchActiveBrowserTab,
  } from "@office-agents/sdk";
  import { ExternalLink, Globe, Loader2, Square } from "lucide-svelte";
  import { onDestroy } from "svelte";

  let preview = $state(getBrowsePreviewState());
  let stopping = $state(false);
  let switchingTargetId = $state<string | null>(null);
  let canvas = $state<HTMLCanvasElement | null>(null);

  const unsub = onBrowsePreviewChange((event) => {
    preview = event;
    if (!event.active) {
      stopping = false;
      switchingTargetId = null;
    }
  });

  onDestroy(unsub);

  $effect(() => {
    const frame = preview.frameBase64;
    const targetCanvas = canvas;
    if (!frame || !targetCanvas) {
      return undefined;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled || !targetCanvas) return;
      targetCanvas.width = image.naturalWidth;
      targetCanvas.height = image.naturalHeight;
      const context = targetCanvas.getContext("2d");
      context?.drawImage(image, 0, 0);
    };
    image.src = `data:image/jpeg;base64,${frame}`;

    return () => {
      cancelled = true;
    };
  });

  async function stopBrowser() {
    stopping = true;
    await closeActiveBrowser();
  }

  async function handleSwitchTab(index: number, targetId: string) {
    if (switchingTargetId || !preview.active) return;
    switchingTargetId = targetId;
    try {
      await switchActiveBrowserTab(index);
    } finally {
      switchingTargetId = null;
    }
  }
</script>

{#if preview.active}
  <div class="relative z-50 shrink-0 border-b border-(--chat-border) bg-(--chat-bg)">
    <div class="flex items-center gap-2 border-b border-(--chat-border) px-3 py-2">
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <div class="flex items-center gap-1.5 text-xs uppercase tracking-wider text-(--chat-accent)">
          <Globe size={12} />
          <span>{preview.live ? "live preview" : "browser preview"}</span>
        </div>
        <div class="min-w-0 truncate text-[11px] text-(--chat-text-secondary)">
          {preview.url || "about:blank"}
        </div>
      </div>

      <div class="flex items-center gap-2 text-[10px] uppercase tracking-wider text-(--chat-text-muted)">
        <span
          class={`inline-flex items-center gap-1 ${preview.connected ? "text-(--chat-accent)" : "text-(--chat-text-muted)"}`}
        >
          <span
            class={`h-1.5 w-1.5 rounded-full ${preview.live ? "bg-(--chat-accent)" : preview.connected ? "bg-yellow-500" : "bg-(--chat-text-muted)"}`}
          ></span>
          {preview.live ? "live" : preview.connected ? "connected" : "offline"}
        </span>
        <button
          onclick={stopBrowser}
          disabled={stopping}
          class={[
            "flex items-center gap-1 px-2 py-1 text-xs transition-colors",
            stopping
              ? "cursor-not-allowed opacity-50 text-(--chat-text-muted)"
              : "text-(--chat-text-muted) hover:text-red-500",
          ]}
          data-tooltip="Stop browser session"
        >
          <Square size={10} />
          <span>{stopping ? "Stopping…" : "Stop"}</span>
        </button>
      </div>
    </div>

    {#if preview.tabs.length > 1}
      <div class="flex gap-1 overflow-x-auto border-b border-(--chat-border) px-2 py-1.5">
        {#each preview.tabs as tab (tab.targetId)}
          <button
            type="button"
            disabled={tab.active || switchingTargetId !== null}
            onclick={() => handleSwitchTab(tab.index, tab.targetId)}
            class={`flex max-w-[180px] shrink-0 items-center gap-1 rounded border px-2 py-1 text-[10px] transition-colors ${tab.active ? "border-(--chat-accent) bg-(--chat-bg-secondary) text-(--chat-text-primary)" : "border-(--chat-border) text-(--chat-text-muted) hover:text-(--chat-text-primary)"} ${switchingTargetId === tab.targetId ? "opacity-60" : ""}`}
          >
            {#if switchingTargetId === tab.targetId}
              <Loader2 size={10} class="animate-spin" />
            {:else}
              <ExternalLink size={10} />
            {/if}
            <span class="truncate">
              {tab.title || tab.url || `Tab ${tab.index + 1}`}
            </span>
          </button>
        {/each}
      </div>
    {/if}

    <div class="flex h-[220px] items-center justify-center bg-(--chat-bg-secondary)">
      {#if preview.frameBase64}
        <canvas
          bind:this={canvas}
          class="max-h-full max-w-full object-contain"
        ></canvas>
      {:else}
        <div class="flex flex-col items-center gap-2 px-4 text-center text-xs text-(--chat-text-muted)">
          {#if preview.connected}
            <Loader2 size={16} class="animate-spin" />
            <span>Waiting for the browser preview…</span>
          {:else}
            <Globe size={16} />
            <span>Browser connected, preview unavailable.</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
