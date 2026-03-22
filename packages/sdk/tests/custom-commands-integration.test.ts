// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getBash,
  readFile,
  resetVfs,
  setCustomCommands,
  writeFile,
} from "../src/vfs";
import { getSharedCustomCommands } from "../src/vfs/custom-commands";

const FIXTURES = join(__dirname, "fixtures");

function loadFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FIXTURES, name)));
}

async function run(cmd: string) {
  const bash = getBash();
  const result = await bash.exec(cmd);
  return {
    ...result,
    out: result.stdout.replace(/\n$/, ""),
  };
}

// Promise.try is required by pdfjs-dist v5 but not available in Node <23
// @ts-ignore
const hasPromiseTry = typeof Promise.try === "function";

describe("shared custom commands (integration)", () => {
  beforeEach(() => {
    setCustomCommands(() => getSharedCustomCommands().commands);
    resetVfs();
  });

  afterEach(() => {
    setCustomCommands(() => []);
    resetVfs();
  });

  describe("docx-to-text", () => {
    it("extracts text from a DOCX file", async () => {
      await writeFile("test.docx", loadFixture("test.docx"));
      const result = await run(
        "docx-to-text /home/user/uploads/test.docx /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Extracted text from DOCX");

      const text = await readFile("out.txt");
      expect(text).toContain("Hello from test document");
      expect(text).toContain("Second paragraph here");
    });

    it("prints usage when args are missing", async () => {
      const result = await run("docx-to-text");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it("fails on non-existent file", async () => {
      const result = await run(
        "docx-to-text /home/user/uploads/nope.docx /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(1);
    });
  });

  describe("xlsx-to-csv", () => {
    it("converts a single sheet by index", async () => {
      await writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/out.csv 0",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Results");

      const csv = await readFile("out.csv");
      expect(csv).toContain("Name,Score");
      expect(csv).toContain("Alice,90");
      expect(csv).toContain("Bob,85");
    });

    it("converts a single sheet by name", async () => {
      await writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/prices.csv Prices",
      );
      expect(result.exitCode).toBe(0);

      const csv = await readFile("prices.csv");
      expect(csv).toContain("Item,Price");
      expect(csv).toContain("Widget");
    });

    it("exports all sheets when no sheet arg given", async () => {
      await writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/all.csv",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Converted 2 sheets");
    });

    it("fails on invalid sheet name", async () => {
      await writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/out.csv NoSuchSheet",
      );
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Sheet not found");
    });

    it("prints usage when args are missing", async () => {
      const result = await run("xlsx-to-csv");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });
  });

  describe("pdf-to-text", () => {
    it.skipIf(!hasPromiseTry)("extracts text from a PDF file", async () => {
      await writeFile("test.pdf", loadFixture("test.pdf"));
      const result = await run(
        "pdf-to-text /home/user/uploads/test.pdf /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Extracted text from");
      expect(result.out).toContain("page");

      const text = await readFile("out.txt");
      expect(text).toContain("Test PDF content");
      expect(text).toContain("Second line");
    });

    it("prints usage when args are missing", async () => {
      const result = await run("pdf-to-text");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it("fails on non-existent file", async () => {
      const result = await run(
        "pdf-to-text /home/user/uploads/nope.pdf /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(1);
    });
  });

  describe("web-search", () => {
    const hasSearchKey =
      !!process.env.SERPER_API_KEY || !!process.env.TAVILY_API_KEY;

    it("prints usage when query is missing", async () => {
      const result = await run("web-search");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it.skipIf(!hasSearchKey)("returns results for a query", async () => {
      const result = await run("web-search typescript --max=3 --json");
      expect(result.exitCode).toBe(0);
      const parsed = JSON.parse(result.out);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0]).toHaveProperty("title");
      expect(parsed[0]).toHaveProperty("href");
    });

    it.skipIf(!hasSearchKey)(
      "returns formatted text output by default",
      async () => {
        const result = await run("web-search javascript MDN --max=2");
        expect(result.exitCode).toBe(0);
        expect(result.out).toContain("1.");
      },
    );
  });

  describe("web-fetch", () => {
    it("prints usage when args are missing", async () => {
      const result = await run("web-fetch");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it("fetches a text page and saves to file", async () => {
      // happy-dom's fetch triggers CORS detection, so configure a proxy
      const { saveConfig } = await import("../src/provider-config");
      saveConfig({
        provider: "openai",
        apiKey: "",
        model: "",
        useProxy: true,
        proxyUrl: "https://proxy.hewliyang.com",
        thinking: "none",
        followMode: false,
        expandToolCalls: false,
      });

      const result = await run(
        "web-fetch https://example.com /home/user/uploads/page.txt",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Fetched text");

      const text = await readFile("page.txt");
      expect(text.toLowerCase()).toContain("example");
    });
  });
});
