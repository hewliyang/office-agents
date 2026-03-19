<script lang="ts">
  interface Props {
    thinking: string;
    isStreaming?: boolean;
  }

  let { thinking, isStreaming = false }: Props = $props();
  let isExpanded = $state(false);
</script>

{#snippet chevron(expanded: boolean)}
  <svg class="shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path d={expanded ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<div class="mb-2 border border-(--chat-border) bg-(--chat-bg) rounded-sm overflow-hidden">
  <button
    type="button"
    onclick={() => (isExpanded = !isExpanded)}
    class="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-(--chat-accent) hover:bg-(--chat-bg-secondary) transition-colors"
  >
    {@render chevron(isExpanded)}
    <span>thinking</span>
    {#if isStreaming}
      <span class="animate-pulse ml-1">...</span>
    {/if}
  </button>

  {#if isExpanded}
    <div class="px-2 py-1.5 text-xs text-(--chat-text-muted) whitespace-pre-wrap wrap-break-word border-t border-(--chat-border) max-h-20 overflow-y-auto">
      {thinking}
    </div>
  {/if}
</div>
