import { Monitor } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/* global PowerPoint */

interface SelectionState {
  slideIndex: number | null;
  slideCount: number;
  shapes: { name: string; type: string }[];
}

function getSelectionState(): Promise<SelectionState> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load("items/id");

    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load("items/id");

    await context.sync();

    const idToIndex = new Map(slides.items.map((s, i) => [s.id, i]));

    let slideIndex: number | null = null;
    if (selectedSlides.items.length > 0) {
      slideIndex = idToIndex.get(selectedSlides.items[0].id) ?? null;
    }

    let shapes: { name: string; type: string }[] = [];
    try {
      const selectedShapes = context.presentation.getSelectedShapes();
      selectedShapes.load("items/name,items/type");
      await context.sync();
      shapes = selectedShapes.items.map((s) => ({
        name: s.name,
        type: s.type,
      }));
    } catch {
      // getSelectedShapes may not be available
    }

    return {
      slideIndex,
      slideCount: slides.items.length,
      shapes,
    };
  });
}

export function SelectionIndicator() {
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const state = await getSelectionState();
      setSelection(state);
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  if (!selection || selection.slideCount === 0) return null;

  const slideLabel =
    selection.slideIndex !== null
      ? `Slide ${selection.slideIndex + 1} of ${selection.slideCount}`
      : `${selection.slideCount} slide${selection.slideCount !== 1 ? "s" : ""}`;

  const shapeCount = selection.shapes.length;

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 text-[10px] text-(--chat-text-muted) border-t border-(--chat-border) bg-(--chat-bg-secondary)"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      <Monitor size={10} className="shrink-0 opacity-60" />
      <span>{slideLabel}</span>
      {shapeCount > 0 && (
        <>
          <span className="opacity-40">·</span>
          <span className="truncate max-w-[200px]">
            {shapeCount === 1
              ? selection.shapes[0].name
              : `${shapeCount} shapes selected`}
          </span>
        </>
      )}
    </div>
  );
}
