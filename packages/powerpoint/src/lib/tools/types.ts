import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
import { resizeImage } from "@office-agents/core";
import type { Static, TObject } from "@sinclair/typebox";

export type ToolResult = AgentToolResult<undefined>;

interface ToolConfig<T extends TObject> {
  name: string;
  label: string;
  description: string;
  parameters: T;
  execute: (
    toolCallId: string,
    params: Static<T>,
    signal?: AbortSignal,
  ) => Promise<ToolResult>;
  modifiedSlide?: (params: Static<T>) => number | undefined;
}

export function defineTool<T extends TObject>(
  config: ToolConfig<T>,
): AgentTool {
  if (!config.modifiedSlide) {
    return config as unknown as AgentTool;
  }

  const { modifiedSlide, execute, ...rest } = config;

  const wrappedExecute = async (
    toolCallId: string,
    params: Static<T>,
    signal?: AbortSignal,
  ): Promise<ToolResult> => {
    const result = await execute(toolCallId, params, signal);
    const first = result.content[0];
    if (!first || first.type !== "text") return result;

    try {
      const parsed = JSON.parse(first.text);
      if (parsed.error) return result;

      const slideIndex = modifiedSlide(params);
      if (slideIndex !== undefined) {
        parsed._modifiedSlide = slideIndex;
        return {
          content: [{ type: "text", text: JSON.stringify(parsed) }],
          details: undefined,
        };
      }
    } catch {
      // Invalid JSON, return as-is
    }
    return result;
  };

  return { ...rest, execute: wrappedExecute } as unknown as AgentTool;
}

export function toolSuccess(data: unknown): ToolResult {
  const result =
    typeof data === "object" && data !== null ? { ...data } : { result: data };
  return {
    content: [{ type: "text", text: JSON.stringify(result) }],
    details: undefined,
  };
}

export function toolError(message: string): ToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ success: false, error: message }),
      },
    ],
    details: undefined,
  };
}

export function toolText(text: string): ToolResult {
  return {
    content: [{ type: "text", text }],
    details: undefined,
  };
}

export async function toolImage(
  base64Data: string,
  mimeType: string,
): Promise<ToolResult> {
  const resized = await resizeImage(base64Data, mimeType);
  return {
    content: [
      {
        type: "image" as const,
        data: resized.data,
        mimeType: resized.mimeType,
      },
    ],
    details: undefined,
  };
}
