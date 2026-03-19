import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  fileExists,
  listUploads,
  readFile,
  readFileBuffer,
  resetVfs,
  restoreVfs,
  setSkillFiles,
  setStaticFiles,
  snapshotVfs,
  writeFile,
} from "../src/vfs";

describe("vfs", () => {
  beforeEach(() => {
    resetVfs();
    setStaticFiles({
      "/app/guide.txt": "static guide",
    });
    setSkillFiles({
      "/home/skills/research/SKILL.md": new TextEncoder().encode(
        "# research",
      ),
    });
  });

  afterEach(() => {
    resetVfs();
    setStaticFiles({});
    setSkillFiles({});
  });

  it("restores persisted files while rebuilding static and skill overlays from caches", async () => {
    await writeFile("stale.txt", "stale");

    await restoreVfs([
      {
        path: "/home/user/uploads/report.csv",
        data: new TextEncoder().encode("region,revenue\napac,42"),
      },
    ]);

    expect(await fileExists("stale.txt")).toBe(false);
    expect(await readFile("/app/guide.txt")).toBe("static guide");
    expect(await readFile("/home/skills/research/SKILL.md")).toContain(
      "# research",
    );
    expect(await readFile("report.csv")).toContain("apac,42");
  });

  it("snapshots uploads but excludes cached skill files", async () => {
    await writeFile("budget.csv", "quarter,amount\nQ1,100");
    await writeFile("/tmp/scratch.txt", "temporary");

    const snapshot = await snapshotVfs();
    const paths = snapshot.map((entry) => entry.path).sort();

    expect(paths).toContain("/home/user/uploads/budget.csv");
    expect(paths).toContain("/tmp/scratch.txt");
    expect(paths.some((path) => path.startsWith("/home/skills/"))).toBe(false);
  });

  it("treats relative writes as uploads and keeps .keep hidden from upload listings", async () => {
    await writeFile("brief.md", "# launch");
    await writeFile("nested/data.json", '{"ok":true}');

    const uploads = await listUploads();

    expect(uploads).toEqual(["brief.md", "nested"]);
    expect(await readFileBuffer("brief.md")).toBeInstanceOf(Uint8Array);
    expect(await readFile("nested/data.json")).toContain('"ok":true');
  });
});
