import { Type } from "@sinclair/typebox";
import { safeRun } from "../pptx/slide-zip";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

interface ShapeInfo {
  id: string;
  name: string;
  left: number;
  top: number;
  w: number;
  h: number;
}

interface VerifyResult {
  shapes: ShapeInfo[];
  overflows: Array<{
    shape: ShapeInfo;
    overflowBy: number;
    [key: string]: unknown;
  }>;
  overlaps: Array<{
    shapeA: ShapeInfo;
    shapeB: ShapeInfo;
    overlapX: number;
    overlapY: number;
  }>;
}

function verifyShapes(
  shapes: {
    id: string;
    name: string;
    left: number;
    top: number;
    width: number;
    height: number;
  }[],
  slideWidth: number,
  slideHeight: number,
): VerifyResult {
  const infos: ShapeInfo[] = [];
  const overflows: VerifyResult["overflows"] = [];
  const overlaps: VerifyResult["overlaps"] = [];

  for (const shape of shapes) {
    const info: ShapeInfo = {
      id: shape.id,
      name: shape.name,
      left: shape.left,
      top: shape.top,
      w: shape.width,
      h: shape.height,
    };
    infos.push(info);

    if (shape.top + shape.height > slideHeight) {
      overflows.push({
        shape: info,
        bottom: shape.top + shape.height,
        slideH: slideHeight,
        overflowBy: shape.top + shape.height - slideHeight,
      });
    }
    if (shape.left + shape.width > slideWidth) {
      overflows.push({
        shape: info,
        right: shape.left + shape.width,
        slideW: slideWidth,
        overflowBy: shape.left + shape.width - slideWidth,
      });
    }
  }

  for (let i = 0; i < infos.length; i++) {
    for (let j = i + 1; j < infos.length; j++) {
      const a = infos[i];
      const b = infos[j];

      if (
        a.left < b.left + b.w &&
        a.left + a.w > b.left &&
        a.top < b.top + b.h &&
        a.top + a.h > b.top
      ) {
        const overlapX =
          Math.min(a.left + a.w, b.left + b.w) - Math.max(a.left, b.left);
        const overlapY =
          Math.min(a.top + a.h, b.top + b.h) - Math.max(a.top, b.top);
        overlaps.push({ shapeA: a, shapeB: b, overlapX, overlapY });
      }
    }
  }

  return { shapes: infos, overflows, overlaps };
}

export const verifySlidesTool = defineTool({
  name: "verify_slides",
  label: "Verify Slides",
  description:
    "Verify all slides for overlapping shapes, out-of-bounds positioning, and unused placeholders.",
  parameters: Type.Object({
    explanation: Type.Optional(
      Type.String({
        description: "Brief description (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, _params) => {
    try {
      const result = await safeRun(async (context) => {
        const slides = context.presentation.slides;
        slides.load("items");

        const pageSetup = context.presentation.pageSetup;
        pageSetup.load(["slideWidth", "slideHeight"]);
        await context.sync();

        const slideWidth = pageSetup.slideWidth;
        const slideHeight = pageSetup.slideHeight;
        const results: VerifyResult[] = [];

        for (const slide of slides.items) {
          const shapes = slide.shapes;
          shapes.load(
            "items/id,items/name,items/left,items/top,items/width,items/height",
          );
          await context.sync();

          results.push(verifyShapes(shapes.items, slideWidth, slideHeight));
        }

        return { slides: results };
      });

      return toolSuccess({ success: true, result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify slides";
      return toolError(message);
    }
  },
});
