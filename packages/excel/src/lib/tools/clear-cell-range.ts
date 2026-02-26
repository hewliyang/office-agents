import { Type } from "@sinclair/typebox";
import { clearCellRange } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

export const clearCellRangeTool = defineTool({
  name: "clear_cell_range",
  label: "Clear Cell Range",
  description:
    "Clear contents, formatting, or both from a range of cells. " +
    "Use 'contents' to keep formatting, 'formats' to keep values, 'all' to clear everything.",
  parameters: Type.Object({
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    range: Type.String({ description: "Range to clear in A1 notation" }),
    clearType: Type.Optional(
      Type.Union(
        [
          Type.Literal("contents"),
          Type.Literal("all"),
          Type.Literal("formats"),
        ],
        {
          description: "What to clear. Default: 'contents'",
        },
      ),
    ),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  dirtyTracking: {
    getRanges: (p) => [{ sheetId: p.sheetId, range: p.range }],
  },
  execute: async (_toolCallId, params) => {
    try {
      const result = await clearCellRange(
        params.sheetId,
        params.range,
        params.clearType,
      );
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error clearing cells";
      return toolError(message);
    }
  },
});
