import {
  fetchWeb,
  loadSavedConfig,
  loadWebConfig,
  searchWeb,
} from "@office-agents/core";
import type { Command, CustomCommand } from "just-bash/browser";
import { defineCommand } from "just-bash/browser";
import { safeRun, withSlideZip } from "../pptx/slide-zip";

async function resolveVfsPath(
  ctx: { cwd: string; fs: { readFileBuffer(p: string): Promise<Uint8Array> } },
  filePath: string,
): Promise<{ path: string; data: Uint8Array }> {
  const resolved = filePath.startsWith("/")
    ? filePath
    : `${ctx.cwd}/${filePath}`;
  const data = await ctx.fs.readFileBuffer(resolved);
  return { path: resolved, data };
}

async function writeVfsOutput(
  ctx: {
    cwd: string;
    fs: {
      mkdir(p: string, o: { recursive: boolean }): Promise<void>;
      writeFile(p: string, c: string): Promise<void>;
    };
  },
  outFile: string,
  content: string,
): Promise<string> {
  const resolved = outFile.startsWith("/") ? outFile : `${ctx.cwd}/${outFile}`;
  const dir = resolved.substring(0, resolved.lastIndexOf("/"));
  if (dir && dir !== "/") {
    try {
      await ctx.fs.mkdir(dir, { recursive: true });
    } catch {
      // directory may already exist
    }
  }
  await ctx.fs.writeFile(resolved, content);
  return resolved;
}

const pdfToText: CustomCommand = {
  name: "pdf-to-text",
  load: async () =>
    defineCommand("pdf-to-text", async (args, ctx) => {
      if (args.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: pdf-to-text <file> <outfile>\n  file    - Path to PDF file in VFS\n  outfile - Output text file\n",
          exitCode: 1,
        };
      }

      const [filePath, outFile] = args;

      try {
        const { data } = await resolveVfsPath(ctx, filePath);
        await import("pdfjs-dist/build/pdf.worker.mjs");
        const pdfjsLib = await import("pdfjs-dist");

        const doc = await pdfjsLib.getDocument({
          data,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        }).promise;
        const pages: string[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const text = content.items
            .filter((item) => "str" in item)
            .map((item) => (item as { str: string }).str)
            .join(" ");
          if (text.trim()) pages.push(text);
        }

        const fullText = pages.join("\n\n");
        await writeVfsOutput(ctx, outFile, fullText);

        return {
          stdout: `Extracted text from ${doc.numPages} page(s) to ${outFile} (${fullText.length} chars)`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

const pdfToImages: CustomCommand = {
  name: "pdf-to-images",
  load: async () =>
    defineCommand("pdf-to-images", async (args, ctx) => {
      const positional = args.filter((a) => !a.startsWith("--"));
      const scaleArg = args.find((a) => a.startsWith("--scale="));
      const pagesArg = args.find((a) => a.startsWith("--pages="));

      if (positional.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: pdf-to-images <file> <outdir> [--scale=N] [--pages=1,3,5-8]\n  file    - Path to PDF file in VFS\n  outdir  - Output directory for PNG images\n  --scale - Render scale factor (default: 2)\n  --pages - Page selection (e.g. 1,3,5-8). Default: all\n",
          exitCode: 1,
        };
      }

      const [filePath, outDir] = positional;
      const scale = scaleArg ? Number.parseFloat(scaleArg.split("=")[1]) : 2;

      if (Number.isNaN(scale) || scale <= 0 || scale > 5) {
        return {
          stdout: "",
          stderr: "Scale must be between 0 and 5",
          exitCode: 1,
        };
      }

      try {
        const { data } = await resolveVfsPath(ctx, filePath);
        await import("pdfjs-dist/build/pdf.worker.mjs");
        const pdfjsLib = await import("pdfjs-dist");

        const doc = await pdfjsLib.getDocument({
          data,
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
        }).promise;

        const selectedPages = pagesArg
          ? parsePageRanges(pagesArg.split("=")[1], doc.numPages)
          : new Set(Array.from({ length: doc.numPages }, (_, i) => i + 1));

        if (selectedPages.size === 0) {
          return {
            stdout: "",
            stderr: "No valid pages in selection",
            exitCode: 1,
          };
        }

        const resolvedDir = outDir.startsWith("/")
          ? outDir
          : `${ctx.cwd}/${outDir}`;
        try {
          await ctx.fs.mkdir(resolvedDir, { recursive: true });
        } catch {
          // may exist
        }

        const outputs: string[] = [];
        const sortedPages = [...selectedPages].sort((a, b) => a - b);

        for (const pageNum of sortedPages) {
          const page = await doc.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const canvasCtx = canvas.getContext("2d");
          if (!canvasCtx) throw new Error("Failed to create canvas 2D context");

          await page.render({ canvasContext: canvasCtx, canvas, viewport })
            .promise;

          const pngData = await new Promise<Uint8Array>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error("Canvas toBlob failed"));
              blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
            }, "image/png");
          });

          const pagePath = `${resolvedDir}/page-${pageNum}.png`;
          await ctx.fs.writeFile(pagePath, pngData);
          outputs.push(
            `page-${pageNum}.png (${Math.round(pngData.length / 1024)}KB, ${canvas.width}×${canvas.height})`,
          );

          // Help GC
          canvas.width = 0;
          canvas.height = 0;
        }

        return {
          stdout: `Converted ${outputs.length} page(s) from ${doc.numPages} total to ${outDir}/:\n${outputs.map((o) => `  ${o}`).join("\n")}`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

function parsePageRanges(spec: string, maxPage: number): Set<number> {
  const pages = new Set<number>();
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    const rangeParts = trimmed.split("-");
    if (rangeParts.length === 2) {
      const start = Math.max(1, Number.parseInt(rangeParts[0], 10));
      const end = Math.min(maxPage, Number.parseInt(rangeParts[1], 10));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        for (let i = start; i <= end; i++) pages.add(i);
      }
    } else {
      const p = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(p) && p >= 1 && p <= maxPage) pages.add(p);
    }
  }
  return pages;
}

