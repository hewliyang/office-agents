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

  it("setSkillFiles preserves user uploads", async () => {
    const ctx = createCtx();

    await ctx.writeFile("/home/user/uploads/note.txt", "hello from repro test");
    expect(await ctx.fileExists("/home/user/uploads/note.txt")).toBe(true);

    const enc = new TextEncoder();
    await ctx.setSkillFiles({
      "/home/skills/test/SKILL.md": enc.encode(
        "---\nname: test\ndescription: test\n---\n# Test",
      ),
    });

    expect(await ctx.fileExists("/home/user/uploads/note.txt")).toBe(true);
    expect(await ctx.readFile("/home/user/uploads/note.txt")).toBe(
      "hello from repro test",
    );
    expect(await ctx.fileExists("/app/guide.txt")).toBe(true);
  });

  it("setStaticFiles preserves user uploads and swaps old for new", async () => {
    const ctx = new AgentContext({
      staticFiles: { "/home/user/docs/old.d.ts": "old content" },
    });

    await ctx.writeFile("/home/user/uploads/data.csv", "a,b,c");
    expect(await ctx.fileExists("/home/user/uploads/data.csv")).toBe(true);

    await ctx.setStaticFiles({
      "/home/user/docs/new.d.ts": "new content",
    });

    expect(await ctx.fileExists("/home/user/uploads/data.csv")).toBe(true);
    expect(await ctx.readFile("/home/user/uploads/data.csv")).toBe("a,b,c");
    expect(await ctx.fileExists("/home/user/docs/new.d.ts")).toBe(true);
    expect(await ctx.fileExists("/home/user/docs/old.d.ts")).toBe(false);
  });

  it("setSkillFiles removes stale skill files and adds new ones without touching uploads", async () => {
    const enc = new TextEncoder();
    const ctx = new AgentContext();

    await ctx.setSkillFiles({
      "/home/skills/alpha/SKILL.md": enc.encode("alpha"),
    });
    await ctx.writeFile("/home/user/uploads/keep.txt", "keep me");

    await ctx.setSkillFiles({
      "/home/skills/beta/SKILL.md": enc.encode("beta"),
    });

    expect(await ctx.fileExists("/home/user/uploads/keep.txt")).toBe(true);
    expect(await ctx.fileExists("/home/skills/beta/SKILL.md")).toBe(true);
    expect(await ctx.fileExists("/home/skills/alpha/SKILL.md")).toBe(false);
  });
});
