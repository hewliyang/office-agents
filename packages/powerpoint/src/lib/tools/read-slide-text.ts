import { Type } from "@sinclair/typebox";
import { safeRun, withSlideZip } from "../pptx/slide-zip";
import { findShapeById } from "../pptx/xml-utils";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";

export const readSlideTextTool = defineTool({
  name: "read_slide_text",
  label: "Read Slide Text",
  description:
    "Read the raw OOXML paragraph XML from a shape's text body. " +
    "Returns the <a:p> elements as a string. Use this to inspect existing text content, " +
    "formatting, bullets, and styles before editing with edit_slide_text.",
  parameters: Type.Object({
    slide_index: Type.Number({
      description:
        "0-based slide index (user's slide 1 = index 0, slide 3 = index 2)",
    }),
    shape_id: Type.String({
      description:
        'Shape ID from list_slide_shapes or verify_slides output (e.g., "2", "20"). Stable and locale-independent.',
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief description (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await safeRun(async (context) =>
        withSlideZip(context, params.slide_index, async ({ zip }) => {
          const slideFile = zip.file("ppt/slides/slide1.xml");
          if (!slideFile) throw new Error("Slide XML not found in archive");

          const xml = await slideFile.async("string");
          const doc = new DOMParser().parseFromString(xml, "text/xml");

          const shape = findShapeById(doc, params.shape_id);
          if (!shape) {
            throw new Error(
              `Shape with id "${params.shape_id}" not found on slide ${params.slide_index + 1}. Use list_slide_shapes to discover valid shape IDs.`,
            );
          }

          const txBody = shape.getElementsByTagNameNS(NS_P, "txBody")[0];
          if (!txBody) {
            return "(empty — shape has no text body)";
          }

          const serializer = new XMLSerializer();
          const paragraphs: string[] = [];
          for (let i = 0; i < txBody.childNodes.length; i++) {
            const node = txBody.childNodes[i] as Element;
            if (
              node.nodeType === 1 &&
              node.localName === "p" &&
              node.namespaceURI === NS_A
            ) {
              paragraphs.push(serializer.serializeToString(node));
            }
          }

          return paragraphs.length === 0
            ? "(empty — shape has a text body but no paragraph content)"
            : paragraphs.join("\n");
        }),
      );

      return toolSuccess({ success: true, result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read slide text";
      return toolError(message);
    }
  },
});
