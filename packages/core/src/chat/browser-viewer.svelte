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
  <div class="browser-viewer" class:collapsed={!expanded}>
    <div class="browser-header">
      <div class="browser-title">
        <Globe size={12} />
        <span>Live Browser</span>
      </div>
      <div class="browser-controls">
        <button onclick={toggleExpand} class="control-btn" data-tooltip={expanded ? "Minimize" : "Maximize"}>
          {#if expanded}
            <Minimize2 size={12} />
          {:else}
            <Maximize2 size={12} />
          {/if}
        </button>
        <button onclick={close} class="control-btn" data-tooltip="Close">
          <X size={12} />
        </button>
      </div>
    </div>
    {#if expanded}
      <div class="browser-frame">
        <iframe
          src={session.liveUrl}
          title="Live browser session"
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
      </div>
    {/if}
  </div>
{/if}

{#if hasLiveUrl && !visible}
  <button class="browser-fab" onclick={() => { visible = true; expanded = true; }}>
    <Globe size={12} />
    <span>Show live browser</span>
  </button>
{/if}

<style>
  .browser-viewer {
    position: relative;
    z-index: 50;
    overflow: hidden;
    border-bottom: 1px solid var(--chat-border);
    background: var(--chat-bg-primary);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .browser-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: var(--chat-bg-secondary);
    border-bottom: 1px solid var(--chat-border);
    cursor: default;
    flex-shrink: 0;
  }

  .browser-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--chat-text-secondary);
    font-family: var(--chat-font-mono);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .browser-controls {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: var(--chat-text-muted);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .control-btn:hover {
    background: var(--chat-bg-tertiary);
    color: var(--chat-text-primary);
  }

  .browser-frame {
    height: 280px;
    background: #000;
    overflow: hidden;
  }

  .browser-frame iframe {
    width: 200%;
    height: 200%;
    border: none;
    transform: scale(0.5);
    transform-origin: top left;
  }

  .browser-fab {
    position: relative;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: none;
    border-bottom: 1px solid var(--chat-border);
    background: var(--chat-bg-secondary);
    color: var(--chat-accent);
    cursor: pointer;
    font-size: 11px;
    font-family: var(--chat-font-mono);
    flex-shrink: 0;
    width: 100%;
    transition: background 0.15s;
  }

  .browser-fab:hover {
    background: var(--chat-bg-tertiary);
  }
</style>
