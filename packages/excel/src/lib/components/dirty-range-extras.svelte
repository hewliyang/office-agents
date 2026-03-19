<script lang="ts">
  import type { ToolExtrasProps } from "@office-agents/core";
  import { getChatContext } from "@office-agents/core";
  import { Edit3 } from "lucide-svelte";
  import { type DirtyRange, mergeRanges } from "../dirty-tracker";
  import { navigateTo } from "../excel/api";

  interface Props extends ToolExtrasProps {}

  let { result, expanded }: Props = $props();

  const chat = getChatContext();

  function parseDirtyRanges(value: string | undefined): DirtyRange[] | null {
    if (!value) return null;

    try {
      const parsed = JSON.parse(value);
      if (parsed._dirtyRanges && Array.isArray(parsed._dirtyRanges)) {
        return parsed._dirtyRanges;
      }
    } catch {
      // tool result was not JSON
    }

    return null;
  }

  function getSheetName(sheetId: number) {
    return chat.getName(sheetId);
  }

  function getRangeLabel(range: DirtyRange) {
    if (range.sheetId < 0) {
      return range.range === "*" ? "Unknown sheet" : `Unknown!${range.range}`;
    }

    const sheetName = getSheetName(range.sheetId);
    if (!sheetName) return null;

    return range.range === "*"
      ? `${sheetName} (all)`
      : `${sheetName}!${range.range}`;
  }

  async function handleRangeClick(event: MouseEvent, range: DirtyRange) {
    event.stopPropagation();

    if (range.sheetId < 0) return;
    const navRange = range.range === "*" ? undefined : range.range;
    await navigateTo(range.sheetId, navRange).catch(console.error);
  }

  const ranges = $derived(parseDirtyRanges(result));
  const mergedRanges = $derived(ranges ? mergeRanges(ranges) : []);
  const validRanges = $derived(
    mergedRanges.filter(
      (range) => range.sheetId < 0 || getSheetName(range.sheetId),
    ),
  );
</script>

{#if validRanges.length > 0}
  {#if expanded}
    <Edit3 size={9} class="shrink-0" />
    <span class="shrink-0">Modified:</span>
    {#each validRanges as range, index (`${range.sheetId}-${range.range}`)}
      {#if index > 0}
        <span class="text-(--chat-warning-muted)">, </span>
      {/if}

      {@const label = getRangeLabel(range)}
      {#if label}
        {#if range.sheetId < 0}
          <span class="text-(--chat-warning-muted)">{label}</span>
        {:else}
          <button
            type="button"
            class="text-(--chat-warning) hover:underline cursor-pointer"
            onclick={(event) => handleRangeClick(event, range)}
          >
            {label}
          </button>
        {/if}
      {/if}
    {/each}
  {:else}
    <span class="flex items-center gap-1.5 text-(--chat-warning) shrink-0">
      <Edit3 size={9} />
      {#if validRanges.length === 1}
        {@const range = validRanges[0]}
        {@const sheetName =
          range.sheetId < 0 ? null : getSheetName(range.sheetId)}
        <span class="text-[10px] text-(--chat-warning) truncate">
          →
          {#if range.sheetId < 0}
            {range.range === "*" ? " unknown" : ` ${range.range}`}
          {:else if sheetName}
            {range.range === "*" ? ` ${sheetName}` : ` ${range.range}`}
          {/if}
        </span>
      {:else}
        <span class="text-[10px] text-(--chat-warning)">
          → {validRanges.length} ranges
        </span>
      {/if}
    </span>
  {/if}
{/if}
