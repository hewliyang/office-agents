import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetVfs } from "../src/vfs";
import { bashTool } from "../src/tools/bash";
import type { ToolResult } from "../src/tools/types";

const execute = bashTool.execute as (
  toolCallId: string,
  params: { command: string },
) => Promise<ToolResult>;

function getText(result: ToolResult): string {
  const block = result.content[0];
  return block.type === "text" ? block.text : "";
}

describe("bashTool", () => {
  beforeEach(() => {
    resetVfs();
  });

  afterEach(() => {
    resetVfs();
  });

  it("executes a simple echo command", async () => {
    const result = await execute("tc_1", { command: "echo hello" });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("hello");
    expect(parsed.exitCode).toBe(0);
  });

  it("supports piping", async () => {
    const result = await execute("tc_2", {
      command: 'echo "banana\napple\ncherry" | sort',
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("apple\nbanana\ncherry");
  });

  it("captures stderr", async () => {
    const result = await execute("tc_3", {
      command: "echo error >&2",
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toContain("stderr: error");
  });

  it("reports non-zero exit codes", async () => {
    const result = await execute("tc_4", { command: "exit 42" });
    const parsed = JSON.parse(getText(result));
    expect(parsed.exitCode).toBe(42);
    expect(parsed.output).toContain("[exit code: 42]");
  });

  it("reports [no output] for silent commands", async () => {
    const result = await execute("tc_5", { command: "true" });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("[no output]");
    expect(parsed.exitCode).toBe(0);
  });

  it("can read and write files in the VFS", async () => {
    await execute("tc_6", {
      command: 'echo "data" > /home/user/uploads/test.txt',
    });
    const result = await execute("tc_7", {
      command: "cat /home/user/uploads/test.txt",
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("data");
  });

  it("supports command chaining with &&", async () => {
    const result = await execute("tc_8", {
      command: 'echo first && echo second',
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("first\nsecond");
  });

  it("supports variables", async () => {
    const result = await execute("tc_9", {
      command: 'X=world; echo "hello $X"',
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toBe("hello world");
  });

  it("truncates very large output", async () => {
    const result = await execute("tc_10", {
      command: 'for i in $(seq 1 5000); do echo "line $i"; done',
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toContain("[Showing last");
    expect(parsed.output).toContain("Output truncated.]");
  });

  it("supports text processing commands", async () => {
    await execute("w", {
      command:
        'echo "name,score\nalice,90\nbob,85\nalice,95" > /home/user/uploads/data.csv',
    });
    const result = await execute("r", {
      command: "cat /home/user/uploads/data.csv | grep alice",
    });
    const parsed = JSON.parse(getText(result));
    expect(parsed.output).toContain("alice,90");
    expect(parsed.output).toContain("alice,95");
  });
});
