// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AgentContext, type StorageNamespace } from "../src/context";
import { getSharedCustomCommands } from "../src/vfs/custom-commands";

const FIXTURES = join(__dirname, "fixtures");
const TEST_NS: StorageNamespace = {
  dbName: "TestIntegrationDB",
  dbVersion: 1,
  localStoragePrefix: "test-integration",
  documentSettingsPrefix: "test-integration",
};

function loadFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(FIXTURES, name)));
}

function setup() {
  const ctx = new AgentContext({
    customCommands: (ns) => getSharedCustomCommands({ ns }),
  });
  return ctx;
}

async function run(ctx: AgentContext, cmd: string) {
  const result = await ctx.bash.exec(cmd);
  return {
    ...result,
    out: result.stdout.replace(/\n$/, ""),
  };
}

// Promise.try is required by pdfjs-dist v5 but not available in Node <23
// @ts-ignore
const hasPromiseTry = typeof Promise.try === "function";

describe("shared custom commands (integration)", () => {
  describe("docx-to-text", () => {
    it("extracts text from a DOCX file", async () => {
      const ctx = setup();
      await ctx.writeFile("test.docx", loadFixture("test.docx"));
      const result = await run(
        ctx,
        "docx-to-text /home/user/uploads/test.docx /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Extracted text from DOCX");

      const text = await ctx.readFile("out.txt");
      expect(text).toContain("Hello from test document");
      expect(text).toContain("Second paragraph here");
    });

    it("prints usage when args are missing", async () => {
      const ctx = setup();
      const result = await run(ctx, "docx-to-text");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it("fails on non-existent file", async () => {
      const ctx = setup();
      const result = await run(
        ctx,
        "docx-to-text /home/user/uploads/nope.docx /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(1);
    });
  });

  describe("xlsx-to-csv", () => {
    it("converts a single sheet by index", async () => {
      const ctx = setup();
      await ctx.writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        ctx,
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/out.csv 0",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Results");

      const csv = await ctx.readFile("out.csv");
      expect(csv).toContain("Name,Score");
      expect(csv).toContain("Alice,90");
      expect(csv).toContain("Bob,85");
    });

    it("converts a single sheet by name", async () => {
      const ctx = setup();
      await ctx.writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        ctx,
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/prices.csv Prices",
      );
      expect(result.exitCode).toBe(0);

      const csv = await ctx.readFile("prices.csv");
      expect(csv).toContain("Item,Price");
      expect(csv).toContain("Widget");
    });

    it("exports all sheets when no sheet arg given", async () => {
      const ctx = setup();
      await ctx.writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        ctx,
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/all.csv",
      );
      expect(result.exitCode).toBe(0);
      expect(result.out).toContain("Converted 2 sheets");
    });

    it("fails on invalid sheet name", async () => {
      const ctx = setup();
      await ctx.writeFile("test.xlsx", loadFixture("test.xlsx"));
      const result = await run(
        ctx,
        "xlsx-to-csv /home/user/uploads/test.xlsx /home/user/uploads/out.csv NoSuchSheet",
      );
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Sheet not found");
    });

    it("prints usage when args are missing", async () => {
      const ctx = setup();
      const result = await run(ctx, "xlsx-to-csv");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });
  });

  describe("pdf-to-text", () => {
    it.skipIf(!hasPromiseTry)(
      "extracts text from a PDF file",
      async () => {
        const ctx = setup();
        await ctx.writeFile("test.pdf", loadFixture("test.pdf"));
        const result = await run(
          ctx,
          "pdf-to-text /home/user/uploads/test.pdf /home/user/uploads/out.txt",
        );
        expect(result.exitCode).toBe(0);
        expect(result.out).toContain("Extracted text from");
        expect(result.out).toContain("page");

        const text = await ctx.readFile("out.txt");
        expect(text).toContain("Test PDF content");
        expect(text).toContain("Second line");
      },
    );

    it("prints usage when args are missing", async () => {
      const ctx = setup();
      const result = await run(ctx, "pdf-to-text");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it("fails on non-existent file", async () => {
      const ctx = setup();
      const result = await run(
        ctx,
        "pdf-to-text /home/user/uploads/nope.pdf /home/user/uploads/out.txt",
      );
      expect(result.exitCode).toBe(1);
    });
  });

  describe("web-search", () => {
    const hasSearchKey =
      !!process.env.SERPER_API_KEY || !!process.env.TAVILY_API_KEY;

    it("prints usage when query is missing", async () => {
      const ctx = setup();
      const result = await run(ctx, "web-search");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

    it.skipIf(!hasSearchKey)(
      "returns results for a query",
      async () => {
        const ctx = setup();
        const result = await run(
          ctx,
          "web-search typescript --max=3 --json",
        );
        expect(result.exitCode).toBe(0);
        const parsed = JSON.parse(result.out);
        expect(parsed.length).toBeGreaterThan(0);
        expect(parsed[0]).toHaveProperty("title");
        expect(parsed[0]).toHaveProperty("href");
      },
    );

    it.skipIf(!hasSearchKey)(
      "returns formatted text output by default",
      async () => {
        const ctx = setup();
        const result = await run(
          ctx,
          "web-search javascript MDN --max=2",
        );
        expect(result.exitCode).toBe(0);
        expect(result.out).toContain("1.");
      },
    );
  });

  describe("web-fetch", () => {
    it("prints usage when args are missing", async () => {
      const ctx = setup();
      const result = await run(ctx, "web-fetch");
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Usage:");
    });

  });
});
