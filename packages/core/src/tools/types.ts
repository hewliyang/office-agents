import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
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
}

export function defineTool<T extends TObject>(
  config: ToolConfig<T>,
): AgentTool {
  return config as unknown as AgentTool;
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
