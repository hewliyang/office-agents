<script lang="ts">
  import { Monitor } from "lucide-svelte";
  import { onMount } from "svelte";

  /* global PowerPoint */

  interface SelectionState {
    slideIndex: number | null;
    slideCount: number;
    shapes: { name: string; type: string }[];
  }

  let selection = $state<SelectionState | null>(null);

  function getSelectionState(): Promise<SelectionState> {
    return PowerPoint.run(async (context) => {
      const slides = context.presentation.slides;
      slides.load("items/id");

      const selectedSlides = context.presentation.getSelectedSlides();
      selectedSlides.load("items/id");

      await context.sync();

      const idToIndex = new Map(slides.items.map((slide, index) => [slide.id, index]));

      let slideIndex: number | null = null;
      if (selectedSlides.items.length > 0) {
        slideIndex = idToIndex.get(selectedSlides.items[0].id) ?? null;
      }

      let shapes: { name: string; type: string }[] = [];
      try {
        const selectedShapes = context.presentation.getSelectedShapes();
        selectedShapes.load("items/name,items/type");
        await context.sync();
        shapes = selectedShapes.items.map((shape) => ({
          name: shape.name,
          type: shape.type,
        }));
      } catch {
        // selected shape APIs are not available on all hosts
      }

      return {
        slideIndex,
        slideCount: slides.items.length,
        shapes,
      };
    });
  }

  async function refresh() {
    try {
      selection = await getSelectionState();
    } catch {
      // ignore PowerPoint polling errors
    }
  }

  onMount(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 1500);

    return () => {
      window.clearInterval(interval);
    };
  });

  const slideLabel = $derived.by(() => {
    if (!selection || selection.slideCount === 0) return "";

    if (selection.slideIndex !== null) {
      return `Slide ${selection.slideIndex + 1} of ${selection.slideCount}`;
    }

    return `${selection.slideCount} slide${selection.slideCount === 1 ? "" : "s"}`;
  });
</script>

{#if selection && selection.slideCount > 0}
  <div
    class="flex items-center gap-1.5 px-3 py-1 text-[10px] text-(--chat-text-muted) border-t border-(--chat-border) bg-(--chat-bg-secondary)"
    style="font-family: var(--chat-font-mono)"
  >
    <Monitor size={10} class="shrink-0 opacity-60" />
    <span>{slideLabel}</span>
    {#if selection.shapes.length > 0}
      <span class="opacity-40">·</span>
      <span class="truncate max-w-[200px]">
        {selection.shapes.length === 1
          ? selection.shapes[0].name
          : `${selection.shapes.length} shapes selected`}
      </span>
    {/if}
  </div>
{/if}
