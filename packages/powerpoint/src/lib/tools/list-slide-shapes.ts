import { Type } from "@sinclair/typebox";
import { safeRun } from "../pptx/slide-zip";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

export const listSlideShapesTool = defineTool({
  name: "list_slide_shapes",
  label: "List Slide Shapes",
  description:
    "List all shapes on a slide with their IDs, names, types, and positions. " +
    "Call this to discover shape IDs before using read_slide_text or edit_slide_text — " +
    "always use the shape ID (stable, locale-independent), never guess shape names.",
  parameters: Type.Object({
    slide_index: Type.Number({
      description:
        "0-based slide index (user's slide 1 = index 0, slide 3 = index 2)",
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief description (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await safeRun(async (context) => {
        const slides = context.presentation.slides;
        slides.load("items");
        await context.sync();

        if (
          params.slide_index < 0 ||
          params.slide_index >= slides.items.length
        ) {
          throw new Error(
            `Slide index ${params.slide_index} out of range (0-${slides.items.length - 1})`,
          );
        }

        const slide = slides.items[params.slide_index];
        const shapes = slide.shapes;
        shapes.load(
          "items/id,items/name,items/type,items/left,items/top,items/width,items/height",
        );
        await context.sync();

        return shapes.items.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.type,
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height,
        }));
      });

      return toolSuccess({ success: true, result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to list slide shapes";
      return toolError(message);
    }
  },
});
