// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resizeImage } from "../src/image-resize";

type ImageScenario = {
  width: number;
  height: number;
  fail?: boolean;
};

type CanvasCall = {
  width: number;
  height: number;
  mimeType: string;
  quality?: number;
};

const originalImage = globalThis.Image;

let imageQueue: ImageScenario[] = [];
let canvasCalls: CanvasCall[] = [];
let computeBytes: (
  width: number,
  height: number,
  mimeType: string,
  quality?: number,
) => number;

function makeBase64ForBytes(bytes: number): string {
  const normalized = bytes - (bytes % 3);
  return "A".repeat((normalized / 3) * 4);
}

function bytesFromBase64(base64: string): number {
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function queueImage(scenario: ImageScenario, count = 1) {
  for (let i = 0; i < count; i += 1) {
    imageQueue.push({ ...scenario });
  }
}

class MockImage {
  naturalWidth = 0;
  naturalHeight = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    const scenario = imageQueue.shift();
    if (!scenario) {
      throw new Error("No queued image scenario for test");
    }

    Promise.resolve().then(() => {
      if (scenario.fail) {
        this.onerror?.();
        return;
      }

      this.naturalWidth = scenario.width;
      this.naturalHeight = scenario.height;
      this.onload?.();
    });
  }
}

describe("resizeImage", () => {
  beforeEach(() => {
    imageQueue = [];
    canvasCalls = [];
    computeBytes = () => 120;

    globalThis.Image = MockImage as unknown as typeof Image;

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (contextType: string) => {
        if (contextType !== "2d") return null;
        return {
          drawImage: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
      },
    );

    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockImplementation(
      function (type?: string, quality?: number) {
        const mimeType = type ?? "image/png";
        canvasCalls.push({
          width: this.width,
          height: this.height,
          mimeType,
          quality,
        });
        return `data:${mimeType};base64,${makeBase64ForBytes(
          computeBytes(this.width, this.height, mimeType, quality),
        )}`;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalImage) {
      globalThis.Image = originalImage;
    } else {
      // @ts-expect-error restoring missing global in tests
      delete globalThis.Image;
    }
  });

  it("returns the original image when already within byte and dimension limits", async () => {
    queueImage({ width: 640, height: 480 });

    const input = makeBase64ForBytes(120);
    const result = await resizeImage(input, "image/png", {
      maxBytes: 200,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    expect(result).toEqual({
      data: input,
      mimeType: "image/png",
      wasResized: false,
    });
    expect(canvasCalls).toHaveLength(0);
  });

  it("resizes oversized dimensions and keeps the smaller output format", async () => {
    queueImage({ width: 4000, height: 1000 }, 2);
    computeBytes = (_width, _height, mimeType) =>
      mimeType === "image/png" ? 90 : 120;

    const result = await resizeImage(makeBase64ForBytes(120), "image/png", {
      maxBytes: 200,
      maxWidth: 2000,
      maxHeight: 2000,
    });

    expect(result.wasResized).toBe(true);
    expect(result.mimeType).toBe("image/png");
    expect(bytesFromBase64(result.data)).toBe(90);
    expect(canvasCalls[0]).toMatchObject({
      width: 2000,
      height: 500,
      mimeType: "image/png",
    });
    expect(canvasCalls[1]).toMatchObject({
      width: 2000,
      height: 500,
      mimeType: "image/jpeg",
    });
  });

  it("reduces JPEG quality until the resized image fits under maxBytes", async () => {
    queueImage({ width: 800, height: 600 });
    computeBytes = (_width, _height, mimeType, quality) => {
      if (mimeType === "image/png") return 600;
      return quality !== undefined && quality < 0.7 ? 180 : 450;
    };

    const result = await resizeImage(makeBase64ForBytes(300), "image/png", {
      maxBytes: 200,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    expect(result.wasResized).toBe(true);
    expect(result.mimeType).toBe("image/jpeg");
    expect(bytesFromBase64(result.data)).toBe(180);
    expect(
      canvasCalls.some(
        (call) => call.mimeType === "image/jpeg" && call.quality === 0.55,
      ),
    ).toBe(true);
  });

  it("progressively downscales dimensions when quality reduction is not enough", async () => {
    queueImage({ width: 1000, height: 1000 });
    computeBytes = (width, _height, mimeType) => {
      if (mimeType === "image/png") return 600;
      return width <= 500 ? 150 : 400;
    };

    const result = await resizeImage(makeBase64ForBytes(300), "image/png", {
      maxBytes: 200,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    expect(result.wasResized).toBe(true);
    expect(result.mimeType).toBe("image/jpeg");
    expect(bytesFromBase64(result.data)).toBe(150);
    expect(
      canvasCalls.some(
        (call) =>
          call.width === 500 &&
          call.height === 500 &&
          call.mimeType === "image/jpeg",
      ),
    ).toBe(true);
  });

  it("falls back to the original image when image loading fails", async () => {
    queueImage({ width: 0, height: 0, fail: true });

    const input = makeBase64ForBytes(120);
    const result = await resizeImage(input, "image/webp", {
      maxBytes: 200,
      maxWidth: 1000,
      maxHeight: 1000,
    });

    expect(result).toEqual({
      data: input,
      mimeType: "image/webp",
      wasResized: false,
    });
    expect(canvasCalls).toHaveLength(0);
  });
});
