const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const BARE_AMPERSAND_RE =
  /&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[0-9a-fA-F]+;)/g;

export function sanitizeXmlAmpersands(xml: string): string {
  return xml.replace(BARE_AMPERSAND_RE, "&amp;");
}

export function findShapeByName(
  doc: Document,
  shapeName: string,
  occurrence = 0,
): Element | null {
  const shapes = doc.getElementsByTagNameNS(NS_P, "sp");
  let matchIndex = 0;

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const nvSpPr = shape.getElementsByTagNameNS(NS_P, "nvSpPr")[0];
    if (!nvSpPr) continue;

    const cNvPr = nvSpPr.getElementsByTagNameNS(NS_P, "cNvPr")[0];
    if (cNvPr?.getAttribute("name") === shapeName) {
      if (matchIndex === occurrence) return shape;
      matchIndex++;
    }
  }

  return null;
}

export function findShapeById(doc: Document, shapeId: string): Element | null {
  const shapes = doc.getElementsByTagNameNS(NS_P, "sp");

  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    const nvSpPr = shape.getElementsByTagNameNS(NS_P, "nvSpPr")[0];
    if (!nvSpPr) continue;

    const cNvPr = nvSpPr.getElementsByTagNameNS(NS_P, "cNvPr")[0];
    if (cNvPr?.getAttribute("id") === shapeId) return shape;
  }

  return null;
}

export async function extractExternalReferences(
  zip: import("jszip"),
): Promise<Set<string>> {
  const refs = new Set<string>();
  const relsFiles = Object.keys(zip.files).filter((f) => f.endsWith(".rels"));

  const EXTERNAL_REL_RE =
    /<Relationship[^>]*TargetMode\s*=\s*["']External["'][^>]*>/gi;
  const TARGET_RE = /Target\s*=\s*["']([^"']*)["']/i;

  for (const relsPath of relsFiles) {
    const content = await zip.file(relsPath)?.async("string");
    if (content) {
      for (const match of content.matchAll(EXTERNAL_REL_RE)) {
        const targetMatch = match[0].match(TARGET_RE);
        if (targetMatch?.[1]) {
          refs.add(targetMatch[1]);
        }
      }
    }
  }

  return refs;
}
