import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Word */

export const getDocumentTextTool = defineTool({
  name: "get_document_text",
  label: "Get Document Text",
  description:
    "Read document text with paragraph indices, styles, and list info. " +
    "Returns paragraphs with their 0-based index, text, style name, and list level. " +
    "Use startParagraph/endParagraph to read a specific range.",
  parameters: Type.Object({
    startParagraph: Type.Optional(
      Type.Number({
        description: "0-based start paragraph index (default: 0)",
      }),
    ),
    endParagraph: Type.Optional(
      Type.Number({
        description:
          "0-based end paragraph index, exclusive (default: all paragraphs)",
      }),
    ),
    includeFormatting: Type.Optional(
      Type.Boolean({
        description: "Include style names and list info (default: true)",
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await Word.run(async (context) => {
        const body = context.document.body;
        const paragraphs = body.paragraphs;
        paragraphs.load("items");
        await context.sync();

        const start = params.startParagraph ?? 0;
        const end = Math.min(
          params.endParagraph ?? paragraphs.items.length,
          paragraphs.items.length,
        );
        const includeFormatting = params.includeFormatting !== false;

        const slice = paragraphs.items.slice(start, end);
        for (const p of slice) {
          if (includeFormatting) {
            p.load("text,style,alignment,outlineLevel,firstLineIndent");
            try {
              p.listItemOrNullObject.load("level,listString");
            } catch {
              // listItemOrNullObject may not be available
            }
          } else {
            p.load("text");
          }
        }
        await context.sync();

        const results: Array<Record<string, unknown>> = [];
        for (let i = 0; i < slice.length; i++) {
          const p = slice[i];
          const entry: Record<string, unknown> = {
            index: start + i,
            text: p.text,
          };
          if (includeFormatting) {
            entry.style = p.style;
            entry.alignment = p.alignment;
            try {
              const listItem = p.listItemOrNullObject;
              if (!listItem.isNullObject) {
                entry.listLevel = listItem.level;
                entry.listString = listItem.listString;
              }
            } catch {
              // ignore
            }
          }
          results.push(entry);
        }

        return {
          totalParagraphs: paragraphs.items.length,
          showing: { start, end },
          paragraphs: results,
        };
      });

      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read document text";
      return toolError(message);
    }
  },
});
