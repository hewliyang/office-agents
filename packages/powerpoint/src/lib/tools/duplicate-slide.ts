import { Type } from "@sinclair/typebox";
import { safeRun } from "../pptx/slide-zip";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

export const duplicateSlideTool = defineTool({
  name: "duplicate_slide",
  label: "Duplicate Slide",
  description:
    "Duplicate a slide in the presentation. The copy is inserted immediately after the original.",
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
      await safeRun(async (context) => {
        const slides = context.presentation.slides;
        slides.load("items/id");
        await context.sync();

        if (
          params.slide_index < 0 ||
          params.slide_index >= slides.items.length
        ) {
          throw new Error(
            `Slide index ${params.slide_index} out of range (0-${slides.items.length - 1})`,
          );
        }

        const exported = slides.getItemAt(params.slide_index).exportAsBase64();
        await context.sync();

        const targetSlideId = slides.items[params.slide_index].id;
        context.presentation.insertSlidesFromBase64(exported.value, {
          targetSlideId,
        });
        await context.sync();
      });

      return toolSuccess({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to duplicate slide";
      return toolError(message);
    }
  },
  modifiedSlide: (params) => params.slide_index,
});
