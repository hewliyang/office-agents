import { Type } from "@sinclair/typebox";
import { copyTo } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

export const copyToTool = defineTool({
  name: "copy_to",
  label: "Copy To",
  description:
    "Copy a range to another location with formula translation. " +
    "If destination is larger, the source pattern repeats. " +
    "Great for filling formulas down a column.",
  parameters: Type.Object({
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    sourceRange: Type.String({ description: "Source range in A1 notation" }),
    destinationRange: Type.String({
      description: "Destination range in A1 notation",
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  dirtyTracking: {
    getRanges: (p) => [{ sheetId: p.sheetId, range: p.destinationRange }],
  },
  execute: async (_toolCallId, params) => {
    try {
      const result = await copyTo(
        params.sheetId,
        params.sourceRange,
        params.destinationRange,
      );
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error copying range";
      return toolError(message);
    }
  },
});
