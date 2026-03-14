import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Word */

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function extractFromPackage(ooxmlPackage: string): {
  paragraphXml: string;
  styleXml: string | null;
  numberingXml: string | null;
} {
  const doc = new DOMParser().parseFromString(ooxmlPackage, "text/xml");

  // --- Extract all <w:p> descendants from <w:body> ---
  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  const paragraphs: string[] = [];
  if (body) {
    for (const paragraph of Array.from(
      body.getElementsByTagNameNS(W_NS, "p"),
    )) {
      cleanElement(paragraph);
      paragraphs.push(new XMLSerializer().serializeToString(paragraph));
    }
  }
  const paragraphXml = paragraphs.join("\n");

  // --- Collect referenced style IDs from <w:pStyle> and <w:rStyle> ---
  const styleIds = new Set<string>();
  for (const tag of ["pStyle", "rStyle"]) {
    for (const el of Array.from(
      body?.getElementsByTagNameNS(W_NS, tag) ?? [],
    )) {
      const val = el.getAttributeNS(W_NS, "val");
      if (val) styleIds.add(val);
    }
  }

  // --- Extract referenced styles + their basedOn chain + docDefaults ---
  let styleXml: string | null = null;
  const stylesRoot = doc.getElementsByTagNameNS(W_NS, "styles")[0];
  if (stylesRoot && styleIds.size > 0) {
    const allStyleEls = Array.from(
      stylesRoot.getElementsByTagNameNS(W_NS, "style"),
    );
    const styleMap = new Map<string, Element>();
    for (const el of allStyleEls) {
      const id = el.getAttributeNS(W_NS, "styleId");
      if (id) styleMap.set(id, el);
    }

    // Chase basedOn references (one level)
    const toInclude = new Set(styleIds);
    for (const id of styleIds) {
      const el = styleMap.get(id);
      if (!el) continue;
      const basedOn = el.getElementsByTagNameNS(W_NS, "basedOn")[0];
      if (basedOn) {
        const base = basedOn.getAttributeNS(W_NS, "val");
        if (base) toInclude.add(base);
      }
    }

    const parts: string[] = [];

    // Include docDefaults (default font/size)
    const docDefaults = stylesRoot.getElementsByTagNameNS(
      W_NS,
      "docDefaults",
    )[0];
    if (docDefaults) {
      parts.push(new XMLSerializer().serializeToString(docDefaults));
    }

    for (const id of toInclude) {
      const el = styleMap.get(id);
      if (el) {
        cleanElement(el);
        parts.push(new XMLSerializer().serializeToString(el));
      }
    }

    if (parts.length > 0) styleXml = parts.join("\n");
  }

  // --- Extract referenced numbering definitions ---
  let numberingXml: string | null = null;
  const numIds = new Set<string>();
  for (const el of Array.from(
    body?.getElementsByTagNameNS(W_NS, "numId") ?? [],
  )) {
    const val = el.getAttributeNS(W_NS, "val");
    if (val && val !== "0") numIds.add(val);
  }

  if (numIds.size > 0) {
    const numberingRoot = doc.getElementsByTagNameNS(W_NS, "numbering")[0];
    if (numberingRoot) {
      const numEls = Array.from(
        numberingRoot.getElementsByTagNameNS(W_NS, "num"),
      );
      const abstractNumEls = Array.from(
        numberingRoot.getElementsByTagNameNS(W_NS, "abstractNum"),
      );

      const parts: string[] = [];
      const abstractIds = new Set<string>();

      for (const numEl of numEls) {
        const id = numEl.getAttributeNS(W_NS, "numId");
        if (!id || !numIds.has(id)) continue;
        parts.push(new XMLSerializer().serializeToString(numEl));
        const absRef = numEl.getElementsByTagNameNS(W_NS, "abstractNumId")[0];
        if (absRef) {
          const absId = absRef.getAttributeNS(W_NS, "val");
          if (absId) abstractIds.add(absId);
        }
      }

      for (const absEl of abstractNumEls) {
        const id = absEl.getAttributeNS(W_NS, "abstractNumId");
        if (!id || !abstractIds.has(id)) continue;
        parts.unshift(new XMLSerializer().serializeToString(absEl));
      }

      if (parts.length > 0) numberingXml = parts.join("\n");
    }
  }

  return { paragraphXml, styleXml, numberingXml };
}

/** Strip noise attributes from an element tree */
function cleanElement(el: Element) {
  const NOISE_ATTRS = [
    "rsidR",
    "rsidRDefault",
    "rsidRPr",
    "rsidP",
    "rsidDel",
    "rsidSect",
    "rsidTr",
  ];
  const W14_NS = "http://schemas.microsoft.com/office/word/2010/wordml";

  // Clean self
  for (const attr of NOISE_ATTRS) {
    el.removeAttributeNS(W_NS, attr);
    // Some rsid attrs are unprefixed
    el.removeAttribute(`w:${attr}`);
  }
  // Remove w14:paraId, w14:textId
  el.removeAttributeNS(W14_NS, "paraId");
  el.removeAttributeNS(W14_NS, "textId");

  // Recurse into children
  for (const child of Array.from(el.children)) {
    cleanElement(child);
  }
}

export const getParagraphOoxmlTool = defineTool({
  name: "get_paragraph_ooxml",
  label: "Get Paragraph OOXML",
  description:
    "Read the OOXML of one or more paragraphs by 0-based index. " +
    "Returns the <w:p> XML with relevant style and numbering definitions (not the full package). " +
    "Use this to inspect formatting before editing with execute_office_js insertOoxml(). " +
    "Always read before writing OOXML.",
  parameters: Type.Object({
    paragraphIndex: Type.Number({
      description: "0-based paragraph index (start of range)",
    }),
    endParagraphIndex: Type.Optional(
      Type.Number({
        description:
          "0-based end paragraph index (inclusive). If omitted, only the single paragraph is returned.",
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await Word.run(async (context) => {
        const paragraphs = context.document.body.paragraphs;
        paragraphs.load("items");
        await context.sync();

        const maxIdx = paragraphs.items.length - 1;
        const startIdx = params.paragraphIndex;
        const endIdx = params.endParagraphIndex ?? startIdx;

        if (startIdx < 0 || startIdx > maxIdx) {
          throw new Error(
            `Paragraph index ${startIdx} out of range (0-${maxIdx})`,
          );
        }
        if (endIdx < startIdx || endIdx > maxIdx) {
          throw new Error(
            `End paragraph index ${endIdx} out of range (${startIdx}-${maxIdx})`,
          );
        }

        const startPara = paragraphs.items[startIdx];
        const endPara = paragraphs.items[endIdx];
        const range = startPara
          .getRange("Start")
          .expandTo(endPara.getRange("End"));
        const ooxml = range.getOoxml();
        await context.sync();

        const extracted = extractFromPackage(ooxml.value);

        const parts: string[] = [];
        if (extracted.styleXml) {
          parts.push(`<!-- Referenced styles -->\n${extracted.styleXml}`);
        }
        if (extracted.numberingXml) {
          parts.push(
            `<!-- Numbering definitions -->\n${extracted.numberingXml}`,
          );
        }
        parts.push(
          `<!-- Paragraph${startIdx !== endIdx ? `s ${startIdx}-${endIdx}` : ` ${startIdx}`} -->\n${extracted.paragraphXml}`,
        );

        return {
          paragraphIndex: startIdx,
          endParagraphIndex: endIdx !== startIdx ? endIdx : undefined,
          xml: parts.join("\n\n"),
        };
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
