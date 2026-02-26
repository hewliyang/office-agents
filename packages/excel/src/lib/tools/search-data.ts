import { Type } from "@sinclair/typebox";
import { searchData } from "../excel/api";
import { defineTool, toolError, toolSuccess } from "./types";

const SearchOptionsSchema = Type.Optional(
  Type.Object({
    matchCase: Type.Optional(
      Type.Boolean({ description: "Case sensitive. Default: false" }),
    ),
    matchEntireCell: Type.Optional(
      Type.Boolean({
        description: "Match entire cell content. Default: false",
      }),
    ),
    matchFormulas: Type.Optional(
      Type.Boolean({ description: "Search in formulas. Default: false" }),
    ),
    useRegex: Type.Optional(
      Type.Boolean({ description: "Use regex pattern. Default: false" }),
    ),
    maxResults: Type.Optional(
      Type.Number({ description: "Max results. Default: 500" }),
    ),
  }),
);

export const searchDataTool = defineTool({
  name: "search_data",
  label: "Search Data",
  description:
    "Find text or values across the spreadsheet. " +
    "Returns matching cells with their addresses and values. " +
    "Supports regex and case-sensitive search.",
  parameters: Type.Object({
    searchTerm: Type.String({
      description: "The text or pattern to search for",
    }),
    sheetId: Type.Optional(
      Type.Number({ description: "Limit to specific sheet" }),
    ),
    range: Type.Optional(
      Type.String({ description: "Limit search scope, e.g. 'A1:Z100'" }),
    ),
    offset: Type.Optional(
      Type.Number({ description: "Pagination offset. Default: 0" }),
    ),
    options: SearchOptionsSchema,
    explanation: Type.Optional(
      Type.String({
        description:
          "Brief explanation of what you're searching (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await searchData(params.searchTerm, {
        sheetId: params.sheetId,
        range: params.range,
        offset: params.offset,
        ...params.options,
      });
      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error searching";
      return toolError(message);
    }
  },
});
