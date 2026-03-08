const DEFAULT_MAX_WIDTH = 2000;
const DEFAULT_MAX_HEIGHT = 2000;
const DEFAULT_MAX_BYTES = 4.5 * 1024 * 1024;
const DEFAULT_JPEG_QUALITY = 0.8;

export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
  jpegQuality?: number;
}

export interface ResizedImage {
  data: string; // base64
  mimeType: string;
  wasResized: boolean;
}

function base64ToBytes(base64: string): number {
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function loadImage(
  base64: string,
  mimeType: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

function canvasToBase64(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): string {
  const dataUrl = canvas.toDataURL(mimeType, quality);
  return dataUrl.split(",")[1];
}

function renderToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to create canvas 2D context");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function tryBothFormats(
  img: HTMLImageElement,
  width: number,
  height: number,
  jpegQuality: number,
): { data: string; mimeType: string; bytes: number } {
  const canvas = renderToCanvas(img, width, height);

  const pngData = canvasToBase64(canvas, "image/png");
  const jpegData = canvasToBase64(canvas, "image/jpeg", jpegQuality);

  const pngBytes = base64ToBytes(pngData);
  const jpegBytes = base64ToBytes(jpegData);

  canvas.width = 0;
  canvas.height = 0;

  if (pngBytes <= jpegBytes) {
    return { data: pngData, mimeType: "image/png", bytes: pngBytes };
  }
  return { data: jpegData, mimeType: "image/jpeg", bytes: jpegBytes };
}

export async function resizeImage(
  base64: string,
  mimeType: string,
  options?: ImageResizeOptions,
): Promise<ResizedImage> {
  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options?.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  const jpegQuality = options?.jpegQuality ?? DEFAULT_JPEG_QUALITY;

  const originalBytes = base64ToBytes(base64);

  // Already within limits? Return as-is.
  // We can't check dimensions without loading, but we can skip if size is fine
  // and we'll check dimensions after loading.
  if (originalBytes <= maxBytes) {
    // Still need to check dimensions
    try {
      const img = await loadImage(base64, mimeType);
      if (img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight) {
        return { data: base64, mimeType, wasResized: false };
      }
      // Dimensions too large, fall through to resize
    } catch {
      return { data: base64, mimeType, wasResized: false };
    }
  }

  try {
    const img = await loadImage(base64, mimeType);
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;

    // Calculate initial target dimensions
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    if (targetWidth > maxWidth) {
      targetHeight = Math.round((targetHeight * maxWidth) / targetWidth);
      targetWidth = maxWidth;
    }
    if (targetHeight > maxHeight) {
      targetWidth = Math.round((targetWidth * maxHeight) / targetHeight);
      targetHeight = maxHeight;
    }

    const qualitySteps = [0.85, 0.7, 0.55, 0.4];
    const scaleSteps = [1.0, 0.75, 0.5, 0.35, 0.25];

    // First attempt at target dimensions
    let best = tryBothFormats(img, targetWidth, targetHeight, jpegQuality);
    if (best.bytes <= maxBytes) {
      return { data: best.data, mimeType: best.mimeType, wasResized: true };
    }

    // Try decreasing JPEG quality
    for (const quality of qualitySteps) {
      best = tryBothFormats(img, targetWidth, targetHeight, quality);
      if (best.bytes <= maxBytes) {
        return { data: best.data, mimeType: best.mimeType, wasResized: true };
      }
    }

    // Progressively reduce dimensions
    for (const scale of scaleSteps) {
      const w = Math.round(targetWidth * scale);
      const h = Math.round(targetHeight * scale);
      if (w < 100 || h < 100) break;

      for (const quality of qualitySteps) {
        best = tryBothFormats(img, w, h, quality);
        if (best.bytes <= maxBytes) {
          return { data: best.data, mimeType: best.mimeType, wasResized: true };
        }
      }
    }

    // Last resort: return smallest we produced
    return { data: best.data, mimeType: best.mimeType, wasResized: true };
  } catch {
    // If image processing fails, return original
    return { data: base64, mimeType, wasResized: false };
  }
}
