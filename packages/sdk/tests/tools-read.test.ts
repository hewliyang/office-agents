import { describe, expect, it } from "vitest";
import { AgentContext } from "../src/context";
import { createReadTool } from "../src/tools/read-file";
import type { ToolResult } from "../src/tools/types";

function getText(result: ToolResult): string {
  const block = result.content[0];
  return block.type === "text" ? block.text : "";
}

function hasImage(result: ToolResult): boolean {
  return result.content.some((c) => c.type === "image");
}

describe("readTool", () => {
  function setup() {
    const ctx = new AgentContext();
    const tool = createReadTool(ctx);
    const execute = tool.execute as (
      toolCallId: string,
      params: { path: string; offset?: number; limit?: number },
    ) => Promise<ToolResult>;
    return { ctx, execute };
  }

  it("reads a text file by relative path", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("hello.txt", "Hello, world!");
    const result = await execute("tc_1", { path: "hello.txt" });
    expect(getText(result)).toBe("Hello, world!");
  });

  it("reads a text file by absolute path", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("/home/user/uploads/abs.txt", "absolute content");
    const result = await execute("tc_2", {
      path: "/home/user/uploads/abs.txt",
    });
    expect(getText(result)).toBe("absolute content");
  });

  it("returns error for non-existent file", async () => {
    const { execute } = setup();
    const result = await execute("tc_3", { path: "missing.txt" });
    const text = getText(result);
    expect(text).toContain("File not found");
    expect(text).toContain("missing.txt");
  });

  it("lists available files when file not found", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("existing.csv", "data");
    const result = await execute("tc_4", { path: "nope.txt" });
    const text = getText(result);
    expect(text).toContain("existing.csv");
  });

  it("supports offset parameter (1-indexed)", async () => {
    const { ctx, execute } = setup();
    const content = "line1\nline2\nline3\nline4\nline5";
    await ctx.writeFile("lines.txt", content);
    const result = await execute("tc_5", { path: "lines.txt", offset: 3 });
    const text = getText(result);
    expect(text).toContain("line3");
    expect(text).toContain("line4");
    expect(text).toContain("line5");
    expect(text).not.toMatch(/^line1/);
  });

  it("supports limit parameter", async () => {
    const { ctx, execute } = setup();
    const content = "line1\nline2\nline3\nline4\nline5";
    await ctx.writeFile("lines.txt", content);
    const result = await execute("tc_6", { path: "lines.txt", limit: 2 });
    const text = getText(result);
    expect(text).toContain("line1");
    expect(text).toContain("line2");
    expect(text).toContain("more lines in file");
    expect(text).toContain("offset=3");
  });

  it("supports offset + limit together", async () => {
    const { ctx, execute } = setup();
    const content = "line1\nline2\nline3\nline4\nline5";
    await ctx.writeFile("lines.txt", content);
    const result = await execute("tc_7", {
      path: "lines.txt",
      offset: 2,
      limit: 2,
    });
    const text = getText(result);
    expect(text).toContain("line2");
    expect(text).toContain("line3");
    expect(text).toContain("offset=4");
  });

  it("returns error when offset is beyond file end", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("short.txt", "one\ntwo");
    const result = await execute("tc_8", { path: "short.txt", offset: 100 });
    const text = getText(result);
    expect(text).toContain("Offset");
    expect(text).toContain("beyond end of file");
  });

  it("truncates large text files with continuation hint", async () => {
    const { ctx, execute } = setup();
    const lines = Array.from({ length: 3000 }, (_, i) => `data line ${i + 1}`);
    await ctx.writeFile("big.txt", lines.join("\n"));
    const result = await execute("tc_9", { path: "big.txt" });
    const text = getText(result);
    expect(text).toContain("Use offset=");
    expect(text).toContain("to continue");
  });

  it("reads an image file and returns image content", async () => {
    const { ctx, execute } = setup();
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
      0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
      0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
      0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63,
      0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21,
      0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);
    await ctx.writeFile("test.png", pngBytes);
    const result = await execute("tc_10", { path: "test.png" });
    expect(hasImage(result)).toBe(true);
    expect(getText(result)).toContain("image");
    expect(getText(result)).toContain("test.png");
  });

  it("reads CSV files as text", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("data.csv", "col1,col2\na,b\nc,d");
    const result = await execute("tc_11", { path: "data.csv" });
    expect(getText(result)).toBe("col1,col2\na,b\nc,d");
  });

  it("reads JSON files as text", async () => {
    const { ctx, execute } = setup();
    await ctx.writeFile("config.json", '{"key":"value"}');
    const result = await execute("tc_12", { path: "config.json" });
    expect(getText(result)).toBe('{"key":"value"}');
  });

  it("returns no hint about files when none uploaded", async () => {
    const { execute } = setup();
    const result = await execute("tc_13", { path: "nope" });
    const text = getText(result);
    expect(text).toContain("No files uploaded yet");
  });
});
