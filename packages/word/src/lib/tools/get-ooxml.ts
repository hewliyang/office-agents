import type { AgentContext } from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Word */

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const W14_NS = "http://schemas.microsoft.com/office/word/2010/wordml";

const NOISE_ATTRS = [
  "rsidR",
  "rsidRDefault",
  "rsidRPr",
  "rsidP",
  "rsidDel",
  "rsidSect",
  "rsidTr",
];

function cleanElement(el: Element): void {
  for (const attr of NOISE_ATTRS) {
    el.removeAttributeNS(W_NS, attr);
    el.removeAttribute(`w:${attr}`);
  }
  el.removeAttributeNS(W14_NS, "paraId");
  el.removeAttributeNS(W14_NS, "textId");
  for (const child of Array.from(el.children)) {
    cleanElement(child);
  }
}

function getTextContent(el: Element): string {
  const texts = el.getElementsByTagNameNS(W_NS, "t");
  let text = "";
  for (const t of Array.from(texts)) {
    text += t.textContent ?? "";
  }
  return text;
}

function prettyPrintXml(xmlStr: string): string {
  const formatted = xmlStr.replace(/></g, ">\n<");
  const lines = formatted.split("\n");
  let depth = 0;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isClosing = trimmed.startsWith("</");
    const isSelfClosing = trimmed.endsWith("/>");
    const isOpening = trimmed.startsWith("<") && !isClosing && !isSelfClosing;

    if (isClosing) depth = Math.max(0, depth - 1);
    result.push("  ".repeat(depth) + trimmed);
    if (isOpening) depth++;
  }

  return result.join("\n");
}

interface ChildSummary {
  index: number;
  type: string;
  line: number;
  paragraphIndex?: number;
  tableIndex?: number;
  paragraphRange?: [number, number];
  rows?: number;
  cols?: number;
  text?: string;
}

