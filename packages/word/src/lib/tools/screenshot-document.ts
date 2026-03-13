import { toBase64 } from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import { defineTool, toolError, toolImage, toolText } from "./types";

/* global Office */

function getDocumentAsPdf(): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(
      Office.FileType.Pdf,
      { sliceSize: 4194304 },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(result.error.message));
          return;
        }
        const file = result.value;
        const sliceCount = file.sliceCount;
        const slices: Uint8Array[] = [];
        let received = 0;

        const readSlice = (index: number) => {
          file.getSliceAsync(index, (sliceResult) => {
            if (sliceResult.status === Office.AsyncResultStatus.Failed) {
              file.closeAsync();
              reject(new Error(sliceResult.error.message));
              return;
            }
            slices[index] = new Uint8Array(sliceResult.value.data);
            received++;
            if (received === sliceCount) {
              file.closeAsync();
              const totalLength = slices.reduce((s, b) => s + b.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const slice of slices) {
                combined.set(slice, offset);
                offset += slice.length;
              }
              resolve(combined);
            } else {
              readSlice(index + 1);
            }
          });
        };

        if (sliceCount > 0) {
          readSlice(0);
        } else {
          file.closeAsync();
          reject(new Error("Document returned 0 slices"));
        }
      },
    );
  });
}

function parsePageRanges(spec: string, maxPages: number): Set<number> {
  const pages = new Set<number>();
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = Math.max(1, Number.parseInt(startStr, 10));
      const end = Math.min(maxPages, Number.parseInt(endStr, 10));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        for (let i = start; i <= end; i++) pages.add(i);
      }
    } else {
      const num = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= maxPages) pages.add(num);
    }
  }
  return pages;
}

export const screenshotDocumentTool = defineTool({
  name: "screenshot_document",
  label: "Screenshot Document",
  description:
    "Take a visual screenshot of document pages by exporting to PDF and rendering as images. " +
    "Desktop/Mac only — not supported in Word on the web.",
  parameters: Type.Object({
    pages: Type.Optional(
      Type.String({
        description:
          'Page range to render, e.g. "1-3" or "1,3,5". Default: "1"',
      }),
    ),
    explanation: Type.Optional(
      Type.String({
        description: "Brief description of the action (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    // Check platform
    const platform = Office.context.platform;
    if (platform === Office.PlatformType.OfficeOnline) {
      return toolText(
        JSON.stringify({
          success: false,
          error:
            "screenshot_document is not supported in Word on the web. " +
            "Use get_document_text or get_document_structure to inspect the document instead.",
        }),
      );
    }

    try {
      const pdfData = await getDocumentAsPdf();

      // Render PDF pages directly using pdfjs-dist
      await import("pdfjs-dist/build/pdf.worker.mjs");
      const pdfjsLib = await import("pdfjs-dist");

      const pdfDoc = await pdfjsLib.getDocument({
        data: pdfData.slice(),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;

      const pagesSpec = params.pages || "1";
      const selectedPages = parsePageRanges(pagesSpec, pdfDoc.numPages);
      if (selectedPages.size === 0) {
        return toolError(
          `No valid pages in range "${pagesSpec}" (document has ${pdfDoc.numPages} pages)`,
        );
      }

      // Render first selected page
      const pageNum = [...selectedPages].sort((a, b) => a - b)[0];
      const page = await pdfDoc.getPage(pageNum);
      const scale = 2;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) throw new Error("Failed to create canvas 2D context");

      await page.render({ canvasContext: canvasCtx, canvas, viewport }).promise;

      const pngData = await new Promise<Uint8Array>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas toBlob failed"));
          blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
        }, "image/png");
      });

      // Cleanup
      canvas.width = 0;
      canvas.height = 0;
      pdfDoc.destroy();

      const base64 = toBase64(pngData);
      return await toolImage(base64, "image/png");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to screenshot document";
      return toolError(message);
    }
  },
});
