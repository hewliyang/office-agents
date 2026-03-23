import { describe, expect, it } from "vitest";
import { AgentContext } from "../src/context";

describe("VFS file operations", () => {
  function createCtx() {
    return new AgentContext();
  }

  it("writeFile + readFile roundtrip", async () => {
    const ctx = createCtx();
    await ctx.writeFile("hello.txt", "hello world");
    const text = await ctx.readFile("hello.txt");
    expect(text).toBe("hello world");
  });

  it("writeFile + readFileBuffer roundtrip", async () => {
    const ctx = createCtx();
    const data = new TextEncoder().encode("binary content");
    await ctx.writeFile("data.bin", data);
    const result = await ctx.readFileBuffer("data.bin");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(result)).toBe("binary content");
  });

  it("fileExists returns true for existing file", async () => {
    const ctx = createCtx();
    await ctx.writeFile("exists.txt", "yes");
    expect(await ctx.fileExists("exists.txt")).toBe(true);
  });

  it("fileExists returns false for missing file", async () => {
    const ctx = createCtx();
    expect(await ctx.fileExists("nope.txt")).toBe(false);
  });

  it("deleteFile removes a file", async () => {
    const ctx = createCtx();
    await ctx.writeFile("temp.txt", "delete me");
    expect(await ctx.fileExists("temp.txt")).toBe(true);
    await ctx.deleteFile("temp.txt");
    expect(await ctx.fileExists("temp.txt")).toBe(false);
  });

  it("listUploads excludes .keep", async () => {
    const ctx = createCtx();
    const uploads = await ctx.listUploads();
    expect(uploads).not.toContain(".keep");
  });

  it("listUploads lists uploaded files", async () => {
    const ctx = createCtx();
    await ctx.writeFile("a.csv", "data");
    await ctx.writeFile("b.txt", "text");
    const uploads = await ctx.listUploads();
    expect(uploads).toContain("a.csv");
    expect(uploads).toContain("b.txt");
  });

  it("handles relative paths as uploads", async () => {
    const ctx = createCtx();
    await ctx.writeFile("report.csv", "col1\nval1");
    expect(await ctx.fileExists("report.csv")).toBe(true);
    expect(await ctx.fileExists("/home/user/uploads/report.csv")).toBe(true);
  });

  it("handles absolute paths outside uploads", async () => {
    const ctx = createCtx();
    await ctx.writeFile("/tmp/scratch.txt", "temp");
    expect(await ctx.fileExists("/tmp/scratch.txt")).toBe(true);
    const text = await ctx.readFile("/tmp/scratch.txt");
    expect(text).toBe("temp");
  });

  it("creates nested directories for uploads", async () => {
    const ctx = createCtx();
    await ctx.writeFile("nested/deep/file.txt", "deep");
    expect(await ctx.fileExists("nested/deep/file.txt")).toBe(true);
  });
});
