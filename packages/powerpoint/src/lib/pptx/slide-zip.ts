import type JSZip from "jszip";
import { default as JSZipCtor } from "jszip";
import { extractExternalReferences, sanitizeXmlAmpersands } from "./xml-utils";

/* global PowerPoint */

export interface SlideZipArgs {
  zip: JSZip;
  markDirty: () => void;
}

let onlineRunQueue = Promise.resolve();

function getPlatform(): string | undefined {
  if (typeof Office === "undefined") return undefined;
  try {
    return Office.context?.platform as unknown as string;
  } catch {
    return undefined;
  }
}

function safeRun<T>(
  callback: (ctx: PowerPoint.RequestContext) => Promise<T>,
): Promise<T> {
  if (getPlatform() !== "OfficeOnline") {
    return PowerPoint.run(callback);
  }
  const task: Promise<T> = onlineRunQueue
    .catch(() => {})
    .then(() =>
      Promise.race([
        PowerPoint.run(callback),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error("Office.run timed out after 120s")),
            120_000,
          ),
        ),
      ]),
    );
  onlineRunQueue = task.then(() => {}).catch(() => {});
  return task;
}

export { safeRun };

export async function withSlideZip<T>(
  context: PowerPoint.RequestContext,
  slideIndex: number,
  callback: (args: SlideZipArgs) => Promise<T>,
): Promise<T> {
  const slides = context.presentation.slides;
  slides.load("items/id");

  const selectedSlides = context.presentation.getSelectedSlides();
  selectedSlides.load("items/id");
  await context.sync();

  if (slideIndex < 0 || slideIndex >= slides.items.length) {
    throw new Error(
      `Slide index ${slideIndex} out of range (0-${slides.items.length - 1})`,
    );
  }

  const idToIndex = new Map(slides.items.map((s, i) => [s.id, i]));
  const selectedIndices = selectedSlides.items
    .map((s) => idToIndex.get(s.id))
    .filter((i) => i !== undefined);

  const targetSlideId =
    slideIndex > 0 ? slides.items[slideIndex - 1].id : undefined;

  const exportResult = slides.getItemAt(slideIndex).exportAsBase64();
  await context.sync();

  const zip = await JSZipCtor.loadAsync(exportResult.value, { base64: true });

  let dirty = false;
  const refsBefore = await extractExternalReferences(zip);

  const result = await callback({
    zip,
    markDirty: () => {
      dirty = true;
    },
  });

  if (dirty) {
    const slideFile = zip.file("ppt/slides/slide1.xml");
    if (slideFile) {
      const slideXml = await slideFile.async("string");
      const sanitized = sanitizeXmlAmpersands(slideXml);
      if (sanitized !== slideXml) {
        zip.file("ppt/slides/slide1.xml", sanitized);
      }
    }

    const refsAfter = await extractExternalReferences(zip);
    for (const ref of refsAfter) {
      if (!refsBefore.has(ref)) {
        throw new Error(`Adding external references is blocked (${ref})`);
      }
    }

    const modifiedBase64 = await zip.generateAsync({ type: "base64" });

    context.presentation.insertSlidesFromBase64(modifiedBase64, {
      targetSlideId,
    });
    slides.items[slideIndex].delete();
    await context.sync();

    if (selectedIndices.length > 0) {
      slides.load("items/id");
      await context.sync();
      const selectedIds = selectedIndices.map((i) => slides.items[i!].id);
      context.presentation.setSelectedSlides(selectedIds);
      await context.sync();
    }
  }

  return result;
}
