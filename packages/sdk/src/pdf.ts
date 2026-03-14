import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

export function loadPdfDocument(data: Uint8Array) {
  return getDocument({
    data: data.slice(),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
}
