import { Type } from "@sinclair/typebox";
import { getCellRanges } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

export const getCellRangesTool = defineTool({
  name: "get_cell_ranges",
  label: "Get Cell Ranges",
  description:
    "Read cell values, formulas, and formatting from specified ranges in a worksheet. " +
    "Returns cells as a sparse object with A1-notation keys. " +
    "Use this to inspect data before modifying it.",
  parameters: Type.Object({
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    ranges: Type.Array(Type.String(), {
      description: "Array of ranges in A1 notation, e.g. ['A1:C10', 'E1:E100']",
    }),
    includeStyles: Type.Optional(
      Type.Boolean({
        description: "Include font/fill styling info. Default: true",
        default: true,
      }),
    ),
    cellLimit: Type.Optional(
      Type.Number({
        description: "Maximum cells to return. Default: 2000",
        default: 2000,
      }),
    ),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation of what you're reading (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await getCellRanges(params.sheetId, params.ranges, {
        includeStyles: params.includeStyles,
        cellLimit: params.cellLimit,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error reading cells";
      return toolError(message);
    }
  },
});
