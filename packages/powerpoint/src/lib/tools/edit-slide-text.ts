import { Type } from "@sinclair/typebox";
import { safeRun, withSlideZip } from "../pptx/slide-zip";
import { findShapeById, sanitizeXmlAmpersands } from "../pptx/xml-utils";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_R =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export const editSlideTextTool = defineTool({
  name: "edit_slide_text",
  label: "Edit Slide Text",
  description:
    "Replace the paragraph content of a shape with raw OOXML <a:p> XML. " +
    "The tool preserves the shape's <a:bodyPr> and <a:lstStyle>. " +
    "You only provide the <a:p> elements.",
  parameters: Type.Object({
    slide_index: Type.Number({
      description:
        "0-based slide index (user's slide 1 = index 0, slide 3 = index 2)",
    }),
    shape_id: Type.String({
      description:
        'Shape ID from list_slide_shapes or verify_slides output (e.g., "2", "20"). Stable and locale-independent.',
    }),
    code: Type.String({
      description: "Raw OOXML <a:p> paragraph XML to replace the shape's text",
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
      await safeRun(async (context) => {
        await withSlideZip(
          context,
          params.slide_index,
          async ({ zip, markDirty }) => {
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

            let txBody = shape.getElementsByTagNameNS(NS_P, "txBody")[0];

            if (txBody) {
              const bodyPr = txBody.getElementsByTagNameNS(NS_A, "bodyPr")[0];
              const lstStyle = txBody.getElementsByTagNameNS(
                NS_A,
                "lstStyle",
              )[0];

              while (txBody.firstChild) txBody.removeChild(txBody.firstChild);
              if (bodyPr) txBody.appendChild(bodyPr);
              if (lstStyle) txBody.appendChild(lstStyle);
            } else {
              txBody = doc.createElementNS(NS_P, "p:txBody");
              const bodyPr = doc.createElementNS(NS_A, "a:bodyPr");
              const lstStyle = doc.createElementNS(NS_A, "a:lstStyle");
              txBody.appendChild(bodyPr);
              txBody.appendChild(lstStyle);
              shape.appendChild(txBody);
            }

            const sanitizedXml = sanitizeXmlAmpersands(params.code);
            const wrapperXml = `<wrapper xmlns:a="${NS_A}" xmlns:r="${NS_R}">${sanitizedXml}</wrapper>`;
            const parsedDoc = new DOMParser().parseFromString(
              wrapperXml,
              "text/xml",
            );

            const parseError = parsedDoc.getElementsByTagName("parsererror")[0];
            if (parseError) {
              throw new Error(`Invalid XML: ${parseError.textContent}`);
            }

            const wrapper = parsedDoc.documentElement;
            let paragraphCount = 0;

            for (let i = 0; i < wrapper.childNodes.length; i++) {
              const child = wrapper.childNodes[i];
              if (child.nodeType === 1) {
                const el = child as Element;
                if (el.localName !== "p" || el.namespaceURI !== NS_A) {
                  throw new Error(
                    `Invalid element <${el.nodeName}> — only <a:p> elements are allowed`,
                  );
                }
                txBody.appendChild(doc.importNode(child, true));
                paragraphCount++;
              }
            }

            if (paragraphCount === 0) {
              throw new Error(
                "xml must contain at least one <a:p> paragraph element",
              );
            }

            zip.file(
              "ppt/slides/slide1.xml",
              new XMLSerializer().serializeToString(doc),
            );
            markDirty();
          },
        );
      });

      return toolSuccess({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit slide text";
      return toolError(message);
    }
  },
  modifiedSlide: (params) => params.slide_index,
});
