import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Word */

export const getParagraphOoxmlTool = defineTool({
  name: "get_paragraph_ooxml",
  label: "Get Paragraph OOXML",
  description:
    "Read the raw OOXML of a paragraph by its 0-based index. " +
    "Use this to inspect formatting before editing with execute_office_js insertOoxml(). " +
    "Always read before writing OOXML.",
  parameters: Type.Object({
    paragraphIndex: Type.Number({
      description: "0-based paragraph index",
    }),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await Word.run(async (context) => {
        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("items");
        await context.sync();

        if (
          params.paragraphIndex < 0 ||
          params.paragraphIndex >= paragraphs.items.length
        ) {
          throw new Error(
            `Paragraph index ${params.paragraphIndex} out of range (0-${paragraphs.items.length - 1})`,
          );
        }

        const paragraph = paragraphs.items[params.paragraphIndex];
        const ooxml = paragraph.getOoxml();
        await context.sync();

        return { paragraphIndex: params.paragraphIndex, ooxml: ooxml.value };
      });

      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get paragraph OOXML";
      return toolError(message);
    }
  },
});
