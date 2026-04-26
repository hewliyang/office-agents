import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type {
  AssistantMessage,
  ImageContent,
  TextContent,
  ToolResultMessage,
  UserMessage,
} from "@mariozechner/pi-ai";

export type ToolCallStatus = "pending" | "running" | "complete" | "error";

/**
 * Filters agent messages for LLM context.
 * Finds the last compactionSummary message and returns it + everything after it.
 * The compactionSummary is converted to a UserMessage with the summary wrapped in tags.
 * This is used to prevent context overflow when messages become too long.
 */
export function filterMessagesForLLM(
  messages: AgentMessage[],
): AgentMessage[] {
  // Find the last compactionSummary message
  let lastCompactionIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as unknown as { role: string; summary?: string; timestamp?: number };
    if (msg.role === "compactionSummary") {
      lastCompactionIdx = i;
      break;
    }
  }

  // If no compactionSummary, return all
  if (lastCompactionIdx === -1) {
    return messages;
  }

  // Get the compactionSummary and extract summary text
  const compactionMsg = messages[lastCompactionIdx] as unknown as { summary?: string; timestamp?: number };
  const summaryText = compactionMsg.summary || "Previous conversation summary";

  // Create a user message with the summary wrapped in tags
  const summaryUserMsg = {
    role: "user",
    content: [
      {
        type: "text",
        text: `<compaction_summary>\n${summaryText}\n</compaction_summary>`,
      },
    ],
    timestamp: (compactionMsg.timestamp as number) || Date.now(),
  } as unknown as AgentMessage;

  // Return: summary as user message + everything after it
  return [summaryUserMsg, ...messages.slice(lastCompactionIdx + 1)] as AgentMessage[];
}

/**
 * Detects if an assistant message indicates a context overflow error.
 */
export function isContextOverflow(
  message: AssistantMessage,
  contextWindow: number,
  reserveTokens: number = 4000,
): boolean {
  // Check if it's an error with overflow indicators
  if (message.stopReason === "error" && message.errorMessage) {
    const errorLower = message.errorMessage.toLowerCase();
    if (
      errorLower.includes("context") ||
      errorLower.includes("limit") ||
      errorLower.includes("max") ||
      errorLower.includes("token") ||
      errorLower.includes("overflow") ||
      errorLower.includes("context_length")
    ) {
      return true;
    }
  }

  // Check if usage exceeds context window (with reserve)
  if (message.usage && contextWindow > 0) {
    const totalTokens =
      message.usage.input +
      message.usage.cacheRead +
      message.usage.cacheWrite;
    if (totalTokens > contextWindow - reserveTokens) {
      return true;
    }
  }

  return false;
}

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "thinking"; thinking: string }
  | {
      type: "toolCall";
      id: string;
      name: string;
      args: Record<string, unknown>;
      status: ToolCallStatus;
      result?: string;
      images?: { data: string; mimeType: string }[];
    };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
  timestamp: number;
}

export interface SessionStats {
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
  totalCost: number;
  contextWindow: number;
  lastInputTokens: number;
}

export function stripEnrichment(
  content: string | { type: string; text?: string }[],
  metadataTag?: string,
): string {
  let text: string;
  if (typeof content === "string") {
    text = content;
  } else {
    text = content
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n");
  }
  text = text.replace(/^<attachments>\n[\s\S]*?\n<\/attachments>\n\n/, "");
  if (metadataTag) {
    const escaped = metadataTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(
      new RegExp(`^<${escaped}>\n[\\s\\S]*?</${escaped}>\n\n`),
      "",
    );
  } else {
    text = text.replace(/^<\w+_context>\n[\\s\\S]*?<\/\w+_context>\n\n/, "");
  }
  return text;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function extractPartsFromAssistantMessage(
  message: AgentMessage,
  existingParts: MessagePart[] = [],
): MessagePart[] {
  // Skip non-assistant messages
  const role = message.role;
  if (role !== "assistant") return existingParts;

  const assistantMsg = message as unknown as AssistantMessage;
  const existingToolCalls = new Map<string, MessagePart>();
  for (const part of existingParts) {
    if (part.type === "toolCall") {
      existingToolCalls.set(part.id, part);
    }
  }

  return assistantMsg.content.map((block): MessagePart => {
    if (block.type === "text") {
      return { type: "text", text: block.text };
    }
    if (block.type === "thinking") {
      return { type: "thinking", thinking: block.thinking };
    }
    const existing = existingToolCalls.get(block.id);
    return {
      type: "toolCall",
      id: block.id,
      name: block.name,
      args: block.arguments as Record<string, unknown>,
      status: existing?.type === "toolCall" ? existing.status : "pending",
      result: existing?.type === "toolCall" ? existing.result : undefined,
    };
  });
}

export function agentMessagesToChatMessages(
  agentMessages: AgentMessage[],
  metadataTag?: string,
): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (const msg of agentMessages) {
    // Skip compactionSummary messages - they're for LLM context only
    const rawMsg = msg as unknown as { role: string };
    if (rawMsg.role === "compactionSummary") {
      continue;
    }

    if (rawMsg.role === "user") {
      const userMsg = msg as unknown as UserMessage;
      const text = stripEnrichment(userMsg.content, metadataTag);
      result.push({
        id: generateId(),
        role: "user",
        parts: [{ type: "text", text }],
        timestamp: userMsg.timestamp,
      });
    } else if (msg.role === "assistant") {
      const parts = extractPartsFromAssistantMessage(msg);
      result.push({
        id: generateId(),
        role: "assistant",
        parts,
        timestamp: (msg as unknown as AssistantMessage).timestamp,
      });
    } else if (msg.role === "toolResult") {
      const toolResult = msg as unknown as ToolResultMessage;
      for (let i = result.length - 1; i >= 0; i--) {
        const chatMsg = result[i];
        if (chatMsg.role !== "assistant") continue;
        const partIdx = chatMsg.parts.findIndex(
          (p) => p.type === "toolCall" && p.id === toolResult.toolCallId,
        );
        if (partIdx !== -1) {
          const part = chatMsg.parts[partIdx];
          if (part.type === "toolCall") {
            const resultText = toolResult.content
              .filter((c): c is TextContent => c.type === "text")
              .map((c) => c.text)
              .join("\n");
            const images = toolResult.content
              .filter((c): c is ImageContent => c.type === "image")
              .map((c) => ({ data: c.data, mimeType: c.mimeType }));
            chatMsg.parts[partIdx] = {
              ...part,
              status: toolResult.isError ? "error" : "complete",
              result: resultText,
              images: images.length > 0 ? images : undefined,
            };
          }
          break;
        }
      }
    }
  }
  return result;
}

export function deriveStats(
  agentMessages: AgentMessage[],
): Omit<SessionStats, "contextWindow"> {
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheRead = 0;
  let cacheWrite = 0;
  let totalCost = 0;
  let lastInputTokens = 0;
  for (const msg of agentMessages) {
    // Skip non-assistant messages
    if (msg.role !== "assistant") continue;
    
    const u = (msg as unknown as AssistantMessage).usage;
    if (u) {
      inputTokens += u.input;
      outputTokens += u.output;
      cacheRead += u.cacheRead;
      cacheWrite += u.cacheWrite;
      totalCost += u.cost.total;
      lastInputTokens = u.input + u.cacheRead + u.cacheWrite;
    }
  }
  return {
    inputTokens,
    outputTokens,
    cacheRead,
    cacheWrite,
    totalCost,
    lastInputTokens,
  };
}