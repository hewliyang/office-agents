import { describe, expect, it } from "vitest";
import { truncateHead, truncateTail } from "../src/truncate";

describe("truncateHead", () => {
  it("returns content unchanged when within both limits", () => {
    const content = "line1\nline2\nline3";
    const result = truncateHead(content);
    expect(result.truncated).toBe(false);
    expect(result.content).toBe(content);
    expect(result.totalLines).toBe(3);
    expect(result.outputLines).toBe(3);
    expect(result.truncatedBy).toBeNull();
  });

  it("truncates by line count when exceeding maxLines", () => {
    const lines = Array.from({ length: 10 }, (_, i) => `line${i + 1}`);
    const content = lines.join("\n");
    const result = truncateHead(content, { maxLines: 5 });
    expect(result.truncated).toBe(true);
    expect(result.truncatedBy).toBe("lines");
    expect(result.outputLines).toBe(5);
    expect(result.totalLines).toBe(10);
    expect(result.content).toBe("line1\nline2\nline3\nline4\nline5");
  });

  it("truncates by byte size when exceeding maxBytes", () => {
    const lines = Array.from({ length: 5 }, () => "A".repeat(100));
    const content = lines.join("\n");
    const result = truncateHead(content, { maxBytes: 250 });
    expect(result.truncated).toBe(true);
    expect(result.truncatedBy).toBe("bytes");
    expect(result.outputLines).toBeLessThan(5);
  });

  it("handles empty content", () => {
    const result = truncateHead("");
    expect(result.truncated).toBe(false);
    expect(result.content).toBe("");
    expect(result.totalLines).toBe(1);
    expect(result.outputLines).toBe(1);
  });

  it("prefers byte truncation when a single long line exceeds maxBytes", () => {
    const longLine = "X".repeat(200);
    const content = `${longLine}\nshort`;
    const result = truncateHead(content, { maxBytes: 100, maxLines: 100 });
    expect(result.truncated).toBe(true);
    expect(result.truncatedBy).toBe("bytes");
    expect(result.outputLines).toBe(0);
  });
});

describe("truncateTail", () => {
  it("returns content unchanged when within both limits", () => {
    const content = "line1\nline2\nline3";
    const result = truncateTail(content);
    expect(result.truncated).toBe(false);
    expect(result.content).toBe(content);
    expect(result.totalLines).toBe(3);
    expect(result.outputLines).toBe(3);
    expect(result.truncatedBy).toBeNull();
  });

  it("keeps last N lines when exceeding maxLines", () => {
    const lines = Array.from({ length: 10 }, (_, i) => `line${i + 1}`);
    const content = lines.join("\n");
    const result = truncateTail(content, { maxLines: 3 });
    expect(result.truncated).toBe(true);
    expect(result.truncatedBy).toBe("lines");
    expect(result.outputLines).toBe(3);
    expect(result.content).toBe("line8\nline9\nline10");
  });

  it("keeps tail bytes when exceeding maxBytes", () => {
    const lines = Array.from({ length: 5 }, (_, i) => `${"B".repeat(100)}_${i}`);
    const content = lines.join("\n");
    const result = truncateTail(content, { maxBytes: 250 });
    expect(result.truncated).toBe(true);
    expect(result.truncatedBy).toBe("bytes");
    expect(result.outputLines).toBeLessThan(5);
    // Should contain the last lines, not the first
    expect(result.content).toContain("_4");
  });

  it("handles empty content", () => {
    const result = truncateTail("");
    expect(result.truncated).toBe(false);
    expect(result.content).toBe("");
  });

  it("handles content exactly at the line limit", () => {
    const lines = Array.from({ length: 5 }, (_, i) => `line${i}`);
    const content = lines.join("\n");
    const result = truncateTail(content, { maxLines: 5 });
    expect(result.truncated).toBe(false);
    expect(result.content).toBe(content);
  });
});
