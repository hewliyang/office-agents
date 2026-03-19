import { describe, expect, it } from "vitest";
import {
  agentMessagesToChatMessages,
  deriveStats,
  extractPartsFromAssistantMessage,
  generateId,
  stripEnrichment,
} from "../src/message-utils";

describe("generateId", () => {
  it("produces unique ids across 100 calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("stripEnrichment", () => {
  it("strips attachments block", () => {
    const content =
      "<attachments>\n/home/user/uploads/file.csv\n</attachments>\n\nHello world";
    expect(stripEnrichment(content)).toBe("Hello world");
  });

  it("strips default metadata block", () => {
    const content =
      '<doc_context>\n{"sheet":"Summary"}\n</doc_context>\n\nAnalyze this';
    expect(stripEnrichment(content)).toBe("Analyze this");
  });

  it("strips custom metadata tag", () => {
    const content =
      '<excel_context>\n{"sheet":"Sheet1"}\n</excel_context>\n\nDo something';
    expect(stripEnrichment(content, "excel_context")).toBe("Do something");
  });

  it("strips both attachments and metadata", () => {
    const content =
      "<attachments>\n/uploads/f.csv\n</attachments>\n\n<doc_context>\n{}\n</doc_context>\n\nQuery";
    expect(stripEnrichment(content)).toBe("Query");
  });

  it("returns plain text unchanged", () => {
    expect(stripEnrichment("just a question")).toBe("just a question");
  });

  it("handles array content (multi-part messages)", () => {
    const content = [
      { type: "text", text: "<attachments>\nf.csv\n</attachments>\n\nHello" },
      { type: "text", text: " world" },
    ];
    // Multiple text parts are joined with newlines
    expect(stripEnrichment(content)).toBe("Hello\n world");
  });

  it("ignores non-text content parts", () => {
    const content = [
      { type: "image", data: "abc" },
      { type: "text", text: "visible" },
    ];
    expect(stripEnrichment(content)).toBe("visible");
  });
});

describe("extractPartsFromAssistantMessage", () => {
  it("maps tool calls to pending status with arguments renamed to args", () => {
    const message = {
      role: "assistant" as const,
      content: [
        {
          type: "toolCall" as const,
          id: "tc_1",
          name: "bash",
          arguments: { command: "ls" },
        },
      ],
      timestamp: 1,
      stopReason: "stop" as const,
      api: "openai-completions" as const,
      provider: "openai",
      model: "gpt-4",
      usage: {
        input: 10,
        output: 5,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 15,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      },
    };
    const parts = extractPartsFromAssistantMessage(message);
    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({
      type: "toolCall",
      id: "tc_1",
      name: "bash",
      args: { command: "ls" },
      status: "pending",
    });
  });

  it("preserves existing tool call status from prior parts", () => {
    const message = {
      role: "assistant" as const,
      content: [
        {
          type: "toolCall" as const,
          id: "tc_1",
          name: "bash",
          arguments: { command: "ls" },
        },
      ],
      timestamp: 1,
      stopReason: "stop" as const,
      api: "openai-completions" as const,
      provider: "openai",
      model: "gpt-4",
      usage: {
        input: 10,
        output: 5,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 15,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      },
    };
    const existingParts = [
      {
        type: "toolCall" as const,
        id: "tc_1",
        name: "bash",
        args: { command: "ls" },
        status: "complete" as const,
        result: "file.txt",
      },
    ];
    const parts = extractPartsFromAssistantMessage(message, existingParts);
    expect(parts[0]).toMatchObject({
      status: "complete",
      result: "file.txt",
    });
  });

  it("returns empty array for non-assistant messages", () => {
    const message = { role: "user" as const, content: "hi", timestamp: 1 };
    expect(extractPartsFromAssistantMessage(message)).toEqual([]);
  });
});

describe("agentMessagesToChatMessages", () => {
  const usage = {
    input: 10,
    output: 5,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 15,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  };

  it("strips enrichment from user messages", () => {
    const messages = [
      {
        role: "user" as const,
        content:
          "<attachments>\nfile.csv\n</attachments>\n\n<doc_context>\n{}\n</doc_context>\n\nQuestion",
        timestamp: 1000,
      },
    ];
    const result = agentMessagesToChatMessages(messages);
    expect(result[0].parts[0]).toEqual({ type: "text", text: "Question" });
  });

  it("links tool results back to their assistant tool call", () => {
    const messages = [
      {
        role: "assistant" as const,
        content: [
          {
            type: "toolCall" as const,
            id: "tc_1",
            name: "bash",
            arguments: { command: "echo hi" },
          },
        ],
        timestamp: 1,
        stopReason: "stop" as const,
        api: "openai-completions" as const,
        provider: "openai",
        model: "gpt-4",
        usage,
      },
      {
        role: "toolResult" as const,
        toolName: "bash",
        toolCallId: "tc_1",
        content: [{ type: "text" as const, text: "hi" }],
        isError: false,
        timestamp: 2,
      },
    ];
    const result = agentMessagesToChatMessages(messages);
    expect(result).toHaveLength(1);
    const toolPart = result[0].parts[0];
    expect(toolPart.type).toBe("toolCall");
    if (toolPart.type === "toolCall") {
      expect(toolPart.status).toBe("complete");
      expect(toolPart.result).toBe("hi");
    }
  });

  it("marks errored tool results", () => {
    const messages = [
      {
        role: "assistant" as const,
        content: [
          {
            type: "toolCall" as const,
            id: "tc_err",
            name: "bash",
            arguments: { command: "fail" },
          },
        ],
        timestamp: 1,
        stopReason: "stop" as const,
        api: "openai-completions" as const,
        provider: "openai",
        model: "gpt-4",
        usage,
      },
      {
        role: "toolResult" as const,
        toolName: "bash",
        toolCallId: "tc_err",
        content: [{ type: "text" as const, text: "command not found" }],
        isError: true,
        timestamp: 2,
      },
    ];
    const result = agentMessagesToChatMessages(messages);
    const toolPart = result[0].parts[0];
    if (toolPart.type === "toolCall") {
      expect(toolPart.status).toBe("error");
    }
  });

  it("attaches images from tool results", () => {
    const messages = [
      {
        role: "assistant" as const,
        content: [
          {
            type: "toolCall" as const,
            id: "tc_img",
            name: "screenshot",
            arguments: {},
          },
        ],
        timestamp: 1,
        stopReason: "stop" as const,
        api: "openai-completions" as const,
        provider: "openai",
        model: "gpt-4",
        usage,
      },
      {
        role: "toolResult" as const,
        toolName: "bash",
        toolCallId: "tc_img",
        content: [
          { type: "text" as const, text: "screenshot taken" },
          {
            type: "image" as const,
            data: "base64data",
            mimeType: "image/png",
          },
        ],
        isError: false,
        timestamp: 2,
      },
    ];
    const result = agentMessagesToChatMessages(messages);
    const toolPart = result[0].parts[0];
    if (toolPart.type === "toolCall") {
      expect(toolPart.images).toEqual([
        { data: "base64data", mimeType: "image/png" },
      ]);
    }
  });
});

describe("deriveStats", () => {
  it("returns zeroed stats for empty messages", () => {
    const stats = deriveStats([]);
    expect(stats).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cacheRead: 0,
      cacheWrite: 0,
      totalCost: 0,
      lastInputTokens: 0,
    });
  });

  it("accumulates usage from assistant messages", () => {
    const messages = [
      {
        role: "assistant" as const,
        content: [{ type: "text" as const, text: "one" }],
        timestamp: 1,
        stopReason: "stop" as const,
        api: "openai-completions" as const,
        provider: "openai",
        model: "gpt-4",
        usage: {
          input: 100,
          output: 50,
          cacheRead: 10,
          cacheWrite: 5,
          totalTokens: 165,
          cost: {
            input: 0.01,
            output: 0.02,
            cacheRead: 0.001,
            cacheWrite: 0.0005,
            total: 0.03,
          },
        },
      },
      {
        role: "assistant" as const,
        content: [{ type: "text" as const, text: "two" }],
        timestamp: 2,
        stopReason: "stop" as const,
        api: "openai-completions" as const,
        provider: "openai",
        model: "gpt-4",
        usage: {
          input: 200,
          output: 100,
          cacheRead: 20,
          cacheWrite: 10,
          totalTokens: 330,
          cost: {
            input: 0.02,
            output: 0.04,
            cacheRead: 0.002,
            cacheWrite: 0.001,
            total: 0.06,
          },
        },
      },
    ];
    const stats = deriveStats(messages);
    expect(stats.inputTokens).toBe(300);
    expect(stats.outputTokens).toBe(150);
    expect(stats.cacheRead).toBe(30);
    expect(stats.cacheWrite).toBe(15);
    expect(stats.totalCost).toBeCloseTo(0.09);
    expect(stats.lastInputTokens).toBe(230); // last msg: input + cacheRead + cacheWrite
  });

  it("ignores user and toolResult messages", () => {
    const messages = [
      { role: "user" as const, content: "hi", timestamp: 1 },
      {
        role: "toolResult" as const,
        toolName: "bash",
        toolCallId: "tc",
        content: [{ type: "text" as const, text: "ok" }],
        isError: false,
        timestamp: 2,
      },
    ];
    const stats = deriveStats(messages);
    expect(stats.inputTokens).toBe(0);
  });
});
