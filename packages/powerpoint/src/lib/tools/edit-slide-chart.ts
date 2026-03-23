import type { AgentContext } from "@office-agents/core";
import { sandboxedEval } from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import { safeRun, withSlideZip } from "../pptx/slide-zip";
import { escapeXml } from "../pptx/xml-utils";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

export function createEditSlideChartTool(ctx: AgentContext) {
  return defineTool({
    name: "edit_slide_chart",
    label: "Edit Slide Chart",
    description:
      "Add or edit charts in a PowerPoint slide by manipulating raw OOXML. " +
      "Always use this for data visualizations — never approximate charts with geometric shapes.",
    parameters: Type.Object({
      slide_index: Type.Number({
        description:
          "0-based slide index (user's slide 1 = index 0, slide 3 = index 2)",
      }),
      code: Type.String({
        description:
          "Async function body receiving { zip, markDirty }. zip is a JSZip archive of the slide. " +
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
          return withSlideZip(context, params.slide_index, async (args) => {
            return sandboxedEval(params.code, {
              ...args,
              escapeXml,
              readFile: (path: string) => ctx.readFile(path),
              readFileBuffer: (path: string) => ctx.readFileBuffer(path),
              writeFile: (path: string, content: string | Uint8Array) =>
                ctx.writeFile(path, content),
              DOMParser,
              XMLSerializer,
            });
          });
        });

        return toolSuccess({
          success: true,
          result: result !== undefined ? result : null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to edit slide chart";
        return toolError(message);
      }
    },
    modifiedSlide: (params) => params.slide_index,
  });
}
