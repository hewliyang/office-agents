import {
  readFile,
  readFileBuffer,
  sandboxedEval,
  writeFile,
} from "@office-agents/core";
import { Type } from "@sinclair/typebox";
import type { DirtyRange } from "../dirty-tracker";
import { createTrackedContext } from "../excel/tracked-context";
import { defineTool, toolError, toolSuccess } from "./types";

/* global Excel */

const MUTATION_PATTERNS = [
  /\.(values|formulas|numberFormat)\s*=/,
  /\.clear\s*\(/,
  /\.delete\s*\(/,
  /\.insert\s*\(/,
  /\.copyFrom\s*\(/,
  /\.add\s*\(/,
];

function looksLikeMutation(code: string): boolean {
  return MUTATION_PATTERNS.some((p) => p.test(code));
}

export const evalOfficeJsTool = defineTool({
  name: "eval_officejs",
  label: "Execute Office.js Code",
  description:
    "Execute arbitrary Office.js code within an Excel.run context. " +
    "Use this as an escape hatch when existing tools don't cover your use case. " +
    "The code runs inside `Excel.run(async (context) => { ... })` with `context` available. " +
    "Return a value to get it back as the result. Always call `await context.sync()` before returning.",
  parameters: Type.Object({
    code: Type.String({
      description:
        "JavaScript code to execute. Has access to `context` (Excel.RequestContext), " +
        "readFile(path) returns Promise<string>, readFileBuffer(path) returns Promise<Uint8Array>, " +
        "and writeFile(path, content) returns Promise<void> (content: string | Uint8Array) for VFS files. " +
        "Must be valid async code. Return a value to get it as result. " +
        "Example: `const range = context.workbook.worksheets.getActiveWorksheet().getRange('A1'); range.load('values'); await context.sync(); return range.values;`",
    }),
    explanation: Type.Optional(
      Type.String({
        description: "Brief explanation of what this code does (max 100 chars)",
        maxLength: 100,
      }),
    ),
  }),
  execute: async (_toolCallId, params) => {
    try {
      let dirtyRanges: DirtyRange[] = [];

      const result = await Excel.run(async (context) => {
        const { trackedContext, getDirtyRanges } =
          createTrackedContext(context);

        const execResult = await sandboxedEval(params.code, {
          context: trackedContext,
          Excel,
          readFile,
          readFileBuffer,
          writeFile,
        });

        dirtyRanges = getDirtyRanges();
        return execResult;
      });

      if (dirtyRanges.length === 0 && looksLikeMutation(params.code)) {
        dirtyRanges = [{ sheetId: -1, range: "*" }];
      }

      const response: Record<string, unknown> = {
        success: true,
        result: result ?? null,
      };
      if (dirtyRanges.length > 0) {
        response._dirtyRanges = dirtyRanges;
      }
      return toolSuccess(response);
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
        error instanceof Error ? error.message : "Unknown error executing code";
      return toolError(message);
    }
  },
});
