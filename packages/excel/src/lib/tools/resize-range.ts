import { Type } from "@sinclair/typebox";
import { resizeRange } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

const SizeSchema = Type.Optional(
  Type.Object({
    type: Type.Union([Type.Literal("points"), Type.Literal("standard")]),
    value: Type.Number(),
  }),
);

export const resizeRangeTool = defineTool({
  name: "resize_range",
  label: "Resize Range",
  description:
    "Adjust column widths or row heights. " +
    "Use 'A:D' for columns A-D, '1:5' for rows 1-5, or omit range for entire sheet.",
  parameters: Type.Object({
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    range: Type.Optional(
      Type.String({
        description:
          "Column range (A:D) or row range (1:5). Omit for entire sheet",
      }),
    ),
    width: SizeSchema,
    height: SizeSchema,
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  dirtyTracking: {
    getRanges: (p) => [{ sheetId: p.sheetId, range: p.range || "*" }],
  },
  execute: async (_toolCallId, params) => {
    try {
      const result = await resizeRange(params.sheetId, {
        range: params.range,
        width: params.width,
        height: params.height,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error resizing";
      return toolError(message);
    }
  },
});
