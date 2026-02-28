import {
  readFile,
  readFileBuffer,
  sandboxedEval,
  writeFile,
} from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import { cleanupSlideMasters } from "../pptx/master-cleanup";
import { safeRun, withSlideZip } from "../pptx/slide-zip";
import { escapeXml } from "../pptx/xml-utils";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

export const editSlideMasterTool = defineTool({
  name: "edit_slide_master",
  label: "Edit Slide Master",
  description:
    "Edit slide master and layouts via OOXML — set backgrounds, decorative elements, " +
    "fonts, theme colors, and placeholders. Use this for any visual element that should " +
    "appear on all slides.",
  parameters: Type.Object({
    code: Type.String({
      description:
        "Async function body receiving { zip, markDirty }. zip is a JSZip archive " +
        "containing the full PPTX structure including ppt/slideMasters/ and ppt/slideLayouts/. " +
        "Call markDirty() if you modified files. " +
        "Globals: escapeXml(text) for safe XML text embedding, " +
        "readFile(path) returns Promise<string> and readFileBuffer(path) returns Promise<Uint8Array> " +
        "to read files from the virtual filesystem (e.g. uploaded images, SVGs). " +
        "writeFile(path, content) returns Promise<void> to write string or Uint8Array to the virtual filesystem.",
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief description (max 50 chars)",
        maxLength: 50,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      const result = await safeRun(async (context) => {
        const callbackResult = await withSlideZip(context, 0, async (args) => {
          return sandboxedEval(params.code, {
            ...args,
            escapeXml,
            readFile,
            readFileBuffer,
            writeFile,
            DOMParser,
            XMLSerializer,
          });
        });
        await cleanupSlideMasters(context);
        return callbackResult;
      });

      return toolSuccess({
        success: true,
        result: result !== undefined ? result : null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to edit slide master";
      return toolError(message);
    }
  },
});
