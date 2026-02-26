import { Type } from "@sinclair/typebox";
import { modifyObject } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

const PivotFieldSchema = Type.Object({
  field: Type.String(),
  summarizeBy: Type.Optional(
    Type.Union([
      Type.Literal("sum"),
      Type.Literal("count"),
      Type.Literal("average"),
      Type.Literal("max"),
      Type.Literal("min"),
    ]),
  ),
});

const PropertiesSchema = Type.Object({
  name: Type.Optional(Type.String()),
  source: Type.Optional(
    Type.String({ description: "Data source range, e.g. 'Sheet1!A1:D100'" }),
  ),
  range: Type.Optional(
    Type.String({ description: "Output location (pivot table top-left cell)" }),
  ),
  anchor: Type.Optional(
    Type.String({ description: "Chart placement (top-left cell)" }),
  ),
  rows: Type.Optional(Type.Array(Type.Object({ field: Type.String() }))),
  columns: Type.Optional(Type.Array(Type.Object({ field: Type.String() }))),
  values: Type.Optional(Type.Array(PivotFieldSchema)),
  title: Type.Optional(Type.String()),
  chartType: Type.Optional(
    Type.Union([
      Type.Literal("columnClustered"),
      Type.Literal("barClustered"),
      Type.Literal("line"),
      Type.Literal("pie"),
      Type.Literal("scatter"),
      Type.Literal("area"),
      Type.Literal("doughnut"),
    ]),
  ),
});

export const modifyObjectTool = defineTool({
  name: "modify_object",
  label: "Modify Object",
  description:
    "Create, update, or delete charts and pivot tables. " +
    "For charts, specify chartType, source, and anchor. " +
    "For pivot tables, specify source, range, rows, columns, and values.",
  parameters: Type.Object({
    operation: Type.Union(
      [Type.Literal("create"), Type.Literal("update"), Type.Literal("delete")],
      {
        description: "Operation to perform",
      },
    ),
    sheetId: Type.Number({ description: "The worksheet ID (1-based index)" }),
    objectType: Type.Union(
      [Type.Literal("pivotTable"), Type.Literal("chart")],
      { description: "Type of object" },
    ),
    id: Type.Optional(
      Type.String({ description: "Object ID (required for update/delete)" }),
    ),
    properties: Type.Optional(PropertiesSchema),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  dirtyTracking: {
    getRanges: (p) => [
      {
        sheetId: p.sheetId,
        range: p.properties?.range || p.properties?.anchor || "*",
      },
    ],
  },
  execute: async (_toolCallId, params) => {
    try {
      const result = await modifyObject({
        operation: params.operation,
        sheetId: params.sheetId,
        objectType: params.objectType,
        id: params.id,
        properties: params.properties,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error modifying object";
      return toolError(message);
    }
  },
});
