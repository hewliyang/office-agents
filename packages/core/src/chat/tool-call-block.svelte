<script lang="ts">
  import type { MessagePart } from "@office-agents/sdk";
  import { CheckCircle2, Loader2, Wrench, XCircle } from "lucide-svelte";
  import { getChatContext } from "./chat-runtime-context";
  import MarkdownContent from "./markdown-content.svelte";

  type ToolCallPart = Extract<MessagePart, { type: "toolCall" }>;

  interface Props {
    part: ToolCallPart;
  }

  const CODE_FIELD_LANGS: Record<string, string> = {
    code: "javascript",
    command: "text",
  };

  const HIDDEN_ARG_FIELDS = new Set(["explanation"]);
  const HIDDEN_RESULT_FIELDS = new Set(["_dirtyRanges", "_modifiedSlide"]);

  let { part }: Props = $props();
  const chat = getChatContext();
  const runtimeState = chat.state;
  let isExpanded = $state(chat.snapshot.providerConfig?.expandToolCalls ?? false);

  function splitArgs(args: Record<string, unknown>) {
    const codeBlocks: { field: string; lang: string; value: string }[] = [];
    const rest: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(args)) {
      if (HIDDEN_ARG_FIELDS.has(key)) continue;
      const lang = CODE_FIELD_LANGS[key];
      if (lang && typeof value === "string") {
        codeBlocks.push({ field: key, lang, value });
      } else {
        rest[key] = value;
      }
    }

    return { codeBlocks, rest };
  }

  function cleanResult(raw: string): string {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        const cleaned = { ...parsed };
        for (const key of HIDDEN_RESULT_FIELDS) {
          if (key in cleaned) {
            delete cleaned[key];
          }
        }
        return JSON.stringify(cleaned, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  const explanation = $derived(
    (part.args as { explanation?: string })?.explanation,
  );
  const ToolExtras = $derived(chat.adapter.ToolExtras);
  const split = $derived(splitArgs(part.args));
  const hasRestArgs = $derived(Object.keys(split.rest).length > 0);
  const resultText = $derived(part.result ? cleanResult(part.result) : undefined);
  const isStreaming = $derived(
    part.status === "pending" || part.status === "running",
  );
</script>

{#snippet chevron(expanded: boolean)}
  <svg class="shrink-0" width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path d={expanded ? "m6 9 6 6 6-6" : "m9 6 6 6-6 6"} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

<div class="mt-3 mb-2 border border-(--chat-border) bg-(--chat-bg) rounded-sm overflow-hidden">
  <button
    type="button"
    onclick={() => (isExpanded = !isExpanded)}
    class={`w-full min-w-0 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider text-(--chat-text-secondary) hover:bg-(--chat-bg-secondary) transition-colors ${explanation ? "normal-case" : "uppercase"}`}
  >
    {@render chevron(isExpanded)}
    <Wrench size={10} />
    <span class="min-w-0 flex-1 text-left font-medium truncate">
      {explanation || part.name}
    </span>
    {#if !isExpanded && ToolExtras}
      <ToolExtras toolName={part.name} result={part.result} expanded={false} />
    {/if}
    <span class="shrink-0">
      {#if part.status === "pending"}
        <Loader2 size={10} class="animate-spin text-(--chat-text-muted)" />
      {:else if part.status === "running"}
        <Loader2 size={10} class="animate-spin text-(--chat-accent)" />
      {:else if part.status === "complete"}
        <CheckCircle2 size={10} class="text-green-500" />
      {:else}
        <XCircle size={10} class="text-red-500" />
      {/if}
    </span>
  </button>

  {#if isExpanded}
    <div class="border-t border-(--chat-border)">
      {#if ToolExtras}
        <div class="px-2 py-1 text-[10px] bg-(--chat-warning-bg) text-(--chat-warning) flex items-center gap-1 flex-wrap">
          <ToolExtras toolName={part.name} result={part.result} expanded={true} />
        </div>
      {/if}

      {#if hasRestArgs}
        <div class="px-2 py-1.5 text-xs">
          <div class="text-(--chat-text-muted) text-[10px] uppercase mb-1">
            args
          </div>
          <div class="max-h-32 overflow-y-auto">
            <MarkdownContent
              text={`\`\`\`json\n${JSON.stringify(split.rest, null, 2)}\n\`\`\``}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      {/if}

      {#each split.codeBlocks as block, index (block.field)}
        <div
          class={`px-2 py-1.5 text-xs ${hasRestArgs || index > 0 ? "border-t border-(--chat-border)" : ""}`}
        >
          <div class="text-(--chat-text-muted) text-[10px] uppercase mb-1">
            {block.field}
          </div>
          <div class="max-h-64 overflow-y-auto">
            <MarkdownContent
              text={`\`\`\`${block.lang}\n${block.value}\n\`\`\``}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      {/each}

      {#if part.images && part.images.length > 0}
        <div class="px-2 py-1.5 border-t border-(--chat-border)">
          {#each part.images as img, imgIdx (`${part.id}-img-${imgIdx}`)}
            <img
              src={`data:${img.mimeType};base64,${img.data}`}
              alt={`Tool result ${imgIdx + 1}`}
              class="max-w-full rounded-sm border border-(--chat-border)"
            />
          {/each}
        </div>
      {/if}

      {#if resultText}
        <div class="px-2 py-1.5 text-xs border-t border-(--chat-border)">
          <div class="text-(--chat-text-muted) text-[10px] uppercase mb-1">
            {part.status === "error" ? "error" : "result"}
          </div>
          <div class={`max-h-40 overflow-y-auto ${part.status === "error" ? "[&_code]:text-red-400!" : ""}`}>
            <MarkdownContent
              text={`\`\`\`json\n${resultText}\n\`\`\``}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