const docxToText: CustomCommand = {
  name: "docx-to-text",
  load: async () =>
    defineCommand("docx-to-text", async (args, ctx) => {
      if (args.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: docx-to-text <file> <outfile>\n  file    - Path to DOCX file in VFS\n  outfile - Output text file\n",
          exitCode: 1,
        };
      }

      const [filePath, outFile] = args;

      try {
        const { data } = await resolveVfsPath(ctx, filePath);
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({
          arrayBuffer: data.buffer as ArrayBuffer,
        });

        await writeVfsOutput(ctx, outFile, result.value);

        return {
          stdout: `Extracted text from DOCX to ${outFile} (${result.value.length} chars)`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

const xlsxToCsv: CustomCommand = {
  name: "xlsx-to-csv",
  load: async () =>
    defineCommand("xlsx-to-csv", async (args, ctx) => {
      if (args.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: xlsx-to-csv <file> <outfile> [sheet]\n  file    - Path to XLSX/XLS/ODS file in VFS\n  outfile - Output CSV file (for multiple sheets: <name>.<sheet>.csv)\n  sheet   - Sheet name or 0-based index (optional, exports all sheets if omitted)\n",
          exitCode: 1,
        };
      }

      const [filePath, outFile, sheetArg] = args;

      try {
        const { data } = await resolveVfsPath(ctx, filePath);
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(data, { type: "array" });

        if (sheetArg) {
          let sheetName: string;
          if (workbook.SheetNames.includes(sheetArg)) {
            sheetName = sheetArg;
          } else {
            const idx = Number.parseInt(sheetArg, 10);
            if (
              !Number.isNaN(idx) &&
              idx >= 0 &&
              idx < workbook.SheetNames.length
            ) {
              sheetName = workbook.SheetNames[idx];
            } else {
              return {
                stdout: "",
                stderr: `Sheet not found: ${sheetArg}. Available: ${workbook.SheetNames.join(", ")}`,
                exitCode: 1,
              };
            }
          }

          const sheet = workbook.Sheets[sheetName];
          if (!sheet) {
            return {
              stdout: "",
              stderr: `Sheet "${sheetName}" not found`,
              exitCode: 1,
            };
          }

          const csv = XLSX.utils.sheet_to_csv(sheet);
          await writeVfsOutput(ctx, outFile, csv);

          return {
            stdout: `Converted sheet "${sheetName}" → ${outFile}`,
            stderr: "",
            exitCode: 0,
          };
        }

        const names = workbook.SheetNames;

        if (names.length === 1) {
          const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[names[0]]);
          await writeVfsOutput(ctx, outFile, csv);
          return {
            stdout: `Converted sheet "${names[0]}" → ${outFile}`,
            stderr: "",
            exitCode: 0,
          };
        }

        const dotIdx = outFile.lastIndexOf(".");
        const base = dotIdx > 0 ? outFile.substring(0, dotIdx) : outFile;
        const ext = dotIdx > 0 ? outFile.substring(dotIdx) : ".csv";
        const outputs: string[] = [];

        for (const name of names) {
          const sheet = workbook.Sheets[name];
          if (!sheet) continue;
          const csv = XLSX.utils.sheet_to_csv(sheet);
          const safeName = name.replace(/[/\\?*[\]]/g, "_");
          const path = `${base}.${safeName}${ext}`;
          await writeVfsOutput(ctx, path, csv);
          outputs.push(`  "${name}" → ${path}`);
        }

        return {
          stdout: `Converted ${names.length} sheets:\n${outputs.join("\n")}`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

function getProxyUrl(): string | undefined {
  const config = loadSavedConfig();
  return config?.useProxy && config?.proxyUrl ? config.proxyUrl : undefined;
}

const webSearchCmd: Command = defineCommand("web-search", async (args) => {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (const arg of args) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      flags[match[1]] = match[2];
    } else if (arg === "--json") {
      flags.json = "true";
    } else {
      positional.push(arg);
    }
  }

  const query = positional.join(" ");
  if (!query) {
    return {
      stdout: "",
      stderr:
        "Usage: web-search <query> [--max=N] [--region=REGION] [--time=d|w|m|y] [--page=N] [--json]\n  query    - Search query\n  --max    - Max results (default: 10)\n  --region - Region code, e.g. us-en, uk-en (default: us-en)\n  --time   - Time filter: d(ay), w(eek), m(onth), y(ear)\n  --page   - Page number (default: 1)\n  --json   - Output as JSON\n",
      exitCode: 1,
    };
  }

  try {
    const webConfig = loadWebConfig();
    const results = await searchWeb(
      query,
      {
        maxResults: flags.max ? Number.parseInt(flags.max, 10) : 10,
        region: flags.region,
        timelimit: flags.time as "d" | "w" | "m" | "y" | undefined,
        page: flags.page ? Number.parseInt(flags.page, 10) : undefined,
      },
      {
        proxyUrl: getProxyUrl(),
        apiKeys: webConfig.apiKeys,
      },
      webConfig.searchProvider,
    );

    if (results.length === 0) {
      return { stdout: "No results found.", stderr: "", exitCode: 0 };
    }

    if (flags.json === "true") {
      return {
        stdout: JSON.stringify(results, null, 2),
        stderr: "",
        exitCode: 0,
      };
    }

    const lines = results.map(
      (r, i) => `${i + 1}. ${r.title}\n   ${r.href}\n   ${r.body}`,
    );
    return {
      stdout: lines.join("\n\n"),
      stderr: "",
      exitCode: 0,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { stdout: "", stderr: msg, exitCode: 1 };
  }
});

const webFetchCmd: Command = defineCommand("web-fetch", async (args, ctx) => {
  const url = args[0];
  const outFile = args[1];
  if (!url || !outFile) {
    return {
      stdout: "",
      stderr:
        "Usage: web-fetch <url> <outfile>\n  url      - URL to fetch\n  outfile  - Output file path\n\nFetches a URL and saves to a file.\n  - HTML pages: extracts readable content (Markdown)\n  - Binary files (PDF, DOCX, XLSX, etc.): downloads raw file\n  - Text/JSON/XML: saves as-is\n",
      exitCode: 1,
    };
  }

  try {
    const webConfig = loadWebConfig();
    const result = await fetchWeb(
      url,
      {
        proxyUrl: getProxyUrl(),
        apiKeys: webConfig.apiKeys,
      },
      webConfig.fetchProvider,
    );

    if (result.kind === "text") {
      const header = [
        result.title ? `Title: ${result.title}` : "",
        ...Object.entries(result.metadata || {}).map(([k, v]) => `${k}: ${v}`),
      ]
        .filter(Boolean)
        .join("\n");
      const output = header ? `${header}\n\n${result.text}` : result.text;

      await writeVfsOutput(ctx, outFile, output);
      return {
        stdout: `Fetched text → ${outFile} (${result.text.length} chars, ${result.contentType})`,
        stderr: "",
        exitCode: 0,
      };
    }

    const resolvedPath = outFile.startsWith("/")
      ? outFile
      : `${ctx.cwd}/${outFile}`;
    const dir = resolvedPath.substring(0, resolvedPath.lastIndexOf("/"));
    if (dir && dir !== "/") {
      try {
        await ctx.fs.mkdir(dir, { recursive: true });
      } catch {
        // directory may already exist
      }
    }
    await ctx.fs.writeFile(resolvedPath, result.data);

    const size =
      result.data.length >= 1024
        ? `${Math.round(result.data.length / 1024)}KB`
        : `${result.data.length}B`;

    return {
      stdout: `Downloaded → ${outFile} (${size}, ${result.contentType || "unknown type"})`,
      stderr: "",
      exitCode: 0,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { stdout: "", stderr: msg, exitCode: 1 };
  }
});

/* global PowerPoint, Office */

const NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main";
const NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main";
const NS_R =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_RELS = "http://schemas.openxmlformats.org/package/2006/relationships";
const IMAGE_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

const EMU_PER_INCH = 914400;
const EMU_PER_CM = 360000;

function parseUnit(value: number, unit: string): number {
  switch (unit) {
    case "in":
      return Math.round(value * EMU_PER_INCH);
    case "cm":
      return Math.round(value * EMU_PER_CM);
    case "emu":
      return Math.round(value);
    case "pt":
      return Math.round(value * 12700);
    default:
      return Math.round(value * EMU_PER_INCH);
  }
}

function detectMimeType(
  path: string,
  data: Uint8Array,
): { mime: string; ext: string } {
  if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  )
    return { mime: "image/png", ext: "png" };
  if (data[0] === 0xff && data[1] === 0xd8)
    return { mime: "image/jpeg", ext: "jpeg" };
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46)
    return { mime: "image/gif", ext: "gif" };
  if (data[0] === 0x42 && data[1] === 0x4d)
    return { mime: "image/bmp", ext: "bmp" };

  const fileExt = path.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, { mime: string; ext: string }> = {
    png: { mime: "image/png", ext: "png" },
    jpg: { mime: "image/jpeg", ext: "jpeg" },
    jpeg: { mime: "image/jpeg", ext: "jpeg" },
    gif: { mime: "image/gif", ext: "gif" },
    svg: { mime: "image/svg+xml", ext: "svg" },
    webp: { mime: "image/webp", ext: "webp" },
    bmp: { mime: "image/bmp", ext: "bmp" },
    tiff: { mime: "image/tiff", ext: "tiff" },
    tif: { mime: "image/tiff", ext: "tiff" },
  };
  return map[fileExt] || { mime: "image/png", ext: "png" };
}

const SVG_EXT_URI = "{96DAC541-7B7A-43D3-8B79-37D633B846F1}";
const NS_ASVG = "http://schemas.microsoft.com/office/drawing/2016/SVG/main";

async function rasterizeSvgToPng(
  svgData: Uint8Array,
  widthPx: number,
  heightPx: number,
): Promise<Uint8Array> {
  const svgText = new TextDecoder().decode(svgData);
  const blob = new Blob([svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas 2D context");
    ctx.drawImage(img, 0, 0, widthPx, heightPx);

    const pngData = await new Promise<Uint8Array>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) return reject(new Error("Canvas toBlob failed"));
        b.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    });

    canvas.width = 0;
    canvas.height = 0;
    return pngData;
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface InsertImageParams {
  slideIndex: number;
  data: Uint8Array;
  mime: string;
  ext: string;
  shapeName: string;
  offX: number;
  offY: number;
  cx: number;
  cy: number;
  mediaPrefix?: string;
}

async function insertImageIntoSlide(params: InsertImageParams): Promise<void> {
  const { slideIndex, data, ext, mime, shapeName, offX, offY, cx, cy } = params;
  const prefix = params.mediaPrefix || "vfs_image";
  const isSvg = ext === "svg";
  let pngFallback: Uint8Array | undefined;
  if (isSvg) {
    const DPI = 96;
    const pxW = Math.round((cx / EMU_PER_INCH) * DPI * 2);
    const pxH = Math.round((cy / EMU_PER_INCH) * DPI * 2);
    pngFallback = await rasterizeSvgToPng(data, pxW, pxH);
  }

  await safeRun(async (context) => {
    await withSlideZip(context, slideIndex, async ({ zip, markDirty }) => {
      const relsPath = "ppt/slides/_rels/slide1.xml.rels";
      const relsFile = zip.file(relsPath);
      let relsXml: string;
      if (relsFile) {
        relsXml = await relsFile.async("string");
      } else {
        relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${NS_RELS}"></Relationships>`;
      }

      const rIdMatches = [...relsXml.matchAll(/Id="rId(\d+)"/g)];
      let nextId =
        rIdMatches.reduce(
          (max, m) => Math.max(max, Number.parseInt(m[1], 10)),
          0,
        ) + 1;

      let blipRId: string;
      let svgRId: string | undefined;

      if (isSvg && pngFallback) {
        const pngPath = `ppt/media/${prefix}_fallback.png`;
        zip.file(pngPath, pngFallback);
        blipRId = `rId${nextId++}`;
        const pngRel = `<Relationship Id="${blipRId}" Type="${IMAGE_REL_TYPE}" Target="../media/${prefix}_fallback.png"/>`;
        relsXml = relsXml.replace(
          "</Relationships>",
          `${pngRel}</Relationships>`,
        );

        const svgPath = `ppt/media/${prefix}.svg`;
        zip.file(svgPath, data);
        svgRId = `rId${nextId++}`;
        const svgRel = `<Relationship Id="${svgRId}" Type="${IMAGE_REL_TYPE}" Target="../media/${prefix}.svg"/>`;
        relsXml = relsXml.replace(
          "</Relationships>",
          `${svgRel}</Relationships>`,
        );
      } else {
        const imagePath = `ppt/media/${prefix}.${ext}`;
        zip.file(imagePath, data);
        blipRId = `rId${nextId++}`;
        const rel = `<Relationship Id="${blipRId}" Type="${IMAGE_REL_TYPE}" Target="../media/${prefix}.${ext}"/>`;
        relsXml = relsXml.replace("</Relationships>", `${rel}</Relationships>`);
      }

      zip.file(relsPath, relsXml);

      const slideFile = zip.file("ppt/slides/slide1.xml");
      if (!slideFile) throw new Error("Slide XML not found in archive");

      const slideXml = await slideFile.async("string");
      const doc = new DOMParser().parseFromString(slideXml, "text/xml");

      const spTree = doc.getElementsByTagNameNS(NS_P, "spTree")[0];
      if (!spTree) throw new Error("Shape tree not found in slide XML");

      const existingIds = new Set<number>();
      const allEls = doc.getElementsByTagName("*");
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i];
        if (el.localName === "cNvPr") {
          const id = el.getAttribute("id");
          if (id) existingIds.add(Number.parseInt(id, 10));
        }
      }
      let shapeId = 1;
      while (existingIds.has(shapeId)) shapeId++;

      const escapedName = shapeName
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      let blipInner = "";
      if (isSvg && svgRId) {
        blipInner = `
      <a:extLst>
        <a:ext uri="${SVG_EXT_URI}">
          <asvg:svgBlip xmlns:asvg="${NS_ASVG}" r:embed="${svgRId}"/>
        </a:ext>
      </a:extLst>`;
      }

      const picXml = `<p:pic xmlns:p="${NS_P}" xmlns:a="${NS_A}" xmlns:r="${NS_R}">
  <p:nvPicPr>
    <p:cNvPr id="${shapeId}" name="${escapedName}"/>
    <p:cNvPicPr>
      <a:picLocks noChangeAspect="1"/>
    </p:cNvPicPr>
    <p:nvPr/>
  </p:nvPicPr>
  <p:blipFill>
    <a:blip r:embed="${blipRId}">${blipInner}
    </a:blip>
    <a:stretch>
      <a:fillRect/>
    </a:stretch>
  </p:blipFill>
  <p:spPr>
    <a:xfrm>
      <a:off x="${offX}" y="${offY}"/>
      <a:ext cx="${cx}" cy="${cy}"/>
    </a:xfrm>
    <a:prstGeom prst="rect">
      <a:avLst/>
    </a:prstGeom>
  </p:spPr>
</p:pic>`;

      const picDoc = new DOMParser().parseFromString(picXml, "text/xml");
      const parseError = picDoc.getElementsByTagName("parsererror")[0];
      if (parseError) {
        throw new Error(`Internal XML error: ${parseError.textContent}`);
      }

      spTree.appendChild(doc.importNode(picDoc.documentElement, true));

      zip.file(
        "ppt/slides/slide1.xml",
        new XMLSerializer().serializeToString(doc),
      );

      const ctFile = zip.file("[Content_Types].xml");
      if (ctFile) {
        let ctXml = await ctFile.async("string");
        const ensureExt = (e: string, contentType: string) => {
          if (!ctXml.includes(`Extension="${e}"`)) {
            const entry = `<Default Extension="${e}" ContentType="${contentType}"/>`;
            ctXml = ctXml.replace(/(<Types[^>]*>)/, `$1${entry}`);
          }
        };

        if (isSvg) {
          ensureExt("png", "image/png");
          ensureExt("svg", "image/svg+xml");
        } else {
          ensureExt(ext, mime);
        }
        zip.file("[Content_Types].xml", ctXml);
      }

      markDirty();
    });
  });
}

const insertImageCmd: CustomCommand = {
  name: "insert-image",
  load: async () =>
    defineCommand("insert-image", async (args, ctx) => {
      const flags: Record<string, string> = {};
      const positional: string[] = [];
      for (const arg of args) {
        const match = arg.match(/^--(\w+)=(.+)$/);
        if (match) {
          flags[match[1]] = match[2];
        } else {
          positional.push(arg);
        }
      }

      if (positional.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: insert-image <file> <slide> [--x=N] [--y=N] [--width=N] [--height=N] [--unit=in|cm|pt|emu] [--name=SHAPE_NAME]\n" +
            "  file    - Path to image file in VFS (PNG, JPEG, GIF, BMP, SVG, WEBP)\n" +
            "  slide   - 1-based slide number\n" +
            "  --x     - Horizontal position from left edge (default: 0)\n" +
            "  --y     - Vertical position from top edge (default: 0)\n" +
            "  --width - Image width (default: 5)\n" +
            "  --height- Image height (default: 3.75)\n" +
            "  --unit  - Unit: in (default), cm, pt, emu\n" +
            "  --name  - Shape name (default: image filename)\n",
          exitCode: 1,
        };
      }

      const [filePath, slideArg] = positional;
      const slideNum = Number.parseInt(slideArg, 10);
      if (Number.isNaN(slideNum) || slideNum < 1) {
        return {
          stdout: "",
          stderr: "Slide must be a positive number (1-based)",
          exitCode: 1,
        };
      }
      const slideIndex = slideNum - 1;

      const unit = flags.unit || "in";
      if (!["in", "cm", "pt", "emu"].includes(unit)) {
        return {
          stdout: "",
          stderr: "Unit must be one of: in, cm, pt, emu",
          exitCode: 1,
        };
      }

      const x = flags.x ? Number.parseFloat(flags.x) : 0;
      const y = flags.y ? Number.parseFloat(flags.y) : 0;
      const width = flags.width ? Number.parseFloat(flags.width) : 5;
      const height = flags.height ? Number.parseFloat(flags.height) : 3.75;

      if ([x, y, width, height].some((v) => Number.isNaN(v))) {
        return {
          stdout: "",
          stderr: "x, y, width, height must be valid numbers",
          exitCode: 1,
        };
      }

      try {
        const { data } = await resolveVfsPath(ctx, filePath);
        const { mime, ext } = detectMimeType(filePath, data);
        const fileName = filePath.split("/").pop() || "image";
        const shapeName = flags.name || fileName;

        await insertImageIntoSlide({
          slideIndex,
          data,
          mime,
          ext,
          shapeName,
          offX: parseUnit(x, unit),
          offY: parseUnit(y, unit),
          cx: parseUnit(width, unit),
          cy: parseUnit(height, unit),
        });

        return {
          stdout: `Inserted ${fileName} on slide ${slideNum} at (${x}, ${y}) size ${width}×${height} ${unit}`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

const ICONIFY_API = "https://api.iconify.design";

const searchIconsCmd: CustomCommand = {
  name: "search-icons",
  load: async () =>
    defineCommand("search-icons", async (args) => {
      const flags: Record<string, string> = {};
      const positional: string[] = [];
      for (const arg of args) {
        const match = arg.match(/^--(\w+)=(.+)$/);
        if (match) {
          flags[match[1]] = match[2];
        } else {
          positional.push(arg);
        }
      }

      const query = positional.join(" ");
      if (!query) {
        return {
          stdout: "",
          stderr:
            "Usage: search-icons <query> [--limit=N] [--prefix=ICON_SET] [--prefixes=SET1,SET2]\n" +
            "  query      - Search term (e.g. 'warning', 'chart', 'home')\n" +
            "  --limit    - Max results (default: 32, min: 32, max: 999)\n" +
            "  --prefix   - Limit to one icon set (e.g. 'mdi', 'fluent')\n" +
            "  --prefixes - Comma-separated icon set prefixes (e.g. 'mdi,fluent,tabler')\n",
          exitCode: 1,
        };
      }

      try {
        const limit = flags.limit
          ? Math.max(32, Math.min(999, Number.parseInt(flags.limit, 10)))
          : 32;
        const params = new URLSearchParams({
          query,
          limit: String(limit),
        });
        if (flags.prefix) params.set("prefix", flags.prefix);
        if (flags.prefixes) params.set("prefixes", flags.prefixes);

        const res = await fetch(`${ICONIFY_API}/search?${params}`);
        if (!res.ok) {
          throw new Error(`Iconify API error: ${res.status} ${res.statusText}`);
        }

        const data: {
          icons: string[];
          total: number;
          limit: number;
          start: number;
          collections: Record<
            string,
            {
              name: string;
              author?: { name: string };
              license?: { title: string };
              palette?: boolean;
            }
          >;
        } = await res.json();

        if (data.icons.length === 0) {
          return {
            stdout: "No icons found for that query.",
            stderr: "",
            exitCode: 0,
          };
        }

        const lines: string[] = [];
        lines.push(
          `Found ${data.total} icon(s) (showing ${data.icons.length}):\n`,
        );

        for (const iconId of data.icons) {
          const [prefix] = iconId.split(":");
          const col = data.collections[prefix];
          const setInfo = col ? ` [${col.name}]` : "";
          lines.push(`  ${iconId}${setInfo}`);
        }

        if (Object.keys(data.collections).length > 0) {
          lines.push("\nIcon sets in results:");
          for (const [prefix, info] of Object.entries(data.collections)) {
            const author = info.author ? ` by ${info.author.name}` : "";
            const license = info.license ? ` (${info.license.title})` : "";
            const palette = info.palette ? ", multi-color" : ", mono";
            lines.push(
              `  ${prefix}: ${info.name}${author}${license}${palette}`,
            );
          }
        }

        lines.push(
          "\nUse insert-icon to place an icon on a slide:",
          "  insert-icon <icon_id> <slide> [--x=N] [--y=N] [--width=N] [--height=N] [--color=#HEX]",
        );

        return { stdout: lines.join("\n"), stderr: "", exitCode: 0 };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

const insertIconCmd: CustomCommand = {
  name: "insert-icon",
  load: async () =>
    defineCommand("insert-icon", async (args) => {
      const flags: Record<string, string> = {};
      const positional: string[] = [];
      for (const arg of args) {
        const match = arg.match(/^--(\w+)=(.+)$/);
        if (match) {
          flags[match[1]] = match[2];
        } else {
          positional.push(arg);
        }
      }

      if (positional.length < 2) {
        return {
          stdout: "",
          stderr:
            "Usage: insert-icon <icon_id> <slide> [--x=N] [--y=N] [--width=N] [--height=N] [--unit=in|cm|pt|emu] [--color=#HEX] [--name=SHAPE_NAME]\n" +
            "  icon_id  - Icon ID from search-icons (e.g. 'mdi:alert', 'fluent:warning-24-filled')\n" +
            "  slide    - 1-based slide number\n" +
            "  --x      - Horizontal position from left edge (default: 0)\n" +
            "  --y      - Vertical position from top edge (default: 0)\n" +
            "  --width  - Icon width (default: 1)\n" +
            "  --height - Icon height (default: 1)\n" +
            "  --unit   - Unit: in (default), cm, pt, emu\n" +
            "  --color  - Icon color as hex (e.g. '#FF5733'). Only works on mono icons.\n" +
            "  --name   - Shape name (default: icon ID)\n",
          exitCode: 1,
        };
      }

      const [iconId, slideArg] = positional;
      const slideNum = Number.parseInt(slideArg, 10);
      if (Number.isNaN(slideNum) || slideNum < 1) {
        return {
          stdout: "",
          stderr: "Slide must be a positive number (1-based)",
          exitCode: 1,
        };
      }

      const parts = iconId.split(":");
      if (parts.length !== 2) {
        return {
          stdout: "",
          stderr:
            'Icon ID must be in "prefix:name" format (e.g. "mdi:alert"). Use search-icons to find icons.',
          exitCode: 1,
        };
      }

      const unit = flags.unit || "in";
      if (!["in", "cm", "pt", "emu"].includes(unit)) {
        return {
          stdout: "",
          stderr: "Unit must be one of: in, cm, pt, emu",
          exitCode: 1,
        };
      }

      const x = flags.x ? Number.parseFloat(flags.x) : 0;
      const y = flags.y ? Number.parseFloat(flags.y) : 0;
      const width = flags.width ? Number.parseFloat(flags.width) : 1;
      const height = flags.height ? Number.parseFloat(flags.height) : 1;

      if ([x, y, width, height].some((v) => Number.isNaN(v))) {
        return {
          stdout: "",
          stderr: "x, y, width, height must be valid numbers",
          exitCode: 1,
        };
      }

      try {
        const [prefix, name] = parts;
        const svgUrl = new URL(`${ICONIFY_API}/${prefix}/${name}.svg`);
        if (flags.color) {
          svgUrl.searchParams.set("color", flags.color);
        }

        const res = await fetch(svgUrl.toString());
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(
              `Icon "${iconId}" not found. Use search-icons to find valid icon IDs.`,
            );
          }
          throw new Error(
            `Failed to fetch icon: ${res.status} ${res.statusText}`,
          );
        }

        const svgText = await res.text();
        const svgData = new TextEncoder().encode(svgText);
        const shapeName = flags.name || iconId;
        const mediaCount = Date.now();

        await insertImageIntoSlide({
          slideIndex: slideNum - 1,
          data: svgData,
          mime: "image/svg+xml",
          ext: "svg",
          shapeName,
          offX: parseUnit(x, unit),
          offY: parseUnit(y, unit),
          cx: parseUnit(width, unit),
          cy: parseUnit(height, unit),
          mediaPrefix: `icon_${mediaCount}`,
        });

        const colorInfo = flags.color ? ` (color: ${flags.color})` : "";
        return {
          stdout: `Inserted icon "${iconId}" on slide ${slideNum} at (${x}, ${y}) size ${width}×${height} ${unit}${colorInfo}`,
          stderr: "",
          exitCode: 0,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return { stdout: "", stderr: msg, exitCode: 1 };
      }
    }),
};

export function getCustomCommands(): CustomCommand[] {
  return [
    pdfToText,
    pdfToImages,
    docxToText,
    xlsxToCsv,
    webSearchCmd,
    webFetchCmd,
    insertImageCmd,
    searchIconsCmd,
    insertIconCmd,
  ];
}
