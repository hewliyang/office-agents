import { describe, expect, it } from "vitest";
import { buildSkillsPromptSection, parseSkillMeta } from "../src/skills";

describe("parseSkillMeta", () => {
  it("parses valid frontmatter with name and description", () => {
    const content = `---
name: budget-writer
description: Writes budget reports
---

# Budget Writer

Some instructions here.`;
    const meta = parseSkillMeta(content);
    expect(meta).toEqual({
      name: "budget-writer",
      description: "Writes budget reports",
    });
  });

  it("parses frontmatter with optional platform field", () => {
    const content = `---
name: excel-formatter
description: Format Excel sheets
platform: excel
---

Instructions.`;
    const meta = parseSkillMeta(content);
    expect(meta).toEqual({
      name: "excel-formatter",
      description: "Format Excel sheets",
      platform: "excel",
    });
  });

  it("returns null when frontmatter is missing", () => {
    expect(parseSkillMeta("# No frontmatter here")).toBeNull();
  });

  it("returns null when name is missing", () => {
    const content = `---
description: Only description
---`;
    expect(parseSkillMeta(content)).toBeNull();
  });

  it("returns null when description is missing", () => {
    const content = `---
name: only-name
---`;
    expect(parseSkillMeta(content)).toBeNull();
  });

  it("returns null for empty frontmatter", () => {
    const content = `---
---`;
    expect(parseSkillMeta(content)).toBeNull();
  });
});

describe("buildSkillsPromptSection", () => {
  it("returns empty string for no skills", () => {
    expect(buildSkillsPromptSection([])).toBe("");
  });

  it("renders a single skill", () => {
    const result = buildSkillsPromptSection([
      { name: "analyzer", description: "Analyzes data" },
    ]);
    expect(result).toContain("<available_skills>");
    expect(result).toContain("<name>analyzer</name>");
    expect(result).toContain("<description>Analyzes data</description>");
    expect(result).toContain(
      "<location>/home/skills/analyzer/SKILL.md</location>",
    );
    expect(result).toContain("</available_skills>");
  });

  it("renders multiple skills", () => {
    const result = buildSkillsPromptSection([
      { name: "alpha", description: "First" },
      { name: "beta", description: "Second" },
    ]);
    expect(result).toContain("<name>alpha</name>");
    expect(result).toContain("<name>beta</name>");
  });

  it("includes instruction text about reading skill files", () => {
    const result = buildSkillsPromptSection([
      { name: "s", description: "d" },
    ]);
    expect(result).toContain(
      "Use the read tool to load a skill's file when the task matches",
    );
  });
});
