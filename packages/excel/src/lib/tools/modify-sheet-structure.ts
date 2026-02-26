import { Type } from "@sinclair/typebox";
import { modifySheetStructure } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

export const modifySheetStructureTool = defineTool({
  name: "modify_sheet_structure",
  label: "Modify Sheet Structure",
  description:
    "Insert, delete, hide, or freeze rows and columns. Use reference like '5' for row 5 or 'C' for column C.",
  parameters: Type.Object({
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    operation: Type.Union(
      [
        Type.Literal("insert"),
        Type.Literal("delete"),
        Type.Literal("hide"),
        Type.Literal("unhide"),
        Type.Literal("freeze"),
        Type.Literal("unfreeze"),
      ],
      { description: "Operation to perform" },
    ),
    dimension: Type.Union([Type.Literal("rows"), Type.Literal("columns")], {
      description: "Rows or columns (not needed for unfreeze)",
    }),
    reference: Type.Optional(
      Type.String({
        description: "Row number or column letter, e.g. '5' or 'C'",
      }),
    ),
    count: Type.Optional(
      Type.Number({ description: "Number of rows/columns. Default: 1" }),
    ),
    position: Type.Optional(
      Type.Union([Type.Literal("before"), Type.Literal("after")], {
        description: "Insert before or after reference. Default: 'before'",
      }),
    ),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  dirtyTracking: {
    getRanges: (p) => [{ sheetId: p.sheetId, range: "*" }],
  },
  execute: async (_toolCallId, params) => {
    try {
      const result = await modifySheetStructure(params.sheetId, {
        operation: params.operation,
        dimension: params.dimension,
        reference: params.reference,
        count: params.count,
        position: params.position,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error modifying structure";
      return toolError(message);
    }
  },
});
