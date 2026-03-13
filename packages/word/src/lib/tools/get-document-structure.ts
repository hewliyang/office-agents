import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Word */

export const getDocumentStructureTool = defineTool({
  name: "get_document_structure",
  label: "Get Document Structure",
  description:
    "Get a structural overview of the document: heading outline, table locations, " +
    "content control locations, section count, and paragraph count. " +
    "Use this to understand document layout before making edits.",
  parameters: Type.Object({}),
  execute: async (_toolCallId, _params) => {
    try {
      const result = await Word.run(async (context) => {
        const body = context.document.body;
        const paragraphs = body.paragraphs;
        const tables = body.tables;
        const contentControls = body.contentControls;
        const sections = context.document.sections;

        paragraphs.load("items");
        tables.load("items");
        contentControls.load("items");
        sections.load("items");
        await context.sync();

        // Load paragraph details for headings
        for (const p of paragraphs.items) {
          p.load("text,style,outlineLevel");
        }
        // Load table details
        for (const t of tables.items) {
          t.load("style");
          t.rows.load("items");
        }
        // Load content control details
        for (const cc of contentControls.items) {
          cc.load("title,tag,type,id");
        }
        await context.sync();

        const headings: Array<{
          text: string;
          level: number;
          paragraphIndex: number;
        }> = [];
        for (let i = 0; i < paragraphs.items.length; i++) {
          const p = paragraphs.items[i];
          const level = p.outlineLevel;
          if (level >= 1 && level <= 9) {
            headings.push({
              text: p.text.substring(0, 120),
              level,
              paragraphIndex: i,
            });
          }
        }

        const tableInfo = tables.items.map((t, i) => ({
          index: i,
          rows: t.rows.items.length,
          style: t.style,
        }));

        const ccInfo = contentControls.items.map((cc) => ({
          id: cc.id,
          title: cc.title,
          tag: cc.tag,
          type: cc.type,
        }));

        return {
          paragraphCount: paragraphs.items.length,
          sectionCount: sections.items.length,
          tableCount: tables.items.length,
          contentControlCount: contentControls.items.length,
          headings,
          tables: tableInfo,
          contentControls: ccInfo,
        };
      });

      return toolSuccess(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to get document structure";
      return toolError(message);
    }
  },
});
