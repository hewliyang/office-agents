import type { AgentContext } from "@office-agents/core";
import { sandboxedEval } from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import { safeRun } from "../pptx/slide-zip";
import { defineTool, toolError, toolSuccess } from "./types";

/* global PowerPoint */

export function createExecuteOfficeJsTool(ctx: AgentContext) {
  return defineTool({
    name: "execute_office_js",
    label: "Execute Office.js Code",
    description:
      "Execute Office.js JavaScript code to interact with the PowerPoint document. " +
      "The code receives a context parameter and runs inside PowerPoint.run(). " +
      "Use this for any document operations like adding slides, shapes, text, and formatting.",
    parameters: Type.Object({
      code: Type.String({
        description:
          "Async function body that receives 'context: PowerPoint.RequestContext'. " +
          "Must call context.sync() to execute batched operations and load() to read properties. " +
          "Return JSON-serializable results. " +
          "readFile(path) returns Promise<string> and readFileBuffer(path) returns Promise<Uint8Array> " +
          "to read files from the virtual filesystem. " +
          "writeFile(path, content) returns Promise<void> to write string or Uint8Array to the virtual filesystem. " +
          "btoa(string) and atob(base64) are available for base64 encoding/decoding.",
      }),
      explanation: Type.Optional(
        Type.String({
          description:
            "Brief explanation of what this code does (max 100 chars)",
          maxLength: 100,
        }),
      ),
    }),
    execute: async (_toolCallId, params) => {
      try {
        const result = await safeRun(async (context) => {
          return sandboxedEval(params.code, {
            context,
            PowerPoint,
            Office,
            readFile: (path: string) => ctx.readFile(path),
            readFileBuffer: (path: string) => ctx.readFileBuffer(path),
            writeFile: (path: string, content: string | Uint8Array) =>
              ctx.writeFile(path, content),
          });
        });

        return toolSuccess({ success: true, result: result ?? null });
      } catch (error) {
        if (error instanceof OfficeExtension.Error) {
          const parts = [error.message];
          if (error.code) parts.push(`Code: ${error.code}`);
          if (error.debugInfo) {
            const { errorLocation, statement, surroundingStatements } =
              error.debugInfo;
            if (errorLocation) parts.push(`Location: ${errorLocation}`);
            if (statement) parts.push(`Statement: ${statement}`);
            if (surroundingStatements?.length)
              parts.push(`Context: ${surroundingStatements.join("; ")}`);
          }
          return toolError(parts.join("\n"));
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unknown error executing code";
        return toolError(message);
      }
    },
  });
}
