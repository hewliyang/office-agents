import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  detectImageMimeType,
  deleteFile,
  fileExists,
  listUploads,
  readFile,
  readFileBuffer,
  resetVfs,
  toBase64,
  writeFile,
} from "../src/vfs";

describe("detectImageMimeType", () => {
  it("returns fallback for short data", () => {
    const data = new Uint8Array([0x00, 0x01]);
    expect(detectImageMimeType(data, "image/png")).toBe("image/png");
  });

  it("returns fallback for unrecognized bytes", () => {
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]);
    expect(detectImageMimeType(data, "application/octet-stream")).toBe(
      "application/octet-stream",
    );
  });
});

describe("toBase64", () => {
  it("roundtrips through atob", () => {
    const data = new Uint8Array([0, 1, 2, 255, 128]);
    const b64 = toBase64(data);
    const decoded = atob(b64);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
    expect(bytes).toEqual(data);
  });
});

describe("VFS file operations", () => {
  beforeEach(() => {
    resetVfs();
  });

  afterEach(() => {
    resetVfs();
  });

  it("writeFile + readFile roundtrip", async () => {
    await writeFile("test.txt", "content");
    expect(await readFile("test.txt")).toBe("content");
  });

  it("writeFile + readFileBuffer roundtrip", async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    await writeFile("bin.dat", data);
    const result = await readFileBuffer("bin.dat");
    expect(result).toEqual(data);
  });

  it("fileExists returns true for existing file", async () => {
    await writeFile("exists.txt", "yes");
    expect(await fileExists("exists.txt")).toBe(true);
  });

  it("fileExists returns false for missing file", async () => {
    expect(await fileExists("nope.txt")).toBe(false);
  });

  it("deleteFile removes a file", async () => {
    await writeFile("temp.txt", "temp");
    expect(await fileExists("temp.txt")).toBe(true);
    await deleteFile("temp.txt");
    expect(await fileExists("temp.txt")).toBe(false);
  });

  it("listUploads excludes .keep", async () => {
    const uploads = await listUploads();
    expect(uploads).not.toContain(".keep");
  });

  it("listUploads lists uploaded files", async () => {
    await writeFile("a.txt", "a");
    await writeFile("b.csv", "b");
    const uploads = await listUploads();
    expect(uploads).toContain("a.txt");
    expect(uploads).toContain("b.csv");
  });

  it("handles relative paths as uploads", async () => {
    await writeFile("relative.txt", "rel");
    expect(await fileExists("/home/user/uploads/relative.txt")).toBe(true);
  });

  it("handles absolute paths outside uploads", async () => {
    await writeFile("/tmp/outside.txt", "data");
    expect(await fileExists("/tmp/outside.txt")).toBe(true);
  });

  it("creates nested directories for uploads", async () => {
    await writeFile("subdir/file.txt", "nested");
    expect(await readFile("subdir/file.txt")).toBe("nested");
  });
});
