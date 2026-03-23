import { describe, expect, it } from "vitest";
import { AgentContext } from "../src/context";

describe("vfs", () => {
  function createCtx() {
    return new AgentContext({
      staticFiles: {
        "/app/guide.txt": "static guide",
      },
      skillFiles: {
        "/home/skills/research/SKILL.md": new TextEncoder().encode(
          "# research",
        ),
      },
    });
  }

  it("restores persisted files while rebuilding static and skill overlays from caches", async () => {
    const ctx = createCtx();
    await ctx.writeFile("stale.txt", "stale");

    await ctx.restoreVfs([
      {
        path: "/home/user/uploads/report.csv",
        data: new TextEncoder().encode("region,revenue\napac,42"),
      },
    ]);

    expect(await ctx.fileExists("stale.txt")).toBe(false);
    expect(await ctx.readFile("/app/guide.txt")).toBe("static guide");
    expect(await ctx.readFile("/home/skills/research/SKILL.md")).toContain(
      "# research",
    );
    expect(await ctx.readFile("report.csv")).toContain("apac,42");
  });

  it("snapshots uploads but excludes cached skill files", async () => {
    const ctx = createCtx();
    await ctx.writeFile("budget.csv", "quarter,amount\nQ1,100");
    await ctx.writeFile("/tmp/scratch.txt", "temporary");

    const snapshot = await ctx.snapshotVfs();
    const paths = snapshot.map((entry) => entry.path).sort();

    expect(paths).toContain("/home/user/uploads/budget.csv");
    expect(paths).toContain("/tmp/scratch.txt");
    expect(paths.some((path) => path.startsWith("/home/skills/"))).toBe(false);
  });

  it("treats relative writes as uploads and keeps .keep hidden from upload listings", async () => {
    const ctx = createCtx();
    await ctx.writeFile("brief.md", "# launch");
    await ctx.writeFile("nested/data.json", '{"ok":true}');

    const uploads = await ctx.listUploads();

    expect(uploads).toEqual(["brief.md", "nested"]);
    expect(await ctx.readFileBuffer("brief.md")).toBeInstanceOf(Uint8Array);
    expect(await ctx.readFile("nested/data.json")).toContain('"ok":true');
  });
});
