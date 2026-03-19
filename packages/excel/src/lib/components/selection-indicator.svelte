<script lang="ts">
  import { Table } from "lucide-svelte";
  import { onMount } from "svelte";

  /* global Excel */

  interface SelectionState {
    activeSheetName: string;
    selectedRange: string;
  }

  let selection = $state<SelectionState | null>(null);

  function getSelectionState(): Promise<SelectionState> {
    return Excel.run(async (context) => {
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();
      activeSheet.load("name");

      const selectedRange = context.workbook.getSelectedRange();
      selectedRange.load("address");

      await context.sync();

      const rangeAddress = selectedRange.address.includes("!")
        ? selectedRange.address.split("!")[1]
        : selectedRange.address;

      return {
        activeSheetName: activeSheet.name,
        selectedRange: rangeAddress,
      };
    });
  }

  async function refresh() {
    try {
      selection = await getSelectionState();
    } catch {
      // ignore Office selection read errors
    }
  }

  onMount(() => {
    void refresh();

    let selectionHandler:
      | ((args: Excel.SelectionChangedEventArgs) => Promise<void>)
      | null = null;
    let activatedHandler:
      | ((args: Excel.WorksheetActivatedEventArgs) => Promise<void>)
      | null = null;

    Excel.run(async (context) => {
      selectionHandler = async () => {
        await refresh();
      };
      activatedHandler = async () => {
        await refresh();
      };

      context.workbook.onSelectionChanged.add(selectionHandler);
      context.workbook.worksheets.onActivated.add(activatedHandler);
      await context.sync();
    }).catch(() => {
      // fall back silently if workbook events are unavailable
    });

    return () => {
      if (!selectionHandler && !activatedHandler) return;

      Excel.run(async (context) => {
        if (selectionHandler) {
          context.workbook.onSelectionChanged.remove(selectionHandler);
        }
        if (activatedHandler) {
          context.workbook.worksheets.onActivated.remove(activatedHandler);
        }
        await context.sync();
      }).catch(() => {
        // ignore cleanup failures
      });
    };
  });
</script>

{#if selection}
  <div
    class="flex items-center gap-1.5 px-3 py-1 text-[10px] text-(--chat-text-muted) border-t border-(--chat-border) bg-(--chat-bg-secondary)"
    style="font-family: var(--chat-font-mono)"
  >
    <Table size={10} class="shrink-0 opacity-60" />
    <span class="truncate">{selection.activeSheetName}</span>
    <span class="opacity-40">·</span>
    <span class="truncate">{selection.selectedRange}</span>
  </div>
{/if}