function extractBodyContent(ooxmlPackage: string): {
  xml: string;
  children: ChildSummary[];
  styleXml: string | null;
  numberingXml: string | null;
} {
  const doc = new DOMParser().parseFromString(ooxmlPackage, "text/xml");
  const body = doc.getElementsByTagNameNS(W_NS, "body")[0];
  if (!body) {
    return { xml: "", children: [], styleXml: null, numberingXml: null };
  }

  // Collect referenced style IDs from the body
  const styleIds = new Set<string>();
  for (const tag of ["pStyle", "rStyle", "tblStyle"]) {
    for (const el of Array.from(body.getElementsByTagNameNS(W_NS, tag) ?? [])) {
      const val = el.getAttributeNS(W_NS, "val");
      if (val) styleIds.add(val);
    }
  }

  // Extract referenced styles + basedOn chain + docDefaults
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

  // Extract referenced numbering definitions
  let numberingXml: string | null = null;
  const numIds = new Set<string>();
  for (const el of Array.from(
    body.getElementsByTagNameNS(W_NS, "numId") ?? [],
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

  // Build pretty-printed body XML with structural comments
  const outputParts: string[] = [];
  const children: ChildSummary[] = [];
  let lineOffset = 1; // 1-indexed for `read` tool
  let paraOffset = 0;
  let tableIdx = 0;
  let childIdx = 0;

  for (const child of Array.from(body.childNodes)) {
    if (child.nodeType !== 1) continue;
    const el = child as Element;
    const tag = el.localName;
    cleanElement(el);

    // Build comment label
    let label = tag;
    const summary: ChildSummary = {
      index: childIdx,
      type: tag,
      line: lineOffset,
    };

    if (tag === "tbl") {
      const rows = el.getElementsByTagNameNS(W_NS, "tr");
      const firstRow = rows[0];
      const cols = firstRow
        ? firstRow.getElementsByTagNameNS(W_NS, "tc").length
        : 0;
      const pCount = el.getElementsByTagNameNS(W_NS, "p").length;
      label = `table (${rows.length} rows x ${cols} cols)`;
      summary.tableIndex = tableIdx;
      summary.rows = rows.length;
      summary.cols = cols;
      summary.paragraphRange = [paraOffset, paraOffset + pCount - 1];
      tableIdx++;
      paraOffset += pCount;
    } else if (tag === "p") {
      const text = getTextContent(el);
      summary.paragraphIndex = paraOffset;
      if (text) {
        const truncated = text.substring(0, 80);
        label = `paragraph: ${JSON.stringify(truncated)}`;
        summary.text = truncated;
      } else {
        label = "paragraph (empty)";
      }
      paraOffset++;
    } else if (tag === "sdt") {
      const title =
        el
          .getElementsByTagNameNS(W_NS, "sdtPr")[0]
          ?.getElementsByTagNameNS(W_NS, "alias")[0]
          ?.getAttributeNS(W_NS, "val") ?? "";
      const pCount = el.getElementsByTagNameNS(W_NS, "p").length;
      label = `sdt${title ? `: ${title}` : ""}`;
      summary.paragraphRange = [paraOffset, paraOffset + pCount - 1];
      paraOffset += pCount;
    } else if (tag === "sectPr") {
      label = "sectPr";
    }

    children.push(summary);

    const rawXml = new XMLSerializer().serializeToString(el);
    const pretty = prettyPrintXml(rawXml);
    const commentLine = `<!-- Body child ${childIdx}: ${label} -->`;
    const block = `${commentLine}\n${pretty}`;
    const blockLines = block.split("\n").length;

    outputParts.push(block);
    lineOffset += blockLines + 1; // +1 for blank line between blocks
    childIdx++;
  }

  return {
    xml: outputParts.join("\n\n"),
    children,
    styleXml,
    numberingXml,
  };
}

export function createGetOoxmlTool(ctx: AgentContext) {
  return defineTool({
    name: "get_ooxml",
    label: "Get OOXML",
    description:
      "Extract the document's OOXML structure and write it to a VFS file for inspection. " +
      "Returns a summary with body-child indices, types, line numbers, and Office.js collection mappings " +
      "(paragraphIndex, tableIndex). The full XML is written to a file — use `read` with offset/limit " +
      "or `bash` with grep to inspect specific parts. " +
      "Optionally scope to a range of body children (use the summary to pick indices). " +
      "Body children are the direct elements of <w:body>: paragraphs (<w:p>), tables (<w:tbl>), " +
      "content controls (<w:sdt>), and section properties (<w:sectPr>).",
    parameters: Type.Object({
      startChild: Type.Optional(
        Type.Number({
          description:
            "0-based body-child index to start from. If omitted, starts from the beginning.",
        }),
      ),
      endChild: Type.Optional(
        Type.Number({
          description:
            "0-based body-child index to end at (inclusive). If omitted, goes to the end.",
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

          const totalParagraphs = paragraphs.items.length;
          if (totalParagraphs === 0) {
            return { error: "Document is empty" };
          }

          // Get full body OOXML
          const startPara = paragraphs.items[0];
          const endPara = paragraphs.items[totalParagraphs - 1];
          const range = startPara
            .getRange("Start")
            .expandTo(endPara.getRange("End"));
          const ooxml = range.getOoxml();
          await context.sync();

          return { ooxmlValue: ooxml.value };
        });

        if ("error" in result) {
          return toolError(result.error as string);
        }

        const extracted = extractBodyContent(result.ooxmlValue as string);

        // Apply child range filtering if specified
        let filteredXml = extracted.xml;
        let filteredChildren = extracted.children;

        if (params.startChild !== undefined || params.endChild !== undefined) {
          // Re-extract with filtering: parse the body again and only include
          // the requested range of children
          const doc = new DOMParser().parseFromString(
            result.ooxmlValue as string,
            "text/xml",
          );
          const body = doc.getElementsByTagNameNS(W_NS, "body")[0];

          if (body) {
            const allElements: Element[] = [];
            for (const child of Array.from(body.childNodes)) {
              if (child.nodeType === 1) allElements.push(child as Element);
            }

            const start = params.startChild ?? 0;
            const end = params.endChild ?? allElements.length - 1;

            if (start < 0 || start >= allElements.length) {
              return toolError(
                `startChild ${start} out of range (0-${allElements.length - 1})`,
              );
            }
            if (end < start || end >= allElements.length) {
              return toolError(
                `endChild ${end} out of range (${start}-${allElements.length - 1})`,
              );
            }

            // Rebuild with just the requested children
            const outputParts: string[] = [];
            const children: ChildSummary[] = [];
            let lineOffset = 1;
            let paraOffset = 0;
            let tableIdx = 0;

            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i];
              const tag = el.localName;
              cleanElement(el);

              // Count paragraphs/tables for offset tracking
              const pCount =
                tag === "p" ? 1 : el.getElementsByTagNameNS(W_NS, "p").length;

              if (i >= start && i <= end) {
                let label = tag;
                const summary: ChildSummary = {
                  index: i,
                  type: tag,
                  line: lineOffset,
                };

                if (tag === "tbl") {
                  const rows = el.getElementsByTagNameNS(W_NS, "tr");
                  const firstRow = rows[0];
                  const cols = firstRow
                    ? firstRow.getElementsByTagNameNS(W_NS, "tc").length
                    : 0;
                  label = `table (${rows.length} rows x ${cols} cols)`;
                  summary.tableIndex = tableIdx;
                  summary.rows = rows.length;
                  summary.cols = cols;
                  summary.paragraphRange = [
                    paraOffset,
                    paraOffset + pCount - 1,
                  ];
                } else if (tag === "p") {
                  const text = getTextContent(el);
                  summary.paragraphIndex = paraOffset;
                  if (text) {
                    const truncated = text.substring(0, 80);
                    label = `paragraph: ${JSON.stringify(truncated)}`;
                    summary.text = truncated;
                  } else {
                    label = "paragraph (empty)";
                  }
                } else if (tag === "sdt") {
                  const title =
                    el
                      .getElementsByTagNameNS(W_NS, "sdtPr")[0]
                      ?.getElementsByTagNameNS(W_NS, "alias")[0]
                      ?.getAttributeNS(W_NS, "val") ?? "";
                  label = `sdt${title ? `: ${title}` : ""}`;
                  summary.paragraphRange = [
                    paraOffset,
                    paraOffset + pCount - 1,
                  ];
                } else if (tag === "sectPr") {
                  label = "sectPr";
                }

                children.push(summary);
                const rawXml = new XMLSerializer().serializeToString(el);
                const pretty = prettyPrintXml(rawXml);
                const commentLine = `<!-- Body child ${i}: ${label} -->`;
                const block = `${commentLine}\n${pretty}`;
                const blockLines = block.split("\n").length;
                outputParts.push(block);
                lineOffset += blockLines + 1;
              }

              // Always advance counters
              if (tag === "tbl") tableIdx++;
              paraOffset += pCount;
            }

            filteredXml = outputParts.join("\n\n");
            filteredChildren = children;
          }
        }

        // Build the file content with styles/numbering header
        const fileParts: string[] = [];
        if (extracted.styleXml) {
          fileParts.push(
            `<!-- Referenced styles -->\n${prettyPrintXml(extracted.styleXml)}`,
          );
        }
        if (extracted.numberingXml) {
          fileParts.push(
            `<!-- Numbering definitions -->\n${prettyPrintXml(extracted.numberingXml)}`,
          );
        }
        fileParts.push(filteredXml);
        const fileContent = fileParts.join("\n\n");

        // Recalculate line offsets if styles/numbering were prepended
        if (extracted.styleXml || extracted.numberingXml) {
          const headerLines =
            fileContent.split("\n").length - filteredXml.split("\n").length;
          for (const child of filteredChildren) {
            child.line += headerLines;
          }
        }

        // Write to VFS
        const rangeLabel =
          params.startChild !== undefined || params.endChild !== undefined
            ? `-${params.startChild ?? 0}-${params.endChild ?? "end"}`
            : "";
        const filePath = `/home/user/ooxml/body${rangeLabel}.xml`;
        await ctx.writeFile(filePath, fileContent);

        const lines = fileContent.split("\n").length;
        const sizeKB = Math.round(fileContent.length / 1024);

        return toolSuccess({
          file: filePath,
          size: `${sizeKB}KB`,
          lines,
          children: filteredChildren,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get OOXML";
        return toolError(message);
      }
    },
  });
}
