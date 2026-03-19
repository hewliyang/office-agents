<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
  let errorMessage = $state("");

  function onerror(error: unknown) {
    errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("[UI] Unhandled render error:", error);
  }
</script>

<svelte:boundary {onerror}>
  {@render children?.()}

  {#snippet failed(_error, reset)}
    <div
      class="h-screen w-full flex items-center justify-center bg-(--chat-bg) px-4"
      style="font-family: var(--chat-font-mono)"
    >
      <div class="w-full max-w-xl border border-(--chat-border) bg-(--chat-bg-secondary) p-4 space-y-3">
        <div class="text-xs uppercase tracking-widest text-(--chat-text-muted)">
          Unhandled UI Error
        </div>
        <div class="text-sm text-(--chat-text-primary)">
          The chat UI hit an unexpected error.
        </div>
        <pre class="max-h-48 overflow-auto text-xs text-(--chat-error) bg-(--chat-bg) border border-(--chat-border) p-2 whitespace-pre-wrap break-words">
{errorMessage}
        </pre>
        <div class="flex gap-2">
          <button
            type="button"
            onclick={() => {
              errorMessage = "";
              reset();
            }}
            class="px-3 py-1.5 text-xs border border-(--chat-border) text-(--chat-text-primary) hover:bg-(--chat-bg)"
          >
            Try again
          </button>
          <button
            type="button"
            onclick={() => window.location.reload()}
            class="px-3 py-1.5 text-xs border border-(--chat-error) text-(--chat-error) hover:bg-(--chat-error) hover:text-(--chat-bg)"
          >
            Reload add-in
          </button>
        </div>
      </div>
    </div>
  {/snippet}
</svelte:boundary>
