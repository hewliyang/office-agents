import { Type } from "@sinclair/typebox";
import { safeRun } from "../pptx/slide-zip";
import { defineTool, toolError, toolImage } from "./types";

/* global PowerPoint */

export const screenshotSlideTool = defineTool({
  name: "screenshot_slide",
  label: "Screenshot Slide",
  description:
    "Take a screenshot of a slide for visual verification of layout, positioning, and content.",
  parameters: Type.Object({
    slide_index: Type.Number({
      description:
        "0-based slide index (user's slide 1 = index 0, slide 3 = index 2)",
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief description of the action (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const imageData = await safeRun(async (context) => {
        const imageResult = context.presentation.slides
          .getItemAt(params.slide_index)
          .getImageAsBase64({ width: 960 });
        await context.sync();
        return imageResult.value;
      });

      return await toolImage(imageData, "image/png");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to screenshot slide";
      return toolError(message);
    }
  },
});
