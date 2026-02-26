import { Type } from "@sinclair/typebox";
import { getAllObjects } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

export const getAllObjectsTool = defineTool({
  name: "get_all_objects",
  label: "Get All Objects",
  description:
    "List all charts, pivot tables, and other objects in the workbook. " +
    "Use this to discover what visualizations exist before modifying them.",
  parameters: Type.Object({
    sheetId: Type.Optional(
      Type.Number({ description: "Filter to specific sheet" }),
    ),
    id: Type.Optional(Type.String({ description: "Filter by object ID" })),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await getAllObjects({
        sheetId: params.sheetId,
        id: params.id,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error getting objects";
      return toolError(message);
    }
  },
});
