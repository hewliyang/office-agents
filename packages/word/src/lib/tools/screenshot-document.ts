import { loadPdfDocument, toBase64 } from "@office-agents/core";
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

export const screenshotDocumentTool = defineTool({
  name: "screenshot_document",
  label: "Screenshot Document",
  description:
    "Take a visual screenshot of a single document page by exporting to PDF and rendering as an image. " +
    "Desktop/Mac only — not supported in Word on the web.",
  parameters: Type.Object({
    page: Type.Optional(
      Type.Number({
        description: "1-based page number to render. Default: 1",
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
      const pdfDoc = await loadPdfDocument(pdfData);

      const pageNum = params.page ?? 1;
      if (pageNum < 1 || pageNum > pdfDoc.numPages) {
        pdfDoc.destroy();
        return toolError(`Page ${pageNum} out of range (1-${pdfDoc.numPages})`);
      }

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

      canvas.width = 0;
      canvas.height = 0;
      pdfDoc.destroy();

      return await toolImage(toBase64(pngData), "image/png");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to screenshot document";
      return toolError(message);
    }
  },
});
