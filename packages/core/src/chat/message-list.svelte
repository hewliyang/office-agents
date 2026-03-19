<script lang="ts">
  import type { ChatMessage, MessagePart } from "@office-agents/sdk";
  import { Loader2 } from "lucide-svelte";
  import { tick } from "svelte";
  import { getChatContext } from "./chat-runtime-context";
  import MarkdownContent from "./markdown-content.svelte";
  import ThinkingBlock from "./thinking-block.svelte";
  import ToolCallBlock from "./tool-call-block.svelte";

  type ToolCallPart = Extract<MessagePart, { type: "toolCall" }>;
  type ThinkingPart = Extract<MessagePart, { type: "thinking" }>;

  type MessageGroup =
    | { type: "user"; message: ChatMessage }
    | { type: "assistant"; messages: ChatMessage[] };

  const chat = getChatContext();
  const runtimeState = chat.state;
  const adapter = chat.adapter;

  let container = $state<HTMLDivElement | null>(null);
  let shouldAutoScroll = true;

  function groupMessages(messages: ChatMessage[]): MessageGroup[] {
    const groups: MessageGroup[] = [];
    let currentAssistantGroup: ChatMessage[] = [];

    for (const message of messages) {
      if (message.role === "user") {
        if (currentAssistantGroup.length > 0) {
          groups.push({ type: "assistant", messages: currentAssistantGroup });
          currentAssistantGroup = [];
        }
        groups.push({ type: "user", message });
      } else {
        currentAssistantGroup.push(message);
      }
    }

    if (currentAssistantGroup.length > 0) {
      groups.push({ type: "assistant", messages: currentAssistantGroup });
    }

    return groups;
  }

  function flattenAssistantParts(messages: ChatMessage[]) {
    const allParts: { part: MessagePart; messageId: string; isLast: boolean }[] =
      [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const isLastMessage = i === messages.length - 1;
      for (let j = 0; j < message.parts.length; j++) {
        allParts.push({
          part: message.parts[j],
          messageId: message.id,
          isLast: isLastMessage && j === message.parts.length - 1,
        });
      }
    }

    return allParts;
  }

  function handleScroll() {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    shouldAutoScroll = distanceFromBottom < 100;
  }

  const groups = $derived(groupMessages($runtimeState.messages));
  const lastMessage = $derived(
    $runtimeState.messages[$runtimeState.messages.length - 1],
  );
  const showLoading = $derived(
    $runtimeState.isStreaming && lastMessage?.role === "user",
  );
  const lastGroup = $derived(groups[groups.length - 1]);
  const isStreamingAssistant = $derived(
    $runtimeState.isStreaming && lastGroup?.type === "assistant",
  );

  $effect(() => {
    $runtimeState.messages;
    $runtimeState.isStreaming;
    void tick().then(() => {
      if (container && shouldAutoScroll) {
        container.scrollTop = container.scrollHeight;
      }
    });
  });
</script>

{#snippet renderPart(part: MessagePart, streaming: boolean)}
  {#if part.type === "thinking"}
    <ThinkingBlock thinking={(part as ThinkingPart).thinking} isStreaming={streaming} />
  {:else if part.type === "toolCall"}
    <ToolCallBlock part={part as ToolCallPart} />
  {:else}
    <MarkdownContent
      text={part.text}
      isStreaming={streaming}
      onLinkClick={adapter.handleLinkClick}
    />
  {/if}
{/snippet}

{#if $runtimeState.messages.length === 0}
  <div
    class="flex-1 flex flex-col items-center justify-center p-6 text-center"
    style="font-family: var(--chat-font-mono)"
  >
    <div class="text-(--chat-text-muted) text-xs uppercase tracking-widest mb-2">
      no messages
    </div>
    <div class="text-(--chat-text-secondary) text-sm max-w-[200px]">
      {adapter.emptyStateMessage || "Start a conversation to get started"}
    </div>
  </div>
{:else}
  <div
    bind:this={container}
    onscroll={handleScroll}
    class="flex-1 overflow-y-auto p-3 space-y-3"
    style="scrollbar-width: thin; scrollbar-color: var(--chat-scrollbar) transparent;"
  >
    {#each groups as group, index (group.type === "user" ? group.message.id : group.messages[0].id)}
      {#if group.type === "user"}
        <div
          class="ml-8 px-3 py-2 text-sm leading-relaxed bg-(--chat-user-bg) border border-(--chat-border)"
          style="border-radius: var(--chat-radius); font-family: var(--chat-font-mono)"
        >
          {#each group.message.parts as part, partIndex (`${group.message.id}-${part.type}-${partIndex}`)}
            {@render renderPart(part, false)}
          {/each}
        </div>
      {:else}
        {@const allParts = flattenAssistantParts(group.messages)}
        <div class="text-sm leading-relaxed" style="font-family: var(--chat-font-mono)">
          {#each allParts as entry, partIndex (entry.part.type === "toolCall" ? entry.part.id : `${entry.messageId}-${entry.part.type}-${partIndex}`)}
            {@render renderPart(entry.part, isStreamingAssistant && index === groups.length - 1 && entry.isLast)}
          {/each}

          {#if isStreamingAssistant && allParts.length === 0}
            <span class="animate-pulse">▊</span>
          {/if}
        </div>
      {/if}
    {/each}

    {#if showLoading}
      <div
        class="flex items-center gap-2 text-(--chat-text-muted) text-sm"
        style="font-family: var(--chat-font-mono)"
      >
        <Loader2 size={14} class="animate-spin" />
        <span>thinking...</span>
      </div>
    {/if}
  </div>
{/if}
