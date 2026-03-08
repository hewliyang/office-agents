import type { AppAdapter } from "@office-agents/core";
import { getOrCreateDocumentId } from "@office-agents/core";
import { SelectionIndicator } from "./components/selection-indicator";
import pptApiDts from "./docs/powerpoint-officejs-api.d.ts?raw";
import { buildPowerPointSystemPrompt } from "./system-prompt";
import { PPT_TOOLS } from "./tools";
import { getCustomCommands } from "./vfs/custom-commands";

/* global PowerPoint, Office */

export function createPowerPointAdapter(): AppAdapter {
  return {
    tools: PPT_TOOLS,
    customCommands: getCustomCommands,
    hasImageSearch: true,
    staticFiles: {
      "/home/user/docs/powerpoint-officejs-api.d.ts": pptApiDts,
    },

    appName: "OpenPPT",
    metadataTag: "ppt_context",
    storageNamespace: {
      dbName: "OpenPPTDB_v1",
      dbVersion: 1,
      localStoragePrefix: "openppt",
      documentSettingsPrefix: "openppt",
      documentIdSettingsKey: "openppt-presentation-id",
    },
    appVersion: __APP_VERSION__,
    emptyStateMessage:
      "Start a conversation to create or edit your presentation",
    SelectionIndicator,
    buildSystemPrompt: buildPowerPointSystemPrompt,

    getDocumentId: async () => {
      return getOrCreateDocumentId();
    },

    getDocumentMetadata: async () => {
      try {
        const metadata = await getPresentationMetadata();
        return { metadata };
      } catch {
        return null;
      }
    },

    onToolResult: (_toolCallId, result, isError) => {
      if (isError) return;
      try {
        const parsed = JSON.parse(result);
        if (typeof parsed._modifiedSlide === "number") {
          navigateToSlide(parsed._modifiedSlide).catch(console.error);
        }
      } catch {
        // Not JSON or no modified slide info
      }
    },
  };
}

async function navigateToSlide(slideIndex: number): Promise<void> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load("items/id");
    await context.sync();
    if (slideIndex >= 0 && slideIndex < slides.items.length) {
      context.presentation.setSelectedSlides([slides.items[slideIndex].id]);
      await context.sync();
    }
  });
}

const DEFAULT_OFFICE_THEME_COLORS: Record<string, string> = {
  Dark1: "#000000",
  Dark2: "#44546A",
  Light1: "#FFFFFF",
  Light2: "#E7E6E6",
  Accent1: "#4472C4",
  Accent2: "#ED7D31",
  Accent3: "#A5A5A5",
  Accent4: "#FFC000",
  Accent5: "#5B9BD5",
  Accent6: "#70AD47",
};

const THEME_COLOR_KEYS = [
  "Dark1",
  "Dark2",
  "Light1",
  "Light2",
  "Accent1",
  "Accent2",
  "Accent3",
  "Accent4",
  "Accent5",
  "Accent6",
] as const;

function normalizeColor(c: string): string {
  return c.replace(/^#/, "").toUpperCase();
}

async function detectThemeDefault(
  master: PowerPoint.SlideMaster,
  context: PowerPoint.RequestContext,
): Promise<{ isDefault: boolean; confidence: "high" | "medium" | "low" }> {
  try {
    const scheme = master.themeColorScheme;
    const colorResults: Record<
      string,
      OfficeExtension.ClientResult<string>
    > = {};

    for (const key of THEME_COLOR_KEYS) {
      colorResults[key] = scheme.getThemeColor(key);
    }

    master.shapes.load("items");
    await context.sync();

    let matchCount = 0;
    for (const key of THEME_COLOR_KEYS) {
      const actual = normalizeColor(colorResults[key].value);
      const expected = normalizeColor(DEFAULT_OFFICE_THEME_COLORS[key]);
      if (actual === expected) matchCount++;
    }

    const total = THEME_COLOR_KEYS.length;
    const masterShapeCount = master.shapes.items.length;

    if (matchCount === total) {
      return { isDefault: true, confidence: "high" };
    }
    if (matchCount >= total - 2) {
      // Nearly all match — might be a minor tweak or variant
      return {
        isDefault: masterShapeCount <= 2,
        confidence: "medium",
      };
    }
    // Significantly different colors — custom theme
    return {
      isDefault: false,
      confidence: matchCount >= 3 ? "medium" : "high",
    };
  } catch {
    // ThemeColorScheme API may not be available (older hosts)
    return { isDefault: true, confidence: "low" };
  }
}

async function getPresentationMetadata(): Promise<object> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load("items/id");

    const pageSetup = context.presentation.pageSetup;
    pageSetup.load(["slideWidth", "slideHeight"]);

    const masters = context.presentation.slideMasters;
    masters.load("items");

    const selectedSlides = context.presentation.getSelectedSlides();
    selectedSlides.load("items/id");

    let selectedShapesCollection: PowerPoint.ShapeScopedCollection | undefined;
    try {
      selectedShapesCollection = context.presentation.getSelectedShapes();
      selectedShapesCollection.load(
        "items/name,items/type,items/id,items/left,items/top,items/width,items/height",
      );
    } catch {
      // getSelectedShapes may not be available on older hosts
    }

    await context.sync();

    // Load layouts for each master
    for (const master of masters.items) {
      master.layouts.load("items/name,items/id");
    }
    await context.sync();

    // Determine if content exists (check shapes across ALL slides)
    let hasContent = false;
    if (slides.items.length > 0) {
      const allShapes = slides.items.map((slide) => {
        const shapes = slide.shapes;
        shapes.load("items");
        return shapes;
      });
      await context.sync();
      hasContent = allShapes.some((shapes) => shapes.items.length > 0);
    }

    // Detect whether the theme is the default Office theme
    const themeResult =
      masters.items.length > 0
        ? await detectThemeDefault(masters.items[0], context)
        : { isDefault: true, confidence: "low" as const };

    // Build slide ID to index map
    const idToIndex = new Map(slides.items.map((s, i) => [s.id, i]));
    const selectedIndices = selectedSlides.items.map((s) => ({
      slideId: s.id,
      positionOneIndexed: (idToIndex.get(s.id) ?? 0) + 1,
    }));

    // Build selected shapes info
    const selectedShapes =
      selectedShapesCollection?.items.map((s) => ({
        name: s.name,
        type: s.type,
        id: s.id,
        left: s.left,
        top: s.top,
        width: s.width,
        height: s.height,
      })) ?? [];

    return {
      slideCount: slides.items.length,
      slideWidth: pageSetup.slideWidth,
      slideHeight: pageSetup.slideHeight,
      isDefaultTheme: themeResult.isDefault,
      themeDetectionConfidence: themeResult.confidence,
      hasContent,
      selectedSlides: selectedIndices,
      selectedShapes,
      masters: masters.items.map((m, mi) => ({
        index: mi,
        layouts: m.layouts.items.map((l) => ({
          name: l.name,
          id: l.id,
        })),
      })),
    };
  });
}
