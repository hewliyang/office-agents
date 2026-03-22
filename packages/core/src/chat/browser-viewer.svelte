<script lang="ts">
  import {
    onBrowseSessionChange,
    getBrowseSessionState,
    type BrowseSessionEvent,
  } from "@office-agents/sdk";
  import { Globe, X, Minimize2, Maximize2 } from "lucide-svelte";
  import { onDestroy } from "svelte";

  const initialState = getBrowseSessionState();
  let session = $state<BrowseSessionEvent>(initialState);
  let visible = $state(initialState.active && !!initialState.liveUrl);
  let expanded = $state(true);

  const unsub = onBrowseSessionChange((event) => {
    session = event;
    if (event.active && event.liveUrl) {
      visible = true;
      expanded = true;
    } else {
      visible = false;
    }
  });

  onDestroy(unsub);

  function close() {
    visible = false;
  }

  function toggleExpand() {
    expanded = !expanded;
  }

  const hasLiveUrl = $derived(session.active && !!session.liveUrl);
</script>

{#if visible && hasLiveUrl}
  <div
    class="relative z-50 flex flex-col shrink-0 overflow-hidden border-b border-(--chat-border) bg-(--chat-bg)"
  >
    <div
      class="flex items-center justify-between px-2 border-b border-(--chat-border) bg-(--chat-bg) shrink-0"
    >
      <div
        class="flex items-center gap-1.5 px-1 py-2 text-xs uppercase tracking-wider text-(--chat-accent)"
      >
        <Globe size={12} />
        <span>Live Browser</span>
      </div>
      <div class="flex items-center gap-0.5">
        <button
          onclick={toggleExpand}
          class="p-1.5 text-(--chat-text-muted) hover:text-(--chat-text-primary) transition-colors"
          data-tooltip={expanded ? "Minimize" : "Maximize"}
        >
          {#if expanded}
            <Minimize2 size={12} />
          {:else}
            <Maximize2 size={12} />
          {/if}
        </button>
        <button
          onclick={close}
          class="p-1.5 text-(--chat-text-muted) hover:text-(--chat-text-primary) transition-colors"
          data-tooltip="Close"
        >
          <X size={12} />
        </button>
      </div>
    </div>
    {#if expanded}
      <div class="h-[280px] bg-black overflow-hidden">
        <iframe
          src={session.liveUrl}
          title="Live browser session"
          sandbox="allow-scripts allow-same-origin allow-popups"
          class="w-[200%] h-[200%] border-none origin-top-left scale-50"
        ></iframe>
      </div>
    {/if}
  </div>
{/if}

{#if hasLiveUrl && !visible}
  <button
    class="relative z-50 flex items-center gap-1.5 w-full px-3 py-2 border-b border-(--chat-border) bg-(--chat-bg) text-(--chat-accent) text-xs uppercase tracking-wider shrink-0 transition-colors hover:bg-(--chat-bg-secondary) cursor-pointer"
    onclick={() => {
      visible = true;
      expanded = true;
    }}
  >
    <Globe size={12} />
    <span>Show live browser</span>
  </button>
{/if}
