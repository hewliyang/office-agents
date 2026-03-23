import { describe, expect, it } from "vitest";
import { AgentContext } from "../src/context";
import { createBashTool } from "../src/tools/bash";
import type { ToolResult } from "../src/tools/types";

function getText(result: ToolResult): string {
  const block = result.content[0];
  return block.type === "text" ? block.text : "";
}

describe("bashTool", () => {
  function setup() {
    const ctx = new AgentContext();
    const tool = createBashTool(ctx);
    const execute = tool.execute as (
      toolCallId: string,
      params: { command: string },
    ) => Promise<ToolResult>;
    return { ctx, execute };
  }

  it("executes a simple echo command", async () => {
    const { execute } = setup();
    const result = await execute("tc_1", { command: "echo hello" });
    expect(getText(result)).toContain("hello");
  });

  it("supports piping", async () => {
    const { execute } = setup();
    const result = await execute("tc_2", {
      command: 'echo "banana\napple\ncherry" | sort',
    });
    expect(getText(result)).toContain("apple");
    expect(getText(result)).toContain("banana");
    expect(getText(result)).toContain("cherry");
  });

  it("captures stderr", async () => {
    const { execute } = setup();
    const result = await execute("tc_3", {
      command: "echo error >&2",
    });
    expect(getText(result)).toContain("stderr: error");
  });

  it("reports non-zero exit codes", async () => {
    const { execute } = setup();
    const result = await execute("tc_4", { command: "exit 42" });
    expect(getText(result)).toContain("[exit code: 42]");
  });

  it("reports [no output] for silent commands", async () => {
    const { execute } = setup();
    const result = await execute("tc_5", { command: "true" });
    expect(getText(result)).toContain("[no output]");
  });

  it("can read and write files in the VFS", async () => {
    const { execute } = setup();
    await execute("tc_6", {
      command: 'echo "data" > /home/user/uploads/test.txt',
    });
    const result = await execute("tc_7", {
      command: "cat /home/user/uploads/test.txt",
    });
    expect(getText(result)).toContain("data");
  });

  it("supports command chaining with &&", async () => {
    const { execute } = setup();
    const result = await execute("tc_8", {
      command: "echo first && echo second",
    });
    expect(getText(result)).toContain("first");
    expect(getText(result)).toContain("second");
  });

  it("supports variables", async () => {
    const { execute } = setup();
    const result = await execute("tc_9", {
      command: 'X=world; echo "hello $X"',
    });
    expect(getText(result)).toContain("hello world");
  });

  it("truncates very large output", async () => {
    const { execute } = setup();
    const result = await execute("tc_10", {
      command: 'for i in $(seq 1 5000); do echo "line $i"; done',
    });
    expect(getText(result)).toContain("Output truncated.]");
  });

  it("supports text processing commands", async () => {
    const { execute } = setup();
    await execute("w", {
      command:
        'echo "name,score\nalice,90\nbob,85\nalice,95" > /home/user/uploads/data.csv',
    });
    const result = await execute("r", {
      command: "cat /home/user/uploads/data.csv | grep alice",
    });
    expect(getText(result)).toContain("alice,90");
    expect(getText(result)).toContain("alice,95");
  });
});
